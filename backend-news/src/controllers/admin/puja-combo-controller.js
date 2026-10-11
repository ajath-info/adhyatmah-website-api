const PujaCombo = require("../../models/PujaCombo");
const MasterService = require("../../models/MasterService");
const slugify = require("../../utils/slugify");
const { validateComboLinks, getEligiblePandits, getEligibleKits, kitPrice, sumKitPrice, kitMrp, sumKitMrp, pujaMrp, comboKitList, discountOf, buildPublicCombo } = require("../../utils/puja-combo-util");

const POPULATE = [
    { path: "masterService", select: "name slug price originalPrice duration image status" },
    { path: "kit", select: "name slug price salePrice stockQuantity images status category tags" },
    { path: "kits", select: "name slug price salePrice stockQuantity images status category tags" },
    { path: "pandits", select: "firstName lastName" },
];

const idOf = (v) => String(v && typeof v === "object" && v._id ? v._id : v || "");
// Accepts new `kits` array; falls back to the old single `kit`.
const kitIdsOf = (b) => {
    const arr = Array.isArray(b.kits) ? b.kits.map(idOf).filter(Boolean) : [];
    if (arr.length) return [...new Set(arr)];
    return b.kit ? [idOf(b.kit)] : [];
};

const clean = (arr) => (Array.isArray(arr) ? arr.map((s) => String(s).trim()).filter(Boolean) : []);

// Normalise admin-form body into model fields (never trusts derived fields).
const pickFields = (b) => ({
    name: String(b.name || "").trim(),
    shortDescription: b.shortDescription || "",
    description: b.description || "",
    benefits: clean(b.benefits),
    images: Array.isArray(b.images) ? b.images.filter((i) => i?._id && i?.url).map((i) => ({ _id: i._id, url: i.url })) : [],
    masterService: b.masterService,
    anyEligiblePandit: b.anyEligiblePandit !== false,
    pandits: Array.isArray(b.pandits) ? b.pandits : [],
    kits: kitIdsOf(b),
    kit: kitIdsOf(b)[0],
    comboPrice: Number(b.comboPrice),
    duration: b.duration || "",
    languages: clean(b.languages),
    inclusions: clean(b.inclusions),
    exclusions: clean(b.exclusions),
    instructions: b.instructions || "",
    displayOrder: Number.isFinite(Number(b.displayOrder)) ? Number(b.displayOrder) : 0,
    isFeatured: !!b.isFeatured,
    status: ["active", "inactive"].includes(b.status) ? b.status : "inactive",
});

const withDerived = (doc) => {
    const o = doc.toObject ? doc.toObject() : doc;
    // Same "cut price" total the website shows (Puja cut price + Kit cut prices)
    const original = pujaMrp(o.masterService) + sumKitMrp(comboKitList(o));
    return { ...o, originalPrice: original, ...discountOf(o.comboPrice, original) };
};

const fail = (res, code, message) => res.status(code).json({ success: false, message });

/* Dropdown data for the admin form */
const getComboOptions = async (req, res) => {
    try {
        const { masterServiceId } = req.query;
        const masters = await MasterService.find({ status: "active" }).select("name slug price originalPrice duration image").sort({ name: 1 }).lean();
        let pandits = [], kits = [];
        if (masterServiceId) {
            const master = masters.find((m) => String(m._id) === masterServiceId) || (await MasterService.findById(masterServiceId).lean());
            if (master) {
                pandits = await getEligiblePandits(master.name);
                kits = (await getEligibleKits(master.name)).map((k) => ({ ...k, effectivePrice: kitPrice(k), effectiveMrp: kitMrp(k) }));
            }
        }
        res.status(200).json({ success: true, data: { masterServices: masters.map((m) => ({ ...m, pujaMrp: pujaMrp(m) })), pandits, kits } });
    } catch (e) {
        fail(res, 400, e.message);
    }
};

const createComboByAdmin = async (req, res) => {
    try {
        const f = pickFields(req.body);
        if (!f.name || !f.masterService || !f.kits.length) return fail(res, 400, "Name, Puja Service and at least one Puja Kit are required");
        const slug = slugify(req.body.slug || f.name);
        if (!slug) return fail(res, 400, "Valid slug is required");
        if (await PujaCombo.findOne({ slug })) return fail(res, 400, "A combo with this slug already exists");

        const v = await validateComboLinks(f);
        if (v.error) return fail(res, 400, v.error);

        const combo = await PujaCombo.create({ ...f, slug, pandits: v.pandits, kit: v.kit._id, kits: v.kits.map((k) => k._id), duration: f.duration || v.master.duration });
        res.status(201).json({ success: true, message: "Combo created successfully", data: combo });
    } catch (e) {
        fail(res, 400, e.message);
    }
};

const getCombosByAdmin = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const { search, status, featured } = req.query;
        const query = { name: { $regex: String(search || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } };
        // archived combos are hidden unless explicitly filtered
        query.status = status ? status : { $ne: "archived" };
        if (featured === "true") query.isFeatured = true;
        if (featured === "false") query.isFeatured = false;

        const total = await PujaCombo.countDocuments(query);
        const docs = await PujaCombo.find(query).populate(POPULATE).sort({ displayOrder: 1, createdAt: -1 }).skip(limit * (page - 1)).limit(limit);
        res.status(200).json({ success: true, data: docs.map(withDerived), total, count: Math.ceil(total / limit), currentPage: page });
    } catch (e) {
        fail(res, 400, e.message);
    }
};

const getOneComboByAdmin = async (req, res) => {
    try {
        const combo = await PujaCombo.findOne({ slug: req.params.slug }).populate(POPULATE);
        if (!combo) return fail(res, 404, "Combo not found");
        res.status(200).json({ success: true, data: withDerived(combo) });
    } catch (e) {
        fail(res, 400, e.message);
    }
};

// Admin preview: same shape the website renders, even for inactive combos
const previewComboByAdmin = async (req, res) => {
    try {
        const combo = await PujaCombo.findOne({ slug: req.params.slug }).populate(POPULATE);
        if (!combo) return fail(res, 404, "Combo not found");
        const data = await buildPublicCombo(combo, { ignoreStatus: true });
        res.status(200).json({ success: true, data });
    } catch (e) {
        fail(res, 400, e.message);
    }
};

const updateComboByAdmin = async (req, res) => {
    try {
        const combo = await PujaCombo.findOne({ slug: req.params.slug });
        if (!combo) return fail(res, 404, "Combo not found");
        if (combo.status === "archived") return fail(res, 400, "Archived combo cannot be edited");

        const f = pickFields({ ...combo.toObject(), ...req.body });
        const nextSlug = slugify(req.body.newSlug || combo.slug);
        if (nextSlug !== combo.slug && (await PujaCombo.findOne({ slug: nextSlug, _id: { $ne: combo._id } })))
            return fail(res, 400, "A combo with this slug already exists");

        const v = await validateComboLinks(f);
        if (v.error) return fail(res, 400, v.error);

        Object.assign(combo, f, { slug: nextSlug, pandits: v.pandits, kit: v.kit._id, kits: v.kits.map((k) => k._id) });
        await combo.save();
        res.status(200).json({ success: true, message: "Combo updated successfully", data: combo });
    } catch (e) {
        fail(res, 400, e.message);
    }
};

const toggleStatusComboByAdmin = async (req, res) => {
    try {
        const combo = await PujaCombo.findOne({ slug: req.params.slug });
        if (!combo) return fail(res, 404, "Combo not found");
        if (combo.status === "archived") return fail(res, 400, "Archived combo cannot be activated");
        combo.status = combo.status === "active" ? "inactive" : "active";
        await combo.save();
        res.status(200).json({ success: true, message: `Combo marked ${combo.status}`, data: combo });
    } catch (e) {
        fail(res, 400, e.message);
    }
};

const toggleFeaturedComboByAdmin = async (req, res) => {
    try {
        const combo = await PujaCombo.findOne({ slug: req.params.slug });
        if (!combo) return fail(res, 404, "Combo not found");
        combo.isFeatured = !combo.isFeatured;
        await combo.save();
        res.status(200).json({ success: true, message: combo.isFeatured ? "Shown on homepage" : "Removed from homepage", data: combo });
    } catch (e) {
        fail(res, 400, e.message);
    }
};

// Soft delete: linked Puja / Pandit / Kit records are never touched.
const archiveComboByAdmin = async (req, res) => {
    try {
        const combo = await PujaCombo.findOne({ slug: req.params.slug });
        if (!combo) return fail(res, 404, "Combo not found");
        combo.status = "archived";
        combo.isFeatured = false;
        await combo.save();
        res.status(200).json({ success: true, message: "Combo archived successfully" });
    } catch (e) {
        fail(res, 400, e.message);
    }
};

module.exports = {
    getComboOptions, createComboByAdmin, getCombosByAdmin, getOneComboByAdmin, previewComboByAdmin,
    updateComboByAdmin, toggleStatusComboByAdmin, toggleFeaturedComboByAdmin, archiveComboByAdmin,
};