const Joi = require("joi");

// Custom regex for Ethereum address validation (checks for a valid address format)
const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;

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

  loginValidation: {
    body: Joi.object({
      sign: Joi.string().trim().required().messages({
        "string.empty": "Signature is required",
        "any.required": "Signature is required",
      }),
      object: Joi.object({
        address: Joi.string().pattern(ethAddressRegex).required().messages({
          "string.empty": "Wallet address is required",
          "string.pattern.base": "Invalid Ethereum address format",
        }),
        message: Joi.string().required().messages({
          "string.empty": "Message is required",
        }),
      })
        .required()
        .messages({
          "object.base":
            "Object must be a valid JSON containing address and message",
        }),
    }),
  },
};
