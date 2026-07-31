const express = require("express");
const router = express.Router();

const ArticleController = require("../../controllers/user/articleController");

router.get("/articles/latest", ArticleController.getLatestArticles);
router.get("/articles/:handle", ArticleController.getArticleByHandle);
router.get("/articles", ArticleController.getArticles);

module.exports = router;