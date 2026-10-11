const mongoose = require("mongoose");

// A Combo only REFERENCES existing records (MasterService, User/pandit,
// Product/kit). It never copies or edits them. Original price is NOT stored:
// it is derived live from the linked Puja + Kit prices so it can't go stale.
const PujaComboSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, "Combo name is required"], trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
        shortDescription: { type: String, default: "", trim: true },
        description: { type: String, default: "" },
        benefits: { type: [String], default: [] },
        images: {
            type: [{ _id: { type: String, required: true }, url: { type: String, required: true } }],
            default: [],
        },
        masterService: { type: mongoose.Schema.Types.ObjectId, ref: "MasterService", required: true, index: true },
        // anyEligiblePandit=true -> every active pandit offering the Puja
        anyEligiblePandit: { type: Boolean, default: true },
        pandits: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        // kit = first kit (kept for old combos / backward compatibility). kits = ALL kits in the combo.
        kit: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
        kits: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
        comboPrice: { type: Number, required: [true, "Combo price is required"], min: 1 },
        duration: { type: String, default: "" },
        languages: { type: [String], default: [] },
        inclusions: { type: [String], default: [] },
        exclusions: { type: [String], default: [] },
        instructions: { type: String, default: "" },
        displayOrder: { type: Number, default: 0 },
        isFeatured: { type: Boolean, default: false },
        // archived = soft delete (hidden everywhere except admin "archived" filter)
        status: { type: String, enum: ["active", "inactive", "archived"], default: "inactive", index: true },
    },
    { timestamps: true }
);

module.exports = mongoose.models.PujaCombo || mongoose.model("PujaCombo", PujaComboSchema);