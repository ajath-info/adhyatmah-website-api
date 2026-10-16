// const express = require("express");
// const router = express.Router();
// const panchang = require("../../controllers/user/panchang-controller");
// const apicache = require("apicache");
// const cache = apicache.middleware;

// router.get("/panchang/cities", cache("1 hour"), panchang.getPanchangCities);
// router.get("/panchang/month", cache("30 minutes"), panchang.getMonthPanchang);
// router.get("/panchang", cache("5 minutes"), panchang.getTodayPanchang);
// router.get("/panchang/muhurat", cache("5 minutes"), panchang.getMuhurat);
// router.get("/panchang/muhurat/month", cache("30 minutes"), panchang.getMonthlyMuhurat);
// router.get("/panchang/planetary-transit", cache("5 minutes"), panchang.getPlanetaryTransit);
// router.get("/panchang/planetary-transit/upcoming", cache("30 minutes"), panchang.getUpcomingTransits);

// module.exports = router;




// const express = require("express");
// const router = express.Router();
// const panchang = require("../../controllers/user/panchang-controller");
// const apicache = require("apicache");
// const cache = apicache.middleware;

// router.get("/panchang/cities", cache("1 hour"), panchang.getPanchangCities);
// router.get("/panchang/month", cache("30 minutes"), panchang.getMonthPanchang);
// router.get("/panchang", cache("5 minutes"), panchang.getTodayPanchang);

// module.exports = router;


const express = require("express");
const router = express.Router();
const panchang = require("../../controllers/user/panchang-controller");
const apicache = require("apicache");
const cache = apicache.middleware;

router.get("/panchang/cities", cache("1 hour"), panchang.getPanchangCities);
router.get("/panchang/month", cache("30 minutes"), panchang.getMonthPanchang);
router.get("/panchang", cache("5 minutes"), panchang.getTodayPanchang);
router.get("/panchang/muhurat", cache("5 minutes"), panchang.getMuhurat);
router.get("/panchang/muhurat/month", cache("30 minutes"), panchang.getMonthlyMuhurat);
// apicache caches EVERY response by default, including 4xx/5xx — so if
// getPlanetaryTransit fails even once (e.g. a transient Prokerala
// rate-limit hit), that 503 "temporarily unavailable" body gets cached
// and keeps being served for the full 5 minutes even after the underlying
// issue is gone. onlyStatus200 makes sure only successful responses get
// cached; failures are retried on the very next request.
const onlyStatus200 = (req, res) => res.statusCode === 200;

router.get("/panchang/planetary-transit", cache("5 minutes", onlyStatus200), panchang.getPlanetaryTransit);
router.get("/panchang/planetary-transit/upcoming", cache("30 minutes", onlyStatus200), panchang.getUpcomingTransits);

module.exports = router;