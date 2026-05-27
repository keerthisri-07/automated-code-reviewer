const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  line: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['Bug', 'Security', 'Style', 'Performance', 'Best Practice', 'Complexity'],
    required: true
  },
  severity: {
    type: String,
    enum: ['High', 'Medium', 'Low', 'Info'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  suggestion: {
    type: String,
    default: ''
  }
});

const ReviewSchema = new mongoose.Schema({
  fileName: {
    type: String,
    default: 'untitled.txt'
  },
  language: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  fixedCode: {
    type: String,
    default: ''
  },
  metrics: {
    qualityScore: { type: Number, default: 100 },
    securityScore: { type: Number, default: 100 },
    performanceScore: { type: Number, default: 100 },
    complexityScore: { type: Number, default: 100 }
  },
  complexityAnalysis: {
    cyclomaticComplexity: { type: String, default: 'Low' },
    maintainabilityIndex: { type: Number, default: 100 },
    linesOfCode: { type: Number, default: 0 },
    commentRatio: { type: Number, default: 0 },
    explanation: { type: String, default: '' }
  },
  comments: [CommentSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
