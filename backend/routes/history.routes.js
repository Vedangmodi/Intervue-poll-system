const express = require('express');
const router = express.Router();
const pollService = require('../services/poll.service');

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = await pollService.getPollHistory(limit);
    res.json({ history: history || [] });
  } catch (error) {
    console.error('Error in history route:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch poll history' });
  }
});

module.exports = router;


