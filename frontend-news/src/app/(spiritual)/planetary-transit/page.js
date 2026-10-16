// Place at: src/app/(spiritual)/planetary-transit/page.js
// Sits inside the (spiritual) route group, so it gets SpiritualNavbar +
// SpiritualFooter automatically from src/app/(spiritual)/layout.js.
// URL resolves to /planetary-transit.

import React from 'react';
import PlanetaryTransit from 'src/components/_main/planetary-transit';
import { canonicalMeta } from 'src/utils/seo';

export const metadata = {
    ...canonicalMeta('/planetary-transit'),
    title: 'Planetary Transit — Cosmic Movements & Real Life Impact | Adhyatmah',
    description:
        'Track real-time planetary positions, upcoming transits, retrogrades and their impact on career, finance, relationships, health and spirituality.'
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
    return <PlanetaryTransit />;
}