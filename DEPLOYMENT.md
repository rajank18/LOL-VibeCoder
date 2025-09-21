# 🚀 Vercel Deployment Guide for LOLVibeCoder

This guide will help you deploy your LOLVibeCoder project to Vercel.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **Google API Key**: For the LLM functionality

## 🔧 Project Structure

Your project is now configured for Vercel deployment with the following structure:

```
LOLVibeCoder/
├── api/                    # Vercel serverless functions
│   ├── health.js          # Health check endpoint
│   └── analyze.js         # Main analysis endpoint
├── frontend/              # React frontend
│   ├── src/
│   ├── package.json
│   └── vercel.json       # Frontend-specific config
├── backend/              # Original backend (for reference)
├── vercel.json           # Main Vercel configuration
├── package.json          # Root package.json
└── .vercelignore         # Files to ignore during deployment
```

## 🚀 Deployment Steps

### Step 1: Push to GitHub

Make sure all your changes are committed and pushed to your GitHub repository:

```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect the configuration
5. Click "Deploy"

#### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project root:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your project

### Step 3: Configure Environment Variables

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `GOOGLE_API_KEY` | Your Google Generative AI API key | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

### Step 4: Redeploy

After adding environment variables, trigger a new deployment:

```bash
vercel --prod
```

Or redeploy from the Vercel dashboard.

## 🌐 API Endpoints

Once deployed, your application will have these endpoints:

- **Frontend**: `https://your-project.vercel.app/`
- **Health Check**: `https://your-project.vercel.app/api/health`
- **Analysis**: `https://your-project.vercel.app/api/analyze?repo=<github_url>`

## 🔍 Testing Your Deployment

### Test the Health Endpoint

```bash
curl https://your-project.vercel.app/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "service": "LOLVibeCoder Backend"
}
```

### Test the Analysis Endpoint

```bash
curl "https://your-project.vercel.app/api/analyze?repo=https://github.com/facebook/react"
```

## ⚠️ Important Notes

### Python Dependencies

**Note**: The Python analyzer (`pythonAnalyzer.py`) may not work in Vercel's serverless environment due to Python runtime limitations. The deployment will fall back to Node.js-only analysis.

### Function Timeout

- Vercel serverless functions have a maximum execution time of 30 seconds
- Large repositories might timeout
- Consider implementing pagination or async processing for very large repos

### File System Limitations

- Vercel serverless functions have limited file system access
- Temporary files created during analysis will be cleaned up automatically
- The `temp/` directory usage is handled appropriately

## 🛠️ Troubleshooting

### Common Issues

1. **Environment Variables Not Working**
   - Ensure variables are set in Vercel dashboard
   - Redeploy after adding variables
   - Check variable names match exactly

2. **Build Failures**
   - Check the build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

3. **API Endpoints Not Working**
   - Check the function logs in Vercel dashboard
   - Verify the API routes in `vercel.json`
   - Test endpoints individually

### Debugging

1. **View Function Logs**:
   - Go to Vercel dashboard → Functions tab
   - Click on individual functions to see logs

2. **Test Locally**:
   ```bash
   vercel dev
   ```
   This runs your project locally with Vercel's environment

## 📊 Performance Considerations

- **Cold Starts**: First request might be slower due to serverless cold starts
- **Memory Usage**: Monitor function memory usage in Vercel dashboard
- **Timeout**: Large repositories might hit the 30-second timeout limit

## 🔄 Updating Your Deployment

To update your deployment:

1. Make changes to your code
2. Commit and push to GitHub
3. Vercel will automatically redeploy (if auto-deploy is enabled)
4. Or manually trigger deployment from Vercel dashboard

## 📈 Monitoring

Monitor your deployment:

- **Vercel Dashboard**: View deployment status, logs, and metrics
- **Function Logs**: Check for errors and performance issues
- **Analytics**: Track usage and performance metrics

## 🎉 Success!

Once deployed, your LOLVibeCoder application will be available at your Vercel URL. Users can:

1. Visit your frontend URL
2. Enter GitHub repository URLs
3. Get AI-generated vs human-written code analysis
4. View detailed scoring and metrics

---

**Need help?** Check the [Vercel Documentation](https://vercel.com/docs) or create an issue in your repository.
