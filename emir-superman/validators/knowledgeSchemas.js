
const Joi = require('joi');

const searchKnowledgeSchema = Joi.object({
  query: Joi.string().required(),
  options: Joi.object()
});

const storeKnowledgeSchema = Joi.object({
  text: Joi.string().required(),
  source: Joi.string().required(),
  metadata: Joi.object()
});

const verifyKnowledgeSchema = Joi.object({
  notes: Joi.string().allow('')
});

module.exports = {
  searchKnowledgeSchema,
  storeKnowledgeSchema,
  verifyKnowledgeSchema
};
