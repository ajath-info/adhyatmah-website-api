const Booking = require("../../models/Booking");
const User = require("../../models/User");
const Service = require("../../models/Service");
const mongoose = require("mongoose");

const adminBookingPopulate = [
  { path: "customer", select: "firstName lastName email phone image" },
  { path: "vendor", select: "firstName lastName email phone image" },
  { path: "service", select: "poojaType description price duration" },
];

const buildRefOwnerMatch = (field, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const objectId = new mongoose.Types.ObjectId(id);
  const idString = String(id);

  return {
    $or: [{ [field]: objectId }, { [field]: idString }],
  };
};

const fetchAdminBookings = async (matchQuery) =>
  Booking.find(matchQuery)
    .populate(adminBookingPopulate)
    .sort({ createdAt: -1 })
    .lean();

const aggregateBookingsPipeline = (matchQuery) => [
  { $match: matchQuery },
  { $lookup: { from: "users", localField: "customer", foreignField: "_id", as: "customer" } },
  { $lookup: { from: "users", localField: "vendor", foreignField: "_id", as: "vendor" } },
  { $lookup: { from: "services", localField: "service", foreignField: "_id", as: "service" } },
  { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
  { $unwind: { path: "$vendor", preserveNullAndEmptyArrays: true } },
  { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
  {
    $project: {
      _id: 1,
      bookingID: 1,
      poojaType: 1,
      package: 1,
      dateTime: 1,
      duration: 1,
      address: 1,
      pujaSamagri: 1,
      status: 1,
      paymentAmount: 1,
      createdAt: 1,
      customer: { _id: 1, firstName: 1, lastName: 1, email: 1, phone: 1, image: 1 },
      vendor: { _id: 1, firstName: 1, lastName: 1, email: 1, phone: 1, image: 1 },
      service: { _id: 1, poojaType: 1, description: 1, price: 1 }
    }
  },
  { $sort: { createdAt: -1 } }
];

/*     Get All Bookings by Vendor    */
const getBookingsByVendor = async (req, res) => {
  try {
    const {
      page: pageQuery,
      limit: limitQuery,
      search: searchQuery,
      status: statusQuery,
    } = req.query;

    const limit = parseInt(limitQuery) || 10;
    const page = parseInt(pageQuery) || 1;
    const skip = limit * (page - 1);

    let matchQuery = { vendor: new mongoose.Types.ObjectId(req.vendor._id) };

    if (statusQuery) {
      matchQuery.status = statusQuery;
    }

    let searchMatch = {};
    if (searchQuery) {
      searchMatch = {
        $or: [
          { "customer.firstName": { $regex: searchQuery, $options: "i" } },
          { "customer.lastName": { $regex: searchQuery, $options: "i" } },
          { "poojaType": { $regex: searchQuery, $options: "i" } },
          { "bookingID": { $regex: searchQuery, $options: "i" } }
        ]
      };
    }

    const totalBookings = await Booking.countDocuments({
      ...matchQuery,
      ...searchMatch,
    });

    const bookings = await Booking.aggregate([
      { $match: { ...matchQuery, ...searchMatch } },
      { $lookup: { from: "users", localField: "customer", foreignField: "_id", as: "customer" } },
      { $lookup: { from: "users", localField: "vendor", foreignField: "_id", as: "vendor" } },
      { $lookup: { from: "services", localField: "service", foreignField: "_id", as: "service" } },
      { $unwind: "$customer" },
      { $unwind: "$vendor" },
      { $unwind: "$service" },
      {
        $project: {
          _id: 1, bookingID: 1, poojaType: 1, package: 1,
          dateTime: 1, duration: 1, address: 1, pujaSamagri: 1,
          status: 1, paymentAmount: 1, createdAt: 1,
          customer: { _id: 1, firstName: 1, lastName: 1, email: 1, phone: 1 },
          vendor: { _id: 1, firstName: 1, lastName: 1 },
          service: { _id: 1, poojaType: 1, description: 1, price: 1 }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    res.status(200).json({
      success: true,
      data: {
        data: bookings,
        total: totalBookings,
        count: Math.ceil(totalBookings / limit),
        currentPage: page,
        totalPages: Math.ceil(totalBookings / limit)
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*     Get All Bookings by Admin    */
const getAllBookingsByAdmin = async (req, res) => {
  try {
    const {
      page: pageQuery,
      limit: limitQuery,
      search: searchQuery,
      status: statusQuery,
    } = req.query;

    const limit = parseInt(limitQuery) || 10;
    const page = parseInt(pageQuery) || 1;
    const skip = limit * (page - 1);

    let matchQuery = {}; // No filter — saari bookings

    if (statusQuery) {
      matchQuery.status = statusQuery;
    }

    let searchMatch = {};
    if (searchQuery) {
      searchMatch = {
        $or: [
          { "customer.firstName": { $regex: searchQuery, $options: "i" } },
          { "customer.lastName": { $regex: searchQuery, $options: "i" } },
          { "poojaType": { $regex: searchQuery, $options: "i" } },
          { "bookingID": { $regex: searchQuery, $options: "i" } }
        ]
      };
    }

    const totalBookings = await Booking.countDocuments(matchQuery);

    const bookings = await Booking.aggregate([
      { $match: matchQuery },
      { $lookup: { from: "users", localField: "customer", foreignField: "_id", as: "customer" } },
      { $lookup: { from: "users", localField: "vendor", foreignField: "_id", as: "vendor" } },
      { $lookup: { from: "services", localField: "service", foreignField: "_id", as: "service" } },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$vendor", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1, bookingID: 1, poojaType: 1, package: 1,
          dateTime: 1, duration: 1, address: 1, pujaSamagri: 1,
          status: 1, paymentAmount: 1, createdAt: 1,
          customer: { _id: 1, firstName: 1, lastName: 1, email: 1, phone: 1 },
          vendor: { _id: 1, firstName: 1, lastName: 1, email: 1 },
          service: { _id: 1, poojaType: 1, description: 1, price: 1 }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    res.status(200).json({
      success: true,
      data: {
        data: bookings,
        total: totalBookings,
        count: Math.ceil(totalBookings / limit),
        currentPage: page,
        totalPages: Math.ceil(totalBookings / limit)
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*     Get One Booking by Vendor    */
const getOneBookingByVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOne({
      _id: id,
      vendor: req.vendor._id.toString(),
    })
      .populate('customer', 'firstName lastName email phone')
      .populate('vendor', 'firstName lastName email phone')
      .populate('service', 'poojaType description price duration')
      .populate('pujaSamagri.pujaKit', 'name')
      .populate('pujaSamagri.instantKit', 'name');

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const item = booking.toObject();

    item.pujaSamagri = {
      pujaKit:
        item?.pujaSamagri?.pujaKit?.map((kit) => kit?.name).filter(Boolean) || [],
      instantKit:
        item?.pujaSamagri?.instantKit?.map((kit) => kit?.name).filter(Boolean) || [],
    };

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*     Update Booking Status by Vendor    */
const updateBookingStatusByVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "ongoing", "upcoming", "completed", "accepted", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    const booking = await Booking.findOne({
      _id: id,
      vendor: req.vendor._id.toString(),
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const finalStatus = status === "accepted" ? "upcoming" : status;

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status: finalStatus },
      { new: true, runValidators: true }
    )
      .populate('customer', 'firstName lastName email phone')
      .populate('vendor', 'firstName lastName email phone')
      .populate('service', 'poojaType description price duration');

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: updatedBooking,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*     Get Bookings by Vendor (Admin)    */
const getBookingsByVendorByAdmin = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const matchQuery = buildRefOwnerMatch("vendor", vendorId);

    if (!matchQuery) {
      return res.status(400).json({ success: false, message: "Invalid vendor id" });
    }

    const bookings = await fetchAdminBookings(matchQuery);

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*     Get Bookings by Customer (Admin)    */
const getBookingsByCustomerByAdmin = async (req, res) => {
  try {
    const { customerId } = req.params;
    const matchQuery = buildRefOwnerMatch("customer", customerId);

    if (!matchQuery) {
      return res.status(400).json({ success: false, message: "Invalid customer id" });
    }

    const bookings = await fetchAdminBookings(matchQuery);

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*     Get Active Pandits for reassignment dropdown (Admin)    */
const getActivePanditsByAdmin = async (req, res) => {
  try {
    // Same criteria as admin/users?role=vendor list — role vendor + status active
    const pandits = await User.find({ role: "vendor", status: "active" })
      .select("firstName lastName email phone image")
      .lean();

    res.status(200).json({
      success: true,
      data: pandits.map((p) => ({
        _id: p._id,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone,
        image: p.image,
      })),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*     Update Booking by Admin    */
const updateBookingByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentAmount, dateTime, duration, poojaType, package: packageName, vendor } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const validStatuses = [
      "payment_pending",
      "pending",
      "ongoing",
      "upcoming",
      "completed",
      "accept",
      "cancelled",
    ];

    if (status !== undefined) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }
      booking.status = status === "accept" ? "upcoming" : status;
    }

    if (vendor !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(vendor)) {
        return res.status(400).json({ success: false, message: "Invalid pandit id" });
      }

      const newVendor = await User.findOne({ _id: vendor, role: "vendor", status: "active" });

      if (!newVendor) {
        return res.status(400).json({
          success: false,
          message: "Selected pandit is not active on the website",
        });
      }

      booking.vendor = newVendor._id;
    }

    if (paymentAmount !== undefined) booking.paymentAmount = paymentAmount;
    if (dateTime !== undefined) booking.dateTime = dateTime;
    if (duration !== undefined) booking.duration = duration;
    if (poojaType !== undefined) booking.poojaType = poojaType;
    if (packageName !== undefined) booking.package = packageName;

    await booking.save();

    const updated = await Booking.findById(id)
      .populate("customer", "firstName lastName email phone image")
      .populate("vendor", "firstName lastName email phone image")
      .populate("service", "poojaType description price duration");

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*     Delete Booking by Admin    */
const deleteBookingByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*     Get Booking Statistics by Vendor    */
const getBookingStatsByVendor = async (req, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.vendor._id);

    const stats = await Booking.aggregate([
      { $match: { vendor: vendorId } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$paymentAmount" },
          pendingBookings: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          completedBookings: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          cancelledBookings: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } }
        }
      }
    ]);

    const result = stats[0] || {
      totalBookings: 0, totalRevenue: 0,
      pendingBookings: 0, completedBookings: 0, cancelledBookings: 0
    };

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBookingsByVendor,
  getAllBookingsByAdmin,
  getBookingsByVendorByAdmin,
  getBookingsByCustomerByAdmin,
  getActivePanditsByAdmin,
  updateBookingByAdmin,
  deleteBookingByAdmin,
  getOneBookingByVendor,
  updateBookingStatusByVendor,
  getBookingStatsByVendor,
};
