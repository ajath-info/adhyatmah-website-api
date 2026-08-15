import { buildSitemapEntries } from 'src/utils/sitemap-entries';

// Serves /sitemap.xml via Next.js's built-in sitemap convention.
//
// NOTE: on the production server nginx currently answers /sitemap.xml itself
// (it has a `location` block left over from when the sitemap was a static file
// in public/), so this route is never reached there — nginx returns its own
// 162-byte 404 without proxying to the app. Verified by comparing response
// sizes on the live site: /sitemap.xml returns 162 bytes of nginx HTML, while
// any Next.js 404 returns ~140 KB.
//
// This route is kept so that the standard URL works the moment that nginx block
// is removed. Until then the identical sitemap is also served from
// src/app/sitemap-index.xml/route.js, which nginx does not intercept, and
// robots.txt advertises both.
export const revalidate = 3600; // rebuild the sitemap hourly

export default async function sitemap() {
  return buildSitemapEntries();
}
