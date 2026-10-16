const Kundali = require("../../models/Kundali");

/* Get Admin Kundali entries (list, paginated, searchable by name/birthPlace) */
const getAdminKundaliEntries = async (req, res) => {
    try {
        const { page: pageQuery, limit: limitQuery } = req.query;

        const limit = parseInt(limitQuery) || 10;
        const page = parseInt(pageQuery) || 1;
        const search = req.query.search || "";
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { birthPlace: { $regex: search, $options: "i" } },
                ],
            }
            : {};

        const skip = limit * (page - 1);

        const [entries, total] = await Promise.all([
            Kundali.find(searchQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("-raw -rasiChartSvg -navamsaChartSvg"), // keep list view light
            Kundali.countDocuments(searchQuery),
        ]);

        res.status(200).json({
            success: true,
            data: entries,
            total,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* Get a single Kundali entry by ID (full detail, incl. chart SVGs) */
const getKundaliEntry = async (req, res) => {
    try {
        const entry = await Kundali.findById(req.params.kid);
        res.status(200).json({ success: true, data: entry });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* Delete a Kundali entry */
const deleteKundaliEntry = async (req, res) => {
    try {
        const deleted = await Kundali.findByIdAndDelete(req.params.kid);
        res.status(200).json({
            success: true,
            data: deleted,
            message: "Kundali entry deleted!",
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAdminKundaliEntries,
    getKundaliEntry,
    deleteKundaliEntry,
};