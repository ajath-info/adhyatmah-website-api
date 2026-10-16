const jwt = require("jsonwebtoken");
const Kundali = require("../../models/Kundali");
const { generateFullKundali } = require("../../utils/kundali-api-util");

/**
 * Login is OPTIONAL for kundali generation (unlike Panchang's cache-only
 * flow, this is per-person data, so guests can generate freely and only
 * logged-in users get their kundalis saved to "My Kundalis").
 * This does NOT use the existing jwt-middleware because that one rejects
 * requests with no token outright — here a missing/invalid token should
 * just mean "treat as guest", not a 401.
 */
function getOptionalUserId(req) {
    const header = req.headers.authorization;
    if (!header) return undefined;

    try {
        const decoded = jwt.verify(
            header.replace("Bearer ", ""),
            process.env.JWT_SECRET || "123456"
        );
        return decoded?._id;
    } catch (error) {
        return undefined; // invalid/expired token -> just fall back to guest
    }
}

function toDatetimeISO(dob, tob) {
    // dob: YYYY-MM-DD, tob: HH:mm -> 1996-05-14T08:15:00+05:30
    return `${dob}T${tob}:00+05:30`;
}

/* Generate a Kundali (birth chart). Login optional — saves to the user's
   account if logged in, otherwise still generates + persists the record
   (without a userId) so it can be re-fetched by id from the response. */
const generateKundali = async (req, res) => {
    try {
        const { name, gender, dob, tob, birthPlace, lat, lng, chartStyle } = req.body;

        if (!name || !dob || !tob || !birthPlace || lat === undefined || lng === undefined) {
            return res.status(400).json({
                success: false,
                message: "name, dob, tob, birthPlace, lat and lng are required.",
            });
        }

        const userId = getOptionalUserId(req);
        const datetime = toDatetimeISO(dob, tob);

        const result = await generateFullKundali({
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            datetime,
            chartStyle: chartStyle || "north-indian",
        });

        const kundali = await Kundali.create({
            userId,
            name,
            gender,
            dob,
            tob,
            birthPlace,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            chartStyle: chartStyle || "north-indian",
            ...result,
        });

        res.status(201).json({ success: true, data: kundali });
    } catch (error) {
        res.status(503).json({
            success: false,
            message:
                "Kundali generation is temporarily unavailable. Please try again in a moment.",
            error: error.message,
        });
    }
};

/* List the logged-in user's saved kundalis (e.g. self, spouse, children). */
const getMyKundalis = async (req, res) => {
    try {
        const userId = getOptionalUserId(req);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Login to view your saved kundalis.",
            });
        }

        const kundalis = await Kundali.find({ userId })
            .sort({ createdAt: -1 })
            .select("-raw -rasiChartSvg -navamsaChartSvg"); // keep list view light

        res.status(200).json({ success: true, data: kundalis });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* Get a single kundali by id (its full detail, incl. chart SVGs). */
const getKundaliById = async (req, res) => {
    try {
        const kundali = await Kundali.findById(req.params.kid);
        if (!kundali) {
            return res.status(404).json({ success: false, message: "Kundali not found." });
        }
        res.status(200).json({ success: true, data: kundali });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* Delete a saved kundali (only its own owner can delete). */
const deleteKundali = async (req, res) => {
    try {
        const userId = getOptionalUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Login required." });
        }

        const kundali = await Kundali.findOne({ _id: req.params.kid, userId });
        if (!kundali) {
            return res.status(404).json({ success: false, message: "Kundali not found." });
        }

        await kundali.deleteOne();
        res.status(200).json({ success: true, message: "Kundali deleted." });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    generateKundali,
    getMyKundalis,
    getKundaliById,
    deleteKundali,
};