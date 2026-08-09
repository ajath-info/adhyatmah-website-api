import React from 'react';

// mui
import { Container } from '@mui/material';

// component
import AccountDeletionMain from '@/components/_main/account-deletion';
import { NOINDEX } from 'src/utils/seo';

// SEO: utility route with no search value — keep it out of the index while
// still letting Google follow its links.
export const metadata = {
  ...NOINDEX
};


export default function Page() {
  return (
    <Container maxWidth="xl">
      <AccountDeletionMain />
    </Container>
  );
}
