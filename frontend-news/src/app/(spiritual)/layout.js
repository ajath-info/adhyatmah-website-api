// // Place at: src/app/(spiritual)/layout.js
// //
// // Route group for the "spiritual tools" modules (Panchang today; Horoscope,
// // Consultation, Remedies, Kundali etc. as they're built). Route groups in
// // parentheses don't change the URL — /panchang-muhurat still resolves the
// // same — they only let this set of pages use a different layout tree.
// //
// // This layout renders SpiritualNavbar + SpiritualFooter instead of the
// // main site's Navbar/SecondaryHeader/Footor. src/app/(user)/layout.js is
// // NOT touched, so every other page keeps its current header exactly as-is.

// import React from 'react';
// import SpiritualNavbar from 'src/layout/_spiritual/navbar';
// import SpiritualFooter from 'src/layout/_spiritual/footer';

// const baseUrl = process.env.NEXT_PUBLIC_API_URL;

// export default async function SpiritualLayout({ children }) {
//     let branding = null;

//     try {
//         if (baseUrl) {
//             const res = await fetch(`${baseUrl}/api/settings/branding`, { next: { revalidate: 60 } });
//             if (res.ok) {
//                 const json = await res.json();
//                 branding = json?.data || null;
//             }
//         }
//     } catch (err) {
//         console.warn('Spiritual layout branding fetch error', err);
//     }

//     return (
//         <>
//             <SpiritualNavbar branding={branding} />
//             {children}
//             <SpiritualFooter />
//         </>
//     );
// }


// Place at: src/app/(spiritual)/layout.js
//
// Route group for the "spiritual tools" modules (Panchang today; Horoscope,
// Consultation, Remedies, Kundali etc. as they're built). Route groups in
// parentheses don't change the URL — /panchang-muhurat still resolves the
// same — they only let this set of pages use a different layout tree.
//
// This layout renders SpiritualNavbar + SpiritualFooter instead of the
// main site's Navbar/SecondaryHeader/Footor. src/app/(user)/layout.js is
// NOT touched, so every other page keeps its current header exactly as-is.

import React from 'react';
import SpiritualNavbar from 'src/layout/_spiritual/navbar';
import SpiritualFooter from 'src/layout/_spiritual/footer';

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
            <SpiritualNavbar branding={branding} />
            {children}
            <SpiritualFooter branding={branding} />
        </>
    );
}