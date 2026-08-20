import React from 'react';

// mui
import { Container } from '@mui/material';

// component
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import CareersListing from 'src/components/_main/careers';
import { canonicalMeta } from 'src/utils/seo';

// SEO
export const metadata = {
    ...canonicalMeta('/careers'),
    title: 'Careers | Adhyatmah — Build Your Career With Us',
    description:
        'Explore open positions at Adhyatmah and build a meaningful career with a team dedicated to bringing spirituality, trust and authenticity to millions of homes.'
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
    return (
        <>
            <Container maxWidth="xl">
                <HeaderBreadcrumbs
                    heading="Careers"
                    links={[
                        { name: 'Home', href: '/' },
                        { name: 'Careers' }
                    ]}
                />
            </Container>

            <CareersListing />
        </>
    );
}