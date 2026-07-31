const User = require("../../models/User");

const getSyncedCart = async (req, res) => {
  try {
    const uid = req.userData._id;

    const user = await User.findById(uid).populate("cart.productId");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cart = (user.cart || [])
      .filter((item) => item.productId) // skip items whose product was deleted
      .map((item) => {
        const product = item.productId;
        const isSimple = product.type === "simple";
        const variant = isSimple ? null : product.variants?.[0];

        const price = isSimple ? product.price : variant?.price;
        const salePrice = isSimple ? product.salePrice : variant?.salePrice;
        const image = isSimple
          ? product.images?.[0]?.url
          : variant?.images?.[0]?.url || product.images?.[0]?.url;

        return {
          pid: product._id,
          name: product.name,
          sku: isSimple ? product.sku : variant?.sku,
          slug: product.slug,
          stockQuantity: isSimple ? product.stockQuantity : variant?.stockQuantity,
          type: product.type,
          deliveryType: product.deliveryType,
          ...(product.deliveryType === "digital" && {
            downloadLink: isSimple ? product.downloadLink : variant?.downloadLink,
          }),
          ...(!isSimple &&
            variant && {
              variant: variant.name,
              variantName: variant.variant,
            }),
          image,
          quantity: item.quantity,
          discount: (price || 0) - (salePrice || 0),
          price: salePrice || price,
          subtotal: (salePrice || price || 0) * item.quantity,
        };
      });

    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getSyncedCart };