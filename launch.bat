@echo off
:: FitStart AI - Development Server Launcher
:: 
:: 1. Sets up Node.js path
:: 2. Installs dependencies if needed
:: 3. Starts the Vite development server
::
:: Prerequisite: Node.js must be at C:\Users\p62\Desktop\node-v26.13.0-win-x64

set "PROJECT_DIR=C:\Users\p62\Desktop\FitStart_AI_2026-11-03"
set "NODE_PATH=C:\Users\p62\Desktop\node-v26.13.0-win-x64"

:: Change to project directory
cd /d "%PROJECT_DIR%"

:: Set PATH to include Node.js
set "PATH=%NODE_PATH%;%PATH%"

:: Install dependencies if needed (skips if already installed)
if not exist node_modules\npm (
    echo Installing npm dependencies...
    npm install
)

echo.
echo ==========================================
echo  FitStart AI - Development Server
echo ==========================================
echo.
echo Project: %PROJECT_DIR%
echo Node.js: %NODE_PATH%
echo.
echo Running: npm run dev
echo.

:: Start the development server
npm run dev

echo.
echo.
echo Development server stopped.
pause