const Article = require("../../models/Article");
const Blog = require("../../models/Blog");
const slugify = require("../../utils/slugify");


exports.getArticles = async (req, res) => {
    try {

        let {
            page = 1,
            limit = 10,
            search = ""
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

        const total = await Article.countDocuments(filter);

        const articles = await Article.find(filter)
            .populate("blog")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return res.json({
            status: true,
            total,
            page,
            limit,
            data: articles
        });

    } catch (err) {

        return res.status(500).json({
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

        return res.json({
            status: true,
            data: article
        });

    } catch (err) {

        return res.status(500).json({
            status: false,
            message: err.message
        });

    }

};


exports.createArticle = async (req, res) => {

    try {

        const handle = req.body.handle
            ? slugify(req.body.handle)
            : slugify(req.body.title);

        const exists = await Article.findOne({
            handle
        });

        if (exists) {

            return res.status(400).json({
                status: false,
                message: "Article already exists"
            });

        }

        const article = await Article.create({

            title: req.body.title,

            handle,

            excerpt: req.body.excerpt,

            content: req.body.content,

            image: req.body.image,

            blog: req.body.blog,

            seoTitle: req.body.metaTitle,

            seoDescription: req.body.metaDescription,

            publishedAt: new Date(),

            status:
                req.body.status === "active" ||
                req.body.status === true

        });

        await Blog.findByIdAndUpdate(
            req.body.blog,
            {
                $push: {
                    articles: article._id
                }
            }
        );

        return res.json({

            status: true,
            message: "Article Created",
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
// Update Article
// ===============================
exports.updateArticle = async (req, res) => {

    try {

        const article = await Article.findById(req.params.id);

        if (!article) {

            return res.status(404).json({
                status: false,
                message: "Article not found"
            });

        }

        const handle = req.body.handle
            ? slugify(req.body.handle)
            : slugify(req.body.title);

        const duplicate = await Article.findOne({

            handle,

            _id: {
                $ne: article._id
            }

        });

        if (duplicate) {

            return res.status(400).json({

                status: false,
                message: "Article already exists"

            });

        }

        article.title = req.body.title;
        article.handle = handle;
        article.excerpt = req.body.excerpt;
        article.content = req.body.content;
        article.image = req.body.image;
        article.blog = req.body.blog;
        article.seoTitle = req.body.metaTitle;
        article.seoDescription = req.body.metaDescription;
        article.status =
            req.body.status === "active" ||
            req.body.status === true;

        await article.save();

        return res.json({

            status: true,
            message: "Updated Successfully",
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

        const article = await Article.findById(req.params.id);

        if (!article) {

            return res.status(404).json({
                status: false,
                message: "Article not found"
            });

        }

        await Blog.findByIdAndUpdate(
            article.blog,
            {
                $pull: {
                    articles: article._id
                }
            }
        );

        await article.deleteOne();

        return res.json({

            status: true,
            message: "Deleted Successfully"

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

        article.status = !article.status;

        await article.save();

        return res.json({

            status: true,
            message: "Status Updated"

        });

    } catch (err) {

        return res.status(500).json({

            status: false,
            message: err.message

        });

    }

};