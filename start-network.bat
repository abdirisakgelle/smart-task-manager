@echo off
echo 🚀 Starting Smart Task Manager for Network Access...
echo.

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /r /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP: =%

echo 📍 Your local IP address: %IP%
echo 🎯 Allowed IP: 192.168.18.28
echo.
echo 📱 Access URLs:
echo    Local: http://localhost:5173
echo    Network: http://%IP%:5173
echo    Specific IP: http://192.168.18.28:5173
echo.
echo ⚠️  Starting servers...
echo.

REM Start backend server
echo Starting backend server...
cd server
start "Backend Server" cmd /k "npm start"
cd ..

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting frontend...
cd client
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo ✅ Both servers are starting...
echo 📱 Access from 192.168.18.28 using: http://%IP%:5173
echo.
pause 