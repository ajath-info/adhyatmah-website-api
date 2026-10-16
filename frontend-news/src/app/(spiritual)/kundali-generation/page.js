import React from 'react';

// mui
import { Container } from '@mui/material';

// component
import KundaliGeneration from 'src/components/_main/kundali';
import { canonicalMeta } from 'src/utils/seo';

// SEO
export const metadata = {
    ...canonicalMeta('/kundali-generation'),
    title: 'Kundali Generation | Adhyatmah',
    description:
        'Generate your free Kundali (birth chart) online — Nakshatra, Rashi, Lagna, Rasi & Navamsa charts, Mangal Dosha and Kaal Sarp Dosha, based on your date, time and place of birth, on Adhyatmah.'
};

// OPTIONAL
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// PAGE
export default function Page() {
    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
            <KundaliGeneration />
        </Container>
    );
}