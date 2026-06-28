@echo off
echo =============================
echo  Karibu Golf - Dev Server
echo =============================
echo.
echo  Running at: http://localhost:8080
echo  Press Ctrl+C to stop
echo =============================
echo.
python -m http.server 8080 --directory "%~dp0dist"
pause
