const express = require("express");
const router = express.Router();
const c = require("../../controllers/user/puja-combo-controller");
const b = require("../../controllers/user/puja-combo-booking-controller");
const verifyToken = require("../../middlewares/jwt-middleware");

router.get("/puja-combos", c.getPujaCombos);
router.get("/puja-combos/:slug", c.getPujaComboBySlug);

// Combo booking
router.get("/puja-combos/:slug/slots", b.getPujaComboSlots);
router.get("/puja-combos/:slug/pandits", b.getPujaComboPandits);
router.post("/puja-combos/:slug/book", verifyToken, b.bookPujaCombo);

module.exports = router;