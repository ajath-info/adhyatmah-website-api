const express = require("express");
const router = express.Router();
const kundaliMatching = require("../../controllers/user/kundali-matching-controller");

// Login is optional — generateKundaliMatch/getKundaliMatchById work for
// guests too, getMyKundaliMatches/deleteKundaliMatch require a token
// internally (see controller).
router.post("/kundali-matching/generate", kundaliMatching.generateKundaliMatch);
router.get("/kundali-matching/mine", kundaliMatching.getMyKundaliMatches);
router.get("/kundali-matching/:kmid", kundaliMatching.getKundaliMatchById);
router.delete("/kundali-matching/:kmid", kundaliMatching.deleteKundaliMatch);

module.exports = router;