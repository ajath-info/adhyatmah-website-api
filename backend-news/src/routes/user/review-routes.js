const express = require("express");
const router = express.Router();
const review = require("../../controllers/user/review-controller");
const serviceReview = require("../../controllers/user/service-review-controller");
const verifyToken = require("../../middlewares/jwt-middleware");
const { getUser } = require("../../middlewares/getUser-middleware");

router.get("/reviews/:pid", review.getReviewsbyPid);
router.post("/products/reviews", verifyToken, getUser, review.createReview);

// Service reviews (same pattern as product reviews above)
router.get("/service-reviews/:sid", serviceReview.getReviewsbySid);
router.post("/services/reviews", verifyToken, getUser, serviceReview.createServiceReview);

module.exports = router;