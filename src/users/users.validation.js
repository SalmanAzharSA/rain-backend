const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

module.exports = {
  usersList: {
    query: Joi.object({
      limit: Joi.number().positive().required(),
      offset: Joi.number().positive().required(),
    }),
  },

  getUser: {
    query: Joi.object({
      walletAddress: Joi.string().required(),
    }),

    query: Joi.object({
      walletAddress: Joi.string()
        .trim()
        .required()
        .regex(/^0x[a-fA-F0-9]{40}$/) // Ethereum address format validation
        .message("Invalid Ethereum wallet address format")
        .label("Wallet Address"), // Optional label for clearer error messages

      // name: Joi.string().required(),
      // sign: Joi.string().required(),
      // bio: Joi.string().optional(),
      // object: Joi.object({
      //   address: Joi.string().required(),
      //   name: Joi.string().required(),
      // }).required(),
    }),
  },
};
