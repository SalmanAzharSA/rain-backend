const Pool = require('../pools/pool.model');
const User = require('../users/users.model');
/*
// exports.vote = async (userId, poolId, option, result = {}) => {
//     try {
//         const pool = await Pool.findById(poolId);
//         if (!pool) {
//             throw new Error('Pool not found');
//         }

//         // Check if the user has already voted in the pool
//         const existingVote = pool.votes.find(vote => vote.user.toString() === userId.toString());
//         if (existingVote) {
//             throw new Error('You have already voted in this pool');
//         }

//         // Add new vote
//         pool.votes.push({ user: userId, option });
//         await pool.save();

//         result.data = pool;
//     } catch (ex) {
//         result.ex = ex;
//     } finally {
//         return result;
//     }
// };

// exports.calculateWinner = async (poolId, result = {}) => {
//     try {
//         const pool = await Pool.findById(poolId);
//         if (!pool) {
//             throw new Error('Pool not found');
//         }

//         if (pool.isPrivate) {
//             throw new Error('This pool is private. Only the admin can declare the winner');
//         }

//         // Aggregate vote counts
//         const voteCounts = pool.votes.reduce((acc, vote) => {
//             acc[vote.option] = (acc[vote.option] || 0) + 1;
//             return acc;
//         }, {});

//         // Find option with maximum votes
//         const winnerOption = Object.keys(voteCounts).reduce((maxOption, option) => {
//             return voteCounts[option] > (voteCounts[maxOption] || 0) ? option : maxOption;
//         }, null);

//         // Set winner in pool
//         pool.winner = winnerOption;
//         await pool.save();

//         result.data = pool;
//     } catch (ex) {
//         result.ex = ex;
//     } finally {
//         return result;
//     }
// };


// exports.investAndVote = async (userId, poolId, investments, result = {}) => {
//     try {
//         const pool = await Pool.findById(poolId);
//         if (!pool) {
//             throw new Error('Pool not found');
//         }

//         // Ensure the total investment by the user is positive and valid
//         const totalInvestment = investments.reduce((sum, investment) => sum + investment.amount, 0);
//         if (totalInvestment <= 0) {
//             throw new Error('Investment amount must be greater than zero');
//         }

//         // Find the existing vote record for the user
//         let userVote = pool.votes.find(vote => vote.user.toString() === userId.toString());

//         if (!userVote) {
//             // If the user hasn't voted yet, create a new entry for them
//             userVote = {
//                 user: userId,
//                 investments: []
//             };
//             pool.votes.push(userVote);
//         }

//         // Process the investments
//         investments.forEach(investment => {
//             // Check if the user has already invested in this option
//             const existingInvestment = userVote.investments.find(vote => vote.option === investment.option);

//             if (existingInvestment) {
//                 // If investment exists, reduce the amount from the existing option if needed
//                 existingInvestment.amount += investment.amount;
//             } else {
//                 // If no existing investment, add a new one for the option
//                 userVote.investments.push(investment);
//             }
//         });

//         // Save the updated pool and user investment
//         await pool.save();

//         result.data = pool;
//     } catch (ex) {
//         result.ex = ex;
//     } finally {
//         return result;
//     }
// };

*/

// Investment and voting action combined in one API


exports.investAndVote = async (req, res, next) => {
    try {
        const { userId } = req.user; // Get user ID from JWT
        const { poolId, investments } = req.body; // investments would be an array of { option, amount }

        // Fetch the pool to check if it exists
        const pool = await Pool.findById(poolId);
        if (!pool) {
            throw createError(StatusCodes.NOT_FOUND, 'Pool not found');
        }

        // Create or update the investment with vote information
        let investment = await Investment.findOne({ user: userId, pool: poolId });

        if (investment) {
            // If investment exists, update it with new investments and votes
            investment.investments = investments;
            investment.totalInvestment = investments.reduce((acc, item) => acc + item.amount, 0);
            await investment.save();
        } else {
            // Otherwise, create a new investment
            investment = new Investment({
                user: userId,
                pool: poolId,
                investments,
                totalInvestment: investments.reduce((acc, item) => acc + item.amount, 0),
            });
            await investment.save();
        }

        res.status(StatusCodes.CREATED).json({
            statusCode: StatusCodes.CREATED,
            message: 'Investment and vote recorded successfully',
            data: investment,
        });
    } catch (ex) {
        next(ex);
    }
};

exports.calculateWinner = async (poolId, result = {}) => {
    try {
        const pool = await Pool.findById(poolId);
        if (!pool) {
            throw new Error('Pool not found');
        }

        if (pool.isPrivate) {
            throw new Error('This pool is private. Only the admin can declare the winner');
        }

        // Calculate the total investment (votes) for each option
        const optionInvestments = {};

        pool.votes.forEach(vote => {
            vote.investments.forEach(investment => {
                if (!optionInvestments[investment.option]) {
                    optionInvestments[investment.option] = 0;
                }
                optionInvestments[investment.option] += investment.amount;  // Add the investment to the respective option
            });
        });

        // Find the option with the most investments (votes)
        let winnerOption = null;
        let maxInvestment = 0;

        for (const option in optionInvestments) {
            if (optionInvestments[option] > maxInvestment) {
                maxInvestment = optionInvestments[option];
                winnerOption = option;
            }
        }

        pool.winner = winnerOption;  // Set the winner option
        await pool.save();

        result.data = pool;
    } catch (ex) {
        result.ex = ex;
    } finally {
        return result;
    }
};




