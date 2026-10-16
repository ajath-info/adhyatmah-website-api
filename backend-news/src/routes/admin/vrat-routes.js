const express = require("express");
const router = express.Router();
const vrat = require("../../controllers/admin/vrat-controller");
const verifyToken = require("../../middlewares/jwt-middleware");
const { getAdmin } = require("../../middlewares/getAdmin-middleware");

router.get("/admin/vrats/meta", verifyToken, getAdmin, vrat.getVratMeta);

router.get("/admin/vrats", verifyToken, getAdmin, vrat.getAdminVrats);

router.post("/admin/vrats", verifyToken, getAdmin, vrat.createVrat);

router.get("/admin/vrats/:vid", verifyToken, getAdmin, vrat.getVrat);

router.put("/admin/vrats/:vid", verifyToken, getAdmin, vrat.updateVrat);

router.patch(
    "/admin/vrats/:vid/status",
    verifyToken,
    getAdmin,
    vrat.changeVratStatus
);

router.delete("/admin/vrats/:vid", verifyToken, getAdmin, vrat.deleteVrat);

module.exports = router;