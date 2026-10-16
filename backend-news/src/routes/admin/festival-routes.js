const express = require("express");
const router = express.Router();
const festival = require("../../controllers/admin/festival-controller");
const verifyToken = require("../../middlewares/jwt-middleware");
const { getAdmin } = require("../../middlewares/getAdmin-middleware");

router.get(
    "/admin/festivals/meta",
    verifyToken,
    getAdmin,
    festival.getFestivalMeta
);

router.get("/admin/festivals", verifyToken, getAdmin, festival.getAdminFestivals);

router.post("/admin/festivals", verifyToken, getAdmin, festival.createFestival);

router.get("/admin/festivals/:fid", verifyToken, getAdmin, festival.getFestival);

router.put(
    "/admin/festivals/:fid",
    verifyToken,
    getAdmin,
    festival.updateFestival
);

router.patch(
    "/admin/festivals/:fid/status",
    verifyToken,
    getAdmin,
    festival.changeFestivalStatus
);

router.delete(
    "/admin/festivals/:fid",
    verifyToken,
    getAdmin,
    festival.deleteFestival
);

module.exports = router;