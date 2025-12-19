
const express = require('express');
const router = express.Router();
const validationMiddleware = require('../middleware/validationMiddleware');
const { registerAgentSchema } = require('../validators/agentSchemas');

/**
 * @swagger
 * /api/agents/register:
 *   post:
 *     summary: Register a new agent
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Agent'
 *     responses:
 *       200:
 *         description: The registered agent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agent'
 */
router.post('/register', validationMiddleware(registerAgentSchema), async (req, res, next) => {
  try {
    const agent = await req.app.get('supervisor').registerAgent(req.body);
    res.json(agent);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/agents:
 *   get:
 *     summary: Get all registered agents
 *     tags: [Agents]
 *     responses:
 *       200:
 *         description: A list of agents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Agent'
 */
router.get('/', async (req, res, next) => {
  try {
    const agents = req.app.get('supervisor').agentRegistry.getAllAgents();
    res.json(agents);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
