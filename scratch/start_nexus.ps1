# NEXUS Full Stack Launcher (PowerShell)
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "      NEXUS Intelligence Platform Launcher" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start FastAPI Backend in new window
Write-Host "Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\backend'; & '..\.venv\Scripts\python.exe' -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Start-Sleep -Seconds 2

# 2. Start Vite React Frontend in new window
Write-Host "Starting React Frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\nexus'; npm run dev -- --host 0.0.0.0 --port 5173"

Start-Sleep -Seconds 3

# 3. Open browser
Write-Host "Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Both services are running:" -ForegroundColor Green
Write-Host "- Frontend: http://localhost:5173"
Write-Host "- Backend:  http://localhost:8000/docs"
Write-Host "===================================================" -ForegroundColor Cyan
