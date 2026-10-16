const Vrat = require("../../models/Vrat");
const { VRAT_TYPES, VRAT_PURPOSES } = require("../../models/Vrat");
const slugify = require("../../utils/slugify");

/* List Vrat entries (paginated, searchable, filterable) */
const getAdminVrats = async (req, res) => {
    try {
        const { page: pageQuery, limit: limitQuery, type, year, month, status } =
            req.query;

        const limit = parseInt(limitQuery) || 10;
        const page = parseInt(pageQuery) || 1;
        const search = req.query.search || "";

        const filter = {};

        if (search) {
            filter.title = { $regex: search, $options: "i" };
        }
        if (type && type !== "all") filter.type = type;
        if (year) filter.year = Number(year);
        if (month) filter.month = Number(month);
        if (status === "active") filter.status = true;
        if (status === "inactive") filter.status = false;

        const skip = limit * (page - 1);

        const [entries, total] = await Promise.all([
            Vrat.find(filter).sort({ date: 1 }).skip(skip).limit(limit),
            Vrat.countDocuments(filter),
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
const getVratMeta = async (req, res) => {
    res.status(200).json({
        success: true,
        data: { types: VRAT_TYPES, purposes: VRAT_PURPOSES },
    });
};

/* Get a single Vrat entry by ID */
const getVrat = async (req, res) => {
    try {
        const entry = await Vrat.findById(req.params.vid);
        if (!entry) {
            return res
                .status(404)
                .json({ success: false, message: "Vrat entry not found." });
        }
        res.status(200).json({ success: true, data: entry });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* Create a Vrat entry */
const createVrat = async (req, res) => {
    try {
        const { title, date, type } = req.body;

        if (!title || !date || !type) {
            return res.status(400).json({
                success: false,
                message: "title, date and type are required.",
            });
        }

        let slug = req.body.slug ? slugify(req.body.slug) : slugify(title);

        // ensure slug uniqueness (append the date if there's a clash, e.g.
        // recurring vrats like "Somvar Vrat" repeat every year)
        const existing = await Vrat.findOne({ slug });
        if (existing) {
            slug = `${slug}-${date}`;
        }

        const entry = await Vrat.create({
            title,
            slug,
            date,
            type,
            tags: req.body.tags || [],
            purpose: req.body.purpose || [],
            deity: req.body.deity || "",
            tithi: req.body.tithi || "",
            shortDescription: req.body.shortDescription || "",
            description: req.body.description || "",
            rituals: req.body.rituals || [],
            benefits: req.body.benefits || [],
            image: req.body.image || {},
            isHighlyAuspicious: !!req.body.isHighlyAuspicious,
            metaTitle: req.body.metaTitle || "",
            metaDescription: req.body.metaDescription || "",
            status: req.body.status !== undefined ? !!req.body.status : true,
        });

        res.status(201).json({
            success: true,
            data: entry,
            message: "Vrat entry created!",
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* Update a Vrat entry */
const updateVrat = async (req, res) => {
    try {
        const current = await Vrat.findById(req.params.vid);
        if (!current) {
            return res
                .status(404)
                .json({ success: false, message: "Vrat entry not found." });
        }

        const payload = { ...req.body };

        if (req.body.slug || req.body.title) {
            let slug = slugify(req.body.slug || req.body.title);
            const duplicate = await Vrat.findOne({
                slug,
                _id: { $ne: current._id },
            });
            if (duplicate) {
                slug = `${slug}-${req.body.date || current.date}`;
            }
            payload.slug = slug;
        }

        const updated = await Vrat.findByIdAndUpdate(req.params.vid, payload, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            data: updated,
            message: "Vrat entry updated!",
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* Toggle publish status */
const changeVratStatus = async (req, res) => {
    try {
        const entry = await Vrat.findById(req.params.vid);
        if (!entry) {
            return res
                .status(404)
                .json({ success: false, message: "Vrat entry not found." });
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

/* Delete a Vrat entry */
const deleteVrat = async (req, res) => {
    try {
        const deleted = await Vrat.findByIdAndDelete(req.params.vid);
        res.status(200).json({
            success: true,
            data: deleted,
            message: "Vrat entry deleted!",
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAdminVrats,
    getVratMeta,
    getVrat,
    createVrat,
    updateVrat,
    changeVratStatus,
    deleteVrat,
};