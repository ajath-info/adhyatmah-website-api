const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        department: {
            type: String,
            required: true,
            trim: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        employmentType: {
            type: String,
            enum: ["Full-Time", "Part-Time", "Internship", "Contract", "Remote"],
            default: "Full-Time"
        },

        experience: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        responsibilities: {
            type: [String],
            default: []
        },

        requirements: {
            type: [String],
            default: []
        },

        skills: {
            type: [String],
            default: []
        },

        openings: {
            type: Number,
            default: 1
        },

        seoTitle: {
            type: String,
            default: ""
        },

        seoDescription: {
            type: String,
            default: ""
        },

        status: {
            type: Boolean,
            default: true
        },

        postedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

jobSchema.index({ title: 1 });
jobSchema.index({ slug: 1 }, { unique: true });
jobSchema.index({ department: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ postedAt: -1 });

module.exports = mongoose.model("Job", jobSchema);