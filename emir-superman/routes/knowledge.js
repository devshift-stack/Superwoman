const express = require('express');
const router = express.Router();
const validationMiddleware = require('../middleware/validationMiddleware');
const { searchKnowledgeSchema, storeKnowledgeSchema, verifyKnowledgeSchema } = require('../validators/knowledgeSchemas');

/**
 * @swagger
 * /api/knowledge/search:
 *   post:
 *     summary: Search the knowledge base
 *     tags: [Knowledge]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/KnowledgeSearch'
 *     responses:
 *       200:
 *         description: Search results
 */
router.post('/search', validationMiddleware(searchKnowledgeSchema), async (req, res, next) => {
  try {
    const { query, options = {} } = req.body;
    const results = await req.app.get('supervisor').searchKnowledge(query, options);
    res.json(results);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/knowledge/store:
 *   post:
 *     summary: Store knowledge
 *     tags: [Knowledge]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/KnowledgeStore'
 *     responses:
 *       200:
 *         description: Confirmation of storage
 */
router.post('/store', validationMiddleware(storeKnowledgeSchema), async (req, res, next) => {
  try {
    const { text, source, metadata = {} } = req.body;
    const id = await req.app.get('supervisor').storeResearch(text, source, metadata);
    res.json({ id, status: 'stored' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/knowledge/verify/{id}:
 *   post:
 *     summary: Verify a piece of knowledge
 *     tags: [Knowledge]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the knowledge to verify
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/KnowledgeVerify'
 *     responses:
 *       200:
 *         description: The verification result
 */
router.post('/verify/:id', validationMiddleware(verifyKnowledgeSchema), async (req, res, next) => {
  try {
    const { notes = '' } = req.body;
    const verified = await req.app.get('supervisor').verifyKnowledge(req.params.id, notes);
    res.json({ verified, id: req.params.id });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/knowledge/stats:
 *   get:
 *     summary: Get statistics about the knowledge base
 *     tags: [Knowledge]
 *     responses:
 *       200:
 *         description: Knowledge base statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await req.app.get('supervisor').knowledgeBase.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
