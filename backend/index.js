require('dotenv').config();
const express = require('express');
const RepoAnalyzer = require('./src/analyzer');
const LLMScorer = require('./src/llm');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware for frontend integration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Initialize services
let llmScorer;
try {
    if (!process.env.GOOGLE_API_KEY) {
        console.warn('Warning: GOOGLE_API_KEY not found in environment variables. LLM scoring will use fallback mode.');
    }
    llmScorer = new LLMScorer(process.env.GOOGLE_API_KEY || 'fallback');
} catch (error) {
    console.error('Failed to initialize LLM scorer:', error.message);
    process.exit(1);
}

const repoAnalyzer = new RepoAnalyzer();

// Check Python availability
const PythonIntegration = require('./src/pythonIntegration');
const pythonIntegration = new PythonIntegration();
pythonIntegration.checkPythonAvailability().then(available => {
    if (available) {
        console.log('✅ Python analyzer available');
    } else {
        console.warn('⚠️  Python not available - advanced analysis will be limited');
    }
}).catch(err => {
    console.warn('⚠️  Could not check Python availability:', err.message);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'LOLVibeCoder Backend'
    });
});

// Main analysis endpoint
app.get('/analyze', async (req, res) => {
    const startTime = Date.now();
    
    try {
        // Validate input
        const { repo } = req.query;
        
        if (!repo) {
            return res.status(400).json({
                error: 'Missing required parameter: repo',
                message: 'Please provide a GitHub repository URL as a query parameter',
                example: '/analyze?repo=https://github.com/username/repository'
            });
        }

        // Validate GitHub URL format
        if (!isValidGitHubUrl(repo)) {
            return res.status(400).json({
                error: 'Invalid GitHub URL',
                message: 'Please provide a valid GitHub repository URL',
                example: '/analyze?repo=https://github.com/username/repository'
            });
        }

        // Extract repository info and branch from URL
        const repoInfo = extractRepoInfo(repo);

        console.log(`\n=== Starting analysis for: ${repo} ===`);
        console.log(`Repository: ${repoInfo.baseUrl}`);
        console.log(`Branch: ${repoInfo.branch || 'default'}`);
        
        // Step 1: Analyze repository
        console.log('Step 1: Analyzing repository...');
        const metrics = await repoAnalyzer.analyzeRepository(repoInfo.baseUrl, repoInfo.branch);
        
        // Step 2: Score with LLM
        console.log('Step 2: Scoring with LLM...');
        const scoring = await llmScorer.scoreRepository(metrics);
        
        // Calculate processing time
        const processingTime = Date.now() - startTime;
        
        // Prepare response
        const response = {
            ...scoring,
            metadata: {
                repo: repo,
                baseRepo: repoInfo.baseUrl,
                branch: repoInfo.branch || 'default',
                processingTime: `${processingTime}ms`,
                analyzedAt: new Date().toISOString(),
                metrics: {
                    totalFiles: metrics.totalFiles,
                    totalLines: metrics.totalLines,
                    commentsRatio: metrics.commentsRatio,
                    hasReadme: metrics.hasReadme,
                    hasTests: metrics.hasTests
                }
            }
        };
        
        console.log(`=== Analysis completed in ${processingTime}ms ===`);
        console.log('Final scoring:', scoring);
        
        res.json(response);
        
    } catch (error) {
        console.error('Analysis failed:', error.message);
        
        const errorResponse = {
            error: 'Analysis failed',
            message: error.message,
            timestamp: new Date().toISOString()
        };
        
        // Determine appropriate status code
        let statusCode = 500;
        if (error.message.includes('Invalid GitHub URL') || error.message.includes('Missing required parameter')) {
            statusCode = 400;
        } else if (error.message.includes('Failed to clone repository')) {
            statusCode = 404;
        }
        
        res.status(statusCode).json(errorResponse);
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: 'The requested endpoint does not exist',
        availableEndpoints: [
            'GET /health - Health check',
            'GET /analyze?repo=<github_url> - Analyze repository'
        ]
    });
});

/**
 * Validate GitHub URL format
 * @param {string} url - URL to validate
 * @returns {boolean} Whether the URL is valid
 */
function isValidGitHubUrl(url) {
    try {
        const urlObj = new URL(url);
        const isValidHost = urlObj.hostname === 'github.com' || urlObj.hostname === 'www.github.com';
        
        if (!isValidHost) return false;
        
        // Support various GitHub URL formats:
        // https://github.com/user/repo
        // https://github.com/user/repo/tree/branch
        // https://github.com/user/repo/blob/branch/file
        const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
        
        // Must have at least user and repo (minimum 2 parts)
        // Can have additional parts like 'tree', 'blob', branch names, etc.
        // Remove .git suffix if present
        const hasValidRepo = pathParts.length >= 2 && !pathParts[1].endsWith('.git');
        
        return hasValidRepo;
    } catch (error) {
        return false;
    }
}

/**
 * Extract repository information from GitHub URL
 * @param {string} url - GitHub URL to parse
 * @returns {Object} Repository info with baseUrl and branch
 */
function extractRepoInfo(url) {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
        
        // Extract user and repo (first two parts)
        const user = pathParts[0];
        const repo = pathParts[1];
        
        // Remove .git suffix if present
        const cleanRepo = repo.endsWith('.git') ? repo.slice(0, -4) : repo;
        
        const baseUrl = `https://github.com/${user}/${cleanRepo}`;
        
        // Check for branch in URL patterns:
        // /user/repo/tree/branch
        // /user/repo/blob/branch/file
        let branch = null;
        
        if (pathParts.length >= 4) {
            if (pathParts[2] === 'tree' || pathParts[2] === 'blob') {
                branch = pathParts[3];
            }
        }
        
        return {
            baseUrl: baseUrl,
            branch: branch
        };
    } catch (error) {
        // If extraction fails, return original URL as base
        return {
            baseUrl: url,
            branch: null
        };
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 LOLVibeCoder Backend Server Started`);
    console.log(`📍 Server running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 Analysis endpoint: http://localhost:${PORT}/analyze?repo=<github_url>`);
    console.log(`\nExample usage:`);
    console.log(`curl "http://localhost:${PORT}/analyze?repo=https://github.com/facebook/react"`);
    console.log(`\nPress Ctrl+C to stop the server\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
});

module.exports = app;
