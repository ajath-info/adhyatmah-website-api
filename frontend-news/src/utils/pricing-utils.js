/**
 * Pricing utility functions for calculating and formatting prices with discounts
 * Used across product cards, puja kits, and all category kit cards
 */

/**
 * Calculate discount percentage between regular price and sale price
 * @param {number} regularPrice - Original/MRP price
 * @param {number} salePrice - Current selling price
 * @returns {number} Discount percentage (0-100)
 */
export function calculateDiscountPercentage(regularPrice, salePrice) {
  if (!regularPrice || !salePrice || regularPrice <= 0) return 0;
  if (salePrice > regularPrice) return 0; // No discount if sale price is higher
  
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
}

/**
 * Check if pricing should display with discount
 * @param {number} regularPrice - Original/MRP price
 * @param {number} salePrice - Current selling price
 * @returns {boolean} True if regular price exists and is valid
 */
export function shouldShowDiscount(regularPrice, salePrice) {
  // Show discount only if:
  // 1. Regular price exists and is greater than 0
  // 2. Regular price is greater than sale price
  return (
    regularPrice &&
    !isNaN(regularPrice) &&
    regularPrice > 0 &&
    salePrice &&
    !isNaN(salePrice) &&
    salePrice > 0 &&
    regularPrice > salePrice
  );
}

/**
 * Get pricing information for display
 * Returns structured data for rendering pricing UI
 * 
 * @param {object} product - Product object with salePrice and price/regularPrice
 * @returns {object} Pricing structure: { salePrice, regularPrice, discountPercent, shouldShow }
 */
export function getPricingInfo(product) {
  if (!product) {
    return {
      salePrice: null,
      regularPrice: null,
      discountPercent: 0,
      shouldShow: false
    };
  }

  const salePrice = product.salePrice ?? product.price ?? null;
  const regularPrice = product.regularPrice ?? product.price ?? null;

  const discountPercent = calculateDiscountPercentage(regularPrice, salePrice);
  const shouldShow = shouldShowDiscount(regularPrice, salePrice);

  return {
    salePrice,
    regularPrice: shouldShow ? regularPrice : null,
    discountPercent: shouldShow ? discountPercent : 0,
    shouldShow
  };
}

/**
 * Format price with currency symbol
 * @param {number} price - Price value
 * @returns {string} Formatted price string
 */
export function formatPriceWithCurrency(price) {
  if (!price || isNaN(price)) return '₹0';
  return `₹${price.toLocaleString('en-IN')}`;
}
