@echo off
title WordBridge Terminal Launcher
echo ===================================================
echo   WordBridge — Word Ladder Puzzle & Auto-Solver
echo   DSA Project-Based Learning (C Console Version)
echo ===================================================
echo.
cd /d "%~dp0"

if not exist "wordbridge.exe" (
    if not exist "dsa-wordBridge-terminal\wordbridge.exe" (
        echo Compiling WordBridge console application...
        cd dsa-wordBridge-terminal
        where mingw32-make >nul 2>nul && mingw32-make || gcc -std=c99 -Wall -Wextra -O2 -I../include src/main.c src/dictionary.c src/solver.c src/game.c src/display.c -o wordbridge.exe
        cd ..
    )
)

if exist "wordbridge.exe" (
    wordbridge.exe
) else if exist "dsa-wordBridge-terminal\wordbridge.exe" (
    cd dsa-wordBridge-terminal
    wordbridge.exe
) else (
    echo Could not find or build wordbridge.exe. Please ensure GCC or MinGW is installed.
    pause
)
pause
