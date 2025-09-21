import React, { useState } from 'react';

const AnalysisForm = ({ onAnalyze, onReset, disabled }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isValid, setIsValid] = useState(true);

  const validateGitHubUrl = (url) => {
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
      return pathParts.length >= 2;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!repoUrl.trim()) {
      setIsValid(false);
      return;
    }

    const valid = validateGitHubUrl(repoUrl);
    setIsValid(valid);

    if (valid) {
      onAnalyze(repoUrl.trim());
    }
  };

  const handleInputChange = (e) => {
    setRepoUrl(e.target.value);
    setIsValid(true);
  };

  const exampleUrls = [
    'https://github.com/facebook/react',
    'https://github.com/microsoft/vscode',
    'https://github.com/vercel/next.js',
    'https://github.com/rajank18/SGP_S4/tree/master'
  ];

  return (
    <div className="analysis-form-container">
      <form onSubmit={handleSubmit} className="analysis-form">
        <div className="form-group">
          <label htmlFor="repo-url" className="form-label">
            GitHub Repository URL
          </label>
          <div className="input-group">
            <input
              type="url"
              id="repo-url"
              value={repoUrl}
              onChange={handleInputChange}
              placeholder="https://github.com/username/repository or https://github.com/username/repo/tree/branch"
              className={`form-input ${!isValid ? 'form-input-error' : ''}`}
              disabled={disabled}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={disabled || !repoUrl.trim()}
            >
              {disabled ? 'Analyzing...' : 'Analyze Repository'}
            </button>
          </div>
          {!isValid && (
            <div className="error-message">
              Please enter a valid GitHub repository URL
            </div>
          )}
        </div>
      </form>

      <div className="examples-section">
        <h3>Try these examples:</h3>
        <div className="examples-list">
          {exampleUrls.map((url, index) => (
            <button
              key={index}
              className="example-btn"
              onClick={() => {
                setRepoUrl(url);
                setIsValid(true);
              }}
              disabled={disabled}
            >
              {url}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisForm;
