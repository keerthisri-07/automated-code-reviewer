import React, { useState, useEffect } from 'react';

const LANGUAGES = [
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'c', label: 'C' },
  { id: 'c++', label: 'C++' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'react', label: 'React (JSX)' },
  { id: 'node.js', label: 'Node.js' }
];

const ANALYZING_MESSAGES = [
  'Reading codebase structure...',
  'Parsing abstract syntax tree...',
  'Inspecting PEP8 & styling standards...',
  'Validating thread safety and memory leaks...',
  'Checking OWASP security vulnerabilities...',
  'Analyzing cyclomatic code complexity...',
  'Generating refactored code snippets...',
  'Finalizing senior reviewer review cards...'
];

export default function CodeReviewer({ onStartReview, isLoading, error }) {
  const [language, setLanguage] = useState('javascript');
  const [fileName, setFileName] = useState('');
  const [code, setCode] = useState('');
  const [activeMessageIndex, setActiveMessageIndex] = useState(0);

  // Cycle messages during loading state
  useEffect(() => {
    let interval;
    if (isLoading) {
      setActiveMessageIndex(0);
      interval = setInterval(() => {
        setActiveMessageIndex((prev) => (prev + 1) % ANALYZING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Handle local file uploads
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    
    // Auto-detect language by file extension
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'py') setLanguage('python');
    else if (ext === 'java') setLanguage('java');
    else if (ext === 'c') setLanguage('c');
    else if (ext === 'cpp' || ext === 'h') setLanguage('c++');
    else if (ext === 'js' || ext === 'mjs') setLanguage('javascript');
    else if (ext === 'jsx' || ext === 'tsx') setLanguage('react');
    else if (ext === 'json') setLanguage('javascript');

    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    onStartReview({
      code,
      language,
      fileName: fileName.trim() || `code.${language === 'python' ? 'py' : language === 'java' ? 'java' : 'js'}`
    });
  };

  if (isLoading) {
    return (
      <div className="glass loading-panel" style={{ maxWidth: '700px', margin: '3rem auto' }}>
        <div className="spinner-container">
          <div className="spinner-outer"></div>
          <div className="spinner-inner"></div>
        </div>
        <div>
          <h2 className="loading-text">{ANALYZING_MESSAGES[activeMessageIndex]}</h2>
          <p className="loading-subtext" style={{ marginTop: '0.5rem' }}>
            This will take a few seconds as the Groq model runs full code diagnostics and generates complexity charts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass reviewer-card">
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center' }}>
        Create a New Code Review
      </h2>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: 'var(--color-danger)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          <strong>Review failed: </strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Programming Language</label>
            <select
              className="form-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">File Name (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. auth-middleware.js"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>
        </div>

        {/* Drag and Drop / File upload zone */}
        <div className="form-group">
          <label className="form-label">Upload Code File</label>
          <div className="drag-drop-zone" onClick={() => document.getElementById('code-file-picker').click()}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Click to select or upload a local file to populate the code panel below
            </p>
            <input
              id="code-file-picker"
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept=".py,.java,.c,.cpp,.h,.js,.jsx,.ts,.tsx,.json,.css,.html"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Paste Source Code</label>
          <textarea
            className="form-textarea"
            required
            placeholder={`// Paste your source code here...\n\nfunction validateSession(user) {\n  if (user.role == "admin") { // Replace strict equality\n    return true;\n  }\n}`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          ></textarea>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <button type="submit" className="btn-primary" disabled={!code.trim()}>
            Submit Code for Review
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="22 2 15 22 11 13 2 9 22 2"></polyline>
              <line x1="22" y1="2" x2="11" y2="13"></line>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
