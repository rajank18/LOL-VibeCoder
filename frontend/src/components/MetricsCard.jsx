import React from 'react';

const MetricsCard = ({ metadata }) => {
  if (!metadata) return null;

  const { repo, processingTime, analyzedAt, metrics } = metadata;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatRepoName = (repoUrl) => {
    try {
      const url = new URL(repoUrl);
      return url.pathname.substring(1); // Remove leading slash
    } catch {
      return repoUrl;
    }
  };

  return (
    <div className="metrics-card">
      <h4>Repository Metrics</h4>
      
      <div className="metrics-content">
        <div className="metric-item">
          <span className="metric-label">Repository:</span>
          <span className="metric-value">
            <a href={repo} target="_blank" rel="noopener noreferrer" className="repo-link">
              {formatRepoName(repo)}
            </a>
          </span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Total Files:</span>
          <span className="metric-value">{metrics.totalFiles.toLocaleString()}</span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Total Lines:</span>
          <span className="metric-value">{metrics.totalLines.toLocaleString()}</span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Comments Ratio:</span>
          <span className="metric-value">{(metrics.commentsRatio * 100).toFixed(1)}%</span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Has README:</span>
          <span className={`metric-value ${metrics.hasReadme ? 'metric-yes' : 'metric-no'}`}>
            {metrics.hasReadme ? '✅ Yes' : '❌ No'}
          </span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Has Tests:</span>
          <span className={`metric-value ${metrics.hasTests ? 'metric-yes' : 'metric-no'}`}>
            {metrics.hasTests ? '✅ Yes' : '❌ No'}
          </span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Processing Time:</span>
          <span className="metric-value">{processingTime}</span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Analyzed At:</span>
          <span className="metric-value">{formatDate(analyzedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;

