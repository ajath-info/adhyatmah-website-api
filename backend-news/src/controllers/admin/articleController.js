const Article = require("../../models/Article");
const Blog = require("../../models/Blog");
const slugify = require("../../utils/slugify");


exports.getArticles = async (req, res) => {

    try {

        let {
            page = 1,
            limit = 10,
            search = "",
            blog = ""
        } = req.query;

        page = Number(page);
        limit = Number(limit);

        const filter = {};

        if (search) {
            filter.title = {
                $regex: search,
                $options: "i"
            };
        }

        if (blog) {
            filter.blog = blog;
        }

        const total = await Article.countDocuments(filter);

        const articles = await Article.find(filter)
            .populate("blog")
            .sort({
                publishedAt: -1
            })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            status: true,
            total,
            page,
            limit,
            data: articles
        });

    } catch (err) {

        res.status(500).json({
            status: false,
            message: err.message
        });

    }

};



exports.getArticle = async (req, res) => {

    try {

        const article = await Article.findById(req.params.id)
            .populate("blog");

        if (!article) {

            return res.status(404).json({
                status: false,
                message: "Article not found"
            });

        }

        res.json({
            status: true,
            data: article
        });

    } catch (err) {

        res.status(500).json({
            status: false,
            message: err.message
        });

    }

};


exports.createArticle = async (req, res) => {

    try {

        const body = req.body;

        const handle = slugify(body.title);

        const exists = await Article.findOne({ handle });

        if (exists) {

            return res.status(400).json({
                status: false,
                message: "Article already exists"
            });

        }

        const article = await Article.create({

            title: body.title,

            handle,

            excerpt: body.excerpt,

            content: body.content,

            image: body.image || {},

            blog: body.blog,

            seoTitle: body.seoTitle,

            seoDescription: body.seoDescription,

            seoKeywords: body.seoKeywords,

            publishedAt: body.publishedAt || new Date(),

            status: true

        });

        await Blog.findByIdAndUpdate(

            body.blog,

            {
                $push: {
                    articles: article._id
                }
            }

        );

        res.json({

            status: true,

            message: "Article Created",

            data: article

        });

    } catch (err) {

        res.status(500).json({

            status: false,

            message: err.message

        });

    }

};


// ===============================
// Update Article
// ===============================
exports.updateArticle = async (req, res) => {
    try {

        const { id } = req.params;
        const body = req.body;

        const article = await Article.findById(id);

        if (!article) {
            return res.status(404).json({
                status: false,
                message: "Article not found"
            });
        }

        const handle = slugify(body.title);

        const duplicate = await Article.findOne({
            handle,
            _id: { $ne: id }
        });

        if (duplicate) {
            return res.status(400).json({
                status: false,
                message: "Article already exists"
            });
        }

        // Category changed
        if (article.blog.toString() !== body.blog) {

            await Blog.findByIdAndUpdate(article.blog, {
                $pull: {
                    articles: article._id
                }
            });

            await Blog.findByIdAndUpdate(body.blog, {
                $addToSet: {
                    articles: article._id
                }
            });

        }

        article.title = body.title;
        article.handle = handle;
        article.excerpt = body.excerpt;
        article.content = body.content;
        article.image = body.image || {};
        article.blog = body.blog;
        article.seoTitle = body.seoTitle;
        article.seoDescription = body.seoDescription;
        article.seoKeywords = body.seoKeywords;
        article.publishedAt = body.publishedAt;

        await article.save();

        return res.json({
            status: true,
            message: "Article Updated",
            data: article
        });

    } catch (err) {

        return res.status(500).json({
            status: false,
            message: err.message
        });

    }
};


// ===============================
// Delete Article
// ===============================
exports.deleteArticle = async (req, res) => {

    try {

        const { id } = req.params;

        const article = await Article.findById(id);

        if (!article) {

            return res.status(404).json({
                status: false,
                message: "Article not found"
            });

        }

        await Blog.findByIdAndUpdate(article.blog, {
            $pull: {
                articles: article._id
            }
        });

        await Article.findByIdAndDelete(id);

        return res.json({
            status: true,
            message: "Article Deleted Successfully"
        });

    } catch (err) {

        return res.status(500).json({
            status: false,
            message: err.message
        });

    }

};


// ===============================
// Change Status
// ===============================
exports.changeStatus = async (req, res) => {

    try {

        const article = await Article.findById(req.params.id);

        if (!article) {

            return res.status(404).json({
                status: false,
                message: "Article not found"
            });

        }

        article.status = !article.status;

        await article.save();

        return res.json({

            status: true,

            message: "Status Updated",

            data: article

        });

    } catch (err) {

        return res.status(500).json({

            status: false,

            message: err.message

        });

    }

};