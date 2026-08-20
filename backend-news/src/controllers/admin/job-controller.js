const Job = require("../../models/Job");
const JobApplication = require("../../models/JobApplication");
const slugify = require("../../utils/slugify");

// ===============================
// Get All Jobs (Admin)
// ===============================
exports.getJobs = async (req, res) => {
    try {

        let {
            page = 1,
            limit = 10,
            search = "",
            department = "",
            status = ""
        } = req.query;

        page = Number(page);
        limit = Number(limit);

        const filter = {};

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { department: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } }
            ];
        }

        if (department) {
            filter.department = department;
        }

        if (status === "active") {
            filter.status = true;
        } else if (status === "inactive") {
            filter.status = false;
        }

        const total = await Job.countDocuments(filter);

        const jobs = await Job.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        // application counts per job
        const jobIds = jobs.map((job) => job._id);
        const counts = await JobApplication.aggregate([
            { $match: { job: { $in: jobIds } } },
            { $group: { _id: "$job", count: { $sum: 1 } } }
        ]);

        const countMap = {};
        counts.forEach((item) => {
            countMap[item._id.toString()] = item.count;
        });

        const data = jobs.map((job) => ({
            ...job.toObject(),
            applicationsCount: countMap[job._id.toString()] || 0
        }));

        return res.json({
            status: true,
            total,
            page,
            limit,
            count: Math.ceil(total / limit) || 1,
            data
        });

    } catch (err) {

        return res.status(500).json({
            status: false,
            message: err.message
        });

    }
};

// ===============================
// Get Single Job (Admin)
// ===============================
exports.getJob = async (req, res) => {

    try {

        const job = await Job.findById(req.params.id);

        if (!job) {

            return res.status(404).json({
                status: false,
                message: "Job not found"
            });

        }

        return res.json({
            status: true,
            data: job
        });

    } catch (err) {

        return res.status(500).json({
            status: false,
            message: err.message
        });

    }

};

// ===============================
// Create Job
// ===============================
exports.createJob = async (req, res) => {

    try {

        const slug = req.body.slug
            ? slugify(req.body.slug)
            : slugify(req.body.title);

        const exists = await Job.findOne({ slug });

        if (exists) {

            return res.status(400).json({
                status: false,
                message: "A job with this title/slug already exists"
            });

        }

        const job = await Job.create({

            title: req.body.title,

            slug,

            department: req.body.department,

            location: req.body.location,

            employmentType: req.body.employmentType || "Full-Time",

            experience: req.body.experience,

            description: req.body.description,

            responsibilities: Array.isArray(req.body.responsibilities)
                ? req.body.responsibilities
                : (req.body.responsibilities || "")
                    .split("\n")
                    .map((v) => v.trim())
                    .filter(Boolean),

            requirements: Array.isArray(req.body.requirements)
                ? req.body.requirements
                : (req.body.requirements || "")
                    .split("\n")
                    .map((v) => v.trim())
                    .filter(Boolean),

            skills: Array.isArray(req.body.skills)
                ? req.body.skills
                : (req.body.skills || "")
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean),

            openings: req.body.openings || 1,

            seoTitle: req.body.seoTitle,

            seoDescription: req.body.seoDescription,

            postedAt: new Date(),

            status:
                req.body.status === "active" ||
                req.body.status === true

        });

        return res.json({

            status: true,
            message: "Job Created",
            data: job

        });

    } catch (err) {

        return res.status(500).json({
            status: false,
            message: err.message
        });

    }

};

// ===============================
// Update Job
// ===============================
exports.updateJob = async (req, res) => {

    try {

        const job = await Job.findById(req.params.id);

        if (!job) {

            return res.status(404).json({
                status: false,
                message: "Job not found"
            });

        }

        const slug = req.body.slug
            ? slugify(req.body.slug)
            : slugify(req.body.title);

        const duplicate = await Job.findOne({

            slug,

            _id: {
                $ne: job._id
            }

        });

        if (duplicate) {

            return res.status(400).json({

                status: false,
                message: "A job with this title/slug already exists"

            });

        }

        job.title = req.body.title;
        job.slug = slug;
        job.department = req.body.department;
        job.location = req.body.location;
        job.employmentType = req.body.employmentType || job.employmentType;
        job.experience = req.body.experience;
        job.description = req.body.description;

        job.responsibilities = Array.isArray(req.body.responsibilities)
            ? req.body.responsibilities
            : (req.body.responsibilities || "")
                .split("\n")
                .map((v) => v.trim())
                .filter(Boolean);

        job.requirements = Array.isArray(req.body.requirements)
            ? req.body.requirements
            : (req.body.requirements || "")
                .split("\n")
                .map((v) => v.trim())
                .filter(Boolean);

        job.skills = Array.isArray(req.body.skills)
            ? req.body.skills
            : (req.body.skills || "")
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean);

        job.openings = req.body.openings || job.openings;
        job.seoTitle = req.body.seoTitle;
        job.seoDescription = req.body.seoDescription;

        job.status =
            req.body.status === "active" ||
            req.body.status === true;

        await job.save();

        return res.json({

            status: true,
            message: "Updated Successfully",
            data: job

        });

    } catch (err) {

        return res.status(500).json({

            status: false,
            message: err.message

        });

    }

};

// ===============================
// Delete Job
// ===============================
exports.deleteJob = async (req, res) => {

    try {

        const job = await Job.findById(req.params.id);

        if (!job) {

            return res.status(404).json({
                status: false,
                message: "Job not found"
            });

        }

        await JobApplication.deleteMany({ job: job._id });

        await job.deleteOne();

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
// Change Status (Activate/Deactivate)
// ===============================
exports.changeStatus = async (req, res) => {

    try {

        const job = await Job.findById(req.params.id);

        if (!job) {

            return res.status(404).json({
                status: false,
                message: "Job not found"
            });

        }

        job.status = !job.status;

        await job.save();

        return res.json({

            status: true,
            message: "Status Updated",
            data: job

        });

    } catch (err) {

        return res.status(500).json({

            status: false,
            message: err.message

        });

    }

};