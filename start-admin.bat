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
pip install -q Flask 2>nul
python app.py
