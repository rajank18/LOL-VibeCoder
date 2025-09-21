import React from 'react';

const HighlightsCard = ({ highlights }) => {
  if (!highlights || highlights.length === 0) {
    return (
      <div className="highlights-card">
        <h4>Analysis Highlights</h4>
        <p className="no-highlights">No highlights available</p>
      </div>
    );
  }

  const getHighlightIcon = (highlight) => {
    if (highlight.toLowerCase().includes('ai') || highlight.toLowerCase().includes('generic')) {
      return '🤖';
    }
    if (highlight.toLowerCase().includes('test')) {
      return '🧪';
    }
    if (highlight.toLowerCase().includes('readme') || highlight.toLowerCase().includes('documentation')) {
      return '📚';
    }
    if (highlight.toLowerCase().includes('perfect') || highlight.toLowerCase().includes('good')) {
      return '✨';
    }
    if (highlight.toLowerCase().includes('pattern')) {
      return '🔍';
    }
    return '📝';
  };

  const getHighlightType = (highlight) => {
    const text = highlight.toLowerCase();
    if (text.includes('ai') || text.includes('generic') || text.includes('boilerplate')) {
      return 'highlight-ai';
    }
    if (text.includes('test') || text.includes('readme') || text.includes('documentation')) {
      return 'highlight-positive';
    }
    if (text.includes('missing') || text.includes('no')) {
      return 'highlight-negative';
    }
    return 'highlight-neutral';
  };

  return (
    <div className="highlights-card">
      <h4>Analysis Highlights</h4>
      
      <div className="highlights-list">
        {highlights.map((highlight, index) => (
          <div key={index} className={`highlight-item ${getHighlightType(highlight)}`}>
            <span className="highlight-icon">{getHighlightIcon(highlight)}</span>
            <span className="highlight-text">{highlight}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HighlightsCard;
