import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

function configureCloudinary() {
  if (isConfigured) {
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  isConfigured = true;
}

export async function uploadDataUriToCloudinary(
  dataUri: string,
  folder = "warehouse",
) {
  configureCloudinary();
  if (!isConfigured) {
    return null;
  }

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
  });
  return result.secure_url;
}
