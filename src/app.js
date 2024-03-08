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

//routes declaration
app.use("/users", userRouter);

export { app };
