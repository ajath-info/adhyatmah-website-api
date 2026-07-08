const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/articleController");

const verifyToken = require("../../middlewares/jwt-middleware");
const { getAdmin } = require("../../middlewares/getAdmin-middleware");

// List
router.get(
    "/admin/articles",
    verifyToken,
    getAdmin,
    controller.getArticles
);

// Single
router.get(
    "/admin/articles/:id",
    verifyToken,
    getAdmin,
    controller.getArticle
);

// Create
router.post(
    "/admin/articles",
    verifyToken,
    getAdmin,
    controller.createArticle
);

// Update
router.put(
    "/admin/articles/:id",
    verifyToken,
    getAdmin,
    controller.updateArticle
);

// Delete
router.delete(
    "/admin/articles/:id",
    verifyToken,
    getAdmin,
    controller.deleteArticle
);

// Status
router.patch(
    "/admin/articles/status/:id",
    verifyToken,
    getAdmin,
    controller.changeStatus
);

module.exports = router;