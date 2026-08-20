'use client';
import React from 'react';
import Link from 'next/link';

// mui
import { Typography, Container, Stack, Button } from '@mui/material';

// components
import CategoryCard from 'src/components/cards/category';
import ProductsCarousel from '@/components/carousels/products-grid-slider';

const ORANGE = '#E87722';

/* ---------------- DECORATIVE ARROW LINE (matches other home sections) ---------------- */
function ArrowLine({ direction = 'left' }) {
  return (
    <Stack
      component="svg"
      viewBox="0 0 46 14"
      sx={{
        width: { xs: 26, sm: 36, md: 42 },
        height: 14,
        display: { xs: 'none', sm: 'block' },
        transform: direction === 'right' ? 'scaleX(-1)' : 'none'
      }}
    >
      <line x1="0" y1="7" x2="34" y2="7" stroke={ORANGE} strokeWidth="2" />
      <path d="M28 1.5 L37 7 L28 12.5" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Stack>
  );
}

export default function CategoriesWithProducts({ data, isHome }) {
  // Transform API data to match ProductCard expected format
  const transformProductData = (products) => {
    return products.map((product) => ({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      images: product.images || [],
      price: product.price || 0,
      salePrice: product.salePrice || 0,
      stockQuantity: product.stockQuantity || 0,
      averageRating: product.averageRating || 0,
      discount: product.discount || 0,
      type: product.type || 'simple',
      likes: product.likes || 0
    }));
  };

  // Get limited products (max 5) and check if there are more
  const getLimitedProducts = (products) => {
    if (!products || products.length === 0) return { limited: [], hasMore: false };

    const limited = products.slice(0, 5);
    const hasMore = products.length > 5;

    return { limited, hasMore };
  };

  return (
    <Container maxWidth="xl" disableGutters>
      <Stack gap={4}>
        {data.map((category) => {
          const { limited: limitedProducts, hasMore } = getLimitedProducts(category.products);

          // ✅ Agar products nahi hain to kuch mat dikhao
          if (!limitedProducts.length) return null;

          return (
            <Stack key={category._id} gap={3}>
              {/* Category Header with View All Button — same centered arrow-line style used
                  by the other homepage sections (Pandit Ji List, Spiritual E-Commerce, How It
                  Works), instead of the plain uppercase h4 this used before. */}
              <Stack alignItems="center" spacing={1}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={{ xs: 1, sm: 1.5 }}>
                  <ArrowLine direction="left" />
                  <Typography
                    sx={{
                      fontSize: { xs: 20, sm: 24, md: 26 },
                      fontWeight: 700,
                      color: 'text.primary'
                    }}
                  >
                    {category.name}
                  </Typography>
                  <ArrowLine direction="right" />
                </Stack>

                {/* {hasMore && (
                  <Button
                    component={Link}
                    href={`/products?category=${category.slug}`}
                    variant="outlined"
                    color="primary"
                    size="small"
                  >
                    View All
                  </Button>
                )} */}
              </Stack>

              {/* Category Products */}
              <ProductsCarousel
                data={transformProductData(limitedProducts)}
                isLoading={false}
                query={`?category=${category.slug}`}
                desktopSlides={5}
              />
            </Stack>
          );
        })}

        {isHome && !Boolean(data.length) && (
          <Typography variant="h3" color="error.main" textAlign="center">
            Categories with products not found
          </Typography>
        )}
      </Stack>
    </Container>
  );
}