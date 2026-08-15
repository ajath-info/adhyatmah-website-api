import { buildSitemapEntries } from 'src/utils/sitemap-entries';

// Same sitemap as src/app/sitemap.js, served at /sitemap-index.xml.
//
// Why a second path exists: nginx on the production server intercepts the exact
// path /sitemap.xml and answers it itself, so the Next.js route behind it is
// unreachable there. Every other filename falls through to the app normally —
// confirmed against the live site, where /sitemap.xml returns nginx's 162-byte
// error page while /sitemap-index.xml reaches Next.js.
//
// Google does not require any particular filename; it uses whatever robots.txt
// declares and whatever is submitted in Search Console. So this path makes the
// sitemap reachable without needing a server-config change. Once the nginx
// block is removed, /sitemap.xml starts working too and both stay valid.

export const revalidate = 3600;

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toIsoDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

export async function GET() {
  const entries = await buildSitemapEntries();

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map((entry) =>
      [
        '<url>',
        `<loc>${escapeXml(entry.url)}</loc>`,
        `<lastmod>${toIsoDate(entry.lastModified)}</lastmod>`,
        entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : '',
        entry.priority !== undefined ? `<priority>${entry.priority}</priority>` : '',
        '</url>'
      ]
        .filter(Boolean)
        .join('')
    ),
    '</urlset>'
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, must-revalidate'
    }
  });
}
