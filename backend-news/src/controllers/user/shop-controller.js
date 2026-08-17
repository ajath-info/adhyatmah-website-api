const Shop = require("../../models/Shop");
const User = require("../../models/User");
const Product = require("../../models/Product");
const Review = require("../../models/Review");
const Service = require("../../models/Service");
const MasterService = require("../../models/MasterService");

/**
 * Create Service documents for a vendor from selected catalog names (or objects),
 * and return { serviceIds, serviceNames } for User / Shop linkage.
 */
async function syncVendorServicesFromSelection(vendorId, selectedServices) {
  if (!Array.isArray(selectedServices) || selectedServices.length === 0) {
    return { serviceIds: [], serviceNames: [] };
  }

  const serviceIds = [];
  const serviceNames = [];
  const seen = new Set();

  // Escapes regex-special characters so a service name containing them
  // (e.g. "Griha Pravesh (Full)") can't break the case-insensitive match.
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  for (const selected of selectedServices) {
    const rawName =
      typeof selected === "string"
        ? selected
        : selected?.name || selected?.poojaType || "";
    const name = String(rawName || "").trim();
    if (!name) continue;

    // Source of truth is the MasterService DB (not the old static
    // allServices.js), so newly added/updated services get their real
    // price and duration instead of silently falling back to defaults.
    const catalog = await MasterService.findOne({
      name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
    });
    const poojaType = catalog?.name || name;
    if (seen.has(poojaType.toLowerCase())) continue;
    seen.add(poojaType.toLowerCase());

    const price = Number(catalog?.price) || 2100;
    const duration = catalog?.duration || "2-3 Hrs";
    const description = `${poojaType} performed with proper Vedic rituals and traditional guidance.`;

    let service = await Service.findOne({
      poojaType,
      vendor: vendorId,
    });

    if (service) {
      service.description = description;
      service.duration = duration;
      service.price = price;
      await service.save();
    } else {
      try {
        service = await Service.create({
          poojaType,
          description,
          duration,
          price,
          vendor: vendorId,
        });
      } catch (err) {
        if (err.code === 11000) {
          service = await Service.findOne({ poojaType, vendor: vendorId });
        } else {
          throw err;
        }
      }
    }

    if (service?._id) {
      serviceIds.push(service._id);
      serviceNames.push(poojaType);
    }
  }

  return { serviceIds, serviceNames };
}

async function calculateShopRating(shopId) {
  const products = await Product.find({ shop: shopId }).select("_id");
  const productIds = products.map((p) => p._id);

  const result = await Review.aggregate([
    { $match: { product: { $in: productIds } } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    rating: result.length > 0 ? result[0].avgRating : 0,
    ratingCount: result.length > 0 ? result[0].count : 0,
  };
}
/*     Get All Shops (Public)    */
const getShops = async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || null;
    let shopsQuery = Shop.find({ status: "approved" }).select([
      "products",
      "slug",
      "name",
      "logo",
      "description",
    ]);

    const startIndex = (page - 1) * (limit || 10);
    const totalShops = await Shop.countDocuments({ status: "approved" });
    const totalPages = Math.ceil(totalShops / limit);

    shopsQuery = shopsQuery.limit(limit).skip(startIndex).lean();

    const pagination = {
      currentPage: page,
      totalPages: totalPages,
      totalShops: totalShops,
    };

    const shops = await shopsQuery.exec();

    for (let shop of shops) {
      const { rating, ratingCount } = await calculateShopRating(shop._id);
      shop.rating = rating;
      shop.ratingCount = ratingCount;
      shop.totalProducts = shop.products ? shop.products.length : 0;
    }
    return res.status(200).json({
      success: true,
      data: shops,
      pagination: pagination,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/*     Get All Shops (Public)    */
const getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find({ status: "approved" }).select([
      "logo",
      "name",
      "description",
      "slug",
      "address",
    ]);
    return res.status(200).json({
      success: true,
      data: shops,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/*     Create Shop by User    */
const createShopByUser = async (req, res) => {
  try {
    const { logo, password, registrationNumber, ...others } = req.body;

    const fullName =
      [others.firstName, others.lastName].filter(Boolean).join(" ") ||
      others.name ||
      "Pandit Profile";

    let baseSlug = fullName
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]+/g, "")
      .replace(/\s+/g, "-");
    let slug = baseSlug;
    let suffix = 1;
    while (await Shop.findOne({ slug })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const user = await User.findById(req.userData._id.toString()).select("+password");
    if (user) {
      if (others.firstName) user.firstName = others.firstName;
      if (others.lastName) user.lastName = others.lastName;
      if (others.phone) user.phone = others.phone;
      if (others.email) user.email = others.email;
      if (others.gender) user.gender = others.gender;
      if (others.gotra !== undefined) user.gotra = others.gotra;
      if (others.pravar !== undefined) user.pravar = others.pravar;
      if (others.veda !== undefined) user.veda = others.veda;
      if (others.shakha !== undefined) user.shakha = others.shakha;
      if (others.pankti !== undefined) user.pankti = others.pankti;
      if (others.sutra !== undefined) user.sutra = others.sutra;
      if (others.designation) {
        user.about = Array.isArray(others.designation) ? others.designation.join(', ') : others.designation;
      }
      if (others.experience !== undefined) user.experience = others.experience;
      if (others.language) user.language = others.language;
      if (others.aadharNumber !== undefined) user.aadhar = others.aadharNumber;
      if (others.address?.streetAddress !== undefined) user.address = others.address.streetAddress;
      if (others.address?.city !== undefined) user.city = others.address.city;
      if (others.address?.state !== undefined) user.state = others.address.state;
      if (others.address?.country !== undefined) user.country = others.address.country;
      if (others.pincode !== undefined) user.zip = others.pincode;
      if (others.referralCode) user.referred_by = others.referralCode;
      if (others.dateOfBirth) user.dateOfBirth = others.dateOfBirth;
      if (password) user.password = password;
      if (logo?.url) user.image = logo.url;
      // Allow vendor dashboard access immediately after pandit profile creation
      user.isVerified = true;
      await user.save();
    }

    // Never persist empty/null registrationNumber — unique index treats null as a duplicate
    const shopPayload = {
      vendor: req.userData._id.toString(),
      ...others,
      name: others.name || fullName,
      slug,
      metaTitle: others.metaTitle || fullName,
      description: others.description || `Pandit profile of ${fullName}`,
      metaDescription:
        others.metaDescription || `Pandit profile of ${fullName}`,
      shopEmail: others.shopEmail || others.email,
      shopPhone: others.shopPhone || others.phone,
      logo: logo?.url
        ? {
            ...logo,
          }
        : undefined,
      status: "pending",
    };

    delete shopPayload.registrationNumber;
    delete shopPayload.password;
    delete shopPayload.aadharNumber;
    delete shopPayload.pincode;
    delete shopPayload.referralCode;

    // Empty string is not a valid gender enum — omit or normalize
    const normalizedGender = String(others.gender || "")
      .trim()
      .toLowerCase();
    if (["male", "female", "other"].includes(normalizedGender)) {
      shopPayload.gender = normalizedGender;
    } else {
      delete shopPayload.gender;
    }

    if (registrationNumber && String(registrationNumber).trim()) {
      shopPayload.registrationNumber = String(registrationNumber).trim();
    }

    let createdShop;
    try {
      createdShop = await Shop.create(shopPayload);
    } catch (createError) {
      // Repair legacy non-sparse unique index that rejects multiple null registrationNumbers
      if (
        createError?.code === 11000 &&
        String(createError.message || "").includes("registrationNumber")
      ) {
        await Shop.updateMany(
          {
            $or: [
              { registrationNumber: null },
              { registrationNumber: "" },
              { registrationNumber: { $exists: false } },
            ],
          },
          { $unset: { registrationNumber: 1 } }
        );
        try {
          await Shop.collection.dropIndex("registrationNumber_1");
        } catch (_) {
          /* index may already be gone */
        }
        await Shop.collection.createIndex(
          { registrationNumber: 1 },
          { unique: true, sparse: true }
        );
        createdShop = await Shop.create(shopPayload);
      } else {
        throw createError;
      }
    }

    const vendorId = req.userData._id.toString();
    const { serviceIds, serviceNames } = await syncVendorServicesFromSelection(
      vendorId,
      others.services
    );

    // Persist normalized names on Shop; ObjectId refs belong on User.services
    if (serviceNames.length > 0) {
      await Shop.findByIdAndUpdate(createdShop._id, {
        services: serviceNames,
      });
    }

    await User.findByIdAndUpdate(vendorId, {
      shop: createdShop._id.toString(),
      role: "vendor",
      isVerified: true,
      ...(serviceIds.length > 0 ? { services: serviceIds } : {}),
    });

    return res.status(201).json({
      success: true,
      message: "Pandit profile created",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/*    Get One Shop by User    */
const getOneShopByUser = async (req, res) => {
  try {
    const { slug } = req.params;
    const shop = await Shop.findOne({ slug: slug });
    if (!shop) {
      return res
        .status(404)
        .json({ success: false, message: "Pandit Profile Not Found" });
    }
    return res.status(200).json({
      success: true,
      data: shop,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/*     Get All Shop Slugs    */
const getShopsSlugs = async (req, res) => {
  try {
    const shops = await Shop.find().select(["slug"]);

    res.status(200).json({
      success: true,
      data: shops,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*     Get Shop Name by Slug    */
const getShopNameBySlug = async (req, res) => {
  try {
    const shop = await Shop.findOne({
      slug: req.params.slug,
    }).select([
      "logo",
      "description",
      "name",
      "slug",
      "address",
      "phone",
      "createdAt",
    ]);

    res.status(200).json({
      success: true,
      data: shop,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*     Get Shop by User    */
const getShopByUser = async (req, res) => {
  try {
    const shop = await Shop.findOne({ vendor: req.userData._id });
    if (!shop) {
      return res
        .status(404)
        .json({ success: false, message: "Pandit Profile Not Found" });
    }
    return res.status(200).json({
      success: true,
      data: shop,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getShops,
  getAllShops,
  getOneShopByUser,
  getShopsSlugs,
  getShopNameBySlug,
  createShopByUser,
  getShopByUser,
};