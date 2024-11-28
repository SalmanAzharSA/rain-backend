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

exports.login = async function (req, res) {
  try {
    const sign = req.body.sign;
    let walletAddress = req.body.object.address;
    let data = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });
    if (!data) {
      return res.status(401).json({ msg: "User Not Found" });
    }
    console.log("console.log====> e: ", req.body.object);
    if (walletAddress) {
      r = utils.toBuffer(sign.slice(0, 66));
      s = utils.toBuffer("0x" + sign.slice(66, 130));
      v = utils.toBuffer("0x" + sign.slice(130, 132));
      let m = Buffer.from(JSON.stringify(req.body.object));

      const prefix = Buffer.from("\x19Ethereum Signed Message:\n");

      const prefixedMsg = utils.keccak256(
        Buffer.concat([prefix, Buffer.from(String(m.length)), m])
      );

      pub = utils.ecrecover(prefixedMsg, v, r, s);
      adr = "0x" + utils.pubToAddress(pub).toString("hex");
      console.log("console.log====> e: ", adr, walletAddress);
      if (adr.toLowerCase() == walletAddress.toLowerCase()) {
        var token = jwt.sign(
          {
            _id: data._id.toString(),
            walletAddress: walletAddress,
            displayName: data.firstName,
          },
          process.env.JWT_SECRET,
          { expiresIn: 7200000 }
        ); // 2 hours
        return res.status(200).json({ msg: "User LoggedIn", token: token });
      } else {
        console.log("console.log====> e: 2nd", adr);
        return res.status(401).json({ msg: "Sign not verified" });
      }
    } else {
      return res.status(401).json({ msg: "wallet address is not correct" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }
};
