const Pool = require('./pool.model');
const Vote = require('../votes/vote.model');

exports.createPool = async (poolDto, result = {}) => {
    try {
        const { question, options, creator, isPrivate } = poolDto;
        const pool = new Pool({
            question,
            options,
            creator,
            isPrivate,
        });

        await pool.save();

        result.data = pool;
    } catch (ex) {
        result.ex = ex;
    } finally {
        return result;
    }
};


exports.declareWinner = async (poolId, winnerOption, creatorId, result = {}) => {
    try {
        const pool = await Pool.findById(poolId);
        if (!pool) {
            throw new Error('Pool not found');
        }

        if (pool.creator.toString() !== creatorId) {
            throw new Error('You are not authorized to declare the winner');
        }

        pool.winner = winnerOption;
        await pool.save();

        result.data = pool;
    } catch (ex) {
        result.ex = ex;
    } finally {
        return result;
    }
};

/*
//With common logic for private and public pools
exports.getPoolList = async (getPoolsDto, result = {}) => {
    try {
        const { limit, offset, isPrivate } = getPoolsDto;

      
        const query = isPrivate !== undefined ? { isPrivate } : {};  

        // Fetch pools and total count in parallel
        const [pools, count] = await Promise.all([
            Pool.find(query)  // Filter by isPrivate if provided
                .skip((offset - 1) * limit)  // Skip for pagination
                .limit(limit)  // Limit results per page
                .sort({ createdAt: -1 }),  // Sort by creation date (latest first)
            Pool.countDocuments(query),  // Count total pools matching the query
        ]);

        // Return the result in a structured format
        result.data = {
            pools,
            count,
            pages: Math.ceil(count / limit),  // Calculate total pages
        };
    } catch (ex) {
        result.ex = ex;
    } finally {
        return result;
    }
};
*/


exports.getPublicPoolList = async (getPoolsDto, result = {}) => {
    try {
        const { limit, offset } = getPoolsDto;

        // Query for public pools where isPrivate is false
        const query = { isPrivate: false };

        const [pools, count] = await Promise.all([
            Pool.find(query)
                .skip((offset - 1) * limit)  // Pagination
                .limit(limit)
                .sort({ createdAt: -1 }),  // Sort by creation date
            Pool.countDocuments(query),  // Count total public pools
        ]);

        result.data = {
            pools,
            count,
            pages: Math.ceil(count / limit),  // Calculate total pages
        };
    } catch (ex) {
        result.ex = ex;
    } finally {
        return result;
    }
};

exports.getPrivatePoolList = async (getPoolsDto, result = {}) => {
    try {
        const { limit, offset } = getPoolsDto;

        // Query for private pools where isPrivate is true
        const query = { isPrivate: true };

        const [pools, count] = await Promise.all([
            Pool.find(query)
                .skip((offset - 1) * limit)  // Pagination
                .limit(limit)
                .sort({ createdAt: -1 }),  // Sort by creation date
            Pool.countDocuments(query),  // Count total private pools
        ]);

        result.data = {
            pools,
            count,
            pages: Math.ceil(count / limit),  // Calculate total pages
        };
    } catch (ex) {
        result.ex = ex;
    } finally {
        return result;
    }
};


