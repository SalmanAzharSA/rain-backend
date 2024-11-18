const passport = require("passport");
const LocalStrategy = require("../strategies/local.strategy");
// const GoogleStrategy = require('../strategies/google.strategy');
const JWTStrategy = require("../strategies/jwt.strategy");

exports.init = (app) => {
  app.use(passport.initialize());

  // intitialize all strategies with passport
  passport.use(LocalStrategy);
  passport.use(JWTStrategy);
};

exports.passport = passport;
