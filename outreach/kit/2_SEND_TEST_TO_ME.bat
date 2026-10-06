@echo off
cd /d "%~dp0"
call outreach\find_python.bat || exit /b 1
echo Sending ONE test email to your own address through Outlook...
%PY% outreach\send_campaign.py --test-to me
echo.
echo Check your Outlook inbox for an email starting with [TEST].
echo If it looks right, double-click 3_SEND_TODAY.bat
pause
