
const Joi = require('joi');

const createTaskSchema = Joi.object({
  type: Joi.string().required(),
  payload: Joi.object().required(),
  sessionId: Joi.string().uuid(),
  priority: Joi.number().integer().min(1).max(5).default(3)
});

module.exports = {
  createTaskSchema
};
