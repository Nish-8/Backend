import mongoose, { isValidObjectId } from "mongoose";
import { Users } from "../models/users.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  console.log("Channel", channelId);

  if (!channelId) {
    throw new ApiError(400, "Channel Id is missing");
  }

  if (!(await Users.findById(channelId))) {
    throw new ApiError(404, "No channel found");
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: req.user?._id,
    channel: channelId,
  });

  console.log("channel", existingSubscription);

  if (existingSubscription) {
    await Subscription.findByIdAndDelete(existingSubscription._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Unsubscribed successfully"));
  } else {
    const subscribe = await Subscription.create({
      subscriber: req.user?._id,
      channel: channelId,
    });

    if (!subscribe) {
      throw new ApiError(500, "Error while subscribing to cahnnel");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, subscribe, "Channel subscribed successfully"));
  }

  const channel = await Subscription.findById(channelId);
  console.log("Channel", channel);
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "channelId is required");
  }

  const subscribersList = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "result",
      },
    },

    {
      $unwind: "$result",
    },

    {
      $group: {
        _id: "$result._id",
        subscriber: {
          $first: "$result",
        },
      },
    },
    {
      $project: {
        "subscriber.fullName": 1,
        "subscriber.username": 1,
        "subscriber.email": 1,
        "subscriber.avatar": 1,
        "subscriber.coverImage": 1,
      },
    },
  ]);

  if (!subscribersList) {
    throw new ApiError(500, "Error while getting subscribers list");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribersList,
        "Subscribers list fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!subscriberId) {
    throw new ApiError(400, "subscriberId is required");
  }

  const channelSubscribedTo = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "result",
      },
    },
    {
      $unwind: "$result",
    },
    {
      $group: {
        _id: "$result._id",
        channel: {
          $first: "$result",
        },
      },
    },
    {
      $project: {
        "channel.fullName": 1,
        "channel.username": 1,
        "channel.email": 1,
        "channel.avatar": 1,
        "channel.coverImage": 1,
      },
    },
  ]);
  if (!channelSubscribedTo) {
    throw new ApiError(500, "Error while getting channels");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelSubscribedTo, "Channels fetched successfully")
    );

  console.log("Subscribed to", channelSubscribedTo);
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
