@echo off
cd /d "%~dp0"
call outreach\find_python.bat || exit /b 1
echo Installing the two helper libraries (one time only)...
%PY% -m pip install --quiet --upgrade pywin32 openpyxl
if errorlevel 1 (echo Install failed. Check your internet connection and try again. & pause & exit /b 1)
echo.
echo Writing a preview of today's emails. NOTHING IS SENT in this step.
%PY% outreach\send_campaign.py
echo.
echo Opening the preview folder so you can read them...
start "" "%~dp0outreach\state\preview"
echo.
echo Setup done. Next: double-click 2_SEND_TEST_TO_ME.bat
pause
