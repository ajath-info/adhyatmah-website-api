const MasterService = require("../models/MasterService");
const Service = require("../models/Service");
const User = require("../models/User");
const Product = require("../models/Product");
const { KIT_CATEGORY_IDS } = require("../constants/puja-combo");

const kitPrice = (kit) => (kit?.salePrice > 0 ? kit.salePrice : kit?.price) || 0;

// All kits of a combo. Old combos only have `kit`; new ones have `kits`.
const comboKitList = (combo) => {
    const list = Array.isArray(combo?.kits) && combo.kits.length ? combo.kits : combo?.kit ? [combo.kit] : [];
    return list.filter(Boolean);
};
const sumKitPrice = (list) => list.reduce((t, k) => t + kitPrice(k), 0);

// DISPLAY-ONLY "cut" prices (what the site shows struck-through on the Puja / Kit pages).
// Selling prices above (kitPrice / master.price) stay untouched for validation + payment.
const kitMrp = (kit) => Math.max(kit?.price || 0, kitPrice(kit));
const sumKitMrp = (list) => list.reduce((t, k) => t + kitMrp(k), 0);
const pujaMrp = (master) => Math.max(master?.originalPrice || 0, master?.price || 0);

// Active pandits (vendors) who offer this Puja (exact poojaType === MasterService.name,
// same rule the admin price cascade uses).
const getEligiblePandits = async (masterName) => {
    const services = await Service.find({ poojaType: masterName }).select("vendor").lean();
    const ids = [...new Set(services.map((s) => String(s.vendor)))];
    if (!ids.length) return [];
    return User.find({ _id: { $in: ids }, role: "vendor", status: "active" })
        .select("firstName lastName cover experience language city about")
        .lean();
};

// Published kit products in the existing kit categories, tagged with the Puja name.
const getEligibleKits = (masterName) =>
    Product.find({ status: "published", category: { $in: KIT_CATEGORY_IDS }, tags: { $in: [masterName] } })
        .select("name slug price salePrice stockQuantity images tags")
        .lean();

const isKitValid = (kit, masterName) =>
    !!kit &&
    kit.status === "published" &&
    KIT_CATEGORY_IDS.includes(String(kit.category)) &&
    Array.isArray(kit.tags) &&
    kit.tags.includes(masterName);

/**
 * Validate + derive everything from real records. Returns { error } or { master, kit, pandits, originalPrice }.
 */
const validateComboLinks = async ({ masterService, kit, kits, anyEligiblePandit, pandits, comboPrice }) => {
    const master = await MasterService.findById(masterService);
    if (!master) return { error: "Selected Puja Service does not exist" };
    const ids = [...new Set((Array.isArray(kits) && kits.length ? kits : [kit]).filter(Boolean).map(String))];
    if (!ids.length) return { error: "Select at least one Puja Kit" };
    const found = await Product.find({ _id: { $in: ids } }).select("name status category tags price salePrice stockQuantity images");
    if (found.length !== ids.length) return { error: "A selected Puja Kit does not exist" };
    const kitDocs = ids.map((id) => found.find((k) => String(k._id) === id));
    for (const k of kitDocs) {
        if (!isKitValid(k, master.name))
            return { error: `Kit "${k.name}" must be a published product in a Puja Kit category and tagged for this Puja` };
    }

    const eligible = await getEligiblePandits(master.name);
    if (!eligible.length) return { error: "No active Pandit currently offers this Puja" };

    let selected = [];
    if (anyEligiblePandit === false) {
        selected = [...new Set((pandits || []).map(String))];
        if (!selected.length) return { error: "Select at least one Pandit or choose 'Any eligible Pandit'" };
        const eligibleIds = new Set(eligible.map((p) => String(p._id)));
        const bad = selected.filter((id) => !eligibleIds.has(id));
        if (bad.length) return { error: "One or more selected Pandits are not eligible for this Puja" };
    }

    const originalPrice = pujaMrp(master) + sumKitMrp(kitDocs); // same original total the admin form and website show
    const price = Number(comboPrice);
    if (!Number.isFinite(price) || price <= 0) return { error: "Combo price must be a positive number" };
    if (price > originalPrice)
        return { error: `Combo price cannot exceed the original total (₹${originalPrice})` };

    return { master, kit: kitDocs[0], kits: kitDocs, pandits: selected, originalPrice };
};

const discountOf = (comboPrice, originalPrice) => {
    const amount = originalPrice > comboPrice ? originalPrice - comboPrice : 0;
    const percent = amount > 0 && originalPrice > 0 ? Math.round((amount / originalPrice) * 100) : 0;
    return { discountAmount: amount, discountPercent: percent };
};

module.exports = { comboKitList, sumKitPrice, kitPrice, kitMrp, sumKitMrp, pujaMrp, getEligiblePandits, getEligibleKits, validateComboLinks, discountOf, isKitValid };

/**
 * Build the public shape the website UI expects. Returns null when the combo
 * must not be public (Puja inactive, kit unpublished/invalid, no eligible Pandit).
 * `combo` must have masterService and kit populated.
 */
const buildPublicCombo = async (combo, { ignoreStatus = false } = {}) => {
    const master = combo.masterService;
    const kitsList = comboKitList(combo);
    const kit = kitsList[0];
    if (!master || !kit) return null;
    if (!ignoreStatus && (combo.status !== "active" || master.status !== "active")) return null;
    if (!ignoreStatus && !kitsList.every((k) => isKitValid(k, master.name))) return null;

    let pandits = await getEligiblePandits(master.name);
    if (combo.anyEligiblePandit === false) {
        const chosen = new Set((combo.pandits || []).map((p) => String(p._id || p)));
        pandits = pandits.filter((p) => chosen.has(String(p._id)));
    }
    if (!pandits.length && !ignoreStatus) return null;

    // Struck-through price = Puja cut price + every Kit cut price (display only)
    const originalPrice = pujaMrp(master) + sumKitMrp(kitsList);
    const allInStock = kitsList.every((k) => (k.stockQuantity || 0) > 0);
    const { discountAmount, discountPercent } = discountOf(combo.comboPrice, originalPrice);
    const images = (combo.images || []).map((i) => ({ _id: i._id, url: i.url }));
    const image = images[0] || (master.image?.url ? { url: master.image.url } : null);

    const panditPoints =
        pandits.length === 1
            ? [`${pandits[0].firstName} ${pandits[0].lastName}`.trim(), pandits[0].experience ? `${pandits[0].experience} experience` : null].filter(Boolean)
            : [`${pandits.length} verified Pandit Ji available`, "Choose your Pandit Ji at booking"];

    return {
        id: String(combo._id),
        slug: combo.slug,
        name: combo.name,
        shortDescription: combo.shortDescription || "",
        description: combo.description || "",
        benefits: combo.benefits || [],
        image,
        images,
        duration: combo.duration || master.duration || "",
        languages: combo.languages?.length ? combo.languages : [...new Set(pandits.flatMap((p) => p.language || []))],
        comboPrice: combo.comboPrice,
        originalPrice,
        priceBreakup: { pujaPrice: pujaMrp(master), kitPrice: sumKitMrp(kitsList) },
        discountAmount,
        discountPercent,
        panditCount: pandits.length,
        pandit: { points: panditPoints },
        puja: { id: String(master._id), name: master.name, slug: master.slug, points: combo.inclusions || [] },
        kit: { id: String(kit._id), name: kit.name, slug: kit.slug, items: [], inStock: allInStock },
        kits: kitsList.map((k) => ({ id: String(k._id), name: k.name, slug: k.slug, image: k.images?.[0]?.url || "", price: kitPrice(k), inStock: (k.stockQuantity || 0) > 0 })),
        inclusions: combo.inclusions || [],
        exclusions: combo.exclusions || [],
        instructions: combo.instructions || "",
        isFeatured: !!combo.isFeatured,
        displayOrder: combo.displayOrder || 0,
        status: combo.status,
    };
};

module.exports.buildPublicCombo = buildPublicCombo;