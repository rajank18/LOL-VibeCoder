// Simple test to verify components can be imported
import React from 'react';
import { createRoot } from 'react-dom/client';

// Test component imports
try {
  const Header = require('./components/Header').default;
  const AnalysisForm = require('./components/AnalysisForm').default;
  const Results = require('./components/Results').default;
  const VerdictCard = require('./components/VerdictCard').default;
  const ScoreCard = require('./components/ScoreCard').default;
  const MetricsCard = require('./components/MetricsCard').default;
  const HighlightsCard = require('./components/HighlightsCard').default;
  const LoadingSpinner = require('./components/LoadingSpinner').default;
  const ErrorMessage = require('./components/ErrorMessage').default;
  
  console.log('✅ All components imported successfully');
  
  // Test component rendering
  const testContainer = document.createElement('div');
  testContainer.id = 'test-root';
  document.body.appendChild(testContainer);
  
  const root = createRoot(testContainer);
  
  // Test with mock data
  const mockResult = {
    aiPatterns: 7,
    codeStructure: 6,
    documentation: 8,
    complexity: 5,
    overall: 6.5,
    isVibeCoded: true,
    verdict: "🤖 LIKELY AI-GENERATED - High probability of vibe-coding!",
    highlights: [
      "Generic naming patterns detected (5 files)",
      "Perfect formatting detected (6 files)",
      "AI-generated comment patterns (1 files)",
      "README present",
      "Test files found"
    ],
    metadata: {
      repo: "https://github.com/test/repo",
      processingTime: "2345ms",
      analyzedAt: "2024-01-15T12:00:00.000Z",
      metrics: {
        totalFiles: 1250,
        totalLines: 45000,
        commentsRatio: 0.15,
        hasReadme: true,
        hasTests: true
      }
    }
  };
  
  // Test VerdictCard
  root.render(React.createElement(VerdictCard, {
    verdict: mockResult.verdict,
    isVibeCoded: mockResult.isVibeCoded,
    overall: mockResult.overall
  }));
  
  console.log('✅ Components render successfully');
  
} catch (error) {
  console.error('❌ Component test failed:', error);
}

