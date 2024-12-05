const Pool = require("./pool.model");
const Vote = require("../votes/vote.model");
const createError = require("http-errors");
const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");
const configs = require("../../configs");
const { ethers } = require("ethers"); // Use ethers.js to sign the message

// exports.createPool = async (createPoolDto, userId) => {
//   try {
//     const {
//       question,
//       isPrivate,
//       liquidityMax,
//       questionImage,
//       options,
//       tags,
//       startDate,
//       poolTypeData,
//     } = createPoolDto;
//     // Validate that required fields are present for both types of pools
//     // if (!poolTypeData) {
//     //     throw createError(StatusCodes.BAD_REQUEST, 'Pool type data is required.');
//     // }

//     // Generate an access code if the pool is private
//     let accessCode = null;
//     if (isPrivate == true) {
//       accessCode = crypto.randomBytes(4).toString("hex");
//     }
//     console.log(accessCode, "accessCode");
//     const newPool = new Pool({
//       question,
//       isPrivate,
//       liquidityMax,
//       questionImage,
//       options,
//       tags,
//       startDate,
//       poolTypeData, // This will pass the poolTypeData from the body directly.
//       creator: userId, // The userId passed from the controller
//       accessCode, // added new
//     });

//     // console.log(newPool, "newPool");

//     // Save the new pool to the database
//     await newPool.save();

//     return newPool;
//   } catch (error) {
//     console.log(error, "ERRRR");
//     throw createError(
//       StatusCodes.INTERNAL_SERVER_ERROR,
//       `Error creating pool: ${error.message}`
//     );
//   }
// };

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

    if (!options || options.length === 0) {
      throw createError(
        StatusCodes.BAD_REQUEST,
        "At least one option is required."
      );
    }

    const adjustedOptions = options.map((option, index) => {
      return {
        ...option,
        choiceIndex: index + 1,
      };
    });
    let accessCode = null;
    if (isPrivate == true) {
      // accessCode = crypto.randomBytes(4).toString("hex");
      let isUnique = false;

      while (!isUnique) {
        accessCode = crypto.randomBytes(4).toString("hex");

        const existingPool = await Pool.findOne({ accessCode });

        if (!existingPool) {
          isUnique = true;
        }
      }
    }

    console.log(accessCode, "accessCode");

    // Create the new pool object
    const newPool = new Pool({
      question,
      isPrivate,
      liquidityMax,
      questionImage,
      options: adjustedOptions,
      tags,
      startDate,
      poolTypeData,
      creator: userId,
      accessCode,
    });
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

// exports.declareWinner = async (
//   poolId,
//   winnerOption,
//   creatorId,
//   result = {}
// ) => {
//   try {
//     const pool = await Pool.findById(poolId);
//     if (!pool) {
//       throw new Error("Pool not found");
//     }

//     if (pool.creator.toString() !== creatorId) {
//       throw new Error("You are not authorized to declare the winner");
//     }

//     pool.winner = winnerOption;
//     await pool.save();

//     result.data = pool;
//   } catch (ex) {
//     result.ex = ex;
//   } finally {
//     return result;
//   }
// };

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

    if (pool.isPrivate !== true) {
      throw new Error("Only private pool's winner can be decided by creator.");
    }

    if (pool.creator.toString() !== creatorId) {
      throw new Error("You are not authorized to declare the winner");
    }

    // Find the option in the pool options using winnerOption.optionIndex (choiceIndex)
    const selectedOption = pool.options[winnerOption.choiceIndex];

    if (!selectedOption) {
      throw new Error("Invalid choiceIndex");
    }

    const message = ethers.utils.solidityKeccak256(
      // ["address", "uint256",  ],
      // [walletAddress, option, ]
      ["uint256"],
      [option]
    );

    const privateKey = configs.signTransactions.privateKey;
    if (!privateKey) {
      throw new Error("Private key not found in environment variables.");
    }

    const wallet = new ethers.Wallet(privateKey);

    const signature = await wallet.signMessage(message);

    // Save the winnerOption with the optionId and choiceIndex
    pool.winnerOption = {
      choiceIndex: winnerOption.choiceIndex,
      optionId: selectedOption._id,
    };

    await pool.save();

    result.data = { pool, signature };
  } catch (ex) {
    result.ex = ex;
  } finally {
    return result;
  }
};

exports.getPublicPoolList = async (getPoolsDto, result = {}) => {
  try {
    const { limit = 10, offset = 1, tag } = getPoolsDto;
    console.log(getPoolsDto, "getPoolsDtoInsercice");

    const query = { isPrivate: false };
    if (tag) {
      query.tags = { $in: [new RegExp(tag, "i")] };
    }

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

exports.accessPool = async (poolId, accessCode, result = {}) => {
  try {
    // Find the pool by ID
    const pool = await Pool.findById({ _id: poolId });
    if (!pool) {
      throw new Error("Pool not found");
    }

    // If the pool is private, check if the access code matches
    if (pool.isPrivate == false && pool.accessCode !== accessCode) {
      throw new Error("Invalid access code");
    }

    // return {
    //   // statusCode: StatusCodes.OK,
    //   // message: "Access granted",
    //   data: pool,
    // };
    result.data = pool;
  } catch (ex) {
    result.ex = ex;
  } finally {
    return result;
  }
  // } catch (error) {
  //   throw new Error(error.message);
  // }
};

exports.poolListingByCreator = async (getPoolsDto, creatorId, result = {}) => {
  try {
    const { limit, offset, filter } = getPoolsDto;
    console.log(getPoolsDto, "getPoolsDto");
    const query = {
      creator: creatorId,
    };

    if (filter === "privatePools") {
      query.isPrivate = true;
    } else if (filter === "publicPools") {
      query.isPrivate = false;
    } else {
      query.isPrivate = false;
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

exports.signParticipationTransaction = async (transactionDetails) => {
  try {
    const { walletAddress, option, amount, timestamp } = transactionDetails;

    const message = ethers.utils.solidityKeccak256(
      ["address", "uint256", "uint256", "uint256"],
      [walletAddress, option, amount, timestamp]
    );

    const privateKey = configs.signTransactions.privateKey;
    if (!privateKey) {
      throw new Error("Private key not found in environment variables.");
    }

    const wallet = new ethers.Wallet(privateKey);

    const signature = await wallet.signMessage(message);

    return signature;
  } catch (error) {
    throw error;
  }
};

exports.signSwapTransaction = async (swapTransactionDetails) => {
  try {
    const { walletAddress, optionFrom, optionTo, amountToSwap, timestamp } =
      swapTransactionDetails;

    const message = ethers.utils.solidityKeccak256(
      ["address", "string", "string", "uint256", "uint256"],
      [walletAddress, optionFrom, optionTo, amountToSwap, timestamp]
    );

    const privateKey = configs.signTransactions.privateKey;
    if (!privateKey) {
      throw new Error("Private key not found in environment variables.");
    }

    const wallet = new ethers.Wallet(privateKey);

    // ECDSA signature
    const signature = await wallet.signMessage(message);

    return signature;
  } catch (error) {
    throw error;
  }
};

exports.signAddLiquidityTransaction = async (
  addLiquidityTransactionDetails
) => {
  try {
    const { walletAddress, totalAmount, timestamp } =
      addLiquidityTransactionDetails;

    const message = ethers.utils.solidityKeccak256(
      ["address", "uint256", "uint256"],
      [walletAddress, totalAmount, timestamp]
    );

    const privateKey = configs.signTransactions.privateKey;
    if (!privateKey) {
      throw new Error("Private key not found in environment variables.");
    }

    const wallet = new ethers.Wallet(privateKey);

    const signature = await wallet.signMessage(message);
    //this is for a hash not a string
    // const signature = await wallet.signMessage(ethers.utils.arrayify(message));

    return signature;
  } catch (error) {
    throw error;
  }
};
