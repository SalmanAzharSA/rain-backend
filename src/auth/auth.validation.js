const Joi = require("joi");

module.exports = {
  signin: {
    body: Joi.object({
      userName: Joi.string().trim().required(),
      password: Joi.string().trim().required(),
    }),
  },

  registerwithWalletAddress: {
    body: Joi.object({
      walletAddress: Joi.string().trim().required(),
      name: Joi.string().required(),
      sign: Joi.string().required(),
      bio: Joi.string().optional(),
      object: Joi.object({
        address: Joi.string().required(),
        name: Joi.string().required(),
      }).required(),

    }),
  },
};
