const { spawn } = require('child_process');
const path = require('path');

class PythonIntegration {
    constructor() {
        this.pythonScript = path.join(__dirname, '..', 'pythonAnalyzer.py');
    }

    /**
     * Run Python analyzer on repository
     * @param {string} repoPath - Path to the repository
     * @returns {Promise<Object>} Python analysis results
     */
    async analyzeRepository(repoPath) {
        return new Promise((resolve, reject) => {
            console.log(`Running Python analyzer on: ${repoPath}`);
            
            const pythonProcess = spawn('python', [this.pythonScript, repoPath], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let stdout = '';
            let stderr = '';

            pythonProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error('Python analyzer error:', stderr);
                    reject(new Error(`Python analyzer failed with code ${code}: ${stderr}`));
                    return;
                }

                try {
                    // Parse JSON output from Python
                    const lines = stdout.trim().split('\n');
                    
                    // Find the JSON line (should be the last line that starts with {)
                    let jsonLine = '';
                    for (let i = lines.length - 1; i >= 0; i--) {
                        const line = lines[i].trim();
                        if (line.startsWith('{') && line.endsWith('}')) {
                            jsonLine = line;
                            break;
                        }
                    }
                    
                    if (!jsonLine) {
                        throw new Error('No valid JSON found in Python output');
                    }
                    
                    const result = JSON.parse(jsonLine);
                    console.log('Python analysis completed:', result);
                    resolve(result);
                } catch (parseError) {
                    console.error('Failed to parse Python output:', stdout);
                    reject(new Error(`Failed to parse Python analyzer output: ${parseError.message}`));
                }
            });

            pythonProcess.on('error', (error) => {
                console.error('Python process error:', error);
                reject(new Error(`Failed to start Python analyzer: ${error.message}`));
            });

            // Set timeout for Python process
            setTimeout(() => {
                pythonProcess.kill();
                reject(new Error('Python analyzer timeout'));
            }, 60000); // 60 second timeout
        });
    }

    /**
     * Check if Python is available
     * @returns {Promise<boolean>} Whether Python is available
     */
    async checkPythonAvailability() {
        return new Promise((resolve) => {
            const pythonProcess = spawn('python', ['--version'], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            pythonProcess.on('close', (code) => {
                resolve(code === 0);
            });

            pythonProcess.on('error', () => {
                resolve(false);
            });

            // Timeout after 5 seconds
            setTimeout(() => {
                pythonProcess.kill();
                resolve(false);
            }, 5000);
        });
    }

    /**
     * Merge Python analysis with Node.js metrics
     * @param {Object} nodeMetrics - Node.js analysis metrics
     * @param {Object} pythonMetrics - Python analysis metrics
     * @returns {Object} Combined metrics
     */
    mergeMetrics(nodeMetrics, pythonMetrics) {
        // Handle Python analysis errors
        if (pythonMetrics.error) {
            console.warn('Python analysis failed, using Node.js metrics only:', pythonMetrics.error);
            return {
                ...nodeMetrics,
                pythonAnalysis: { error: pythonMetrics.error },
                combined: true
            };
        }

        // Merge the metrics
        const combined = {
            // Node.js metrics
            totalFiles: nodeMetrics.totalFiles,
            totalLines: nodeMetrics.totalLines,
            commentLines: nodeMetrics.commentLines,
            commentsRatio: nodeMetrics.commentsRatio,
            hasReadme: nodeMetrics.hasReadme,
            hasTests: nodeMetrics.hasTests,
            fileTypes: nodeMetrics.fileTypes,
            usedBranch: nodeMetrics.usedBranch,
            codeSamples: nodeMetrics.codeSamples,
            aiPatterns: nodeMetrics.aiPatterns,

            // Python analysis results
            pythonAnalysis: {
                comments_score: pythonMetrics.comments_score || 0,
                naming_score: pythonMetrics.naming_score || 0,
                tests_score: pythonMetrics.tests_score || 0,
                examples_score: pythonMetrics.examples_score || 0,
                highlights: pythonMetrics.highlights || []
            },

            // Combined highlights
            combinedHighlights: [
                ...(nodeMetrics.highlights || []),
                ...(pythonMetrics.highlights || [])
            ].filter((highlight, index, arr) => arr.indexOf(highlight) === index), // Remove duplicates

            combined: true
        };

        console.log('Metrics merged successfully');
        return combined;
    }
}

module.exports = PythonIntegration;
