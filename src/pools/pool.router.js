const router = require("express").Router();
const { validate } = require("express-validation");
const poolController = require("./pool.controller");
const poolValidation = require("./pool.validation");
const PASSPORT_STRATEGIES = require("../common/auth/constants/passport.strategies.constant");
const {
  authWithPassport,
} = require("../common/auth/middlewares/auth.middleware");

// Route to create a new pool (POST)
router.post(
  "/create-pool",
  [
    validate(poolValidation.createPool, { keyByField: true }),
    authWithPassport(PASSPORT_STRATEGIES.jwt, { session: false }),
  ],
  poolController.createPool
);
// Route for fetching Public Pools
router.get(
  "/public-pools",
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

// Route for fetching Pool By ID
router.get(
  "/pool/:id",
  [
    validate(poolValidation.getPoolById, { keyByField: true }),
    authWithPassport(PASSPORT_STRATEGIES.jwt, { session: false }),
  ],
  poolController.getPoolById
);

router.get(
  "/accessPool",
  [
    validate(poolValidation.accessCodeValidation, { keyByField: true }),
    authWithPassport(PASSPORT_STRATEGIES.jwt, { session: false }),
  ],
  poolController.accessPool
);

router.get(
  "/pool-listing-by-creator",
  [
    // validate(poolValidation.accessCodeValidation, { keyByField: true }),
    authWithPassport(PASSPORT_STRATEGIES.jwt, { session: false }),
  ],
  poolController.poolListingByCreator
);

router.post(
  "/sign-participation",
  [
    validate(poolValidation.signParticipationTransaction, { keyByField: true }),
    // authWithPassport(PASSPORT_STRATEGIES.jwt, { session: false }),
  ],
  poolController.signParticipationTransaction
);

router.post(
  "/sign-swap",
  [
    validate(poolValidation.swapTransaction, { keyByField: true }),
    // authWithPassport(PASSPORT_STRATEGIES.jwt, { session: false }),
  ],
  poolController.signSwapTransaction
);

router.post(
  "/sign-add-liquidity",
  [
    validate(poolValidation.signAddLiquidity, { keyByField: true }),
    // authWithPassport(PASSPORT_STRATEGIES.jwt, { session: false }),
  ],
  poolController.signAddLiquidityTransaction
);

module.exports = router;
