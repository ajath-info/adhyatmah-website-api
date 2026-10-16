const Vrat = require("../../models/Vrat");
const { VRAT_TYPES, VRAT_PURPOSES } = require("../../models/Vrat");

const todayISO = () => {
    const d = new Date();
    const tzOffsetMs = 5.5 * 60 * 60 * 1000; // IST, matches rest of the panchang stack
    return new Date(d.getTime() + tzOffsetMs).toISOString().slice(0, 10);
};

/* GET /api/vrats
   Supports: ?month=2026-05  (YYYY-MM)  OR  ?year=2026&month=5
             ?type=Ekadashi  (or "all")
             ?purpose=Spiritual Growth  (repeatable: ?purpose=a&purpose=b)
             ?search=akshaya
             ?page=1&limit=8
   Returns the page of entries + typeCounts for the sidebar/tab counters,
   scoped to the same month/search filters (but not the type filter itself)
   so the counts stay meaningful while a tab is selected. */
const getVrats = async (req, res) => {
    try {
        const {
            month: monthParam,
            year: yearParam,
            type,
            search,
            page: pageQuery,
            limit: limitQuery,
        } = req.query;

        const limit = parseInt(limitQuery) || 8;
        const page = parseInt(pageQuery) || 1;

        const baseFilter = { status: true };

        let year = yearParam ? Number(yearParam) : undefined;
        let month = undefined;

        if (monthParam) {
            // accepts "2026-05" or plain "5"
            if (/^\d{4}-\d{1,2}$/.test(monthParam)) {
                const [y, m] = monthParam.split("-").map(Number);
                year = y;
                month = m;
            } else {
                month = Number(monthParam);
            }
        }

        if (year) baseFilter.year = year;
        if (month) baseFilter.month = month;

        if (search) {
            baseFilter.title = { $regex: search, $options: "i" };
        }

        let purpose = req.query.purpose;
        if (purpose) {
            if (!Array.isArray(purpose)) purpose = [purpose];
            baseFilter.purpose = { $in: purpose };
        }

        const filter = { ...baseFilter };
        if (type && type !== "all") filter.type = type;

        const skip = limit * (page - 1);

        const [entries, total, typeCountsAgg] = await Promise.all([
            Vrat.find(filter).sort({ date: 1 }).skip(skip).limit(limit),
            Vrat.countDocuments(filter),
            Vrat.aggregate([
                { $match: baseFilter },
                { $group: { _id: "$type", count: { $sum: 1 } } },
            ]),
        ]);

        const typeCounts = { all: 0 };
        VRAT_TYPES.forEach((t) => (typeCounts[t] = 0));
        typeCountsAgg.forEach(({ _id, count }) => {
            typeCounts[_id] = count;
            typeCounts.all += count;
        });

        res.status(200).json({
            success: true,
            data: entries,
            total,
            page,
            limit,
            count: Math.ceil(total / limit) || 1,
            typeCounts,
            types: VRAT_TYPES,
            purposes: VRAT_PURPOSES,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* GET /api/vrats/today */
const getTodayVrat = async (req, res) => {
    try {
        const entries = await Vrat.find({ date: todayISO(), status: true });
        res.status(200).json({ success: true, data: entries });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* GET /api/vrats/:slug */
const getVratBySlug = async (req, res) => {
    try {
        const entry = await Vrat.findOne({
            slug: req.params.slug,
            status: true,
        });
        if (!entry) {
            return res
                .status(404)
                .json({ success: false, message: "Vrat not found." });
        }

        const related = await Vrat.find({
            type: entry.type,
            _id: { $ne: entry._id },
            status: true,
        })
            .sort({ date: 1 })
            .limit(4);

        res.status(200).json({ success: true, data: entry, related });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    getVrats,
    getTodayVrat,
    getVratBySlug,
};