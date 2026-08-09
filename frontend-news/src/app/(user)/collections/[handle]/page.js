import React from 'react';

// next
import { notFound } from 'next/navigation';

// mui
import { Box, Container, Stack, Typography, Grid, Card, CardMedia, CardContent, CardActionArea } from '@mui/material';
import Image from 'next/image';

// components
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import ProductList from '@/components/_main/products';
import { CANONICAL_ORIGIN, isBadSlug } from 'src/utils/seo';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

// Look the collection up without letting a fetch error escape. Returns null for
// "no such collection" so the caller can render a real 404.
async function fetchCollection(handle) {
  if (!baseUrl || isBadSlug(handle)) return null;

  try {
    const res = await fetch(`${baseUrl}/api/getHomepageCollections?limit=100`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;

    const collections = await res.json();
    return collections?.payload?.collections?.find((c) => c.handle === handle) || null;
  } catch (error) {
    console.warn('collection page: failed to fetch collections', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { handle } = await params;

  const collection = await fetchCollection(handle);
  if (!collection) return {};

  return {
    title: `${collection.title} - Adhyatmah`,
    description: collection.description || `Browse our ${collection.title} collection`,
    alternates: { canonical: `${CANONICAL_ORIGIN}/collections/${handle}` },
    openGraph: {
      title: `${collection.title} - Adhyatmah`,
      description: collection.description || `Browse our ${collection.title} collection`,
      images: collection.image?.url ? [{ url: collection.image.url }] : []
    }
  };
}

export default async function CollectionPage({ params }) {
  const { handle } = await params;

  const collection = await fetchCollection(handle);

  // Previously this route answered 200 with a "Collection not found" body for
  // any unknown handle, which Google classifies as a Soft 404. Returning a real
  // 404 status is what removes those pages from the report.
  if (!collection) notFound();

  return (
      <Box>
        <Container maxWidth="xl">
          <Stack gap={3}>
            <HeaderBreadcrumbs
              heading={collection.title}
              links={[
                { name: 'Home', href: '/' },
                { name: 'Collections', href: '/collections' },
                { name: collection.title }
              ]}
            />

            {/* Collection Header */}
            <Box sx={{ textAlign: 'center', py: 4 }}>
              {collection.image?.url && (
                <Box
                  sx={{
                    mb: 3,
                    position: 'relative',
                    width: '100%',
                    maxWidth: 500,
                    height: 300,
                    mx: 'auto',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}
                >
                  <Image
                    src={collection.image.url}
                    alt={collection.image.altText || collection.title}
                    fill
                    sizes="(max-width: 600px) 100vw, 500px"
                    style={{ objectFit: 'cover' }}
                  />
                </Box>
              )}
              <Typography variant="h2" color="text.primary" sx={{ mb: 2 }}>
                {collection.title}
              </Typography>
              {collection.description && (
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
                  {collection.description}
                </Typography>
              )}
            </Box>

            {/* Products */}
            {collection.products && collection.products.length > 0 ? (
              <ProductList
                title={`${collection.title} Products`}
                description={`Browse all products in our ${collection.title} collection`}
                data={collection.products}
              />
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h4" color="text.secondary">
                  No products available in this collection yet
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Check back soon for new additions to this collection
                </Typography>
              </Box>
            )}
          </Stack>
        </Container>
      </Box>
  );
}