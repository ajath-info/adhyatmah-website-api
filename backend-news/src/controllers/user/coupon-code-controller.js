const CouponCode = require("../../models/CouponCode");
const { validateCouponForModule } = require("../../utils/coupon-util");

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
  getCouponCodeByCode,
  getCouponCodeById,
};