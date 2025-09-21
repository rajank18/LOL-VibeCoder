import React from 'react';
import ScoreCard from './ScoreCard';
import VerdictCard from './VerdictCard';
import MetricsCard from './MetricsCard';
import HighlightsCard from './HighlightsCard';

const Results = ({ result, onNewAnalysis }) => {
  const { 
    aiPatterns, 
    codeStructure, 
    documentation, 
    complexity, 
    overall, 
    isVibeCoded, 
    verdict, 
    highlights,
    metadata 
  } = result;

  const scores = [
    { label: 'AI Patterns', value: aiPatterns, description: 'Generic names, formatting, boilerplate' },
    { label: 'Code Structure', value: codeStructure, description: 'Organization and templates' },
    { label: 'Documentation', value: documentation, description: 'Comments and descriptions' },
    { label: 'Complexity', value: complexity, description: 'Code complexity patterns' }
  ];

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Analysis Results</h2>
        <button onClick={onNewAnalysis} className="btn btn-secondary">
          Analyze Another Repository
        </button>
      </div>

      <div className="results-grid">
        <div className="results-main">
          <VerdictCard 
            verdict={verdict}
            isVibeCoded={isVibeCoded}
            overall={overall}
          />
          
          <div className="scores-grid">
            {scores.map((score, index) => (
              <ScoreCard
                key={index}
                label={score.label}
                value={score.value}
                description={score.description}
              />
            ))}
          </div>
        </div>

        <div className="results-sidebar">
          <HighlightsCard highlights={highlights} />
          <MetricsCard metadata={metadata} />
        </div>
      </div>
    </div>
  );
};

export default Results;

