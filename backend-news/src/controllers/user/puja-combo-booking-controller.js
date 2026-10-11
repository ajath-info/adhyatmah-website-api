const PujaCombo = require("../../models/PujaCombo");
const Booking = require("../../models/Booking");
const Service = require("../../models/Service");
const User = require("../../models/User");
const { buildPublicCombo, getEligiblePandits, comboKitList } = require("../../utils/puja-combo-util");
const { INSTANT_KIT_CATEGORY_ID } = require("../../constants/puja-combo");

const POPULATE = [
    { path: "masterService", select: "name slug price originalPrice duration image status" },
    { path: "kit", select: "name slug price salePrice stockQuantity images status category tags" },
    { path: "kits", select: "name slug price salePrice stockQuantity images status category tags" },
];

const SLOT_START_MIN = 6 * 60; // 06:00
const SLOT_END_MIN = 18 * 60 + 30; // 18:30
const SLOT_STEP_MIN = 30;
const BLOCK_MS = 2 * 60 * 60 * 1000; // a booking blocks the Pandit +-2h (same rule as existing availability check)
const MIN_LEAD_MS = 3 * 60 * 60 * 1000; // earliest bookable time = now + 3h
const MAX_DAYS_AHEAD = 120;
const PENDING_HOLD_MS = 30 * 60 * 1000; // unpaid (payment_pending) bookings hold a slot for 30 min only

const fail = (res, code, message) => res.status(code).json({ error: true, code, status: 0, message });

const loadBookableCombo = async (slugRaw) => {
    const slug = String(slugRaw || "").toLowerCase();
    if (!/^[a-z0-9-]+$/.test(slug)) return null;
    const doc = await PujaCombo.findOne({ slug, status: "active" }).populate(POPULATE);
    if (!doc) return null;
    const pub = await buildPublicCombo(doc);
    if (!pub) return null;
    return { doc, pub };
};

const getComboPandits = async (doc) => {
    let pandits = await getEligiblePandits(doc.masterService.name);
    if (doc.anyEligiblePandit === false) {
        const chosen = new Set((doc.pandits || []).map((p) => String(p._id || p)));
        pandits = pandits.filter((p) => chosen.has(String(p._id)));
    }
    return pandits;
};

// Bookings that make a Pandit busy inside [from, to]
const getBusyBookings = async (vendorIds, from, to) => {
    if (!vendorIds.length) return [];
    return Booking.find({
        vendor: { $in: vendorIds },
        dateTime: { $gt: from, $lt: to },
        status: { $nin: ["cancel", "completed"] },
        $or: [{ status: { $ne: "payment_pending" } }, { createdAt: { $gte: new Date(Date.now() - PENDING_HOLD_MS) } }],
    })
        .select("vendor dateTime")
        .lean();
};

const isBusyAt = (bookings, vendorId, instant) =>
    bookings.some(
        (b) =>
            String(b.vendor) === String(vendorId) &&
            Math.abs(new Date(b.dateTime).getTime() - instant.getTime()) < BLOCK_MS
    );

// Pandits free at `instant`
const getFreePandits = async (pandits, instant) => {
    const ids = pandits.map((p) => p._id);
    const busy = await getBusyBookings(ids, new Date(instant.getTime() - BLOCK_MS), new Date(instant.getTime() + BLOCK_MS));
    return pandits.filter((p) => !isBusyAt(busy, p._id, instant));
};

// "YYYY-MM-DD" + "HH:mm" in the CUSTOMER's timezone -> real instant.
// tzOffset = client's new Date().getTimezoneOffset() (minutes, e.g. IST = -330)
const toInstant = (date, hhmm, tzOffset) => {
    const [y, m, d] = date.split("-").map(Number);
    const [hh, mm] = hhmm.split(":").map(Number);
    return new Date(Date.UTC(y, m - 1, d, hh, mm) + tzOffset * 60000);
};

const label12 = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

/* GET /api/puja-combos/:slug/slots?date=YYYY-MM-DD&tz=-330 */
const getPujaComboSlots = async (req, res) => {
    try {
        res.set("Cache-Control", "no-store");
        const found = await loadBookableCombo(req.params.slug);
        if (!found) return fail(res, 404, "Combo not found");

        const date = String(req.query.date || "");
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail(res, 400, "Valid date is required");
        const tz = Number.isFinite(Number(req.query.tz)) ? Number(req.query.tz) : 0;

        const dayStart = toInstant(date, "00:00", tz);
        if (Number.isNaN(dayStart.getTime())) return fail(res, 400, "Valid date is required");
        if (dayStart.getTime() > Date.now() + MAX_DAYS_AHEAD * 86400000) return fail(res, 400, "Date is too far ahead");

        const pandits = await getComboPandits(found.doc);
        const ids = pandits.map((p) => p._id);
        const busy = await getBusyBookings(ids, new Date(dayStart.getTime() - BLOCK_MS), new Date(dayStart.getTime() + 86400000 + BLOCK_MS));

        const earliest = Date.now() + MIN_LEAD_MS;
        const slots = [];
        for (let t = SLOT_START_MIN; t <= SLOT_END_MIN; t += SLOT_STEP_MIN) {
            const hhmm = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
            const instant = toInstant(date, hhmm, tz);
            let available = instant.getTime() >= earliest;
            if (available) available = pandits.some((p) => !isBusyAt(busy, p._id, instant));
            slots.push({ time: hhmm, label: label12(hhmm), available });
        }

        res.status(200).json({ error: false, code: 200, status: 1, payload: { date, slots } });
    } catch (e) {
        console.error("getPujaComboSlots:", e);
        fail(res, 500, "Failed to load time slots");
    }
};

/* GET /api/puja-combos/:slug/pandits?dateTime=ISO  (dateTime optional -> adds `available`) */
const getPujaComboPandits = async (req, res) => {
    try {
        res.set("Cache-Control", "no-store");
        const found = await loadBookableCombo(req.params.slug);
        if (!found) return fail(res, 404, "Combo not found");
        const pandits = await getComboPandits(found.doc);

        let freeIds = null;
        if (req.query.dateTime) {
            const instant = new Date(String(req.query.dateTime));
            if (!Number.isNaN(instant.getTime())) {
                freeIds = new Set((await getFreePandits(pandits, instant)).map((p) => String(p._id)));
            }
        }

        res.status(200).json({
            error: false,
            code: 200,
            status: 1,
            payload: {
                availableCount: freeIds ? freeIds.size : pandits.length,
                pandits: pandits.map((p) => ({
                    id: String(p._id),
                    name: `${p.firstName || ""} ${p.lastName || ""}`.trim(),
                    image: p.cover?.url || "",
                    experience: p.experience || "",
                    language: p.language || [],
                    available: freeIds ? freeIds.has(String(p._id)) : true,
                })),
            },
        });
    } catch (e) {
        console.error("getPujaComboPandits:", e);
        fail(res, 500, "Failed to load pandits");
    }
};

/* POST /api/puja-combos/:slug/book   (auth required)
   Body: { vendorId: "<id>" | "any", dateTime, address, language? }
   Creates a normal Booking (payment_pending); the EXISTING payment flow takes over.
   Price is ALWAYS the server-side combo price. */
const bookPujaCombo = async (req, res) => {
    try {
        if (!req.user || !req.user._id) return fail(res, 401, "Unauthorized: Please login to book a combo.");

        const found = await loadBookableCombo(req.params.slug);
        if (!found) return fail(res, 404, "This combo is not available");
        const { doc, pub } = found;

        const { vendorId, dateTime, address, language } = req.body || {};
        if (!vendorId || !dateTime || !address) return fail(res, 400, "Pandit, date/time and address are required");

        const when = new Date(dateTime);
        if (Number.isNaN(when.getTime()) || when.getTime() < Date.now() + MIN_LEAD_MS - 60000)
            return fail(res, 400, "Please select a later date and time");

        const street = String(address.streetAddress || "").trim();
        const city = String(address.city || "").trim();
        const state = String(address.state || "").trim();
        const country = String(address.country || "India").trim();
        const zip = String(address.zip || "").trim();
        if (!street || !city || !state || !country) return fail(res, 400, "Please fill the complete address");
        if (!/^\d{6}$/.test(zip)) return fail(res, 400, "Please enter a valid 6-digit pincode");
        const landmark = String(address.landmark || "").trim().slice(0, 200);
        const type = ["Home", "Office", "Other"].includes(address.type) ? address.type : "Home";

        if (!pub.kit.inStock) return fail(res, 400, "A Puja Kit in this combo is currently out of stock");

        // Resolve Pandit (specific or auto-assign)
        const eligible = await getComboPandits(doc);
        const free = await getFreePandits(eligible, when);
        let chosen;
        if (String(vendorId) === "any") {
            if (!free.length) return fail(res, 409, "No Pandit Ji is available at this time. Please choose another slot.");
            chosen = free[Math.floor(Math.random() * free.length)];
        } else {
            if (!eligible.some((p) => String(p._id) === String(vendorId))) return fail(res, 400, "Selected Pandit is not available for this combo");
            chosen = free.find((p) => String(p._id) === String(vendorId));
            if (!chosen) return fail(res, 409, "Selected Pandit Ji is not available at this time. Please choose another Pandit or slot.");
        }

        const vendor = await User.findById(chosen._id).select("role status");
        if (!vendor || vendor.role !== "vendor" || vendor.status !== "active") return fail(res, 400, "Invalid vendor ID");

        const service = await Service.findOne({ vendor: chosen._id, poojaType: doc.masterService.name });
        if (!service) return fail(res, 400, "Selected Pandit does not offer this Puja");

        // Every kit of the combo goes to the booking (Puja Kit / Instant Kit split by category, same as normal bookings)
        const kitDocs = comboKitList(doc);
        const isInstant = (k) => String(k.category) === INSTANT_KIT_CATEGORY_ID;
        const pujaSamagri = {
            pujaKit: kitDocs.filter((k) => !isInstant(k)).map((k) => k._id),
            instantKit: kitDocs.filter(isInstant).map((k) => k._id),
        };

        const booking = await Booking.create({
            customer: req.user._id,
            vendor: chosen._id,
            service: service._id,
            poojaType: doc.masterService.name,
            package: `Combo: ${doc.name}`,
            dateTime: when,
            duration: pub.duration || service.duration || "2 hours",
            address: { streetAddress: street, landmark, addressType: type, city, state, country, zip },
            pujaSamagri,
            language: Array.isArray(language) && language.length ? language : ["hindi"],
            paymentAmount: doc.comboPrice,
            pujaCombo: doc._id,
            bookingID: `BOOK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            status: "payment_pending",
        });

        res.status(201).json({
            error: false,
            code: 201,
            status: 1,
            message: "Combo booking created successfully",
            payload: {
                booking: {
                    id: booking._id,
                    bookingID: booking.bookingID,
                    poojaType: booking.poojaType,
                    package: booking.package,
                    dateTime: booking.dateTime.toISOString(),
                    paymentAmount: booking.paymentAmount,
                    status: booking.status,
                },
            },
        });
    } catch (e) {
        console.error("bookPujaCombo:", e);
        fail(res, 500, "Failed to create combo booking: " + e.message);
    }
};

module.exports = { getPujaComboPandits, getPujaComboSlots, bookPujaCombo };