import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getUserWatchHistory,
  logOutUser,
  loginUser,
  refreshToken,
  registerUser,
  updateAccoutDetails,
  updateAvatarImage,
  updateCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import multer from "multer";

const router = Router();

router.route("/register").post(
  //its a middleware which will handle upload files before submitting
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),

  registerUser
);

router.route("/login").post(loginUser);

//secured route for logout
//here verifyJWT is user defined middleware
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refreshToken").post(refreshToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account-details").patch(verifyJWT, updateAccoutDetails);
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatarImage);
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/watch-history").get(verifyJWT, getUserWatchHistory);

export default router;
