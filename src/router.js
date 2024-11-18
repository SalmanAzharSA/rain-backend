const globalRouter = require("express").Router();
const authRouter = require("./auth/auth.router");
const usersRouter = require("./users/users.router");

exports.initRoutes = (app) => {
  app.use("/auth", globalRouter);
  globalRouter.use("/users", usersRouter);
  globalRouter.use("/", authRouter);
};
