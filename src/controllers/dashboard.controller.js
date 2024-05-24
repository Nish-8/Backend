import mongoose, { startSession } from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/likes.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Users } from "../models/users.models.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const channelId = req.user?._id;

  if (!(await Users.findById(channelId))) {
    throw new ApiError(404, "Channel does not exist");
  }

  let likes = await Video.aggregate([
    {
      $match: {
        owner: channelId,
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "$views" },
        totalLikes: { $sum: { $size: "$likes" } },
      },
    },
  ]);

  let subscription = await Users.aggregate([
    {
      $match: {
        username: req.user?.username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        username: 1,
        email: 1,
      },
    },
  ]);

  const { totalViews, totalLikes, totalVideos } = likes[0];

  subscription[0].totalLikes = totalLikes;
  subscription[0].totalVideos = totalVideos;
  subscription[0].totalViews = totalViews;

  if (!likes.length || !subscription.length) {
    throw new ApiError(500, "Error while getting statistics");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { Satistics: subscription },
        "Stats fetched successfully"
      )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel

  const channelId = req.user?._id;
  if (!channelId) {
    throw new ApiError(400, "channelId is missing");
  }

  if (!(await Users.findById(channelId))) {
    throw new ApiError(404, "User does not exist");
  }

  const channelVideos = await Video.aggregate([
    {
      $match: {
        owner: channelId,
        isPublished: true,
      },
    },
  ]);

  if (!channelVideos) {
    throw new ApiError(500, "Error while getting channel videos");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelVideos, "Channel videos fetched successfully")
    );
});

export { getChannelStats, getChannelVideos };
