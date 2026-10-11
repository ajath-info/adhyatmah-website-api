const mongoose = require("mongoose");

// MasterService = single source of truth for the public/common
// service catalog AND service price. This is separate from the
// vendor/pandit-specific `Service` model, which continues to be
// managed via Admin -> Pandit Services as before.
const MasterServiceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            unique: true,
        },
        slug: {
            type: String,
            required: [true, "Slug is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        description: {
            type: String,
            default: "",
        },
        duration: {
            type: String,
            required: [true, "Duration is required"],
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
        },
        originalPrice: {
            type: Number,
            default: 0,
        },
        image: {
            url: {
                type: String,
                default: "",
            },
            altText: {
                type: String,
                default: "",
            },
        },
        status: {
            type: String,
            default: "active",
            enum: ["active", "inactive"],
            required: true,
        },
        // Optional admin-managed puja options (e.g. Navratri: Kalash
        // Sthapana / Navdurga Puja). Each has its own price. Empty for
        // every normal puja, so nothing changes for them. Pandits do NOT
        // get separate Service rows for these - they keep their normal
        // Service (poojaType === name) and all variants apply to them.
        variants: {
            type: [
                {
                    _id: false,
                    // Stable id, generated once from the name; never changes.
                    key: { type: String, required: true, trim: true },
                    name: { type: String, required: true, trim: true },
                    price: { type: Number, required: true, min: 1 },
                    originalPrice: { type: Number, default: 0 },
                    duration: { type: String, default: "" },
                    status: {
                        type: String,
                        enum: ["active", "inactive"],
                        default: "active",
                    },
                },
            ],
            default: [],
        },
        // Preserved from the existing static catalog / public listing
        // response. Not used for any business logic.
        views: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const MasterService =
    mongoose.models.MasterService ||
    mongoose.model("MasterService", MasterServiceSchema);

module.exports = MasterService;