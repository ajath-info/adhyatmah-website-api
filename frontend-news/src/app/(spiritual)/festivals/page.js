// // Place at: src/app/(spiritual)/festivals/page.js
// // Sits inside the (spiritual) route group, so it automatically gets
// // SpiritualNavbar + SpiritualFooter from src/app/(spiritual)/layout.js —
// // no extra layout wiring needed. URL resolves to /festivals.

// import React from 'react';

// // mui
// import { Container } from '@mui/material';

// // component
// import Festivals from 'src/components/_main/festivals';
// import { canonicalMeta } from 'src/utils/seo';

// // SEO
// export const metadata = {
//     ...canonicalMeta('/festivals'),
//     title: 'Hindu Festivals 2026 & Muhurat | Adhyatmah',
//     description:
//         'Full 2026 Hindu festival calendar — Diwali, Holi, Navratri, Raksha Bandhan, Janmashtami and more, with dates, significance and a link to check the exact Muhurat for your city.'
// };

// export const dynamic = 'force-dynamic';
// export const revalidate = 0;

// export default function Page() {
//     return (
//         <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
//             <Festivals />
//         </Container>
//     );
// }


// Place at: src/app/(spiritual)/festivals/page.js
// Sits inside the (spiritual) route group, so it automatically gets
// SpiritualNavbar + SpiritualFooter from src/app/(spiritual)/layout.js —
// no extra layout wiring needed. URL resolves to /festivals.

import React from 'react';
import fs from 'fs';
import path from 'path';

// mui
import { Container } from '@mui/material';

// component
import Festivals from 'src/components/_main/festivals';
import { canonicalMeta } from 'src/utils/seo';

// Read the festival photos folder ONCE on the server (build/request time),
// instead of letting the client guess filenames by firing dozens of
// speculative /images/festivals/<slug>.<ext> requests per card (that was
// causing 1000+ parallel 404s and a near-unusable page load). The client
// component just matches against this list — no network trial-and-error.
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
    ...canonicalMeta('/festivals'),
    title: 'Hindu Festivals 2026 & Muhurat | Adhyatmah',
    description:
        'Full 2026 Hindu festival calendar — Diwali, Holi, Navratri, Raksha Bandhan, Janmashtami and more, with dates, significance and a link to check the exact Muhurat for your city.'
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
    const availableImages = getAvailableFestivalImages();
    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
            <Festivals availableImages={availableImages} />
        </Container>
    );
}