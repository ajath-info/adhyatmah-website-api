import React from 'react';
import SpiritualNavbar from 'src/layout/_spiritual/navbar';
import SpiritualFooter from 'src/layout/_spiritual/footer';
import PanchangThemeVars from 'src/theme/panchang-vars';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export default async function SpiritualLayout({ children }) {
    let branding = null;

    try {
        if (baseUrl) {
            const res = await fetch(`${baseUrl}/api/settings/branding`, { next: { revalidate: 60 } });
            if (res.ok) {
                const json = await res.json();
                branding = json?.data || null;
            }
        }
    } catch (err) {
        console.warn('Spiritual layout branding fetch error', err);
    }

    return (
        <>
            {/* light/dark colour variables used by every spiritual page */}
            <PanchangThemeVars />
            <SpiritualNavbar branding={branding} />
            {children}
            <SpiritualFooter branding={branding} />
        </>
    );
}