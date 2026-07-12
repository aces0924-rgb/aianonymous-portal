@echo off
title AI Anonymous Portal - Local Server
cd /d "%~dp0"

echo.
echo Starting the local development server.
echo Keep this window open while checking the site.
echo Open: http://localhost:4000
echo Stop: Ctrl+C
echo.

call npm.cmd run dev -- --port 4000

echo.
echo The server stopped. Press any key to close this window.
pause > nul
