const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const configs = require("../../../../configs");

const jwtStrategy = new JWTStrategy(
  {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: configs.jwt.accessToken.secret,
  },
  (jwtPayload, done) => {
    return done(null, jwtPayload);
  }
);

module.exports = jwtStrategy;
