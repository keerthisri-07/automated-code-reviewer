const Groq = require('groq-sdk');
const { wrapSDK } = require('langsmith/wrappers');

// Initialize Groq client
const rawGroq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Wrap the client for automatic LangSmith tracing (requires LANGSMITH_TRACING=true in .env)
const groq = wrapSDK(rawGroq);

/**
 * Analyzes code using Groq LLM (Llama-3-70b) and traces to LangSmith.
 * @param {string} code - The source code to analyze.
 * @param {string} language - The programming language.
 * @param {string} fileName - The name of the file.
 * @returns {Promise<Object>} The structured code review results.
 */
async function analyzeCode(code, language, fileName = 'untitled.txt') {
  const systemPrompt = `You are an elite Senior Staff Software Engineer, Technical Architect, and expert Code Reviewer.
Your task is to analyze the user's uploaded code and provide a comprehensive, intelligent, and highly structured review.
You must return a valid, parsable JSON object exactly matching the schema below. Do not output any commentary, conversational text, or Markdown backticks outside the JSON.

JSON Schema to return:
{
  "metrics": {
    "qualityScore": 85, // Integer 0-100 reflecting readability, standards compliance, and structure
    "securityScore": 90, // Integer 0-100 reflecting vulnerability density (100 = highly secure)
    "performanceScore": 80, // Integer 0-100 reflecting algorithmic efficiency, resource usage
    "complexityScore": 75 // Integer 0-100 reflecting logical density (100 = very clean/simple, 0 = highly complex/spaghetti)
  },
  "complexityAnalysis": {
    "cyclomaticComplexity": "Low" | "Medium" | "High",
    "maintainabilityIndex": 82, // Integer 0-100 rating how easy the code is to maintain
    "linesOfCode": 142, // Total number of lines in the provided code
    "commentRatio": 15, // Percent of code lines that are comments (0-100)
    "explanation": "Beginner-friendly explanation of the code's complexity, architectural pattern, and structural qualities."
  },
  "comments": [
    {
      "line": 12, // 1-indexed integer line number in the original code where the issue resides. MUST be a valid line number in the code!
      "category": "Bug" | "Security" | "Style" | "Performance" | "Best Practice" | "Complexity",
      "severity": "High" | "Medium" | "Low" | "Info",
      "title": "Short title describing the issue",
      "message": "Detailed review comment explaining the issue and standard best practices.",
      "explanation": "Beginner-friendly, educational explanation of WHY this is an issue and the theory behind it.",
      "suggestion": "Corrected code snippet for this specific issue (or empty string if none needed)"
    }
  ],
  "fixedCode": "Full complete source code with all comments addressed, refactored, and optimized. It should be a drop-in replacement, fully functional and correctly formatted. DO NOT truncate this."
}

CRITICAL RULES:
1. Ensure the "line" property of each comment is an actual, correct 1-indexed line number in the original code. Do not hallucinate line numbers.
2. The "fixedCode" MUST be the complete code, fully working, and beautifully structured.
3. Keep the "explanation" for comments and complexity highly educational and beginner-friendly, avoiding overly dense jargon where simple analogies can work.
4. If there are no issues, keep "comments" empty, and return high scores. But be thorough and look for micro-optimizations, missing docstrings, proper type declarations, and security precautions.`;

  const userPrompt = `Language: ${language}
File Name: ${fileName}

Source Code:
\`\`\`
${code}
\`\`\``;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1, // low temperature for precise JSON generation and reasoning
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    let parsedResult;

    try {
      parsedResult = JSON.parse(content);
    } catch (parseErr) {
      console.error("Direct JSON parse failed. Attempting cleanup...", parseErr);
      // Fallback cleaner for any potential extra text wrapper
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        parsedResult = JSON.parse(content.substring(jsonStart, jsonEnd + 1));
      } else {
        throw new Error("Unable to locate valid JSON boundaries in LLM response.");
      }
    }

    // Double check and sanitize output structures
    if (!parsedResult.metrics) parsedResult.metrics = { qualityScore: 80, securityScore: 80, performanceScore: 80, complexityScore: 80 };
    if (!parsedResult.complexityAnalysis) {
      parsedResult.complexityAnalysis = {
        cyclomaticComplexity: 'Medium',
        maintainabilityIndex: 75,
        linesOfCode: code.split('\n').length,
        commentRatio: 10,
        explanation: 'Detailed complexity analysis could not be generated. Please review lines of code and structure.'
      };
    }
    if (!parsedResult.comments) parsedResult.comments = [];
    if (!parsedResult.fixedCode) parsedResult.fixedCode = code;

    return parsedResult;

  } catch (error) {
    console.error("Groq AI Analysis Service Error:", error);
    throw error;
  }
}

module.exports = {
  analyzeCode
};
