const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const { StatusCodes } = require("http-status-codes");
const createError = require("http-errors");
module.exports = {
  usersList: {
    query: Joi.object({
      limit: Joi.number().positive().required(),
      offset: Joi.number().positive().required(),
    }),
  },
};
