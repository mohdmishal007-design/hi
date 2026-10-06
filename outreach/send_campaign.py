#!/usr/bin/env python3
"""Send the Eastern Province outreach sequence from your own mailbox.

Dry run by default: it writes the emails it would send to outreach/state/preview/
and sends nothing. Add --send to actually send.

    python3 outreach/send_campaign.py                     # preview today's batch
    python3 outreach/send_campaign.py --send              # send today's batch
    python3 outreach/send_campaign.py --send --sector "Oil & gas services" --limit 20
    python3 outreach/send_campaign.py --sync-replies      # Graph only: stop emailing people who replied or bounced
    python3 outreach/send_campaign.py --status            # counts by step

Each run sends at most --limit emails (default from DAILY_LIMIT), oldest steps
first: follow-ups that are due go out before new introductions. A contact gets
step 2 four days after step 1 and step 3 seven days after step 2, and nothing
after a reply, a bounce, or a "remove".

Settings come from outreach/.env (see outreach/.env.example). Three ways to send:
  outlook  the classic Outlook app on a Windows PC (TRANSPORT=outlook; no passwords or admin)
  graph    Microsoft 365 via Microsoft Graph (needs an app registration by an M365 admin)
  smtp     any SMTP server (Zoho, Google Workspace, cPanel, an SMTP relay...)
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import random
import re
import smtplib
import ssl
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from email.utils import make_msgid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from templates import DEFAULT_HOOK, OPT_OUT, SECTOR_HOOKS, SIGNATURE, STEPS  # noqa: E402

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
STATE = HERE / "state"
LOG = STATE / "sent_log.csv"
SUPPRESS = STATE / "suppression.txt"
PREVIEW = STATE / "preview"
AST = timezone(timedelta(hours=3))  # Arabia Standard Time

STEP_GAP_DAYS = {2: 4, 3: 7}
TYPE_RANK = {"procurement": 0, "person/department": 1, "general": 2, "freemail": 3}
LOG_FIELDS = ["sent_at", "email", "company", "step", "subject", "message_id", "transport", "result"]


def rel(p: Path) -> str:
    try:
        return str(p.relative_to(ROOT))
    except ValueError:
        return str(p)


# ---------------------------------------------------------------- config

def load_env() -> dict:
    env = {}
    path = HERE / ".env"
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    env.update({k: v for k, v in os.environ.items() if k.startswith(("SMTP_", "GRAPH_", "SENDER_", "DAILY_", "LEADS_", "TRANSPORT"))})
    return env


def sender_fields(env: dict) -> dict:
    return {
        "sender_name": env.get("SENDER_NAME", "Rayyan"),
        "sender_title": env.get("SENDER_TITLE", "Business Development"),
        "sender_company": env.get("SENDER_COMPANY", "Lonestar Shipping Co. Ltd, Dammam"),
        "sender_address": env.get("SENDER_ADDRESS", "Al Waha Downtown Mall, Prince Mohammed Bin Fahad Road, Dammam, Saudi Arabia"),
        "sender_phone": env.get("SENDER_PHONE", "+966 53 502 2995"),
        "sender_email": env.get("SENDER_EMAIL", "rayyan@lonestarshipping.com"),
        "sender_website": env.get("SENDER_WEBSITE", "www.lonestarshipping.com"),
    }


# ---------------------------------------------------------------- state

def read_log() -> list[dict]:
    if not LOG.exists():
        return []
    return list(csv.DictReader(open(LOG, newline="", encoding="utf-8")))


def append_log(row: dict) -> None:
    STATE.mkdir(parents=True, exist_ok=True)
    new = not LOG.exists()
    with open(LOG, "a", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=LOG_FIELDS)
        if new:
            w.writeheader()
        w.writerow(row)


def read_suppression() -> set[str]:
    if not SUPPRESS.exists():
        return set()
    out = set()
    for line in SUPPRESS.read_text(encoding="utf-8").splitlines():
        line = line.split("#")[0].strip().lower()
        if line:
            out.add(line)
    return out


def suppress(emails: set[str], reason: str) -> int:
    have = read_suppression()
    new = sorted(e for e in emails if e not in have)
    if new:
        STATE.mkdir(parents=True, exist_ok=True)
        with open(SUPPRESS, "a", encoding="utf-8") as f:
            for e in new:
                f.write(f"{e}  # {reason} {datetime.now(AST):%Y-%m-%d}\n")
    return len(new)


def read_bounced() -> set[str]:
    if not SUPPRESS.exists():
        return set()
    return {line.split("#")[0].strip().lower() for line in SUPPRESS.read_text(encoding="utf-8").splitlines()
            if "# bounced" in line}


def is_suppressed(email: str, suppressed: set[str]) -> bool:
    # a line can be a full address or a whole domain written as @domain.com
    return email in suppressed or "@" + email.split("@")[1] in suppressed


# ---------------------------------------------------------------- picking who to email

def read_rows(path: Path) -> list[dict]:
    if path.suffix.lower() == ".xlsx":
        from openpyxl import load_workbook

        ws = load_workbook(path, read_only=True)["Email-ready"]
        it = ws.iter_rows(values_only=True)
        head = [str(h) for h in next(it)]
        return [{k: ("" if v is None else str(v)) for k, v in zip(head, row)} for row in it if any(row)]
    return list(csv.DictReader(open(path, newline="", encoding="utf-8-sig")))


def load_leads(path: Path, args) -> list[dict]:
    rows = read_rows(path)
    types = set(args.types.split(","))
    out = []
    for r in rows:
        if (r.get("status") or "new").strip().lower() not in ("new", "active"):
            continue
        if args.mx_only and r.get("mx_ok") != "yes":
            continue
        if r.get("email_type") not in types:
            continue
        if "Freight / logistics" in r.get("sector", "") and not args.include_logistics:
            continue
        if args.sector and args.sector.lower() not in r.get("sector", "").lower():
            continue
        if args.city and args.city.lower() not in r.get("city", "").lower():
            continue
        if int(r.get("priority") or 2) > args.max_priority:
            continue
        out.append(r)
    return out


def plan_batch(leads: list[dict], log: list[dict], suppressed: set[str], limit: int, one_per_company: bool) -> list[tuple[dict, int]]:
    now = datetime.now(AST)
    last: dict[str, tuple[int, datetime]] = {}
    for row in log:
        if row["result"] != "sent":
            continue
        step, at = int(row["step"]), datetime.fromisoformat(row["sent_at"])
        if row["email"] not in last or step > last[row["email"]][0]:
            last[row["email"]] = (step, at)
    bounced = read_bounced()
    contacted_companies = {row["company"].lower() for row in log if row["result"] == "sent" and row["email"] not in bounced}

    followups, intros = [], []
    for r in leads:
        e = r["email"].lower()
        if is_suppressed(e, suppressed):
            continue
        if e in last:
            step, at = last[e]
            nxt = step + 1
            if nxt in STEPS and now - at >= timedelta(days=STEP_GAP_DAYS[nxt]):
                followups.append((r, nxt))
        else:
            intros.append((r, 1))
    intros.sort(key=lambda x: (int(x[0].get("priority") or 2), TYPE_RANK.get(x[0].get("email_type", ""), 9)))

    # One address per company: the best-ranked one gets the sequence, and the
    # next address is tried only if that one bounced.
    picked, seen = [], set()
    for r, step in followups + intros:
        c = r["company"].lower()
        if step == 1 and one_per_company and (c in seen or c in contacted_companies):
            continue
        seen.add(c)
        picked.append((r, step))
        if len(picked) >= limit:
            break
    return picked


# ---------------------------------------------------------------- composing

def greeting(r: dict) -> str:
    name = (r.get("contact_name") or "").strip()
    if name:
        return f"Dear {name.split()[0]},"
    return f"Dear {r['company'].strip()} team,"


def compose(r: dict, step: int, env: dict) -> tuple[str, str]:
    s = sender_fields(env)
    company = re.sub(r"\s+", " ", r["company"]).strip()
    fields = {
        **s,
        "company": company,
        "city": r.get("city") or "the Eastern Province",
        "greeting": greeting(r),
        "hook": SECTOR_HOOKS.get(r.get("sector", ""), DEFAULT_HOOK),
        "opt_out": OPT_OUT,
    }
    fields["signature"] = SIGNATURE.format(**fields)
    t = STEPS[step]
    return t["subject"].format(**fields), t["body"].format(**fields)


# ---------------------------------------------------------------- transports

class SmtpTransport:
    name = "smtp"

    def __init__(self, env: dict):
        self.env = env
        self.conn = None

    def _connect(self):
        host, port = self.env["SMTP_HOST"], int(self.env.get("SMTP_PORT", "587"))
        ctx = ssl.create_default_context()
        if port == 465:
            self.conn = smtplib.SMTP_SSL(host, port, context=ctx, timeout=60)
        else:
            self.conn = smtplib.SMTP(host, port, timeout=60)
            self.conn.starttls(context=ctx)
        self.conn.login(self.env["SMTP_USER"], self.env["SMTP_PASSWORD"])

    def send(self, to: str, subject: str, body: str, env: dict) -> str:
        if self.conn is None:
            self._connect()
        msg = EmailMessage()
        s = sender_fields(env)
        msg["From"] = f'{s["sender_name"]} <{s["sender_email"]}>'
        msg["To"] = to
        msg["Subject"] = subject
        msg["Reply-To"] = env.get("SENDER_REPLY_TO", s["sender_email"])
        msg["List-Unsubscribe"] = f'<mailto:{s["sender_email"]}?subject=remove>'
        mid = make_msgid(domain=s["sender_email"].split("@")[1])
        msg["Message-ID"] = mid
        msg.set_content(body)
        self.conn.send_message(msg)
        return mid

    def close(self):
        if self.conn:
            self.conn.quit()


class GraphTransport:
    """Microsoft 365 through Graph with an app registration (client credentials).

    Needs GRAPH_TENANT_ID, GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET, and the app
    granted Mail.Send (and Mail.Read for --sync-replies) with admin consent.
    """
    name = "graph"

    def __init__(self, env: dict):
        self.env = env
        self.token = None
        self.mailbox = env.get("SENDER_EMAIL", "")

    def _token(self) -> str:
        if self.token:
            return self.token
        data = urllib.parse.urlencode({
            "client_id": self.env["GRAPH_CLIENT_ID"],
            "client_secret": self.env["GRAPH_CLIENT_SECRET"],
            "scope": "https://graph.microsoft.com/.default",
            "grant_type": "client_credentials",
        }).encode()
        url = f'https://login.microsoftonline.com/{self.env["GRAPH_TENANT_ID"]}/oauth2/v2.0/token'
        with urllib.request.urlopen(urllib.request.Request(url, data=data), timeout=30) as r:
            self.token = json.load(r)["access_token"]
        return self.token

    def _call(self, method: str, path: str, payload: dict | None = None) -> dict:
        req = urllib.request.Request(
            "https://graph.microsoft.com/v1.0" + path,
            data=json.dumps(payload).encode() if payload is not None else None,
            method=method,
            headers={"Authorization": f"Bearer {self._token()}", "Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=60) as r:
            raw = r.read()
        return json.loads(raw) if raw else {}

    def send(self, to: str, subject: str, body: str, env: dict) -> str:
        reply_to = env.get("SENDER_REPLY_TO", "")
        msg = {
            "subject": subject,
            "body": {"contentType": "Text", "content": body},
            "toRecipients": [{"emailAddress": {"address": to}}],
        }
        if reply_to:
            msg["replyTo"] = [{"emailAddress": {"address": reply_to}}]
        self._call("POST", f"/users/{urllib.parse.quote(self.mailbox)}/sendMail", {"message": msg, "saveToSentItems": True})
        return ""

    def inbox_since(self, since: datetime) -> list[dict]:
        q = urllib.parse.urlencode({
            "$filter": f"receivedDateTime ge {since.astimezone(timezone.utc):%Y-%m-%dT%H:%M:%SZ}",
            "$select": "from,subject,body,receivedDateTime",
            "$top": "100",
        })
        path = f"/users/{urllib.parse.quote(self.mailbox)}/mailFolders/inbox/messages?{q}"
        out = []
        while path:
            page = self._call("GET", path)
            out += page.get("value", [])
            nxt = page.get("@odata.nextLink")
            path = nxt.replace("https://graph.microsoft.com/v1.0", "") if nxt else None
        return out

    def close(self):
        pass


class OutlookTransport:
    """Sends through the classic Outlook desktop app on a Windows PC.

    No passwords, no admin: it uses whatever account Outlook is already
    signed in to. Needs `pip install pywin32`. The "new Outlook" app has no
    automation interface, so this needs classic Outlook (File menu visible).
    """
    name = "outlook"

    def __init__(self, env: dict):
        try:
            import win32com.client  # type: ignore
        except ImportError:
            sys.exit("TRANSPORT=outlook needs Windows, classic Outlook and `pip install pywin32`.")
        self.app = win32com.client.Dispatch("Outlook.Application")
        self.account = None
        want = env.get("SENDER_EMAIL", "").lower()
        for acct in self.app.Session.Accounts:
            if str(acct.SmtpAddress).lower() == want:
                self.account = acct
        if want and self.account is None:
            names = ", ".join(str(a.SmtpAddress) for a in self.app.Session.Accounts)
            sys.exit(f"Outlook has no account {want}. Accounts found: {names}. Fix SENDER_EMAIL in outreach/.env.")

    def send(self, to: str, subject: str, body: str, env: dict) -> str:
        mail = self.app.CreateItem(0)  # 0 = mail item
        mail.To = to
        mail.Subject = subject
        mail.Body = body
        if env.get("SENDER_REPLY_TO"):
            mail.ReplyRecipients.Add(env["SENDER_REPLY_TO"])
        if self.account is not None:
            mail._oleobj_.Invoke(64209, 0, 8, 0, self.account)  # SendUsingAccount
        mail.Send()
        return ""

    def inbox_since(self, since: datetime) -> list[dict]:
        """Inbox messages in the same shape Graph returns, for --sync-replies."""
        if self.account is not None:
            inbox = self.account.DeliveryStore.GetDefaultFolder(6)
        else:
            inbox = self.app.Session.GetDefaultFolder(6)  # 6 = Inbox
        items = inbox.Items
        items.Sort("[ReceivedTime]", True)
        cutoff = since.replace(tzinfo=None)
        out = []
        for item in items:
            try:
                received = item.ReceivedTime.replace(tzinfo=None)
            except Exception:
                continue
            if received < cutoff:
                break
            sender = getattr(item, "SenderEmailAddress", "") or ""
            out.append({
                "from": {"emailAddress": {"address": str(sender)}},
                "subject": str(getattr(item, "Subject", "") or ""),
                "body": {"content": str(getattr(item, "Body", "") or "")},
            })
        return out

    def close(self):
        pass


def make_transport(env: dict):
    if env.get("TRANSPORT", "").lower() == "outlook":
        return OutlookTransport(env)
    if env.get("GRAPH_CLIENT_ID"):
        return GraphTransport(env)
    if env.get("SMTP_HOST"):
        return SmtpTransport(env)
    sys.exit("No mail settings found. Copy outreach/.env.example to outreach/.env and fill it in.")


# ---------------------------------------------------------------- commands

def in_send_window(env: dict) -> bool:
    now = datetime.now(AST)
    days = env.get("SEND_DAYS", "6,0,1,2,3")  # Python weekday(): Sun=6, Mon=0 ... Thu=3
    start, end = (int(x) for x in env.get("SEND_HOURS", "8-16").split("-"))
    return str(now.weekday()) in days.split(",") and start <= now.hour < end


def cmd_status(leads: list[dict]) -> None:
    log = read_log()
    sent = [r for r in log if r["result"] == "sent"]
    by_step = {s: len({r["email"] for r in sent if int(r["step"]) == s}) for s in STEPS}
    print(f"leads matching filters: {len(leads)}")
    print(f"contacted: {len({r['email'] for r in sent})}  (step1 {by_step[1]}, step2 {by_step[2]}, step3 {by_step[3]})")
    print(f"suppressed: {len(read_suppression())}")
    failed = [r for r in log if r["result"] != "sent"]
    if failed:
        print(f"failed sends: {len(failed)} (see {rel(LOG)})")


def cmd_sync_replies(env: dict) -> None:
    t = make_transport(env)
    if not hasattr(t, "inbox_since"):
        sys.exit("--sync-replies needs the Outlook or Graph connection. With SMTP, add repliers and bounces to "
                 f"{rel(SUPPRESS)} by hand.")
    contacted = {r["email"] for r in read_log() if r["result"] == "sent"}
    since = datetime.now(AST) - timedelta(days=int(env.get("SYNC_DAYS", "30")))
    replied, bounced = set(), set()
    for m in t.inbox_since(since):
        sender = (m.get("from") or {}).get("emailAddress", {}).get("address", "").lower()
        subject = (m.get("subject") or "").lower()
        text = ((m.get("body") or {}).get("content") or "").lower()
        if sender in contacted:
            replied.add(sender)
        if "undeliverable" in subject or "delivery status" in subject or sender.startswith(("postmaster@", "mailer-daemon@")):
            bounced |= {e for e in contacted if e in text}
    n1 = suppress(replied, "replied")
    n2 = suppress(bounced, "bounced")
    print(f"{n1} new replies and {n2} new bounces added to {rel(SUPPRESS)}")
    if replied:
        print("Replied (follow these up by hand):\n  " + "\n  ".join(sorted(replied)))


def cmd_run(leads: list[dict], env: dict, args) -> None:
    batch = plan_batch(leads, read_log(), read_suppression(), args.limit, not args.all_addresses)
    if not batch:
        print("Nothing due today.")
        return
    if not args.send:
        PREVIEW.mkdir(parents=True, exist_ok=True)
        for f in PREVIEW.glob("*.txt"):
            f.unlink()
        for i, (r, step) in enumerate(batch, 1):
            subject, body = compose(r, step, env)
            (PREVIEW / f"{i:03d}_step{step}_{r['email']}.txt").write_text(
                f"To: {r['email']}\nSubject: {subject}\n\n{body}\n", encoding="utf-8")
        steps = {s: sum(1 for _, x in batch if x == s) for s in STEPS}
        print(f"DRY RUN: {len(batch)} emails (step1 {steps[1]}, step2 {steps[2]}, step3 {steps[3]}) "
              f"written to {rel(PREVIEW)}/. Nothing was sent. Add --send to send them.")
        return
    if not args.ignore_hours and not in_send_window(env):
        print("Outside the send window (Sun–Thu, 08:00–16:00 Saudi time). Use --ignore-hours to override.")
        return
    t = make_transport(env)
    lo, hi = (int(x) for x in env.get("DELAY_SECONDS", "60-150").split("-"))
    ok = 0
    try:
        for i, (r, step) in enumerate(batch, 1):
            subject, body = compose(r, step, env)
            row = {"sent_at": datetime.now(AST).isoformat(timespec="seconds"), "email": r["email"].lower(),
                   "company": r["company"], "step": step, "subject": subject, "transport": t.name}
            try:
                row["message_id"] = t.send(r["email"], subject, body, env)
                row["result"] = "sent"
                ok += 1
                print(f"[{i}/{len(batch)}] step {step} -> {r['email']} ({r['company']})")
            except Exception as exc:  # keep going; the failure is logged
                row["message_id"], row["result"] = "", f"error: {exc}"[:300]
                print(f"[{i}/{len(batch)}] FAILED {r['email']}: {exc}")
                if isinstance(exc, (smtplib.SMTPAuthenticationError,)) or "401" in str(exc) or "403" in str(exc):
                    append_log(row)
                    sys.exit("Authentication failed; stopping. Check the credentials in outreach/.env.")
            append_log(row)
            if i < len(batch):
                time.sleep(random.uniform(lo, hi))
    finally:
        t.close()
    print(f"Sent {ok} of {len(batch)}.")


def main() -> None:
    env = load_env()
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--leads", default=env.get("LEADS_FILE", str(ROOT / "leads" / "Eastern_Province_Leads.xlsx")),
                   help="the workbook (Email-ready sheet is used) or a CSV from build_leads.py")
    p.add_argument("--send", action="store_true", help="actually send (default is a dry run)")
    p.add_argument("--limit", type=int, default=int(env.get("DAILY_LIMIT", "40")), help="max emails this run")
    p.add_argument("--sector", help='only this sector (substring), e.g. "Oil & gas"')
    p.add_argument("--city", help="only this city (substring), e.g. Jubail")
    p.add_argument("--max-priority", type=int, default=2, help="1 = top sectors only, 2 = default, 3 = everything")
    p.add_argument("--types", default="procurement,person/department,general",
                   help="email types to include; add ,freemail to include yahoo/hotmail/gmail addresses")
    p.add_argument("--include-logistics", action="store_true", help="also email freight/logistics companies")
    p.add_argument("--no-mx-check", dest="mx_only", action="store_false", help="include domains with no MX record")
    p.add_argument("--all-addresses", action="store_true", help="email every address at a company, not just the best one")
    p.add_argument("--ignore-hours", action="store_true", help="send outside Sun–Thu 08:00–16:00 AST")
    p.add_argument("--status", action="store_true")
    p.add_argument("--sync-replies", action="store_true")
    args = p.parse_args()

    if args.sync_replies:
        cmd_sync_replies(env)
        return
    leads = load_leads(Path(args.leads), args)
    if args.status:
        cmd_status(leads)
        return
    cmd_run(leads, env, args)


if __name__ == "__main__":
    main()
