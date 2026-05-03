@echo off
echo Starting WanderKit...

start cmd /k "cd backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000"
start cmd /k "cd frontend && npm install && npm run dev"

echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
pause
