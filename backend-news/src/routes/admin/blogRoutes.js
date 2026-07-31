const express = require("express");
const router = express.Router();

const BlogController = require("../../controllers/admin/blogController");

const verifyToken = require("../../middlewares/jwt-middleware");
const { getAdmin } = require("../../middlewares/getAdmin-middleware");

router.get("/admin/blog-test", (req, res) => {
    res.json({
        success: true,
        message: "Blog route working"
    });
});

// List
router.get(
    "/admin/blogs",
    verifyToken,
    getAdmin,
    BlogController.getBlogs
);

// Create
router.post(
    "/admin/blogs",
    verifyToken,
    getAdmin,
    BlogController.createBlog
);

// Single
router.get(
    "/admin/blogs/:slug",
    verifyToken,
    getAdmin,
    BlogController.getBlog
);

// Update
router.put(
    "/admin/blogs/:slug",
    verifyToken,
    getAdmin,
    BlogController.updateBlog
);

// Delete
router.delete(
    "/admin/blogs/:slug",
    verifyToken,
    getAdmin,
    BlogController.deleteBlog
);

// Status
router.patch(
    "/admin/blogs/status/:slug",
    verifyToken,
    getAdmin,
    BlogController.changeStatus
);

module.exports = router;