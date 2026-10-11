/**
 * Helpers for MasterService.variants (admin-managed puja options).
 *
 * A "variant" is NOT a separate service and NOT a separate pandit row.
 * It is only a named option with its own price that lives inside one
 * MasterService. Pandits keep their normal Service row (poojaType ===
 * MasterService.name), so every pandit of that puja automatically gets
 * every variant. Nothing in this file touches Service / Booking data.
 */

"use strict";

const slugify = require("./slugify");

const MAX_VARIANTS = 10;

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return NaN;
  return Number(value);
};

/**
 * Validate + normalize the `variants` array sent by the admin form.
 *
 * - `input === undefined`  -> returns undefined (caller must leave the
 *   stored variants untouched, so older admin screens / other API callers
 *   can never wipe them by accident).
 * - `input` is an array    -> returns the cleaned array (it REPLACES the
 *   stored one; a row removed in the admin form is removed here).
 *
 * `key` is generated once from the name and then never changes, so
 * renaming a variant later does not break links or booking validation.
 *
 * Throws Error(message) on invalid input.
 */
const sanitizeVariantsInput = (input, existingVariants = []) => {
  if (input === undefined) return undefined;
  if (input === null) return [];

  if (!Array.isArray(input)) {
    throw new Error("Variants must be an array");
  }
  if (input.length > MAX_VARIANTS) {
    throw new Error(`A puja can have at most ${MAX_VARIANTS} variants`);
  }

  const existingKeys = new Set(
    (existingVariants || []).map((variant) => variant.key)
  );
  const usedKeys = new Set();
  const usedNames = new Set();
  const result = [];

  input.forEach((raw, index) => {
    const label = `Variant #${index + 1}`;
    const name = String(raw?.name || "").trim();

    if (!name) throw new Error(`${label}: name is required`);
    if (name.length > 150) {
      throw new Error(`${label}: name is too long (max 150 characters)`);
    }

    const nameKey = name.toLowerCase();
    if (usedNames.has(nameKey)) {
      throw new Error(`${label}: duplicate variant name "${name}"`);
    }
    usedNames.add(nameKey);

    const price = toNumber(raw?.price);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error(`${label} (${name}): price must be greater than 0`);
    }

    let originalPrice = toNumber(raw?.originalPrice);
    if (!Number.isFinite(originalPrice) || originalPrice < 0) originalPrice = 0;

    const status = raw?.status === "inactive" ? "inactive" : "active";
    const duration = String(raw?.duration || "").trim();

    // Keep an existing key as-is; otherwise create a new unique one.
    let key = String(raw?.key || "").trim();
    if (!key || !existingKeys.has(key)) {
      const base = slugify(name) || `variant-${index + 1}`;
      key = base;
      let counter = 2;
      while (usedKeys.has(key) || existingKeys.has(key)) {
        key = `${base}-${counter}`;
        counter += 1;
      }
    }
    if (usedKeys.has(key)) {
      throw new Error(`${label}: duplicate variant key "${key}"`);
    }
    usedKeys.add(key);

    result.push({ key, name, price, originalPrice, duration, status });
  });

  return result;
};

/** Only ACTIVE variants, only the fields the website needs. */
const toPublicVariants = (masterService) =>
  (masterService?.variants || [])
    .filter((variant) => variant.status !== "inactive")
    .map((variant) => ({
      key: variant.key,
      name: variant.name,
      price: variant.price,
      originalPrice: variant.originalPrice || 0,
      duration: variant.duration || masterService.duration || "",
    }));

/** Active variant by key, or null. */
const findActiveVariant = (masterService, key) => {
  if (!masterService || !key) return null;
  return (
    (masterService.variants || []).find(
      (variant) => variant.key === String(key) && variant.status !== "inactive"
    ) || null
  );
};

module.exports = {
  MAX_VARIANTS,
  sanitizeVariantsInput,
  toPublicVariants,
  findActiveVariant,
};