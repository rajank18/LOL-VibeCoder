import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <div className="loading-text">
          <h3>Analyzing Repository...</h3>
          <p>This may take a few moments while we:</p>
          <ul className="loading-steps">
            <li>🔍 Clone the repository</li>
            <li>📊 Run Node.js analysis</li>
            <li>🐍 Execute Python static analysis</li>
            <li>🤖 Process with AI detection</li>
            <li>📈 Generate final scores</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;

