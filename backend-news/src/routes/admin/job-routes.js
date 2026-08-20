const express = require("express");

const router = express.Router();

const JobController = require("../../controllers/admin/job-controller");

const verifyToken = require("../../middlewares/jwt-middleware");
const { getAdmin } = require("../../middlewares/getAdmin-middleware");

// Get All Jobs
router.get(
    "/admin/careers/jobs",
    verifyToken,
    getAdmin,
    JobController.getJobs
);

// Get Single Job
router.get(
    "/admin/careers/jobs/:id",
    verifyToken,
    getAdmin,
    JobController.getJob
);

// Create Job
router.post(
    "/admin/careers/jobs",
    verifyToken,
    getAdmin,
    JobController.createJob
);

// Update Job
router.put(
    "/admin/careers/jobs/:id",
    verifyToken,
    getAdmin,
    JobController.updateJob
);

// Delete Job
router.delete(
    "/admin/careers/jobs/:id",
    verifyToken,
    getAdmin,
    JobController.deleteJob
);

// Activate / Deactivate Job
router.patch(
    "/admin/careers/jobs/status/:id",
    verifyToken,
    getAdmin,
    JobController.changeStatus
);

module.exports = router;