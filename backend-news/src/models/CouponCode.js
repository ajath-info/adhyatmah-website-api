const mongoose = require("mongoose");

const CouponCodeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      maxlength: [100, "Name cannot exceed 100 characters."],
    },
    code: {
      type: String,
      minlength: 4,
      unique: true,
      required: [true, "Code is required."],
    },
    discount: {
      type: Number,
      minlength: 4,
      required: [true, "Discount is required."],
    },
    // Date from which this coupon becomes usable. Old coupons created
    // before this field existed will not have it set; application-level
    // code treats a missing/undefined value as "already active" so
    // existing coupons keep working as before (see coupon-util.js).
    applyDate: {
      type: Date,
    },
    expire: {
      type: Date,
      default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters."],
    },
    type: {
      type: String,
      enum: ["percent", "fixed"],
      required: [true, "Type is required."],
    },
    // Which module/checkout this coupon is valid for.
    // Old coupons created before this field existed will not have it set;
    // application-level code treats a missing/undefined value as "all"
    // so existing coupons keep working everywhere (see coupon-util.js).
    appliesTo: {
      type: String,
      enum: ["product", "service", "pandit", "all"],
      default: "all",
    },
    usedBy: [{ type: String }],
  },
  {
    timestamps: true,
  }
);
const CouponCode =
  mongoose.models.CouponCode || mongoose.model("CouponCode", CouponCodeSchema);
module.exports = CouponCode;