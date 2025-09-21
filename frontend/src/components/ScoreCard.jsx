import React from 'react';

const ScoreCard = ({ label, value, description }) => {
  const getScoreColor = (score) => {
    if (score >= 8) return 'score-high';
    if (score >= 6) return 'score-medium';
    if (score >= 4) return 'score-low';
    return 'score-very-low';
  };

  const getScoreLabel = (score) => {
    if (score >= 8) return 'High AI Likelihood';
    if (score >= 6) return 'Medium AI Likelihood';
    if (score >= 4) return 'Low AI Likelihood';
    return 'Very Low AI Likelihood';
  };

  return (
    <div className="score-card">
      <div className="score-header">
        <h4 className="score-label">{label}</h4>
        <div className={`score-value ${getScoreColor(value)}`}>
          {value}/10
        </div>
      </div>
      
      <div className="score-bar">
        <div 
          className={`score-fill ${getScoreColor(value)}`}
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
      
      <div className="score-footer">
        <p className="score-description">{description}</p>
        <span className={`score-indicator ${getScoreColor(value)}`}>
          {getScoreLabel(value)}
        </span>
      </div>
    </div>
  );
};

export default ScoreCard;
