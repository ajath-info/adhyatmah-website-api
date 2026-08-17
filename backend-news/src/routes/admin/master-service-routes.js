const express = require("express");
const router = express.Router();
const masterService = require("../../controllers/admin/master-service-controller");
const verifyToken = require("../../middlewares/jwt-middleware");
const { getAdmin } = require("../../middlewares/getAdmin-middleware");

router.post(
    "/admin/master-services",
    verifyToken,
    getAdmin,
    masterService.createMasterServiceByAdmin
);
router.get(
    "/admin/master-services",
    verifyToken,
    getAdmin,
    masterService.getMasterServicesByAdmin
);
router.get(
    "/admin/master-services/:slug",
    verifyToken,
    getAdmin,
    masterService.getOneMasterServiceByAdmin
);
router.put(
    "/admin/master-services/:slug",
    verifyToken,
    getAdmin,
    masterService.updateMasterServiceByAdmin
);
router.patch(
    "/admin/master-services/:slug/toggle-status",
    verifyToken,
    getAdmin,
    masterService.toggleStatusMasterServiceByAdmin
);
router.delete(
    "/admin/master-services/:slug",
    verifyToken,
    getAdmin,
    masterService.deleteMasterServiceByAdmin
);

module.exports = router;