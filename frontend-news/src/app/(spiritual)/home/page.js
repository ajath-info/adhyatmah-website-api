// Place at: src/app/(spiritual)/home/page.js
// Sits inside the (spiritual) route group, so it automatically gets
// SpiritualNavbar + SpiritualFooter from src/app/(spiritual)/layout.js.
// URL resolves to /home. The main site's "/" (src/app/(user)/page.js) is
// NOT touched.

import React from 'react';
import fs from 'fs';
import path from 'path';

// component
import SpiritualHome from 'src/components/_main/spiritual-home';
import { canonicalMeta } from 'src/utils/seo';

// SEO
export const metadata = {
    ...canonicalMeta('/home'),
    title: 'Panchang, Festivals, Vrat & Muhurat | Adhyatmah',
    description:
        "Today's Panchang, Hindu festivals, Vrat & Upvas, auspicious Muhurat, Hindu calendar and planetary transit — all in one place on Adhyatmah."
};

// Read public/images/festivals once on the server so the festival cards can
// match names to photos without client-side 404 guessing (same approach as
// the Festivals and Vrat pages).
function getAvailableFestivalImages() {
    try {
        const dir = path.join(process.cwd(), 'public', 'images', 'festivals');
        return fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
    } catch {
        return [];
    }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
    return <SpiritualHome availableImages={getAvailableFestivalImages()} />;
}