
const Joi = require('joi');

const createSessionSchema = Joi.object({
  userId: Joi.string().required(),
  metadata: Joi.object()
});

module.exports = {
  createSessionSchema
};
