const Blog = require("../../models/Blog");
const Article = require("../../models/Article");
const slugify = require("../../utils/slugify");

exports.getBlogs = async (req, res) => {

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

        const total = await Blog.countDocuments(filter);

        const blogs = await Blog.find(filter)
            .populate("articles")
            .sort({
                createdAt: -1
            })
            .skip((page - 1) * limit)
            .limit(limit);

        return res.json({
            status: true,
            total,
            page,
            limit,
            data: blogs
        });

    } catch (err) {

        return res.status(500).json({
            status: false,
            message: err.message
        });

    }

};


exports.createBlog = async (req, res) => {

    try {

        const { title, description } = req.body;

        const handle = slugify(title);

        const exists = await Blog.findOne({
            handle
        });

        if (exists) {

            return res.status(400).json({

                status: false,
                message: "Category already exists"

            });

        }

        const blog = await Blog.create({

            title,

            description,

            handle,

            image: req.body.image || {},

            status: true

        });

        return res.json({

            status: true,

            message: "Category Created",

            data: blog

        });

    } catch (err) {

        return res.status(500).json({

            status: false,

            message: err.message

        });

    }

};


exports.updateBlog = async (req, res) => {

    try {

        const { id } = req.params;

        const { title, description } = req.body;

        const handle = slugify(title);

        const duplicate = await Blog.findOne({

            handle,

            _id: {

                $ne: id

            }

        });

        if (duplicate) {

            return res.status(400).json({

                status: false,

                message: "Category already exists"

            });

        }

        const blog = await Blog.findByIdAndUpdate(

            id,

            {

                title,

                description,

                handle,

                image: req.body.image

            },

            {

                new: true

            }

        );

        return res.json({

            status: true,

            message: "Updated",

            data: blog

        });

    } catch (err) {

        return res.status(500).json({

            status: false,

            message: err.message

        });

    }

};


exports.deleteBlog = async (req, res) => {

    try {

        const { id } = req.params;

        const articleCount = await Article.countDocuments({

            blog: id

        });

        if (articleCount > 0) {

            return res.status(400).json({

                status: false,

                message: "Category contains articles."

            });

        }

        await Blog.findByIdAndDelete(id);

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


exports.changeStatus = async (req, res) => {

    try {

        const blog = await Blog.findById(req.params.id);

        blog.status = !blog.status;

        await blog.save();

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

exports.getBlog = async (req, res) => {

    try {

        const blog = await Blog.findOne({
            handle: req.params.slug
        });

        if (!blog) {

            return res.status(404).json({
                status: false,
                message: "Blog Category not found"
            });

        }

        return res.json({
            status: true,
            data: blog
        });

    } catch (err) {

        return res.status(500).json({
            status: false,
            message: err.message
        });

    }

};