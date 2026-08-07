const ServiceReview = require("../../models/ServiceReview");
const Service = require("../../models/Service");
const Booking = require("../../models/Booking");

/*     Get Reviews by Service ID (Public)    */
const getReviewsbySid = async (req, res) => {
    try {
        const sid = req.params.sid;

        const reviews = await ServiceReview.find({ service: sid })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: ["firstName", "lastName", "cover"],
            });

        const service = await Service.findById(sid).select(["_id"]);

        if (!service) {
            return res
                .status(404)
                .json({ success: false, message: "Service not found" });
        }

        const reviewsSummery = await ServiceReview.aggregate([
            {
                $match: {
                    service: service._id,
                },
            },
            {
                $group: {
                    _id: "$rating",
                    count: { $sum: 1 },
                },
            },
        ]);

        return res.status(200).json({ success: true, reviewsSummery, reviews });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

/*     Create Review by User    */
const createServiceReview = async (req, res) => {
    try {
        const uid = req.userData._id.toString();
        const { sid, rating, review: reviewText, images } = req.body;

        const restrictedRoles = ["admin", "super-admin", "vendor"];

        if (restrictedRoles.includes(req.userData.role)) {
            return res.status(403).json({
                success: false,
                message:
                    "Admins, super-admins and vendors are not allowed to write reviews.",
            });
        }

        const bookings = await Booking.find({
            customer: uid,
            service: sid,
        });

        const updatedImages = await Promise.all(
            (images || []).map(async (image) => {
                return { url: image };
            })
        );
        const review = await ServiceReview.create({
            service: sid,
            review: reviewText,
            rating,
            images: updatedImages,
            user: uid,
            isPurchased: Boolean(bookings.length),
        });

        return res
            .status(201)
            .json({ success: true, data: review, user: req.userData });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    getReviewsbySid,
    createServiceReview,
};