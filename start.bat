@echo off
rem Double-cliquez pour demarrer le site LSV. Options : -Build  -Stop  -NoOpen
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1" %*
echo.
pause
