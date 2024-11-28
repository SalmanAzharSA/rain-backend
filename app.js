require("dotenv").config();
const express = require("express");
const { applyMiddlewares, applyErrorMdiddlewares } = require("./middlewares");
const { initRoutes } = require("./src/router");
const redisClient = require("./helpers/redis");
const { registerSubscribers } = require("./subscribers");
const passportHelper = require("./src/common/auth/passport");
const app = express();

(async () => {
  // initialize redis store


  // Check if Redis should be used
  if (process.env.USE_REDIS === "true") {
    console.log("Initializing Redis...");
    await redisClient.connect();
    console.log("Redis initialized successfully.");
  } else {
    console.log("Redis initialization skipped.");
  }


  // await redisClient.connect();
  // initialize database
  require("./helpers/db");
  // register all event subscribers
  registerSubscribers();
  // initialize passport
  passportHelper.init(app);
})();
// set ejs view engine
app.set("view engine", "ejs");
// configure middlewares globally
applyMiddlewares(app);

// initialize routes
initRoutes(app);

// configure error middlewares
applyErrorMdiddlewares(app);

module.exports = app;
