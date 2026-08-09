import { notFound } from 'next/navigation';

import VendorProfileClient from './VendorProfileClient';
import BreadcrumbSchema from 'src/components/seo/breadcrumb-schema';

import * as api from 'src/services';

import panditSeo from 'src/data/panditSeo';
import { CANONICAL_ORIGIN, isBadSlug } from 'src/utils/seo';

const createVendorSlug = (vendor) => {

  if (vendor?.slug) {
    return vendor.slug;
  }

  const fullName = [
    vendor?.firstName || '',
    vendor?.lastName || ''
  ].join(' ');

  let slug = fullName

    .toLowerCase()

    .replace(/[^\x00-\x7F]/g, '')

    .replace(/\./g, '')

    .replace(/[^a-z0-9\s-]/g, '')

    .replace(/\s+/g, '-')

    .replace(/-+/g, '-')

    .replace(/^-|-$/g, '');

  if (!slug) {

    slug = `pandit-${vendor?.id || vendor?._id}`;

  }

  return slug;
};

const decodeSlugParam = (value) => {
  if (typeof value !== 'string') return value;
  try {
    return decodeURIComponent(value).trim();
  } catch (error) {
    return value.trim();
  }
};

// This route is a single-segment catch-all: it matches ANY path that is not a
// real page (/collections, /random-typo, an old campaign URL...). It used to
// render the pandit-profile shell with HTTP 200 for every one of them, which
// Google reports as a Soft 404 and which also fed the "Duplicate without
// user-selected canonical" bucket. Looking the vendor up first and 404-ing when
// there is no match is what stops that.
async function findVendor(slug) {
  if (isBadSlug(slug)) return null;

  try {
    const response = await api.getAllPandit();
    const vendors = response?.payload?.vendors || [];
    return vendors.find((item) => createVendorSlug(item) === slug) || null;
  } catch (error) {
    console.warn('vendor profile: failed to fetch pandit list', error);
    return null;
  }
}

export async function generateMetadata({ params }) {

  // const slug = params.slug;
  const { slug: rawSlug } = await params;
  const slug = decodeSlugParam(rawSlug);

  const seoData =
    panditSeo[slug];

  const vendor = await findVendor(slug);

  if (!vendor) {
    return { title: 'Pandit Profile | Adhyatmah' };
  }

  const fullName =
    `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim();

  return {

    title:
      seoData?.title ||
      `${fullName} | Book Verified Pandit Online`,

    description:
      seoData?.description ||
      `Book ${fullName} for puja, havan, grah shanti and Hindu rituals.`,

    // The same pandit is also reachable at /shops/[slug] and /vendors/[id].
    // This URL is the one listed in the sitemap, so it is the canonical one.
    alternates: { canonical: `${CANONICAL_ORIGIN}/${slug}` },

    openGraph: {

      title:
        seoData?.title ||
        `${fullName} | Adhyatmah`,

      description:
        seoData?.description ||

        `Book ${fullName} for Vedic puja services.`,

      images: [
        {
          url: vendor?.profileImage
        }
      ]
    }

  };

}

export default async function Page({ params }) {

  const { slug: rawSlug } = await params;
  const slug = decodeSlugParam(rawSlug);

  const vendor = await findVendor(slug);

  // Real 404 for anything that is not an actual pandit profile.
  if (!vendor) notFound();

  const vendorName =
    `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || 'Pandit Profile';

  const breadcrumbItems = [
    { name: 'Home', url: `${CANONICAL_ORIGIN}/` },
    { name: 'Pandits', url: `${CANONICAL_ORIGIN}/book-pandit-online` },
    { name: vendorName, url: `${CANONICAL_ORIGIN}/${slug}` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />

      <VendorProfileClient />
    </>
  );

}