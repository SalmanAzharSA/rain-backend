const createError = require("http-errors");
const { StatusCodes } = require("http-status-codes");
const authService = require("./auth.service.js");

exports.signin = async (req, res, next) => {
  try {
    const createTokensDto = {
      user: req.user,
      rememberMe: req.body.rememberMe || false,
    };

    const result = await authService.createTokens(createTokensDto);

    if (result.ex) throw result.ex;

    res.status(StatusCodes.CREATED).json({
      statusCode: StatusCodes.CREATED,
      message: "Signin Successful",
      data: result.data,
    });
  } catch (ex) {
    next(ex);
  }
};
