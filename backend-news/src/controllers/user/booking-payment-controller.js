const Stripe = require("stripe");
const Booking = require("../../models/Booking");
const User = require("../../models/User");
const Service = require("../../models/Service");
const Settings = require("../../models/Settings");

/* Initialize Booking Payment */
/* FULL UPDATED createBookingPayment WITH FIXED RECEIPT ID */
const createBookingPayment = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        error: true,
        code: 401,
        status: 0,
        message: "Unauthorized: No user data found",
      });
    }

    const { bookingId, currency = "INR", provider = "razorpay" } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        error: true,
        code: 400,
        status: 0,
        message: "Booking ID is required",
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate("customer", "firstName lastName email phone")
      .populate("vendor", "firstName lastName email phone")
      .populate("service", "poojaType description price");

    if (!booking) {
      return res.status(404).json({
        error: true,
        code: 404,
        status: 0,
        message: "Booking not found",
      });
    }

    if (
      booking.status !== "payment_pending"
    ) {
      return res.status(400).json({
        error: true,
        code: 400,
        status: 0,
        message:
          "This booking is not eligible for payment",
      });
    }
    if (booking.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: true,
        code: 403,
        status: 0,
        message: "You can only pay for your own bookings",
      });
    }

    if (["completed", "cancelled"].includes(booking.status)) {
      return res.status(400).json({
        error: true,
        code: 400,
        status: 0,
        message: "Cannot process payment for completed or cancelled bookings",
      });
    }

    const settings = await Settings.findOne({});
    const frontendUrl =
      process.env.FRONTEND_URL || "https://pandit-ji-three.vercel.app";

    // FIXED Razorpay compatible receipt ID (<40 chars)
    const shortBookingId = String(booking.bookingID).slice(0, 10);
    const timestamp = Date.now().toString().slice(-6);
    const receiptId = `BK-${shortBookingId}-${timestamp}`; // always < 40 chars

    const payload = {};
	  
    // ==========================
    // RAZORPAY PAYMENT
    // ==========================
    if (provider === "razorpay") {
      if (settings?.general?.razorpay?.isActive) {
        try {

          const razorpayKeyId = settings.general.razorpay.keyId;
          const razorpayKeySecret = settings.general.razorpay.keySecret;


          const Razorpay = require("razorpay");
          const razorpay = new Razorpay({
            key_id: razorpayKeyId,
            key_secret: razorpayKeySecret,
          });
          const amountInPaise = Math.round(booking.paymentAmount * 100);

          const orderOptions = {
            amount: amountInPaise,
            currency: currency,
            receipt: receiptId, // FIXED (<40 chars)
            notes: {
              bookingId: booking._id.toString(),
              bookingID: booking.bookingID,
              customerId: booking.customer._id.toString(),
              vendorId: booking.vendor._id.toString(),
              serviceId: booking.service._id.toString(),
              paymentType: "booking",
            },
          };

          const order = await razorpay.orders.create(orderOptions);

          payload.razorpay = {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: razorpayKeyId,
            receiptId: receiptId,
          };

          // Create Payment Link
          try {
            const paymentLinkBody = {
              amount: amountInPaise,
              currency: currency,
              accept_partial: false,
              reference_id: booking.bookingID,
              description: `${booking.poojaType} - ${booking.package}`,
              customer: {
                name: `${booking.customer.firstName} ${booking.customer.lastName}`,
                contact: booking.customer.phone,
                email: booking.customer.email,
              },
              notify: { sms: true, email: true },
              callback_url: `${frontendUrl}/booking-payment-callback?booking_id=${booking._id}&razorpay_order_id=${order.id}`,
              callback_method: "get",
              notes: {
                bookingId: booking._id.toString(),
                bookingID: booking.bookingID,
                customerId: booking.customer._id.toString(),
                vendorId: booking.vendor._id.toString(),
                serviceId: booking.service._id.toString(),
                paymentType: "booking",
              },
            };

            const basicAuth = Buffer.from(
              `${razorpayKeyId}:${razorpayKeySecret}`
            ).toString("base64");
            const { fetch } = require("undici");
            const resp = await fetch(
              "https://api.razorpay.com/v1/payment_links",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Basic ${basicAuth}`,
                },
                body: JSON.stringify(paymentLinkBody),
              }
            );

            if (resp.ok) {
              const linkData = await resp.json();
              payload.razorpay.payment_link = {
                id: linkData.id,
                short_url: linkData.short_url,
                long_url: linkData.long_url,
              };
            }
          } catch (e) {
            console.warn("Error creating Razorpay payment link:", e.message);
          }
        } catch (err) {
          console.error("Razorpay booking payment error:", err);
          return res.status(400).json({
            error: true,
            code: 400,
            status: 0,
            message: "Payment initialization failed",
            payload: { provider: "razorpay", message: err.message },
          });
        }
      }
    }

    if (!payload.stripe && !payload.razorpay) {
      return res.status(400).json({
        error: true,
        code: 400,
        status: 0,
        message: "No payment provider is configured",
      });
    }

    return res.status(200).json({
      error: false,
      code: 200,
      status: 1,
      message: "Booking payment initialized successfully",
      payload: {
        success_url_app: `${frontendUrl}/booking-success`,
        amount: booking.paymentAmount,
        currency: currency.toUpperCase(),
        receipt: receiptId,
        booking: {
          id: booking._id,
          bookingID: booking.bookingID,
          poojaType: booking.poojaType,
        },
        ...payload,
      },
    });
  } catch (error) {
    console.error("Error in createBookingPayment:", error);
    return res.status(500).json({
      error: true,
      code: 500,
      status: 0,
      message: "Failed to initialize booking payment",
      payload: { error: error.message },
    });
  }
};

/* Verify Booking Payment */
const verifyBookingPayment = async (req, res) => {
  try {
    const {
      payment_intent_id,
      booking_id,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      razorpay_payment_link_id,
      razorpay_payment_link_status,
      razorpay_payment_link_reference_id,
    } = req.body;

    const settings = await Settings.findOne({});

    // RAZORPAY FLOW
    if (razorpay_payment_id) {
      console.log("[Razorpay Verify - Booking] Starting verification...");

      // Check if booking already paid
      const booking = await Booking.findById(booking_id || req.body.bookingId);
      if (!booking) {
        return res.status(404).json({
          error: true,
          code: 404,
          status: 0,
          message: "Booking not found",
        });
      }

      if (booking.status === "upcoming" || booking.status === "completed") {
        console.log("[Razorpay Verify - Booking] Booking already paid");
        return res.status(200).json({
          error: false,
          code: 200,
          status: 1,
          message: "Booking payment already verified",
          payload: {
            booking: {
              id: booking._id,
              bookingID: booking.bookingID,
              status: booking.status,
            },
            already_paid: true,
          },
        });
      }

      let razorpayKeyId = settings.general.razorpay.keyId;
      let razorpayKeySecret = settings.general.razorpay.keySecret;

      const crypto = require("crypto");
      let verified = false;

      // Signature verification
      const candidates = [];
      if (razorpay_order_id)
        candidates.push(`${razorpay_order_id}|${razorpay_payment_id}`);
      if (razorpay_payment_link_id)
        candidates.push(`${razorpay_payment_link_id}|${razorpay_payment_id}`);
      if (razorpay_payment_link_reference_id)
        candidates.push(
          `${razorpay_payment_link_reference_id}|${razorpay_payment_id}`
        );

      for (const msg of candidates) {
        try {
          const expected = crypto
            .createHmac("sha256", razorpayKeySecret)
            .update(msg)
            .digest("hex");
          if (expected === (razorpay_signature || "")) {
            verified = true;
            console.log("[Razorpay Verify - Booking] ✓ Signature verified");
            break;
          }
        } catch (e) { }
      }

      if (!verified && razorpay_payment_link_status === "paid") {
        verified = true;
        console.log("[Razorpay Verify - Booking] ✓ Verified via status=paid");
      }

      // Fetch payment status
      try {
        const Razorpay = require("razorpay");
        const razorpay = new Razorpay({
          key_id: razorpayKeyId,
          key_secret: razorpayKeySecret,
        });

        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        if (
          payment &&
          (payment.status === "captured" || payment.status === "authorized")
        ) {
          verified = true;
          console.log("[Razorpay Verify - Booking] ✓ Payment captured");
        }
      } catch (e) {
        console.warn(
          "[Razorpay Verify - Booking] Error fetching payment:",
          e.message
        );
      }

      if (!verified) {
        return res.status(400).json({
          error: true,
          code: 400,
          status: 0,
          message: "Razorpay payment verification failed",
        });
      }

      // Update booking status
      booking.status = "pending";
      await booking.save();

      console.log("[Razorpay Verify - Booking] ✓ Booking status updated");

      return res.status(200).json({
        error: false,
        code: 200,
        status: 1,
        message: "Payment verified and booking confirmed (Razorpay)",
        payload: {
          booking: {
            id: booking._id,
            bookingID: booking.bookingID,
            status: booking.status,
            paymentAmount: booking.paymentAmount,
          },
          razorpay_payment_id,
          razorpay_order_id,
        },
      });
    }

    return res.status(400).json({
      error: true,
      code: 400,
      status: 0,
      message: "No payment identifier provided",
    });
  } catch (error) {
    console.error("Error in verifyBookingPayment:", error);
    return res.status(500).json({
      error: true,
      code: 500,
      status: 0,
      message: "Failed to verify booking payment",
      payload: { error: error.message },
    });
  }
};

/**
 * Get Booking Payment Status
 * This API returns the current payment status for a booking
 */
const getBookingPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.query;

    if (!bookingId) {
      return res.status(400).json({
        error: true,
        code: 400,
        status: 0,
        message: "Booking ID is required",
      });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId)
      .populate("customer", "firstName lastName email")
      .populate("vendor", "firstName lastName email")
      .populate("service", "poojaType");

    if (!booking) {
      return res.status(404).json({
        error: true,
        code: 404,
        status: 0,
        message: "Booking not found",
      });
    }

    // Check if user has permission to view this booking
    if (booking.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: true,
        code: 403,
        status: 0,
        message: "You can only view your own booking payment status",
      });
    }

    // Determine payment status based on booking status
    let paymentStatus = "pending";
    if (
      booking.status === "upcoming" ||
      booking.status === "ongoing" ||
      booking.status === "completed"
    ) {
      paymentStatus = "paid";
    } else if (booking.status === "cancelled") {
      paymentStatus = "cancelled";
    }

    return res.status(200).json({
      error: false,
      code: 200,
      status: 1,
      message: "Booking payment status retrieved successfully",
      payload: {
        booking: {
          id: booking._id,
          bookingID: booking.bookingID,
          status: booking.status,
          paymentAmount: booking.paymentAmount,
          poojaType: booking.poojaType,
          dateTime: booking.dateTime,
          customer: {
            firstName: booking.customer.firstName,
            lastName: booking.customer.lastName,
            email: booking.customer.email,
          },
          vendor: {
            firstName: booking.vendor.firstName,
            lastName: booking.vendor.lastName,
            email: booking.vendor.email,
          },
        },
        payment_status: paymentStatus,
        payment_amount: booking.paymentAmount,
        currency: "INR",
      },
    });
  } catch (error) {
    console.error("Error in getBookingPaymentStatus:", error);
    return res.status(500).json({
      error: true,
      code: 500,
      status: 0,
      message: "Failed to get payment status: " + error.message,
    });
  }
};

module.exports = {
  createBookingPayment,
  verifyBookingPayment,
  getBookingPaymentStatus,
};
