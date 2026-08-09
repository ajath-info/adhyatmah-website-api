import React from 'react';

// mui
import { Container, Stack } from '@mui/material';

// components
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import CompareMain from 'src/components/_main/compare';
import { NOINDEX } from 'src/utils/seo';

// SEO: utility route with no search value — keep it out of the index while
// still letting Google follow its links.
export const metadata = {
  ...NOINDEX
};


export default function Page() {
  return (
    <Container maxWidth="xl">
      <Stack gap={3}>
        <HeaderBreadcrumbs
          heading="Compare"
          links={[
            {
              name: 'Home',
              href: '/'
            },
            {
              name: 'Compare'
            }
          ]}
        />
        <CompareMain />
      </Stack>
    </Container>
  );
}
