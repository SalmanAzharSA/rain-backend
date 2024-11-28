const Investment = require('./investment.model');
const { StatusCodes } = require('http-status-codes');
const createError = require('http-errors');
const investmentService = require('./investment.services')

// Get all investments made by the user (summary of investments)
exports.getUserInvestments = async (req, res, next) => {
    try {
        const { userId } = req.user; // Assuming you are using JWT to authenticate the user

        const investments = await investmentService.getUserInvestments(userId);

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            message: 'User investments fetched successfully',
            data: investments,
        });
    } catch (error) {
        next(error);
    }
};

// Get detailed investment information for a specific pool by the user
exports.getInvestmentDetailsByPool = async (req, res, next) => {
    try {
        const { userId } = req.user; // Assuming you are using JWT to authenticate the user
        const { poolId } = req.params;

        const investmentDetails = await investmentService.getInvestmentDetailsByPool(userId, poolId);

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            message: 'User investment details fetched successfully',
            data: investmentDetails,
        });
    } catch (error) {
        next(error);
    }
};

