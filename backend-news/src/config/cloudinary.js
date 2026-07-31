const cloudinary = require("cloudinary").v2;
const Settings = require("../models/Settings");

async function configureCloudinary() {
  const settings = await Settings.findOne({
    "general.cloudinary": { $exists: true },
  });

  if (!settings || !settings.general || !settings.general.cloudinary) {
    throw new Error("Cloudinary configuration not found in DB");
  }

  const cloud = settings.general.cloudinary;

  if (
    !cloud.cloudName ||
    cloud.cloudName === "********" ||
    !cloud.apiKey ||
    cloud.apiKey === "********" ||
    !cloud.apiSecret ||
    cloud.apiSecret === "********"
  ) {
    throw new Error(
      "Cloudinary credentials are invalid (masked/missing). Re-enter Cloud Name, API Key and API Secret in Admin → Settings → General."
    );
  }

  cloudinary.config({
    cloud_name: cloud.cloudName,
    api_key: cloud.apiKey,
    api_secret: cloud.apiSecret,
    secure: true,
  });

  return cloud;
}

module.exports = { cloudinary, configureCloudinary };
