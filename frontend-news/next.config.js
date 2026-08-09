const path = require('path');
const { LEGACY_REDIRECTS, PATTERN_REDIRECTS } = require('./src/config/legacy-redirects');

// Note: this file previously carried a ~167-line commented-out copy of an older
// version of itself, sitting above the real config and contradicting it. It has
// been deleted — git history holds it if it is ever needed, and having two
// conflicting redirect lists in one file is how they drift apart.

/** @type {import('next').NextConfig} */
const nextConfig = {

  turbopack: {
    root: path.join(__dirname, '')
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  },

  // Automatically tree-shakes barrel imports (import { X } from '@mui/material'
  // etc.) so only the components actually used end up in the bundle. This is a
  // codebase-wide fix for the "Reduce unused JavaScript" / "Legacy JavaScript"
  // PageSpeed findings without having to hand-convert every import.
  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      'react-icons',
      'lodash',
    ],
  },

  // A rewrite serves one page at two different URLs. That is exactly what
  // Search Console flagged as "Duplicate without user-selected canonical":
  // /about-us and /about, /puja-products-online-store and /products and so on
  // all answered 200 with byte-identical HTML and no canonical to break the tie.
  //
  // Only ONE rewrite survives — /book-pandit-online. That URL is an exact match
  // for the primary target keyword, it is the URL already advertised in the
  // sitemap, and its twin (/shops) now 301s onto it, so no duplicate is left.
  // Every other rewrite became a 301 instead.
  //
  // Ordering note: redirects() run BEFORE afterFiles rewrites, and a rewrite's
  // internal destination is not re-run through redirects. So
  // /shops -> 301 -> /book-pandit-online -> rewritten internally to /shops
  // terminates; it does not loop. Verified with curl against `next start`.
  async rewrites() {
    return [

      {
        source: '/book-pandit-online',
        destination: '/shops',
      },

    ];
  },

  async redirects() {
    // The redirect list itself lives in src/config/legacy-redirects.js because
    // src/app/sitemap.js has to read it too: a URL that 301s must never be
    // submitted in the sitemap or it comes straight back as "Page with
    // redirect". One source of truth is what stops the two drifting apart.
    return [

      // --- One host only ---------------------------------------------------
      // https://adhyatmah.com/ currently answers 200 with the full site, i.e.
      // every page exists twice as far as Google is concerned. The canonical
      // tags already point at the www host; this makes the server agree.
      // The `has` host guard means it never fires on localhost, so `next dev`
      // and `next start` are unaffected.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'adhyatmah.com' }],
        destination: 'https://www.adhyatmah.com/:path*',
        statusCode: 301,
      },

      ...LEGACY_REDIRECTS.map((rule) => ({ ...rule, statusCode: 301 })),
      ...PATTERN_REDIRECTS.map((rule) => ({ ...rule, statusCode: 301 })),

    ];
  },

  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800',
          },
        ],
      },
    ];
  },

  images: {
    // Serve modern formats automatically (AVIF first, WebP fallback) instead
    // of shipping raw PNG/JPEG — this is the bulk of the "Improve image
    // delivery" savings from the PageSpeed report.
    formats: ['image/avif', 'image/webp'],
    // How long Next.js's own image-optimization cache keeps a resized/
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        hostname: 'images.unsplash.com'
      },
      {
        hostname: 'res.cloudinary.com'
      },
      {
        hostname: 'adhyatmah.com'
      },
      {
        hostname: 'www.adhyatmah.com'
      },
      {
        hostname: 'api.adhyatmah.com'
      },
      {
        hostname: 'cdn.shopify.com'
      }
    ]
  }

};

module.exports = nextConfig;
