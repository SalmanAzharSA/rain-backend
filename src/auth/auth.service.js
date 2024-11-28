const usersService = require("../users/users.service");
const { JWT_TOKEN_TYPES } = require("../../helpers/constants");
const JWT = require("../common/auth/jwt");
const configs = require("../../configs");
const redisClient = require("../../helpers/redis");
const jwt = require("jsonwebtoken");
const utils = require('ethereumjs-util');
const { ethers } = require("ethers");


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



exports.registerwithWalletAddress = async (userData, sign, result = {}) => {
  try {
    const { walletAddress, name, bio, sign, object } = userData;


    let user = await usersService.findUser({ walletAddress: walletAddress.toLowerCase() });
    if (user) {
      // var token = jwt.sign(
      //   {
      //     _id: user._id.toString(),
      //     walletAddress: walletAddress,
      //     displayName: user.name,
      //   },
      //   process.env.JWT_ACCESS_TOKEN_SECRET,
      //   { expiresIn: '2h' }
      // );
      // result.data = { status: 200, user: user, token: token, message: "User Logged In" };
      result.error = { status: 409, message: "User already exists" };
      return result;
    }

    if (walletAddress) {



      const signerAddr = await ethers.utils.verifyMessage(object.message, sign);
      if (signerAddr !== walletAddress) {
        console.log("message not verified:", object.message, sign);

        return false;
      }
      console.log("message verified:", object.message, signerAddr);


      // console.log("Recovered address (adr):", adr);
      // console.log("Provided wallet address:", walletAddress.toLowerCase());

      if (signerAddr.toLowerCase() === walletAddress.toLowerCase()) {

        const user = await usersService.registerwithWalletAddress({
          walletAddress: walletAddress.toLowerCase(),
          name: name,
          bio: bio || '',
        });

        console.log(user, "useruseruseruser")

        var token = jwt.sign(
          {
            _id: user.data._id.toString(),
            walletAddress: walletAddress,
            displayName: user.data.name,
          },
          process.env.JWT_ACCESS_TOKEN_SECRET,
          { expiresIn: '2h' }
        );

        result.data = { user, token };
        return result;
      } else {

        result.error = { status: 401, message: "Sign not verified" };
        return result;
      }
    } else {
      result.error = { status: 401, message: "Wallet address is not correct" };
      return result;
    }

  } catch (error) {
    result.error = { status: 500, message: "Error during registration: " + error.message };
    return result;
  }
};



exports.createTokens = createTokens;
