const KundaliMatch = require("../../models/KundaliMatch");

/* Get Admin Kundali Match entries (list, paginated, searchable by boy/girl name) */
const getAdminKundaliMatchEntries = async (req, res) => {
    try {
        const { page: pageQuery, limit: limitQuery } = req.query;

        const limit = parseInt(limitQuery) || 10;
        const page = parseInt(pageQuery) || 1;
        const search = req.query.search || "";
        const searchQuery = search
            ? {
                $or: [
                    { "boy.name": { $regex: search, $options: "i" } },
                    { "girl.name": { $regex: search, $options: "i" } },
                ],
            }
            : {};

        const skip = limit * (page - 1);

        const [entries, total] = await Promise.all([
            KundaliMatch.find(searchQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("-raw"), // keep list view light
            KundaliMatch.countDocuments(searchQuery),
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

/* Get a single Kundali Match entry by ID (full detail) */
const getKundaliMatchEntry = async (req, res) => {
    try {
        const entry = await KundaliMatch.findById(req.params.kmid);
        res.status(200).json({ success: true, data: entry });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* Delete a Kundali Match entry */
const deleteKundaliMatchEntry = async (req, res) => {
    try {
        const deleted = await KundaliMatch.findByIdAndDelete(req.params.kmid);
        res.status(200).json({
            success: true,
            data: deleted,
            message: "Kundali match entry deleted!",
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAdminKundaliMatchEntries,
    getKundaliMatchEntry,
    deleteKundaliMatchEntry,
};