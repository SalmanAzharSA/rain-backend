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

exports.getPoolList = async (req, res, next) => {
  try {
    const poolListDto = {
      ...req.query, // expects limit, offset, and possibly filters (like public/private)
    };

    const result = await poolService.getPoolList(poolListDto);

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
