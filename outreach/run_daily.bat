@echo off
rem Daily outreach run for Windows. Double-click it, or point Task Scheduler at it.
rem It first stops emailing anyone who replied or bounced, then sends today's batch.
rem The script itself skips Fridays, Saturdays and times outside 08:00-16:00 Saudi time.
cd /d "%~dp0.."
python outreach\send_campaign.py --sync-replies
python outreach\send_campaign.py --send
python outreach\send_campaign.py --status
if "%1"=="" pause
