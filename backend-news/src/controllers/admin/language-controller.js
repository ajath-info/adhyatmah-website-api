const Language = require("../../models/Language");

/* Get Admin Languages */
const getAdminLanguages = async (req, res) => {
    try {
        const { page: pageQuery, limit: limitQuery } = req.query;

        const limit = parseInt(limitQuery) || 10;
        const page = parseInt(pageQuery) || 1;
        const search = req.query.search || "";
        const searchQuery = {
            $or: [
                { name: { $regex: search, $options: "i" } },
                { label: { $regex: search, $options: "i" } },
            ],
        };

        const skip = limit * (page - 1);

        const totalLanguages = await Language.countDocuments(
            search ? searchQuery : {}
        );

        const languages = await Language.aggregate([
            { $match: search ? searchQuery : {} },
            { $sort: { order: 1, createdAt: 1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    name: 1,
                    label: 1,
                    status: 1,
                    order: 1,
                    createdAt: 1,
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: languages,
            count: Math.ceil(totalLanguages / limit),
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* Get Language by ID */
const getLanguage = async (req, res) => {
    try {
        const language = await Language.findById(req.params.lid);

        res.status(200).json({
            success: true,
            data: language,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* Create New Language */
const createLanguage = async (req, res) => {
    try {
        const { name, label, status, order } = req.body;

        const newLanguage = await Language.create({
            name: name?.trim().toLowerCase(),
            label: label?.trim() || name?.trim(),
            status,
            order,
        });

        res.status(201).json({
            success: true,
            data: newLanguage,
            message: "Language created!",
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* Update Language */
const updateLanguage = async (req, res) => {
    try {
        const { name, label, status, order } = req.body;

        const updatedLanguage = await Language.findByIdAndUpdate(
            req.params.lid,
            {
                ...(name !== undefined && { name: name?.trim().toLowerCase() }),
                ...(label !== undefined && { label: label?.trim() }),
                ...(status !== undefined && { status }),
                ...(order !== undefined && { order }),
            },
            {
                new: true,
            }
        );

        res.status(200).json({
            success: true,
            data: updatedLanguage,
            message: "Language updated!",
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* Delete Language */
const deleteLanguage = async (req, res) => {
    try {
        const language = await Language.findByIdAndDelete(req.params.lid);

        res.status(200).json({
            success: true,
            data: language,
            message: "Language deleted!",
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAdminLanguages,
    getLanguage,
    createLanguage,
    updateLanguage,
    deleteLanguage,
};