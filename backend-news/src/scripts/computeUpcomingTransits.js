/**
 * Optional pre-warm script — NOT required for the Planetary Transit feature
 * to work. getUpcomingTransits() (panchang-controller.js) already lazily
 * computes and caches ingress events on first request if the cache is
 * empty/stale, so if this script never runs (cron not supported on a given
 * host, etc.) the feature still works correctly — just the very first
 * request after a cache miss does the calculation itself instead of
 * reading a warm cache (astronomy-engine is fast — tens of milliseconds
 * for a year of events across all planets — so this is a minor latency
 * difference, not a functional dependency).
 *
 * What it's for: run this on a schedule (e.g. daily/weekly cron) to keep
 * PlanetaryTransitCache topped up ahead of user requests, so nobody's
 * request is ever the one paying the (small) first-compute cost.
 *
 * SAFE / IDEMPOTENT: exactDateTime is a deterministic astronomical fact, and
 * findOneAndUpdate({planet, exactDateTime}, ..., {upsert:true}) against the
 * {planet, exactDateTime} unique index means re-running this never creates
 * duplicate rows — it just refreshes computedAt on existing ones.
 *
 * Usage (run from the backend project root):
 *   node src/scripts/computeUpcomingTransits.js [months]
 *   node src/scripts/computeUpcomingTransits.js 18   # look 18 months ahead
 */

"use strict";

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const PlanetaryTransitCache = require("../models/PlanetaryTransitCache");
const { computeUpcomingTransits } = require("../utils/planetary-transit-util");

const run = async () => {
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI is not set in the environment. Aborting.");
        process.exit(1);
    }

    const months = parseInt(process.argv[2], 10) || 12;

    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB. Computing upcoming transits for the next ${months} month(s)...`);

    const events = computeUpcomingTransits({ from: new Date(), months });
    console.log(`Computed ${events.length} ingress event(s).`);

    let upserted = 0;
    for (const event of events) {
        await PlanetaryTransitCache.findOneAndUpdate(
            { planet: event.planet, exactDateTime: event.exactDateTime },
            {
                planet: event.planet,
                fromRashi: event.fromRashi.en,
                toRashi: event.toRashi.en,
                exactDateTime: event.exactDateTime,
                isRetrograde: event.isRetrograde,
                computedAt: new Date(),
            },
            { upsert: true, setDefaultsOnInsert: true }
        );
        upserted += 1;
    }

    console.log(`Pre-warm complete. Upserted ${upserted} row(s) into PlanetaryTransitCache.`);
    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.error("Pre-warm script failed:", err);
    process.exit(1);
});