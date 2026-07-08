'use client';
import React from 'react';
import PropTypes from 'prop-types';
import { useSearchParams, usePathname } from 'next/navigation';
import { useRouter } from '@bprogress/next';
import { useCallback } from 'react';

// mui
import { useMediaQuery, Stack, Typography, Skeleton } from '@mui/material';
import Pagination from '@mui/material/Pagination';

// api
import * as api from 'src/services';
import { useQuery } from '@tanstack/react-query';

// components
import ProductList from './product-list';

const KIT_CATEGORY_SLUGS = ['puja-kit-', 'instant-puja-kit'];
const KIT_LISTING_LIMIT = 500;

const getSearchParams = (searchParams, category, subCategory, childCategory, brand, shop) => {
  const params = new URLSearchParams(searchParams.toString());
  if (category?._id) params.set('category', category.slug);
  if (subCategory?._id) params.set('subcategory', subCategory.slug);
  if (childCategory?._id) params.set('childcategory', childCategory.slug);
  if (brand?._id) params.set('brand', brand.slug);
  if (shop?._id) params.set('shop', shop.slug);

  const categorySlug = params.get('category') || category?.slug || '';
  if (KIT_CATEGORY_SLUGS.includes(categorySlug) && !params.get('limit')) {
    params.set('limit', String(KIT_LISTING_LIMIT));
  }

  const queryString = params.toString();
  return queryString.length ? '?' + queryString : '';
};

export default function ProductListing({ category, subCategory, childCategory, shop, brand }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = searchParams.get('page');
  const [currentPage, setCurrentPage] = React.useState(Number(page) || 1);

  const searchQuery = getSearchParams(searchParams, category, subCategory, childCategory, brand, shop);

  const { data, isPending: isLoading } = useQuery({
    queryKey: ['products', searchQuery],
    queryFn: () => api.getProducts(searchQuery)
  });

  const isMobile = useMediaQuery('(max-width:900px)');

  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    router.replace(`${pathname}?${createQueryString('page', value)}`, undefined, { scroll: true });
  };

  React.useEffect(() => {
    if (page) setCurrentPage(Number(page));
    else setCurrentPage(1);
  }, [page]);

  const categorySlug = searchParams.get('category') || category?.slug || '';
  const isKitCategory = KIT_CATEGORY_SLUGS.includes(categorySlug);
  const total = data?.total || 0;
  const limit = Number(
    searchParams.get('limit') || (isKitCategory ? KIT_LISTING_LIMIT : 12)
  );
  const totalPages = Math.ceil(total / limit) || 1;
  const start = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, total);

  return (
    <>
      {/* Item count bar */}
      <Stack
        pt={2}
        pb={1}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="body1" color="text.secondary" fontSize={{ xs: '12px', sm: '1rem' }}>
          {isLoading ? (
            <Skeleton variant="text" width={150} />
          ) : total > 0 ? (
            `Showing ${start}-${end} of ${total} items`
          ) : (
            'No items found'
          )}
        </Typography>
      </Stack>

      {/* Product Grid */}
      <ProductList data={data} isLoading={isLoading} isMobile={isMobile} />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          variant="outlined"
          shape="rounded"
          color="primary"
          sx={{
            mt: 3,
            mb: 2,
            mx: 'auto',
            '.MuiPagination-ul': { justifyContent: 'center' }
          }}
        />
      )}
    </>
  );
}

ProductListing.propTypes = {
  category: PropTypes.object,
  subCategory: PropTypes.object,
  childCategory: PropTypes.object,
  shop: PropTypes.object,
  brand: PropTypes.object
};

