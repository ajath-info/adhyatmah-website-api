import React from 'react';

// mui
import { Container } from '@mui/material';

// component
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import ComingSoon from 'src/components/_main/coming-soon';
import { canonicalMeta } from 'src/utils/seo';

// SEO
export const metadata = {
    ...canonicalMeta('/kundali-matching'),
    title: 'Kundali Matching | Adhyatmah — Coming Soon',
    description:
        'Kundali Matching (Guna Milan) with 36-point Ashtakoot score, Manglik and Nadi Dosha check is coming soon to Adhyatmah.'
};

// OPTIONAL
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// TEMPORARY: Kundali Matching is not live yet, so /kundali-matching shows a
// Coming Soon page inside the normal (user) layout.
// To go live: delete THIS file and rename
//   src/app/(spiritual)/kundali-matching/page.live.js  ->  page.js
export default function Page() {
    return (
        <Container maxWidth="xl">
            <HeaderBreadcrumbs
                heading="Kundali Matching"
                links={[
                    { name: 'Home', href: '/' },
                    { name: 'Kundali Matching' }
                ]}
            />

            <ComingSoon
                eyebrow="Coming Soon"
                title="Kundali Matching Is Coming Soon"
                description="We're building a complete Kundali Matching (Guna Milan) experience — 36-point Ashtakoot score, Manglik and Nadi Dosha check and a detailed compatibility report. It'll be live soon, right here on Adhyatmah."
                topics={['36 Guna Milan', 'Manglik Check', 'Nadi Dosha Check', 'Compatibility Report']}
            />
        </Container>
    );
}