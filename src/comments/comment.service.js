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

exports.commentListing = async (commentsListingDto, result = {}) => {
  try {
    const { poolId, limit, offset } = commentsListingDto;

    console.log(commentsListingDto, "commentsListingDto");
    const commentsListing = await Comment.find({ poolId: poolId })
      .limit(limit)
      .skip(offset * limit)
      .lean();
    if (!commentsListing || commentsListing.length === 0) {
      result.ex = "No comments";
      return result;
    }

    const commentsCount = await Comment.countDocuments({ poolId: poolId });
    console.log(commentsCount, "commentsCount");
    result.data = { comments: commentsListing, count: commentsCount };
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
