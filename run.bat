@echo off
title WordBridge Launcher
echo ===================================================
echo   WordBridge — Word Ladder Puzzle & Auto-Solver
echo   DSA Project-Based Learning (PBL)
echo ===================================================
echo.
echo Opening game in your default browser...
start "" "http://localhost:3000"
echo.
echo If server is not running, starting node server.js...
node server.js
pause
