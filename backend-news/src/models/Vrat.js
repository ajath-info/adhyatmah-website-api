const mongoose = require("mongoose");

// Primary type of the Vrat — drives the filter tabs on the Vrat & Upvas page
// (All Vrat / Ekadashi / Pradosh / Sankashti Chaturthi / Somvar Vrat / ...)
const VRAT_TYPES = [
    "Ekadashi",
    "Pradosh",
    "Sankashti Chaturthi",
    "Somvar Vrat",
    "Mangalvar Vrat",
    "Purnima Vrat",
    "Amavasya Vrat",
    "Navratri Vrat",
    "Other Vrat",
];

// "Filter by Purpose" checkboxes on the sidebar
const VRAT_PURPOSES = [
    "Health & Well-being",
    "Prosperity & Wealth",
    "Marriage & Relationships",
    "Spiritual Growth",
    "Removal of Obstacles",
    "Peace & Happiness",
    "Career & Success",
];

const VratSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required."],
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

        // Stored as YYYY-MM-DD, same convention as the Panchang model
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

        type: {
            type: String,
            enum: VRAT_TYPES,
            required: [true, "Vrat type is required."],
            index: true,
        },

        // Secondary badges shown on the card, e.g. "Highly Auspicious", "Ganesh Ji", "Shiva"
        tags: {
            type: [String],
            default: [],
        },

        purpose: {
            type: [String],
            enum: VRAT_PURPOSES,
            default: [],
        },

        deity: {
            type: String,
            default: "",
        },

        // Tithi / paksha shown as a subtitle, e.g. "Shukla Chaturthi"
        tithi: {
            type: String,
            default: "",
        },

        shortDescription: {
            type: String,
            default: "",
            trim: true,
        },

        description: {
            type: String,
            default: "",
        },

        rituals: {
            type: [String],
            default: [],
        },

        benefits: {
            type: [String],
            default: [],
        },

        image: {
            url: { type: String, default: "" },
            altText: { type: String, default: "" },
        },

        isHighlyAuspicious: {
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

VratSchema.pre("validate", function (next) {
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

VratSchema.index({ date: 1, slug: 1 });
VratSchema.index({ year: 1, month: 1, type: 1 });

const Vrat = mongoose.models.Vrat || mongoose.model("Vrat", VratSchema);

module.exports = Vrat;
module.exports.VRAT_TYPES = VRAT_TYPES;
module.exports.VRAT_PURPOSES = VRAT_PURPOSES;