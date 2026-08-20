const mongoose = require("mongoose");

const BookingSchema =
  new mongoose.Schema(
    {
      customer: {
        type:
          mongoose.Types.ObjectId,

        ref: "User",

        required: [
          true,
          "Customer is required",
        ],
      },

      vendor: {
        type:
          mongoose.Types.ObjectId,

        ref: "User",

        required: [
          true,
          "Vendor (Pandit) is required",
        ],
      },

      service: {
        type:
          mongoose.Types.ObjectId,

        ref: "Service",

        required: [
          true,
          "Service is required",
        ],
      },

      poojaType: {
        type: String,

        required: [
          true,
          "Pooja type is required",
        ],
      },

      package: {
        type: String,

        required: [
          true,
          "Package is required",
        ],
      },

      dateTime: {
        type: Date,

        required: [
          true,
          "Date and time are required",
        ],
      },

      duration: {
        type: String,

        default: "2 hours",
      },

      address: {

        streetAddress: {
          type: String,
          required: true,
        },

        city: {
          type: String,
          required: true,
        },

        state: {
          type: String,
          required: true,
        },

        country: {
          type: String,
          required: true,
        },

        zip: {
          type: String,
        },
      },

      // ------------------------------------
      // Puja Samagri
      // ------------------------------------
      pujaSamagri: {

        pujaKit: [
          {
            type:
              mongoose.Schema.Types.ObjectId,

            ref: "Product",
          },
        ],

        instantKit: [
          {
            type:
              mongoose.Schema.Types.ObjectId,

            ref: "Product",
          },
        ],
      },

      language: {
        type: [String],

        // Note: previously restricted to a hardcoded enum list. Languages
        // are now managed dynamically from the admin Languages page and
        // validated against the DB in booking-controller.js at request
        // time, so the schema-level enum was removed to avoid the two
        // lists going out of sync.
        default: ["hindi"],
      },

      status: {
        type: String,

        enum: [
          "payment_pending",
          "pending",
          "ongoing",
          "upcoming",
          "completed",
          "accept",
          "cancelled",
        ],

        default: "payment_pending",
      },

      paymentAmount: {
        type: Number,

        required: [
          true,
          "Payment amount is required",
        ],
      },

      // ------------------------------------
      // Coupon (optional) - discount is always
      // calculated server-side, never trusted
      // from the client. See coupon-util.js.
      // ------------------------------------
      couponCode: {
        type: String,
        default: null,
      },

      discount: {
        type: Number,
        default: 0,
      },

      bookingID: {
        type: String,

        unique: true,

        default: function () {
          return `#${Math.random()
            .toString(36)
            .substr(2, 12)
            .toUpperCase()}`;
        },
      },
    },

    {
      timestamps: true,
    }
  );

const Booking =
  mongoose.models.Booking ||
  mongoose.model(
    "Booking",
    BookingSchema
  );

module.exports = Booking;