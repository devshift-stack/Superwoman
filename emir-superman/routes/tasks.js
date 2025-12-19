
const express = require('express');
const router = express.Router();
const validationMiddleware = require('../middleware/validationMiddleware');
const { createTaskSchema } = require('../validators/taskSchemas');

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: The created task ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 taskId: 
 *                   type: string
 *                   description: The ID of the created task.
 *                 status:
 *                   type: string
 *                   description: The status of the task.
 *                   example: queued
 */
router.post('/', validationMiddleware(createTaskSchema), async (req, res, next) => {
  try {
    const taskId = await req.app.get('supervisor').addTask(req.body);
    res.json({ taskId, status: 'queued' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tasks/{taskId}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: The task ID
 *     responses:
 *       200:
 *         description: The task details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */
router.get('/:taskId', async (req, res, next) => {
  try {
    const task = req.app.get('supervisor').activeTasks.get(req.params.taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task nicht gefunden' });
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
