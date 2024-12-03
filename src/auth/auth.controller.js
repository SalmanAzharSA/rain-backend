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

// exports.registerUser = async (req, res) => {
//   try {
//     const { walletAddress, sign, name } = req.body;

//     // Validate inputs
//     if (!(sign && name && walletAddress)) {
//       return res.status(400).send("All inputs are required");
//     }

//     // Call the service to handle registration logic
//     const { user, token, error } = await authService.registerUser(req.body, sign);

//     if (error) {
//       return res.status(error.status).json({ msg: error.message });
//     }

//     // Successful registration
//     return res.status(200).json({ status: true, msg: "User Registered", token, user });
//   } catch (error) {
//     return res.status(500).json({ status: false, msg: "Not Created", error: error.message });
//   }
// };

exports.registerWithWalletAddress = async (req, res, next) => {
  try {
    const { sign, name, bio, object } = req.body;

    // console.log(req.body, "REQ?BODYYY");
    if (typeof object === "string") {
      object = JSON.parse(object);
    }
    let walletAddress = object.address;

    // let picture = "";

    // // Handle file upload
    // if (req.file) {
    //   if (req.file.location) {
    //     picture = req.file.location;
    //   }
    // }

    // Validate required fields
    if (!(sign && name && walletAddress)) {
      return res.status(400).send("All inputs are required");
    }

    const registerData = {
      walletAddress,
      sign,
      name,
      bio,
      object,
    };
    // console.log(registerData, "registerData");
    const result = await authService.registerwithWalletAddress(
      registerData,
      sign
    );

    if (result.error) {
      return res
        .status(result.error.status)
        .json({ msg: result.error.message });
    }

    return res.status(200).json({
      status: true,
      msg: "User Registered",
      token: result.data.token,
      user: result.data.user,
    });
  } catch (error) {
    console.log(error, "RTOO");
    next(error);
  }
};

exports.loginWithWalletAddress = async (req, res, next) => {
  try {
    const { sign, object } = req.body;

    if (typeof object === "string") {
      object = JSON.parse(object);
    }

    let walletAddress = object.address;

    // Validate required fields
    if (!(sign && walletAddress)) {
      return res.status(400).send("Sign and wallet address are required");
    }

    const loginData = {
      walletAddress,
      sign,
      object,
    };

    const result = await authService.loginWithWalletAddress(loginData, sign);

    if (result.error) {
      return res
        .status(result.error.status)
        .json({ msg: result.error.message });
    }

    return res.status(200).json({
      status: true,
      msg: "User Logged In",
      token: result.data.token,
      user: result.data.user,
    });
  } catch (error) {
    next(error);
  }
};
