import React, { useState } from 'react';

export default function ReviewDetails({ review, onBack }) {
  const [activeTab, setActiveTab] = useState('review');
  const [copied, setCopied] = useState(false);

  if (!review) return null;

  const { fileName, language, code, fixedCode, metrics, complexityAnalysis, comments, createdAt } = review;

  // Custom Gauge Ring calculations
  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;

  const renderGauge = (score = 100, title, description, colorClass) => {
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    // Choose text color based on score
    let scoreColor = 'var(--accent-primary)';
    if (colorClass === 'security') scoreColor = score >= 85 ? 'var(--color-success)' : score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)';
    if (colorClass === 'performance') scoreColor = 'var(--color-success)';
    if (colorClass === 'complexity') scoreColor = 'var(--accent-secondary)';

    return (
      <div className="glass metric-gauge-card">
        <div className="gauge-svg-container">
          <svg className="gauge-svg">
            <circle className="gauge-track" cx="60" cy="60" r={radius} />
            <circle
              className={`gauge-fill ${colorClass}`}
              cx="60"
              cy="60"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ strokeWidth }}
            />
          </svg>
          <div className="gauge-text" style={{ color: scoreColor }}>{score}%</div>
        </div>
        <span className="metric-title">{title}</span>
        <span className="metric-desc">{description}</span>
      </div>
    );
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(fixedCode || code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert raw code string to array of lines for parsing
  const codeLines = code.split('\n');

  return (
    <div className="review-detail-view">
      {/* Detail Header */}
      <div className="review-header">
        <div>
          <button className="btn-secondary" onClick={onBack} style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Dashboard
          </button>
          
          <h1 className="dashboard-title" style={{ fontSize: '2rem' }}>{fileName}</h1>
          <div className="review-meta">
            <span className="history-item-lang">{language}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Audited on {new Date(createdAt).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Gauges Grid */}
      <div className="metrics-grid">
        {renderGauge(metrics?.qualityScore, 'Code Quality', 'Styling & structure score', 'quality')}
        {renderGauge(metrics?.securityScore, 'Security Risk', 'Vulnerability index', 'security')}
        {renderGauge(metrics?.performanceScore, 'Performance', 'Efficiency rating', 'performance')}
        {renderGauge(metrics?.complexityScore, 'Complexity', 'Design simplicity score', 'complexity')}
      </div>

      {/* Tabs Layout */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'review' ? 'active' : ''}`}
          onClick={() => setActiveTab('review')}
        >
          Line-by-Line Review ({comments?.length || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'diff' ? 'active' : ''}`}
          onClick={() => setActiveTab('diff')}
        >
          Code Optimizer Diff
        </button>
        <button
          className={`tab-btn ${activeTab === 'education' ? 'active' : ''}`}
          onClick={() => setActiveTab('education')}
        >
          Complexity & Education
        </button>
      </div>

      {/* Tab 1: Line-by-Line GitHub style Review */}
      {activeTab === 'review' && (
        <div className="pr-container">
          <div className="pr-header">
            <span>Pull Request Review Mode</span>
            <span>{comments?.length || 0} issues identified</span>
          </div>

          <div style={{ display: 'grid' }}>
            {codeLines.map((lineText, index) => {
              const lineNumber = index + 1;
              // Check if any comments belong to this specific line
              const lineComments = comments?.filter(c => Number(c.line) === lineNumber) || [];

              return (
                <div key={lineNumber} className="pr-row">
                  <div className="pr-code-wrapper">
                    <span className="pr-line-num">{lineNumber}</span>
                    <span className="pr-line-code">{lineText || ' '}</span>
                  </div>

                  {/* Render inline comments directly underneath the matching code line! */}
                  {lineComments.map((comment, commentIdx) => (
                    <div
                      key={commentIdx}
                      className={`inline-comment-row ${comment.category?.toLowerCase().replace(' ', '')}`}
                    >
                      <div className="comment-card-header">
                        <div className="comment-badge-group">
                          <span className="badge category">{comment.category}</span>
                          <span className={`badge severity-${comment.severity?.toLowerCase()}`}>
                            {comment.severity} Priority
                          </span>
                        </div>
                      </div>

                      <h4 className="comment-title">{comment.title}</h4>
                      <p className="comment-message">{comment.message}</p>

                      <div className="comment-explanation-title">Beginner-Friendly Explanation</div>
                      <p className="comment-explanation">{comment.explanation}</p>

                      {comment.suggestion && (
                        <div className="comment-suggestion-box">
                          <div className="comment-suggestion-header">Recommended Snippet:</div>
                          <pre className="comment-suggestion-code">{comment.suggestion}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Side by Side Diff Optimizer */}
      {activeTab === 'diff' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button className="btn-primary" onClick={handleCopyCode} style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
              {copied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy Optimized Code
                </>
              )}
            </button>
          </div>

          <div className="diff-container">
            <div className="diff-column">
              <div className="diff-column-header">
                <span>Original Code</span>
                <span className="history-item-lang" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}>Original</span>
              </div>
              <pre className="diff-pre original">{code}</pre>
            </div>

            <div className="diff-column">
              <div className="diff-column-header">
                <span>Refactored & Cleaned Code</span>
                <span className="history-item-lang" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>Optimized</span>
              </div>
              <pre className="diff-pre fixed">{fixedCode || code}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Complexity & Educational Panel */}
      {activeTab === 'education' && (
        <div className="complexity-grid">
          {/* Complexity indicators */}
          <div className="glass complexity-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem' }}>
              Structural Diagnostics
            </h3>
            
            <div className="complexity-metric-item">
              <span className="complexity-metric-label">Cyclomatic Complexity</span>
              <span className="complexity-metric-val" style={{
                color: complexityAnalysis?.cyclomaticComplexity === 'Low' ? 'var(--color-success)' :
                       complexityAnalysis?.cyclomaticComplexity === 'Medium' ? 'var(--color-warning)' : 'var(--color-danger)'
              }}>
                {complexityAnalysis?.cyclomaticComplexity || 'Low'}
              </span>
            </div>

            <div className="complexity-metric-item">
              <span className="complexity-metric-label">Maintainability Index</span>
              <span className="complexity-metric-val" style={{
                color: (complexityAnalysis?.maintainabilityIndex || 80) >= 75 ? 'var(--color-success)' :
                       (complexityAnalysis?.maintainabilityIndex || 80) >= 50 ? 'var(--color-warning)' : 'var(--color-danger)'
              }}>
                {complexityAnalysis?.maintainabilityIndex || 100}/100
              </span>
            </div>

            <div className="complexity-metric-item">
              <span className="complexity-metric-label">Total Code Lines</span>
              <span className="complexity-metric-val">{complexityAnalysis?.linesOfCode || 0}</span>
            </div>

            <div className="complexity-metric-item">
              <span className="complexity-metric-label">Comment Ratio</span>
              <span className="complexity-metric-val">{complexityAnalysis?.commentRatio || 0}%</span>
            </div>
          </div>

          {/* Education Breakdown */}
          <div className="glass complexity-explanation-card">
            <h3 className="complexity-explanation-title">Code Structure & Logic Review</h3>
            <p className="complexity-explanation-text">
              {complexityAnalysis?.explanation || 'No architectural notes generated for this code snippet.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
