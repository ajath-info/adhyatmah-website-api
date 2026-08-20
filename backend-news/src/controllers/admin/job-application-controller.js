const JobApplication = require("../../models/JobApplication");
const Job = require("../../models/Job");
const { sendEmail } = require("../../utils/mailer-util");
const { cloudinary, configureCloudinary } = require("../../config/cloudinary");

// ===============================
// Get All Applications (Admin)
// ===============================
exports.getApplications = async (req, res) => {

    try {

        let {
            page = 1,
            limit = 10,
            search = "",
            job = "",
            status = ""
        } = req.query;

        page = Number(page);
        limit = Number(limit);

        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } }
            ];
        }

        if (job) {
            filter.job = job;
        }

        if (status) {
            filter.status = status;
        }

        const total = await JobApplication.countDocuments(filter);

        const applications = await JobApplication.find(filter)
            .populate("job", "title department location")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return res.json({

            status: true,
            total,
            page,
            limit,
            count: Math.ceil(total / limit) || 1,
            data: applications

        });

    } catch (err) {

        return res.status(500).json({
            status: false,
            message: err.message
        });

    }

};

// ===============================
// Get Single Application
// ===============================
exports.getApplication = async (req, res) => {

    try {

        const application = await JobApplication.findById(req.params.id)
            .populate("job");

        if (!application) {

            return res.status(404).json({
                status: false,
                message: "Application not found"
            });

        }

        return res.json({
            status: true,
            data: application
        });

    } catch (err) {

        return res.status(500).json({
            status: false,
            message: err.message
        });

    }

};

// ===============================
// Update Application Status
// ===============================
exports.updateApplicationStatus = async (req, res) => {

    try {

        const allowedStatuses = [
            "Applied",
            "Shortlisted",
            "Interview",
            "Selected",
            "Rejected"
        ];

        if (!allowedStatuses.includes(req.body.status)) {

            return res.status(400).json({
                status: false,
                message: "Invalid status value"
            });

        }

        const application = await JobApplication.findById(req.params.id).populate("job", "title");

        if (!application) {

            return res.status(404).json({
                status: false,
                message: "Application not found"
            });

        }

        const previousStatus = application.status;

        application.status = req.body.status;

        await application.save();

        // Only notify the candidate when the status actually changed —
        // avoids duplicate mails if the same status is saved again.
        if (application.status !== previousStatus && application.email) {

            const jobTitle = application.job?.title || "the position";

            const statusMessages = {
                Applied: `Your application for <b>${jobTitle}</b> has been received.`,
                Shortlisted: `Great news! You have been <span style="color:green">shortlisted</span> for <b>${jobTitle}</b>. Our team will reach out with the next steps.`,
                Interview: `You have been moved to the <b>Interview</b> stage for <b>${jobTitle}</b>. Our team will contact you shortly with the details.`,
                Selected: `Congratulations! You have been <span style="color:green">selected</span> for <b>${jobTitle}</b>.`,
                Rejected: `Thank you for your interest in <b>${jobTitle}</b>. At this time, we have decided to move forward with other candidates.`
            };

            const htmlContent = `
                <p>Hello ${application.name || "there"},</p>
                <p>${statusMessages[application.status] || `Your application status for <b>${jobTitle}</b> has been updated to <b>${application.status}</b>.`}</p>
            `;

            try {
                await sendEmail(application.email, "Application Status Update", htmlContent);
            } catch (mailErr) {
                // Don't fail the status update if the email fails to send.
                console.error("Failed to send application status email:", mailErr.message);
            }

        }

        return res.json({

            status: true,
            message: "Application Status Updated",
            data: application

        });

    } catch (err) {

        return res.status(500).json({

            status: false,
            message: err.message

        });

    }

};

// ===============================
// Delete Application
// ===============================
exports.deleteApplication = async (req, res) => {

    try {

        const application = await JobApplication.findById(req.params.id);

        if (!application) {

            return res.status(404).json({
                status: false,
                message: "Application not found"
            });

        }

        await application.deleteOne();

        return res.json({

            status: true,
            message: "Deleted Successfully"

        });

    } catch (err) {

        return res.status(500).json({

            status: false,
            message: err.message

        });

    }

};

// ===============================
// Get Signed Resume Download URL
// (Cloudinary blocks direct/unsigned delivery of raw files like PDFs
// for security reasons, so a signed URL is generated on request.)
// ===============================
exports.getResumeDownloadUrl = async (req, res) => {

    try {

        const application = await JobApplication.findById(req.params.id);

        if (!application || !application.resume?.publicId) {

            return res.status(404).json({
                status: false,
                message: "Resume not found for this application"
            });

        }

        await configureCloudinary();

        const resourceType = application.resume.resourceType || "raw";

        const urlOptions = {
            resource_type: resourceType,
            type: "upload",
            sign_url: true,
            secure: true,
            flags: "attachment",
            // Without this, the SDK inserts a default/wrong "v1" version
            // segment (since we don't store the real upload version),
            // which points at a non-existent file and breaks the link.
            force_version: false
        };

        // "image" resource type (used for PDFs) stores extension separately
        // as "format" instead of keeping it in the public_id.
        if (resourceType === "image" && application.resume.format) {
            urlOptions.format = application.resume.format;
        }

        const signedUrl = cloudinary.url(application.resume.publicId, urlOptions);

        return res.json({

            status: true,
            url: signedUrl

        });

    } catch (err) {

        return res.status(500).json({

            status: false,
            message: err.message

        });

    }

};

// ===============================
// Career Stats (for dashboard widget)
// ===============================
exports.getCareerStats = async (req, res) => {

    try {

        const totalJobs = await Job.countDocuments();
        const activeJobs = await Job.countDocuments({ status: true });
        const totalApplications = await JobApplication.countDocuments();

        const byStatus = await JobApplication.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const statusMap = {
            Applied: 0,
            Shortlisted: 0,
            Interview: 0,
            Selected: 0,
            Rejected: 0
        };

        byStatus.forEach((item) => {
            statusMap[item._id] = item.count;
        });

        return res.json({

            status: true,
            data: {
                totalJobs,
                activeJobs,
                totalApplications,
                statusBreakdown: statusMap
            }

        });

    } catch (err) {

        return res.status(500).json({

            status: false,
            message: err.message

        });

    }

};