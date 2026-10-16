const Festival = require("../../models/Festival");
const { FESTIVAL_CATEGORIES } = require("../../models/Festival");

const todayISO = () => {
    const d = new Date();
    const tzOffsetMs = 5.5 * 60 * 60 * 1000; // IST, matches rest of the panchang stack
    return new Date(d.getTime() + tzOffsetMs).toISOString().slice(0, 10);
};

/* GET /api/festivals
   Supports: ?month=2026-05  (YYYY-MM)  OR  ?year=2026&month=5
             ?category=Festival  (or "all")
             ?search=diwali
             ?page=1&limit=12
   Returns the page of entries + categoryCounts for the filter tabs,
   scoped to the same month/search filters (but not the category filter
   itself) so the counts stay meaningful while a tab is selected. */
const getFestivals = async (req, res) => {
    try {
        const {
            month: monthParam,
            year: yearParam,
            category,
            search,
            page: pageQuery,
            limit: limitQuery,
        } = req.query;

        const limit = parseInt(limitQuery) || 12;
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
            baseFilter.name = { $regex: search, $options: "i" };
        }

        const filter = { ...baseFilter };
        if (category && category !== "all") filter.category = category;

        const skip = limit * (page - 1);

        const [entries, total, categoryCountsAgg] = await Promise.all([
            Festival.find(filter).sort({ date: 1 }).skip(skip).limit(limit),
            Festival.countDocuments(filter),
            Festival.aggregate([
                { $match: baseFilter },
                { $group: { _id: "$category", count: { $sum: 1 } } },
            ]),
        ]);

        const categoryCounts = { all: 0 };
        FESTIVAL_CATEGORIES.forEach((c) => (categoryCounts[c] = 0));
        categoryCountsAgg.forEach(({ _id, count }) => {
            categoryCounts[_id] = count;
            categoryCounts.all += count;
        });

        res.status(200).json({
            success: true,
            data: entries,
            total,
            page,
            limit,
            count: Math.ceil(total / limit) || 1,
            categoryCounts,
            categories: FESTIVAL_CATEGORIES,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* GET /api/festivals/featured
   Today's festival if there is one, else the next upcoming one — same
   behaviour as the old getFeaturedFestival() helper from the static file. */
const getFeaturedFestival = async (req, res) => {
    try {
        const today = todayISO();

        let entry = await Festival.findOne({ date: today, status: true }).sort({
            date: 1,
        });

        if (!entry) {
            entry = await Festival.findOne({
                date: { $gte: today },
                status: true,
            }).sort({ date: 1 });
        }

        if (!entry) {
            // fall back to the most recent past entry so the page never renders empty
            entry = await Festival.findOne({ status: true }).sort({ date: -1 });
        }

        res.status(200).json({ success: true, data: entry });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* GET /api/festivals/upcoming?limit=10 */
const getUpcomingFestivals = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const entries = await Festival.find({
            date: { $gte: todayISO() },
            status: true,
        })
            .sort({ date: 1 })
            .limit(limit);
        res.status(200).json({ success: true, data: entries });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* GET /api/festivals/:slug */
const getFestivalBySlug = async (req, res) => {
    try {
        const entry = await Festival.findOne({
            slug: req.params.slug,
            status: true,
        });
        if (!entry) {
            return res
                .status(404)
                .json({ success: false, message: "Festival not found." });
        }

        const related = await Festival.find({
            category: entry.category,
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
    getFestivals,
    getFeaturedFestival,
    getUpcomingFestivals,
    getFestivalBySlug,
};