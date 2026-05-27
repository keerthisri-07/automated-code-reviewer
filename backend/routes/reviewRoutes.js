const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { analyzeCode } = require('../services/aiService');

/**
 * @route   POST /api/reviews
 * @desc    Submit code for AI automated review and save details
 * @access  Public
 */
router.post('/', async (req, res) => {
  const { code, language, fileName } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'Please provide code and programming language.' });
  }

  try {
    // Run AI analysis
    const analysisResult = await analyzeCode(code, language, fileName);

    // Create and save review in database
    const review = new Review({
      fileName: fileName || 'untitled.txt',
      language,
      code,
      fixedCode: analysisResult.fixedCode,
      metrics: analysisResult.metrics,
      complexityAnalysis: {
        ...analysisResult.complexityAnalysis,
        linesOfCode: code.split('\n').length // Use actual lines of code count
      },
      comments: analysisResult.comments
    });

    const savedReview = await review.save();
    return res.status(201).json(savedReview);

  } catch (error) {
    console.error('Error creating code review:', error);
    return res.status(500).json({
      error: 'Failed to analyze code. Please check your API key, connection, or try again later.',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/reviews
 * @desc    Get all reviews (lightweight list with summary metrics)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find()
      .select('fileName language metrics complexityAnalysis.linesOfCode createdAt')
      .sort({ createdAt: -1 });
    return res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ error: 'Failed to fetch reviews history.' });
  }
});

/**
 * @route   GET /api/reviews/:id
 * @desc    Get a detailed review by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found.' });
    }
    return res.json(review);
  } catch (error) {
    console.error('Error fetching review detail:', error);
    return res.status(500).json({ error: 'Failed to fetch review detail.' });
  }
});

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found.' });
    }
    return res.json({ message: 'Review history deleted successfully.' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ error: 'Failed to delete review.' });
  }
});

module.exports = router;
