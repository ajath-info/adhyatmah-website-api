const express = require("express");
const router = express.Router();
const kundali = require("../../controllers/user/kundali-controller");

// Login is optional — generateKundali/getKundaliById work for guests too,
// getMyKundalis/deleteKundali require a token internally (see controller).
router.post("/kundali/generate", kundali.generateKundali);
router.get("/kundali/mine", kundali.getMyKundalis);
router.get("/kundali/:kid", kundali.getKundaliById);
router.delete("/kundali/:kid", kundali.deleteKundali);

module.exports = router;