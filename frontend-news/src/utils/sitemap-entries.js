import { CANONICAL_ORIGIN } from 'src/utils/seo';
import { REDIRECTED_PATHS } from 'src/config/legacy-redirects';

// Dynamic sitemap, generated from the live API.
//
// The sitemap this replaces was a hand-maintained public/sitemap.xml with 21
// URLs. Two things were wrong with it:
//
//   1. It listed almost nothing — no products, no product categories, no blog
//      posts, no services. Roughly 250 real, indexable URLs were never
//      submitted, which is a large part of the "Crawled/Discovered - currently
//      not indexed" numbers.
//   2. Several pandit URLs in it did not exist. It listed /satyam-mishra,
//      /karan-pandey, /dr-agnivesh-mishra and others, while the real slugs are
//      /pandit-satyam-mishra, /pandit-karan-pandey, /dr.-agniwesh-mishra-mishra.
//      Submitting URLs that do not resolve is a direct way to earn Soft 404s.
//
// Building the list from the same endpoints the pages themselves use means the
// two can no longer drift apart.
//
// The URL list lives in this shared module rather than inside app/sitemap.js
// because the same list is served at two paths — see src/app/sitemap.js and
// src/app/sitemap-index.xml/route.js for the reason.

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

async function getJson(path) {
  if (!baseUrl) return null;

  try {
    const res = await fetch(`${baseUrl}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn(`sitemap: failed to fetch ${path}`, err);
    return null;
  }
}

const url = (path, priority, changeFrequency = 'weekly') => ({
  url: `${CANONICAL_ORIGIN}${path}`,
  lastModified: new Date(),
  changeFrequency,
  priority
});

// Static routes. These are the canonical URLs only — the old /about-us,
// /contact-us, /puja-products-online-store and /puja-product-brands-online
// aliases now 301 and must not be advertised here.
const STATIC_ROUTES = [
  url('/', 1.0, 'daily'),
  url('/book-pandit-online', 0.95, 'daily'),
  url('/products', 0.9, 'daily'),
  url('/services', 0.9, 'weekly'),
  url('/offline-puja-services', 0.85, 'weekly'),
  url('/online-puja-services', 0.7, 'monthly'),
  url('/popular-puja', 0.85, 'weekly'),
  url('/brands', 0.8, 'weekly'),
  url('/blogs', 0.8, 'daily'),
  url('/panchang-muhurat', 0.7, 'weekly'),
  url('/about', 0.6, 'monthly'),
  url('/contact', 0.6, 'monthly'),
  url('/create-shop', 0.5, 'monthly'),
  url('/privacy-policy', 0.3, 'yearly'),
  url('/terms-and-conditions', 0.3, 'yearly'),
  url('/refund-return-policy', 0.3, 'yearly')
];

// Vendor slug derivation must match src/app/(user)/[slug]/page.js exactly,
// otherwise the sitemap would once again advertise URLs that 404.
const createVendorSlug = (vendor) => {
  if (vendor?.slug) return vendor.slug;

  const fullName = [vendor?.firstName || '', vendor?.lastName || ''].join(' ');

  const slug = fullName
    .toLowerCase()
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\./g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || `pandit-${vendor?.id}`;
};

// Run `task` over `items` at most `size` at a time, so expanding 76
// sub-categories does not fire 76 simultaneous requests at the API.
async function inBatches(items, size, task) {
  const results = [];
  for (let i = 0; i < items.length; i += size) {
    results.push(...(await Promise.all(items.slice(i, i + size).map(task))));
  }
  return results;
}

export async function buildSitemapEntries() {
  const [products, categories, subCategories, articles, pandits, brands] =
    await Promise.all([
      getJson('/api/products-slugs'),
      getJson('/api/categories-slugs'),
      getJson('/api/sub-categories-slugs'),
      getJson('/api/articles?limit=500'),
      getJson('/api/getAllPandit'),
      getJson('/api/brands?page=1&limit=200')
    ]);

  const entries = [...STATIC_ROUTES];

  // Pandit profiles — the site's highest-intent pages after the homepage.
  for (const vendor of pandits?.payload?.vendors || []) {
    const slug = createVendorSlug(vendor);
    if (slug) entries.push(url(`/${slug}`, 0.9, 'weekly'));
  }

  // Products.
  for (const product of products?.data || []) {
    if (product?.slug) entries.push(url(`/product/${product.slug}`, 0.8, 'weekly'));
  }

  // Category listings, level 1.
  for (const category of categories?.data || []) {
    if (category?.slug) entries.push(url(`/products/${category.slug}`, 0.75, 'weekly'));
  }

  // Level 2. /api/sub-categories-slugs already carries the parent, so the
  // two-segment path can be built without an extra request.
  const subCategoryPaths = [];
  for (const sub of subCategories?.data || []) {
    const parentSlug = sub?.parentCategory?.slug;
    if (!sub?.slug || !parentSlug) continue;
    const path = `/products/${parentSlug}/${sub.slug}`;
    subCategoryPaths.push({ slug: sub.slug, path });
    entries.push(url(path, 0.7, 'weekly'));
  }

  // Level 3. /api/child-categories-slugs returns only {_id, slug} with no link
  // back to its parent, so the three-segment path cannot be reconstructed from
  // it. The sub-category detail endpoint does return childCategories, so the
  // paths are expanded from there instead — batched to keep the load sane.
  const childPathGroups = await inBatches(subCategoryPaths, 10, async ({ slug, path }) => {
    const detail = await getJson(`/api/sub-categories/${slug}`);
    return (detail?.data?.childCategories || [])
      .filter((child) => child?.slug)
      .map((child) => `${path}/${child.slug}`);
  });

  for (const childPath of childPathGroups.flat()) {
    entries.push(url(childPath, 0.65, 'weekly'));
  }

  // Blog posts.
  for (const article of articles?.data || []) {
    const handle = article?.handle || article?.slug;
    if (!handle) continue;
    entries.push({
      url: `${CANONICAL_ORIGIN}/blogs/${handle}`,
      lastModified: article.updatedAt ? new Date(article.updatedAt) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.7
    });
  }

  // Brand listings.
  for (const brand of brands?.data || []) {
    if (brand?.slug) entries.push(url(`/brands/${brand.slug}`, 0.6, 'monthly'));
  }

  // Two final guards:
  //
  //  1. Drop anything that next.config.js 301s. 25 of the CMS sub-category and
  //     child-category listings (e.g. /products/puja-kit/narayan-nagbali-puja-kit)
  //     hold a single product with the same name, so they redirect to that
  //     product. Advertising them here would hand Search Console a fresh batch
  //     of "Page with redirect".
  //  2. De-duplicate, in case two sources produced the same URL.
  const seen = new Set();

  return entries.filter((entry) => {
    const path = entry.url.replace(CANONICAL_ORIGIN, '') || '/';
    if (REDIRECTED_PATHS.has(path)) return false;
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
