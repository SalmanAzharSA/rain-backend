const router = require("express").Router();
const { validate } = require("express-validation");
const poolController = require("./pool.controller");
const poolValidation = require("./pool.validation"); // Create validation if needed for query params
const PASSPORT_STRATEGIES = require("../common/auth/constants/passport.strategies.constant");
const { authWithPassport } = require("../common/auth/middlewares/auth.middleware");

// Route for fetching Public Pools
router.get(
    "/pools-public",
    [
        validate(poolValidation.poolList, { keyByField: true }),
        authWithPassport(PASSPORT_STRATEGIES.jwt, { session: false }),
    ],
    poolController.getPublicPoolList
);

// Route for fetching Private Pools
router.get(
    "/pools-private",
    [
        validate(poolValidation.poolList, { keyByField: true }),
        authWithPassport(PASSPORT_STRATEGIES.jwt, { session: false }),
    ],
    poolController.getPrivatePoolList
);

module.exports = router;
