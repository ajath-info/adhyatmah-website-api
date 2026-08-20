const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(
    {
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        experience: {
            type: String,
            default: ""
        },

        resume: {
            url: {
                type: String,
                default: ""
            },
            fileName: {
                type: String,
                default: ""
            },
            publicId: {
                type: String,
                default: ""
            },
            // Cloudinary resource type used at upload time ("raw" or "image").
            // PDFs are uploaded as "image" to avoid Cloudinary's default
            // block on delivering raw PDF/ZIP files. Defaults to "raw" for
            // records created before this change.
            resourceType: {
                type: String,
                enum: ["raw", "image"],
                default: "raw"
            },
            format: {
                type: String,
                default: ""
            }
        },

        linkedin: {
            type: String,
            default: ""
        },

        portfolio: {
            type: String,
            default: ""
        },

        coverLetter: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["Applied", "Shortlisted", "Interview", "Selected", "Rejected"],
            default: "Applied"
        }
    },
    {
        timestamps: true
    }
);

jobApplicationSchema.index({ job: 1 });
jobApplicationSchema.index({ status: 1 });
jobApplicationSchema.index({ email: 1 });
jobApplicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("JobApplication", jobApplicationSchema);