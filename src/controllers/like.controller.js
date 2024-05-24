import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/likes.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { Tweet } from "../models/tweets.models.js";
import { Comment } from "../models/comments.models.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }

  if (!(await Video.findById(videoId))) {
    throw new ApiError(404, "Video not found");
  }

  const existingLike = await Like.findOne({
    //here findOne is used to find that one doc as per matching query
    video: videoId,
    likedBy: req.user?._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Video like removed successfully"));
  } else {
    const likedVideo = await Like.create({
      video: videoId,
      likedBy: req.user?._id,
    });

    if (!likedVideo) {
      throw new ApiError(500, "Error while liking the video");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, likedVideo, "Video Liked successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment

  if (!commentId) {
    throw new ApiError(400, "commentId is required");
  }
  if (!(await Comment.findById(commentId))) {
    throw new ApiError(404, "Comment not found");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Comment like removed successfully"));
  } else {
    const likedComment = await Like.create({
      comment: commentId,
      likedBy: req.user?._id,
    });

    if (!likedComment) {
      throw new ApiError(500, "Error while creating comment like");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, likedComment, "comment liked successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet

  if (!tweetId) {
    throw new ApiError(400, "tweetId is missing");
  }

  if (!(await Tweet.findById(tweetId))) {
    throw new ApiError(404, "No tweet found");
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Tweet like is removed successfully"));
  } else {
    const likedTweet = await Like.create({
      tweet: tweetId,
      likedBy: req.user?._id,
    });

    if (!likedTweet) {
      throw new ApiError(500, "Error while liking the tweet");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, likedTweet, "Tweet liked successfully;"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "result",
      },
    },
    {
      $unwind: "$result",
    },
    {
      $match: {
        result: {
          $ne: null,
        },
      },
    },
    {
      $group: {
        _id: "$result._id",
        video: {
          $first: "$result",
        },
      },
    },
  ]);

  if (!likedVideos) {
    throw new ApiError(500, "Error while getting liked videos");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
