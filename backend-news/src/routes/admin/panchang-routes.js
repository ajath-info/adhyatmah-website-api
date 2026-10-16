const express = require("express");
const router = express.Router();
const panchang = require("../../controllers/admin/panchang-controller");
const verifyToken = require("../../middlewares/jwt-middleware");
const { getAdmin } = require("../../middlewares/getAdmin-middleware");

router.get(
  "/admin/panchang",
  verifyToken,
  getAdmin,
  panchang.getAdminPanchangEntries
);

router.get(
  "/admin/panchang/:pid",
  verifyToken,
  getAdmin,
  panchang.getPanchangEntry
);

router.put(
  "/admin/panchang/:pid",
  verifyToken,
  getAdmin,
  panchang.updatePanchangEntry
);

router.delete(
  "/admin/panchang/:pid",
  verifyToken,
  getAdmin,
  panchang.deletePanchangEntry
);

module.exports = router;