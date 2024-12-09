const usersService = require("../users/users.service");
const { JWT_TOKEN_TYPES } = require("../../helpers/constants");
const JWT = require("../common/auth/jwt");
const configs = require("../../configs");
const redisClient = require("../../helpers/redis");
const jwt = require("jsonwebtoken");
const utils = require("ethereumjs-util");
const { ethers } = require("ethers");
const cryptoUtils = require("../common/crypto/crypto.util");

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

// exports.registerwithWalletAddress = async (userData, sign, result = {}) => {
//   try {
//     const { walletAddress, name, bio, sign, object } = userData;
//     console.log("userDAT==>", userData);
//     let user = await usersService.findUser({
//       walletAddress: walletAddress.toLowerCase(),
//     });
//     console.log("USER--", user.data);

//     if (user.data) {
//       // var token = jwt.sign(
//       //   {
//       //     _id: user._id.toString(),
//       //     walletAddress: walletAddress,
//       //     displayName: user.name,
//       //   },
//       //   process.env.JWT_ACCESS_TOKEN_SECRET,
//       //   { expiresIn: '8h' }
//       // );
//       // result.data = { status: 200, user: user, token: token, message: "User Logged In" };
//       result.error = { status: 409, message: "User already exists" };
//       return result;
//     }

//     if (walletAddress) {
//       const signerAddr = await ethers.utils.verifyMessage(object.message, sign);
//       console.log(signerAddr, "signerAddr");
//       console.log("walletAddress", "walletAddress");
//       if (signerAddr !== walletAddress) {
//         console.log("message not verified:", object.message, sign);
//         result.error = {
//           status: 401,
//           message:
//             "Signature verification failed: signer address does not match wallet address",
//         };
//         // return false;
//         return result;
//       }
//       console.log("message verified:", object.message, signerAddr);

//       // console.log("Recovered address (adr):", adr);
//       // console.log("Provided wallet address:", walletAddress.toLowerCase());

//       if (signerAddr.toLowerCase() === walletAddress.toLowerCase()) {
//         const user = await usersService.registerwithWalletAddress({
//           walletAddress: walletAddress.toLowerCase(),
//         });

//         console.log(user, "useruseruseruser");

//         var token = jwt.sign(
//           {
//             _id: user.data._id.toString(),
//             walletAddress: walletAddress,
//             displayName: user.data.name,
//           },
//           process.env.JWT_ACCESS_TOKEN_SECRET,
//           { expiresIn: "8h" }
//         );

//         result.data = { user, token };
//         return result;
//       } else {
//         result.error = { status: 401, message: "Sign not verified" };
//         return result;
//       }
//     } else {
//       result.error = { status: 401, message: "Wallet address is not correct" };
//       return result;
//     }
//   } catch (error) {
//     result.error = {
//       status: 500,
//       message: "Error during registration: " + error.message,
//     };
//     return result;
//   }
// };

// exports.loginOrRegisterWithWalletAddress = async (
//   walletAddress,
//   sign,
//   result = {}
// ) => {
//   try {
//     const normalizedWalletAddress = walletAddress.toLowerCase();

//     // Check if the user exists
//     let user = await usersService.findUser({
//       walletAddress: normalizedWalletAddress,
//     });

//     // If user exists, log them in
//     if (user.data) {
//       console.log("User found, logging in...");

//       // Verify the signature using ethers.js
//       const signerAddr = await ethers.utils.verifyMessage(
//         normalizedWalletAddress,
//         sign
//       );
//       if (signerAddr.toLowerCase() !== normalizedWalletAddress) {
//         console.log(
//           "Signature verification failed:",
//           signerAddr,
//           normalizedWalletAddress
//         );
//         result.error = { status: 401, message: "Signature not verified" };
//         return result;
//       }

//       // Generate JWT token for login
//       const token = jwt.sign(
//         {
//           _id: user.data._id.toString(),
//           walletAddress: normalizedWalletAddress,
//         },
//         process.env.JWT_ACCESS_TOKEN_SECRET,
//         { expiresIn: "8h" }
//       );

//       result.data = { user: user.data, token, message: "User Logged In" };
//       return result;
//     }

//     // If user doesn't exist, proceed to register them
//     console.log("User not found, registering new user...");

//     if (walletAddress) {
//       console.log("walletAddress::+++>", walletAddress);
//       // Verify the signature using ethers.js
//       const signerAddr = await ethers.utils.verifyMessage(
//         normalizedWalletAddress,
//         sign
//       );
//       console.log("signerAddrsignerAddr");
//       if (signerAddr.toLowerCase() !== normalizedWalletAddress) {
//         console.log(
//           "Signature verification failed:",
//           "signerAddr::::",
//           signerAddr,
//           "normalizedWalletAddress::::",
//           normalizedWalletAddress
//         );
//         result.error = {
//           status: 401,
//           message:
//             "Signature verification failed: signer address does not match wallet address",
//         };
//         return result;
//       }

//       console.log("Message verified successfully.");

//       // Proceed to register the user
//       const newUser = await usersService.registerwithWalletAddress({
//         walletAddress: normalizedWalletAddress,
//         // name: "Anonymous", // You can add more fields as per your user schema
//       });

//       console.log("New user registered:", newUser.data);

//       // Generate JWT token for the new user
//       const token = jwt.sign(
//         {
//           _id: newUser.data._id.toString(),
//           walletAddress: normalizedWalletAddress,
//           // displayName: newUser.data.name,
//         },
//         process.env.JWT_ACCESS_TOKEN_SECRET,
//         { expiresIn: "8h" }
//       );

//       result.data = { user: newUser.data, token, message: "User Registered" };
//       return result;
//     } else {
//       result.error = { status: 401, message: "Wallet address is not correct" };
//       return result;
//     }
//   } catch (error) {
//     console.error("Error during login/registration:", error);
//     result.error = {
//       status: 500,
//       message: "Error during login or registration: " + error.message,
//     };
//     return result;
//   }
// };

exports.loginOrRegisterWithWalletAddress = async (
  walletAddress,
  sign,
  result = {}
) => {
  try {
    const normalizedWalletAddress = walletAddress.toLowerCase();

    // Check if the user exists
    let user = await usersService.findUser({
      walletAddress: normalizedWalletAddress,
    });

    // If user exists, log user in
    if (user.data) {
      const isSignVerified = cryptoUtils.verifyEthSign(
        normalizedWalletAddress,
        sign
      );

      if (isSignVerified) {
        // Generate JWT token for login
        const token = jwt.sign(
          {
            // _id: user.data._id.toString(),
            _id: user.data._id,

            walletAddress: normalizedWalletAddress,
          },
          process.env.JWT_ACCESS_TOKEN_SECRET,
          { expiresIn: "8h" }
        );

        result.data = { user: user.data, token, message: "User Logged In" };
        return result;
      } else {
        result.error = { status: 401, message: "Signature not verified" };
        return result;
      }
    }

    // If user doesn't exist, proceed to register user
    console.log("User not found, registering new user...");

    if (walletAddress) {
      const isSignVerified = cryptoUtils.verifyEthSign(
        normalizedWalletAddress,
        sign
      );
      console.log("isSignVerified", isSignVerified);
      if (isSignVerified) {
        // Proceed to register the user
        const newUser = await usersService.registerwithWalletAddress({
          walletAddress: normalizedWalletAddress,
        });

        console.log("New user registered:", newUser);

        // Generate JWT token for the new user
        const token = jwt.sign(
          {
            _id: newUser.data._id,
            walletAddress: normalizedWalletAddress,
          },
          process.env.JWT_ACCESS_TOKEN_SECRET,
          { expiresIn: "8h" }
        );

        result.data = { user: newUser.data, token, message: "User Registered" };
        return result;
      } else {
        result.error = {
          status: 401,
          message:
            "Signature verification failed: signer address does not match wallet address",
        };
        return result;
      }
    } else {
      result.error = { status: 401, message: "Wallet address is not correct" };
      return result;
    }
  } catch (error) {
    console.error("Error during login/registration:", error);
    result.error = {
      status: 500,
      message: "Error during login or registration: " + error.message,
    };
    return result;
  }
};

exports.loginWithWalletAddress = async (loginData, sign, result = {}) => {
  try {
    const { walletAddress, object } = loginData;

    // Check if the user exists
    let user = await usersService.findUser({
      walletAddress: walletAddress.toLowerCase(),
    });

    if (!user.data) {
      result.error = { status: 401, message: "User Not Found" };
      return result;
    }

    // Verify the signature
    const signerAddr = await ethers.utils.verifyMessage(object.message, sign);
    if (signerAddr !== walletAddress) {
      console.log("message not verified:", object.message, sign);
      result.error = { status: 401, message: "Sign not verified" };
      return result;
    }
    console.log("message verified:", object.message, signerAddr);

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: user.data._id.toString(),
        walletAddress: walletAddress,
        displayName: user.name,
      },
      process.env.JWT_ACCESS_TOKEN_SECRET,
      { expiresIn: "8h" }
    );

    result.data = { user, token };
    return result;
  } catch (error) {
    result.error = {
      status: 500,
      message: "Error during login: " + error.message,
    };
    return result;
  }
};
