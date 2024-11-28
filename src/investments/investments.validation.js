const Joi = require('joi');

module.exports = {
    createInvestment: {
        body: Joi.object({
            poolId: Joi.string().required(),
            investments: Joi.array().items(
                Joi.object({
                    option: Joi.string().required(),
                    amount: Joi.number().min(0).required(),
                })
            ).required(),
        }),
    },
};
