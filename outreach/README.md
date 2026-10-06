# Eastern Province outreach

Tools that build a lead list of companies in Dammam, Al Khobar, Jubail and the rest of the Eastern Province, then email them a short three-step sequence from your own mailbox.

The lead data and the send log contain contact details, so they live in `leads/` and `outreach/state/`. Both are git-ignored and are never pushed to this public repository.

## Files

| File | What it does |
| --- | --- |
| `scrape_ogn_directory.py` | Pulls Eastern Province companies (with email, phone and website) from the ognnews.com oil & gas supplier directory |
| `crawl_contacts.py` | Visits company websites and collects the emails listed on their contact, procurement and supplier pages |
| `build_leads.py` | Merges both sources, labels sector and priority, checks each email domain has a mail server, and writes `leads/Eastern_Province_Leads.xlsx` |
| `templates.py` | The email copy: one opening line per sector, plus the three steps |
| `send_campaign.py` | Sends the sequence through Outlook, Microsoft Graph or SMTP, logs every send, stops on reply / bounce / "remove" |
| `make_kit.py` + `kit/` | Builds `leads/Lonestar_Outreach_Kit.zip`: a double-click Windows folder with the scripts, the lead workbook and numbered .bat launchers |
| `run_daily.bat` | Windows: sync replies, send today's batch, show totals — for double-click or Task Scheduler |

## One-time setup (Windows PC with Outlook — easiest)

This sends from your own mailbox through the Outlook app you already use. You don't need a password in any file and you don't need IT admin. Emails appear in your Sent Items like normal, and replies land in your Inbox.

1. **Check your Outlook is "classic".** Open Outlook. If you see a **File** menu at the top left, it's classic Outlook and this will work. If you're using the "new Outlook" (toggle at the top right), switch the toggle off. The new app has no automation support.
2. **Install Python** from [python.org/downloads](https://www.python.org/downloads/). In the installer, tick **"Add python.exe to PATH"**.
3. **Get the files onto your PC:** download this repository (the green **Code → Download ZIP** button on GitHub, branch `claude/busy-johnson-5i0y0n`) and unzip it. Then put the lead workbook `Eastern_Province_Leads.xlsx` into a folder named `leads` inside it.
4. **Install the libraries:** open Command Prompt in that folder and run
   `pip install pywin32 openpyxl requests beautifulsoup4`
5. **Settings:** copy `outreach\.env.example` to `outreach\.env` and open it in Notepad. Check your name, title, phone and email, and leave `TRANSPORT=outlook` as it is.
6. **Preview:** run `python outreach\send_campaign.py`. Read a few files in `outreach\state\preview\`. Nothing is sent at this step.
7. **Send a test to yourself first:** make a copy of the workbook, put your own email in two rows of the Email-ready sheet, then run
   `python outreach\send_campaign.py --leads leads\test.xlsx --send --ignore-hours --limit 2`
8. **Go live:** double-click `outreach\run_daily.bat`. It checks for replies and bounces, sends today's batch, and shows the totals.

**To run it every working day automatically**, open Task Scheduler and choose **Create Basic Task**. Set it to daily at 09:00, with Program = the full path to `outreach\run_daily.bat`, argument `auto` (this skips the "press any key" pause), and Start in = the repository folder. The PC must be on and logged in, and Outlook must be able to open. The script skips Fridays, Saturdays and runs outside 08:00–16:00 Saudi time by itself.

## Other ways to connect (if you can't use Outlook on Windows)

- **Microsoft Graph:** runs on any computer, even when Outlook is closed. Your Microsoft 365 admin (probably group IT in Dubai) has to set it up once:
  - Go to [entra.microsoft.com](https://entra.microsoft.com), then **App registrations → New registration**.
  - Under **API permissions → Microsoft Graph → Application permissions**, add `Mail.Send` and `Mail.Read`, then **Grant admin consent**.
  - Under **Certificates & secrets**, create a client secret. Put the tenant ID, client ID and secret into `.env`, and delete the `TRANSPORT=outlook` line.
  - Optional: they can restrict the app to your mailbox with `New-ApplicationAccessPolicy`.
- **SMTP with your password:** fill in the `SMTP_` lines. Microsoft 365 needs an admin to enable "Authenticated SMTP" for your mailbox, and Microsoft turns password SMTP off by default from the end of December 2026. Treat it as short-term only. It also can't detect replies automatically.

The domain already has SPF, DKIM (selector1) and DMARC (`p=quarantine`) set up for Microsoft 365. All three methods send through Microsoft 365, so they pass.

## Daily use

```bat
python outreach\send_campaign.py --status         &rem how many contacted, at which step
python outreach\send_campaign.py                  &rem DRY RUN: writes today's emails to outreach\state\preview\
python outreach\send_campaign.py --send           &rem sends today's batch (Sun-Thu, 08:00-16:00 Saudi time)
python outreach\send_campaign.py --sync-replies   &rem anyone who replied or bounced gets no more emails
```

Useful filters: `--sector "Oil & gas"`, `--city Jubail`, `--max-priority 1` (top sectors only), `--limit 20`.

How the sequence works:
- Each company gets one email at a time, to its best address (procurement first, then department, then info@). A second address is tried only if the first one bounced.
- Step 2 goes out 4 days after step 1, and step 3 goes out 7 days after step 2. Then it stops.
- Due follow-ups go out before new introductions, up to `DAILY_LIMIT` per run.
- To stop emailing someone, add the address (or `@theirdomain.com`) to `outreach\state\suppression.txt`, or set their **status** in the workbook to `skip`. Do this the same day for anyone who replies "remove".

On Mac or Linux (Graph or SMTP only), a cron line for 09:05 Saudi time:

```
CRON_TZ=Asia/Riyadh
5 9 * * 0-4 cd /path/to/hi && python3 outreach/send_campaign.py --sync-replies && python3 outreach/send_campaign.py --send >> outreach/state/cron.log 2>&1
```

## Keep it out of spam

- Start at 20–30 emails a day for the first two weeks, then raise `DAILY_LIMIT` slowly. Never go above about 100 a day from one mailbox.
- Watch the bounce rate with `--sync-replies`. The directory data is several years old in places. If more than about 5% bounce, slow down and clean the list.
- Reply to every answer by hand, quickly. A reply is the whole point of the campaign.

## Rules to respect

These are cold B2B emails to company addresses. Keep each one honest: say who you are, give your real address and phone, never fake "Re:" threads to strangers (the "Re:" subject on steps 2–3 only goes to people who received step 1), and honour every opt-out at once. Saudi Arabia's PDPL covers personal data such as named contacts, so keep the list private, use it only for this outreach, and delete anyone who asks.

## Refreshing the lead list

```bash
python3 outreach/scrape_ogn_directory.py leads/sources/ogn_eastern_province.csv
python3 outreach/crawl_contacts.py leads/sources/website_candidates.csv leads/sources/website_crawl.csv
python3 outreach/build_leads.py
```

To add companies you find yourself, put them in `leads/sources/manual_research.csv` with the columns `company, sector, city, email, phone, website, contact_name, contact_title, source_url`, then run `build_leads.py`. Statuses you typed into the workbook are kept.
