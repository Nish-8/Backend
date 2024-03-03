import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express";

const app = express();

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    //to listen for error before app.listen
    app.on("error", (error) => {
      console.log("ERR", error);
      throw error;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log("Server is running at:", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log("DB connect ERROR", error);
  });

//to connect db we can use either noremal fn or IIFE

/*
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log("ERR", error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`app is listening on, ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("ERROR", error);
    throw error;
  }
})();
*/
