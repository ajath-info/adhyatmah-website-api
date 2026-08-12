/**
 * Shared Coupon Utilities
 * ------------------------------------------------------------------
 * Centralised, reusable coupon validation & discount calculation so
 * that Product checkout, Service Booking checkout and Pandit Booking
 * checkout all rely on the exact same server-side rules instead of
 * duplicating logic in each controller.
 *
 * IMPORTANT: The discount is always calculated here, on the server,
 * from the coupon document + a server-known amount. Callers must
 * never accept a "discount" value sent by the client.
 * ------------------------------------------------------------------
 */

const CouponCode = require("../models/CouponCode");

// Human readable labels used in validation messages.
const MODULE_LABELS = {
    product: "Product orders",
    service: "Services",
    pandit: "Pandit Booking",
};

/**
 * A coupon with appliesTo = "all" is valid everywhere. Coupons created
 * before this feature existed don't have the field set at all - treat
 * that the same as "all" so old coupons keep working (migration-safe).
 */
function getAppliesTo(couponData) {
    return couponData?.appliesTo || "all";
}

function isExpired(expirationDate) {
    const currentDateTime = new Date();
    return currentDateTime >= new Date(expirationDate);
}

/**
 * Coupons created before the "applyDate" field existed have no value
 * set for it - treat that as "already active" so old coupons keep
 * working exactly as before (migration-safe).
 */
function isNotYetActive(applyDate) {
    if (!applyDate) return false;
    const currentDateTime = new Date();
    return currentDateTime < new Date(applyDate);
}

/**
 * Checks whether a coupon is allowed to be used for the given module.
 * @param {"product"|"service"|"pandit"} module
 */
function isCouponAllowedForModule(couponData, module) {
    const appliesTo = getAppliesTo(couponData);
    return appliesTo === "all" || appliesTo === module;
}

/**
 * Fetches a coupon by code and runs every server-side validation rule
 * (exists, active/expired, module match). Never trusts anything from
 * the client other than the code + which module is checking out.
 *
 * @param {string} code
 * @param {"product"|"service"|"pandit"} module
 * @returns {Promise<{ valid: boolean, message: string, coupon: object|null }>}
 */
async function validateCouponForModule(code, module) {
    if (!code) {
        return { valid: false, message: "Coupon code is required.", coupon: null };
    }

    const coupon = await CouponCode.findOne({ code });

    if (!coupon) {
        return { valid: false, message: "Coupon Code Not Found", coupon: null };
    }

    if (isNotYetActive(coupon.applyDate)) {
        return { valid: false, message: "Coupon Code Is Not Active Yet", coupon };
    }

    if (isExpired(coupon.expire)) {
        return { valid: false, message: "Coupon Code Is Expired", coupon };
    }

    if (!isCouponAllowedForModule(coupon, module)) {
        const label = MODULE_LABELS[module] || "this order type";
        return {
            valid: false,
            message: `This coupon is only valid for ${label}.`,
            coupon,
        };
    }

    return { valid: true, message: "Coupon is valid", coupon };
}

/**
 * Calculates the discount amount for a coupon against a server-known
 * base amount. Amount is always clamped so the discount never exceeds
 * the amount it is applied to.
 *
 * @param {object} coupon - CouponCode document
 * @param {number} amount - base amount discount is calculated against
 */
function calculateDiscount(coupon, amount) {
    const base = Number(amount) || 0;
    if (!coupon) return 0;

    let discount = 0;
    if (coupon.type === "percent") {
        discount = (coupon.discount / 100) * base;
    } else {
        discount = coupon.discount;
    }

    if (Number.isNaN(discount) || discount < 0) discount = 0;
    if (discount > base) discount = base;

    return discount;
}

/**
 * Marks a coupon as used by a given customer (existing usage-tracking
 * behaviour reused as-is from the product checkout flow).
 */
async function markCouponUsed(code, userEmail) {
    if (!code || !userEmail) return;
    await CouponCode.findOneAndUpdate(
        { code },
        { $addToSet: { usedBy: userEmail } }
    );
}

module.exports = {
    MODULE_LABELS,
    getAppliesTo,
    isExpired,
    isNotYetActive,
    isCouponAllowedForModule,
    validateCouponForModule,
    calculateDiscount,
    markCouponUsed,
};