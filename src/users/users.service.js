const mongoose = require("mongoose");
const User = require("./users.model");

exports.findUser = async (findUserDto, result = {}) => {
  try {
    result.data = await User.findOne(findUserDto);
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



exports.findUser = async (query) => {
  try {
    const user = await User.findOne(query);
    return user;
  } catch (error) {
    throw new Error("Error finding user: " + error.message);
  }
};

// Create a new user
// exports.createUser = async (userData) => {
//   try {
//     const newUser = new User(userData);
//     await newUser.save();
//     return newUser;
//   } catch (error) {
//     throw new Error("Error creating user: " + error.message);
//   }
// };
exports.registerwithWalletAddress = async (userData, result = {}) => {
  try {
    // Validate required fields
    if (!userData.walletAddress || !userData.name) {
      result.error = { status: 400, message: "Wallet address and name are required" };
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
    result.error = { status: 500, message: "Error creating user: " + error.message };
    return result;
  }
};


