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
