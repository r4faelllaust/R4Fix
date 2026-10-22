@echo off
REM Double-click this file on Windows to open Craft Animator
cd /d "%~dp0\.."

if exist "release\Craft-Animator-Portable.exe" (
  start "" "release\Craft-Animator-Portable.exe"
  exit /b 0
)

if exist "release\win-unpacked\Craft Animator.exe" (
  start "" "release\win-unpacked\Craft Animator.exe"
  exit /b 0
)

where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js/npm not found. Install Node.js, then run: npm install
  pause
  exit /b 1
)

if not exist "node_modules\electron" call npm install
call npm run build
start "" npx electron .
