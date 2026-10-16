const express = require("express");
const router = express.Router();
const vrat = require("../../controllers/user/vrat-controller");
const apicache = require("apicache");
const cache = apicache.middleware;

router.get("/vrats/today", cache("5 minutes"), vrat.getTodayVrat);
router.get("/vrats/:slug", cache("10 minutes"), vrat.getVratBySlug);
router.get("/vrats", cache("10 minutes"), vrat.getVrats);

module.exports = router;