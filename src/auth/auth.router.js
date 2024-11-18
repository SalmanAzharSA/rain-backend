const router = require("express").Router();
const { validate } = require("express-validation");
const authController = require("./auth.controller");
const authValidation = require("./auth.validation");
const JWT = require("../common/auth/jwt");
const authsMiddleware = require("./auth.middleware");
const {
  authWithPassport,
} = require("../common/auth/middlewares/auth.middleware");
const PASSPORT_STRATEGIES = require("../common/auth/constants/passport.strategies.constant");
router.post(
  "/signin",
  [
    validate(authValidation.signin, { keyByField: true }),
    authWithPassport(PASSPORT_STRATEGIES.local, { session: false }),
  ],
  authController.signin
);
module.exports = router;
