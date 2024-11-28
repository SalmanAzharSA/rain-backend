const configs = require("../../../configs");
const jwt = require("jsonwebtoken");
const { JWT_TOKEN_TYPES } = require("../../../helpers/constants");
const createError = require("http-errors");
const redisClient = require("../../../helpers/redis");
const { StatusCodes } = require("http-status-codes");

exports.verifyToken = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, payload) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ payload });
    });
  });
};

exports.signToken = (user, type, rememberMe) => {
  return new Promise((resolve, reject) => {
    const secret =
      type === JWT_TOKEN_TYPES.ACCESS_TOKEN
        ? configs.jwt.accessToken.secret
        : configs.jwt.refreshToken.secret;
    let expiry;
    if (rememberMe) {
      expiry =
        type === JWT_TOKEN_TYPES.ACCESS_TOKEN
          ? configs.jwt.accessToken.ttl
          : configs.jwt.refreshToken.remeberMeTTL;
    } else {
      expiry =
        type === JWT_TOKEN_TYPES.ACCESS_TOKEN
          ? configs.jwt.accessToken.ttl
          : configs.jwt.refreshToken.ttl;
    }
    const options = {
      expiresIn: expiry,
      issuer: configs.jwt.issuer,
      audience: user.id.toString(),
    };

    const payload = type === JWT_TOKEN_TYPES.ACCESS_TOKEN ? user : {};

    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        // log exception here
        reject(createError.InternalServerError());
        return;
      }
      resolve(token);
    });
  });
};

exports.verifyAccessToken = (req, res, next) => {
  if (!req.headers["authorization"]) return next(createError.Unauthorized());

  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader.split(" ");

  const token = bearerToken[1];

  jwt.verify(token, configs.jwt.accessToken.secret, (err, payload) => {
    if (err) {
      const message =
        err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
      return next(createError.Unauthorized(message));
    }
    req.user = payload;
    next();
  });
};

exports.verifyRefreshToken = (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    jwt.verify(
      refreshToken,
      configs.jwt.refreshToken.secret,
      async (err, payload) => {
        if (err) {
          return next(createError.Unauthorized());
        }

        const userId = payload.aud;
        const result = await redisClient.get(userId);

        if (refreshToken === result) {
          req.user = { userId };
          next();
          return;
        }

        next(createError.Unauthorized());
      }
    );
  } catch (ex) {
    next(ex);
  }
};

exports.verifyEmailConfirmationToken = (req, res, next) => {
  const { token } = req.query;

  jwt.verify(
    token,
    configs.jwt.emailVerificationToken.secret,
    (err, payload) => {
      if (err) {
        const message =
          err.name === "TokenExpiredError"
            ? "Email Confirmation Token expired"
            : err.message;
        res.status(StatusCodes.GONE).render("pages/users/resource-expired", {
          title: "Rain Email Confirmation Token expired",
          message,
        });
        return;
      }
      req.user = payload;
      next();
    }
  );
};

exports.signEmailVerificationToken = () => {
  return new Promise((resolve, reject) => {
    const secret = configs.jwt.emailVerificationToken.secret;
    const expiry = configs.jwt.emailVerificationToken.ttl;
    const options = {
      expiresIn: expiry,
      issuer: configs.jwt.issuer,
    };

    const payload = {};

    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        // log exception here
        reject(createError.InternalServerError());
        return;
      }
      resolve(token);
    });
  });
};
