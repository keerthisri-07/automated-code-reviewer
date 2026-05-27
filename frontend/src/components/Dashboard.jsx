import React from 'react';

export default function Dashboard({ reviews, onNavigate, onDeleteReview }) {
  // Compute dashboard metrics
  const totalReviews = reviews.length;
  
  const avgQualityScore = totalReviews > 0
    ? Math.round(reviews.reduce((acc, curr) => acc + (curr.metrics?.qualityScore || 0), 0) / totalReviews)
    : 0;

  const highestQualityScore = totalReviews > 0
    ? Math.max(...reviews.map(r => r.metrics?.qualityScore || 0))
    : 0;

  const totalLinesReviewed = totalReviews > 0
    ? reviews.reduce((acc, curr) => acc + (curr.complexityAnalysis?.linesOfCode || 0), 0)
    : 0;

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Automated Code Reviewer</h1>
        <p className="dashboard-subtitle">
          Act as a professional senior software engineer. Analyze source code and inspect detailed feedbacks.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="dashboard-stats">
        <div className="glass stat-card">
          <div className="stat-label">Total Code Reviews</div>
          <div className="stat-value">{totalReviews}</div>
        </div>
        <div className="glass stat-card">
          <div className="stat-label">Average Quality Score</div>
          <div className="stat-value">{avgQualityScore}%</div>
        </div>
        <div className="glass stat-card">
          <div className="stat-label">Highest Quality</div>
          <div className="stat-value">{highestQualityScore}%</div>
        </div>
        <div className="glass stat-card">
          <div className="stat-label">Total Lines Audited</div>
          <div className="stat-value">{totalLinesReviewed}</div>
        </div>
      </div>

      {/* Call to Action Box */}
      <div className="glass cta-box">
        <div className="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
        <h2 className="cta-title">Need a Professional Code Review?</h2>
        <p className="cta-desc">
          Paste your programming files or drag-and-drop your codebase modules. We'll verify standards, 
          inspect critical logical and security vulnerabilities, and generate refactored code snippets.
        </p>
        <button className="btn-primary" onClick={() => onNavigate('new_review')}>
          Start Code Review
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>

      {/* History List */}
      <div className="recent-reviews-section">
        <h2 className="history-title" style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Recent Audited Files</h2>
        {reviews.length === 0 ? (
          <div className="glass empty-placeholder">
            <div className="empty-icon">📁</div>
            <div className="empty-text">No review history yet</div>
            <p className="cta-desc">Submit your first code snippet to begin tracing code review logs.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {reviews.map((review) => {
              const score = review.metrics?.qualityScore || 80;
              let scoreClass = 'high';
              if (score < 60) scoreClass = 'low';
              else if (score < 80) scoreClass = 'med';

              return (
                <div key={review._id} className="glass history-item" style={{ cursor: 'default' }}>
                  <div className="history-item-header">
                    <span className="history-item-name" style={{ fontSize: '1rem', maxWidth: '180px' }}>
                      {review.fileName}
                    </span>
                    <span className="history-item-lang">{review.language}</span>
                  </div>
                  
                  <div style={{ margin: '1rem 0', display: 'flex', gap: '1rem' }}>
                    <div>
                      <div className="stat-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Quality</div>
                      <span className={`history-item-score ${scoreClass}`} style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                        {score}%
                      </span>
                    </div>
                    <div>
                      <div className="stat-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Security</div>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: (review.metrics?.securityScore || 80) >= 80 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {review.metrics?.securityScore || 100}%
                      </span>
                    </div>
                    <div>
                      <div className="stat-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Lines</div>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {review.complexityAnalysis?.linesOfCode || 0}
                      </span>
                    </div>
                  </div>

                  <div className="history-item-footer">
                    <span>{new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => onNavigate('review_detail', review._id)}>
                        Details
                      </button>
                      <button className="delete-btn" onClick={() => onDeleteReview(review._id)} title="Delete Review History">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
