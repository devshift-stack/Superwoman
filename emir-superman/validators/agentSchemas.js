
const Joi = require('joi');

const registerAgentSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().required(),
  endpoint: Joi.string().uri().required(),
  capabilities: Joi.array().items(Joi.string()).required()
});

module.exports = {
  registerAgentSchema
};
