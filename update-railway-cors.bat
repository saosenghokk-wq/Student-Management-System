@echo off
echo Updating Railway environment variables...
echo.

railway service Student-Management-System
timeout /t 2 /nobreak >nul

railway variables --set "ALLOWED_ORIGINS=https://student-management-system-five-gules.vercel.app,http://localhost:3000"

echo.
echo Done! Now redeploying...
railway up

echo.
echo Deployment triggered. Check Railway dashboard for status.
pause
