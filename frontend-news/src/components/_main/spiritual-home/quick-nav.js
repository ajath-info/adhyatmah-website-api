// 'use client';
// import React from 'react';
// import Link from 'next/link';
// import { Box, Container, Typography } from '@mui/material';
// import {
//     TbCalendarEvent,
//     TbFlower,
//     TbFlame,
//     TbClockHour4,
//     TbCalendar,
//     TbPlanet,
//     TbHeartHandshake,
//     TbStars,
//     TbUserCheck,
//     TbShoppingBag,
//     TbBook
// } from 'react-icons/tb';
// import { HOME_THEME } from './theme';

// // Only pages that exist today. Nakshatra and Temple Events from the
// // reference UI have no page yet, so they are left out instead of
// // linking to a 404. Add them here when those pages are built.
// const QUICK_LINKS = [
//     { label: 'Daily Panchang', href: '/panchang-muhurat', icon: TbCalendarEvent },
//     { label: 'Festivals', href: '/festivals', icon: TbFlower },
//     { label: 'Vrat & Upvas', href: '/vrat-upvas', icon: TbFlame },
//     { label: 'Muhurat', href: '/muhurat', icon: TbClockHour4 },
//     { label: 'Hindu Calendar', href: '/calendar', icon: TbCalendar },
//     { label: 'Planetary Transit', href: '/planetary-transit', icon: TbPlanet },
//     { label: 'Kundali Matching', href: '/kundali-matching', icon: TbHeartHandshake },
//     { label: 'Kundali Generation', href: '/kundali-generation', icon: TbStars },
//     { label: 'Book Pandit', href: '/book-pandit-online', icon: TbUserCheck },
//     { label: 'Puja Store', href: '/products', icon: TbShoppingBag },
//     { label: 'Learn', href: '/blogs', icon: TbBook }
// ];

// export default function QuickNav() {
//     return (
//         <Container maxWidth="xl" sx={{ mt: { xs: 2.5, md: 3.5 } }}>
//             <Box
//                 component="nav"
//                 aria-label="Explore Adhyatmah"
//                 sx={{
//                     display: 'grid',
//                     gap: 1.25,
//                     gridTemplateColumns: {
//                         xs: 'repeat(3, minmax(0, 1fr))',
//                         sm: 'repeat(4, minmax(0, 1fr))',
//                         md: 'repeat(6, minmax(0, 1fr))',
//                         lg: 'repeat(11, minmax(0, 1fr))'
//                     }
//                 }}
//             >
//                 {QUICK_LINKS.map(({ label, href, icon: Icon }, i) => {
//                     const first = i === 0;
//                     return (
//                         <Box
//                             key={label}
//                             component={Link}
//                             href={href}
//                             sx={{
//                                 display: 'flex',
//                                 flexDirection: 'column',
//                                 alignItems: 'center',
//                                 justifyContent: 'center',
//                                 gap: 0.75,
//                                 minHeight: 84,
//                                 px: 0.75,
//                                 py: 1.25,
//                                 borderRadius: '14px',
//                                 textDecoration: 'none',
//                                 textAlign: 'center',
//                                 color: first ? '#FFFFFF' : HOME_THEME.navy,
//                                 bgcolor: first ? HOME_THEME.accent : '#FFFFFF',
//                                 border: `1px solid ${first ? HOME_THEME.accent : HOME_THEME.panelBorder}`,
//                                 boxShadow: HOME_THEME.shadow,
//                                 transition: 'border-color .15s, background-color .15s',
//                                 '&:hover': {
//                                     borderColor: HOME_THEME.accent,
//                                     bgcolor: first ? HOME_THEME.accentDark : HOME_THEME.softBg
//                                 },
//                                 '&:focus-visible': { outline: `2px solid ${HOME_THEME.accent}`, outlineOffset: 2 }
//                             }}
//                         >
//                             <Icon size={24} color={first ? '#FFFFFF' : HOME_THEME.accent} />
//                             <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.25 }}>{label}</Typography>
//                         </Box>
//                     );
//                 })}
//             </Box>
//         </Container>
//     );
// }




'use client';
import React from 'react';
import Link from 'next/link';
import { Box, Container, Typography } from '@mui/material';
import {
    TbCalendarEvent,
    TbFlower,
    TbFlame,
    TbClockHour4,
    TbCalendar,
    TbPlanet,
    TbHeartHandshake
} from 'react-icons/tb';
import { HOME_THEME } from './theme';

// Only pages that exist today. Nakshatra and Temple Events from the
// reference UI have no page yet, so they are left out instead of
// linking to a 404. Add them here when those pages are built.
const QUICK_LINKS = [
    { label: 'Daily Panchang', href: '/panchang-muhurat', icon: TbCalendarEvent },
    { label: 'Festivals', href: '/festivals', icon: TbFlower },
    { label: 'Vrat & Upvas', href: '/vrat-upvas', icon: TbFlame },
    { label: 'Muhurat', href: '/muhurat', icon: TbClockHour4 },
    { label: 'Hindu Calendar', href: '/calendar', icon: TbCalendar },
    { label: 'Planetary Transit', href: '/planetary-transit', icon: TbPlanet },
    { label: 'Kundali Matching', href: '/kundali-matching', icon: TbHeartHandshake }
];

export default function QuickNav() {
    return (
        <Container maxWidth="xl" sx={{ mt: { xs: 2.5, md: 4 } }}>
            <Box
                component="nav"
                aria-label="Explore Adhyatmah"
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: { xs: 1.25, md: 2 }
                }}
            >
                {QUICK_LINKS.map(({ label, href, icon: Icon }, i) => {
                    const first = i === 0;
                    return (
                        <Box
                            key={label}
                            component={Link}
                            href={href}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                flex: {
                                    xs: '0 0 calc(33.333% - 10px)',
                                    sm: '0 0 calc(25% - 12px)',
                                    md: '0 0 148px'
                                },
                                minHeight: { xs: 92, md: 104 },
                                px: 1,
                                py: 1.75,
                                borderRadius: '18px',
                                textDecoration: 'none',
                                textAlign: 'center',
                                color: first ? '#FFFFFF' : HOME_THEME.navy,
                                background: first
                                    ? `linear-gradient(145deg, ${HOME_THEME.accent} 0%, ${HOME_THEME.accentDark} 100%)`
                                    : '#FFFFFF',
                                border: `1px solid ${first ? HOME_THEME.accent : HOME_THEME.panelBorder}`,
                                boxShadow: first ? '0 12px 28px rgba(76, 95, 214, 0.32)' : HOME_THEME.shadow,
                                transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                    borderColor: HOME_THEME.accent,
                                    boxShadow: HOME_THEME.shadowLg
                                },
                                '&:focus-visible': { outline: `2px solid ${HOME_THEME.accent}`, outlineOffset: 3 },
                                '@media (prefers-reduced-motion: reduce)': { transition: 'none', '&:hover': { transform: 'none' } }
                            }}
                        >
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,
                                    display: 'grid',
                                    placeItems: 'center',
                                    borderRadius: '50%',
                                    bgcolor: first ? 'rgba(255,255,255,0.18)' : HOME_THEME.softBg
                                }}
                            >
                                <Icon size={24} color={first ? '#FFFFFF' : HOME_THEME.accent} />
                            </Box>
                            <Typography sx={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.25 }}>{label}</Typography>
                        </Box>
                    );
                })}
            </Box>
        </Container>
    );
}