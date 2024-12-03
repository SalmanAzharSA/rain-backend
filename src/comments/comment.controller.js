// commentController.js
const commentService = require("./comment.service");
const { StatusCodes } = require("http-status-codes");

exports.createComment = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;

    const createCommentDto = { ...req.body };

    const result = await commentService.createComment(userId, createCommentDto);

    if (result.ex) throw result.ex;

    return res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Comment created successfully",
      data: result.data,
    });
  } catch (ex) {
    next(ex);
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    console.log(req.user, "USERRRR");
    const { _id: userId } = req.user;

    const { commentId } = req.params;
    const updateCommentDto = { ...req.body };

    console.log(
      "commentID",
      commentId,
      "userID",
      userId,
      "updateDTO",
      updateCommentDto
    );
    const result = await commentService.updateComment(
      commentId,
      userId,
      updateCommentDto
    );
    console.log(result, "RESULT");

    // if (result.ex) throw result.ex;
    if (result.ex) {
      return res.status(404).json({
        message: result.ex,
      });
    }

    return res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "comment updated successfully",
      data: result.data,
    });
  } catch (ex) {
    next(ex);
  }
};

exports.commentsListing = async (req, res, next) => {
  try {
    console.log(req.query, "req.query");
    const { limit = 10, offset = 0, poolId } = req.query;

    const commentsListingDto = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      poolId,
    };
    console.log(commentsListingDto, "commentsListingDto");
    const result = await commentService.commentListing(commentsListingDto);

    // if (result.ex) throw result.ex;

    if (result.ex) {
      return res.status(404).json({
        message: result.ex,
      });
    }

    return res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Comments retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (ex) {
    next(ex);
  }
};

exports.likeComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const result = await commentService.likeComment(commentId, userId);

    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        message: result.error,
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

exports.unlikeComment = async (req, res, next) => {
  try {
    const { commentId } = req.params; // Comment ID from the URL
    const userId = req.user._id; // Assuming user ID comes from JWT

    // Call the unlikeComment service
    const result = await commentService.unlikeComment(commentId, userId);

    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        message: result.error,
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
