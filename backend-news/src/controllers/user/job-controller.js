const fs = require("fs");
const path = require("path");
const Job = require("../../models/Job");
const JobApplication = require("../../models/JobApplication");
const { cloudinary, configureCloudinary } = require("../../config/cloudinary");

// ===============================
// Get Active Jobs (Public) - with search/filter
// ===============================
exports.getJobs = async (req, res) => {

    try {

        let {
            page = 1,
            limit = 12,
            search = "",
            department = "",
            location = ""
        } = req.query;

        page = Number(page);
        limit = Number(limit);

        const filter = { status: true };

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { department: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
                { skills: { $regex: search, $options: "i" } }
            ];
        }

        if (department) {
            filter.department = department;
        }

        if (location) {
            filter.location = location;
        }

        const total = await Job.countDocuments(filter);

        const jobs = await Job.find(filter)
            .select("title slug department location employmentType experience openings postedAt")
            .sort({ postedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const departments = await Job.distinct("department", { status: true });
        const locations = await Job.distinct("location", { status: true });

        return res.json({

            status: true,
            total,
            page,
            limit,
            departments,
            locations,
            data: jobs

        });

    } catch (err) {

        return res.status(500).json({
            status: false,
            message: err.message
        });

    }

};

// ===============================
// Get Job By Slug (Public)
// ===============================
exports.getJobBySlug = async (req, res) => {

    try {

        const job = await Job.findOne({
            slug: req.params.slug,
            status: true
        });

        if (!job) {

            return res.status(404).json({
                status: false,
                message: "Job not found"
            });

        }

        const relatedJobs = await Job.find({
            _id: { $ne: job._id },
            department: job.department,
            status: true
        })
            .select("title slug department location employmentType experience")
            .limit(3);

        return res.json({
            status: true,
            data: job,
            relatedJobs
        });

    } catch (err) {

        return res.status(500).json({
            status: false,
            message: err.message
        });

    }

};

// ===============================
// Apply To Job (Public) - handles resume upload
// ===============================
exports.applyToJob = async (req, res) => {

    try {

        const {
            job,
            name,
            email,
            phone,
            experience,
            linkedin,
            portfolio,
            coverLetter
        } = req.body;

        if (!name || !email || !phone) {

            return res.status(400).json({
                status: false,
                message: "Name, email and phone are required"
            });

        }

        let jobDoc = null;

        if (job) {

            jobDoc = await Job.findById(job);

            if (!jobDoc) {

                if (req.file?.path) {
                    try { fs.unlinkSync(req.file.path); } catch (_) { }
                }

                return res.status(404).json({
                    status: false,
                    message: "Job not found"
                });

            }

        }

        let resume = { url: "", fileName: "", publicId: "", resourceType: "raw", format: "" };

        if (req.file) {

            const cloud = await configureCloudinary();

            // Cloudinary blocks direct delivery of PDF/ZIP files uploaded as
            // "raw" (a default security restriction on the account). PDFs
            // uploaded as "image" resource type aren't affected by that
            // restriction, so we use "image" for PDFs and keep "raw" for
            // other allowed formats (e.g. Word documents).
            const isPdf = path.extname(req.file.originalname).toLowerCase() === ".pdf";
            const resourceType = isPdf ? "image" : "raw";

            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "career-resumes",
                resource_type: resourceType,
                use_filename: true,
                unique_filename: true
            });

            resume = {
                url: result.secure_url,
                fileName: req.file.originalname,
                publicId: result.public_id,
                resourceType,
                format: result.format || ""
            };

            try { fs.unlinkSync(req.file.path); } catch (_) { }

        }

        const application = await JobApplication.create({

            job: jobDoc ? jobDoc._id : undefined,

            name,
            email,
            phone,
            experience,
            resume,
            linkedin,
            portfolio,
            coverLetter

        });

        return res.json({

            status: true,
            message: "Application submitted successfully",
            data: application

        });

    } catch (err) {

        if (req.file?.path) {
            try { fs.unlinkSync(req.file.path); } catch (_) { }
        }

        return res.status(500).json({
            status: false,
            message: err.message
        });

    }

};