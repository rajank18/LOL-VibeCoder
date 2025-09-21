import React from 'react';

const ErrorMessage = ({ message, onRetry }) => {
  const getErrorIcon = (message) => {
    if (message.includes('404') || message.includes('not found')) {
      return '🔍';
    }
    if (message.includes('timeout')) {
      return '⏰';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return '🌐';
    }
    return '❌';
  };

  const getErrorType = (message) => {
    if (message.includes('404') || message.includes('not found')) {
      return 'Repository not found';
    }
    if (message.includes('timeout')) {
      return 'Request timeout';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'Network error';
    }
    if (message.includes('Invalid GitHub URL')) {
      return 'Invalid URL';
    }
    return 'Analysis error';
  };

  return (
    <div className="error-container">
      <div className="error-card">
        <div className="error-header">
          <span className="error-icon">{getErrorIcon(message)}</span>
          <h3>{getErrorType(message)}</h3>
        </div>
        
        <div className="error-content">
          <p className="error-message">{message}</p>
          
          <div className="error-suggestions">
            <h4>Suggestions:</h4>
            <ul>
              <li>Make sure the repository URL is correct and public</li>
              <li>Check that the repository exists on GitHub</li>
              <li>Verify your internet connection</li>
              <li>Try again in a few moments</li>
            </ul>
          </div>
          
          <div className="error-actions">
            <button onClick={onRetry} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;

