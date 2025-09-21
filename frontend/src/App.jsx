import React, { useState } from 'react';
import Header from './components/Header';
import AnalysisForm from './components/AnalysisForm';
import Results from './components/Results';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import './App.css';

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalysis = async (repoUrl) => {
    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch(`/api/analyze?repo=${encodeURIComponent(repoUrl)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="app">      
      <main className="main-content">
        <div className="container">
          <div className="hero-section">
            <h1 className="hero-title">
              LOL Vibe Coder?
            </h1>
            <p className="hero-subtitle">
              Detect if your GitHub repository is "vibe-coded" (AI-generated) or human-written
            </p>
          </div>

          <AnalysisForm 
            onAnalyze={handleAnalysis} 
            onReset={handleReset}
            disabled={loading}
          />

          {loading && <LoadingSpinner />}
          
          {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}
          
          {analysisResult && (
            <Results 
              result={analysisResult} 
              onNewAnalysis={handleReset}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;