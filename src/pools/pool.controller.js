const poolService = require("./pool.services");
const { StatusCodes } = require("http-status-codes");

// exports.createPool = async (req, res, next) => {
//     try {
//         const poolDto = {
//             ...req.body, // expects fields like question, options, creator, isPrivate
//         };

//         const result = await poolService.createPool(poolDto);

//         if (result.ex) throw result.ex;

//         res.status(StatusCodes.CREATED).json({
//             statusCode: StatusCodes.CREATED,
//             message: "Pool created successfully",
//             data: result.data,
//         });
//     } catch (ex) {
//         next(ex);
//     }
// };

exports.createPool = async (req, res, next) => {
  try {
    const createPoolDto = { ...req.body };
    const userId = req.user._id;

    const newPool = await poolService.createPool(createPoolDto, userId);

    res.status(StatusCodes.CREATED).json({
      statusCode: StatusCodes.CREATED,
      message: "Pool created successfully.",
      data: newPool,
    });
  } catch (ex) {
    next(ex); // Pass error to the error handler middleware
  }
};

// exports.getPoolList = async (req, res, next) => {
//   try {
//     const poolListDto = {
//       ...req.query, // expects limit, offset, and possibly filters (like public/private)
//     };

//     const result = await poolService.getPoolList(poolListDto);

//     if (result.ex) throw result.ex;

//     res.status(StatusCodes.OK).json({
//       statusCode: StatusCodes.OK,
//       message: "Pools list retrieved successfully",
//       data: result.data,
//     });
//   } catch (ex) {
//     next(ex);
//   }
// };

exports.poolListingByCreator = async (req, res, next) => {
  try {
    const creatorId = req.user._id;
    const poolListDto = {
      limit: parseInt(req.query.limit) || 10,
      offset: parseInt(req.query.offset) || 1,
      filter: req.query.filter,
    };

    const result = await poolService.poolListingByCreator(
      poolListDto,
      creatorId
    );

    if (result.ex) throw result.ex;

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Pools list retrieved successfully",
      data: result.data,
    });
  } catch (ex) {
    next(ex);
  }
};

exports.declareWinner = async (req, res, next) => {
  try {
    const { poolId, winnerOption } = req.body;
    const result = await poolService.declareWinner(
      poolId,
      winnerOption,
      req.userId
    ); // req.userId is set from authentication

    if (result.ex) throw result.ex;

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Winner declared successfully",
      data: result.data,
    });
  } catch (ex) {
    next(ex);
  }
};

exports.getPublicPoolList = async (req, res, next) => {
  try {
    const getPoolsDto = {
      ...req.query,
      isPrivate: false,
    };

    const result = await poolService.getPublicPoolList(getPoolsDto);

    if (result.ex) throw result.ex;

    res.status(200).json({
      statusCode: 200,
      message: "Public pool list fetched successfully",
      data: result.data,
    });
  } catch (ex) {
    next(ex);
  }
};

exports.getPrivatePoolList = async (req, res, next) => {
  try {
    const getPoolsDto = {
      ...req.query,
      isPrivate: true, // Only fetch private pools
    };

    const result = await poolService.getPrivatePoolList(getPoolsDto);

    if (result.ex) throw result.ex;

    res.status(200).json({
      statusCode: 200,
      message: "Private pool list fetched successfully",
      data: result.data,
    });
  } catch (ex) {
    next(ex);
  }
};

exports.getPoolById = async (req, res, next) => {
  try {
    const getPoolByIdDto = {
      id: req.params.id,
    };

    const result = await poolService.getPoolById(getPoolByIdDto);

    if (result.ex) throw result.ex;

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Pool retrive successfully",
      data: result.data,
    });
  } catch (ex) {
    next(ex);
  }
};

exports.accessPool = async (req, res, next) => {
  try {
    const { poolId, accessCode } = req.body;

    const pool = await poolService.accessPool(poolId, accessCode);

    // // If the pool is private, check if the access code matches
    // if (pool.isPrivate == false && pool.accessCode !== accessCode) {
    //   return res.status(StatusCodes.FORBIDDEN).json({
    //     statusCode: StatusCodes.FORBIDDEN,
    //     message: "Invalid access code for private pool",
    //   });
    // }

    return res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Access granted",
      data: pool,
    });
  } catch (ex) {
    next(ex); // Pass error to the error handler middleware
  }
};

exports.signParticipationTransaction = async (req, res, next) => {
  try {
    const { walletAddress, timestamp, option, amount } = req.body;

    // Validate the input data
    // if (!walletAddress || !poolId || !option || !amount || !timestamp) {
    //   return res.status(StatusCodes.BAD_REQUEST).json({
    //     statusCode: StatusCodes.BAD_REQUEST,
    //     message:
    //       "All fields are required: walletAddress, poolId, option, amount, timestamp.",
    //   });
    // }

    const transactionDetails = {
      walletAddress,
      option,
      amount,
      timestamp,
    };

    const signature = await poolService.signParticipationTransaction(
      transactionDetails
    );

    return res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Transaction signed successfully",
      data: {
        signature,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.signSwapTransaction = async (req, res, next) => {
  try {
    const { walletAddress, optionFrom, optionTo, amountToSwap, timestamp } =
      req.body;

    const swapTransactionDetails = {
      walletAddress,
      optionFrom,
      optionTo,
      amountToSwap,
      timestamp,
    };
    // const { error, value } = swapSchema.validate(req.body);
    // if (error) {
    //   return res.status(StatusCodes.BAD_REQUEST).json({
    //     statusCode: StatusCodes.BAD_REQUEST,
    //     message: error.details[0].message,
    //   });
    // }

    const signature = await poolService.signSwapTransaction(
      swapTransactionDetails
    );

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Swap Transaction signed successfully",
      data: { signature },
    });
  } catch (error) {
    next(error);
  }
};

exports.signAddLiquidityTransaction = async (req, res, next) => {
  try {
    const { walletAddress, totalAmount, timestamp } = req.body;

    // Validate input fields
    if (!walletAddress || !totalAmount || !timestamp) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        statusCode: StatusCodes.BAD_REQUEST,
        message:
          "All fields (walletAddress, totalAmount, timestamp) are required.",
      });
    }

    // Prepare transaction details for signing
    const addLiquidityTransactionDetails = {
      walletAddress,
      totalAmount,
      timestamp,
    };

    // Call the service to generate the signature
    const signature = await poolService.signAddLiquidityTransaction(
      addLiquidityTransactionDetails
    );

    // Respond with the generated signature
    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Add Liquidity Transaction signed successfully",
      data: { signature },
    });
  } catch (error) {
    next(error); // Pass the error to the global error handler
  }
};
