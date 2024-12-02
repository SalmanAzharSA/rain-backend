const globalRouter = require("express").Router();
const authRouter = require("./auth/auth.router");
const usersRouter = require("./users/users.router");
const investmentsRouter = require("./investments/investment.router");
const poolsRouter = require("./pools/pool.router");
const votesRouter = require("./votes/vote.router");
const metadataRouter = require("./metadata/metadata.router");
const commentsRouter = require("./comments/comment.router");

// exports.initRoutes = (app) => {
//   app.use("/auth", globalRouter);

//   globalRouter.use("/users", usersRouter);
//   globalRouter.use("/investments", investmentsRouter);
//   globalRouter.use("/pools", poolsRouter);
//   globalRouter.use("/votes", votesRouter);
//   globalRouter.use("/", authRouter);
// };

exports.initRoutes = (app) => {
  app.use("/auth", authRouter);
  /*----------------------------------*/
  app.use("/users", usersRouter);
  app.use("/investments", investmentsRouter);
  app.use("/pools", poolsRouter);
  app.use("/metadata", metadataRouter);
  app.use("/votes", votesRouter);
  app.use("/comments", commentsRouter);
};
