@echo off
title FitStart AI Project - Development Server

:: Step 1: Set up Node.js path
set "PATH=C:\Users\p62\Desktop\node-v26.13.0-win-x64;%PATH%"

:: Step 2: Ensure we're in the project directory
cd /d "C:\Users\p62\Desktop\FitStart_AI_2026-11-03"

:: Step 3: Install dependencies (if not already installed)
echo Checking npm dependencies...
npm install --quiet 2>nul
if %errorlevel% neq 0 (
    echo Installing npm dependencies...
    npm install
)

:: Step 4: Start the development server
echo.
echo ==========================================
echo  FitStart AI - Development Server Starting
echo ==========================================
echo.
echo Project directory: C:\Users\p62\Desktop\FitStart_AI_2026-11-03
echo.
echo Opening browser at: http://localhost:5173
echo.
vite dev

:: Keep window open after server stops
echo.
echo.
echo Development server has stopped.
pause