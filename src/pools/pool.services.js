const Pool = require("./pool.model");
const Vote = require("../votes/vote.model");
const createError = require("http-errors");
const { StatusCodes } = require("http-status-codes");

exports.createPool = async (createPoolDto, userId) => {
  try {
    const {
      question,
      isPrivate,
      liquidityMax,
      questionImage,
      options,
      tags,
      startDate,
      poolTypeData,
    } = createPoolDto;
    // Validate that required fields are present for both types of pools
    // if (!poolTypeData) {
    //     throw createError(StatusCodes.BAD_REQUEST, 'Pool type data is required.');
    // }
    const newPool = new Pool({
      question,
      isPrivate,
      liquidityMax,
      questionImage,
      options,
      tags,
      startDate,
      poolTypeData, // This will pass the poolTypeData from the body directly.
      creator: userId, // The userId passed from the controller
    });

    // console.log(newPool, "newPool");

    // Save the new pool to the database
    await newPool.save();

    return newPool;
  } catch (error) {
    console.log(error, "ERRRR");
    throw createError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Error creating pool: ${error.message}`
    );
  }
};

exports.declareWinner = async (
  poolId,
  winnerOption,
  creatorId,
  result = {}
) => {
  try {
    const pool = await Pool.findById(poolId);
    if (!pool) {
      throw new Error("Pool not found");
    }

    if (pool.creator.toString() !== creatorId) {
      throw new Error("You are not authorized to declare the winner");
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
    const { limit = 10, offset = 1, tag } = getPoolsDto;
    console.log(getPoolsDto, "getPoolsDtoInsercice");

    const query = { isPrivate: false };
    if (tag) {
      query.tags = { $in: [new RegExp(tag, "i")] };
    }
    // if (tag) {
    //   query.$or = [
    //     { tags: { $in: [tag] } },
    //     { tags: { $in: [new RegExp(tag, "i")] } },
    //   ];
    // }

    const [pools, count] = await Promise.all([
      Pool.find(query)
        .skip((offset - 1) * limit)
        .limit(limit)
        // .sort({ [sortBy]: createdAt - 1 }), // Sort by `sortBy` field (default is createdAt)
        .sort({ createdAt: -1 }),

      Pool.countDocuments(query),
    ]);

    result.data = {
      pools,
      count,
      pages: Math.ceil(count / limit),
    };
  } catch (ex) {
    result.ex = ex;
  } finally {
    return result;
  }
};

exports.getPrivatePoolList = async (getPoolsDto, result = {}) => {
  try {
    const { limit = 10, offset = 1, tag } = getPoolsDto;

    // Query for private pools where isPrivate is true
    const query = { isPrivate: true };

    if (tag) {
      query.tags = { $in: [new RegExp(tag, "i")] };
    }

    const [pools, count] = await Promise.all([
      Pool.find(query)
        .skip((offset - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Pool.countDocuments(query),
    ]);

    result.data = {
      pools,
      count,
      pages: Math.ceil(count / limit),
    };
  } catch (ex) {
    result.ex = ex;
  } finally {
    return result;
  }
};

exports.getPoolById = async ({ id }, result = {}) => {
  try {
    const pool = await Pool.findById(id).lean();

    if (pool) {
      if (pool.poolTypeData && pool.poolTypeData.length === 0) {
        delete pool.poolTypeData;
      }
      result.data = pool;
    }
  } catch (ex) {
    result.ex = ex;
  } finally {
    return result;
  }
};
