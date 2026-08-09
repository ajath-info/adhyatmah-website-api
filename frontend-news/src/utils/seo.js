// Single source of truth for everything canonical-URL related.
//
// Why this file exists: Google Search Console was reporting 29 pages as
// "Duplicate without user-selected canonical" because only `/` and
// `/product/[slug]` declared a canonical. Every other route inherited
// `metadataBase` from src/app/layout.js — which pointed at the *non-www*
// origin — and declared no `alternates.canonical` at all, so Google had to
// guess which of several equivalent URLs was the real one.
//
// Rules encoded here:
//   1. The canonical origin is https://www.adhyatmah.com (with www). The
//      non-www host also answers 200, so every canonical must be absolute
//      and must use www, otherwise Google sees two live copies of the site.
//   2. Canonicals never carry a query string. `/products?category=x` is a
//      filtered view of `/products`, not a separate page.
//   3. Slugs that arrive as the literal strings "undefined"/"null" (from a
//      client-side link built out of an undefined variable) are not real
//      pages and must 404, never 500.

export const CANONICAL_ORIGIN = 'https://www.adhyatmah.com';

/**
 * Build an absolute, canonical URL for a route.
 * @param {string} path e.g. '/products' or 'products' or '/'
 * @returns {string} e.g. 'https://www.adhyatmah.com/products'
 */
export function canonicalUrl(path = '/') {
  if (!path || path === '/') return `${CANONICAL_ORIGIN}/`;

  // Drop any query string / hash — a canonical must point at the bare page.
  const clean = String(path).split('?')[0].split('#')[0];
  const withSlash = clean.startsWith('/') ? clean : `/${clean}`;

  // Strip a trailing slash so we never emit both /products and /products/.
  const normalised = withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : withSlash;

  return `${CANONICAL_ORIGIN}${normalised}`;
}

/**
 * Shorthand for the `alternates` block of a Next.js metadata object.
 * Usage: `return { title, description, ...canonicalMeta('/products') }`
 */
export function canonicalMeta(path = '/') {
  return { alternates: { canonical: canonicalUrl(path) } };
}

/**
 * True when a dynamic route param is not a usable slug.
 *
 * Covers the exact case behind the "Server error (5xx)" report: URLs such as
 * /products/puja-kit/surya-sun-graha-shanti-puja/undefined, produced when a
 * link template interpolated an undefined value.
 */
export function isBadSlug(slug) {
  if (typeof slug !== 'string') return true;
  const value = slug.trim().toLowerCase();
  return value === '' || value === 'undefined' || value === 'null' || value === '[object object]';
}

/**
 * Metadata for pages that must never enter the index (thin utility routes,
 * account pages, transactional confirmation screens).
 */
export const NOINDEX = {
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } }
};
