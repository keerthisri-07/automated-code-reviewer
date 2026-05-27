import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import CodeReviewer from './components/CodeReviewer';
import ReviewDetails from './components/ReviewDetails';

const API_BASE = 'http://localhost:5050/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reviews, setReviews] = useState([]);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch reviews on mount
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to fetch review history:', err);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this code review from history?')) return;
    try {
      const response = await fetch(`${API_BASE}/reviews/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        // Remove from local lists
        setReviews((prev) => prev.filter((r) => r._id !== id));
        if (selectedReviewId === id) {
          setSelectedReviewId(null);
          setSelectedReview(null);
          setActiveTab('dashboard');
        }
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  const handleStartReview = async ({ code, language, fileName }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, language, fileName })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || errData.message || 'Failed to analyze code.');
      }

      const newReview = await response.json();
      
      // Update history list and select new review
      setReviews((prev) => [
        {
          _id: newReview._id,
          fileName: newReview.fileName,
          language: newReview.language,
          metrics: newReview.metrics,
          complexityAnalysis: newReview.complexityAnalysis,
          createdAt: newReview.createdAt
        },
        ...prev
      ]);
      
      setSelectedReview(newReview);
      setSelectedReviewId(newReview._id);
      setIsLoading(false);
      setActiveTab('review_detail');

    } catch (err) {
      setIsLoading(false);
      setError(err.message);
    }
  };

  const handleSelectReview = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/reviews/${id}`);
      if (!response.ok) {
        throw new Error('Failed to load review details.');
      }
      const data = await response.json();
      setSelectedReview(data);
      setSelectedReviewId(id);
      setIsLoading(false);
      setActiveTab('review_detail');
    } catch (err) {
      setIsLoading(false);
      alert(err.message);
    }
  };

  const handleNavigation = (tab, id = null) => {
    setActiveTab(tab);
    if (tab === 'review_detail' && id) {
      handleSelectReview(id);
    } else if (tab === 'dashboard') {
      setSelectedReviewId(null);
      setSelectedReview(null);
      fetchReviews(); // Refresh stats/recent entries
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Panel */}
      <aside className="sidebar">
        <div className="logo-container" onClick={() => handleNavigation('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16.5 9.4 7.55 4.24a1.79 1.79 0 0 0-2.5 1.53v12.46a1.79 1.79 0 0 0 2.5 1.53L16.5 14.6a1.79 1.79 0 0 0 0-3.2Z"></path>
            </svg>
          </div>
          <span className="logo-text">Reviewer AI</span>
        </div>

        <nav className="sidebar-nav">
          <div
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavigation('dashboard')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Dashboard
          </div>

          <div
            className={`nav-item ${activeTab === 'new_review' ? 'active' : ''}`}
            onClick={() => handleNavigation('new_review')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Review Code
          </div>
        </nav>

        {/* Sidebar History tracker */}
        <div className="history-section">
          <div className="history-title">Audits Log</div>
          {reviews.length === 0 ? (
            <div style={{ color: 'var(--text-dark)', fontSize: '0.8rem', padding: '0.5rem' }}>
              Empty Log
            </div>
          ) : (
            <div className="history-list">
              {reviews.slice(0, 10).map((rev) => {
                const score = rev.metrics?.qualityScore || 80;
                let scoreClass = 'high';
                if (score < 60) scoreClass = 'low';
                else if (score < 80) scoreClass = 'med';

                return (
                  <div
                    key={rev._id}
                    className={`history-item ${selectedReviewId === rev._id ? 'active' : ''}`}
                    onClick={() => handleNavigation('review_detail', rev._id)}
                    style={{
                      borderColor: selectedReviewId === rev._id ? 'rgba(138, 43, 226, 0.4)' : 'rgba(255, 255, 255, 0.04)',
                      background: selectedReviewId === rev._id ? 'rgba(138, 43, 226, 0.08)' : 'rgba(255, 255, 255, 0.02)'
                    }}
                  >
                    <div className="history-item-header">
                      <span className="history-item-name">{rev.fileName}</span>
                      <span className="history-item-lang">{rev.language}</span>
                    </div>
                    <div className="history-item-footer">
                      <span>Quality score</span>
                      <span className={`history-item-score ${scoreClass}`}>{score}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            reviews={reviews}
            onNavigate={handleNavigation}
            onDeleteReview={handleDeleteReview}
          />
        )}

        {activeTab === 'new_review' && (
          <CodeReviewer
            onStartReview={handleStartReview}
            isLoading={isLoading}
            error={error}
          />
        )}

        {activeTab === 'review_detail' && (
          <ReviewDetails
            review={selectedReview}
            onBack={() => handleNavigation('dashboard')}
          />
        )}
      </main>
    </div>
  );
}
