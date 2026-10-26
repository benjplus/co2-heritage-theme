@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\link-foundry.ps1" %*
pause
