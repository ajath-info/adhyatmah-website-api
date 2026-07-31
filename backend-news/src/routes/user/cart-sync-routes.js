const express = require("express");
const router = express.Router();
const cartSyncController = require("../../controllers/user/cart-sync-controller");
const verifyToken = require("../../middlewares/jwt-middleware");
const { getUser } = require("../../middlewares/getUser-middleware");

router.get("/cart-sync", verifyToken, getUser, cartSyncController.getSyncedCart);

module.exports = router;