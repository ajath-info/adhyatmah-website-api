const User = require("../../models/User");
const Order = require("../../models/Order");
const Shop = require("../../models/Shop");

const getUsersByAdmin = async (req, res) => {
  try {
    let { limit = 10, page = 1, search = "", role } = req.query;

    limit = Number(limit);
    page = Number(page);
    const skip = limit * (page - 1);

    const andConditions = [];

    // 🔍 Search
    if (search?.trim()) {
      andConditions.push({
        $or: [
          { firstName: { $regex: search.trim(), $options: "i" } },
          { lastName: { $regex: search.trim(), $options: "i" } },
          { email: { $regex: search.trim(), $options: "i" } },
        ],
      });
    }

    //  Role filter (HARD FIX)
    if (role?.trim()) {
      if (role === "admin") {
        andConditions.push({
          role: { $in: ["admin", "super-admin"] },
        });
      } else {
        andConditions.push({
          role: role.trim(),
        });
      }
    } else {
      // Default Users list should not include vendors — vendors have their
      // own dedicated listing (role=vendor is passed explicitly there).
      andConditions.push({
        role: { $ne: "vendor" },
      });
    }

    const query = andConditions.length ? { $and: andConditions } : {};

    const totalUserCounts = await User.countDocuments(query);

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const usersWithOrders = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({
          "user._id": user._id,
        });
        return { ...user, totalOrders: orderCount };
      })
    );

    return res.status(200).json({
      success: true,
      data: usersWithOrders,
      page: page,
      totalPages: Math.ceil(totalUserCounts / limit),
      count: Math.ceil(totalUserCounts / limit),
      total: totalUserCounts,
      currentPage: page,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/*  Get orders of a user managed by admin */
const getUserOrdersByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10, page = 1 } = req.query;
    const skip = parseInt(limit) * (parseInt(page) - 1) || 0;

    const currentUser = await User.findById(id).select("-password").lean();
    if (!currentUser) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }

    let shop = null;
    if (currentUser.shop) {
      shop = await Shop.findById(currentUser.shop).lean();
    } else if (currentUser.role === "vendor") {
      shop = await Shop.findOne({ vendor: id }).lean();
    }

    const totalOrders = await Order.countDocuments({ "user._id": id });
    const orders = await Order.find({ "user._id": id }, null, {
      skip: skip,
      limit: parseInt(limit),
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      user: {
        ...currentUser,
        shop,
      },
      orders,
      count: Math.ceil(totalOrders / parseInt(limit)),
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/*  Update a user's role by admin */
const updateUserRoleByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const userToUpdate = await User.findById(id);

    if (!userToUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found." });
    }

    if (userToUpdate.role === "super-admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot Change The Role Of A Super Admin.",
      });
    }

    const newRole = userToUpdate.role === "user" ? "admin" : "user";
    // 🚫 Vendor cannot become Admin
    if (userToUpdate.role === "vendor" && newRole === "admin") {
      return res.status(403).json({
        success: false,
        message: "A vendor cannot be assigned as admin.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role: newRole },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: `${updatedUser.firstName} Is Now ${newRole}.`,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/*  Update a user's status by admin */
const updateUserStatusByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const userToUpdate = await User.findById(id);

    if (!userToUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found." });
    }

    // Prevent deactivating super-admins
    if (
      userToUpdate.role === "super-admin" &&
      userToUpdate.status === "active"
    ) {
      return res.status(403).json({
        success: false,
        message: "Cannot deactivate a Super Admin.",
      });
    }

    // Toggle status: active <-> inactive
    const newStatus = userToUpdate.status === "active" ? "inactive" : "active";

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: `${updatedUser.firstName} is now ${newStatus}.`,
      data: {
        _id: updatedUser._id,
        status: updatedUser.status,
        firstName: updatedUser.firstName,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/*  Update a user's details (and linked Shop, if any) by admin  */
const updateUserDetailsByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const userToUpdate = await User.findById(id);

    if (!userToUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found." });
    }

    // Never allow role/status/password to be changed from this endpoint —
    // those have their own dedicated, guarded endpoints.
    const {
      role,
      status,
      password,
      email,
      referral_code,
      ...allowedFields
    } = req.body;

    // Email is allowed to change, but must stay unique.
    if (email !== undefined && email !== userToUpdate.email) {
      const emailTaken = await User.findOne({
        email,
        _id: { $ne: id },
      }).lean();
      if (emailTaken) {
        return res
          .status(400)
          .json({ success: false, message: "Email is already in use." });
      }
      allowedFields.email = email;
    }

    const updatedUser = await User.findByIdAndUpdate(id, allowedFields, {
      new: true,
      runValidators: true,
    }).select("-password");

    // Keep the linked Shop's mirrored personal/spiritual fields in sync,
    // the same way the Shop-edit page keeps the User in sync.
    if (updatedUser?.shop) {
      const shopUpdate = {};
      if (allowedFields.firstName !== undefined) shopUpdate.firstName = allowedFields.firstName;
      if (allowedFields.lastName !== undefined) shopUpdate.lastName = allowedFields.lastName;
      if (allowedFields.phone !== undefined) shopUpdate.phone = allowedFields.phone;
      if (allowedFields.email !== undefined) shopUpdate.shopEmail = allowedFields.email;
      if (allowedFields.gender !== undefined) shopUpdate.gender = allowedFields.gender;
      if (allowedFields.dateOfBirth !== undefined) shopUpdate.dateOfBirth = allowedFields.dateOfBirth;
      if (allowedFields.about !== undefined) {
        shopUpdate.designation = allowedFields.about
          ? allowedFields.about.split(',').map((item) => item.trim()).filter(Boolean)
          : [];
      }
      if (allowedFields.experience !== undefined) shopUpdate.experience = allowedFields.experience;
      if (allowedFields.language !== undefined) shopUpdate.language = allowedFields.language;
      if (allowedFields.gotra !== undefined) shopUpdate.gotra = allowedFields.gotra;
      if (allowedFields.pravar !== undefined) shopUpdate.pravar = allowedFields.pravar;
      if (allowedFields.veda !== undefined) shopUpdate.veda = allowedFields.veda;
      if (allowedFields.shakha !== undefined) shopUpdate.shakha = allowedFields.shakha;
      if (allowedFields.pankti !== undefined) shopUpdate.pankti = allowedFields.pankti;
      if (allowedFields.sutra !== undefined) shopUpdate.sutra = allowedFields.sutra;
      if (allowedFields.aadhar !== undefined) shopUpdate.aadharNumber = allowedFields.aadhar;
      if (allowedFields.zip !== undefined) shopUpdate.pincode = allowedFields.zip;
      if (
        allowedFields.address !== undefined ||
        allowedFields.city !== undefined ||
        allowedFields.state !== undefined ||
        allowedFields.country !== undefined
      ) {
        if (allowedFields.address !== undefined) shopUpdate["address.streetAddress"] = allowedFields.address;
        if (allowedFields.city !== undefined) shopUpdate["address.city"] = allowedFields.city;
        if (allowedFields.state !== undefined) shopUpdate["address.state"] = allowedFields.state;
        if (allowedFields.country !== undefined) shopUpdate["address.country"] = allowedFields.country;
      }

      if (Object.keys(shopUpdate).length > 0) {
        await Shop.findByIdAndUpdate(updatedUser.shop, shopUpdate, {
          runValidators: true,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Vendor details updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsersByAdmin,
  getUserOrdersByAdmin,
  updateUserRoleByAdmin,
  updateUserStatusByAdmin,
  updateUserDetailsByAdmin,
};