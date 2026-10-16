const Festival = require("../../models/Festival");
const { FESTIVAL_CATEGORIES } = require("../../models/Festival");
const slugify = require("../../utils/slugify");

/* List Festival entries (paginated, searchable, filterable) */
const getAdminFestivals = async (req, res) => {
    try {
        const {
            page: pageQuery,
            limit: limitQuery,
            category,
            year,
            month,
            status,
        } = req.query;

        const limit = parseInt(limitQuery) || 10;
        const page = parseInt(pageQuery) || 1;
        const search = req.query.search || "";

        const filter = {};

        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }
        if (category && category !== "all") filter.category = category;
        if (year) filter.year = Number(year);
        if (month) filter.month = Number(month);
        if (status === "active") filter.status = true;
        if (status === "inactive") filter.status = false;

        const skip = limit * (page - 1);

        const [entries, total] = await Promise.all([
            Festival.find(filter).sort({ date: 1 }).skip(skip).limit(limit),
            Festival.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: entries,
            total,
            page,
            limit,
            count: Math.ceil(total / limit) || 1,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* Static lists for admin form dropdowns */
const getFestivalMeta = async (req, res) => {
    res.status(200).json({
        success: true,
        data: { categories: FESTIVAL_CATEGORIES },
    });
};

/* Get a single Festival entry by ID */
const getFestival = async (req, res) => {
    try {
        const entry = await Festival.findById(req.params.fid);
        if (!entry) {
            return res
                .status(404)
                .json({ success: false, message: "Festival entry not found." });
        }
        res.status(200).json({ success: true, data: entry });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* Create a Festival entry */
const createFestival = async (req, res) => {
    try {
        const { name, date, category } = req.body;

        if (!name || !date || !category) {
            return res.status(400).json({
                success: false,
                message: "name, date and category are required.",
            });
        }

        let slug = req.body.slug ? slugify(req.body.slug) : slugify(name);

        // ensure slug uniqueness (append the date if there's a clash, e.g.
        // recurring festivals like "Kalashtami" repeat every month)
        const existing = await Festival.findOne({ slug });
        if (existing) {
            slug = `${slug}-${date}`;
        }

        const entry = await Festival.create({
            name,
            slug,
            date,
            category,
            blurb: req.body.blurb || "",
            description: req.body.description || "",
            tags: req.body.tags || [],
            image: req.body.image || {},
            isFeatured: !!req.body.isFeatured,
            metaTitle: req.body.metaTitle || "",
            metaDescription: req.body.metaDescription || "",
            status: req.body.status !== undefined ? !!req.body.status : true,
        });

        res.status(201).json({
            success: true,
            data: entry,
            message: "Festival entry created!",
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* Update a Festival entry */
const updateFestival = async (req, res) => {
    try {
        const current = await Festival.findById(req.params.fid);
        if (!current) {
            return res
                .status(404)
                .json({ success: false, message: "Festival entry not found." });
        }

        const payload = { ...req.body };

        if (req.body.slug || req.body.name) {
            let slug = slugify(req.body.slug || req.body.name);
            const duplicate = await Festival.findOne({
                slug,
                _id: { $ne: current._id },
            });
            if (duplicate) {
                slug = `${slug}-${req.body.date || current.date}`;
            }
            payload.slug = slug;
        }

        const updated = await Festival.findByIdAndUpdate(
            req.params.fid,
            payload,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: updated,
            message: "Festival entry updated!",
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* Toggle publish status */
const changeFestivalStatus = async (req, res) => {
    try {
        const entry = await Festival.findById(req.params.fid);
        if (!entry) {
            return res
                .status(404)
                .json({ success: false, message: "Festival entry not found." });
        }
        entry.status = !entry.status;
        await entry.save();
        res.status(200).json({
            success: true,
            data: entry,
            message: "Status updated!",
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* Delete a Festival entry */
const deleteFestival = async (req, res) => {
    try {
        const deleted = await Festival.findByIdAndDelete(req.params.fid);
        res.status(200).json({
            success: true,
            data: deleted,
            message: "Festival entry deleted!",
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAdminFestivals,
    getFestivalMeta,
    getFestival,
    createFestival,
    updateFestival,
    changeFestivalStatus,
    deleteFestival,
};