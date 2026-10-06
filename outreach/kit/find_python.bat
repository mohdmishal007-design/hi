@echo off
rem Sets PY to a working Python command, or exits with a message.
set "PY="
py -3 --version >nul 2>&1
if not errorlevel 1 set "PY=py -3"
if defined PY goto :eof
python --version >nul 2>&1
if not errorlevel 1 set "PY=python"
if defined PY goto :eof
echo.
echo Python is not installed yet.
echo Download it from https://www.python.org/downloads/ and, in the installer,
echo tick "Add python.exe to PATH". Then run this file again.
echo.
pause
exit 1
