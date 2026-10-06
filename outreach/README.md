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
| `send_campaign.py` | Sends the sequence, logs every send, stops on reply / bounce / "remove" |

## One-time setup

1. Install the two libraries: `pip install requests beautifulsoup4 openpyxl`
2. Copy `outreach/.env.example` to `outreach/.env` and fill it in.
3. Connect the mailbox. lonestarshipping.com runs on Microsoft 365, so use **Microsoft Graph**. Microsoft has been switching off password-based SMTP for Exchange Online, so a Graph app is the route that keeps working.
   - Go to [entra.microsoft.com](https://entra.microsoft.com), then **App registrations → New registration**. Name it something like "Lonestar outreach".
   - Open **API permissions → Add → Microsoft Graph → Application permissions**, add `Mail.Send` and `Mail.Read`, then click **Grant admin consent**.
   - Open **Certificates & secrets → New client secret**. Put the tenant ID, client ID and secret value into `.env`.
   - Optional but recommended: an Exchange admin can limit the app to the one mailbox with `New-ApplicationAccessPolicy`.

   If you use another provider (Zoho, Google Workspace, cPanel), fill in the `SMTP_` lines instead and leave the `GRAPH_` lines empty.

The domain already has SPF, DKIM (selector1) and DMARC (`p=quarantine`) set up for Microsoft 365. Mail sent through Graph passes all three.

## Daily use

```bash
python3 outreach/send_campaign.py --status         # how many contacted, at which step
python3 outreach/send_campaign.py                  # DRY RUN: writes today's emails to outreach/state/preview/
python3 outreach/send_campaign.py --send           # sends today's batch (Sun–Thu, 08:00–16:00 Saudi time)
python3 outreach/send_campaign.py --sync-replies   # Graph: anyone who replied or bounced gets no more emails
```

Useful filters: `--sector "Oil & gas"`, `--city Jubail`, `--max-priority 1` (top sectors only), `--limit 20`.

How the sequence works:
- Each company gets one email at a time, to its best address (procurement first, then department, then info@). A second address is tried only if the first one bounced.
- Step 2 goes out 4 days after step 1, and step 3 goes out 7 days after step 2. Then it stops.
- Due follow-ups go out before new introductions, up to `DAILY_LIMIT` per run.
- To stop emailing someone, add the address (or `@theirdomain.com`) to `outreach/state/suppression.txt`, or set their **status** in the workbook to `skip`. Do this the same day for anyone who replies "remove".

### Run it automatically every working day

**Windows (Task Scheduler):** create a basic task, set it to run daily at 09:00, with:
- Program: `python`
- Arguments: `outreach\send_campaign.py --sync-replies`
- Start in: the repository folder

Then add a second action with the arguments `outreach\send_campaign.py --send`. The script skips Fridays, Saturdays and out-of-hours runs by itself.

**Mac / Linux (cron)**, at 09:05 Saudi time:

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
