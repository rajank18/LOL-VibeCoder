@echo off
echo 🚀 LOLVibeCoder Vercel Deployment Script
echo ========================================

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Check if user is logged in to Vercel
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔐 Please log in to Vercel:
    vercel login
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm run install-all

REM Build frontend
echo 🔨 Building frontend...
cd frontend
call npm run build
cd ..

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

echo ✅ Deployment complete!
echo.
echo 📝 Next steps:
echo 1. Add your GOOGLE_API_KEY in Vercel dashboard → Settings → Environment Variables
echo 2. Redeploy after adding environment variables
echo 3. Test your deployment with the health endpoint
echo.
echo 🌐 Your app will be available at: https://your-project.vercel.app
pause
