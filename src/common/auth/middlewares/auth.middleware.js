const createError = require("http-errors");
const { StatusCodes } = require("http-status-codes");
const { passport } = require("../passport");
const PASSPORT_STRATEGIES = require("../constants/passport.strategies.constant");
exports.authWithPassport = (strategy, options) => {
  return function (req, res, next) {
    passport.authenticate(strategy, options, function (err, user, info) {
      if (err) return next(err);
      if (strategy == PASSPORT_STRATEGIES.local) {
        if (info?.isCredsInvalid)
          throw createError(
            StatusCodes.UNAUTHORIZED,
            "Invalid auth credentials"
          );

        if (info?.isSocialUser)
          throw createError(
            StatusCodes.FORBIDDEN,
            `Forbidden. Please signin with ${info.socialType}`
          );

        if (info?.isEmailNotVerified)
          throw createError(
            StatusCodes.FORBIDDEN,
            "Forbidden. Please verify your email address"
          );
      }
      if (!user) {
        const error = createError(StatusCodes.UNAUTHORIZED, info.message);
        error.details = {
          reason: info.name,
        };
        throw error;
      }

      req.user = user;
      next();
    })(req, res, next);
  };
};
