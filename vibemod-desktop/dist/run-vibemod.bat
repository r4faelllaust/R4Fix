@echo off
REM Build & run VibeMod Desktop on Windows (Java 17+ required).
cd /d "%~dp0\.."
call gradlew.bat run
if errorlevel 1 pause
