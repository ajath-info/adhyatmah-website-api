const Shop = require("../models/Shop");

/**
 * Returns the list of User (vendor) IDs whose shop is a product-selling
 * shop (shopType: "seller") rather than a Pandit shop. Used to keep
 * product sellers out of every public Pandit Ji listing/search/homepage
 * section, without touching how those listings already work for Pandits.
 *
 * Shops created before the shopType field existed default to "pandit" at
 * the schema level, so they're correctly excluded from this list and keep
 * showing up as Pandits exactly as before.
 */
async function getSellerVendorIds() {
    const sellerShops = await Shop.find({ shopType: "seller" }).select(
        "vendor"
    );
    return sellerShops.map((s) => s.vendor).filter(Boolean);
}

module.exports = { getSellerVendorIds };