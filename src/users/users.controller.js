const { StatusCodes } = require("http-status-codes");
const createError = require("http-errors");
const usersService = require("./users.service");
const utils = require("ethereumjs-util");

exports.getUsersList = async (req, res, next) => {
  try {
    const getUsersListsDto = {
      ...req.query,
    };

    const result = await usersService.getUsersList(getUsersListsDto);

    if (result.ex) throw result.ex;

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "All Users list",
      data: result.data,
    });
  } catch (ex) {
    next(ex);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const {
      walletAddress,
      name,
      bio,
      discordLink,
      twitterLink,
      instagramLink,
      telegramLink,
      picture,
    } = req.body;

    let pictureUrl = "";
    if (req.file) {
      if (req.file.location) {
        pictureUrl = req.file.location;
      }
    }

    const userData = {
      walletAddress,
      name,
      bio: bio || "",
      discordLink,
      twitterLink,
      instagramLink,
      telegramLink,
      picture: pictureUrl,
    };

    const result = await usersService.createUser(userData);

    if (result.error) {
      return res
        .status(result.error.status)
        .json({ msg: result.error.message });
    }

    return res.status(201).json({
      status: true,
      msg: "User Created",
      user: result.data,
    });
  } catch (error) {
    next(error);
  }
};

exports.findUserBywalletAddress = async (req, res, next) => {
  try {
    const { walletAddress } = req.query;

    const result = await usersService.findUserBywalletAddress(walletAddress);

    if (result.error) {
      return res.status(StatusCodes.NOT_FOUND).json({
        statusCode: StatusCodes.NOT_FOUND,
        message: result.error,
      });
    }

    return res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "User retrieved successfully",
      data: result.data,
    });
  } catch (ex) {
    next(ex);
  }
};
