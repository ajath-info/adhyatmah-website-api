const express = require("express");
const router = express.Router();
const c = require("../../controllers/admin/puja-combo-controller");
const verifyToken = require("../../middlewares/jwt-middleware");
const { getAdmin } = require("../../middlewares/getAdmin-middleware");

const guard = [verifyToken, getAdmin];
router.get("/admin/puja-combos/options", ...guard, c.getComboOptions);
router.post("/admin/puja-combos", ...guard, c.createComboByAdmin);
router.get("/admin/puja-combos", ...guard, c.getCombosByAdmin);
router.get("/admin/puja-combos/:slug", ...guard, c.getOneComboByAdmin);
router.get("/admin/puja-combos/:slug/preview", ...guard, c.previewComboByAdmin);
router.put("/admin/puja-combos/:slug", ...guard, c.updateComboByAdmin);
router.patch("/admin/puja-combos/:slug/toggle-status", ...guard, c.toggleStatusComboByAdmin);
router.patch("/admin/puja-combos/:slug/toggle-featured", ...guard, c.toggleFeaturedComboByAdmin);
router.delete("/admin/puja-combos/:slug", ...guard, c.archiveComboByAdmin);

module.exports = router;