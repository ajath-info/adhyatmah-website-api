const express = require("express");

const router = express.Router();

const JobApplicationController = require("../../controllers/admin/job-application-controller");

const verifyToken = require("../../middlewares/jwt-middleware");
const { getAdmin } = require("../../middlewares/getAdmin-middleware");

// Career stats (for dashboard)
router.get(
    "/admin/careers/stats",
    verifyToken,
    getAdmin,
    JobApplicationController.getCareerStats
);

// Get All Applications
router.get(
    "/admin/careers/applications",
    verifyToken,
    getAdmin,
    JobApplicationController.getApplications
);

// Get Single Application
router.get(
    "/admin/careers/applications/:id",
    verifyToken,
    getAdmin,
    JobApplicationController.getApplication
);

// Get Signed Resume Download URL
router.get(
    "/admin/careers/applications/:id/resume",
    verifyToken,
    getAdmin,
    JobApplicationController.getResumeDownloadUrl
);

// Update Application Status
router.patch(
    "/admin/careers/applications/status/:id",
    verifyToken,
    getAdmin,
    JobApplicationController.updateApplicationStatus
);

// Delete Application
router.delete(
    "/admin/careers/applications/:id",
    verifyToken,
    getAdmin,
    JobApplicationController.deleteApplication
);

module.exports = router;