const usersService = require("../users/users.service");
const { JWT_TOKEN_TYPES } = require("../../helpers/constants");
const JWT = require("../common/auth/jwt");
const configs = require("../../configs");
const redisClient = require("../../helpers/redis");
exports.signin = async (signInDto, result = {}) => {
  try {
    const { userName, password } = signInDto;

    const findUserDto = { userName };
    const response = await usersService.findUser(findUserDto);

    if (response.ex) throw response.ex;
    const user = response.data;
    console.log("isSocial", user.isSocial);
    if (user) {
      if (user.isSocial) {
        result.isSocialUser = true;
        result.socialType = user.socialType;
      } else if (await user.comparePassword(password)) {
        result.data = user._doc;
      }
    }
  } catch (ex) {
    result.ex = ex;
  } finally {
    return result;
  }
};

async function createTokens(createTokensDto, result = {}) {
  try {
    const { user, rememberMe } = createTokensDto;
    // extract safe values from user
    const { emailVerificationToken, password, ...safeUserData } = user;

    // generate access & refresh token
    const [accessToken, refreshToken] = await Promise.all([
      JWT.signToken(
        {
          id: user._id,
          email: user.email,
          profileImage: user.profileImage,
          walletAddress: user?.walletAddress,
          isSocial: user.isSocial,
        },
        JWT_TOKEN_TYPES.ACCESS_TOKEN
      ),
      JWT.signToken(
        {
          id: user._id,
          email: user.email,
          profileImage: user.profileImage,
          walletAddress: user?.walletAddress,
          isSocial: user.isSocial,
        },
        JWT_TOKEN_TYPES.REFRESH_TOKEN
      ),
    ]);

    // store refresh token in redis
    rememberMe
      ? await redisClient.set(user._id.toString(), refreshToken, {
          EX: configs.jwt.refreshToken.redisRemeberMeTTL,
        })
      : await redisClient.set(user._id.toString(), refreshToken, {
          EX: configs.jwt.refreshToken.redisTTL,
        });

    result.data = {
      user: {
        ...safeUserData,
      },
      accessToken,
      refreshToken,
    };
  } catch (ex) {
    result.ex = ex;
  } finally {
    return result;
  }
}

exports.createTokens = createTokens;
