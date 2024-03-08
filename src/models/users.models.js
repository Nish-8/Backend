import mongoose, { Schema } from "mongoose";
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";

const usersSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,

      index: true,
      trim: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

usersSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    // encrypt password only if it is updated else just pass the next flag
    return next();
  }
  this.password = bcrypt.hash(this.password, 10); //to hash password using pre middleware of mongoose
  next();
});

usersSchema.methods.isPasswordCorrect = async function (password) {
  //here methods is a  object which allow us to add custom methods
  //just like hashing password bcrypt can be used to compare if password is correct or noy before savong it
  return await bcrypt.compare(password, this.password);
};

usersSchema.methods.generateAccessToken = function () {
  //this are jwt token but vary as per usage
  return jwt.sign(
    //jwt has a sign() method which generate token taking different paload like id, username, email etc.
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
usersSchema.methods.generateRefreshToken = function () {
  //this is also jwt token but vary as oer usage
  return jwt.sign(
    //since its a refresh token hence it does not require all info
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const Users = mongoose.model("Users", usersSchema);
