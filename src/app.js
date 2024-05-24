import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    //can access many more options from Documentation
  })
);

app.use(express.json({ limit: "16kb" })); // to accept json file and set its limit
app.use(express.urlencoded({ limit: "16kb", extended: true })); //to accpet data from url and config it by encoding it, here extended to accept nested file
app.use(express.static("public")); // to store files and media into public folder

// to securely set and read cookie
app.use(cookieParser());

//routes
import userRouter from "./routes/users.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";

//routes declaration

app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);

app.use((err, req, res, next) => {
  // its a global catch for html error
  return res.json("Something went wrong, please try again");
});

export { app };
