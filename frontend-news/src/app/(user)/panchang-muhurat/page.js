import React from 'react';

// mui
import { Container } from '@mui/material';

// component
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import ComingSoon from 'src/components/_main/coming-soon';
import { canonicalMeta } from 'src/utils/seo';

// SEO
export const metadata = {
  ...canonicalMeta('/panchang-muhurat'),
    title: 'Panchang & Muhurat | Adhyatmah — Coming Soon',
    description:
        'Daily Panchang, auspicious Muhurat timings, festival dates and Vedic calendar tools are coming soon to Adhyatmah. Stay tuned.'
};

// OPTIONAL
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// PAGE
export default function Page() {
    return (
        <Container maxWidth="xl">
            <HeaderBreadcrumbs
                heading="Panchang & Muhurat"
                links={[
                    { name: 'Home', href: '/' },
                    { name: 'Panchang & Muhurat' }
                ]}
            />

            <ComingSoon
                eyebrow="Coming Soon"
                title="Panchang & Muhurat Is Coming Soon"
                description="We're building daily Panchang, auspicious Muhurat timings, festival dates and a complete Vedic calendar — so you can plan every ritual at the right time. It'll be live soon, right here on Adhyatmah."
                topics={['Daily Panchang', 'Shubh Muhurat', 'Festival Calendar', 'Rahu Kaal Timings']}
            />
        </Container>
    );
}