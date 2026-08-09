import React from 'react';
// mui
import { Container, Stack } from '@mui/material';
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
        <ShopMain />
      </Stack>
    </Container>
  );
}
