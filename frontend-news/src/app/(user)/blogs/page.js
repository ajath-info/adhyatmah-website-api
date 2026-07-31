import React from 'react';

// mui
import { Container } from '@mui/material';

// component
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import BlogsListing from 'src/components/_main/blogs';

// SEO
export const metadata = {
    title: 'Blogs | Adhyatmah — Vedic Rituals, Puja Guidance & Spiritual Living',
    description:
        'Read articles on Vedic rituals, puja guidance, astrology insights and spiritual living, curated by Adhyatmah.'
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
    return (
        <>
            <Container maxWidth="xl">
                <HeaderBreadcrumbs
                    heading="Blogs"
                    links={[
                        { name: 'Home', href: '/' },
                        { name: 'Blogs' }
                    ]}
                />
            </Container>

            <BlogsListing />
        </>
    );
}