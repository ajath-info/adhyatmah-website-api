// next
import { notFound } from 'next/navigation';

// mui
import { Box, Container } from '@mui/material';

// components
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import ProductList from 'src/components/_main/products';
import { CANONICAL_ORIGIN, isBadSlug } from 'src/utils/seo';
// Static generation with ISR
export const revalidate = 60;

// Base URL
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function generateStaticParams() {
  try {
    if (!baseUrl) return [];
    const res = await fetch(`${baseUrl}/api/child-categories-slugs`, {
      next: { revalidate: 3600 } // Cache slug list for 1 hour
    });

    if (!res.ok) return [];

    const { data } = await res.json();

    return data?.map((child) => ({ childCategory: child.slug })) || [];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('generateStaticParams: failed to fetch child-categories-slugs', err);
    return [];
  }
}

// Fetch the child category, returning null (never throwing) when it does not
// exist. `isBadSlug` short-circuits the literal "undefined" segment that
// produced /products/puja-kit/surya-sun-graha-shanti-puja/undefined — the URL
// Search Console reported under "Server error (5xx)".
async function fetchChildCategory(childCategory) {
  if (!baseUrl || isBadSlug(childCategory)) return null;

  try {
    const res = await fetch(`${baseUrl}/api/child-categories/${childCategory}`, {
      next: { revalidate: 60 }
    });

    if (!res.ok) return null;

    const response = await res.json();
    if (!response?.success || !response?.data) return null;

    return response.data;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('child-category page: failed to fetch child-category', err);
    return null;
  }
}

// // Generate metadata per brand
export async function generateMetadata({ params }) {
  const { category, subCategory, childCategory } = await params;

  const child = await fetchChildCategory(childCategory);
  if (!child) return {};

  return {
    title: child.metaTitle,
    description: child.metaDescription,
    alternates: {
      canonical: `${CANONICAL_ORIGIN}/products/${category}/${subCategory}/${childCategory}`
    },
    openGraph: {
      title: child.metaTitle,
      description: child.metaDescription
    }
  };
}
export default async function Listing(props) {
  const params = await props.params;

  const { category, subCategory, childCategory } = params;

  const childCategoryData = await fetchChildCategory(childCategory);

  // Must be outside any try/catch of ours: notFound() signals by throwing, so
  // a surrounding catch would swallow it. Previously this was called inside a
  // try block *and* `notFound` was never imported, so the ReferenceError
  // escaped as a 500 rather than rendering a 404.
  if (!childCategoryData) notFound();

  let filters = [];
  try {
    const res2 = await fetch(`${baseUrl}/api/products/filters`, { next: { revalidate: 60 } });
    if (res2.ok) {
      const response2 = await res2.json();
      filters = response2?.data || [];
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Listing: failed to fetch filters', err);
    filters = [];
  }

  return (
      <Box>
        <Box sx={{ bgcolor: 'background.default' }}>
          <Container maxWidth="xl">
            <HeaderBreadcrumbs
              heading={childCategoryData?.name}
              links={[
                {
                  name: 'Home',
                  href: '/'
                },
                {
                  name: 'Products',
                  href: '/products'
                },
                {
                  name: childCategoryData.subCategory?.parentCategory.name,
                  href: `/products/${category}`
                },
                {
                  name: childCategoryData.subCategory?.name,
                  href: `/products/${category}/${subCategory}`
                },
                {
                  name: childCategoryData?.name
                }
              ]}
            />

            <ProductList childCategory={childCategoryData} filters={filters} />
          </Container>
        </Box>
      </Box>
  );
}



// Render per-request (SSR): this page's filter/search components read useSearchParams,
// which cannot be statically prerendered. SSR still sends full HTML to crawlers.
export const dynamic = 'force-dynamic';
