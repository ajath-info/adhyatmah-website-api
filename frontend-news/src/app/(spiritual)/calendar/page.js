import React from 'react';
import fs from 'fs';
import path from 'path';

// mui
import { Container } from '@mui/material';

// component
import HinduCalendar from 'src/components/_main/calendar';
import { canonicalMeta } from 'src/utils/seo';

// Read public/images/festivals once on the server so the Festivals tab can
// match festival names to photos without any client-side 404 guessing
// (same approach as the /festivals and /vrat-upvas pages).
function getAvailableFestivalImages() {
    try {
        const dir = path.join(process.cwd(), 'public', 'images', 'festivals');
        return fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
    } catch {
        return [];
    }
}

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
    const availableImages = getAvailableFestivalImages();
    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
            <HinduCalendar availableImages={availableImages} />
        </Container>
    );
}