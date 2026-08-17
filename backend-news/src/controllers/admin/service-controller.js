const Service = require("../../models/Service");
const User = require("../../models/User");
const MasterService = require("../../models/MasterService");

/*     Get All Services by Admin    */
const getServicesByAdmin = async (req, res) => {
  try {
    const {
      page: pageQuery,
      limit: limitQuery,
      search: searchQuery,
    } = req.query;

    const limit = parseInt(limitQuery) || 10;
    const page = parseInt(pageQuery) || 1;
    const skip = limit * (page - 1);

    const matchQuery = {};

    const totalServices = await Service.countDocuments({
      poojaType: { $regex: searchQuery || "", $options: "i" },
      ...matchQuery,
    });

    const services = await Service.find({
      poojaType: { $regex: searchQuery || "", $options: "i" },
      ...matchQuery,
    })
      .populate('vendor', 'firstName lastName email phone')
      .select("poojaType description duration price vendor createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: services,
      total: totalServices,
      count: Math.ceil(totalServices / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*     Create Service by Admin    */
const createServiceByAdmin = async (req, res) => {
  try {
    const { poojaType, description, duration, vendor } = req.body;

    if (!vendor) {
      return res.status(400).json({
        success: false,
        message: "Vendor is required",
      });
    }

    // Check if vendor exists
    const vendorUser = await User.findById(vendor);
    if (!vendorUser || vendorUser.role !== "vendor") {
      return res.status(400).json({
        success: false,
        message: "Invalid vendor selected",
      });
    }

    // poojaType must match an ACTIVE Master Service (exact match).
    // Price is NEVER trusted from the frontend - it is always derived
    // from MasterService.price on the server.
    const masterService = await MasterService.findOne({
      name: poojaType,
      status: "active",
    });

    if (!masterService) {
      return res.status(400).json({
        success: false,
        message:
          "Selected pooja type is not an active master service. Please choose a valid service.",
      });
    }

    // Check if service already exists for this vendor
    const existingService = await Service.findOne({
      poojaType,
      vendor: vendor,
    });

    if (existingService) {
      return res.status(400).json({
        success: false,
        message: "Service already exists for this pooja type",
      });
    }

    const service = await Service.create({
      poojaType,
      description,
      duration,
      price: masterService.price,
      vendor: vendor,
    });

    // Add service to vendor's services array
    await User.findByIdAndUpdate(vendor, {
      $push: { services: service._id },
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*     Get One Service by Admin    */
const getOneServiceByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id).populate('vendor', 'firstName lastName email phone');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*     Update Service by Admin    */
const updateServiceByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { poojaType, description, duration, vendor } = req.body;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Check if vendor is being changed
    if (vendor && vendor !== service.vendor.toString()) {
      const vendorUser = await User.findById(vendor);
      if (!vendorUser || vendorUser.role !== "vendor") {
        return res.status(400).json({
          success: false,
          message: "Invalid vendor selected",
        });
      }

      // Remove service from old vendor
      await User.findByIdAndUpdate(service.vendor, {
        $pull: { services: service._id },
      });

      // Add service to new vendor
      await User.findByIdAndUpdate(vendor, {
        $push: { services: service._id },
      });
    }

    // Price stays read-only for admin edits too: it is always derived
    // from the matching active MasterService, never trusted from the
    // client - unless poojaType is unchanged, in which case the
    // existing price is left as-is (MasterService price-change cascade
    // already keeps it in sync separately).
    let derivedPrice = service.price;

    // Check if another service with same poojaType exists (excluding current one)
    if (poojaType && poojaType !== service.poojaType) {
      const duplicateService = await Service.findOne({
        poojaType,
        vendor: vendor || service.vendor,
        _id: { $ne: id },
      });

      if (duplicateService) {
        return res.status(400).json({
          success: false,
          message: "Service already exists for this pooja type",
        });
      }

      const masterService = await MasterService.findOne({
        name: poojaType,
        status: "active",
      });

      if (!masterService) {
        return res.status(400).json({
          success: false,
          message:
            "Selected pooja type is not an active master service. Please choose a valid service.",
        });
      }

      derivedPrice = masterService.price;
    }

    const updateData = {
      poojaType: poojaType || service.poojaType,
      description: description || service.description,
      duration: duration || service.duration,
      price: derivedPrice,
    };

    if (vendor) {
      updateData.vendor = vendor;
    }

    const updatedService = await Service.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('vendor', 'firstName lastName email phone');

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: updatedService,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*     Delete Service by Admin    */
const deleteServiceByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    await Service.findByIdAndDelete(id);

    // Remove service from vendor's services array
    await User.findByIdAndUpdate(service.vendor, {
      $pull: { services: service._id },
    });

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createServiceByAdmin,
  getServicesByAdmin,
  getOneServiceByAdmin,
  updateServiceByAdmin,
  deleteServiceByAdmin,
};