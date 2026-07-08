const express = require("express");
const router = express.Router();
const { getAllBookingsByAdmin } = require("../../controllers/vendor/booking-controller");

const verifyToken = require("../../middlewares/jwt-middleware");
const { getAdmin } = require("../../middlewares/getAdmin-middleware");

router.get(
  "/admin/bookings",
  verifyToken,
  getAdmin,
  getAllBookingsByAdmin
);

module.exports = router;