const Article = require("../../models/Article");

exports.getArticles = async (req, res) => {
    try {
        let { page = 1, limit = 12, search = "" } = req.query;
        page = Number(page);
        limit = Number(limit);

        const filter = { status: true };
        if (search) {
            filter.title = { $regex: search, $options: "i" };
        }

        const total = await Article.countDocuments(filter);

        const articles = await Article.find(filter)
            .populate("blog", "title")
            .sort({ publishedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return res.json({ status: true, total, page, limit, data: articles });
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
};

exports.getArticleByHandle = async (req, res) => {
    try {
        const article = await Article.findOne({
            handle: req.params.handle,
            status: true
        }).populate("blog", "title handle");

        if (!article) {
            return res.status(404).json({ status: false, message: "Article not found" });
        }

        return res.json({ status: true, data: article });
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
};

exports.getLatestArticles = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 5;

        const articles = await Article.find({ status: true })
            .populate("blog", "title")
            .sort({ publishedAt: -1 })
            .limit(limit);

        return res.json({ status: true, data: articles });
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
};