
const Panchang = require("../../models/Panchang");

/* Get Admin Panchang cache entries (list, paginated, searchable by city) */
const getAdminPanchangEntries = async (req, res) => {
  try {
    const { page: pageQuery, limit: limitQuery } = req.query;

    const limit = parseInt(limitQuery) || 10;
    const page = parseInt(pageQuery) || 1;
    const search = req.query.search || "";
    const searchQuery = search
      ? {
        $or: [
          { city: { $regex: search, $options: "i" } },
          { date: { $regex: search, $options: "i" } },
        ],
      }
      : {};

    const skip = limit * (page - 1);

    const [entries, total] = await Promise.all([
      Panchang.find(searchQuery).sort({ date: -1 }).skip(skip).limit(limit),
      Panchang.countDocuments(searchQuery),
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

/* Get a single Panchang cache entry by ID */
const getPanchangEntry = async (req, res) => {
  try {
    const entry = await Panchang.findById(req.params.pid);
    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* Manually override/correct a cached Panchang entry */
const updatePanchangEntry = async (req, res) => {
  try {
    const updated = await Panchang.findByIdAndUpdate(
      req.params.pid,
      { ...req.body, source: "manual" },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updated,
      message: "Panchang entry updated!",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* Delete a cached Panchang entry (forces a fresh API fetch next time it's requested) */
const deletePanchangEntry = async (req, res) => {
  try {
    const deleted = await Panchang.findByIdAndDelete(req.params.pid);
    res.status(200).json({
      success: true,
      data: deleted,
      message: "Panchang entry deleted!",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminPanchangEntries,
  getPanchangEntry,
  updatePanchangEntry,
  deletePanchangEntry,
};