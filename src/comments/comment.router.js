const router = require("express").Router();
const commentController = require("./comment.controller");
const { validate } = require("express-validation");

const commentValidation = require("./comment.validation");

const PASSPORT_STRATEGIES = require("../common/auth/constants/passport.strategies.constant");
const {
  authWithPassport,
} = require("../common/auth/middlewares/auth.middleware");

// Route to update comment
router.put(
  "/update-comment/:commentId",
  [
    validate(commentValidation.updateComment),
    authWithPassport(PASSPORT_STRATEGIES.jwt, { session: false }),
  ],

  commentController.updateComment
);

// Route to listing comments
router.get(
  "/comments-listing",
  (res, req, next) => {
    console.log(" listing");
    next();
  },
  [
    validate(commentValidation.commentsListing),
    authWithPassport(PASSPORT_STRATEGIES.jwt, { session: false }),
  ],

  commentController.commentsListing
);
// Route to create comment
router.post(
  "/create-comment",

  [
    validate(commentValidation.createComment),
    authWithPassport(PASSPORT_STRATEGIES.jwt, { session: false }),
  ],
  commentController.createComment
);

// Like a comment
router.post(
  "/like/:commentId",
  [
    validate(commentValidation.likeUnlikeComment),
    authWithPassport(PASSPORT_STRATEGIES.jwt, { session: false }),
  ],
  commentController.likeComment
);

// Unlike a comment
router.post(
  "/unlike/:commentId",
  [
    validate(commentValidation.likeUnlikeComment),
    authWithPassport(PASSPORT_STRATEGIES.jwt, { session: false }),
  ],
  commentController.unlikeComment
);

module.exports = router;
