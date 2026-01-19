@echo off
echo ==================================================
echo   🟢 Antigravity Extreme Memory Cleaner
echo ==================================================
echo.
echo This script will terminate secondary background processes 
echo to secure memory for Antigravity and VS Code.
echo.
pause

echo.
echo [1/4] Shutting down WSL2...
wsl --shutdown

echo.
echo [2/4] Terminating heavy Browsers...
taskkill /F /IM msedge.exe /T >nul 2>&1
taskkill /F /IM chrome.exe /T >nul 2>&1
taskkill /F /IM firefox.exe /T >nul 2>&1

echo.
echo [3/4] Terminating unused Language Servers/Runtimes...
taskkill /F /IM java.exe /T >nul 2>&1
taskkill /F /IM javad.exe /T >nul 2>&1
taskkill /F /IM gopls.exe /T >nul 2>&1
taskkill /F /IM python.exe /T >nul 2>&1

echo.
echo [4/4] Cleaning standby memory (via PowerShell)...
powershell -Command "Clear-Variable -Name * -ErrorAction SilentlyContinue; [System.GC]::Collect()"

echo.
echo ==================================================
echo   ✅ Cleanup Complete! 
echo   Antigravity should have more room to breathe.
echo ==================================================
echo.
pause
