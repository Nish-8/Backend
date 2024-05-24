import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { Users } from "../models/users.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cloudinaryFileUpload } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, title, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  const video = await Video.find();

  if (!video) {
    throw new ApiError(400, "Failed in fetching videos");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "All videos fetches successfully"));
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
