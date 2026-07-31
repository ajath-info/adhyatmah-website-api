const express = require("express");
const router = express.Router();
const {
  getAllBookingsByAdmin,
  getBookingsByVendorByAdmin,
  getBookingsByCustomerByAdmin,
  getActivePanditsByAdmin,
  updateBookingByAdmin,
  deleteBookingByAdmin,
} = require("../../controllers/vendor/booking-controller");

const verifyToken = require("../../middlewares/jwt-middleware");
const { getAdmin } = require("../../middlewares/getAdmin-middleware");

router.get("/admin/bookings", verifyToken, getAdmin, getAllBookingsByAdmin);

router.get(
  "/admin/bookings/pandits/active",
  verifyToken,
  getAdmin,
  getActivePanditsByAdmin
);

router.get(
  "/admin/bookings/by-vendor/:vendorId",
  verifyToken,
  getAdmin,
  getBookingsByVendorByAdmin
);

router.get(
  "/admin/bookings/by-customer/:customerId",
  verifyToken,
  getAdmin,
  getBookingsByCustomerByAdmin
);

router.put("/admin/bookings/:id", verifyToken, getAdmin, updateBookingByAdmin);

router.delete("/admin/bookings/:id", verifyToken, getAdmin, deleteBookingByAdmin);

module.exports = router;