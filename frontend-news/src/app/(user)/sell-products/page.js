import React from 'react';
// mui
import { Container, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import SellerShopMain from '@/components/_main/seller-shop';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import { canonicalMeta } from 'src/utils/seo';

// SEO: self-referencing canonical so this URL is never treated as a
// duplicate of another page.
export const metadata = {
    ...canonicalMeta('/sell-products')
};

export default function Page() {
    return (
        <Container maxWidth="xl">
            <Stack gap={3}>
                <HeaderBreadcrumbs heading="Sell your products" links={[{ name: 'Home', href: '/' }, { name: 'Sell products' }]} />
                <Typography variant="body2" color="text.secondary">
                    Want to offer Pandit services instead?{' '}
                    <Link href="/create-shop" style={{ color: 'inherit', fontWeight: 600, textDecoration: 'underline' }}>
                        Create a Pandit profile instead
                    </Link>
                </Typography>
                <SellerShopMain />
            </Stack>
        </Container>
    );
}