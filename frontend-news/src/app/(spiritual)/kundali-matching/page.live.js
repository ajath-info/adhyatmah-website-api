// Place at: src/app/(spiritual)/kundali-matching/page.js
// IMPORTANT: delete src/app/(user)/kundali-matching/page.js after adding this
// file — two pages resolving to the same /kundali-matching URL will break
// the Next.js build. Metadata/SEO is unchanged from before.

import React from 'react';

// mui
import { Container } from '@mui/material';

// component
import KundaliMatching from 'src/components/_main/kundali-matching';
import { canonicalMeta } from 'src/utils/seo';

// SEO
export const metadata = {
    ...canonicalMeta('/kundali-matching'),
    title: 'Kundali Matching (Guna Milan) | Adhyatmah',
    description:
        'Free online Kundali Matching for marriage — 36-point Ashtakoot Guna Milan compatibility score, Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot & Nadi koots, Manglik and Nadi Dosha check, on Adhyatmah.'
};

// OPTIONAL
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// PAGE
// No HeaderBreadcrumbs here — same as Panchang under this new layout, the
// component's own hero already carries the page title/eyebrow, so the old
// orange breadcrumb banner isn't needed.
export default function Page() {
    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
            <KundaliMatching />
        </Container>
    );
}