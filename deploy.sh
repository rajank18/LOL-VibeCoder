#!/bin/bash

# LOLVibeCoder Vercel Deployment Script
echo "🚀 LOLVibeCoder Vercel Deployment Script"
echo "========================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel:"
    vercel login
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Build frontend
echo "🔨 Building frontend..."
cd frontend && npm run build && cd ..

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Add your GOOGLE_API_KEY in Vercel dashboard → Settings → Environment Variables"
echo "2. Redeploy after adding environment variables"
echo "3. Test your deployment with the health endpoint"
echo ""
echo "🌐 Your app will be available at: https://your-project.vercel.app"
