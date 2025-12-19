
const express = require('express');
const { handleChat } = require('../handlers/sessionHandler');

const router = express.Router();

// POST /api/v1/sessions/:sessionId/chat
router.post('/:sessionId/chat', handleChat);

module.exports = router;
