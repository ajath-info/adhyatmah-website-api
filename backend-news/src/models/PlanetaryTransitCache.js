const mongoose = require("mongoose");

// Caches computed rashi-ingress events (astronomy-engine output, NOT
// Prokerala data — see backend/src/utils/planetary-transit-util.js).
// exactDateTime is a deterministic astronomical fact for a given
// planet+instant, so {planet, exactDateTime} can never legitimately repeat —
// the unique index below is what makes the upsert in the controller safe to
// call repeatedly (e.g. if a pre-warm script re-runs) without creating
// duplicate rows.
const PlanetaryTransitCacheSchema = new mongoose.Schema(
    {
        planet: {
            type: String,
            required: true,
            index: true,
        },
        fromRashi: {
            type: String,
            required: true,
        },
        toRashi: {
            type: String,
            required: true,
        },
        exactDateTime: {
            type: Date,
            required: true,
            index: true,
        },
        isRetrograde: {
            type: Boolean,
            default: false,
        },
        computedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

PlanetaryTransitCacheSchema.index({ planet: 1, exactDateTime: 1 }, { unique: true });

const PlanetaryTransitCache =
    mongoose.models.PlanetaryTransitCache ||
    mongoose.model("PlanetaryTransitCache", PlanetaryTransitCacheSchema);

module.exports = PlanetaryTransitCache;