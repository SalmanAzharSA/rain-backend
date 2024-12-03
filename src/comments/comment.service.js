const Comment = require("./comment.model");

exports.createComment = async (userId, createCommentDto, result = {}) => {
  try {
    const newComment = await Comment.create({
      userId,
      //   poolId,
      //   comment: commentText,
      ...createCommentDto,
      //   likes: [],
    });

    result.data = newComment;
  } catch (ex) {
    result.ex = ex;
  } finally {
    return result;
  }
};

exports.updateComment = async (
  commentId,
  userId,
  updateCommentDto,
  result = {}
) => {
  try {
    console.log(
      "commentId type:",
      typeof commentId,
      "userId type:",
      typeof userId
    );
    console.log("commentId:", commentId, "userId:", userId);
    const updatedComment = await Comment.findOneAndUpdate(
      {
        _id: commentId,
        userId: userId,
        //   _id: mongoose.Types.ObjectId(commentId), // Make sure commentId is an ObjectId
        //   userId: mongoose.Types.ObjectId(userId), // Make sure userId is an ObjectId
      },
      {
        $set: updateCommentDto,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedComment) {
      result.ex =
        "Comment not found or you do not have permission to update this comment";
      return result;
    }
    result.data = updatedComment;
  } catch (ex) {
    result.ex = ex;
  } finally {
    return result;
  }
};

// exports.commentListing = async (commentsListingDto, result = {}) => {
//   try {
//     const { poolId, limit, offset } = commentsListingDto;

//     console.log(commentsListingDto, "commentsListingDto");
//     const commentsListing = await Comment.find({ poolId: poolId })
//       .limit(limit)
//       .skip(offset * limit)
//       .lean();
//     if (!commentsListing || commentsListing.length === 0) {
//       result.ex = "No comments";
//       return result;
//     }

//     const commentsCount = await Comment.countDocuments({ poolId: poolId });
//     console.log(commentsCount, "commentsCount");
//     result.data = { comments: commentsListing, count: commentsCount };
//     result.pagination = {
//       limit: limit,
//       offset: offset,
//       total: commentsCount,
//     };
//   } catch (ex) {
//     result.ex = ex;
//   } finally {
//     return result;
//   }
// };

exports.commentListing = async (commentsListingDto, result = {}) => {
  try {
    const { poolId, limit, offset } = commentsListingDto;

    console.log(commentsListingDto, "commentsListingDto");

    // Fetch all comments for the given pool
    const commentsListing = await Comment.find({ poolId: poolId })
      .limit(limit)
      .skip(offset * limit)
      .lean();

    if (!commentsListing || commentsListing.length === 0) {
      result.ex = "No comments";
      return result;
    }

    // Get the total number of comments
    const commentsCount = await Comment.countDocuments({ poolId: poolId });
    console.log(commentsCount, "commentsCount");

    // Group comments by parentCommentId
    const groupedComments = commentsListing.reduce((acc, comment) => {
      // If it's a parent comment, initialize it with a replies array
      if (!comment.parentCommentId) {
        acc[comment._id] = { ...comment, replies: [] };
      } else {
        // If it's a reply, attach it to its parent comment's replies array
        if (acc[comment.parentCommentId]) {
          acc[comment.parentCommentId].replies.push(comment);
        }
      }
      return acc;
    }, {});

    // Convert the grouped comments back to an array and sort by createdAt
    const resultComments = Object.values(groupedComments).sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Return the result with nested replies
    result.data = { comments: resultComments, count: commentsCount };
    result.pagination = {
      limit: limit,
      offset: offset,
      total: commentsCount,
    };
  } catch (ex) {
    result.ex = ex;
  } finally {
    return result;
  }
};

exports.likeComment = async (commentId, userId) => {
  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return { error: "Comment not found" };
    }

    if (comment.likes.includes(userId)) {
      return { error: "You have already liked this comment" };
    }

    comment.likes.push(userId);

    await comment.save();

    return { success: true, message: "Comment liked successfully" };
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};

exports.unlikeComment = async (commentId, userId) => {
  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return { error: "Comment not found" };
    }

    const index = comment.likes.indexOf(userId);
    if (index === -1) {
      return { error: "You have not liked this comment" };
    }

    comment.likes.splice(index, 1);

    await comment.save();

    return { success: true, message: "Comment unliked successfully" };
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};

// exports.commentListing = async (commentsListingDto, result = {}) => {
//   try {
//     const { poolId, limit, offset } = commentsListingDto;

//     const sanitizedLimit = Math.max(10, limit);
//     const sanitizedOffset = Math.max(0, offset);

//     const commentsPipeline = [
//       { $match: { poolId: poolId } },
//       { $skip: sanitizedOffset * sanitizedLimit },
//       { $limit: sanitizedLimit },
//     ];

//     const comments = await Comment.aggregate(commentsPipeline).exec();

//     const totalCount = await Comment.countDocuments({ poolId: poolId });

//     const pages = Math.ceil(totalCount / sanitizedLimit);

//     result.data = {
//       count: totalCount,
//       comments: comments,
//       pages: pages,
//     };

//     result.pagination = {
//       limit: sanitizedLimit,
//       offset: sanitizedOffset,
//       total: totalCount,
//     };
//   } catch (ex) {
//     result.ex = ex;
//   } finally {
//     return result;
//   }
// };
