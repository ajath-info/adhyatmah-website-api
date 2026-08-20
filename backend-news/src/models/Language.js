const mongoose = require("mongoose");

const LanguageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required."],
            trim: true,
            lowercase: true,
            unique: true,
            index: true,
        },
        label: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Language =
    mongoose.models.Language || mongoose.model("Language", LanguageSchema);
module.exports = Language;