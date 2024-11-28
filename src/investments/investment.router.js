const router = require('express').Router();
const investmentController = require('./investment.controller');
const { validate } = require('express-validation');
// const investmentValidation = require('./investment.validation');  // Optional: validation for the request

const PASSPORT_STRATEGIES = require('../common/auth/constants/passport.strategies.constant');
const { authWithPassport } = require('../common/auth/middlewares/auth.middleware');

// Route to create or update an investment
// router.post(
//     '/:poolId',
//     [authWithPassport(PASSPORT_STRATEGIES.jwt, { session: false })],
//     investmentController.createInvestment
// );

// Route to get all investments for the user
router.get(
    '/',
    [authWithPassport(PASSPORT_STRATEGIES.jwt, { session: false })],
    investmentController.getUserInvestments
);

// Route to get investment details for a specific pool
router.get(
    '/:poolId/details',
    [authWithPassport(PASSPORT_STRATEGIES.jwt, { session: false })],
    investmentController.getInvestmentDetailsByPool
);

module.exports = router;
