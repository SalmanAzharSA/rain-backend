const redisClient = require("../../../helpers/redis")

exports.extractSocketId = (userType) => {
  return async (req, res, next) => {
    try {
      const { id } = req.user;
      const socketId = await redisClient.get(`${userType}s:${id}`);
      req.user = {
        ...req.user,
        socketId
      }
      next()
    } catch (ex) {
      next(ex)
    }
  }
} 