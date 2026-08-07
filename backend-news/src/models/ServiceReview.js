const mongoose = require("mongoose");

const serviceReviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required."],
        },
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: [true, "Service is required."],
        },
        review: {
            type: String,
            required: [true, "Review is required."],
        },
        rating: {
            type: Number,
            required: [true, "Rating is required."],
        },
        isPurchased: {
            type: Boolean,
            required: [true, "isPurchased is required."],
        },
        images: [
            {
                url: {
                    type: String,
                    required: [true, "Image url is required."],
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const ServiceReview =
    mongoose.models.ServiceReview || mongoose.model("ServiceReview", serviceReviewSchema);

module.exports = ServiceReview;