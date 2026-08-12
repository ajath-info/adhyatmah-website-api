const CouponCode = require("../../models/CouponCode");
const {
  validateCouponForModule,
  isCouponAllowedForModule,
  isExpired,
  isNotYetActive,
} = require("../../utils/coupon-util");

/*  Get Active Coupon Codes for a Module
 *  Lets the checkout screen show which coupons the user can currently
 *  apply (for the module they're checking out in) before they type
 *  anything in - reuses the exact same active/expired/appliesTo rules
 *  as applying a coupon, so nothing shown here can ever fail to apply.
 */
const getActiveCouponCodesByModule = async (req, res) => {
  try {
    const module = req.params.module;

    const coupons = await CouponCode.find({
      $or: [{ appliesTo: module }, { appliesTo: "all" }, { appliesTo: { $exists: false } }],
    }).sort({ createdAt: -1 });

    const activeCoupons = coupons.filter(
      (coupon) =>
        isCouponAllowedForModule(coupon, module) &&
        !isExpired(coupon.expire) &&
        !isNotYetActive(coupon.applyDate)
    );

    return res.status(200).json({
      success: true,
      data: activeCoupons,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/*  Get Coupon Code by Code
 *  Used by every checkout module (product / service / pandit) to preview
 *  a coupon before it's applied. Optional `?module=` query param restricts
 *  the lookup to coupons valid for that module; when omitted, behaviour is
 *  unchanged from before (no module restriction applied) to stay backward
 *  compatible with any existing caller that doesn't send it.
 */
const getCouponCodeByCode = async (req, res) => {
  try {
    const code = req.params.code;
    const module = req.query.module;

    if (module) {
      const { valid, message, coupon } = await validateCouponForModule(
        code,
        module
      );

      if (!valid) {
        return res.status(400).json({
          success: false,
          message,
        });
      }

      return res.status(200).json({
        success: true,
        data: coupon,
      });
    }

    const getCouponCode = await CouponCode.findOne({ code: code });

    if (!getCouponCode) {
      return res.status(404).json({
        success: false,
        message: "Coupon Code Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      data: getCouponCode,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
/*  Get Coupon Code by ID */
const getCouponCodeById = async (req, res) => {
  try {
    const id = req.params.id;
    const getCouponCode = await CouponCode.findById(id);

    if (!getCouponCode) {
      return res.status(404).json({
        success: false,
        message: "Coupon Code Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      data: getCouponCode,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getActiveCouponCodesByModule,
  getCouponCodeByCode,
  getCouponCodeById,
};