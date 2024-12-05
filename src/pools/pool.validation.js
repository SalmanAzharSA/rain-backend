const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const { StatusCodes } = require("http-status-codes");
const createError = require("http-errors");

const allowedTags = [
  "SPORTS",
  "POLITICS",
  "MOVIES",
  "MUSIC",
  "SCIENCE",
  "CRYPTO",
  "BUSINESS",
  "EDUCATION",
];

// Custom Joi validator to check if a tag is in the allowedTags list (case-insensitive)
const allowedTagsValidator = (value, helpers) => {
  const upperCaseValue = Array.isArray(value)
    ? value.map((tag) => tag.toUpperCase())
    : value.toUpperCase();

  if (Array.isArray(upperCaseValue)) {
    const invalidTags = upperCaseValue.filter(
      (tag) => !allowedTags.includes(tag)
    );
    if (invalidTags.length > 0) {
      return helpers.message(
        `Tags must be one of the following: ${allowedTags.join(", ")}`
      );
    }
  } else if (!allowedTags.includes(upperCaseValue)) {
    return helpers.message(
      `Tag must be one of the following: ${allowedTags.join(", ")}`
    );
  }

  return upperCaseValue; // Return the valid tags in uppercase
};

module.exports = {
  createPool: {
    body: Joi.object({
      poolTrxHash: Joi.string().required(),
      contractAddress: Joi.string().required(),
      question: Joi.string().required(),
      questionImage: Joi.string().required(),
      isPrivate: Joi.boolean().required(),
      options: Joi.array()
        .items(
          Joi.object({
            optionName: Joi.string().required(),
            optionImage: Joi.string().uri().optional(),
          })
        )
        .min(2)
        // .max(10)
        .required(),
      startDate: Joi.date()
        .iso()
        .required()
        .error(
          new Error(
            '"startDate" is required and must be a valid date in ISO format'
          )
        ),
      liquidityMax: Joi.number().required(),
      poolTypeData: Joi.object().optional(),
      //     tags: Joi.alternatives().try(
      //       Joi.string()
      //         .Joi.string()
      //         .max(100),
      //       Joi.array()
      //         .items(
      //           Joi.string()
      //             .max(100)
      //         )
      //         .max(8)
      //     ).   .optional(),
      //   }),
      tags: Joi.alternatives()
        .try(
          Joi.string().max(100).custom(allowedTagsValidator), // Single tag
          Joi.array()
            .items(Joi.string().max(100).custom(allowedTagsValidator))
            .max(8) // Multiple tags, max 8
        )
        .optional(),
    }),
  },

  poolList: {
    query: Joi.object({
      limit: Joi.number().integer(),
      offset: Joi.number().integer(),
      // search: Joi.string().optional(),
      tag: Joi.string().optional(),

      //   sortBy: Joi.string().valid("createdAt", "title"),
      // sortOrder: Joi.string().valid("asc", "desc").default("desc"),
    }),
  },

  publicPool: {
    query: Joi.object({
      limit: Joi.number().integer(),
      offset: Joi.number().integer(),
      // search: Joi.string().optional(),
      // sortBy: Joi.string().valid("createdAt", "title").default("createdAt"),
      // sortOrder: Joi.string().valid("asc", "desc").default("desc"),
    }),
  },

  getPoolById: {
    params: Joi.object({
      id: Joi.objectId().required().messages({
        "any.required": "Pool ID is required",
        "string.pattern.base": "Invalid Pool ID format",
      }),
    }),
  },

  accessCodeValidation: {
    body: Joi.object({
      poolId: Joi.string().hex().required(),
      accessCode: Joi.string().length(8).required(), // Access code length
    }),
  },

  poolListingByCreator: {
    query: Joi.object({
      limit: Joi.number().integer().optional(),
      offset: Joi.number().integer().optional(),
      filter: Joi.string().valid("privatePools", "publicPools").optional(),
    }),
  },

  signParticipationTransaction: {
    body: Joi.object({
      walletAddress: Joi.string()
        .pattern(/^0x[a-fA-F0-9]{40}$/)
        .required(),
      // option: Joi.string().valid("1", "2", "3", "4").required(),
      option: Joi.number().required(),

      amount: Joi.number().positive().required(), // Amount in USDT
      timestamp: Joi.number().integer().positive().required(), // Epoch timestamp
    }),
  },

  swapTransaction: {
    body: Joi.object({
      walletAddress: Joi.string()
        .pattern(/^0x[a-fA-F0-9]{40}$/)
        .required(),
      optionFrom: Joi.string().required(),
      optionTo: Joi.string().required(),
      amountToSwap: Joi.number().positive().required(),
      timestamp: Joi.number().integer().positive().required(),
    }),
  },

  signAddLiquidity: {
    body: Joi.object({
      walletAddress: Joi.string()
        .pattern(/^0x[a-fA-F0-9]{40}$/)
        .required()
        .messages({
          "string.pattern.base":
            "walletAddress must be a valid Ethereum address.",
        }),
      totalAmount: Joi.number().positive().required().messages({
        "number.base": "totalAmount must be a number.",
        "number.positive": "totalAmount must be greater than zero.",
      }),
      timestamp: Joi.number().integer().positive().required().messages({
        "number.base": "timestamp must be a valid integer.",
        "number.positive": "timestamp must be a positive value.",
      }),
    }),
  },

  declareWinner: {
    params: Joi.object({
      poolId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
          "string.pattern.base": "Invalid poolId format",
          "any.required": "poolId is required",
        }),
    }),
    body: Joi.object({
      winnerOption: Joi.object({
        choiceIndex: Joi.number().integer().required().messages({
          "any.required": "choiceIndex is required",
          "number.base": "choiceIndex must be a number",
        }),
      })
        .required()
        .messages({
          "any.required": "winnerOption is required",
        }),
    }),
  },
};
