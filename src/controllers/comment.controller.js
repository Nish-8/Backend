import mongoose from "mongoose";
import { Comment } from "../models/comments.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  if (!(await Video.findById(videoId))) {
    throw new ApiError(404, "Video does not exist");
  }

  const paginate = await Comment.aggregatePaginate(
    Comment.aggregate([
      { $match: { video: new mongoose.Types.ObjectId(videoId) } },
    ]),
    { page, limit }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, paginate, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video

  const { videoId } = req.params;
  const { content } = req.body;

  if (!videoId) {
    throw new ApiError(404, "No video found");
  } else if (!content) {
    throw new ApiError(404, "No content found");
  }

  const videoFile = await Video.findById(videoId);
  if (!videoFile) {
    throw new ApiError(404, "Video not found");
  }
  const createComment = await Comment.create({
    content: content,
    video: videoId,
    owner: req.user?._id,
  });

  if (!createComment) {
    throw new ApiError(500, "Error while creating comment");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, { createComment }, "Successfully commented on video")
    );
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment

  const { commentId } = req.params;
  const { content } = req.body;
  if (!commentId) {
    throw new ApiError(400, "Comment id is required");
  } else if (!content) {
    throw new ApiError(400, "content is required");
  }

  const comment = await Comment.findById(commentId);
  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this comment");
  }
  comment.content = content;
  const updatedComment = await comment.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, { updatedComment }, "Comment updated successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment

  const { commentId } = req.params;
  if (!commentId) {
    throw new console.error(400, "comment id is required");
  }

  const comment = await Comment.findById(commentId);

  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  await Comment.deleteOne({ _id: commentId });

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
