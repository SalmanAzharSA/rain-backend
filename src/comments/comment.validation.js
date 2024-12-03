const Joi = require("joi");

module.exports = {
  createComment: {
    body: Joi.object({
      poolId: Joi.string().required(),
      parentCommentId: Joi.string().optional(),
      comment: Joi.string().required(),
    }),
  },

  updateComment: {
    params: Joi.object({
      commentId: Joi.string().required(),
    }),

    body: Joi.object({
      //   poolId: Joi.string().required(),
      //   commentId: Joi.string().required(),
      comment: Joi.string().required(),
    }),
  },
  commentsListing: {
    query: Joi.object({
      // poolId: Joi.string().hex().length(24).optional(),
      poolId: Joi.string().optional(),
      limit: Joi.number().integer().min(1).optional(),
      offset: Joi.number().integer().min(0).optional(),
    }),
  },

  likeUnlikeComment: {
    params: Joi.object({
      commentId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
          "string.pattern.base": "Invalid commentId format",
          "any.required": "commentId is required",
        }),
    }),
  },
};
