import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

import { Users } from "../models/users.models.js";
import { cloudinaryFileUpload } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    //find that user to genarate token
    const user = await Users.findOne(userId);

    //generate acces and refresh token for that user, we are using this custom method from users.model.js
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    //after successfully generating add this to our User table
    user.refreshToken = refreshToken;

    //save this all updated firlds before validating it
    user.save({ validateBeforeSave: false });

    //after all thing is completed we can successfully return that tokens
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating Token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db (object isliye cuz monogo os nosql db and we usually create objevct and uplaod)
  // remove password and refresh token field from response (to avoid password to be send to user from response that why better to remove it)
  // check for user creation
  // return res

  //1.get details from user
  const { fullName, email, username, password } = req.body;
  // console.log("body", req.body);

  //2.check if fields are empty. yes-error
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //3.check if user already exist from Users Table

  const existingUser = await Users.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "Username and Email must be unique");
  }
  //4.Check for images and avatars

  const avatarLocalPath = req.files?.avatar[0].path; //since we have inserted a middleware in user routes hence apart from bodey multer additionally provide .files methid to handle file
  let coverImageLocalPath = "";

  if (req.files && req.files.coverImage && req.files.coverImage[0]) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // if (Array.isArray(req.files?.coverImage) && req.files.coverImage.length > 0) {
  //   coverImageLocalPath = req.files.coverImage[0].path;
  // }
  //or it can be like this

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // console.log("files", req.files);

  //5.uplaod files on cloudinary

  const avatar = await cloudinaryFileUpload(avatarLocalPath);
  const coverImage = await cloudinaryFileUpload(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  //6. if sab barbar he to object banao and db me entry daal do

  const user = await Users.create({
    fullName,
    avatar: avatar.url, //send onlu url of avatar , can be seen using consolg the
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  //7. remove password and refresh token

  const createdUser = await Users.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError("Something went wrong while creating user");
  }

  //check for user creation

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Succefully"));
});

const loginUser = asyncHandler(async (req, res) => {
  /*
todo

1.req.body=> data
2.check username or email exist
3.user alrady exist
4.password check
5.access and refreshToken
6.send cookie


*/

  //1

  const { username, email, password } = req.body;
  console.log("data", email, username, password);

  if (!(username || email)) {
    throw new ApiError(400, "Username or password is required");
  }

  //2
  const user = await Users.findOne({
    $or: [{ username }, { email }],
  });

  //3
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  //4
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Password is not valid");
  }

  //5. Access and refresh token

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  //to remove unnecessary field to send to user
  const loggedInUser = await Users.findOne(user._id).select(
    "-password -refreshToken"
  );

  // this is object where its properties show that cookie is secure and can be only modified on server side
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200) //sending ststus
    .cookie("accessToken", accessToken, options) //sending cookie with accessToken
    .cookie("refreshToken", refreshToken, options) //sending cookie with refreshToken
    .json(
      //finally sending json respons to user so in case user want to use that refresh and accessToken
      new ApiResponse(
        200,
        {
          loggedInUser,
          accessToken,
          refreshToken,
        },
        "User LoggedIn successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  Users.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

export { registerUser, loginUser, logOutUser };
