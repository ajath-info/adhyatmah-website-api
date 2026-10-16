const jwt = require("jsonwebtoken");
const KundaliMatch = require("../../models/KundaliMatch");
const { fetchKundliMatching } = require("../../utils/kundali-matching-api-util");

/**
 * Login is OPTIONAL for kundali matching (same as Kundali generation) —
 * guests can match freely and only logged-in users get the result saved
 * to "My Matches". Does NOT use the existing jwt-middleware because that
 * one rejects requests with no token outright — here a missing/invalid
 * token should just mean "treat as guest", not a 401.
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

function validatePerson(person, label) {
    if (!person) return `${label} details are required.`;
    const { name, dob, tob, birthPlace, lat, lng } = person;
    if (!name || !dob || !tob || !birthPlace || lat === undefined || lng === undefined) {
        return `${label}: name, dob, tob, birthPlace, lat and lng are required.`;
    }
    return null;
}

/* Generate a Kundali Match (Ashtakoot Guna Milan) for a boy + girl pair.
   Login optional — saves to the user's account if logged in, otherwise
   still generates + persists the record (without a userId) so it can be
   re-fetched by id from the response. */
const generateKundaliMatch = async (req, res) => {
    try {
        const { boy, girl } = req.body;

        const boyError = validatePerson(boy, "Boy");
        if (boyError) {
            return res.status(400).json({ success: false, message: boyError });
        }
        const girlError = validatePerson(girl, "Girl");
        if (girlError) {
            return res.status(400).json({ success: false, message: girlError });
        }

        const userId = getOptionalUserId(req);

        const result = await fetchKundliMatching({
            boy: {
                lat: parseFloat(boy.lat),
                lng: parseFloat(boy.lng),
                datetime: toDatetimeISO(boy.dob, boy.tob),
            },
            girl: {
                lat: parseFloat(girl.lat),
                lng: parseFloat(girl.lng),
                datetime: toDatetimeISO(girl.dob, girl.tob),
            },
        });

        const match = await KundaliMatch.create({
            userId,
            boy: {
                name: boy.name,
                dob: boy.dob,
                tob: boy.tob,
                birthPlace: boy.birthPlace,
                lat: parseFloat(boy.lat),
                lng: parseFloat(boy.lng),
            },
            girl: {
                name: girl.name,
                dob: girl.dob,
                tob: girl.tob,
                birthPlace: girl.birthPlace,
                lat: parseFloat(girl.lat),
                lng: parseFloat(girl.lng),
            },
            ...result,
        });

        res.status(201).json({ success: true, data: match });
    } catch (error) {
        res.status(503).json({
            success: false,
            message:
                "Kundali matching is temporarily unavailable. Please try again in a moment.",
            error: error.message,
        });
    }
};

/* List the logged-in user's saved matches. */
const getMyKundaliMatches = async (req, res) => {
    try {
        const userId = getOptionalUserId(req);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Login to view your saved matches.",
            });
        }

        const matches = await KundaliMatch.find({ userId })
            .sort({ createdAt: -1 })
            .select("-raw"); // keep list view light

        res.status(200).json({ success: true, data: matches });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* Get a single kundali match by id (full detail). */
const getKundaliMatchById = async (req, res) => {
    try {
        const match = await KundaliMatch.findById(req.params.kmid);
        if (!match) {
            return res.status(404).json({ success: false, message: "Match not found." });
        }
        res.status(200).json({ success: true, data: match });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/* Delete a saved match (only its own owner can delete). */
const deleteKundaliMatch = async (req, res) => {
    try {
        const userId = getOptionalUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Login required." });
        }

        const match = await KundaliMatch.findOne({ _id: req.params.kmid, userId });
        if (!match) {
            return res.status(404).json({ success: false, message: "Match not found." });
        }

        await match.deleteOne();
        res.status(200).json({ success: true, message: "Match deleted." });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    generateKundaliMatch,
    getMyKundaliMatches,
    getKundaliMatchById,
    deleteKundaliMatch,
};