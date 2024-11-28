const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi); // Adding ObjectId validation if needed
const { StatusCodes } = require("http-status-codes");
const createError = require("http-errors");

module.exports = {

    poolList: {
        query: Joi.object({
            limit: Joi.number().integer().min(1).default(10),
            offset: Joi.number().integer().min(1).default(1),
            search: Joi.string().optional(),
            sortBy: Joi.string().valid("createdAt", "title").default("createdAt"),
            sortOrder: Joi.string().valid("asc", "desc").default("desc"),
        }),
    },


    poolCreate: {
        body: Joi.object({
            title: Joi.string().min(3).max(100).required(),
            options: Joi.array().items(Joi.string().required()).min(2).required(),
            isPrivate: Joi.boolean().default(false),
        }),
    },
};
