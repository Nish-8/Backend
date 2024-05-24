import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //TODO: create playlist

  if (!(name && description)) {
    throw new ApiError(400, "All fields are required");
  }

  const createdPlaylist = await Playlist.create({
    name: name,
    description: description,
    owner: req.user?._id,
  });

  if (!createPlaylist) {
    throw new ApiError(500, "Error while creating playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, createdPlaylist, "Playlist created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  if (!userId) {
    throw new ApiError(400, "userId is required");
  }

  if (userId.toString() !== req.user?._id.toString()) {
    throw new ApiError(404, "user is not authorized");
  }

  const userPlaylist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);

  if (!userPlaylist) {
    throw new ApiError(500, "Error while finding user's playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, userPlaylist, "User's playlist fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!playlistId) {
    throw new ApiError(400, "Playlist Id is required");
  }

  const playlistById = await Playlist.findById(playlistId);

  if (!playlistById) {
    throw new ApiError(500, "Error while finding playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlistById, "Playlist is fetched successfully")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!(playlistId && videoId)) {
    throw new ApiError(400, "PlaylistId or videoId is missing");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: { videos: videoId }, //addToSet is used to add new doc by checking its not already their
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(500, "Error while adding video to playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video added successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  if (!(playlistId && videoId)) {
    throw new ApiError(400, "playlistId or videoId is missing");
  }

  const deletedVideo = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId },
    },
    { new: true }
  );
  if (!deletedVideo) {
    throw new ApiError(500, "Error while deleting video from playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "video deleted successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  if (!playlistId) {
    throw new ApiError(400, "playlistId is required");
  }

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
  if (!deletedPlaylist) {
    throw new ApiError(500, "Error while deleting playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!(playlistId && name && description)) {
    throw new ApiError(400, "All fields are required");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      name: name,
      description: description,
    },
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new ApiError(500, "Error while updating information");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Information updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
