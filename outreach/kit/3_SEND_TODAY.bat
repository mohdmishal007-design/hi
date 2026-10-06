@echo off
rem Stops emailing anyone who replied or bounced, sends today's batch, shows totals.
rem Skips Fridays, Saturdays and times outside 08:00-16:00 Saudi time by itself.
rem Task Scheduler: Program = this file, Argument = auto (skips the pause at the end).
cd /d "%~dp0"
call outreach\find_python.bat || exit /b 1
%PY% outreach\send_campaign.py --sync-replies
%PY% outreach\send_campaign.py --send
echo.
%PY% outreach\send_campaign.py --status
if "%1"=="" pause
