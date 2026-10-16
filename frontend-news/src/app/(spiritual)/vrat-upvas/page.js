// // Place at: src/app/(spiritual)/vrat-upvas/page.js
// // Sits inside the (spiritual) route group, so it automatically gets
// // SpiritualNavbar + SpiritualFooter from src/app/(spiritual)/layout.js —
// // no extra layout wiring needed. URL resolves to /vrat-upvas.

// import React from 'react';

// // mui
// import { Container } from '@mui/material';

// // component
// import VratUpvas from 'src/components/_main/vrat-upvas';
// import { canonicalMeta } from 'src/utils/seo';

// // SEO
// export const metadata = {
//     ...canonicalMeta('/vrat-upvas'),
//     title: 'Vrat & Upvas 2026 — Dates, Rituals & Benefits | Adhyatmah',
//     description:
//         'Explore all Hindu Vrat and Upvas — Ekadashi, Pradosh, Sankashti Chaturthi, Somvar Vrat and more — with dates, significance, rituals and benefits.'
// };

// export const dynamic = 'force-dynamic';
// export const revalidate = 0;

// export default function Page() {
//     return (
//         <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
//             <VratUpvas />
//         </Container>
//     );
// }


// Place at: src/app/(spiritual)/vrat-upvas/page.js
// Sits inside the (spiritual) route group, so it automatically gets
// SpiritualNavbar + SpiritualFooter from src/app/(spiritual)/layout.js —
// no extra layout wiring needed. URL resolves to /vrat-upvas.

import React from 'react';
import fs from 'fs';
import path from 'path';

// mui
import { Container } from '@mui/material';

// component
import VratUpvas from 'src/components/_main/vrat-upvas';
import { canonicalMeta } from 'src/utils/seo';

// Read public/images/festivals once on the server so the client can match
// vrat names (e.g. "Aja Ekadashi") to photos without any 404 guessing.
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
    ...canonicalMeta('/vrat-upvas'),
    title: 'Vrat & Upvas 2026 — Dates, Rituals & Benefits | Adhyatmah',
    description:
        'Explore all Hindu Vrat and Upvas — Ekadashi, Pradosh, Sankashti Chaturthi, Somvar Vrat and more — with dates, significance, rituals and benefits.'
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
    const availableImages = getAvailableFestivalImages();
    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
            <VratUpvas availableImages={availableImages} />
        </Container>
    );
}