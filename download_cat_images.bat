@echo off
echo ========================================
echo  Download Category Images Tool
echo ========================================
echo.
echo For each category, paste a direct image URL
echo (right-click any image and "Copy image address")
echo.
echo ========================================

set CAT_DIR=%~dp0dist\images\categories
set PERM_DIR=%~dp0images\categories
mkdir "%CAT_DIR%" 2>nul
mkdir "%PERM_DIR%" 2>nul

:menu
echo.
echo Categories:
echo  1 - Golf Irons    7  - Bags
echo  2 - Putters       8  - Hats & Caps
echo  3 - Wedges        9  - Balls
echo  4 - Men's Jackets 10 - Accessories
echo  5 - Men's Shoes   11 - Range Finders
echo  6 - Gloves        12 - Grips
echo  0 - Done / Regenerate
echo.
set /p choice="Select category (0-12): "

if "%choice%"=="1" set slug=golf_irons
if "%choice%"=="2" set slug=putters
if "%choice%"=="3" set slug=wedges
if "%choice%"=="4" set slug=mens_jackets
if "%choice%"=="5" set slug=mens_shoes
if "%choice%"=="6" set slug=gloves
if "%choice%"=="7" set slug=bags
if "%choice%"=="8" set slug=hats_and_caps
if "%choice%"=="9" set slug=balls
if "%choice%"=="10" set slug=accessories
if "%choice%"=="11" set slug=range_finders
if "%choice%"=="12" set slug=grips
if "%choice%"=="0" goto done
if "%slug%"=="" echo Invalid choice & goto menu

:geturl
echo.
echo Selected: %slug%
set /p img_url="Paste image URL: "
if "%img_url%"=="" echo No URL & goto menu

echo Downloading...
curl -s -L "%img_url%" -o "%CAT_DIR%\cat_%slug%.jpg"
if exist "%CAT_DIR%\cat_%slug%.jpg" (
    copy "%CAT_DIR%\cat_%slug%.jpg" "%PERM_DIR%\cat_%slug%.jpg" >nul
    echo ✅ Saved!
) else (
    echo ❌ Failed. Try another URL
)
set slug=
goto menu

:done
echo.
echo Regenerating site...
python generate.py
echo Done! Refresh http://localhost:8080
pause
