const express = require("express");
const router = express.Router();
const unifiedHome = require("../../controllers/user/unified-home-controller");

// Single unified endpoint for all homepage data
router.get("/home/unified", unifiedHome.getUnifiedHomeData);

// Paginated "all reviews" endpoint used by the homepage "View All Reviews" popup
router.get("/reviews-all", unifiedHome.getAllReviewsMerged);

module.exports = router;