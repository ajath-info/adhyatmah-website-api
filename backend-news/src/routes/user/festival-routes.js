const express = require("express");
const router = express.Router();
const festival = require("../../controllers/user/festival-controller");
const apicache = require("apicache");
const cache = apicache.middleware;

router.get("/festivals/featured", cache("5 minutes"), festival.getFeaturedFestival);
router.get("/festivals/upcoming", cache("10 minutes"), festival.getUpcomingFestivals);
router.get("/festivals/:slug", cache("10 minutes"), festival.getFestivalBySlug);
router.get("/festivals", cache("10 minutes"), festival.getFestivals);

module.exports = router;