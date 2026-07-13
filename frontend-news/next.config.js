'use client';

const path = require('path');

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

  // ADD THIS
  async rewrites() {
    return [

      {
        source: '/about-us',
        destination: '/about',
      },

      {
        source: '/contact-us',
        destination: '/contact',
      },
		
	  {
        source: '/book-pandit-online',
        destination: '/shops',
      },
		
	  {
        source: '/puja-products-online-store',
        destination: '/products',
      },
		
	  {
        source: '/puja-product-brands-online',
        destination: '/brands',
      },

	  {
        source: '/online-puja-services',
        destination: '/services',
      },

    ];
  },

  async redirects() {
    return [

      {
        source: '/&',
        destination: '/',
        statusCode: 301,
      },

      {
        source: '/hi/products/rudrabhishek-pooja',
        destination: '/product/rudrabhishek-puja-kit',
        statusCode: 301,
      },

      {
        source: '/hi/collections/puja/products/rudrabhishek-pooja',
        destination: '/product/rudrabhishek-puja-kit',
        statusCode: 301,
      },

      // Duplicate URL variants for "Brahmin Varan Kit" -> canonical product URL
      {
        source: '/products/brahmin-varan-kit',
        destination: '/product/brahmin-varan-kit',
        statusCode: 301,
      },

      {
        source: '/products/brahmin-varan-kit/brahmin-varan-kit',
        destination: '/product/brahmin-varan-kit',
        statusCode: 301,
      },

      {
        source: '/products/brahmin-varan-kit/brahmin-varan-kit/brahmin-varan-kit',
        destination: '/product/brahmin-varan-kit',
        statusCode: 301,
      },

      {
        source: '/products/vastra-dakshina-for-pandit-ji/brahmin-varan-kit',
        destination: '/product/brahmin-varan-kit',
        statusCode: 301,
      },

      {
        source: '/products/vastra-dakshina-for-pandit-ji/brahmin-varan-kit/brahmin-varan-kit',
        destination: '/product/brahmin-varan-kit',
        statusCode: 301,
      },

      // Duplicate URL variants across 20 products -> canonical product URLs
      { source: '/products/puja-kit/bhoomi-neev-puja-kit', destination: '/product/bhoomi-neev-puja-kit', statusCode: 301 },
      { source: '/products/puja-kit/bhoomi-neev-puja-kit/bhoomi-neev-puja-kit', destination: '/product/bhoomi-neev-puja-kit', statusCode: 301 },
      { source: '/products/puja-kit/brihaspati-jupiter-graha-shanti-puja-kit', destination: '/product/brihaspati-jupiter-graha-shanti-puja-kit', statusCode: 301 },
      { source: '/products/puja-kit/budh-mercury-graha-shanti-puja-kit', destination: '/product/budh-graha-shanti-puja-kit', statusCode: 301 },
      { source: '/products/puja-kit/budh-mercury-graha-shanti-puja-kit/budh-mercury-graha-shanti-puja-kit', destination: '/product/budh-graha-shanti-puja-kit', statusCode: 301 },
      { source: '/products/puja-kit/engagement-puja-kit', destination: '/product/engagement-puja-kit', statusCode: 301 },
      { source: '/products/puja-kit/engagement-puja-kit/engagement-puja-kit', destination: '/product/engagement-puja-kit', statusCode: 301 },
      { source: '/products/puja-kit/griha-pravesh-puja-kit', destination: '/product/griha-pravesh-puja', statusCode: 301 },
      { source: '/products/puja-kit/griha-vastu-shanti-puja-kit', destination: '/product/griha-vastu-shanti-puja-kit', statusCode: 301 },
      { source: '/products/puja-kit-/mangal-mars-graha-shanti-puja-kit', destination: '/product/mangal-mars-graha-shanti-puja', statusCode: 301 },
      { source: '/products/instant-puja-kit/manglik-dosha-nivaran-puja-instant-kit/manglik-dosha-nivaran-puja-instant-kit', destination: '/product/manglik-dosha-nivaran-puja-instant-kit', statusCode: 301 },
      { source: '/products/puja-kit/mool-puja-kit-', destination: '/product/mool-puja-kit', statusCode: 301 },
      { source: '/products/puja-kit/mool-puja-kit-/mool-puja-kit', destination: '/product/mool-puja-kit', statusCode: 301 },
      { source: '/products/puja-kit/narayan-nagbali-puja-kit', destination: '/product/narayan-nagbali-puja-kit', statusCode: 301 },
      { source: '/products/puja-kit/navratri-puja-kit', destination: '/product/navratri-puja-kit', statusCode: 301 },
      { source: '/products/puja-kit/pitrudosh-nivaran-puja-kit', destination: '/product/pitrudosh-nivaran-puja-kit', statusCode: 301 },
      { source: '/products/puja-kit-/rahu-graha-shanti-puja-kit', destination: '/product/rahu-graha-shanti-puja-kit', statusCode: 301 },
      { source: '/products/puja-kit/rahu-graha-shanti-puja-kit', destination: '/product/rahu-graha-shanti-puja-kit', statusCode: 301 },
      { source: '/products/puja-kit/rudrabhishek-puja-kit/rudrabhishek-puja-kit', destination: '/product/rudrabhishek-puja-kit', statusCode: 301 },
      { source: '/products/puja-kit-/satyanarayan-puja-kit', destination: '/product/satyanarayan-puja-kit', statusCode: 301 },
      { source: '/products/puja-kit/shani-graha-shanti-puja-kit', destination: '/product/shani-graha-shanti-puja-kit', statusCode: 301 },
      { source: '/products/puja-kit/shanti-puja-poorvajon-ke-lie-puja-kit', destination: '/product/shanti-puja-poorvajon-ke-liye-puja-kit', statusCode: 301 },
      { source: '/products/puja-kit-/shukra-venus-graha-shanti-puja-kit', destination: '/product/shukra-venus-graha-shanti-puja-kit', statusCode: 301 },
      { source: '/products/puja-kit/shukra-venus-graha-shanti-puja-kit', destination: '/product/shukra-venus-graha-shanti-puja-kit', statusCode: 301 },
      { source: '/products/puja-kit/tilak-puja-kit', destination: '/product/tilak-puja-kit', statusCode: 301 },
      { source: '/products/puja-kit/vishwakarma-puja-kit', destination: '/product/vishwakarma-puja-kit', statusCode: 301 },

    ];
  },

  images: {
    remotePatterns: [
      {
        hostname: 'images.unsplash.com'
      },
      {
        hostname: 'res.cloudinary.com'
      },
      {
        hostname: 'adhyatmah.vercel.app'
      },
      {
        hostname: 'adhyatmah-fe-staging.vercel.app'
      },
      {
        hostname: 'example.com'
      },
      {
        hostname: 'adhyatmah.com'
      },
      {
        hostname: 'www.adhyatmah.com'
      },
      {
        hostname: 'cdn.shopify.com'
      },
      {
        hostname: 'shopify.com'
      }
    ]
  }

};

module.exports = nextConfig;