const mongoose = require("mongoose");

const ShopSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "approved",
        "pending",
        "in review",
        "action required",
        "blocked",
        "rejected",
      ],
      required: true,
    },
    products: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Product",
      },
    ],

    logo: {
      _id: {
        type: String,
        // required: [true, "Image id is required."],
      },
      url: {
        type: String,
        // required: [true, "Image url is required."],
      },
    },

    slug: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    name: {
      type: String,
    },
    metaTitle: {
      type: String,
      maxlength: [100, "Meta title cannot exceed 100 characters."],
      index: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters."],
    },
    metaDescription: {
      type: String,
      maxlength: [200, "Meta description cannot exceed 200 characters."],
    },
    registrationNumber: { type: String, unique: true, sparse: true },
    address: {
      country: { type: String },
      city: { type: String },
      state: { type: String },
      streetAddress: { type: String },
    },
    contactPerson: { type: String },
    shopEmail: { type: String },
    shopPhone: { type: String },
    website: { type: String },

    // Pandit sign-up details (matches the mobile app "Sign Up" screen)
    designation: { type: [String], default: [] },
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
    email: { type: String },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    gotra: { type: String },
    pravar: { type: String },
    veda: { type: String },
    shakha: { type: String },
    pankti: { type: String },
    sutra: { type: String },
    aadharNumber: { type: String },
    services: {
      type: [String],
      default: [],
    },
    language: {
      type: [String],
      default: [],
    },
    experience: { type: String },
    pincode: { type: String },
    referralCode: { type: String },
    rating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },

    financialDetails: {
      paymentMethod: { type: String, enum: ["paypal", "bank"] },
      paypal: {
        email: {
          type: String,
        },
      },
      bank: {
        accountNumber: {
          type: String,
        },
        bankName: {
          type: String,
        },
        holderName: {
          type: String,
        },
        holderEmail: {
          type: String,
        },
        address: { type: String },
        routingNumber: { type: String },
        swiftCode: { type: String },
      },
    },
    identityVerification: {
      governmentId: {
        _id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
      proofOfAddress: {
        _id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    },
    taxIdentificationNumber: { type: String },
    vatRegistrationNumber: { type: String },
  },
  {
    timestamps: true,
  }
);

const Shop = mongoose.models.Shop || mongoose.model("Shop", ShopSchema);
module.exports = Shop;