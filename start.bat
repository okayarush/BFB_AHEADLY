@echo off
echo 🚀 Starting NASA Healthy Cities Application
echo.

echo 📡 Installing server dependencies...
cd server
call npm install
if errorlevel 1 (
    echo ❌ Server dependency installation failed
    pause
    exit /b 1
)

echo 🌐 Installing client dependencies...
cd ..\client
call npm install
if errorlevel 1 (
    echo ❌ Client dependency installation failed
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.
echo 🌍 Starting the NASA Healthy Cities application...
echo 📊 Backend will run on: http://localhost:5000
echo 🖥️ Frontend will run on: http://localhost:3000
echo.

:: Start backend in background
start "NASA Server" cmd /c "cd ..\server && npm run dev"

:: Wait a moment for server to start
timeout /t 3 /nobreak > nul

:: Start frontend
echo 🎉 Opening frontend...
npm start

pause
