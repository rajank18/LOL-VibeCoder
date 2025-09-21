require('dotenv').config();
const RepoAnalyzer = require('../backend/src/analyzer');
const LLMScorer = require('../backend/src/llm');

module.exports = async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Validate input
    const { repo } = req.query;
    
    if (!repo) {
      return res.status(400).json({
        error: 'Missing required parameter: repo',
        message: 'Please provide a GitHub repository URL as a query parameter',
        example: '/api/analyze?repo=https://github.com/username/repository'
      });
    }

    // Validate GitHub URL format
    if (!isValidGitHubUrl(repo)) {
      return res.status(400).json({
        error: 'Invalid GitHub URL',
        message: 'Please provide a valid GitHub repository URL',
        example: '/api/analyze?repo=https://github.com/username/repository'
      });
    }

    // Extract repository info and branch from URL
    const repoInfo = extractRepoInfo(repo);

    console.log(`\n=== Starting analysis for: ${repo} ===`);
    console.log(`Repository: ${repoInfo.baseUrl}`);
    console.log(`Branch: ${repoInfo.branch || 'default'}`);
    
    // Initialize services
    const llmScorer = new LLMScorer(process.env.GOOGLE_API_KEY || 'fallback');
    const repoAnalyzer = new RepoAnalyzer();
    
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
};

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
