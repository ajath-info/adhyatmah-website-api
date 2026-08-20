const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please enter a firstName"],
    },
    lastName: {
      type: String,
      required: [true, "Please enter a lastName"],
    },
    email: {
      type: String,
      required: [true, "Please enter an email"],
      unique: true,
      index: true,
    },
    password: {
      type: String,
      select: false,
      required: [true, "Please enter a password"],
      minlength: 8,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    cover: {
      _id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    wishlist: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Product",
      },
    ],
    cart: [
      {
        variantId: {
          type: String,
          required: true,
        },
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    appliedDiscount: {
      code: {
        type: String,
      },
      amount: {
        type: Number,
        default: 0,
      },
      type: {
        type: String,
        enum: ["percent", "fixed"],
      },
      percentage: {
        type: Number,
      },
      fixedAmount: {
        type: Number,
      },
      appliedAt: {
        type: Date,
      },
    },
    orders: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Order",
      },
    ],

    recentProducts: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Product",
      },
    ],
    phone: {
      type: String,
      required: [true, "Please provide a Phone Number."],
      maxlength: [20, "Phone cannot be more than 20 characters."],
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    zip: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    about: {
      type: String,
    },
    gotra: {
      type: String,
    },
    veda: {
      type: String,
    },
    pankti: {
      type: String,
    },
    shakha: {
      type: String,
    },
    pravar: {
      type: String,
    },
    sutra: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null
    },
    lastOtpSentAt: {
      type: Date,
    },
    image: {
      type: String,
    },
    language: {
      type: [String],
      // Note: previously restricted to a hardcoded enum list. Languages are
      // now managed dynamically from the admin Languages page, so the enum
      // validation was removed — any language name saved in that collection
      // (e.g. a newly added "nepali") is now accepted here.
      default: [],
    },
    experience: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    occupation: {
      type: String,
    },
    maritalStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed"],
    },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String },
    },
    aadhar: {
      type: String,
    },
    referral_code: {
      type: String,
      unique: true,
      sparse: true,
    },
    referred_by: {
      type: String,
      default: "",
    },
    preferences: {
      type: mongoose.Schema.Types.Mixed,
    },
    deviceType: {
      type: String,
      enum: ["ios", "android", "web", "unknown"],
      default: "unknown",
    },
    deviceToken: {
      type: String,
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    shop: {
      type: mongoose.Types.ObjectId,
      ref: "Shop",
    },

    commission: {
      type: Number,
    },
    role: {
      type: String,
      enum: [
        "super-admin",
        "admin",
        "moderator",
        "support-agent",
        "user",
        "vendor",
      ],
      required: true,
    },
    services: {
      type: [
        {
          type: mongoose.Types.ObjectId,
          ref: "Service",
        },
      ],
      default: [],
    },
    // Admin-editable SEO content shown on this vendor's public profile page
    // (Traditional Puja Services intro + Pandit Ji Overview + FAQ block).
    // When left empty the frontend/backend fall back to the hardcoded
    // per-slug content in vendorSeoContent.js, so existing pandit pages
    // keep working exactly as before until an admin fills this in.
    seoContent: {
      h1: { type: String },
      intro: {
        heading: { type: String },
        content: { type: String },
      },
      about: {
        heading: { type: String },
        content: { type: String },
      },
      details: {
        experience: { type: String },
        specialization: { type: String },
        services: { type: String },
        availability: { type: String },
      },
      faqs: [
        {
          question: { type: String },
          answer: { type: String },
          _id: false,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }

    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    return next();
  } catch (error) {
    return next(error);
  }
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
module.exports = User;