import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
  const connectionInstance = await mongoose.connect(
    `${process.env.MONGODB_URI}/${DB_NAME}`
  );
  console.log(
    `MONGODB CONNECTED !! HOST: ${connectionInstance.connection.host}`
  );

  try {
  } catch (error) {
    console, error("ERROR", error);
    process.exit(1);
  }
};

export default connectDB;
