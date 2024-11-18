const Joi = require("joi");

module.exports = {
  signin: {
    body: Joi.object({
      userName: Joi.string().trim().required(),
      password: Joi.string().trim().required(),
    }),
  },
};
