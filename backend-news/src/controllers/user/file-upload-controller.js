const fs = require("fs");
const { cloudinary, configureCloudinary } = require("../../config/cloudinary");

/* Unsigned-preset-free image upload (uses Cloudinary API key/secret from settings) */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    const cloud = await configureCloudinary();
    if (
      !cloud?.cloudName ||
      cloud.cloudName === "********" ||
      !cloud?.apiKey ||
      cloud.apiKey === "********" ||
      !cloud?.apiSecret ||
      cloud.apiSecret === "********"
    ) {
      if (req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (_) {}
      }
      return res.status(400).json({
        success: false,
        message:
          "Cloudinary credentials are missing or invalid in Admin Settings. Please re-enter Cloud Name, API Key, API Secret (and optional preset).",
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "pandit-profiles",
      resource_type: "image",
    });

    try {
      fs.unlinkSync(req.file.path);
    } catch (_) {}

    return res.status(200).json({
      success: true,
      public_id: result.public_id,
      secure_url: result.secure_url,
    });
  } catch (error) {
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (_) {}
    }
    return res.status(400).json({
      success: false,
      message: error.message || "Image upload failed",
    });
  }
};

module.exports = { uploadImage };
