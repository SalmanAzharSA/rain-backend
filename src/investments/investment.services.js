const Investment = require('./investment.model');
const Pool = require('../pools/pool.model'); // Assuming the Pool model exists
const createError = require('http-errors');

// Get all investments by the user (summary)
exports.getUserInvestments = async (userId) => {
    try {
        const investments = await Investment.find({ user: userId })
            .populate('pool', 'title')
            .lean();

        const totalInvestments = investments.reduce((acc, investment) => acc + investment.totalInvestment, 0);

        return { totalInvestments, investments };
    } catch (error) {
        throw createError(500, 'Error fetching user investments: ' + error.message);
    }
};

// Get detailed investments for a specific pool
exports.getInvestmentDetailsByPool = async (userId, poolId) => {
    try {
        const investment = await Investment.findOne({ user: userId, pool: poolId })
            .populate('pool', 'title')
            .lean();

        if (!investment) {
            throw createError(404, 'No investment found for this pool');
        }

        return investment;
    } catch (error) {
        throw createError(500, 'Error fetching investment details: ' + error.message);
    }
};
