const express = require("express");
const router = express.Router();
const kundaliMatching = require("../../controllers/admin/kundali-matching-controller");
const verifyToken = require("../../middlewares/jwt-middleware");
const { getAdmin } = require("../../middlewares/getAdmin-middleware");

router.get(
    "/admin/kundali-matching",
    verifyToken,
    getAdmin,
    kundaliMatching.getAdminKundaliMatchEntries
);

router.get(
    "/admin/kundali-matching/:kmid",
    verifyToken,
    getAdmin,
    kundaliMatching.getKundaliMatchEntry
);

router.delete(
    "/admin/kundali-matching/:kmid",
    verifyToken,
    getAdmin,
    kundaliMatching.deleteKundaliMatchEntry
);

module.exports = router;