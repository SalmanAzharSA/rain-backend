const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi); // Adding ObjectId validation if needed
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
        .max(10)
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
      poolTypeData: Joi.object().required(),
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
};
