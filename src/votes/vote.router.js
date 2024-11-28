const express = require('express');
const router = express.Router();
const { validate } = require('express-validation');
const voteController = require('./vote.controller');
// const voteValidation = require('./vote.validation');
const PASSPORT_STRATEGIES = require("../common/auth/constants/passport.strategies.constant");
const { authWithPassport } = require('../common/auth/middlewares/auth.middleware'); // Auth middleware

router.post(
    '/investAndVote',
    [
        // validate(voteValidation.investmentVote, { keyByField: true }), 
        authWithPassport(PASSPORT_STRATEGIES.jwt, { session: false }),
    ],
    voteController.investAndVote
);



module.exports = router;
