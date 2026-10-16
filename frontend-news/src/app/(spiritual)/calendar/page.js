// Place at: src/app/(spiritual)/calendar/page.js

import React from 'react';

// mui
import { Container } from '@mui/material';

// component
import HinduCalendar from 'src/components/_main/calendar';
import { canonicalMeta } from 'src/utils/seo';

// SEO
export const metadata = {
    ...canonicalMeta('/calendar'),
    title: 'Hindu Calendar | Adhyatmah',
    description:
        'Monthly Hindu Panchang calendar — Tithi, Nakshatra, Yoga, Karana, Muhurat and festivals for every day, at a glance.'
};

// OPTIONAL
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// PAGE
export default function Page() {
    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
            <HinduCalendar />
        </Container>
    );
}