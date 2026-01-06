const express = require('express');
const router = express.Router();
const pollController = require('../controllers/poll.controller');

router.post('/', pollController.createPoll.bind(pollController));
router.get('/active', pollController.getActivePoll.bind(pollController));
router.get('/state', pollController.getPollState.bind(pollController));
router.post('/:pollId/start', pollController.startPoll.bind(pollController));
router.post('/vote', pollController.submitVote.bind(pollController));
router.get('/:pollId/results', pollController.getPollResults.bind(pollController));
router.post('/:pollId/complete', pollController.completePoll.bind(pollController));

module.exports = router;

