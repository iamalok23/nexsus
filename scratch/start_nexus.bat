@echo off
title NEXUS Full Stack Launcher
echo ===================================================
echo       NEXUS Intelligence Platform Launcher
echo ===================================================
echo Starting FastAPI Backend on http://localhost:8000 ...
start "NEXUS Backend API" cmd /k "cd /d %~dp0backend && ..\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo Starting React Frontend on http://localhost:5173 ...
start "NEXUS Frontend UI" cmd /k "cd /d %~dp0nexus && npm run dev -- --host 0.0.0.0 --port 5173"

timeout /t 3 /nobreak >nul

echo Opening browser...
start http://localhost:5173
echo ===================================================
echo Both services are running:
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:8000/docs
echo ===================================================
