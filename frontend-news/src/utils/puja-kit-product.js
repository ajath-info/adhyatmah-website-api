import * as api from 'src/services';

export const EMPTY_KIT_DATA = {
  id: null,
  name: '',
  imageUrl: '',
  price: null
};

export function slugifyPoojaName(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Slug candidates aligned with /product/puja-kit-* catalog URLs */
export function getPujaKitSlugCandidates(poojaType) {
  const base = slugifyPoojaName(poojaType);
  if (!base) return [];

  const withoutPujaSuffix = base.replace(/-(puja|pooja)$/, '');

  const candidates = [
    `puja-kit-${base}`,
    `puja-kit-${withoutPujaSuffix}`,
    `${base}-puja-kit`,
    `${withoutPujaSuffix}-puja-kit`,
    base
  ];

  return [...new Set(candidates.filter(Boolean))];
}

/** Slug candidates for instant kit catalog products */
export function getInstantKitSlugCandidates(poojaType) {
  const base = slugifyPoojaName(poojaType);
  if (!base) return [];

  const withoutPujaSuffix = base.replace(/-(puja|pooja)$/, '');

  const candidates = [
    `instant-kit-${base}`,
    `instant-kit-${withoutPujaSuffix}`,
    `${base}-instant-kit`,
    `${withoutPujaSuffix}-instant-kit`,
  ];

  return [...new Set(candidates.filter(Boolean))];
}

export function extractProductsFromListResponse(res) {
  return (
    (Array.isArray(res?.data) && res.data) ||
    (Array.isArray(res?.payload?.products) && res.payload.products) ||
    (Array.isArray(res?.data?.products) && res.data.products) ||
    (Array.isArray(res?.products) && res.products) ||
    []
  );
}

/** Same image source as product cards: images[0].url */
export function getProductImageUrl(product) {
  if (!product) return '';

  const img0 = product.images?.[0];
  if (typeof img0 === 'string' && img0) return img0;
  if (img0?.url) return img0.url;

  if (product.type === 'variable' && product.variant?.images?.[0]) {
    const v0 = product.variant.images[0];
    if (typeof v0 === 'string') return v0;
    if (v0?.url) return v0.url;
  }

  if (Array.isArray(product.variants)) {
    for (const variant of product.variants) {
      const v0 = variant?.images?.[0];
      if (typeof v0 === 'string' && v0) return v0;
      if (v0?.url) return v0.url;
    }
  }

  return '';
}

/** Extract price from product — tries multiple common field names */
export function getProductPrice(product) {
  if (!product) return null;
  return (
    product.salePrice ??
    product.price ??
    product.regularPrice ??
    product.variant?.salePrice ??
    product.variant?.price ??
    null
  );
}

export function productToKitData(product, fallbackName = '') {
  if (!product) return { ...EMPTY_KIT_DATA };

  return {
    id: product._id || product.id || null,
    name: product.name || fallbackName || '',
    imageUrl: getProductImageUrl(product),
    price: getProductPrice(product)
  };
}

/** Map getHomepagePoojaServicesKit product shape */
export function apiKitToKitData(item) {
  if (!item) return { ...EMPTY_KIT_DATA };

  return {
    id: item.id || item._id || null,
    name: item.name || '',
    imageUrl: item.image || item.imageUrl || '',
    price: item.price ?? item.salePrice ?? null
  };
}

/** Repeat product id for quantity (backend stores one ref per unit) */
export function buildKitProductIds(productId, quantity) {
  if (!productId || !quantity || quantity < 1) return [];
  return Array.from({ length: quantity }, () => productId);
}

export function buildPujaSamagriPayload({ pujaKit, pujaQty, pujaSkipped, instantKit, instantQty, instantSkipped }) {
  return {
    pujaKit:
      !pujaSkipped && pujaQty > 0 ? buildKitProductIds(pujaKit?.id, pujaQty) : [],
    instantKit:
      !instantSkipped && instantQty > 0 ? buildKitProductIds(instantKit?.id, instantQty) : []
  };
}

/**
 * Resolve kit image URL: try product slug(s) first, then catalog search fallback.
 * @deprecated Use fetchPujaKitData instead to also get price
 */
export async function fetchPujaKitImageUrl(poojaType) {
  const { imageUrl } = await fetchPujaKitData(poojaType);
  return imageUrl;
}

async function fetchKitBySlugs(slugs, poojaType, searchTerms, matchFn) {
  const name = String(poojaType || '').trim();

  for (const slug of slugs) {
    try {
      const res = await api.getProductBySlug(slug);
      const product = res?.data;
      const kit = productToKitData(product, name);
      if (kit.imageUrl || kit.price || kit.id) return kit;
    } catch {
      // try next slug
    }
  }

  if (!name) return { ...EMPTY_KIT_DATA };

  try {
    for (const term of searchTerms) {
      const res = await api.getProducts(`?q=${encodeURIComponent(term)}&limit=30`);
      const products = extractProductsFromListResponse(res);
      const matched = products.find(matchFn);
      if (matched) return productToKitData(matched, name);
    }
  } catch {
    // fall through
  }

  return { ...EMPTY_KIT_DATA };
}

/**
 * Resolve puja kit from catalog: slug lookup, then search fallback.
 * Returns { id, name, imageUrl, price }
 */
export async function fetchPujaKitData(poojaType) {
  const name = String(poojaType || '').trim();
  if (!name) return { ...EMPTY_KIT_DATA };

  const baseCheck = slugifyPoojaName(name).replace(/-(puja|pooja)$/, '');

  return fetchKitBySlugs(
    getPujaKitSlugCandidates(name),
    name,
    [`${name} kit`, `${name} puja kit`, name],
    (p) => {
      const label = String(p.name || '').toLowerCase();
      return label.includes('kit') && label.includes(baseCheck) && (getProductImageUrl(p) || getProductPrice(p));
    }
  );
}

/**
 * Resolve instant kit from catalog: slug lookup, then search fallback.
 * Returns { id, name, imageUrl, price }
 */
export async function fetchInstantKitData(poojaType) {
  const name = String(poojaType || '').trim();
  if (!name) return { ...EMPTY_KIT_DATA };

  const baseCheck = slugifyPoojaName(name).replace(/-(puja|pooja)$/, '');

  return fetchKitBySlugs(
    getInstantKitSlugCandidates(name),
    name,
    [`${name} instant kit`, `instant kit ${name}`],
    (p) => {
      const label = String(p.name || '').toLowerCase();
      return label.includes('instant') && label.includes('kit') && label.includes(baseCheck);
    }
  );
}

/**
 * Fetch puja + instant kits for a service (homepage API first, catalog fallback).
 */
export async function fetchServiceKits(serviceId, poojaType) {
  const empty = {
    pujaKit: { ...EMPTY_KIT_DATA },
    instantKit: { ...EMPTY_KIT_DATA }
  };

  if (serviceId) {
    try {
      const res = await api.getHomepagePoojaServicesKit(serviceId);

      if (res?.payload) {
        const pujaArr = res.payload.pujaKit;
        const instantArr = res.payload.instantKit;

        const puja = Array.isArray(pujaArr) && pujaArr.length > 0 ? pujaArr[0] : null;
        const instant = Array.isArray(instantArr) && instantArr.length > 0 ? instantArr[0] : null;

        // Agar API ne is service ke liye pujaKit/instantKit nahi diya (empty array),
        // to catalog fallback try karo (name/slug based matching, baseCheck ke saath
        // safe hai, unrelated kits match nahi karega).
        const [pujaFallback, instantFallback] = await Promise.all([
          puja ? Promise.resolve(null) : fetchPujaKitData(poojaType),
          instant ? Promise.resolve(null) : fetchInstantKitData(poojaType)
        ]);

        return {
          pujaKit: puja ? apiKitToKitData(puja) : pujaFallback,
          instantKit: instant ? apiKitToKitData(instant) : instantFallback
        };
      }
    } catch {
      // API fail ho gayi — catalog fallback try karo
    }
  }

  // API unavailable thi (network error etc.) — catalog se try karo
  const [pujaKit, instantKit] = await Promise.all([
    fetchPujaKitData(poojaType),
    fetchInstantKitData(poojaType)
  ]);

  return { pujaKit, instantKit };
}