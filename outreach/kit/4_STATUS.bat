@echo off
cd /d "%~dp0"
call outreach\find_python.bat || exit /b 1
%PY% outreach\send_campaign.py --status
pause
