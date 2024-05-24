import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

//lets create a file upload method

const cloudinaryFileUpload = async (localFilePath) => {
  try {
    //to upload file on cluodinary
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log(response);
    //if file has been successfully uplaoded
    //console.log("file url",response.url)
    fs.unlinkSync(localFilePath); //unlink file even when file is successfully ipload
    return response;
  } catch (error) {
    console.log("Error while uplaodng file", error);
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

export { cloudinaryFileUpload };
