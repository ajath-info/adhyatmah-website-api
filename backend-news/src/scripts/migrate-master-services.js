/**
 * One-time migration script.
 *
 * Moves the existing hardcoded master service data from
 * backend/src/data/allServices.js into the new MasterService
 * collection (DB = single source of truth going forward).
 *
 * SAFE / IDEMPOTENT:
 * - Does NOT delete or modify data/allServices.js.
 * - Does NOT touch any existing Service (pandit/vendor) documents.
 * - Skips any allServices.js entry that already has a matching
 *   MasterService (by exact name), so it is safe to re-run.
 *
 * Usage (run once from the backend project root):
 *   node src/scripts/migrate-master-services.js
 */

"use strict";

const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const MasterService = require("../models/MasterService");
const slugify = require("../utils/slugify");
const { allServices } = require("../data/allServices");

const run = async () => {
    if (!process.env.MONGODB_URI) {
        console.error(
            "MONGODB_URI is not set in the environment. Aborting migration."
        );
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for master-service migration.");

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const item of allServices) {
        try {
            const existing = await MasterService.findOne({ name: item.name });

            if (existing) {
                skipped += 1;
                console.log(`SKIP (already exists): ${item.name}`);
                continue;
            }

            const slug = slugify(item.name);

            await MasterService.create({
                name: item.name,
                slug,
                description: item.description || "",
                duration: item.duration || "",
                price: item.price || 0,
                originalPrice: item.originalPrice || 0,
                image: {
                    url: item.image?.url || "",
                    altText: item.name.toLowerCase().replace(/\s+/g, "-"),
                },
                status: "active",
                views: item.views || 0,
            });

            created += 1;
            console.log(`CREATED: ${item.name}`);
        } catch (error) {
            failed += 1;
            console.error(`FAILED: ${item.name} -> ${error.message}`);
        }
    }

    console.log("\n===== Migration Summary =====");
    console.log(`Total in allServices.js : ${allServices.length}`);
    console.log(`Created                 : ${created}`);
    console.log(`Skipped (already exist) : ${skipped}`);
    console.log(`Failed                  : ${failed}`);
    console.log("==============================\n");

    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
};

run().catch(async (error) => {
    console.error("Migration script crashed:", error);
    try {
        await mongoose.disconnect();
    } catch (_) {
        // ignore
    }
    process.exit(1);
});