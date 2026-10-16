// const mongoose = require("mongoose");

// const KundaliSchema = new mongoose.Schema(
//     {
//         // Guest generation is allowed (login optional), so this is NOT required.
//         // When present, powers the "My Kundalis" saved-profiles list for a
//         // logged-in user (e.g. self, spouse, children profiles).
//         userId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             index: true,
//         },
//         name: {
//             type: String,
//             required: [true, "Name is required."],
//         },
//         gender: {
//             type: String,
//             enum: ["male", "female", "other"],
//         },
//         dob: {
//             type: String, // YYYY-MM-DD
//             required: [true, "Date of birth is required."],
//         },
//         tob: {
//             type: String, // HH:mm (24h)
//             required: [true, "Time of birth is required."],
//         },
//         birthPlace: {
//             type: String,
//             required: [true, "Birth place is required."],
//         },
//         lat: {
//             type: Number,
//             required: [true, "Latitude is required."],
//         },
//         lng: {
//             type: Number,
//             required: [true, "Longitude is required."],
//         },
//         timezone: {
//             type: String,
//             default: "Asia/Kolkata",
//         },
//         chartStyle: {
//             type: String,
//             enum: ["north-indian", "south-indian", "east-indian"],
//             default: "north-indian",
//         },
//         // --- generated result (from Prokerala) ---
//         nakshatra: String,
//         pada: Number,
//         chandraRasi: String, // Moon sign
//         sooryaRasi: String, // Sun sign
//         zodiac: String,
//         lagna: String, // Ascendant
//         yoga: String,
//         manglikStatus: Boolean,
//         rasiChartSvg: String,
//         navamsaChartSvg: String,
//         mangalDosha: {
//             hasDosha: Boolean,
//             description: String,
//         },
//         kaalSarpDosha: {
//             hasDosha: Boolean,
//             description: String,
//         },
//         raw: {
//             type: mongoose.Schema.Types.Mixed, // full normalized API response, kept for debugging/admin reference
//         },
//         source: {
//             type: String,
//             enum: ["prokerala", "manual"],
//             default: "prokerala",
//         },
//     },
//     {
//         timestamps: true,
//     }
// );

// KundaliSchema.index({ userId: 1, createdAt: -1 });

// const Kundali =
//     mongoose.models.Kundali || mongoose.model("Kundali", KundaliSchema);
// module.exports = Kundali;



const mongoose = require("mongoose");

const KundaliSchema = new mongoose.Schema(
    {
        // Guest generation is allowed (login optional), so this is NOT required.
        // When present, powers the "My Kundalis" saved-profiles list for a
        // logged-in user (e.g. self, spouse, children profiles).
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },
        name: {
            type: String,
            required: [true, "Name is required."],
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
        },
        dob: {
            type: String, // YYYY-MM-DD
            required: [true, "Date of birth is required."],
        },
        tob: {
            type: String, // HH:mm (24h)
            required: [true, "Time of birth is required."],
        },
        birthPlace: {
            type: String,
            required: [true, "Birth place is required."],
        },
        lat: {
            type: Number,
            required: [true, "Latitude is required."],
        },
        lng: {
            type: Number,
            required: [true, "Longitude is required."],
        },
        timezone: {
            type: String,
            default: "Asia/Kolkata",
        },
        chartStyle: {
            type: String,
            enum: ["north-indian", "south-indian", "east-indian"],
            default: "north-indian",
        },
        // --- generated result (from Prokerala) ---
        nakshatra: String,
        pada: Number,
        chandraRasi: String, // Moon sign
        sooryaRasi: String, // Sun sign
        zodiac: String,
        lagna: String, // Ascendant
        yoga: String,
        manglikStatus: Boolean,
        // Avakhada Chakra — the summary table shown on report pages like
        // astrotalk.com/freekundli (Varna, Vashya, Yoni, Gana, Nadi, etc.)
        avakhadaChakra: {
            varna: String,
            vashya: String,
            yoni: String,
            gana: String,
            nadi: String,
            signLord: String,
            nakshatraLord: String,
            tatva: String,
            paya: String,
            nameAlphabet: String,
            deity: String,
            symbol: String,
            birthStone: String,
        },
        // Planetary Positions table (Ascendant + 9 planets) — same shape as
        // Panchang's planetaryPositions, reused via panchang-api-util.
        planetaryPositions: [
            {
                planet: String,
                rashi: String,
                longitude: String,
                nakshatra: String,
                pada: Number,
            },
        ],
        // Vimshottari Mahadasha periods (the "Dasha System" section)
        dashaPeriods: [
            {
                planet: String,
                start: String,
                end: String,
                isCurrent: Boolean,
            },
        ],
        rasiChartSvg: String,
        navamsaChartSvg: String,
        mangalDosha: {
            hasDosha: Boolean,
            description: String,
        },
        kaalSarpDosha: {
            hasDosha: Boolean,
            description: String,
        },
        raw: {
            type: mongoose.Schema.Types.Mixed, // full normalized API response, kept for debugging/admin reference
        },
        source: {
            type: String,
            enum: ["prokerala", "manual"],
            default: "prokerala",
        },
    },
    {
        timestamps: true,
    }
);

KundaliSchema.index({ userId: 1, createdAt: -1 });

const Kundali =
    mongoose.models.Kundali || mongoose.model("Kundali", KundaliSchema);
module.exports = Kundali;