// Permanent redirects for URL shapes that must never be indexed on their own.
//
// This list lives in its own file because TWO places need it and they must not
// drift apart:
//   * next.config.js — turns each entry into a 301;
//   * src/app/sitemap.js — must exclude these paths, because submitting a URL
//     that immediately 301s is what produces the "Page with redirect" bucket in
//     Search Console.
//
// The category entries below are real sub-category / child-category listings in
// the CMS, but each one contains a single product with the same name, so the
// listing page duplicates the product page. The product URL is the canonical
// one and the listing 301s onto it.
//
// CommonJS on purpose: next.config.js is CommonJS and require()s this file.

/** @type {{source: string, destination: string}[]} */
const LEGACY_REDIRECTS = [
  { source: '/&', destination: '/' },

  // --- Duplicate-URL consolidation (former rewrites) ---------------------
  { source: '/shops', destination: '/book-pandit-online' },
  { source: '/puja-products-online-store', destination: '/products' },
  { source: '/puja-product-brands-online', destination: '/brands' },
  { source: '/about-us', destination: '/about' },
  { source: '/contact-us', destination: '/contact' },

  // --- Old Shopify locale prefix ----------------------------------------
  // Explicit mappings only: the old store's slugs differ from the current
  // ones, so a generic /hi/products/:slug rule would land on 404s.
  { source: '/hi/products/rudrabhishek-pooja', destination: '/product/rudrabhishek-puja-kit' },
  {
    source: '/hi/collections/puja/products/rudrabhishek-pooja',
    destination: '/product/rudrabhishek-puja-kit'
  },

  // --- Single-product category listings -> the product itself ------------
  { source: '/products/brahmin-varan-kit', destination: '/product/brahmin-varan-kit' },
  { source: '/products/brahmin-varan-kit/brahmin-varan-kit', destination: '/product/brahmin-varan-kit' },
  {
    source: '/products/brahmin-varan-kit/brahmin-varan-kit/brahmin-varan-kit',
    destination: '/product/brahmin-varan-kit'
  },
  { source: '/products/vastra-dakshina-for-pandit-ji/brahmin-varan-kit', destination: '/product/brahmin-varan-kit' },
  {
    source: '/products/vastra-dakshina-for-pandit-ji/brahmin-varan-kit/brahmin-varan-kit',
    destination: '/product/brahmin-varan-kit'
  },
  { source: '/products/puja-kit/bhoomi-neev-puja-kit', destination: '/product/bhoomi-neev-puja-kit' },
  { source: '/products/puja-kit/bhoomi-neev-puja-kit/bhoomi-neev-puja-kit', destination: '/product/bhoomi-neev-puja-kit' },
  {
    source: '/products/puja-kit/brihaspati-jupiter-graha-shanti-puja-kit',
    destination: '/product/brihaspati-jupiter-graha-shanti-puja-kit'
  },
  { source: '/products/puja-kit/budh-mercury-graha-shanti-puja-kit', destination: '/product/budh-graha-shanti-puja-kit' },
  {
    source: '/products/puja-kit/budh-mercury-graha-shanti-puja-kit/budh-mercury-graha-shanti-puja-kit',
    destination: '/product/budh-graha-shanti-puja-kit'
  },
  { source: '/products/puja-kit/engagement-puja-kit', destination: '/product/engagement-puja-kit' },
  { source: '/products/puja-kit/engagement-puja-kit/engagement-puja-kit', destination: '/product/engagement-puja-kit' },
  { source: '/products/puja-kit/griha-pravesh-puja-kit', destination: '/product/griha-pravesh-puja' },
  { source: '/products/puja-kit/griha-vastu-shanti-puja-kit', destination: '/product/griha-vastu-shanti-puja-kit' },
  { source: '/products/puja-kit-/mangal-mars-graha-shanti-puja-kit', destination: '/product/mangal-mars-graha-shanti-puja' },
  {
    source: '/products/instant-puja-kit/manglik-dosha-nivaran-puja-instant-kit/manglik-dosha-nivaran-puja-instant-kit',
    destination: '/product/manglik-dosha-nivaran-puja-instant-kit'
  },
  { source: '/products/puja-kit/mool-puja-kit-', destination: '/product/mool-puja-kit' },
  { source: '/products/puja-kit/mool-puja-kit-/mool-puja-kit', destination: '/product/mool-puja-kit' },
  { source: '/products/puja-kit/narayan-nagbali-puja-kit', destination: '/product/narayan-nagbali-puja-kit' },
  { source: '/products/puja-kit/navratri-puja-kit', destination: '/product/navratri-puja-kit' },
  { source: '/products/puja-kit/pitrudosh-nivaran-puja-kit', destination: '/product/pitrudosh-nivaran-puja-kit' },
  { source: '/products/puja-kit-/rahu-graha-shanti-puja-kit', destination: '/product/rahu-graha-shanti-puja-kit' },
  { source: '/products/puja-kit/rahu-graha-shanti-puja-kit', destination: '/product/rahu-graha-shanti-puja-kit' },
  { source: '/products/puja-kit/rudrabhishek-puja-kit/rudrabhishek-puja-kit', destination: '/product/rudrabhishek-puja-kit' },
  { source: '/products/puja-kit-/satyanarayan-puja-kit', destination: '/product/satyanarayan-puja-kit' },
  { source: '/products/puja-kit/shani-graha-shanti-puja-kit', destination: '/product/shani-graha-shanti-puja-kit' },
  {
    source: '/products/puja-kit/shanti-puja-poorvajon-ke-lie-puja-kit',
    destination: '/product/shanti-puja-poorvajon-ke-liye-puja-kit'
  },
  {
    source: '/products/puja-kit-/shukra-venus-graha-shanti-puja-kit',
    destination: '/product/shukra-venus-graha-shanti-puja-kit'
  },
  {
    source: '/products/puja-kit/shukra-venus-graha-shanti-puja-kit',
    destination: '/product/shukra-venus-graha-shanti-puja-kit'
  },
  { source: '/products/puja-kit/tilak-puja-kit', destination: '/product/tilak-puja-kit' },
  { source: '/products/puja-kit/vishwakarma-puja-kit', destination: '/product/vishwakarma-puja-kit' }
];

// Pattern redirects — parameterised, so they cannot be compared against the
// sitemap by string equality and are kept separate.
/** @type {{source: string, destination: string}[]} */
const PATTERN_REDIRECTS = [
  // Legacy Shopify product URLs: /collections/{collection}/products/{slug}
  // (optionally followed by a variant segment). These are the bulk of the
  // "Not found (404)" report.
  { source: '/collections/:collection/products/:slug', destination: '/product/:slug' },
  { source: '/collections/:collection/products/:slug/:rest*', destination: '/product/:slug' }
];

/** Set of literal paths that 301 — used by the sitemap to exclude them. */
const REDIRECTED_PATHS = new Set(LEGACY_REDIRECTS.map((r) => r.source));

module.exports = { LEGACY_REDIRECTS, PATTERN_REDIRECTS, REDIRECTED_PATHS };
