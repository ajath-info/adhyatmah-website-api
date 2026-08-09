// next
import { notFound } from 'next/navigation';

// mui
import { Box, Container } from '@mui/material';

// components
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import ProductList from 'src/components/_main/products';

import Categories from '@/components/_main/home/categories';
import { CANONICAL_ORIGIN, isBadSlug } from 'src/utils/seo';
export const revalidate = 60;
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function generateStaticParams() {
  try {
    if (!baseUrl) return [];
    const res = await fetch(`${baseUrl}/api/sub-categories-slugs`, {
      next: { revalidate: 3600 }
    });

    if (!res.ok) return [];

    const { data } = await res.json();

    return data?.map((sub) => ({ subCategory: sub.slug })) || [];
  } catch (err) {
    console.warn('generateStaticParams: failed to fetch sub-categories-slugs', err);
    return [];
  }
}

// Fetch the sub-category without ever letting a transport error escape.
// Returns null when the sub-category does not exist (or cannot be read), which
// the caller turns into a real 404 — see the comment in the page component.
async function fetchSubCategory(subCategory) {
  if (!baseUrl || isBadSlug(subCategory)) return null;

  try {
    const res = await fetch(`${baseUrl}/api/sub-categories/${subCategory}`, {
      next: { revalidate: 60 }
    });

    if (!res.ok) return null;

    const response = await res.json();
    if (!response?.success || !response?.data) return null;

    return response.data;
  } catch (err) {
    console.warn('sub-category page: failed to fetch sub-category', err);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { category, subCategory } = await params;

  const currentCategory = await fetchSubCategory(subCategory);
  if (!currentCategory) return {};

  return {
    title: currentCategory.metaTitle || currentCategory.name,
    description: currentCategory.metaDescription || currentCategory.description,
    // Self-referencing canonical: this listing is also reachable with filter
    // query strings, which Google was treating as separate duplicate pages.
    alternates: { canonical: `${CANONICAL_ORIGIN}/products/${category}/${subCategory}` },
    openGraph: {
      title: currentCategory.name,
      description: currentCategory.metaDescription || currentCategory.description
    }
  };
}

export default async function Listing(props) {
  const params = await props.params;
  const { category, subCategory } = params;

  const subCategoryData = await fetchSubCategory(subCategory);

  // notFound() works by throwing a control-flow error that Next.js catches.
  // It must therefore be called OUTSIDE any try/catch of ours — the previous
  // version called it inside the try block, where our own catch swallowed it.
  // Combined with `notFound` never being imported, that produced a
  // ReferenceError and a 500 instead of a 404 (GSC: "Server error (5xx)").
  if (!subCategoryData) notFound();

  const childCategories = subCategoryData?.childCategories || [];

  let filters = [];
  try {
    const res2 = await fetch(`${baseUrl}/api/products/filters`, { next: { revalidate: 60 } });
    if (res2.ok) {
      const response2 = await res2.json();
      filters = response2?.data || [];
    }
  } catch (err) {
    console.warn('Listing: failed to fetch filters', err);
    filters = [];
  }

  return (
      <Box>
        <Box sx={{ bgcolor: 'background.default' }}>
          <Container maxWidth="xl">
            <Box sx={{ mb: 4 }}>
              <HeaderBreadcrumbs
                heading={subCategoryData?.name}
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
                    name: subCategoryData?.parentCategory?.name,
                    href: `/products/${category}`
                  },
                  {
                    name: subCategoryData?.name
                  }
                ]}
              />
            </Box>

            {Boolean(childCategories.length) && (
              <Categories data={childCategories || []} slug={category + '/' + subCategory} />
            )}

            <ProductList subCategory={subCategoryData} filters={filters} />
          </Container>
        </Box>
      </Box>
  );
}

// Render per-request (SSR): this page's filter/search components read useSearchParams,
// which cannot be statically prerendered. SSR still sends full HTML to crawlers.
export const dynamic = 'force-dynamic';
