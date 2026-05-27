# Automated Code Reviewer

An intelligent, professional senior software engineer and code review assistant. Analyze your source code and receive detailed, inline critiques reminiscent of GitHub Pull Request reviews.

## Key Features

1. **GitHub PR-Style Reviews**: Review code line-by-line with interactive, collapsible diagnostic cards.
2. **Multi-Dimensional Metrics**: Visualized gauges assessing Code Quality, Security Vulnerabilities, Performance Speed, and Complexity.
3. **Complexity & Diagnostics**: Displays Cyclomatic Complexity, Maintainability Index, Comment Ratios, and architectural breakdowns.
4. **Code Optimizer Diff**: Interactive side-by-side comparison comparing original files and refactored versions with one-click clipboard copying.
5. **Multi-Language Support**: Optimized prompts for Python, Java, C, C++, JavaScript, React (JSX), and Node.js.
6. **LangSmith Tracing**: Completely integrates LangSmith wrapper logic to monitor and optimize LLM payloads.
7. **Persistent Audits Log**: Saves analysis logs to MongoDB for historic comparisons.

---

## Architecture & Technology Stack

- **Frontend Client**: React.js, Vite, Vanilla HSL CSS (Modern dark glassmorphism).
- **Backend API**: Node.js, Express.js.
- **Database**: MongoDB Atlas.
- **LLM Orchestration**: Groq API (`llama-3.3-70b-versatile`) with LangSmith wrapping.

---

## Getting Started

### 1. Prerequisite Variables
Create a `.env` file inside the `backend` directory matching the schema in `backend/.env.example`:

```env
PORT=5050
MONGO_URI=your_mongodb_atlas_url
GROQ_API_KEY=your_groq_api_key

# LangSmith tracing (optional)
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=your_langsmith_api_key
LANGSMITH_PROJECT=tracker
```

### 2. Install & Start Backend Server
```bash
cd backend
npm install
npm run dev
```

### 3. Install & Start Frontend Client
```bash
cd frontend
npm install
npm run dev
```

The app will launch locally at **http://localhost:5173/** and connect to the backend server running on port **5050**.
