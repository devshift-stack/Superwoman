
const express = require('express');
const router = express.Router();
const validationMiddleware = require('../middleware/validationMiddleware');
const { createSessionSchema } = require('../validators/sessionSchemas');

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: Create a new session
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Session'
 *     responses:
 *       200:
 *         description: The created session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 */
router.post('/', validationMiddleware(createSessionSchema), async (req, res, next) => {
  try {
    const { userId, metadata } = req.body;
    const session = await req.app.get('supervisor').createSession(userId, metadata);
    res.json(session);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/sessions/{sessionId}:
 *   get:
 *     summary: Get a session by ID
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         schema:
 *           type: string
 *         required: true
 *         description: The session ID
 *     responses:
 *       200:
 *         description: The session details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       404:
 *         description: Session not found
 */
router.get('/:sessionId', async (req, res, next) => {
  try {
    const session = await req.app.get('supervisor').getSession(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session nicht gefunden' });
    }
    res.json(session);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
