const voteService = require('./vote.services');
const { StatusCodes } = require('http-status-codes');

const investmentService = require('../investments/investment.services');
const createError = require('http-errors');

// API to handle both investment and vote in a single request
exports.investAndVote = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { poolId, investments } = req.body;

        const investment = await voteService.investAndVote(userId, poolId, investments);


        res.status(StatusCodes.CREATED).json({
            statusCode: StatusCodes.CREATED,
            message: 'Investment and vote recorded successfully',
            data: investment,
        });
    } catch (ex) {
        next(ex);
    }
};

exports.calculateWinner = async (req, res, next) => {
    try {
        const { poolId } = req.params;
        const result = await voteService.calculateWinner(poolId);

        if (result.ex) throw result.ex;

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            message: "Winner calculated successfully",
            data: result.data,
        });
    } catch (ex) {
        next(ex);
    }
};
