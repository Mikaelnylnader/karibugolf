@echo off
cd /d "%~dp0backend"
title Karibu Golf Admin Panel
echo ========================================
echo   🏌️  Karibu Golf Admin Panel
echo   http://localhost:5000
echo ========================================
echo.
echo Auto-publish: OFF by default. Toggle it in the Dashboard.
echo.
if not exist "%~dp0.venv\Scripts\python.exe" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-dev.ps1"
"%~dp0.venv\Scripts\python.exe" app.py
