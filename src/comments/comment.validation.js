const Joi = require("joi");

module.exports = {
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
};
