const mongoose = require("mongoose");

// Category shown as the coloured chip on each festival card + used for the
// filter tabs on the /festivals page. Same taxonomy as the old
// frontend/src/data/festivals-2026.js static file.
const FESTIVAL_CATEGORIES = [
    "Festival",
    "Ekadashi",
    "Pradosh Vrat",
    "Vrat",
    "Purnima",
    "Amavasya",
    "Shubh Din",
];

const FestivalSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required."],
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        // Stored as YYYY-MM-DD, same convention as the Panchang/Vrat models
        date: {
            type: String,
            required: [true, "Date is required."],
            index: true,
        },

        // Derived from `date` on save, kept for fast month/year filtering
        day: { type: Number },
        month: { type: Number, index: true }, // 1-12
        year: { type: Number, index: true },
        weekday: { type: String }, // e.g. "Friday"

        category: {
            type: String,
            enum: FESTIVAL_CATEGORIES,
            required: [true, "Category is required."],
            index: true,
        },

        // Short one-liner shown on the card (was `blurb` in the old static file)
        blurb: {
            type: String,
            default: "",
            trim: true,
        },

        // Optional longer write-up for the festival's detail view
        description: {
            type: String,
            default: "",
        },

        tags: {
            type: [String],
            default: [],
        },

        image: {
            url: { type: String, default: "" },
            altText: { type: String, default: "" },
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

        metaTitle: { type: String, default: "" },
        metaDescription: { type: String, default: "" },

        status: {
            type: Boolean,
            default: true, // published / unpublished
        },
    },
    {
        timestamps: true,
    }
);

FestivalSchema.pre("validate", function (next) {
    if (this.date) {
        const [y, m, d] = this.date.split("-").map(Number);
        if (y && m && d) {
            this.year = y;
            this.month = m;
            this.day = d;
            this.weekday = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(
                "en-US",
                { weekday: "long", timeZone: "UTC" }
            );
        }
    }
    next();
});

FestivalSchema.index({ date: 1, slug: 1 });
FestivalSchema.index({ year: 1, month: 1, category: 1 });

const Festival =
    mongoose.models.Festival || mongoose.model("Festival", FestivalSchema);

module.exports = Festival;
module.exports.FESTIVAL_CATEGORIES = FESTIVAL_CATEGORIES;