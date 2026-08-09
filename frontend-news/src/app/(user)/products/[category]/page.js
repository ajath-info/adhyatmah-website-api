// mui
import { Box, Container } from '@mui/material';
import { notFound } from 'next/navigation';

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
    const res = await fetch(`${baseUrl}/api/categories-slugs`, {
      next: { revalidate: 3600 } // Cache slug list for 1 hour
    });

    if (!res.ok) return [];

    const { data } = await res.json();

    return data?.map((a) => ({ category: a.slug })) || [];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('generateStaticParams: failed to fetch categories-slugs', err);
    return [];
  }
}

// Returns null instead of throwing when the category is missing/unreadable, so
// the caller can call notFound() outside any try/catch (notFound() signals by
// throwing — a surrounding catch would swallow it).
async function fetchCategory(category) {
  if (!baseUrl || isBadSlug(category)) return null;

  try {
    const res = await fetch(`${baseUrl}/api/categories/${category}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;

    const response = await res.json();
    if (!response?.success || !response?.data) return null;

    return response.data;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('category page: failed to fetch category', err);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { category } = await params;

  const currentCategory = await fetchCategory(category);
  if (!currentCategory) return {};

  return {
    title: currentCategory.metaTitle || currentCategory.name,
    description: currentCategory.metaDescription || currentCategory.description,
    // Self-referencing canonical so the ?brand=/?price= filtered variants of
    // this listing all fold into one indexable URL.
    alternates: { canonical: `${CANONICAL_ORIGIN}/products/${category}` },
    openGraph: {
      title: currentCategory.name,
      description: currentCategory.metaDescription || currentCategory.description
    }
  };
}

export default async function Listing(props) {
  const params = await props.params;
  const { category } = params;

  const categoryData = await fetchCategory(category);
  if (!categoryData) notFound();

  const subCategories = categoryData?.subCategories || [];

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
              heading={categoryData?.name}
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
                  name: categoryData?.name
                }
              ]}
            />
            {/* {Boolean(subCategories.length) && <Categories data={subCategories || []} slug={category} />} */}

            {Boolean(subCategories.length) && (
              <Box sx={{ mt: 4 }}>
                <Categories data={subCategories || []} slug={category} />
              </Box>
            )}

            <ProductList category={categoryData} filters={filters} />
          </Container>
        </Box>
      </Box>
  );
}

// Render per-request (SSR): this page's filter/search components read useSearchParams,
// which cannot be statically prerendered. SSR still sends full HTML to crawlers.
export const dynamic = 'force-dynamic';
