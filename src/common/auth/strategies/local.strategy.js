const LocalStrategy = require("passport-local").Strategy;
const authService = require("../../../auth/auth.service");

const localStrategy = new LocalStrategy(
  { usernameField: "userName" },
  async (username, password, done) => {
    try {
      const signInDto = {
        userName: username,
        password,
      };
      const response = await authService.signin(signInDto);

      if (response.ex) throw response.ex;
      console.log(response, "response");
      if (response.isSocialUser) {
        return done(null, false, {
          isSocialUser: true,
          socialType: response.socialType,
        });
      }

      const user = response.data;

      if (!user) {
        return done(null, false, { isCredsInvalid: true });
      }

      if (!user.isEmailVerified) {
        return done(null, false, { isEmailNotVerified: true });
      }

      done(null, user);
    } catch (ex) {
      done(ex, false);
    }
  }
);

module.exports = localStrategy;
