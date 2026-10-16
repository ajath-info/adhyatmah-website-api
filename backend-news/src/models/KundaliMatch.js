const mongoose = require("mongoose");

// One "person" sub-shape, reused for both boy and girl below — same
// birth-details fields Kundali.js already collects (name, dob, tob, place,
// lat/lng), kept inline here rather than $ref'd to Kundali so a match can
// be generated for people who never separately saved a Kundali profile.
const PersonSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, "Name is required."] },
        dob: { type: String, required: [true, "Date of birth is required."] }, // YYYY-MM-DD
        tob: { type: String, required: [true, "Time of birth is required."] }, // HH:mm (24h)
        birthPlace: { type: String, required: [true, "Birth place is required."] },
        lat: { type: Number, required: [true, "Latitude is required."] },
        lng: { type: Number, required: [true, "Longitude is required."] },
    },
    { _id: false }
);

const KootSchema = new mongoose.Schema(
    {
        key: String,
        label: String,
        subtitle: String,
        receivedPoints: Number,
        maxPoints: Number,
        description: String,
        // Each person's individual value for this koot, e.g. Varna:
        // boyValue="Shudra", girlValue="Kshatriya" — the "YOU"/"PARTNER"
        // columns shown on matchmaking report pages.
        boyValue: String,
        girlValue: String,
    },
    { _id: false }
);

const KundaliMatchSchema = new mongoose.Schema(
    {
        // Guest matching is allowed (login optional), same as Kundali generation.
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },
        boy: { type: PersonSchema, required: true },
        girl: { type: PersonSchema, required: true },
        timezone: {
            type: String,
            default: "Asia/Kolkata",
        },
        // --- generated result (from Prokerala) ---
        // Ashtakoot Guna Milan — the 8-koot compatibility table shown on
        // matchmaking report pages like astrotalk.com/matchmaking.
        totalPoints: Number,
        maxPoints: { type: Number, default: 36 },
        koots: [KootSchema],
        nadiDosha: Boolean,
        bhakootDosha: Boolean,
        doshaCancelled: Boolean,
        conclusion: String,
        conclusionType: String,
        recommendation: String,
        // Janam Rashi / Nakshatra for each person — shown alongside the
        // birth details on matchmaking report pages.
        boyRashi: String,
        boyNakshatra: String,
        boyPada: Number,
        girlRashi: String,
        girlNakshatra: String,
        girlPada: Number,
        maleManglik: Boolean,
        maleManglikDescription: String,
        femaleManglik: Boolean,
        femaleManglikDescription: String,
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

KundaliMatchSchema.index({ userId: 1, createdAt: -1 });

const KundaliMatch =
    mongoose.models.KundaliMatch || mongoose.model("KundaliMatch", KundaliMatchSchema);
module.exports = KundaliMatch;