import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { Users } from "../models/users.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cloudinaryFileUpload } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  console.log(userId);
  const pipeline = [];

  // for using Full Text based search u need to create a search index in mongoDB atlas
  // you can include field mapppings in search index eg.title, description, as well
  // Field mappings specify which fields within your documents should be indexed for text search.
  // this helps in seraching only in title, desc providing faster search results
  // here the name of search index is 'search-videos'
  if (query) {
    pipeline.push({
      $search: {
        index: "search-videos",
        text: {
          query: query,
          path: ["title", "description"], //search only on title, desc
        },
      },
    });
  }

  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid userId");
    }

    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }

  // fetch videos only that are set isPublished as true
  pipeline.push({ $match: { isPublished: true } });

  //sortBy can be views, createdAt, duration
  //sortType can be ascending(-1) or descending(1)
  if (sortBy && sortType) {
    pipeline.push({
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              "avatar.url": 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$ownerDetails",
    }
  );

  const videoAggregate = Video.aggregate(pipeline);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const video = await Video.aggregatePaginate(videoAggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if (!(title || description)) {
    throw new ApiError(400, "All fields are required");
  }

  const videoFilePath = req.files?.videoFile[0].path;

  const thumbnailPath = req.files?.thumbnail[0].path;

  if (!videoFilePath) {
    throw new ApiError(400, "Video file is missing");
  } else if (!thumbnailPath) {
    throw new ApiError(400, "Thumbnail is misssing");
  }

  const video = await cloudinaryFileUpload(videoFilePath);
  const thumbnail = await cloudinaryFileUpload(thumbnailPath);

  console.log("Video", video);
  console.log("thumbnail", thumbnail);

  if (!(video || thumbnail)) {
    throw new ApiError(401, "Could not uplaod file");
  }

  const publishVideo = await Video.create({
    videoFile: video?.url,
    thumbnail: thumbnail?.url,
    title,
    description,
    duration: video?.duration || "",
    owner: req.user?._id,
    isPublished: true,
  });

  if (!publishAVideo) {
    throw new ApiError(400, "Error while publishing video");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { publishVideo }, "Video Published successfully")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Could not find Video");
  }

  res.status(200).json(new ApiResponse(200, video, "Video found successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { videoTitle, description } = req.body;
  //TODO: update video details like title, description, thumbnail

  console.log("File", req.file);

  if (!(videoTitle || description)) {
    throw new ApiError(400, "No parameters found to update");
  }

  const thumbnailPath = req.file?.path;

  if (!thumbnailPath) {
    throw new ApiError("Thumbnail not found");
  }

  const thumbnail = await cloudinaryFileUpload(thumbnailPath);
  console.log("Thumnail", thumbnail);

  if (!thumbnail) {
    throw new ApiError(400, "Failed to upload thumbnail");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      title: videoTitle,
      description: description,
      thumbnail: thumbnail?.url || "",
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Details updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  if (!videoId) {
    throw new ApiError(400, "Could not find Video");
  }
  await Video.findByIdAndDelete(videoId);

  res.status(200).json(new ApiResponse(200, "Succesfully deleted video"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "No user found");
  }

  const video = await Video.findById(videoId);
  console.log("Video", Video);

  const updateToggleStatus = await Video.findByIdAndUpdate(
    videoId,
    { isPublished: !video.isPublished },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updateToggleStatus },
        "Publish status toggled successfully"
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
