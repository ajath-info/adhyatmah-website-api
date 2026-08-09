import React from 'react';

// mui
import { Container } from '@mui/material';

// component
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import ComingSoon from 'src/components/_main/coming-soon';
import { canonicalMeta } from 'src/utils/seo';

// SEO
export const metadata = {
  ...canonicalMeta('/online-puja-services'),
    title: 'Online Puja | Adhyatmah — Coming Soon',
    description:
        'Book a live-streamed Online Puja performed by verified Pandit Ji from anywhere, with your family joining virtually. Coming soon to Adhyatmah.'
};

// OPTIONAL
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// PAGE
export default function Page() {
    return (
        <Container maxWidth="xl">
            <HeaderBreadcrumbs
                heading="Online Puja"
                links={[
                    { name: 'Home', href: '/' },
                    { name: 'Online Puja' }
                ]}
            />

            <ComingSoon
                eyebrow="Coming Soon"
                title="Online Puja Is Coming Soon"
                description="Soon you'll be able to book a live-streamed Puja performed by a verified Pandit Ji on your behalf, with your whole family joining in from anywhere. It'll be live soon, right here on Adhyatmah."
                topics={['Live Puja Streaming', 'Verified Pandit Ji', 'Family Video Join']}
            />
        </Container>
    );
}