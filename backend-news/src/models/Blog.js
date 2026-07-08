const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        handle: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        image: {
            url: {
                type: String,
                default: ""
            },
            altText: {
                type: String,
                default: ""
            }
        },

        status: {
            type: Boolean,
            default: true
        },

        articles: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Article"
        }]

    },
    {
        timestamps: true
    }
);

blogSchema.index({
    title:1
});

blogSchema.index({
    handle:1
});

module.exports = mongoose.model("Blog", blogSchema);