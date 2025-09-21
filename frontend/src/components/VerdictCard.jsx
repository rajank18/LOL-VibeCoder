import React from 'react';

const VerdictCard = ({ verdict, isVibeCoded, overall }) => {
  const getVerdictEmoji = () => {
    if (verdict.includes('DEFINITELY AI-GENERATED')) return '🤖';
    if (verdict.includes('LIKELY AI-GENERATED')) return '🤖';
    if (verdict.includes('POSSIBLY AI-GENERATED')) return '🤔';
    if (verdict.includes('MIXED')) return '👨‍💻';
    if (verdict.includes('HUMAN-WRITTEN')) return '👨‍💻';
    return '❓';
  };

  const getVerdictColor = () => {
    if (isVibeCoded) return 'verdict-ai';
    return 'verdict-human';
  };

  return (
    <div className={`verdict-card ${getVerdictColor()}`}>
      <div className="verdict-header">
        <span className="verdict-emoji">{getVerdictEmoji()}</span>
        <div className="verdict-title">
          <h3>Final Verdict</h3>
          <div className="overall-score">
            Overall Score: <span className="score-value">{overall}/10</span>
          </div>
        </div>
      </div>
      
      <div className="verdict-content">
        <p className="verdict-text">{verdict}</p>
        
        <div className="verdict-status">
          <span className={`status-badge ${isVibeCoded ? 'status-ai' : 'status-human'}`}>
            {isVibeCoded ? 'VIBE-CODED' : 'HUMAN-WRITTEN'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VerdictCard;

