const mongoose = require("mongoose");
const User = require("./users.model");

exports.findUser = async (findUserDto, result = {}) => {
  try {
    result.data = await User.findOne({
      walletAddress: findUserDto.walletAddress.toLowerCase(),
    });
    // console.log(user, "USERRRR");
    // result.data = user;
  } catch (ex) {
    result.ex = ex;
  } finally {
    return result;
  }
};

exports.getUsersList = async (getUsersListsDto, result = {}) => {
  try {
    const { limit, offset } = getUsersListsDto;

    const [users, count] = await Promise.all([
      User.find()
        .skip((offset - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.count(),
    ]);
    result.data = {
      users,
      count,
      pages: Math.ceil(count / limit),
    };
  } catch (ex) {
    result.ex = ex;
  } finally {
    return result;
  }
};

exports.findUserBywalletAddress = async (walletAddress) => {
  try {
    const user = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });

    if (!user) {
      return { error: "User doesn't exist" };
    }

    return { data: user };
  } catch (ex) {
    console.error(ex);
    return { error: ex.message };
  }
};

exports.registerwithWalletAddress = async (userData, result = {}) => {
  try {
    // Validate required fields
    if (!userData.walletAddress) {
      result.error = {
        status: 400,
        message: "Wallet address required",
      };
      return result;
    }

    // Create the new user
    const newUser = new User(userData);

    // Save the user to the database
    await newUser.save();

    // Return the newly created user
    result.data = newUser;
    return result;
  } catch (error) {
    // Log and handle error if creation fails
    console.error("Error creating user:", error.message);
    result.error = {
      status: 500,
      message: "Error creating user: " + error.message,
    };
    return result;
  }
};
