const router = require("express").Router();
const { validate } = require("express-validation");
const usersController = require("./users.controller");
const usersValidation = require("./users.validation");
const PASSPORT_STRATEGIES = require("../common/auth/constants/passport.strategies.constant");
const {
  authWithPassport,
} = require("../common/auth/middlewares/auth.middleware");

router.get(
  "/",
  [
    validate(usersValidation.usersList, { keyByField: true }),
    authWithPassport(PASSPORT_STRATEGIES.jwt, { session: false }),
  ],
  usersController.getUsersList
);

router.get(
  "/find-user-by-wallet-address",
  [
    validate(usersValidation.getUser, { keyByField: true }),
    authWithPassport(PASSPORT_STRATEGIES.jwt, { session: false }),
  ],
  usersController.findUserBywalletAddress
);

module.exports = router;
