const simpleGit = require('simple-git');
const fs = require('fs-extra');
const path = require('path');
const PythonIntegration = require('./pythonIntegration');

class RepoAnalyzer {
    constructor() {
        this.tempDir = path.join(__dirname, '..', 'temp');
        this.pythonIntegration = new PythonIntegration();
    }

    /**
     * Clone a GitHub repository and analyze it
     * @param {string} repoUrl - GitHub repository URL
     * @param {string} branch - Specific branch to analyze (optional)
     * @returns {Promise<Object>} Analysis results
     */
    async analyzeRepository(repoUrl, branch = null) {
        const tempRepoPath = this.createTempPath();
        
        try {
            console.log(`Cloning repository: ${repoUrl}`);
            
            // Clone the repository and get the branch used
            const usedBranch = await this.cloneRepo(repoUrl, tempRepoPath, branch);
            
            // Analyze the cloned repository with Node.js
            const nodeMetrics = await this.computeMetrics(tempRepoPath);
            nodeMetrics.usedBranch = usedBranch;
            
            // Run Python analysis
            let pythonMetrics = {};
            try {
                console.log('Running Python analysis...');
                pythonMetrics = await this.pythonIntegration.analyzeRepository(tempRepoPath);
            } catch (pythonError) {
                console.warn('Python analysis failed, continuing with Node.js analysis only:', pythonError.message);
                pythonMetrics = { error: pythonError.message };
            }
            
            // Merge metrics from both analyzers
            const combinedMetrics = this.pythonIntegration.mergeMetrics(nodeMetrics, pythonMetrics);
            
            console.log('Repository analysis completed:', combinedMetrics);
            return combinedMetrics;
            
        } catch (error) {
            console.error('Error analyzing repository:', error.message);
            throw new Error(`Failed to analyze repository: ${error.message}`);
        } finally {
            // Clean up temporary directory
            await this.cleanup(tempRepoPath);
        }
    }

    /**
     * Create a unique temporary directory path
     * @returns {string} Temporary directory path
     */
    createTempPath() {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        return path.join(this.tempDir, `repo_${timestamp}_${randomId}`);
    }

    /**
     * Clone repository using simple-git with branch detection
     * @param {string} repoUrl - Repository URL
     * @param {string} targetPath - Target directory path
     * @param {string} specificBranch - Specific branch to clone (optional)
     */
    async cloneRepo(repoUrl, targetPath, specificBranch = null) {
        try {
            // Ensure temp directory exists
            await fs.ensureDir(this.tempDir);

            const git = simpleGit();
            let cloned = false;
            let usedBranch = 'main';
            
            // If a specific branch is requested, try to clone that branch first
            if (specificBranch) {
                try {
                    console.log(`Trying to clone specific branch: ${specificBranch}`);
                    await git.clone(repoUrl, targetPath, ['--depth', '1', '--branch', specificBranch]);
                    cloned = true;
                    usedBranch = specificBranch;
                    console.log(`Successfully cloned specific branch: ${specificBranch}`);
                } catch (specificError) {
                    console.log(`Specific branch ${specificBranch} not found, trying default branches...`);
                }
            }
            
            // If specific branch failed or not specified, try default branches
            if (!cloned) {
                const branches = ['main', 'master', 'develop', 'dev', 'trunk'];
                
                for (const branch of branches) {
                    try {
                        console.log(`Trying to clone branch: ${branch}`);
                        await git.clone(repoUrl, targetPath, ['--depth', '1', '--branch', branch]);
                        cloned = true;
                        usedBranch = branch;
                        console.log(`Successfully cloned branch: ${branch}`);
                        break;
                    } catch (branchError) {
                        console.log(`Branch ${branch} not found, trying next...`);
                        continue;
                    }
                }
            }
            
            // If no specific branch worked, try default clone
            if (!cloned) {
                try {
                    console.log('Trying default clone (no specific branch)...');
                    await git.clone(repoUrl, targetPath, ['--depth', '1']);
                    cloned = true;
                    usedBranch = 'default';
                    console.log('Successfully cloned with default branch');
                } catch (defaultError) {
                    throw new Error(`Failed to clone repository with any branch: ${defaultError.message}`);
                }
            }
            
            console.log(`Repository cloned to: ${targetPath} (branch: ${usedBranch})`);
            return usedBranch;
            
        } catch (error) {
            throw new Error(`Failed to clone repository: ${error.message}`);
        }
    }

    /**
     * Compute repository metrics
     * @param {string} repoPath - Path to the repository
     * @returns {Promise<Object>} Computed metrics
     */
    async computeMetrics(repoPath) {
        try {
            const stats = {
                totalFiles: 0,
                totalLines: 0,
                commentLines: 0,
                hasReadme: false,
                hasTests: false,
                fileTypes: {},
                codeSamples: [], // Store code samples for AI analysis
                aiPatterns: {
                    genericNames: 0,
                    perfectFormatting: 0,
                    boilerplateCode: 0,
                    repetitivePatterns: 0
                }
            };

            await this.analyzeDirectory(repoPath, stats);
            
            // Calculate derived metrics
            const commentsRatio = stats.totalLines > 0 ? stats.commentLines / stats.totalLines : 0;
            
            return {
                totalFiles: stats.totalFiles,
                totalLines: stats.totalLines,
                commentLines: stats.commentLines,
                commentsRatio: Math.round(commentsRatio * 100) / 100,
                hasReadme: stats.hasReadme,
                hasTests: stats.hasTests,
                fileTypes: stats.fileTypes,
                codeSamples: stats.codeSamples.slice(0, 10), // Limit to 10 samples
                aiPatterns: stats.aiPatterns
            };
            
        } catch (error) {
            throw new Error(`Failed to compute metrics: ${error.message}`);
        }
    }

    /**
     * Recursively analyze directory structure
     * @param {string} dirPath - Directory path to analyze
     * @param {Object} stats - Stats object to update
     */
    async analyzeDirectory(dirPath, stats) {
        try {
            const items = await fs.readdir(dirPath);
            
            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const stat = await fs.stat(itemPath);
                
                // Skip hidden files and common non-code directories
                if (item.startsWith('.') || 
                    ['node_modules', 'dist', 'build', '.git'].includes(item)) {
                    continue;
                }
                
                if (stat.isDirectory()) {
                    await this.analyzeDirectory(itemPath, stats);
                } else if (stat.isFile()) {
                    await this.analyzeFile(itemPath, stats);
                }
            }
        } catch (error) {
            console.warn(`Warning: Could not analyze directory ${dirPath}:`, error.message);
        }
    }

    /**
     * Analyze individual file
     * @param {string} filePath - File path to analyze
     * @param {Object} stats - Stats object to update
     */
    async analyzeFile(filePath, stats) {
        try {
            const fileName = path.basename(filePath);
            const ext = path.extname(filePath).toLowerCase();
            
            // Check for README
            if (fileName.toLowerCase().startsWith('readme')) {
                stats.hasReadme = true;
            }
            
            // Check for test files
            if (this.isTestFile(fileName, filePath)) {
                stats.hasTests = true;
            }
            
            // Count file types
            if (ext) {
                stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
            }
            
            // Only analyze text files for line counting
            if (this.isTextFile(ext)) {
                const content = await fs.readFile(filePath, 'utf8');
                const lines = content.split('\n');
                
                stats.totalFiles++;
                stats.totalLines += lines.length;
                
                // Count comment lines (simple heuristic)
                const commentLines = this.countCommentLines(content, ext);
                stats.commentLines += commentLines;
                
                // Analyze code content for AI patterns
                this.analyzeCodeContent(content, ext, stats);
                
                // Store code samples for LLM analysis (only for main code files)
                if (this.isMainCodeFile(ext) && stats.codeSamples.length < 20) {
                    const sample = this.extractCodeSample(content, ext);
                    if (sample) {
                        stats.codeSamples.push({
                            file: fileName,
                            extension: ext,
                            sample: sample,
                            lines: lines.length
                        });
                    }
                }
            }
            
        } catch (error) {
            // Skip files that can't be read (binary files, etc.)
            console.warn(`Warning: Could not analyze file ${filePath}:`, error.message);
        }
    }

    /**
     * Check if file is a test file
     * @param {string} fileName - File name
     * @param {string} filePath - Full file path
     * @returns {boolean}
     */
    isTestFile(fileName, filePath) {
        const testPatterns = [
            /test/i,
            /spec/i,
            /__tests__/i,
            /\.test\./i,
            /\.spec\./i
        ];
        
        return testPatterns.some(pattern => 
            pattern.test(fileName) || pattern.test(filePath)
        );
    }

    /**
     * Check if file is a text file based on extension
     * @param {string} ext - File extension
     * @returns {boolean}
     */
    isTextFile(ext) {
        const textExtensions = [
            '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.h',
            '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala',
            '.html', '.css', '.scss', '.sass', '.less', '.vue', '.svelte',
            '.json', '.xml', '.yaml', '.yml', '.md', '.txt', '.sh', '.bat',
            '.ps1', '.sql', '.r', '.m', '.scm', '.lisp', '.clj', '.hs',
            '.ml', '.fs', '.vb', '.dart', '.elm', '.ex', '.exs', '.erl'
        ];
        
        return textExtensions.includes(ext);
    }

    /**
     * Count comment lines in file content
     * @param {string} content - File content
     * @param {string} ext - File extension
     * @returns {number} Number of comment lines
     */
    countCommentLines(content, ext) {
        const lines = content.split('\n');
        let commentCount = 0;
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            // Skip empty lines
            if (!trimmed) continue;
            
            // Different comment patterns for different file types
            if (ext === '.js' || ext === '.jsx' || ext === '.ts' || ext === '.tsx') {
                if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
                    commentCount++;
                }
            } else if (ext === '.py') {
                if (trimmed.startsWith('#')) {
                    commentCount++;
                }
            } else if (ext === '.java' || ext === '.cpp' || ext === '.c' || ext === '.h' || ext === '.cs') {
                if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
                    commentCount++;
                }
            } else if (ext === '.html' || ext === '.xml') {
                if (trimmed.startsWith('<!--')) {
                    commentCount++;
                }
            } else if (ext === '.css' || ext === '.scss' || ext === '.sass') {
                if (trimmed.startsWith('/*') || trimmed.startsWith('*')) {
                    commentCount++;
                }
            } else if (ext === '.sh' || ext === '.bat' || ext === '.ps1') {
                if (trimmed.startsWith('#')) {
                    commentCount++;
                }
            }
        }
        
        return commentCount;
    }

    /**
     * Check if file is a main code file (not config, docs, etc.)
     * @param {string} ext - File extension
     * @returns {boolean}
     */
    isMainCodeFile(ext) {
        const mainCodeExtensions = [
            '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.h',
            '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala',
            '.vue', '.svelte', '.dart', '.elm', '.ex', '.exs', '.erl'
        ];
        
        return mainCodeExtensions.includes(ext);
    }

    /**
     * Analyze code content for AI patterns
     * @param {string} content - File content
     * @param {string} ext - File extension
     * @param {Object} stats - Stats object to update
     */
    analyzeCodeContent(content, ext, stats) {
        const lines = content.split('\n');
        
        // Check for generic variable names (AI often uses generic names)
        const genericPatterns = [
            /\b(data|result|value|item|temp|tempVar|tempValue|tempData)\b/g,
            /\b(user|users|item|items|data|datas|list|lists)\b/g,
            /\b(handle|process|execute|perform|do|run)\w*\b/g
        ];
        
        let genericCount = 0;
        genericPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) genericCount += matches.length;
        });
        
        if (genericCount > 5) stats.aiPatterns.genericNames++;
        
        // Check for perfect formatting (AI generates very clean code)
        const indentationConsistency = this.checkIndentationConsistency(lines);
        if (indentationConsistency > 0.95) stats.aiPatterns.perfectFormatting++;
        
        // Check for boilerplate code patterns
        const boilerplatePatterns = [
            /function\s+\w+\s*\(\s*\)\s*\{[\s\S]*?\}/g,
            /class\s+\w+\s*\{[\s\S]*?\}/g,
            /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\}/g
        ];
        
        let boilerplateCount = 0;
        boilerplatePatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) boilerplateCount += matches.length;
        });
        
        if (boilerplateCount > 3) stats.aiPatterns.boilerplateCode++;
        
        // Check for repetitive patterns
        const repetitivePatterns = this.detectRepetitivePatterns(content);
        if (repetitivePatterns > 0.3) stats.aiPatterns.repetitivePatterns++;
    }

    /**
     * Check indentation consistency
     * @param {Array<string>} lines - File lines
     * @returns {number} Consistency ratio (0-1)
     */
    checkIndentationConsistency(lines) {
        const indentations = lines
            .filter(line => line.trim().length > 0)
            .map(line => {
                const match = line.match(/^(\s*)/);
                return match ? match[1].length : 0;
            });
        
        if (indentations.length === 0) return 1;
        
        // Check if indentation follows a consistent pattern
        const spaces = indentations.filter(indent => indent % 4 === 0).length;
        const tabs = indentations.filter(indent => indent % 1 === 0 && indent > 0).length;
        
        return Math.max(spaces, tabs) / indentations.length;
    }

    /**
     * Detect repetitive patterns in code
     * @param {string} content - File content
     * @returns {number} Repetition ratio (0-1)
     */
    detectRepetitivePatterns(content) {
        const lines = content.split('\n').filter(line => line.trim().length > 0);
        if (lines.length < 5) return 0;
        
        // Look for repeated line patterns
        const lineCounts = {};
        lines.forEach(line => {
            const normalized = line.trim().replace(/\s+/g, ' ');
            lineCounts[normalized] = (lineCounts[normalized] || 0) + 1;
        });
        
        const repeatedLines = Object.values(lineCounts).filter(count => count > 1).length;
        return repeatedLines / lines.length;
    }

    /**
     * Extract a code sample for LLM analysis
     * @param {string} content - File content
     * @param {string} ext - File extension
     * @returns {string|null} Code sample or null
     */
    extractCodeSample(content, ext) {
        const lines = content.split('\n');
        
        // Take first 50 lines or up to 2000 characters
        let sample = lines.slice(0, 50).join('\n');
        
        if (sample.length > 2000) {
            sample = sample.substring(0, 2000) + '...';
        }
        
        // Only return if it has substantial content
        if (sample.trim().length > 100) {
            return sample;
        }
        
        return null;
    }

    /**
     * Clean up temporary directory
     * @param {string} tempPath - Temporary directory path
     */
    async cleanup(tempPath) {
        try {
            if (await fs.pathExists(tempPath)) {
                await fs.remove(tempPath);
                console.log(`Cleaned up temporary directory: ${tempPath}`);
            }
        } catch (error) {
            console.warn(`Warning: Could not clean up ${tempPath}:`, error.message);
        }
    }
}

module.exports = RepoAnalyzer;