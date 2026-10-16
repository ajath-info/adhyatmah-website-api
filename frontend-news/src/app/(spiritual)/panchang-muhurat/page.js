// Place at: src/app/(spiritual)/panchang-muhurat/page.js
// IMPORTANT: delete src/app/(user)/panchang-muhurat/page.js after adding this
// file — two pages resolving to the same /panchang-muhurat URL will break
// the Next.js build. Metadata/SEO is unchanged from before.

import React from 'react';

// mui
import { Container } from '@mui/material';

// component
import PanchangMuhurat from 'src/components/_main/panchang-muhurat';
import { canonicalMeta } from 'src/utils/seo';

// SEO
export const metadata = {
    ...canonicalMeta('/panchang-muhurat'),
    title: 'Panchang & Muhurat | Adhyatmah',
    description:
        "Today's Panchang, Tithi, Nakshatra, Yoga, Karana, sunrise-sunset timings, Rahu Kalam, auspicious Muhurat and festival dates — for your city, on Adhyatmah."
};

// OPTIONAL
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// PAGE
// No HeaderBreadcrumbs here — the new hero inside PanchangMuhurat already
// carries the page title/eyebrow, so the old orange breadcrumb banner isn't
// needed under this new layout.
export default function Page() {
    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
            <PanchangMuhurat />
        </Container>
    );
}