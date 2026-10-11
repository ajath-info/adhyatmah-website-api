import React from 'react';
// mui
import { Container, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import ShopMain from '@/components/_main/shop';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import { canonicalMeta } from 'src/utils/seo';

// SEO: self-referencing canonical so this URL is never treated as a
// duplicate of another page.
export const metadata = {
  ...canonicalMeta('/create-shop')
};


export default function Page() {
  return (
    <Container maxWidth="xl">
      <Stack gap={3}>
        <HeaderBreadcrumbs heading="Create a pandit profile" links={[{ name: 'Home', href: '/' }, { name: 'Create pandit profile' }]} />
        <Typography variant="body2" color="text.secondary">
          Only want to sell products, not offer Pandit services?{' '}
          <Link href="/sell-products" style={{ color: 'inherit', fontWeight: 600, textDecoration: 'underline' }}>
            Create a product-selling shop instead
          </Link>
        </Typography>
        <ShopMain />
      </Stack>
    </Container>
  );
}