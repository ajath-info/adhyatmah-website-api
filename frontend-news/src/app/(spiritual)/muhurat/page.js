// Place at: src/app/(spiritual)/muhurat/page.js
// Sits inside the (spiritual) route group, so it automatically gets
// SpiritualNavbar + SpiritualFooter from src/app/(spiritual)/layout.js —
// no extra layout wiring needed. URL resolves to /muhurat.

import React from 'react';

// mui
import { Container } from '@mui/material';

// component
import Muhurat from 'src/components/_main/muhurat';
import { canonicalMeta } from 'src/utils/seo';

// SEO
export const metadata = {
    ...canonicalMeta('/muhurat'),
    title: 'Panchang Muhurat — Auspicious Timings | Adhyatmah',
    description:
        'Find the right Muhurat for every occasion — Vivah, Griha Pravesh, Namkaran, Vehicle Purchase, Business Start and more — based on Vedic astrology and Panchang.'
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
            <Muhurat />
        </Container>
    );
}