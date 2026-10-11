const PujaCombo = require("../../models/PujaCombo");
const { buildPublicCombo } = require("../../utils/puja-combo-util");

const POPULATE = [
    { path: "masterService", select: "name slug price originalPrice duration image status" },
    { path: "kit", select: "name slug price salePrice stockQuantity images status category tags" },
    { path: "kits", select: "name slug price salePrice stockQuantity images status category tags" },
];

const noStore = (res) => res.set("Cache-Control", "no-store");

/* GET /api/puja-combos?featured=true&limit=5 */
const getPujaCombos = async (req, res) => {
    try {
        noStore(res);
        const query = { status: "active" };
        if (req.query.featured === "true") query.isFeatured = true;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const docs = await PujaCombo.find(query).populate(POPULATE).sort({ displayOrder: 1, createdAt: -1 });
        const built = (await Promise.all(docs.map((d) => buildPublicCombo(d)))).filter(Boolean).slice(0, limit);
        res.status(200).json({ success: true, data: built });
    } catch (e) {
        res.status(500).json({ success: false, message: "Failed to load combos" });
    }
};

/* GET /api/puja-combos/:slug  (also returns related) */
const getPujaComboBySlug = async (req, res) => {
    try {
        noStore(res);
        const slug = String(req.params.slug || "").toLowerCase();
        if (!/^[a-z0-9-]+$/.test(slug)) return res.status(400).json({ success: false, message: "Invalid slug" });
        const doc = await PujaCombo.findOne({ slug, status: "active" }).populate(POPULATE);
        const data = doc ? await buildPublicCombo(doc) : null;
        if (!data) return res.status(404).json({ success: false, message: "Combo not found" });
        res.status(200).json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, message: "Failed to load combo" });
    }
};

module.exports = { getPujaCombos, getPujaComboBySlug };