@echo off
REM ChatFlow - Quick Start Script (Windows)

echo.
echo ╔═══════════════════════════════════════╗
echo ║   ChatFlow - Quick Start Setup        ║
echo ╚═══════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%
echo.

REM Backend setup
echo 📦 Setting up backend...
cd server

if not exist "node_modules" (
    echo 📥 Installing server dependencies...
    call npm install
) else (
    echo ✅ Server dependencies already installed
)

if not exist ".env" (
    echo 📝 Creating .env file...
    copy .env.example .env
    echo ⚠️  Please edit server\.env with your configuration
    echo.
    echo Required settings:
    echo   - MONGODB_URI
    echo   - JWT_ACCESS_SECRET
    echo   - JWT_REFRESH_SECRET
    echo   - CLOUDINARY credentials
    echo   - EMAIL credentials
) else (
    echo ✅ .env already exists
)

cd ..

echo.

REM Frontend setup
echo 📦 Setting up frontend...
cd client

if not exist "node_modules" (
    echo 📥 Installing client dependencies...
    call npm install
) else (
    echo ✅ Client dependencies already installed
)

if not exist ".env" (
    echo 📝 Creating .env file...
    copy .env.example .env
    echo ✅ Frontend .env created with defaults
) else (
    echo ✅ .env already exists
)

cd ..

echo.
echo ╔═══════════════════════════════════════╗
echo ║   Setup Complete!                     ║
echo ╚═══════════════════════════════════════╝
echo.
echo Next steps:
echo.
echo 1. Configure backend:
echo    Edit server\.env with your settings:
echo    - MongoDB connection string
echo    - JWT secrets
echo    - Cloudinary credentials
echo    - Email settings
echo.
echo 2. Start backend (Terminal 1):
echo    cd server
echo    npm run dev
echo.
echo 3. Start frontend (Terminal 2):
echo    cd client
echo    npm run dev
echo.
echo 4. Open browser:
echo    http://localhost:5173
echo.
echo 5. (Optional) Seed test data:
echo    cd server
echo    npm run seed
echo.
echo 📚 See SETUP_GUIDE.md for detailed instructions
echo.
pause
