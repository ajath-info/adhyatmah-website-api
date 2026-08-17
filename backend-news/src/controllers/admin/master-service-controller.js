const mongoose = require("mongoose");
const MasterService = require("../../models/MasterService");
const Service = require("../../models/Service");
const slugify = require("../../utils/slugify");

/**
 * Cascade a MasterService price change to every matching vendor/pandit
 * Service record (EXACT match only: Service.poojaType === masterService.name).
 *
 * Tries a Mongo session transaction first (safe on replica sets). If the
 * current MongoDB deployment does not support transactions (e.g. a
 * standalone server, which is common on a single VPS), it falls back to a
 * plain sequential update and reports the outcome honestly either way -
 * it never silently claims success on failure.
 */
const cascadePriceToServices = async (poojaTypeName, newPrice) => {
    const matchQuery = { poojaType: poojaTypeName };

    // Attempt 1: transaction (works when Mongo is a replica set / mongos)
    const session = await mongoose.startSession();
    try {
        let result;
        await session.withTransaction(async () => {
            result = await Service.updateMany(
                matchQuery,
                { $set: { price: newPrice } },
                { session }
            );
        });
        await session.endSession();

        return {
            cascadeSucceeded: true,
            usedTransaction: true,
            matchedCount: result?.matchedCount ?? 0,
            modifiedCount: result?.modifiedCount ?? 0,
        };
    } catch (transactionError) {
        await session.endSession();

        // Fallback: current setup likely doesn't support transactions
        // (standalone Mongo). Do a direct, non-transactional update and
        // report the real result instead of pretending the cascade
        // happened safely.
        try {
            const result = await Service.updateMany(matchQuery, {
                $set: { price: newPrice },
            });

            return {
                cascadeSucceeded: true,
                usedTransaction: false,
                matchedCount: result?.matchedCount ?? 0,
                modifiedCount: result?.modifiedCount ?? 0,
                note: "Applied without a transaction (transactions unsupported on this MongoDB deployment).",
            };
        } catch (fallbackError) {
            return {
                cascadeSucceeded: false,
                usedTransaction: false,
                matchedCount: 0,
                modifiedCount: 0,
                error: fallbackError.message,
            };
        }
    }
};

/*     Create Master Service by Admin    */
const createMasterServiceByAdmin = async (req, res) => {
    try {
        const {
            name,
            slug,
            description,
            duration,
            price,
            originalPrice,
            image,
            status,
        } = req.body;

        if (!name || !duration || price === undefined || price === null) {
            return res.status(400).json({
                success: false,
                message: "Name, duration and price are required",
            });
        }

        const finalSlug = slugify(slug || name);

        const existing = await MasterService.findOne({
            $or: [{ name }, { slug: finalSlug }],
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "A master service with this name/slug already exists",
            });
        }

        const masterService = await MasterService.create({
            name,
            slug: finalSlug,
            description: description || "",
            duration,
            price: Number(price),
            originalPrice: originalPrice ? Number(originalPrice) : 0,
            image: image || { url: "", altText: "" },
            status: status || "active",
        });

        res.status(201).json({
            success: true,
            message: "Master service created successfully",
            data: masterService,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/*     Get All Master Services by Admin    */
const getMasterServicesByAdmin = async (req, res) => {
    try {
        const {
            page: pageQuery,
            limit: limitQuery,
            search: searchQuery,
            status,
        } = req.query;

        const limit = parseInt(limitQuery) || 10;
        const page = parseInt(pageQuery) || 1;
        const skip = limit * (page - 1);

        const query = {
            name: { $regex: searchQuery || "", $options: "i" },
        };

        if (status) {
            query.status = status;
        }

        const totalMasterServices = await MasterService.countDocuments(query);

        const masterServices = await MasterService.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: masterServices,
            total: totalMasterServices,
            count: Math.ceil(totalMasterServices / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/*     Get One Master Service by Admin (by slug)    */
const getOneMasterServiceByAdmin = async (req, res) => {
    try {
        const { slug } = req.params;

        const masterService = await MasterService.findOne({ slug });

        if (!masterService) {
            return res.status(404).json({
                success: false,
                message: "Master service not found",
            });
        }

        res.status(200).json({
            success: true,
            data: masterService,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/*     Update Master Service by Admin (by slug)    */
/*     THIS is where MasterService.price cascades to Service.price   */
const updateMasterServiceByAdmin = async (req, res) => {
    try {
        const { slug } = req.params;
        const {
            name,
            slug: newSlugInput,
            description,
            duration,
            price,
            originalPrice,
            image,
            status,
        } = req.body;

        const masterService = await MasterService.findOne({ slug });

        if (!masterService) {
            return res.status(404).json({
                success: false,
                message: "Master service not found",
            });
        }

        // Match Service.poojaType against the CURRENT (pre-update) name -
        // that is what existing vendor Service records were created with.
        const poojaTypeNameForCascade = masterService.name;
        const oldPrice = masterService.price;

        if (name && name !== masterService.name) {
            const duplicateName = await MasterService.findOne({
                name,
                _id: { $ne: masterService._id },
            });
            if (duplicateName) {
                return res.status(400).json({
                    success: false,
                    message: "Another master service with this name already exists",
                });
            }
            masterService.name = name;
        }

        if (newSlugInput || name) {
            const finalSlug = slugify(newSlugInput || name);
            if (finalSlug !== masterService.slug) {
                const duplicateSlug = await MasterService.findOne({
                    slug: finalSlug,
                    _id: { $ne: masterService._id },
                });
                if (duplicateSlug) {
                    return res.status(400).json({
                        success: false,
                        message: "Another master service with this slug already exists",
                    });
                }
                masterService.slug = finalSlug;
            }
        }

        if (description !== undefined) masterService.description = description;
        if (duration !== undefined) masterService.duration = duration;
        if (originalPrice !== undefined)
            masterService.originalPrice = Number(originalPrice);
        if (image !== undefined) masterService.image = image;
        if (status !== undefined) masterService.status = status;

        let newPrice = oldPrice;
        if (price !== undefined && price !== null && price !== "") {
            newPrice = Number(price);
            masterService.price = newPrice;
        }

        await masterService.save();

        // Only run the cascade if the price actually changed
        let cascadeResult = {
            cascadeSucceeded: true,
            usedTransaction: false,
            matchedCount: 0,
            modifiedCount: 0,
            skipped: true,
        };

        if (newPrice !== oldPrice) {
            cascadeResult = await cascadePriceToServices(
                poojaTypeNameForCascade,
                newPrice
            );
        }

        if (!cascadeResult.cascadeSucceeded) {
            // Master service itself was updated, but be transparent that the
            // price cascade to existing vendor Service records failed.
            return res.status(207).json({
                success: true,
                message:
                    "Master service updated, but syncing the price to existing pandit services FAILED. Please retry.",
                data: masterService,
                priceCascade: cascadeResult,
            });
        }

        res.status(200).json({
            success: true,
            message: "Master service updated successfully",
            data: masterService,
            priceCascade: cascadeResult,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/*     Delete Master Service by Admin (by slug)    */
const deleteMasterServiceByAdmin = async (req, res) => {
    try {
        const { slug } = req.params;

        const masterService = await MasterService.findOne({ slug });

        if (!masterService) {
            return res.status(404).json({
                success: false,
                message: "Master service not found",
            });
        }

        // Deleting a MasterService only removes the master catalog entry.
        // Existing vendor/pandit Service documents are NEVER auto-deleted.
        await MasterService.findByIdAndDelete(masterService._id);

        res.status(200).json({
            success: true,
            message: "Master service deleted successfully",
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/*     Activate / Deactivate Master Service by Admin (by slug)    */
const toggleStatusMasterServiceByAdmin = async (req, res) => {
    try {
        const { slug } = req.params;

        const masterService = await MasterService.findOne({ slug });

        if (!masterService) {
            return res.status(404).json({
                success: false,
                message: "Master service not found",
            });
        }

        masterService.status =
            masterService.status === "active" ? "inactive" : "active";

        await masterService.save();

        res.status(200).json({
            success: true,
            message: `Master service marked ${masterService.status}`,
            data: masterService,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createMasterServiceByAdmin,
    getMasterServicesByAdmin,
    getOneMasterServiceByAdmin,
    updateMasterServiceByAdmin,
    deleteMasterServiceByAdmin,
    toggleStatusMasterServiceByAdmin,
};