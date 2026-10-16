const express = require("express");
const router = express.Router();
const kundali = require("../../controllers/admin/kundali-controller");
const verifyToken = require("../../middlewares/jwt-middleware");
const { getAdmin } = require("../../middlewares/getAdmin-middleware");

router.get(
    "/admin/kundali",
    verifyToken,
    getAdmin,
    kundali.getAdminKundaliEntries
);

router.get(
    "/admin/kundali/:kid",
    verifyToken,
    getAdmin,
    kundali.getKundaliEntry
);

router.delete(
    "/admin/kundali/:kid",
    verifyToken,
    getAdmin,
    kundali.deleteKundaliEntry
);

module.exports = router;