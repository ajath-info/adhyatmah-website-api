const express = require("express");

const router = express.Router();

const ArticleController = require("../../controllers/admin/articleController");

const verifyToken = require("../../middlewares/jwt-middleware");
const { getAdmin } = require("../../middlewares/getAdmin-middleware");

// Test Route
router.get("/admin/article-test", (req, res) => {
    return res.json({
        success: true,
        message: "Article route working"
    });
});

// Get All Articles
router.get(
    "/admin/articles",
    verifyToken,
    getAdmin,
    ArticleController.getArticles
);

// Get Single Article
router.get(
    "/admin/articles/:id",
    verifyToken,
    getAdmin,
    ArticleController.getArticle
);

// Create Article
router.post(
    "/admin/articles",
    verifyToken,
    getAdmin,
    ArticleController.createArticle
);

// Update Article
router.put(
    "/admin/articles/:id",
    verifyToken,
    getAdmin,
    ArticleController.updateArticle
);

// Delete Article
router.delete(
    "/admin/articles/:id",
    verifyToken,
    getAdmin,
    ArticleController.deleteArticle
);

// Change Status
router.patch(
    "/admin/articles/status/:id",
    verifyToken,
    getAdmin,
    ArticleController.changeStatus
);

module.exports = router;