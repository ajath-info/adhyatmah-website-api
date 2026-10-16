// 'use client';
// import React, { useState, useEffect, useCallback } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';

// // mui
// import {
//     Box,
//     Container,
//     Stack,
//     Typography,
//     Chip,
//     Card,
//     Tabs,
//     Tab,
//     Skeleton,
//     Collapse,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     ToggleButton,
//     ToggleButtonGroup
// } from '@mui/material';

// // icons
// import {
//     TbCalendarEvent,
//     TbBuildingChurch,
//     TbClockHour4,
//     TbPlanet,
//     TbChartPie,
//     TbReportAnalytics,
//     TbHeartHandshake,
//     TbWand,
//     TbBook2,
//     TbChevronDown,
//     TbChevronRight,
//     TbArrowRight,
//     TbBulb,
//     TbInfoCircle,
//     TbBriefcase,
//     TbCurrencyRupee,
//     TbHeart,
//     TbHeartbeat,
//     TbSchool
// } from 'react-icons/tb';
// import { FaOm } from 'react-icons/fa';

// // Live data — see PlanetaryTransit() at the bottom of this file for the
// // fetch/loading wiring. CURRENT_POSITIONS/TRANSIT_INSIGHTS/UPCOMING_TRANSITS
// // no longer exist as hardcoded consts; every component below now takes its
// // data as props.
// import { getPlanetaryTransit, getUpcomingTransits } from '@/services/panchang-service';

// // Module-scoped tokens — only used on this Planetary Transit page.
// const THEME = {
//     navy: '#0B1330',
//     navyDeep: '#070C1F',
//     ink: '#1B2A4A',
//     gold: '#FB8B05',
//     border: '#E5E9F8',
//     mutedInk: '#6B7291'
// };

// // Left sidebar — same tool list style as the Panchang & Muhurat page.
// // "Planetary Transit" is marked active since we're on this page.
// const SIDEBAR_ITEMS = [
//     { icon: TbCalendarEvent, label: 'Daily Panchang', href: '/panchang-muhurat' },
//     { icon: TbBuildingChurch, label: 'Festival & Vrat', href: '/festivals' },
//     { icon: TbClockHour4, label: 'Muhurat', href: '/muhurat' },
//     { icon: TbPlanet, label: 'Planetary Transit', href: '/planetary-transit', active: true },
//     { icon: TbChartPie, label: 'Rashi Phal', href: '#' },
//     { icon: TbReportAnalytics, label: 'Kundali', href: '/kundali-generation' },
//     { icon: TbHeartHandshake, label: 'Compatibility', href: '/kundali-matching' },
//     { icon: TbWand, label: 'Remedies', href: '#' },
//     { icon: TbBook2, label: 'Learn Astrology', href: '#' }
// ];

// // Tab bar — only "Current Transit" is wired up with real content for now;
// // the rest are static placeholders (design only) until later steps.
// const TABS = ['Current Transit', 'Upcoming Transits', 'Retrograde', 'Planetary Calendar', 'Effects by Rashi', 'Conjunctions', 'Historical Transits'];

// // Live "Current Planetary Positions" now comes from GET
// // /panchang/planetary-transit (panchang-service.js -> getPlanetaryTransit).
// // Row shape from the API: { planet, rashi, rashiEn, degree, nakshatra,
// // pada, isRetrograde } — rashi is Prokerala's own display string, rashiEn
// // is the astronomically-normalized English sign name used for grouping
// // (Rashi Wheel) and matching against TRANSIT_INSIGHT_RULES.

// // --- Step 2 data ---------------------------------------------------------

// // 12 signs in natural zodiac order, starting at the top of the wheel and
// // going clockwise (Aries at 12 o'clock) — matches the reference chart.
// const RASHI_ORDER = [
//     { en: 'Aries', sa: 'Mesha' },
//     { en: 'Taurus', sa: 'Vrishabha' },
//     { en: 'Gemini', sa: 'Mithuna' },
//     { en: 'Cancer', sa: 'Karka' },
//     { en: 'Leo', sa: 'Simha' },
//     { en: 'Virgo', sa: 'Kanya' },
//     { en: 'Libra', sa: 'Tula' },
//     { en: 'Scorpio', sa: 'Vrishchika' },
//     { en: 'Sagittarius', sa: 'Dhanu' },
//     { en: 'Capricorn', sa: 'Makara' },
//     { en: 'Aquarius', sa: 'Kumbha' },
//     { en: 'Pisces', sa: 'Meena' }
// ];

// // Same 9 grahas used in the hero banner + positions table — abbreviation,
// // wheel-marker color and relative dot size (used on the Solar System tab).
// const PLANET_META = {
//     Sun: { abbr: 'Su', color: '#FB8B05', size: 22 },
//     Moon: { abbr: 'Mo', color: '#C7CBD8', size: 16 },
//     Mars: { abbr: 'Ma', color: '#C0392B', size: 14 },
//     Mercury: { abbr: 'Me', color: '#9A8F72', size: 13 },
//     Jupiter: { abbr: 'Ju', color: '#D98C3D', size: 19 },
//     Venus: { abbr: 'Ve', color: '#E8C77A', size: 15 },
//     Saturn: { abbr: 'Sa', color: '#B99A63', size: 17 },
//     Rahu: { abbr: 'Ra', color: '#2C3E66', size: 13 },
//     Ketu: { abbr: 'Ke', color: '#8B909E', size: 13 }
// };

// // "Key Transit Insights" — live now, from getPlanetaryTransit()'s
// // keyInsights array (backend: transit-insight-rules.js). Shape:
// // { planet, rashi, isRetrograde, text }.

// const IMPORTANT_NOTE = {
//     text: 'Planetary transits influence tendencies, not certainties. Use this as guidance along with your birth chart for deeper insights.',
//     sanskrit: '\u0917\u094d\u0930\u0939\u093e\u0903 \u092b\u0932\u093e\u0928\u093f \u0926\u0926\u094d\u0924\u094d\u092f\u0947\u0935, \u092a\u0941\u0930\u0941\u0937\u093e\u0930\u094d\u0925\u0902 \u0935\u093f\u0928\u093e \u0915\u093e\u0932\u094b \u0928\u093e\u0964',
//     translation: 'Planets give results, but without effort, time does not.'
// };

// // --- Step 3 data ---------------------------------------------------------
// // "Upcoming Major Transits" is live now, from GET
// // /panchang/planetary-transit/upcoming (panchang-service.js ->
// // getUpcomingTransits). Row shape from the API: { date, planet, fromRashi,
// // toRashi, transit, isRetrograde, impact }.

// // "Transit Impact by Area of Life" — 6-tile grid, icon + label + sub-label.
// const LIFE_AREAS = [
//     { icon: TbBriefcase, label: 'Career', sub: 'Growth & Opportunities', color: '#3B5BDB', bg: '#EEF1FD' },
//     { icon: TbCurrencyRupee, label: 'Finance', sub: 'Wealth & Stability', color: '#E8863B', bg: '#FDF1E8' },
//     { icon: TbHeart, label: 'Relationships', sub: 'Love & Harmony', color: '#D8567A', bg: '#FCEDF1' },
//     { icon: TbHeartbeat, label: 'Health', sub: 'Well-being & Energy', color: '#2E9E5B', bg: '#E9F7EF' },
//     { icon: TbSchool, label: 'Education', sub: 'Learning & Wisdom', color: '#2E7DBD', bg: '#E8F2FB' },
//     { icon: FaOm, label: 'Spirituality', sub: 'Inner Growth', color: '#8355C7', bg: '#F2ECFB' }
// ];

// // Real designed banner (galaxy background + rendered planets + baked-in
// // title/quote/feature-strip text) — same pattern as the Panchang page's
// // HERO_BANNERS (a single pre-made graphic, not a CSS recreation). Save the
// // asset at this exact path. Native ratio is 2172x454 (~4.78:1); aspectRatio
// // keeps it from stretching/cropping oddly at any screen width.
// const HERO_BANNER_SRC = '/images/planetary-transit-hero.png';

// function HeroSection() {
//     return (
//         <Box sx={{ position: 'relative', width: '100%', bgcolor: THEME.navyDeep, overflow: 'hidden' }}>
//             <Box sx={{ position: 'relative', width: '100%', aspectRatio: '2172 / 454' }}>
//                 <Image
//                     src={HERO_BANNER_SRC}
//                     alt="Planetary Transit — Cosmic Movements, Real Life Impact"
//                     fill
//                     priority
//                     style={{ objectFit: 'cover' }}
//                     sizes="100vw"
//                 />
//             </Box>
//         </Box>
//     );
// }

// // Left rail — matches the "Daily Panchang / Muhurat / Planetary Transit /
// // ..." quick-links list from the reference design. Non-active items are
// // href="#" placeholders except where a matching page already exists
// // elsewhere in the app (Muhurat, Kundali, Compatibility).

// // Promo card under the sidebar nav — "Align with the Cosmos, Live in
// // Harmony" image tile from the reference design. Swap SIDEBAR_PROMO_SRC for
// // a real asset path once it's uploaded to /public/images.
// const SIDEBAR_PROMO_SRC = '/images/planetary-transit-sidebar-promo.jpg';


// // Tab bar + static date selector shown above the tab content.

// // "Current Planetary Positions" table — live data from getPlanetaryTransit()
// // (see PlanetaryTransit() at the bottom of this file).

// // Polar -> cartesian helper for the wheel's radial lines, labels & markers.
// // Shared premium card look for every block on this page.
// const CARD_SX = {
//     borderRadius: 3,
//     border: `1px solid ${THEME.border}`,
//     bgcolor: '#FFFFFF',
//     boxShadow: '0 10px 30px rgba(11, 19, 48, 0.05)'
// };

// // Column template shared by the positions header + every row so they align.
// const POSITIONS_GRID = 'minmax(128px, 1fr) minmax(0, 1.35fr) minmax(0, 1fr) 100px';
// const LIGHT_PLANETS = ['Moon', 'Venus'];

// function SectionHeader({ icon: Icon, title, subtitle, action }) {
//     return (
//         <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
//             <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
//                 <Box
//                     sx={{
//                         width: 38,
//                         height: 38,
//                         flexShrink: 0,
//                         borderRadius: '12px',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE2B8 100%)'
//                     }}
//                 >
//                     <Icon size={20} color={THEME.gold} />
//                 </Box>
//                 <Box sx={{ minWidth: 0 }}>
//                     <Typography sx={{ fontWeight: 800, fontSize: 16.5, color: THEME.ink, lineHeight: 1.25 }}>{title}</Typography>
//                     {subtitle && (
//                         <Typography sx={{ fontSize: 12.5, color: THEME.mutedInk, mt: 0.25, lineHeight: 1.45 }}>{subtitle}</Typography>
//                     )}
//                 </Box>
//             </Stack>
//             {action}
//         </Stack>
//     );
// }

// function TransitTabsBar({ tab, onChange }) {
//     return (
//         <Stack
//             direction={{ xs: 'column', md: 'row' }}
//             justifyContent="space-between"
//             alignItems={{ md: 'center' }}
//             spacing={1.5}
//             sx={{ ...CARD_SX, p: 0.75 }}
//         >
//             <Tabs
//                 value={tab}
//                 onChange={onChange}
//                 variant="scrollable"
//                 scrollButtons="auto"
//                 allowScrollButtonsMobile
//                 sx={{
//                     flex: 1,
//                     minWidth: 0,
//                     minHeight: 44,
//                     '& .MuiTabs-indicator': { display: 'none' },
//                     '& .MuiTab-root': {
//                         textTransform: 'none',
//                         fontWeight: 600,
//                         fontSize: 13.5,
//                         minHeight: 44,
//                         px: 2,
//                         borderRadius: 2,
//                         color: THEME.mutedInk,
//                         transition: 'background-color .2s ease, color .2s ease',
//                         '&:hover': { bgcolor: '#F5F7FD' }
//                     },
//                     '& .Mui-selected': {
//                         color: `${THEME.navy} !important`,
//                         fontWeight: 800,
//                         bgcolor: '#FFF3E0',
//                         boxShadow: `inset 0 -3px 0 ${THEME.gold}`
//                     }
//                 }}
//             >
//                 {TABS.map((label) => (
//                     <Tab key={label} label={label} disableRipple />
//                 ))}
//             </Tabs>

//             <Stack
//                 direction="row"
//                 spacing={1}
//                 alignItems="center"
//                 sx={{
//                     flexShrink: 0,
//                     whiteSpace: 'nowrap',
//                     bgcolor: '#F7F8FC',
//                     border: `1px solid ${THEME.border}`,
//                     borderRadius: 2,
//                     px: 1.75,
//                     height: 40,
//                     mr: { md: 0.5 },
//                     alignSelf: { xs: 'flex-start', md: 'auto' }
//                 }}
//             >
//                 <TbCalendarEvent size={16} color={THEME.gold} />
//                 <Typography sx={{ fontSize: 13, fontWeight: 700, color: THEME.ink, whiteSpace: 'nowrap' }}>
//                     {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
//                 </Typography>
//             </Stack>
//         </Stack>
//     );
// }

// function CurrentPositionsTable({ positions, loading }) {
//     return (
//         <Card elevation={0} sx={{ ...CARD_SX, p: 2.5, height: '100%' }}>
//             <SectionHeader
//                 icon={TbPlanet}
//                 title="Current Planetary Positions"
//                 subtitle="Real-time position of planets (based on sidereal/Lahiri Ayanamsa)"
//             />

//             <Box sx={{ border: `1px solid ${THEME.border}`, borderRadius: 2.5, overflow: 'hidden' }}>
//                 {/* Header: same 4-column template as every row, so nothing can overlap */}
//                 <Box
//                     sx={{
//                         display: 'grid',
//                         gridTemplateColumns: POSITIONS_GRID,
//                         columnGap: 1.5,
//                         alignItems: 'center',
//                         px: 2,
//                         py: 1.25,
//                         bgcolor: '#F5F7FD',
//                         borderBottom: `1px solid ${THEME.border}`,
//                         color: THEME.mutedInk,
//                         fontSize: 11.5,
//                         fontWeight: 700,
//                         textTransform: 'uppercase',
//                         letterSpacing: 0.6
//                     }}
//                 >
//                     <Box>Planet</Box>
//                     <Box>Sign &amp; Degree</Box>
//                     <Box>Nakshatra</Box>
//                     <Box>Status</Box>
//                 </Box>

//                 {loading &&
//                     [...Array(9)].map((_, i) => (
//                         <Box key={i} sx={{ px: 2, py: 1.5, borderTop: i === 0 ? 0 : `1px solid ${THEME.border}` }}>
//                             <Skeleton height={32} />
//                         </Box>
//                     ))}

//                 {!loading && positions.length === 0 && (
//                     <Typography sx={{ textAlign: 'center', fontSize: 13, color: THEME.mutedInk, py: 4 }}>
//                         Planetary positions are temporarily unavailable.
//                     </Typography>
//                 )}

//                 {!loading &&
//                     positions.map((row, idx) => {
//                         const meta = PLANET_META[row.planet] || { abbr: (row.planet || '?').slice(0, 2), color: THEME.gold };
//                         const signMain = row.rashiEn || row.rashi;
//                         const signSub = row.rashi && row.rashiEn && row.rashi !== row.rashiEn ? row.rashi : null;
//                         return (
//                             <Box
//                                 key={row.planet}
//                                 sx={{
//                                     display: 'grid',
//                                     gridTemplateColumns: POSITIONS_GRID,
//                                     columnGap: 1.5,
//                                     alignItems: 'center',
//                                     minHeight: 66,
//                                     px: 2,
//                                     py: 1,
//                                     borderTop: idx === 0 ? 0 : `1px solid ${THEME.border}`,
//                                     transition: 'background-color .15s ease',
//                                     '&:hover': { bgcolor: '#FAFBFE' }
//                                 }}
//                             >
//                                 {/* Planet */}
//                                 <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
//                                     <Box
//                                         sx={{
//                                             width: 32,
//                                             height: 32,
//                                             flexShrink: 0,
//                                             borderRadius: '50%',
//                                             bgcolor: meta.color,
//                                             color: LIGHT_PLANETS.includes(row.planet) ? THEME.navy : '#FFFFFF',
//                                             display: 'flex',
//                                             alignItems: 'center',
//                                             justifyContent: 'center',
//                                             fontSize: 11,
//                                             fontWeight: 800,
//                                             boxShadow: `0 0 0 3px ${meta.color}26`
//                                         }}
//                                     >
//                                         {meta.abbr}
//                                     </Box>
//                                     <Typography sx={{ fontSize: 14, fontWeight: 700, color: THEME.ink, minWidth: 0, overflowWrap: 'anywhere' }}>
//                                         {row.planet}
//                                     </Typography>
//                                 </Stack>

//                                 {/* Sign + degree stacked */}
//                                 <Box sx={{ minWidth: 0 }}>
//                                     <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: THEME.ink, lineHeight: 1.35, overflowWrap: 'anywhere' }}>
//                                         {signMain}
//                                         {signSub && (
//                                             <Box component="span" sx={{ color: THEME.mutedInk, fontWeight: 500 }}>
//                                                 {' '}
//                                                 ({signSub})
//                                             </Box>
//                                         )}
//                                     </Typography>
//                                     <Typography sx={{ fontSize: 12, color: THEME.mutedInk, mt: 0.25, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
//                                         {row.degree}
//                                     </Typography>
//                                 </Box>

//                                 {/* Nakshatra */}
//                                 <Typography sx={{ fontSize: 13.5, color: THEME.ink, lineHeight: 1.35, minWidth: 0, overflowWrap: 'anywhere' }}>
//                                     {row.nakshatra}
//                                 </Typography>

//                                 {/* Status */}
//                                 <Box>
//                                     <Chip
//                                         label={row.isRetrograde ? 'Retrograde' : 'Direct'}
//                                         size="small"
//                                         sx={{
//                                             fontWeight: 700,
//                                             fontSize: 11.5,
//                                             height: 26,
//                                             borderRadius: '8px',
//                                             bgcolor: row.isRetrograde ? '#FBEAE7' : '#E7F5EC',
//                                             color: row.isRetrograde ? '#B4544A' : '#2E7D4F'
//                                         }}
//                                     />
//                                 </Box>
//                             </Box>
//                         );
//                     })}
//             </Box>
//         </Card>
//     );
// }

// function SidebarNav() {
//     return (
//         <Card
//             elevation={0}
//             sx={{
//                 ...CARD_SX,
//                 p: 1.25,
//                 width: 220,
//                 flexShrink: 0,
//                 display: { xs: 'none', lg: 'block' }
//             }}
//         >
//             <Stack spacing={0.5}>
//                 {SIDEBAR_ITEMS.map(({ icon: Icon, label, href, active }) => {
//                     // href '#' = page not built yet -> non-clickable "SOON" (same as the navbar)
//                     const soon = !active && (!href || href === '#');

//                     if (soon) {
//                         return (
//                             <Stack
//                                 key={label}
//                                 direction="row"
//                                 spacing={1.5}
//                                 alignItems="center"
//                                 aria-disabled="true"
//                                 sx={{ px: 1.5, py: 1.1, borderRadius: 2, cursor: 'default', opacity: 0.5, userSelect: 'none' }}
//                             >
//                                 <Icon size={17} color={THEME.mutedInk} />
//                                 <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: THEME.ink, flex: 1, minWidth: 0 }}>{label}</Typography>
//                                 <Typography
//                                     sx={{
//                                         fontSize: 9.5,
//                                         fontWeight: 800,
//                                         letterSpacing: 0.6,
//                                         color: '#4C5FD6',
//                                         bgcolor: '#EEF1FC',
//                                         borderRadius: '6px',
//                                         px: 0.75,
//                                         py: 0.25,
//                                         flexShrink: 0
//                                     }}
//                                 >
//                                     SOON
//                                 </Typography>
//                             </Stack>
//                         );
//                     }

//                     return (
//                         <Stack
//                             key={label}
//                             component={Link}
//                             href={href}
//                             aria-current={active ? 'page' : undefined}
//                             direction="row"
//                             spacing={1.5}
//                             alignItems="center"
//                             sx={{
//                                 px: 1.5,
//                                 py: 1.1,
//                                 borderRadius: 2,
//                                 textDecoration: 'none',
//                                 cursor: 'pointer',
//                                 background: active ? `linear-gradient(135deg, ${THEME.navy} 0%, #1B2A5A 100%)` : 'transparent',
//                                 color: active ? '#FFFFFF' : THEME.ink,
//                                 boxShadow: active ? '0 6px 16px rgba(11, 19, 48, 0.25)' : 'none',
//                                 transition: 'background-color .15s ease, transform .15s ease',
//                                 '&:hover': { bgcolor: active ? undefined : '#F5F7FD', transform: active ? 'none' : 'translateX(2px)' }
//                             }}
//                         >
//                             <Icon size={17} color={active ? THEME.gold : THEME.mutedInk} />
//                             <Typography sx={{ fontSize: 13.5, fontWeight: active ? 700 : 600 }}>{label}</Typography>
//                         </Stack>
//                     );
//                 })}
//             </Stack>
//         </Card>
//     );
// }

// function SidebarPromo() {
//     return (
//         <Card
//             elevation={0}
//             sx={{
//                 ...CARD_SX,
//                 mt: 2,
//                 overflow: 'hidden',
//                 width: 220,
//                 flexShrink: 0,
//                 display: { xs: 'none', lg: 'block' },
//                 position: 'relative',
//                 height: 180,
//                 // Fallback look if the promo image file is missing.
//                 background: 'linear-gradient(135deg, #0B1330 0%, #2A1B5A 60%, #FB8B05 160%)'
//             }}
//         >
//             <Image
//                 src={SIDEBAR_PROMO_SRC}
//                 alt="Align with the Cosmos, Live in Harmony"
//                 fill
//                 style={{ objectFit: 'cover' }}
//                 onError={(e) => {
//                     e.currentTarget.style.display = 'none';
//                 }}
//             />
//             <Box
//                 sx={{
//                     position: 'absolute',
//                     inset: 0,
//                     background: 'linear-gradient(180deg, rgba(11,19,48,0) 30%, rgba(11,19,48,0.8) 100%)',
//                     display: 'flex',
//                     alignItems: 'flex-end',
//                     p: 2
//                 }}
//             >
//                 <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>
//                     Align with the Cosmos, Live in Harmony.
//                 </Typography>
//             </Box>
//         </Card>
//     );
// }

// function TransitChartCard({ sx, positions }) {
//     const [view, setView] = useState('rashi');
//     return (
//         <Card elevation={0} sx={{ ...CARD_SX, p: 2.5, display: 'flex', flexDirection: 'column', ...sx }}>
//             <SectionHeader icon={TbChartPie} title="Planetary Transit Chart" subtitle="Where every graha sits right now" />

//             <ToggleButtonGroup
//                 value={view}
//                 exclusive
//                 onChange={(e, val) => val && setView(val)}
//                 size="small"
//                 fullWidth
//                 sx={{
//                     mb: 1.5,
//                     p: 0.5,
//                     bgcolor: '#F5F7FD',
//                     borderRadius: 2.5,
//                     '& .MuiToggleButtonGroup-grouped': { border: 0, borderRadius: '10px !important', mx: 0 },
//                     '& .MuiToggleButton-root': {
//                         textTransform: 'none',
//                         fontWeight: 700,
//                         fontSize: 12.5,
//                         py: 0.9,
//                         color: THEME.mutedInk
//                     },
//                     '& .Mui-selected': {
//                         bgcolor: `${THEME.navy} !important`,
//                         color: '#FFFFFF !important',
//                         boxShadow: '0 4px 12px rgba(11, 19, 48, 0.25)'
//                     }
//                 }}
//             >
//                 <ToggleButton value="rashi">Rashi Wheel</ToggleButton>
//                 <ToggleButton value="solar">Solar System</ToggleButton>
//             </ToggleButtonGroup>

//             <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0 }}>
//                 {view === 'rashi' ? <RashiWheel positions={positions} /> : <SolarSystemStrip positions={positions} />}
//             </Box>
//         </Card>
//     );
// }

// // One expandable insight: collapsed = headline + 1-line preview, click to read all.
// function InsightItem({ planet, rashi, text }) {
//     const [open, setOpen] = useState(false);
//     const color = PLANET_META[planet]?.color || THEME.gold;
//     const abbr = PLANET_META[planet]?.abbr || (planet || '?').slice(0, 2);
//     return (
//         <Box
//             sx={{
//                 borderRadius: 2.5,
//                 border: `1px solid ${THEME.border}`,
//                 borderLeft: `4px solid ${color}`,
//                 bgcolor: open ? '#FBFCFF' : '#FFFFFF',
//                 overflow: 'hidden',
//                 transition: 'box-shadow .2s ease, background-color .2s ease',
//                 boxShadow: open ? '0 8px 22px rgba(11, 19, 48, 0.08)' : 'none'
//             }}
//         >
//             <Stack
//                 role="button"
//                 tabIndex={0}
//                 aria-expanded={open}
//                 direction="row"
//                 alignItems="center"
//                 spacing={1.5}
//                 onClick={() => setOpen((v) => !v)}
//                 onKeyDown={(e) => {
//                     if (e.key === 'Enter' || e.key === ' ') {
//                         e.preventDefault();
//                         setOpen((v) => !v);
//                     }
//                 }}
//                 sx={{
//                     p: 1.5,
//                     cursor: 'pointer',
//                     outline: 'none',
//                     '&:hover': { bgcolor: '#F7F8FC' },
//                     '&:focus-visible': { boxShadow: `inset 0 0 0 2px ${THEME.gold}` }
//                 }}
//             >
//                 <Box
//                     sx={{
//                         width: 32,
//                         height: 32,
//                         flexShrink: 0,
//                         borderRadius: '50%',
//                         bgcolor: color,
//                         color: LIGHT_PLANETS.includes(planet) ? THEME.navy : '#FFFFFF',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         fontSize: 11,
//                         fontWeight: 800
//                     }}
//                 >
//                     {abbr}
//                 </Box>
//                 <Box sx={{ flex: 1, minWidth: 0 }}>
//                     <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: THEME.ink }}>
//                         {planet} in {rashi}
//                     </Typography>
//                     {!open && (
//                         <Typography
//                             sx={{
//                                 fontSize: 12,
//                                 color: THEME.mutedInk,
//                                 mt: 0.25,
//                                 overflow: 'hidden',
//                                 textOverflow: 'ellipsis',
//                                 whiteSpace: 'nowrap'
//                             }}
//                         >
//                             {text}
//                         </Typography>
//                     )}
//                 </Box>
//                 <Box
//                     sx={{
//                         display: 'flex',
//                         color: THEME.mutedInk,
//                         transition: 'transform .25s ease',
//                         transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
//                     }}
//                 >
//                     <TbChevronDown size={18} />
//                 </Box>
//             </Stack>
//             <Collapse in={open} timeout={250} unmountOnExit>
//                 <Typography sx={{ fontSize: 12.5, color: THEME.ink, lineHeight: 1.7, px: 1.5, pb: 1.75, pl: 6.75 }}>{text}</Typography>
//             </Collapse>
//         </Box>
//     );
// }

// function KeyInsightsCard({ sx, insights, loading }) {
//     return (
//         <Card elevation={0} sx={{ ...CARD_SX, p: 2.5, ...sx }}>
//             <SectionHeader icon={TbBulb} title="Key Transit Insights" subtitle="Tap any planet to read what it means for you" />
//             {loading && (
//                 <Stack spacing={1.25}>
//                     {[...Array(3)].map((_, i) => (
//                         <Skeleton key={i} variant="rounded" height={62} />
//                     ))}
//                 </Stack>
//             )}
//             {!loading && insights.length === 0 && (
//                 <Typography sx={{ fontSize: 12.5, color: THEME.mutedInk, textAlign: 'center', py: 1 }}>
//                     Insights are temporarily unavailable.
//                 </Typography>
//             )}
//             {!loading && insights.length > 0 && (
//                 <Box
//                     sx={{
//                         display: 'grid',
//                         gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
//                         gap: 1.25,
//                         alignItems: 'start'
//                     }}
//                 >
//                     {insights.map(({ planet, rashi, text }) => (
//                         <InsightItem key={planet} planet={planet} rashi={rashi} text={text} />
//                     ))}
//                 </Box>
//             )}
//         </Card>
//     );
// }

// function ImportantNoteCard({ sx }) {
//     return (
//         <Card
//             elevation={0}
//             sx={{
//                 borderRadius: 3,
//                 border: `1px solid ${THEME.gold}55`,
//                 background: 'linear-gradient(160deg, #FFF8EC 0%, #FFEFD3 100%)',
//                 boxShadow: '0 10px 30px rgba(251, 139, 5, 0.10)',
//                 p: 2.5,
//                 ...sx
//             }}
//         >
//             <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 3 }} alignItems={{ md: 'center' }}>
//                 <Box sx={{ flex: '1 1 55%', minWidth: 0 }}>
//                     <SectionHeader icon={TbInfoCircle} title="Important Note" />
//                     <Typography sx={{ fontSize: 13, color: THEME.ink, lineHeight: 1.7 }}>{IMPORTANT_NOTE.text}</Typography>
//                 </Box>
//                 <Stack
//                     spacing={0.75}
//                     sx={{
//                         flex: '1 1 45%',
//                         minWidth: 0,
//                         p: 2,
//                         borderRadius: 2.5,
//                         bgcolor: 'rgba(255, 255, 255, 0.65)',
//                         border: `1px dashed ${THEME.gold}66`
//                     }}
//                 >
//                     <Typography sx={{ fontStyle: 'italic', fontWeight: 700, fontSize: 14.5, color: '#C86A00', textAlign: 'center', lineHeight: 1.6 }}>
//                         {IMPORTANT_NOTE.sanskrit}
//                     </Typography>
//                     <Typography sx={{ fontSize: 12, color: THEME.mutedInk, textAlign: 'center' }}>{IMPORTANT_NOTE.translation}</Typography>
//                 </Stack>
//             </Stack>
//         </Card>
//     );
// }

// function UpcomingTransitsCard({ sx, transits, loading }) {
//     return (
//         <Card elevation={0} sx={{ ...CARD_SX, p: 2.5, ...sx }}>
//             <SectionHeader
//                 icon={TbCalendarEvent}
//                 title="Upcoming Major Transits"
//                 subtitle="Next big planetary shifts to plan around"
//                 action={
//                     <Stack
//                         direction="row"
//                         spacing={0.5}
//                         alignItems="center"
//                         component="a"
//                         href="#"
//                         sx={{
//                             color: THEME.gold,
//                             fontWeight: 700,
//                             fontSize: 12.5,
//                             textDecoration: 'none',
//                             flexShrink: 0,
//                             px: 1.5,
//                             py: 0.75,
//                             borderRadius: 2,
//                             bgcolor: '#FFF3E0',
//                             '&:hover': { bgcolor: '#FFE7C2' }
//                         }}
//                     >
//                         <span>View All</span>
//                         <TbArrowRight size={14} />
//                     </Stack>
//                 }
//             />
//             <TableContainer sx={{ overflowX: 'auto', border: `1px solid ${THEME.border}`, borderRadius: 2.5 }}>
//                 <Table size="small">
//                     <TableHead>
//                         <TableRow sx={{ bgcolor: '#F5F7FD' }}>
//                             {['Date', 'Planet', 'Transit', 'Impact'].map((head) => (
//                                 <TableCell
//                                     key={head}
//                                     sx={{
//                                         fontWeight: 700,
//                                         fontSize: 11.5,
//                                         textTransform: 'uppercase',
//                                         letterSpacing: 0.6,
//                                         color: THEME.mutedInk,
//                                         borderColor: THEME.border,
//                                         py: 1.25
//                                     }}
//                                 >
//                                     {head}
//                                 </TableCell>
//                             ))}
//                         </TableRow>
//                     </TableHead>
//                     <TableBody>
//                         {loading && (
//                             <TableRow>
//                                 <TableCell colSpan={4} sx={{ textAlign: 'center', fontSize: 13, color: THEME.mutedInk, border: 0, py: 3 }}>
//                                     Loading upcoming transits...
//                                 </TableCell>
//                             </TableRow>
//                         )}
//                         {!loading && transits.length === 0 && (
//                             <TableRow>
//                                 <TableCell colSpan={4} sx={{ textAlign: 'center', fontSize: 13, color: THEME.mutedInk, border: 0, py: 3 }}>
//                                     Upcoming transits are temporarily unavailable.
//                                 </TableCell>
//                             </TableRow>
//                         )}
//                         {!loading &&
//                             transits.map((row) => (
//                                 <TableRow
//                                     key={`${row.date}-${row.planet}`}
//                                     sx={{ '&:last-child td': { borderBottom: 0 }, '&:hover': { bgcolor: '#FAFBFE' } }}
//                                 >
//                                     <TableCell sx={{ fontSize: 13, fontWeight: 600, color: THEME.ink, borderColor: THEME.border, whiteSpace: 'nowrap', py: 1.5 }}>
//                                         {new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
//                                     </TableCell>
//                                     <TableCell sx={{ borderColor: THEME.border }}>
//                                         <Stack direction="row" spacing={1} alignItems="center">
//                                             <Box
//                                                 sx={{
//                                                     width: 10,
//                                                     height: 10,
//                                                     borderRadius: '50%',
//                                                     flexShrink: 0,
//                                                     bgcolor: PLANET_META[row.planet]?.color || THEME.gold,
//                                                     boxShadow: `0 0 0 3px ${(PLANET_META[row.planet]?.color || THEME.gold)}26`
//                                                 }}
//                                             />
//                                             <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: THEME.ink }}>{row.planet}</Typography>
//                                         </Stack>
//                                     </TableCell>
//                                     <TableCell sx={{ fontSize: 13, color: THEME.ink, borderColor: THEME.border, whiteSpace: 'nowrap' }}>
//                                         {row.transit}
//                                     </TableCell>
//                                     <TableCell sx={{ fontSize: 13, color: THEME.mutedInk, borderColor: THEME.border, lineHeight: 1.5 }}>
//                                         {row.impact || (
//                                             <Box component="span" sx={{ opacity: 0.5 }}>
//                                                 —
//                                             </Box>
//                                         )}
//                                     </TableCell>
//                                 </TableRow>
//                             ))}
//                     </TableBody>
//                 </Table>
//             </TableContainer>
//         </Card>
//     );
// }

// function LifeImpactCard({ sx }) {
//     return (
//         <Card elevation={0} sx={{ ...CARD_SX, p: 2.5, ...sx }}>
//             <SectionHeader icon={FaOm} title="Transit Impact by Area of Life" subtitle="How the sky touches your everyday life" />
//             <Box
//                 sx={{
//                     display: 'grid',
//                     gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', xl: 'repeat(6, 1fr)' },
//                     gap: 1.5
//                 }}
//             >
//                 {LIFE_AREAS.map(({ icon: Icon, label, sub, color, bg }) => (
//                     <Stack
//                         key={label}
//                         spacing={1}
//                         sx={{
//                             p: 1.75,
//                             borderRadius: 3,
//                             bgcolor: bg,
//                             border: `1px solid ${color}1F`,
//                             cursor: 'pointer',
//                             transition: 'transform .18s ease, box-shadow .18s ease',
//                             '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 10px 22px ${color}26` }
//                         }}
//                     >
//                         <Box
//                             sx={{
//                                 width: 38,
//                                 height: 38,
//                                 borderRadius: '12px',
//                                 bgcolor: '#FFFFFF',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center',
//                                 boxShadow: `0 4px 10px ${color}26`
//                             }}
//                         >
//                             <Icon size={19} color={color} />
//                         </Box>
//                         <Box>
//                             <Typography sx={{ fontWeight: 800, fontSize: 13.5, color: THEME.ink }}>{label}</Typography>
//                             <Typography sx={{ fontSize: 11.5, color: THEME.mutedInk, lineHeight: 1.35, mt: 0.25 }}>{sub}</Typography>
//                         </Box>
//                     </Stack>
//                 ))}
//             </Box>
//         </Card>
//     );
// }

// function pointOnCircle(cx, cy, r, angleDeg) {
//     const rad = (angleDeg * Math.PI) / 180;
//     return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
// }

// // SVG path for a ring "wedge" (donut slice) between two radii/angles — used
// // for the alternating sector shading behind each rashi.
// function wedgePath(cx, cy, rOuter, rInner, startAngle, endAngle) {
//     const o1 = pointOnCircle(cx, cy, rOuter, startAngle);
//     const o2 = pointOnCircle(cx, cy, rOuter, endAngle);
//     const i1 = pointOnCircle(cx, cy, rInner, endAngle);
//     const i2 = pointOnCircle(cx, cy, rInner, startAngle);
//     return `M ${o1.x} ${o1.y} A ${rOuter} ${rOuter} 0 0 1 ${o2.x} ${o2.y} L ${i1.x} ${i1.y} A ${rInner} ${rInner} 0 0 0 ${i2.x} ${i2.y} Z`;
// }

// // Vedic "Rashi Chakra" — 12-sector wheel, Aries at the top going clockwise.
// // Built entirely from the live `positions` prop (real sidereal longitude,
// // same numbers as the Current Positions table and the backend's
// // astronomy-engine/Prokerala pipeline) — no hand-placed pixel coordinates
// // and no made-up degrees:
// //   - which sign a graha sits in comes from rashiEn (Panchang-derived)
// //   - WHERE inside that 30° sector its marker sits comes from its actual
// //     longitudeDegrees (mod 30), so two planets in the same rashi land at
// //     visibly different angles instead of being crammed into one spot.
// // When several grahas fall close together, markers are staggered across
// // two radii bands purely to stay legible — the angle itself is never
// // altered, so the chart stays a true read of the position table.
// function RashiWheel({ positions }) {
//     const size = 380;
//     const cx = size / 2;
//     const cy = size / 2;
//     const outerR = 176;
//     const ringOuterR = 176;
//     const ringInnerR = 104;
//     const labelR = 140;
//     const markerROuter = 86;
//     const markerRInner = 62;
//     const innerR = 46;

//     // Real within-sign degree (0-30) straight from longitudeDegrees, so a
//     // planet's angular position on the wheel matches its actual place in
//     // the sky — not just "somewhere in this sign".
//     const degreeInSign = (row) => {
//         const lon = row.longitudeDegrees;
//         return typeof lon === 'number' && !Number.isNaN(lon) ? ((lon % 30) + 30) % 30 : 15;
//     };

//     // Group today's live planets by the sign they currently occupy
//     // (rashiEn is the astronomically-normalized English name — see
//     // resolveEnglishRashi on the backend), each sorted by real degree so
//     // staggering (when needed) reads left-to-right in sky order.
//     const bySign = RASHI_ORDER.map(() => []);
//     positions.forEach((row) => {
//         const idx = RASHI_ORDER.findIndex((r) => r.en === row.rashiEn);
//         if (idx !== -1 && PLANET_META[row.planet]) bySign[idx].push(row);
//     });
//     bySign.forEach((rows) => rows.sort((a, b) => degreeInSign(a) - degreeInSign(b)));

//     return (
//         <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}>
//             <svg width="100%" height="auto" viewBox={`0 0 ${size} ${size}`} style={{ maxWidth: Math.round(size * 1.1) }}>
//                 <defs>
//                     <radialGradient id="rw-center" cx="50%" cy="42%" r="65%">
//                         <stop offset="0%" stopColor="#FFF3DC" />
//                         <stop offset="100%" stopColor="#FDE7C2" />
//                     </radialGradient>
//                 </defs>

//                 {/* Alternating sector shading — makes each rashi's boundary
//                     easy to scan at a glance instead of one flat wash. */}
//                 {RASHI_ORDER.map((rashi, i) => {
//                     const start = -90 - 15 + i * 30;
//                     const end = start + 30;
//                     return (
//                         <path
//                             key={`wedge-${rashi.en}`}
//                             d={wedgePath(cx, cy, ringOuterR, innerR, start, end)}
//                             fill={i % 2 === 0 ? '#FFF9EF' : '#FFFFFF'}
//                         />
//                     );
//                 })}

//                 <circle cx={cx} cy={cy} r={ringOuterR} fill="none" stroke={THEME.gold} strokeWidth="1.5" opacity="0.55" />
//                 <circle cx={cx} cy={cy} r={ringInnerR} fill="none" stroke={THEME.border} strokeWidth="1" />
//                 <circle cx={cx} cy={cy} r={innerR} fill="url(#rw-center)" stroke={THEME.gold} strokeWidth="1.5" />

//                 {/* Sector boundary lines, full sign name + Sanskrit label. */}
//                 {RASHI_ORDER.map((rashi, i) => {
//                     const boundaryAngle = -90 - 15 + i * 30;
//                     const inner = pointOnCircle(cx, cy, innerR, boundaryAngle);
//                     const outer = pointOnCircle(cx, cy, ringOuterR, boundaryAngle);
//                     const midAngle = -90 + i * 30;
//                     const label = pointOnCircle(cx, cy, labelR, midAngle);
//                     return (
//                         <React.Fragment key={`sector-${rashi.en}`}>
//                             <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={THEME.border} strokeWidth="1" />
//                             <text x={label.x} y={label.y - 2} textAnchor="middle" fontSize="9.5" fontWeight="700" letterSpacing="0" fill={THEME.ink}>
//                                 {rashi.en}
//                             </text>
//                             <text x={label.x} y={label.y + 9} textAnchor="middle" fontSize="7.5" letterSpacing="0" fill={THEME.mutedInk}>
//                                 {rashi.sa}
//                             </text>
//                         </React.Fragment>
//                     );
//                 })}

//                 {/* Graha markers — angle is the real sidereal degree inside
//                     the sector; radius only alternates to dodge overlap. */}
//                 {bySign.map((rows, i) =>
//                     rows.map((row, j) => {
//                         const sectorStart = -90 - 15 + i * 30;
//                         const angle = sectorStart + degreeInSign(row);
//                         const r = j % 2 === 0 ? markerROuter : markerRInner;
//                         const pos = pointOnCircle(cx, cy, r, angle);
//                         const meta = PLANET_META[row.planet];
//                         return (
//                             <g key={row.planet}>
//                                 <title>
//                                     {row.planet} — {row.rashiEn || row.rashi} {row.degree || ''} {row.isRetrograde ? '(Retrograde)' : ''}
//                                 </title>
//                                 <circle cx={pos.x} cy={pos.y} r="10.5" fill={meta.color} stroke="#FFFFFF" strokeWidth="1.75" />
//                                 <text x={pos.x} y={pos.y + 3.3} textAnchor="middle" fontSize="8" fontWeight="700" fill="#FFFFFF">
//                                     {meta.abbr}
//                                 </text>
//                                 {row.isRetrograde && (
//                                     <circle cx={pos.x + 8} cy={pos.y - 8} r="5" fill="#C0392B" stroke="#FFFFFF" strokeWidth="1" />
//                                 )}
//                                 {row.isRetrograde && (
//                                     <text x={pos.x + 8} y={pos.y - 5.3} textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#FFFFFF">
//                                         R
//                                     </text>
//                                 )}
//                             </g>
//                         );
//                     })
//                 )}

//                 <text x={cx} y={cy + 8} textAnchor="middle" fontSize="20" fill={THEME.gold}>
//                     {'\u0950'}
//                 </text>
//             </svg>

//             {/* Compact legend — same colors as the markers above, so a
//                 crowded sign is still easy to read at a glance. */}
//             <Box
//                 sx={{
//                     mt: 1,
//                     display: 'flex',
//                     flexWrap: 'wrap',
//                     justifyContent: 'center',
//                     gap: 0.75,
//                     maxWidth: 300
//                 }}
//             >
//                 {Object.entries(PLANET_META).map(([planet, meta]) => (
//                     <Stack key={planet} direction="row" spacing={0.5} alignItems="center">
//                         <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: meta.color, flexShrink: 0 }} />
//                         <Typography sx={{ fontSize: 9.5, color: THEME.mutedInk, fontWeight: 600 }}>{planet}</Typography>
//                     </Stack>
//                 ))}
//                 <Stack direction="row" spacing={0.5} alignItems="center">
//                     <Box
//                         sx={{
//                             width: 9,
//                             height: 9,
//                             borderRadius: '50%',
//                             bgcolor: '#C0392B',
//                             flexShrink: 0,
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'center'
//                         }}
//                     >
//                         <Typography sx={{ fontSize: 6.5, color: '#FFFFFF', fontWeight: 700, lineHeight: 1 }}>R</Typography>
//                     </Box>
//                     <Typography sx={{ fontSize: 9.5, color: THEME.mutedInk, fontWeight: 600 }}>Retrograde</Typography>
//                 </Stack>
//             </Box>
//         </Box>
//     );
// }

// // Chunk an array into fixed-size groups — used below so the "ecliptic"
// // line under each row only ever spans the planets actually sitting in
// // that row (with 9 grahas, a single flex-wrap row can't hold them all).
// function chunk(arr, size) {
//     const out = [];
//     for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
//     return out;
// }

// // Compact "Solar System" alternative to the Rashi Wheel — same 9 grahas,
// // in the same order as the Current Positions table above (so the two
// // views never disagree), each showing today's live rashi underneath. A
// // thin ecliptic line ties each row together and a small "R" badge flags
// // retrograde motion, straight from the same `positions` data as the wheel
// // and the table.
// function SolarSystemStrip({ positions }) {
//     const rows = positions.filter((row) => PLANET_META[row.planet]);
//     const rowChunks = chunk(rows, 5);
//     return (
//         <Box
//             sx={{
//                 bgcolor: THEME.navyDeep,
//                 borderRadius: 2.5,
//                 py: 3,
//                 px: 2
//             }}
//         >
//             {rowChunks.map((chunkRows, chunkIdx) => (
//                 <Box
//                     key={chunkIdx}
//                     sx={{
//                         position: 'relative',
//                         display: 'flex',
//                         justifyContent: chunkRows.length >= 5 ? 'space-between' : 'center',
//                         gap: chunkRows.length >= 5 ? 0 : 3,
//                         mt: chunkIdx > 0 ? 3 : 0
//                     }}
//                 >
//                     <Box
//                         sx={{
//                             position: 'absolute',
//                             left: '8%',
//                             right: '8%',
//                             top: '30%',
//                             height: '1px',
//                             background:
//                                 'linear-gradient(90deg, rgba(251,139,5,0) 0%, rgba(251,139,5,0.35) 12%, rgba(251,139,5,0.35) 88%, rgba(251,139,5,0) 100%)'
//                         }}
//                     />
//                     {chunkRows.map((row) => {
//                         const meta = PLANET_META[row.planet];
//                         return (
//                             <Stack key={row.planet} spacing={0.6} alignItems="center" sx={{ minWidth: 34, position: 'relative' }}>
//                                 <Box sx={{ position: 'relative' }}>
//                                     <Box
//                                         sx={{
//                                             width: meta.size,
//                                             height: meta.size,
//                                             borderRadius: '50%',
//                                             bgcolor: meta.color,
//                                             boxShadow: `0 0 10px ${meta.color}AA`
//                                         }}
//                                     />
//                                     {row.isRetrograde && (
//                                         <Box
//                                             sx={{
//                                                 position: 'absolute',
//                                                 top: -4,
//                                                 right: -6,
//                                                 width: 13,
//                                                 height: 13,
//                                                 borderRadius: '50%',
//                                                 bgcolor: '#C0392B',
//                                                 border: '1.5px solid #070C1F',
//                                                 display: 'flex',
//                                                 alignItems: 'center',
//                                                 justifyContent: 'center'
//                                             }}
//                                         >
//                                             <Typography sx={{ fontSize: 7.5, color: '#FFFFFF', fontWeight: 700, lineHeight: 1 }}>R</Typography>
//                                         </Box>
//                                     )}
//                                 </Box>
//                                 <Typography sx={{ color: '#FFFFFF', fontSize: 10.5, fontWeight: 700 }}>{row.planet}</Typography>
//                                 <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 9 }}>{row.rashiEn || row.rashi}</Typography>
//                             </Stack>
//                         );
//                     })}
//                 </Box>
//             ))}
//         </Box>
//     );
// }

// // "Planetary Transit Chart" card — Rashi Wheel / Solar System toggle, same
// // spot the reference design uses it (middle column of row 1).

// // "Key Transit Insights" — right column, top card. One row per entry in
// // the live `insights` prop (getPlanetaryTransit()'s keyInsights array),
// // with a colored dot, the headline and a chevron.

// // "Important Note" — right column, bottom card. Disclaimer + Sanskrit shloka
// // with its translation, in the same warm/gold tone as the hero quote box.

// // "Upcoming Major Transits" — row 2, left. Same table styling as
// // CurrentPositionsTable, plus a gold "View All" link in the header. Data
// // comes from the live `transits` prop (getUpcomingTransits()).

// // "Transit Impact by Area of Life" — row 2, right. 6-tile grid built from
// // LIFE_AREAS; 3 columns on wide screens, 2 on small ones.

// export default function PlanetaryTransit() {
//     const [tab, setTab] = useState(0);

//     const [positions, setPositions] = useState([]);
//     const [keyInsights, setKeyInsights] = useState([]);
//     const [positionsLoading, setPositionsLoading] = useState(true);

//     const [upcomingTransits, setUpcomingTransits] = useState([]);
//     const [upcomingLoading, setUpcomingLoading] = useState(true);

//     // Current positions + key insights — one request, backed by the same
//     // Panchang cache/Prokerala call as the rest of the Panchang/Muhurat
//     // pages (getOrFetchPanchang on the backend), so this costs zero extra
//     // API credits beyond what's already being fetched elsewhere.
//     const fetchPositions = useCallback(async () => {
//         setPositionsLoading(true);
//         try {
//             const res = await getPlanetaryTransit();
//             setPositions(res?.data?.positions || []);
//             setKeyInsights(res?.data?.keyInsights || []);
//         } catch (err) {
//             setPositions([]);
//             setKeyInsights([]);
//         } finally {
//             setPositionsLoading(false);
//         }
//     }, []);

//     // Upcoming transits — computed astronomically + cached on the backend,
//     // not polled from Prokerala. Independent request/loading state from
//     // the positions above since they hit different endpoints.
//     const fetchUpcomingTransits = useCallback(async () => {
//         setUpcomingLoading(true);
//         try {
//             const res = await getUpcomingTransits({ months: 12, limit: 10 });
//             setUpcomingTransits(res?.data || []);
//         } catch (err) {
//             setUpcomingTransits([]);
//         } finally {
//             setUpcomingLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchPositions();
//         fetchUpcomingTransits();
//     }, [fetchPositions, fetchUpcomingTransits]);

//     return (
//         <Box sx={{ bgcolor: '#F8F9FC', minHeight: '100vh' }}>
//             <HeroSection />

//             <Container maxWidth="xl" sx={{ py: 3 }}>
//                 <Stack direction="row" spacing={2.5} alignItems="flex-start">
//                     {/* Left rail: nav list + promo tile, stacked (matches reference) */}
//                     <Stack spacing={0} sx={{ display: { xs: 'none', lg: 'block' } }}>
//                         <SidebarNav />
//                         <SidebarPromo />
//                     </Stack>

//                     <Box sx={{ flex: 1, minWidth: 0 }}>
//                         <TransitTabsBar tab={tab} onChange={(e, val) => setTab(val)} />

//                         {tab !== 0 && (
//                             <Card
//                                 elevation={0}
//                                 sx={{ mt: 2.5, p: 5, borderRadius: 3, border: `1px solid ${THEME.border}`, textAlign: 'center' }}
//                             >
//                                 <Typography sx={{ color: THEME.mutedInk, fontSize: 14 }}>{TABS[tab]} — coming soon</Typography>
//                             </Card>
//                         )}

//                         {tab === 0 && (
//                             <>
//                                 {/* Row 1: positions | transit chart */}
//                                 <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5} alignItems="stretch" sx={{ mt: 2.5 }}>
//                                     <Box sx={{ flex: '1 1 58%', minWidth: 0 }}>
//                                         <CurrentPositionsTable positions={positions} loading={positionsLoading} />
//                                     </Box>
//                                     <Box sx={{ flex: '1 1 42%', minWidth: 0 }}>
//                                         <TransitChartCard sx={{ height: '100%' }} positions={positions} />
//                                     </Box>
//                                 </Stack>

//                                 {/* Row 2: key insights (full width) */}
//                                 <Box sx={{ mt: 2.5 }}>
//                                     <KeyInsightsCard insights={keyInsights} loading={positionsLoading} />
//                                 </Box>

//                                 {/* Row 3: important note banner */}
//                                 <Box sx={{ mt: 2.5 }}>
//                                     <ImportantNoteCard />
//                                 </Box>

//                                 {/* Row 4: upcoming transits (full width) */}
//                                 <Box sx={{ mt: 2.5 }}>
//                                     <UpcomingTransitsCard transits={upcomingTransits} loading={upcomingLoading} />
//                                 </Box>

//                                 {/* Row 5: transit impact by area of life */}
//                                 <Box sx={{ mt: 2.5 }}>
//                                     <LifeImpactCard />
//                                 </Box>
//                             </>
//                         )}
//                     </Box>
//                 </Stack>
//             </Container>
//         </Box>
//     );
// }





// 'use client';
// import React, { useState, useEffect, useCallback } from 'react';
// import Image from 'next/image';

// // mui
// import {
//     Box,
//     Container,
//     Stack,
//     Typography,
//     Chip,
//     Card,
//     Tabs,
//     Tab,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     ToggleButton,
//     ToggleButtonGroup
// } from '@mui/material';

// // icons
// import {
//     TbCalendarEvent,
//     TbBuildingChurch,
//     TbClockHour4,
//     TbPlanet,
//     TbChartPie,
//     TbReportAnalytics,
//     TbHeartHandshake,
//     TbWand,
//     TbBook2,
//     TbChevronDown,
//     TbChevronRight,
//     TbArrowRight,
//     TbBulb,
//     TbInfoCircle,
//     TbBriefcase,
//     TbCurrencyRupee,
//     TbHeart,
//     TbHeartbeat,
//     TbSchool
// } from 'react-icons/tb';
// import { FaOm } from 'react-icons/fa';

// // Live data — see PlanetaryTransit() at the bottom of this file for the
// // fetch/loading wiring. CURRENT_POSITIONS/TRANSIT_INSIGHTS/UPCOMING_TRANSITS
// // no longer exist as hardcoded consts; every component below now takes its
// // data as props.
// import { getPlanetaryTransit, getUpcomingTransits } from '@/services/panchang-service';

// // Module-scoped tokens — only used on this Planetary Transit page.
// const THEME = {
//     navy: '#0B1330',
//     navyDeep: '#070C1F',
//     ink: '#1B2A4A',
//     gold: '#FB8B05',
//     border: '#E5E9F8',
//     mutedInk: '#6B7291'
// };

// // Left sidebar — same tool list style as the Panchang & Muhurat page.
// // "Planetary Transit" is marked active since we're on this page.
// const SIDEBAR_ITEMS = [
//     { icon: TbCalendarEvent, label: 'Daily Panchang', href: '#' },
//     { icon: TbBuildingChurch, label: 'Festival & Vrat', href: '#' },
//     { icon: TbClockHour4, label: 'Muhurat', href: '/muhurat' },
//     { icon: TbPlanet, label: 'Planetary Transit', href: '/planetary-transit', active: true },
//     { icon: TbChartPie, label: 'Rashi Phal', href: '#' },
//     { icon: TbReportAnalytics, label: 'Kundali', href: '/kundali-generation' },
//     { icon: TbHeartHandshake, label: 'Compatibility', href: '/kundali-matching' },
//     { icon: TbWand, label: 'Remedies', href: '#' },
//     { icon: TbBook2, label: 'Learn Astrology', href: '#' }
// ];

// // Tab bar — only "Current Transit" is wired up with real content for now;
// // the rest are static placeholders (design only) until later steps.
// const TABS = ['Current Transit', 'Upcoming Transits', 'Retrograde', 'Planetary Calendar', 'Effects by Rashi', 'Conjunctions', 'Historical Transits'];

// // Live "Current Planetary Positions" now comes from GET
// // /panchang/planetary-transit (panchang-service.js -> getPlanetaryTransit).
// // Row shape from the API: { planet, rashi, rashiEn, degree, nakshatra,
// // pada, isRetrograde } — rashi is Prokerala's own display string, rashiEn
// // is the astronomically-normalized English sign name used for grouping
// // (Rashi Wheel) and matching against TRANSIT_INSIGHT_RULES.

// // --- Step 2 data ---------------------------------------------------------

// // 12 signs in natural zodiac order, starting at the top of the wheel and
// // going clockwise (Aries at 12 o'clock) — matches the reference chart.
// const RASHI_ORDER = [
//     { en: 'Aries', sa: 'Mesha' },
//     { en: 'Taurus', sa: 'Vrishabha' },
//     { en: 'Gemini', sa: 'Mithuna' },
//     { en: 'Cancer', sa: 'Karka' },
//     { en: 'Leo', sa: 'Simha' },
//     { en: 'Virgo', sa: 'Kanya' },
//     { en: 'Libra', sa: 'Tula' },
//     { en: 'Scorpio', sa: 'Vrishchika' },
//     { en: 'Sagittarius', sa: 'Dhanu' },
//     { en: 'Capricorn', sa: 'Makara' },
//     { en: 'Aquarius', sa: 'Kumbha' },
//     { en: 'Pisces', sa: 'Meena' }
// ];

// // Same 9 grahas used in the hero banner + positions table — abbreviation,
// // wheel-marker color and relative dot size (used on the Solar System tab).
// const PLANET_META = {
//     Sun: { abbr: 'Su', color: '#FB8B05', size: 22 },
//     Moon: { abbr: 'Mo', color: '#C7CBD8', size: 16 },
//     Mars: { abbr: 'Ma', color: '#C0392B', size: 14 },
//     Mercury: { abbr: 'Me', color: '#9A8F72', size: 13 },
//     Jupiter: { abbr: 'Ju', color: '#D98C3D', size: 19 },
//     Venus: { abbr: 'Ve', color: '#E8C77A', size: 15 },
//     Saturn: { abbr: 'Sa', color: '#B99A63', size: 17 },
//     Rahu: { abbr: 'Ra', color: '#2C3E66', size: 13 },
//     Ketu: { abbr: 'Ke', color: '#8B909E', size: 13 }
// };

// // "Key Transit Insights" — live now, from getPlanetaryTransit()'s
// // keyInsights array (backend: transit-insight-rules.js). Shape:
// // { planet, rashi, isRetrograde, text }.

// const IMPORTANT_NOTE = {
//     text: 'Planetary transits influence tendencies, not certainties. Use this as guidance along with your birth chart for deeper insights.',
//     sanskrit: '\u0917\u094d\u0930\u0939\u093e\u0903 \u092b\u0932\u093e\u0928\u093f \u0926\u0926\u094d\u0924\u094d\u092f\u0947\u0935, \u092a\u0941\u0930\u0941\u0937\u093e\u0930\u094d\u0925\u0902 \u0935\u093f\u0928\u093e \u0915\u093e\u0932\u094b \u0928\u093e\u0964',
//     translation: 'Planets give results, but without effort, time does not.'
// };

// // --- Step 3 data ---------------------------------------------------------
// // "Upcoming Major Transits" is live now, from GET
// // /panchang/planetary-transit/upcoming (panchang-service.js ->
// // getUpcomingTransits). Row shape from the API: { date, planet, fromRashi,
// // toRashi, transit, isRetrograde, impact }.

// // "Transit Impact by Area of Life" — 6-tile grid, icon + label + sub-label.
// const LIFE_AREAS = [
//     { icon: TbBriefcase, label: 'Career', sub: 'Growth & Opportunities', color: '#3B5BDB', bg: '#EEF1FD' },
//     { icon: TbCurrencyRupee, label: 'Finance', sub: 'Wealth & Stability', color: '#E8863B', bg: '#FDF1E8' },
//     { icon: TbHeart, label: 'Relationships', sub: 'Love & Harmony', color: '#D8567A', bg: '#FCEDF1' },
//     { icon: TbHeartbeat, label: 'Health', sub: 'Well-being & Energy', color: '#2E9E5B', bg: '#E9F7EF' },
//     { icon: TbSchool, label: 'Education', sub: 'Learning & Wisdom', color: '#2E7DBD', bg: '#E8F2FB' },
//     { icon: FaOm, label: 'Spirituality', sub: 'Inner Growth', color: '#8355C7', bg: '#F2ECFB' }
// ];

// // Real designed banner (galaxy background + rendered planets + baked-in
// // title/quote/feature-strip text) — same pattern as the Panchang page's
// // HERO_BANNERS (a single pre-made graphic, not a CSS recreation). Save the
// // asset at this exact path. Native ratio is 2172x454 (~4.78:1); aspectRatio
// // keeps it from stretching/cropping oddly at any screen width.
// const HERO_BANNER_SRC = '/images/planetary-transit-hero.png';

// function HeroSection() {
//     return (
//         <Box sx={{ position: 'relative', width: '100%', bgcolor: THEME.navyDeep, overflow: 'hidden' }}>
//             <Box sx={{ position: 'relative', width: '100%', aspectRatio: '2172 / 454' }}>
//                 <Image
//                     src={HERO_BANNER_SRC}
//                     alt="Planetary Transit — Cosmic Movements, Real Life Impact"
//                     fill
//                     priority
//                     style={{ objectFit: 'cover' }}
//                     sizes="100vw"
//                 />
//             </Box>
//         </Box>
//     );
// }

// // Left rail — matches the "Daily Panchang / Muhurat / Planetary Transit /
// // ..." quick-links list from the reference design. Non-active items are
// // href="#" placeholders except where a matching page already exists
// // elsewhere in the app (Muhurat, Kundali, Compatibility).
// function SidebarNav() {
//     return (
//         <Card
//             elevation={0}
//             sx={{
//                 p: 1.5,
//                 borderRadius: 3,
//                 border: `1px solid ${THEME.border}`,
//                 width: 220,
//                 flexShrink: 0,
//                 display: { xs: 'none', lg: 'block' }
//             }}
//         >
//             <Stack spacing={0.5}>
//                 {SIDEBAR_ITEMS.map(({ icon: Icon, label, href, active }) => (
//                     <Stack
//                         key={label}
//                         component="a"
//                         href={href}
//                         direction="row"
//                         spacing={1.5}
//                         alignItems="center"
//                         sx={{
//                             px: 1.5,
//                             py: 1.1,
//                             borderRadius: 2,
//                             textDecoration: 'none',
//                             cursor: 'pointer',
//                             bgcolor: active ? THEME.navy : 'transparent',
//                             color: active ? '#FFFFFF' : THEME.ink,
//                             '&:hover': { bgcolor: active ? THEME.navy : '#F5F6FA' }
//                         }}
//                     >
//                         <Icon size={17} color={active ? THEME.gold : THEME.mutedInk} />
//                         <Typography sx={{ fontSize: 13.5, fontWeight: active ? 700 : 600 }}>{label}</Typography>
//                     </Stack>
//                 ))}
//             </Stack>
//         </Card>
//     );
// }

// // Promo card under the sidebar nav — "Align with the Cosmos, Live in
// // Harmony" image tile from the reference design. Swap SIDEBAR_PROMO_SRC for
// // a real asset path once it's uploaded to /public/images.
// const SIDEBAR_PROMO_SRC = '/images/planetary-transit-sidebar-promo.jpg';

// function SidebarPromo() {
//     return (
//         <Card
//             elevation={0}
//             sx={{
//                 mt: 2,
//                 borderRadius: 3,
//                 overflow: 'hidden',
//                 border: `1px solid ${THEME.border}`,
//                 width: 220,
//                 flexShrink: 0,
//                 display: { xs: 'none', lg: 'block' },
//                 position: 'relative',
//                 height: 180
//             }}
//         >
//             <Image src={SIDEBAR_PROMO_SRC} alt="Align with the Cosmos, Live in Harmony" fill style={{ objectFit: 'cover' }} />
//             <Box
//                 sx={{
//                     position: 'absolute',
//                     inset: 0,
//                     background: 'linear-gradient(180deg, rgba(11,19,48,0) 40%, rgba(11,19,48,0.75) 100%)',
//                     display: 'flex',
//                     alignItems: 'flex-end',
//                     p: 2
//                 }}
//             >
//                 <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>
//                     Align with the Cosmos, Live in Harmony.
//                 </Typography>
//             </Box>
//         </Card>
//     );
// }

// // Tab bar + static date selector shown above the tab content.
// function TransitTabsBar({ tab, onChange }) {
//     return (
//         <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5}>
//             <Tabs
//                 value={tab}
//                 onChange={onChange}
//                 variant="scrollable"
//                 scrollButtons="auto"
//                 sx={{
//                     minHeight: 40,
//                     '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 13.5, minHeight: 40, color: THEME.mutedInk },
//                     '& .Mui-selected': { color: `${THEME.navy} !important` },
//                     '& .MuiTabs-indicator': { bgcolor: THEME.gold, height: 3, borderRadius: 2 }
//                 }}
//             >
//                 {TABS.map((label) => (
//                     <Tab key={label} label={label} />
//                 ))}
//             </Tabs>

//             <Stack
//                 direction="row"
//                 spacing={1}
//                 alignItems="center"
//                 sx={{ border: `1px solid ${THEME.border}`, borderRadius: 2, px: 1.5, py: 0.75, alignSelf: { xs: 'flex-start', sm: 'auto' } }}
//             >
//                 <TbCalendarEvent size={16} color={THEME.mutedInk} />
//                 <Typography sx={{ fontSize: 13, fontWeight: 600, color: THEME.ink }}>
//                     {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
//                 </Typography>
//                 <TbChevronDown size={14} color={THEME.mutedInk} />
//             </Stack>
//         </Stack>
//     );
// }

// // "Current Planetary Positions" table — live data from getPlanetaryTransit()
// // (see PlanetaryTransit() at the bottom of this file).
// function CurrentPositionsTable({ positions, loading }) {
//     return (
//         <Card elevation={0} sx={{ mt: 2.5, borderRadius: 3, border: `1px solid ${THEME.border}` }}>
//             <Box sx={{ p: 2.5, pb: 1.5 }}>
//                 <Typography sx={{ fontWeight: 700, fontSize: 16, color: THEME.ink }}>Current Planetary Positions</Typography>
//                 <Typography sx={{ fontSize: 12.5, color: THEME.mutedInk, mt: 0.25 }}>
//                     Real-time position of planets (based on sidereal/Lahiri Ayanamsa)
//                 </Typography>
//             </Box>
//             <TableContainer sx={{ overflowX: 'auto' }}>
//                 <Table size="small">
//                     <TableHead>
//                         <TableRow>
//                             {['Planet', 'Sign (Rashi)', 'Degree', 'Nakshatra', 'Status'].map((head) => (
//                                 <TableCell key={head} sx={{ fontWeight: 700, fontSize: 12.5, color: THEME.mutedInk, borderColor: THEME.border }}>
//                                     {head}
//                                 </TableCell>
//                             ))}
//                         </TableRow>
//                     </TableHead>
//                     <TableBody>
//                         {loading && (
//                             <TableRow>
//                                 <TableCell colSpan={5} sx={{ textAlign: 'center', fontSize: 13, color: THEME.mutedInk, border: 0, py: 3 }}>
//                                     Loading live positions...
//                                 </TableCell>
//                             </TableRow>
//                         )}
//                         {!loading && positions.length === 0 && (
//                             <TableRow>
//                                 <TableCell colSpan={5} sx={{ textAlign: 'center', fontSize: 13, color: THEME.mutedInk, border: 0, py: 3 }}>
//                                     Planetary positions are temporarily unavailable.
//                                 </TableCell>
//                             </TableRow>
//                         )}
//                         {!loading && positions.map((row) => (
//                             <TableRow key={row.planet} sx={{ '&:last-child td': { borderBottom: 0 } }}>
//                                 <TableCell sx={{ fontSize: 13.5, fontWeight: 600, color: THEME.ink, borderColor: THEME.border }}>
//                                     {row.planet}
//                                 </TableCell>
//                                 <TableCell sx={{ fontSize: 13.5, color: THEME.ink, borderColor: THEME.border }}>
//                                     {row.rashi ? `${row.rashiEn || row.rashi}${row.rashi && row.rashiEn && row.rashi !== row.rashiEn ? ` (${row.rashi})` : ''}` : row.rashiEn}
//                                 </TableCell>
//                                 <TableCell sx={{ fontSize: 13.5, color: THEME.ink, borderColor: THEME.border }}>{row.degree}</TableCell>
//                                 <TableCell sx={{ fontSize: 13.5, color: THEME.ink, borderColor: THEME.border }}>{row.nakshatra}</TableCell>
//                                 <TableCell sx={{ borderColor: THEME.border }}>
//                                     <Chip
//                                         label={row.isRetrograde ? 'Retrograde' : 'Direct'}
//                                         size="small"
//                                         sx={{
//                                             fontWeight: 700,
//                                             fontSize: 11.5,
//                                             bgcolor: row.isRetrograde ? '#F7E9E7' : '#E7F5EC',
//                                             color: row.isRetrograde ? '#B4544A' : '#2E7D4F'
//                                         }}
//                                     />
//                                 </TableCell>
//                             </TableRow>
//                         ))}
//                     </TableBody>
//                 </Table>
//             </TableContainer>
//         </Card>
//     );
// }

// // Polar -> cartesian helper for the wheel's radial lines, labels & markers.
// function pointOnCircle(cx, cy, r, angleDeg) {
//     const rad = (angleDeg * Math.PI) / 180;
//     return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
// }

// // SVG path for a ring "wedge" (donut slice) between two radii/angles — used
// // for the alternating sector shading behind each rashi.
// function wedgePath(cx, cy, rOuter, rInner, startAngle, endAngle) {
//     const o1 = pointOnCircle(cx, cy, rOuter, startAngle);
//     const o2 = pointOnCircle(cx, cy, rOuter, endAngle);
//     const i1 = pointOnCircle(cx, cy, rInner, endAngle);
//     const i2 = pointOnCircle(cx, cy, rInner, startAngle);
//     return `M ${o1.x} ${o1.y} A ${rOuter} ${rOuter} 0 0 1 ${o2.x} ${o2.y} L ${i1.x} ${i1.y} A ${rInner} ${rInner} 0 0 0 ${i2.x} ${i2.y} Z`;
// }

// // Vedic "Rashi Chakra" — 12-sector wheel, Aries at the top going clockwise.
// // Built entirely from the live `positions` prop (real sidereal longitude,
// // same numbers as the Current Positions table and the backend's
// // astronomy-engine/Prokerala pipeline) — no hand-placed pixel coordinates
// // and no made-up degrees:
// //   - which sign a graha sits in comes from rashiEn (Panchang-derived)
// //   - WHERE inside that 30° sector its marker sits comes from its actual
// //     longitudeDegrees (mod 30), so two planets in the same rashi land at
// //     visibly different angles instead of being crammed into one spot.
// // When several grahas fall close together, markers are staggered across
// // two radii bands purely to stay legible — the angle itself is never
// // altered, so the chart stays a true read of the position table.
// function RashiWheel({ positions }) {
//     const size = 340;
//     const cx = size / 2;
//     const cy = size / 2;
//     const outerR = 150;
//     const ringOuterR = 150;
//     const ringInnerR = 108;
//     const labelR = 129;
//     const markerROuter = 92;
//     const markerRInner = 68;
//     const innerR = 46;

//     // Real within-sign degree (0-30) straight from longitudeDegrees, so a
//     // planet's angular position on the wheel matches its actual place in
//     // the sky — not just "somewhere in this sign".
//     const degreeInSign = (row) => {
//         const lon = row.longitudeDegrees;
//         return typeof lon === 'number' && !Number.isNaN(lon) ? ((lon % 30) + 30) % 30 : 15;
//     };

//     // Group today's live planets by the sign they currently occupy
//     // (rashiEn is the astronomically-normalized English name — see
//     // resolveEnglishRashi on the backend), each sorted by real degree so
//     // staggering (when needed) reads left-to-right in sky order.
//     const bySign = RASHI_ORDER.map(() => []);
//     positions.forEach((row) => {
//         const idx = RASHI_ORDER.findIndex((r) => r.en === row.rashiEn);
//         if (idx !== -1 && PLANET_META[row.planet]) bySign[idx].push(row);
//     });
//     bySign.forEach((rows) => rows.sort((a, b) => degreeInSign(a) - degreeInSign(b)));

//     return (
//         <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}>
//             <svg width="100%" height="auto" viewBox={`0 0 ${size} ${size}`} style={{ maxWidth: size }}>
//                 <defs>
//                     <radialGradient id="rw-center" cx="50%" cy="42%" r="65%">
//                         <stop offset="0%" stopColor="#FFF3DC" />
//                         <stop offset="100%" stopColor="#FDE7C2" />
//                     </radialGradient>
//                 </defs>

//                 {/* Alternating sector shading — makes each rashi's boundary
//                     easy to scan at a glance instead of one flat wash. */}
//                 {RASHI_ORDER.map((rashi, i) => {
//                     const start = -90 - 15 + i * 30;
//                     const end = start + 30;
//                     return (
//                         <path
//                             key={`wedge-${rashi.en}`}
//                             d={wedgePath(cx, cy, ringOuterR, innerR, start, end)}
//                             fill={i % 2 === 0 ? '#FFF9EF' : '#FFFFFF'}
//                         />
//                     );
//                 })}

//                 <circle cx={cx} cy={cy} r={ringOuterR} fill="none" stroke={THEME.gold} strokeWidth="1.5" opacity="0.55" />
//                 <circle cx={cx} cy={cy} r={ringInnerR} fill="none" stroke={THEME.border} strokeWidth="1" />
//                 <circle cx={cx} cy={cy} r={innerR} fill="url(#rw-center)" stroke={THEME.gold} strokeWidth="1.5" />

//                 {/* Sector boundary lines, full sign name + Sanskrit label. */}
//                 {RASHI_ORDER.map((rashi, i) => {
//                     const boundaryAngle = -90 - 15 + i * 30;
//                     const inner = pointOnCircle(cx, cy, innerR, boundaryAngle);
//                     const outer = pointOnCircle(cx, cy, ringOuterR, boundaryAngle);
//                     const midAngle = -90 + i * 30;
//                     const label = pointOnCircle(cx, cy, labelR, midAngle);
//                     return (
//                         <React.Fragment key={`sector-${rashi.en}`}>
//                             <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={THEME.border} strokeWidth="1" />
//                             <text x={label.x} y={label.y - 2} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={THEME.ink}>
//                                 {rashi.en}
//                             </text>
//                             <text x={label.x} y={label.y + 9} textAnchor="middle" fontSize="7.5" fill={THEME.mutedInk}>
//                                 {rashi.sa}
//                             </text>
//                         </React.Fragment>
//                     );
//                 })}

//                 {/* Graha markers — angle is the real sidereal degree inside
//                     the sector; radius only alternates to dodge overlap. */}
//                 {bySign.map((rows, i) =>
//                     rows.map((row, j) => {
//                         const sectorStart = -90 - 15 + i * 30;
//                         const angle = sectorStart + degreeInSign(row);
//                         const r = j % 2 === 0 ? markerROuter : markerRInner;
//                         const pos = pointOnCircle(cx, cy, r, angle);
//                         const meta = PLANET_META[row.planet];
//                         return (
//                             <g key={row.planet}>
//                                 <title>
//                                     {row.planet} — {row.rashiEn || row.rashi} {row.degree || ''} {row.isRetrograde ? '(Retrograde)' : ''}
//                                 </title>
//                                 <circle cx={pos.x} cy={pos.y} r="10.5" fill={meta.color} stroke="#FFFFFF" strokeWidth="1.75" />
//                                 <text x={pos.x} y={pos.y + 3.3} textAnchor="middle" fontSize="8" fontWeight="700" fill="#FFFFFF">
//                                     {meta.abbr}
//                                 </text>
//                                 {row.isRetrograde && (
//                                     <circle cx={pos.x + 8} cy={pos.y - 8} r="5" fill="#C0392B" stroke="#FFFFFF" strokeWidth="1" />
//                                 )}
//                                 {row.isRetrograde && (
//                                     <text x={pos.x + 8} y={pos.y - 5.3} textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#FFFFFF">
//                                         R
//                                     </text>
//                                 )}
//                             </g>
//                         );
//                     })
//                 )}

//                 <text x={cx} y={cy + 8} textAnchor="middle" fontSize="19" fill={THEME.gold}>
//                     {'\u0950'}
//                 </text>
//             </svg>

//             {/* Compact legend — same colors as the markers above, so a
//                 crowded sign is still easy to read at a glance. */}
//             <Box
//                 sx={{
//                     mt: 1,
//                     display: 'flex',
//                     flexWrap: 'wrap',
//                     justifyContent: 'center',
//                     gap: 0.75,
//                     maxWidth: 300
//                 }}
//             >
//                 {Object.entries(PLANET_META).map(([planet, meta]) => (
//                     <Stack key={planet} direction="row" spacing={0.5} alignItems="center">
//                         <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: meta.color, flexShrink: 0 }} />
//                         <Typography sx={{ fontSize: 9.5, color: THEME.mutedInk, fontWeight: 600 }}>{planet}</Typography>
//                     </Stack>
//                 ))}
//                 <Stack direction="row" spacing={0.5} alignItems="center">
//                     <Box
//                         sx={{
//                             width: 9,
//                             height: 9,
//                             borderRadius: '50%',
//                             bgcolor: '#C0392B',
//                             flexShrink: 0,
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'center'
//                         }}
//                     >
//                         <Typography sx={{ fontSize: 6.5, color: '#FFFFFF', fontWeight: 700, lineHeight: 1 }}>R</Typography>
//                     </Box>
//                     <Typography sx={{ fontSize: 9.5, color: THEME.mutedInk, fontWeight: 600 }}>Retrograde</Typography>
//                 </Stack>
//             </Box>
//         </Box>
//     );
// }

// // Chunk an array into fixed-size groups — used below so the "ecliptic"
// // line under each row only ever spans the planets actually sitting in
// // that row (with 9 grahas, a single flex-wrap row can't hold them all).
// function chunk(arr, size) {
//     const out = [];
//     for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
//     return out;
// }

// // Compact "Solar System" alternative to the Rashi Wheel — same 9 grahas,
// // in the same order as the Current Positions table above (so the two
// // views never disagree), each showing today's live rashi underneath. A
// // thin ecliptic line ties each row together and a small "R" badge flags
// // retrograde motion, straight from the same `positions` data as the wheel
// // and the table.
// function SolarSystemStrip({ positions }) {
//     const rows = positions.filter((row) => PLANET_META[row.planet]);
//     const rowChunks = chunk(rows, 5);
//     return (
//         <Box
//             sx={{
//                 bgcolor: THEME.navyDeep,
//                 borderRadius: 2.5,
//                 py: 3,
//                 px: 2
//             }}
//         >
//             {rowChunks.map((chunkRows, chunkIdx) => (
//                 <Box
//                     key={chunkIdx}
//                     sx={{
//                         position: 'relative',
//                         display: 'flex',
//                         justifyContent: chunkRows.length >= 5 ? 'space-between' : 'center',
//                         gap: chunkRows.length >= 5 ? 0 : 3,
//                         mt: chunkIdx > 0 ? 3 : 0
//                     }}
//                 >
//                     <Box
//                         sx={{
//                             position: 'absolute',
//                             left: '8%',
//                             right: '8%',
//                             top: '30%',
//                             height: '1px',
//                             background:
//                                 'linear-gradient(90deg, rgba(251,139,5,0) 0%, rgba(251,139,5,0.35) 12%, rgba(251,139,5,0.35) 88%, rgba(251,139,5,0) 100%)'
//                         }}
//                     />
//                     {chunkRows.map((row) => {
//                         const meta = PLANET_META[row.planet];
//                         return (
//                             <Stack key={row.planet} spacing={0.6} alignItems="center" sx={{ minWidth: 34, position: 'relative' }}>
//                                 <Box sx={{ position: 'relative' }}>
//                                     <Box
//                                         sx={{
//                                             width: meta.size,
//                                             height: meta.size,
//                                             borderRadius: '50%',
//                                             bgcolor: meta.color,
//                                             boxShadow: `0 0 10px ${meta.color}AA`
//                                         }}
//                                     />
//                                     {row.isRetrograde && (
//                                         <Box
//                                             sx={{
//                                                 position: 'absolute',
//                                                 top: -4,
//                                                 right: -6,
//                                                 width: 13,
//                                                 height: 13,
//                                                 borderRadius: '50%',
//                                                 bgcolor: '#C0392B',
//                                                 border: '1.5px solid #070C1F',
//                                                 display: 'flex',
//                                                 alignItems: 'center',
//                                                 justifyContent: 'center'
//                                             }}
//                                         >
//                                             <Typography sx={{ fontSize: 7.5, color: '#FFFFFF', fontWeight: 700, lineHeight: 1 }}>R</Typography>
//                                         </Box>
//                                     )}
//                                 </Box>
//                                 <Typography sx={{ color: '#FFFFFF', fontSize: 10.5, fontWeight: 700 }}>{row.planet}</Typography>
//                                 <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 9 }}>{row.rashiEn || row.rashi}</Typography>
//                             </Stack>
//                         );
//                     })}
//                 </Box>
//             ))}
//         </Box>
//     );
// }

// // "Planetary Transit Chart" card — Rashi Wheel / Solar System toggle, same
// // spot the reference design uses it (middle column of row 1).
// function TransitChartCard({ sx, positions }) {
//     const [view, setView] = useState('rashi');
//     return (
//         <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${THEME.border}`, p: 2.5, ...sx }}>
//             <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
//                 <Typography sx={{ fontWeight: 700, fontSize: 16, color: THEME.ink }}>Planetary Transit Chart</Typography>
//             </Stack>

//             <ToggleButtonGroup
//                 value={view}
//                 exclusive
//                 onChange={(e, val) => val && setView(val)}
//                 size="small"
//                 fullWidth
//                 sx={{
//                     mb: 1,
//                     '& .MuiToggleButton-root': {
//                         textTransform: 'none',
//                         fontWeight: 600,
//                         fontSize: 12.5,
//                         color: THEME.mutedInk,
//                         borderColor: THEME.border
//                     },
//                     '& .Mui-selected': {
//                         bgcolor: `${THEME.navy} !important`,
//                         color: '#FFFFFF !important'
//                     }
//                 }}
//             >
//                 <ToggleButton value="rashi">Rashi Wheel</ToggleButton>
//                 <ToggleButton value="solar">Solar System</ToggleButton>
//             </ToggleButtonGroup>

//             {view === 'rashi' ? <RashiWheel positions={positions} /> : <SolarSystemStrip positions={positions} />}
//         </Card>
//     );
// }

// // "Key Transit Insights" — right column, top card. One row per entry in
// // the live `insights` prop (getPlanetaryTransit()'s keyInsights array),
// // with a colored dot, the headline and a chevron.
// function KeyInsightsCard({ sx, insights, loading }) {
//     return (
//         <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${THEME.border}`, p: 2.5, ...sx }}>
//             <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
//                 <TbBulb size={18} color={THEME.gold} />
//                 <Typography sx={{ fontWeight: 700, fontSize: 16, color: THEME.ink }}>Key Transit Insights</Typography>
//             </Stack>
//             <Stack spacing={1.25}>
//                 {loading && (
//                     <Typography sx={{ fontSize: 12.5, color: THEME.mutedInk, textAlign: 'center', py: 1 }}>Loading...</Typography>
//                 )}
//                 {!loading && insights.length === 0 && (
//                     <Typography sx={{ fontSize: 12.5, color: THEME.mutedInk, textAlign: 'center', py: 1 }}>
//                         Insights are temporarily unavailable.
//                     </Typography>
//                 )}
//                 {!loading && insights.map(({ planet, rashi, text }) => (
//                     <Stack
//                         key={planet}
//                         direction="row"
//                         spacing={1.25}
//                         alignItems="flex-start"
//                         sx={{
//                             p: 1.25,
//                             borderRadius: 2,
//                             bgcolor: '#F7F8FC',
//                             cursor: 'pointer',
//                             '&:hover': { bgcolor: '#EFF1F8' }
//                         }}
//                     >
//                         <Box
//                             sx={{
//                                 mt: 0.4,
//                                 width: 8,
//                                 height: 8,
//                                 borderRadius: '50%',
//                                 flexShrink: 0,
//                                 bgcolor: PLANET_META[planet]?.color || THEME.gold
//                             }}
//                         />
//                         <Box sx={{ flex: 1 }}>
//                             <Typography sx={{ fontWeight: 700, fontSize: 13, color: THEME.ink }}>
//                                 {planet} in {rashi}
//                             </Typography>
//                             <Typography sx={{ fontSize: 12, color: THEME.mutedInk, mt: 0.25 }}>{text}</Typography>
//                         </Box>
//                         <TbChevronRight size={16} color={THEME.mutedInk} style={{ marginTop: 4, flexShrink: 0 }} />
//                     </Stack>
//                 ))}
//             </Stack>
//         </Card>
//     );
// }

// // "Important Note" — right column, bottom card. Disclaimer + Sanskrit shloka
// // with its translation, in the same warm/gold tone as the hero quote box.
// function ImportantNoteCard({ sx }) {
//     return (
//         <Card
//             elevation={0}
//             sx={{
//                 borderRadius: 3,
//                 border: `1px dashed ${THEME.gold}66`,
//                 bgcolor: '#FFF8EC',
//                 p: 2.5,
//                 ...sx
//             }}
//         >
//             <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
//                 <TbInfoCircle size={18} color={THEME.gold} />
//                 <Typography sx={{ fontWeight: 700, fontSize: 15, color: THEME.ink }}>Important Note</Typography>
//             </Stack>
//             <Typography sx={{ fontSize: 12.5, color: THEME.ink, lineHeight: 1.6 }}>{IMPORTANT_NOTE.text}</Typography>

//             <Stack spacing={0.5} sx={{ mt: 1.75, pt: 1.75, borderTop: `1px dashed ${THEME.gold}66` }}>
//                 <Typography sx={{ fontStyle: 'italic', fontWeight: 600, fontSize: 13, color: THEME.gold, textAlign: 'center' }}>
//                     {IMPORTANT_NOTE.sanskrit}
//                 </Typography>
//                 <Typography sx={{ fontSize: 11.5, color: THEME.mutedInk, textAlign: 'center' }}>
//                     {IMPORTANT_NOTE.translation}
//                 </Typography>
//             </Stack>
//         </Card>
//     );
// }

// // "Upcoming Major Transits" — row 2, left. Same table styling as
// // CurrentPositionsTable, plus a gold "View All" link in the header. Data
// // comes from the live `transits` prop (getUpcomingTransits()).
// function UpcomingTransitsCard({ sx, transits, loading }) {
//     return (
//         <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${THEME.border}`, ...sx }}>
//             <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2.5, pb: 1.5 }}>
//                 <Typography sx={{ fontWeight: 700, fontSize: 16, color: THEME.ink }}>Upcoming Major Transits</Typography>
//                 <Stack
//                     direction="row"
//                     spacing={0.5}
//                     alignItems="center"
//                     component="a"
//                     href="#"
//                     sx={{ color: THEME.gold, fontWeight: 700, fontSize: 12.5, textDecoration: 'none', flexShrink: 0 }}
//                 >
//                     <span>View All</span>
//                     <TbArrowRight size={14} />
//                 </Stack>
//             </Stack>
//             <TableContainer sx={{ overflowX: 'auto' }}>
//                 <Table size="small">
//                     <TableHead>
//                         <TableRow>
//                             {['Date', 'Planet', 'Transit', 'Impact'].map((head) => (
//                                 <TableCell key={head} sx={{ fontWeight: 700, fontSize: 12.5, color: THEME.mutedInk, borderColor: THEME.border }}>
//                                     {head}
//                                 </TableCell>
//                             ))}
//                         </TableRow>
//                     </TableHead>
//                     <TableBody>
//                         {loading && (
//                             <TableRow>
//                                 <TableCell colSpan={4} sx={{ textAlign: 'center', fontSize: 13, color: THEME.mutedInk, border: 0, py: 3 }}>
//                                     Loading upcoming transits...
//                                 </TableCell>
//                             </TableRow>
//                         )}
//                         {!loading && transits.length === 0 && (
//                             <TableRow>
//                                 <TableCell colSpan={4} sx={{ textAlign: 'center', fontSize: 13, color: THEME.mutedInk, border: 0, py: 3 }}>
//                                     Upcoming transits are temporarily unavailable.
//                                 </TableCell>
//                             </TableRow>
//                         )}
//                         {!loading && transits.map((row) => (
//                             <TableRow key={`${row.date}-${row.planet}`} sx={{ '&:last-child td': { borderBottom: 0 } }}>
//                                 <TableCell sx={{ fontSize: 13, color: THEME.ink, borderColor: THEME.border, whiteSpace: 'nowrap' }}>
//                                     {new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
//                                 </TableCell>
//                                 <TableCell sx={{ borderColor: THEME.border }}>
//                                     <Stack direction="row" spacing={1} alignItems="center">
//                                         <Box
//                                             sx={{
//                                                 width: 8,
//                                                 height: 8,
//                                                 borderRadius: '50%',
//                                                 flexShrink: 0,
//                                                 bgcolor: PLANET_META[row.planet]?.color || THEME.gold
//                                             }}
//                                         />
//                                         <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: THEME.ink }}>{row.planet}</Typography>
//                                     </Stack>
//                                 </TableCell>
//                                 <TableCell sx={{ fontSize: 13, color: THEME.ink, borderColor: THEME.border, whiteSpace: 'nowrap' }}>
//                                     {row.transit}
//                                 </TableCell>
//                                 <TableCell sx={{ fontSize: 13, color: THEME.mutedInk, borderColor: THEME.border }}>{row.impact}</TableCell>
//                             </TableRow>
//                         ))}
//                     </TableBody>
//                 </Table>
//             </TableContainer>
//         </Card>
//     );
// }

// // "Transit Impact by Area of Life" — row 2, right. 6-tile grid built from
// // LIFE_AREAS; 3 columns on wide screens, 2 on small ones.
// function LifeImpactCard({ sx }) {
//     return (
//         <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${THEME.border}`, p: 2.5, ...sx }}>
//             <Typography sx={{ fontWeight: 700, fontSize: 16, color: THEME.ink, mb: 1.75 }}>Transit Impact by Area of Life</Typography>
//             <Box
//                 sx={{
//                     display: 'grid',
//                     gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
//                     gap: 1.5
//                 }}
//             >
//                 {LIFE_AREAS.map(({ icon: Icon, label, sub, color, bg }) => (
//                     <Stack
//                         key={label}
//                         spacing={0.75}
//                         sx={{
//                             p: 1.5,
//                             borderRadius: 2.5,
//                             bgcolor: bg,
//                             cursor: 'pointer',
//                             transition: 'transform 0.15s ease',
//                             '&:hover': { transform: 'translateY(-2px)' }
//                         }}
//                     >
//                         <Box
//                             sx={{
//                                 width: 32,
//                                 height: 32,
//                                 borderRadius: '50%',
//                                 bgcolor: '#FFFFFF',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center'
//                             }}
//                         >
//                             <Icon size={16} color={color} />
//                         </Box>
//                         <Box>
//                             <Typography sx={{ fontWeight: 700, fontSize: 13, color: THEME.ink }}>{label}</Typography>
//                             <Typography sx={{ fontSize: 10.5, color: THEME.mutedInk, lineHeight: 1.3 }}>{sub}</Typography>
//                         </Box>
//                     </Stack>
//                 ))}
//             </Box>
//         </Card>
//     );
// }

// export default function PlanetaryTransit() {
//     const [tab, setTab] = useState(0);

//     const [positions, setPositions] = useState([]);
//     const [keyInsights, setKeyInsights] = useState([]);
//     const [positionsLoading, setPositionsLoading] = useState(true);

//     const [upcomingTransits, setUpcomingTransits] = useState([]);
//     const [upcomingLoading, setUpcomingLoading] = useState(true);

//     // Current positions + key insights — one request, backed by the same
//     // Panchang cache/Prokerala call as the rest of the Panchang/Muhurat
//     // pages (getOrFetchPanchang on the backend), so this costs zero extra
//     // API credits beyond what's already being fetched elsewhere.
//     const fetchPositions = useCallback(async () => {
//         setPositionsLoading(true);
//         try {
//             const res = await getPlanetaryTransit();
//             setPositions(res?.data?.positions || []);
//             setKeyInsights(res?.data?.keyInsights || []);
//         } catch (err) {
//             setPositions([]);
//             setKeyInsights([]);
//         } finally {
//             setPositionsLoading(false);
//         }
//     }, []);

//     // Upcoming transits — computed astronomically + cached on the backend,
//     // not polled from Prokerala. Independent request/loading state from
//     // the positions above since they hit different endpoints.
//     const fetchUpcomingTransits = useCallback(async () => {
//         setUpcomingLoading(true);
//         try {
//             const res = await getUpcomingTransits({ months: 12, limit: 10 });
//             setUpcomingTransits(res?.data || []);
//         } catch (err) {
//             setUpcomingTransits([]);
//         } finally {
//             setUpcomingLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchPositions();
//         fetchUpcomingTransits();
//     }, [fetchPositions, fetchUpcomingTransits]);

//     return (
//         <Box sx={{ bgcolor: '#F8F9FC', minHeight: '100vh' }}>
//             <HeroSection />

//             <Container maxWidth="xl" sx={{ py: 3 }}>
//                 <Stack direction="row" spacing={2.5} alignItems="flex-start">
//                     {/* Left rail: nav list + promo tile, stacked (matches reference) */}
//                     <Stack spacing={0} sx={{ display: { xs: 'none', lg: 'block' } }}>
//                         <SidebarNav />
//                         <SidebarPromo />
//                     </Stack>

//                     <Box sx={{ flex: 1, minWidth: 0 }}>
//                         <TransitTabsBar tab={tab} onChange={(e, val) => setTab(val)} />

//                         {tab !== 0 && (
//                             <Card
//                                 elevation={0}
//                                 sx={{ mt: 2.5, p: 5, borderRadius: 3, border: `1px solid ${THEME.border}`, textAlign: 'center' }}
//                             >
//                                 <Typography sx={{ color: THEME.mutedInk, fontSize: 14 }}>{TABS[tab]} — coming soon</Typography>
//                             </Card>
//                         )}

//                         {tab === 0 && (
//                             <>
//                                 {/* Row 1 — positions table | transit chart | insights column. All three are real now. */}
//                                 <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5} alignItems="stretch" sx={{ mt: 2.5 }}>
//                                     <Box sx={{ flex: '1 1 40%', minWidth: 0 }}>
//                                         <CurrentPositionsTable positions={positions} loading={positionsLoading} />
//                                     </Box>
//                                     <Box sx={{ flex: '1 1 32%', minWidth: 0 }}>
//                                         <TransitChartCard sx={{ height: '100%' }} positions={positions} />
//                                     </Box>
//                                     <Box sx={{ flex: '1 1 28%', minWidth: 0 }}>
//                                         <Stack spacing={2.5}>
//                                             <KeyInsightsCard insights={keyInsights} loading={positionsLoading} />
//                                             <ImportantNoteCard />
//                                         </Stack>
//                                     </Box>
//                                 </Stack>

//                                 {/* Row 2 — upcoming transits | transit impact by area of life. Both real now. */}
//                                 <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5} alignItems="stretch" sx={{ mt: 2.5 }}>
//                                     <Box sx={{ flex: '1 1 60%', minWidth: 0 }}>
//                                         <UpcomingTransitsCard sx={{ height: '100%' }} transits={upcomingTransits} loading={upcomingLoading} />
//                                     </Box>
//                                     <Box sx={{ flex: '1 1 40%', minWidth: 0 }}>
//                                         <LifeImpactCard sx={{ height: '100%' }} />
//                                     </Box>
//                                 </Stack>
//                             </>
//                         )}
//                     </Box>
//                 </Stack>
//             </Container>
//         </Box>
//     );
// }





// 'use client';
// import React, { useState, useEffect, useCallback } from 'react';
// import Image from 'next/image';

// // mui
// import {
//     Box,
//     Container,
//     Stack,
//     Typography,
//     Chip,
//     Card,
//     Tabs,
//     Tab,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     ToggleButton,
//     ToggleButtonGroup
// } from '@mui/material';

// // icons
// import {
//     TbCalendarEvent,
//     TbBuildingChurch,
//     TbClockHour4,
//     TbPlanet,
//     TbChartPie,
//     TbReportAnalytics,
//     TbHeartHandshake,
//     TbWand,
//     TbBook2,
//     TbChevronDown,
//     TbChevronRight,
//     TbArrowRight,
//     TbBulb,
//     TbInfoCircle,
//     TbBriefcase,
//     TbCurrencyRupee,
//     TbHeart,
//     TbHeartbeat,
//     TbSchool
// } from 'react-icons/tb';
// import { FaOm } from 'react-icons/fa';

// // Live data — see PlanetaryTransit() at the bottom of this file for the
// // fetch/loading wiring. CURRENT_POSITIONS/TRANSIT_INSIGHTS/UPCOMING_TRANSITS
// // no longer exist as hardcoded consts; every component below now takes its
// // data as props.
// import { getPlanetaryTransit, getUpcomingTransits } from '@/services/panchang-service';

// // Module-scoped tokens — only used on this Planetary Transit page.
// const THEME = {
//     navy: '#0B1330',
//     navyDeep: '#070C1F',
//     ink: '#1B2A4A',
//     gold: '#FB8B05',
//     border: '#E5E9F8',
//     mutedInk: '#6B7291'
// };

// // Left sidebar — same tool list style as the Panchang & Muhurat page.
// // "Planetary Transit" is marked active since we're on this page.
// const SIDEBAR_ITEMS = [
//     { icon: TbCalendarEvent, label: 'Daily Panchang', href: '#' },
//     { icon: TbBuildingChurch, label: 'Festival & Vrat', href: '#' },
//     { icon: TbClockHour4, label: 'Muhurat', href: '/muhurat' },
//     { icon: TbPlanet, label: 'Planetary Transit', href: '/planetary-transit', active: true },
//     { icon: TbChartPie, label: 'Rashi Phal', href: '#' },
//     { icon: TbReportAnalytics, label: 'Kundali', href: '/kundali-generation' },
//     { icon: TbHeartHandshake, label: 'Compatibility', href: '/kundali-matching' },
//     { icon: TbWand, label: 'Remedies', href: '#' },
//     { icon: TbBook2, label: 'Learn Astrology', href: '#' }
// ];

// // Tab bar — only "Current Transit" is wired up with real content for now;
// // the rest are static placeholders (design only) until later steps.
// const TABS = ['Current Transit', 'Upcoming Transits', 'Retrograde', 'Planetary Calendar', 'Effects by Rashi', 'Conjunctions', 'Historical Transits'];

// // Live "Current Planetary Positions" now comes from GET
// // /panchang/planetary-transit (panchang-service.js -> getPlanetaryTransit).
// // Row shape from the API: { planet, rashi, rashiEn, degree, nakshatra,
// // pada, isRetrograde } — rashi is Prokerala's own display string, rashiEn
// // is the astronomically-normalized English sign name used for grouping
// // (Rashi Wheel) and matching against TRANSIT_INSIGHT_RULES.

// // --- Step 2 data ---------------------------------------------------------

// // 12 signs in natural zodiac order, starting at the top of the wheel and
// // going clockwise (Aries at 12 o'clock) — matches the reference chart.
// const RASHI_ORDER = [
//     { en: 'Aries', sa: 'Mesha' },
//     { en: 'Taurus', sa: 'Vrishabha' },
//     { en: 'Gemini', sa: 'Mithuna' },
//     { en: 'Cancer', sa: 'Karka' },
//     { en: 'Leo', sa: 'Simha' },
//     { en: 'Virgo', sa: 'Kanya' },
//     { en: 'Libra', sa: 'Tula' },
//     { en: 'Scorpio', sa: 'Vrishchika' },
//     { en: 'Sagittarius', sa: 'Dhanu' },
//     { en: 'Capricorn', sa: 'Makara' },
//     { en: 'Aquarius', sa: 'Kumbha' },
//     { en: 'Pisces', sa: 'Meena' }
// ];

// // Same 9 grahas used in the hero banner + positions table — abbreviation,
// // wheel-marker color and relative dot size (used on the Solar System tab).
// const PLANET_META = {
//     Sun: { abbr: 'Su', color: '#FB8B05', size: 22 },
//     Moon: { abbr: 'Mo', color: '#C7CBD8', size: 16 },
//     Mars: { abbr: 'Ma', color: '#C0392B', size: 14 },
//     Mercury: { abbr: 'Me', color: '#9A8F72', size: 13 },
//     Jupiter: { abbr: 'Ju', color: '#D98C3D', size: 19 },
//     Venus: { abbr: 'Ve', color: '#E8C77A', size: 15 },
//     Saturn: { abbr: 'Sa', color: '#B99A63', size: 17 },
//     Rahu: { abbr: 'Ra', color: '#2C3E66', size: 13 },
//     Ketu: { abbr: 'Ke', color: '#8B909E', size: 13 }
// };

// // "Key Transit Insights" — live now, from getPlanetaryTransit()'s
// // keyInsights array (backend: transit-insight-rules.js). Shape:
// // { planet, rashi, isRetrograde, text }.

// const IMPORTANT_NOTE = {
//     text: 'Planetary transits influence tendencies, not certainties. Use this as guidance along with your birth chart for deeper insights.',
//     sanskrit: '\u0917\u094d\u0930\u0939\u093e\u0903 \u092b\u0932\u093e\u0928\u093f \u0926\u0926\u094d\u0924\u094d\u092f\u0947\u0935, \u092a\u0941\u0930\u0941\u0937\u093e\u0930\u094d\u0925\u0902 \u0935\u093f\u0928\u093e \u0915\u093e\u0932\u094b \u0928\u093e\u0964',
//     translation: 'Planets give results, but without effort, time does not.'
// };

// // --- Step 3 data ---------------------------------------------------------
// // "Upcoming Major Transits" is live now, from GET
// // /panchang/planetary-transit/upcoming (panchang-service.js ->
// // getUpcomingTransits). Row shape from the API: { date, planet, fromRashi,
// // toRashi, transit, isRetrograde, impact }.

// // "Transit Impact by Area of Life" — 6-tile grid, icon + label + sub-label.
// const LIFE_AREAS = [
//     { icon: TbBriefcase, label: 'Career', sub: 'Growth & Opportunities', color: '#3B5BDB', bg: '#EEF1FD' },
//     { icon: TbCurrencyRupee, label: 'Finance', sub: 'Wealth & Stability', color: '#E8863B', bg: '#FDF1E8' },
//     { icon: TbHeart, label: 'Relationships', sub: 'Love & Harmony', color: '#D8567A', bg: '#FCEDF1' },
//     { icon: TbHeartbeat, label: 'Health', sub: 'Well-being & Energy', color: '#2E9E5B', bg: '#E9F7EF' },
//     { icon: TbSchool, label: 'Education', sub: 'Learning & Wisdom', color: '#2E7DBD', bg: '#E8F2FB' },
//     { icon: FaOm, label: 'Spirituality', sub: 'Inner Growth', color: '#8355C7', bg: '#F2ECFB' }
// ];

// // Real designed banner (galaxy background + rendered planets + baked-in
// // title/quote/feature-strip text) — same pattern as the Panchang page's
// // HERO_BANNERS (a single pre-made graphic, not a CSS recreation). Save the
// // asset at this exact path. Native ratio is 2172x454 (~4.78:1); aspectRatio
// // keeps it from stretching/cropping oddly at any screen width.
// const HERO_BANNER_SRC = '/images/planetary-transit-hero.png';

// function HeroSection() {
//     return (
//         <Box sx={{ position: 'relative', width: '100%', bgcolor: THEME.navyDeep, overflow: 'hidden' }}>
//             <Box sx={{ position: 'relative', width: '100%', aspectRatio: '2172 / 454' }}>
//                 <Image
//                     src={HERO_BANNER_SRC}
//                     alt="Planetary Transit — Cosmic Movements, Real Life Impact"
//                     fill
//                     priority
//                     style={{ objectFit: 'cover' }}
//                     sizes="100vw"
//                 />
//             </Box>
//         </Box>
//     );
// }

// // Left rail — matches the "Daily Panchang / Muhurat / Planetary Transit /
// // ..." quick-links list from the reference design. Non-active items are
// // href="#" placeholders except where a matching page already exists
// // elsewhere in the app (Muhurat, Kundali, Compatibility).
// function SidebarNav() {
//     return (
//         <Card
//             elevation={0}
//             sx={{
//                 p: 1.5,
//                 borderRadius: 3,
//                 border: `1px solid ${THEME.border}`,
//                 width: 220,
//                 flexShrink: 0,
//                 display: { xs: 'none', lg: 'block' }
//             }}
//         >
//             <Stack spacing={0.5}>
//                 {SIDEBAR_ITEMS.map(({ icon: Icon, label, href, active }) => (
//                     <Stack
//                         key={label}
//                         component="a"
//                         href={href}
//                         direction="row"
//                         spacing={1.5}
//                         alignItems="center"
//                         sx={{
//                             px: 1.5,
//                             py: 1.1,
//                             borderRadius: 2,
//                             textDecoration: 'none',
//                             cursor: 'pointer',
//                             bgcolor: active ? THEME.navy : 'transparent',
//                             color: active ? '#FFFFFF' : THEME.ink,
//                             '&:hover': { bgcolor: active ? THEME.navy : '#F5F6FA' }
//                         }}
//                     >
//                         <Icon size={17} color={active ? THEME.gold : THEME.mutedInk} />
//                         <Typography sx={{ fontSize: 13.5, fontWeight: active ? 700 : 600 }}>{label}</Typography>
//                     </Stack>
//                 ))}
//             </Stack>
//         </Card>
//     );
// }

// // Promo card under the sidebar nav — "Align with the Cosmos, Live in
// // Harmony" image tile from the reference design. Swap SIDEBAR_PROMO_SRC for
// // a real asset path once it's uploaded to /public/images.
// const SIDEBAR_PROMO_SRC = '/images/planetary-transit-sidebar-promo.jpg';

// function SidebarPromo() {
//     return (
//         <Card
//             elevation={0}
//             sx={{
//                 mt: 2,
//                 borderRadius: 3,
//                 overflow: 'hidden',
//                 border: `1px solid ${THEME.border}`,
//                 width: 220,
//                 flexShrink: 0,
//                 display: { xs: 'none', lg: 'block' },
//                 position: 'relative',
//                 height: 180
//             }}
//         >
//             <Image src={SIDEBAR_PROMO_SRC} alt="Align with the Cosmos, Live in Harmony" fill style={{ objectFit: 'cover' }} />
//             <Box
//                 sx={{
//                     position: 'absolute',
//                     inset: 0,
//                     background: 'linear-gradient(180deg, rgba(11,19,48,0) 40%, rgba(11,19,48,0.75) 100%)',
//                     display: 'flex',
//                     alignItems: 'flex-end',
//                     p: 2
//                 }}
//             >
//                 <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>
//                     Align with the Cosmos, Live in Harmony.
//                 </Typography>
//             </Box>
//         </Card>
//     );
// }

// // Tab bar + static date selector shown above the tab content.
// function TransitTabsBar({ tab, onChange }) {
//     return (
//         <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5}>
//             <Tabs
//                 value={tab}
//                 onChange={onChange}
//                 variant="scrollable"
//                 scrollButtons="auto"
//                 sx={{
//                     minHeight: 40,
//                     '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 13.5, minHeight: 40, color: THEME.mutedInk },
//                     '& .Mui-selected': { color: `${THEME.navy} !important` },
//                     '& .MuiTabs-indicator': { bgcolor: THEME.gold, height: 3, borderRadius: 2 }
//                 }}
//             >
//                 {TABS.map((label) => (
//                     <Tab key={label} label={label} />
//                 ))}
//             </Tabs>

//             <Stack
//                 direction="row"
//                 spacing={1}
//                 alignItems="center"
//                 sx={{ border: `1px solid ${THEME.border}`, borderRadius: 2, px: 1.5, py: 0.75, alignSelf: { xs: 'flex-start', sm: 'auto' } }}
//             >
//                 <TbCalendarEvent size={16} color={THEME.mutedInk} />
//                 <Typography sx={{ fontSize: 13, fontWeight: 600, color: THEME.ink }}>
//                     {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
//                 </Typography>
//                 <TbChevronDown size={14} color={THEME.mutedInk} />
//             </Stack>
//         </Stack>
//     );
// }

// // "Current Planetary Positions" table — live data from getPlanetaryTransit()
// // (see PlanetaryTransit() at the bottom of this file).
// function CurrentPositionsTable({ positions, loading }) {
//     return (
//         <Card elevation={0} sx={{ mt: 2.5, borderRadius: 3, border: `1px solid ${THEME.border}` }}>
//             <Box sx={{ p: 2.5, pb: 1.5 }}>
//                 <Typography sx={{ fontWeight: 700, fontSize: 16, color: THEME.ink }}>Current Planetary Positions</Typography>
//                 <Typography sx={{ fontSize: 12.5, color: THEME.mutedInk, mt: 0.25 }}>
//                     Real-time position of planets (based on sidereal/Lahiri Ayanamsa)
//                 </Typography>
//             </Box>
//             <TableContainer sx={{ overflowX: 'auto' }}>
//                 <Table size="small">
//                     <TableHead>
//                         <TableRow>
//                             {['Planet', 'Sign (Rashi)', 'Degree', 'Nakshatra', 'Status'].map((head) => (
//                                 <TableCell key={head} sx={{ fontWeight: 700, fontSize: 12.5, color: THEME.mutedInk, borderColor: THEME.border }}>
//                                     {head}
//                                 </TableCell>
//                             ))}
//                         </TableRow>
//                     </TableHead>
//                     <TableBody>
//                         {loading && (
//                             <TableRow>
//                                 <TableCell colSpan={5} sx={{ textAlign: 'center', fontSize: 13, color: THEME.mutedInk, border: 0, py: 3 }}>
//                                     Loading live positions...
//                                 </TableCell>
//                             </TableRow>
//                         )}
//                         {!loading && positions.length === 0 && (
//                             <TableRow>
//                                 <TableCell colSpan={5} sx={{ textAlign: 'center', fontSize: 13, color: THEME.mutedInk, border: 0, py: 3 }}>
//                                     Planetary positions are temporarily unavailable.
//                                 </TableCell>
//                             </TableRow>
//                         )}
//                         {!loading && positions.map((row) => (
//                             <TableRow key={row.planet} sx={{ '&:last-child td': { borderBottom: 0 } }}>
//                                 <TableCell sx={{ fontSize: 13.5, fontWeight: 600, color: THEME.ink, borderColor: THEME.border }}>
//                                     {row.planet}
//                                 </TableCell>
//                                 <TableCell sx={{ fontSize: 13.5, color: THEME.ink, borderColor: THEME.border }}>
//                                     {row.rashi ? `${row.rashiEn || row.rashi}${row.rashi && row.rashiEn && row.rashi !== row.rashiEn ? ` (${row.rashi})` : ''}` : row.rashiEn}
//                                 </TableCell>
//                                 <TableCell sx={{ fontSize: 13.5, color: THEME.ink, borderColor: THEME.border }}>{row.degree}</TableCell>
//                                 <TableCell sx={{ fontSize: 13.5, color: THEME.ink, borderColor: THEME.border }}>{row.nakshatra}</TableCell>
//                                 <TableCell sx={{ borderColor: THEME.border }}>
//                                     <Chip
//                                         label={row.isRetrograde ? 'Retrograde' : 'Direct'}
//                                         size="small"
//                                         sx={{
//                                             fontWeight: 700,
//                                             fontSize: 11.5,
//                                             bgcolor: row.isRetrograde ? '#F7E9E7' : '#E7F5EC',
//                                             color: row.isRetrograde ? '#B4544A' : '#2E7D4F'
//                                         }}
//                                     />
//                                 </TableCell>
//                             </TableRow>
//                         ))}
//                     </TableBody>
//                 </Table>
//             </TableContainer>
//         </Card>
//     );
// }

// // Polar -> cartesian helper for the wheel's radial lines, labels & markers.
// function pointOnCircle(cx, cy, r, angleDeg) {
//     const rad = (angleDeg * Math.PI) / 180;
//     return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
// }

// // Vedic "Rashi Chakra" — 12-sector wheel, Aries at the top going clockwise.
// // Built from the live `positions` prop so the graha markers always match
// // the table above; no hand-placed pixel coordinates.
// function RashiWheel({ positions }) {
//     const size = 320;
//     const cx = size / 2;
//     const cy = size / 2;
//     const outerR = 138;
//     const innerR = 34;
//     const labelR = 100;

//     // Group today's planets by the sign they currently occupy (rashiEn is
//     // the astronomically-normalized English name — see resolveEnglishRashi
//     // on the backend — so this grouping doesn't depend on Prokerala's raw
//     // rashi string format).
//     const bySign = RASHI_ORDER.map(() => []);
//     positions.forEach((row) => {
//         const idx = RASHI_ORDER.findIndex((r) => r.en === row.rashiEn);
//         if (idx !== -1 && PLANET_META[row.planet]) bySign[idx].push(row.planet);
//     });

//     return (
//         <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
//             <svg width="100%" height="auto" viewBox={`0 0 ${size} ${size}`} style={{ maxWidth: 300 }}>
//                 <circle cx={cx} cy={cy} r={outerR} fill="#FFF8EE" stroke={THEME.border} strokeWidth="1.5" />
//                 <circle cx={cx} cy={cy} r={innerR} fill="#FFFFFF" stroke={THEME.border} strokeWidth="1.5" />

//                 {RASHI_ORDER.map((_, i) => {
//                     const boundaryAngle = -90 - 15 + i * 30;
//                     const inner = pointOnCircle(cx, cy, innerR, boundaryAngle);
//                     const outer = pointOnCircle(cx, cy, outerR, boundaryAngle);
//                     return (
//                         <line
//                             key={`line-${i}`}
//                             x1={inner.x}
//                             y1={inner.y}
//                             x2={outer.x}
//                             y2={outer.y}
//                             stroke={THEME.border}
//                             strokeWidth="1"
//                         />
//                     );
//                 })}

//                 {RASHI_ORDER.map((rashi, i) => {
//                     const angle = -90 + i * 30;
//                     const label = pointOnCircle(cx, cy, labelR, angle);
//                     const planets = bySign[i];
//                     return (
//                         <React.Fragment key={rashi.en}>
//                             <text x={label.x} y={label.y - 3} textAnchor="middle" fontSize="9" fontWeight="700" fill={THEME.ink}>
//                                 {rashi.en}
//                             </text>
//                             <text x={label.x} y={label.y + 9} textAnchor="middle" fontSize="7.5" fill={THEME.mutedInk}>
//                                 {rashi.sa}
//                             </text>

//                             {planets.map((planet, j) => {
//                                 const offset = planets.length > 1 ? (j === 0 ? -9 : 9) : 0;
//                                 const pos = pointOnCircle(cx, cy, outerR - 20, angle + offset);
//                                 const meta = PLANET_META[planet];
//                                 return (
//                                     <g key={planet}>
//                                         <circle cx={pos.x} cy={pos.y} r="9" fill={meta.color} stroke="#FFFFFF" strokeWidth="1.5" />
//                                         <text x={pos.x} y={pos.y + 3} textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#FFFFFF">
//                                             {meta.abbr}
//                                         </text>
//                                     </g>
//                                 );
//                             })}
//                         </React.Fragment>
//                     );
//                 })}

//                 <circle cx={cx} cy={cy} r={innerR - 6} fill={THEME.gold} opacity="0.12" />
//                 <text x={cx} y={cy + 8} textAnchor="middle" fontSize="20" fill={THEME.gold}>
//                     {'\u0950'}
//                 </text>
//             </svg>
//         </Box>
//     );
// }

// // Compact "Solar System" alternative to the Rashi Wheel — same grahas as
// // the hero banner, laid out on a single ecliptic line with today's live
// // sign underneath each one.
// function SolarSystemStrip({ positions }) {
//     return (
//         <Box
//             sx={{
//                 bgcolor: THEME.navyDeep,
//                 borderRadius: 2.5,
//                 py: 3,
//                 px: 1,
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 flexWrap: 'wrap',
//                 rowGap: 2
//             }}
//         >
//             {positions.filter((row) => PLANET_META[row.planet]).map((row) => {
//                 const meta = PLANET_META[row.planet];
//                 return (
//                     <Stack key={row.planet} spacing={0.5} alignItems="center" sx={{ minWidth: 34 }}>
//                         <Box
//                             sx={{
//                                 width: meta.size,
//                                 height: meta.size,
//                                 borderRadius: '50%',
//                                 bgcolor: meta.color,
//                                 boxShadow: `0 0 8px ${meta.color}99`
//                             }}
//                         />
//                         <Typography sx={{ color: '#FFFFFF', fontSize: 10.5, fontWeight: 700 }}>{row.planet}</Typography>
//                         <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 9 }}>{row.rashiEn || row.rashi}</Typography>
//                     </Stack>
//                 );
//             })}
//         </Box>
//     );
// }

// // "Planetary Transit Chart" card — Rashi Wheel / Solar System toggle, same
// // spot the reference design uses it (middle column of row 1).
// function TransitChartCard({ sx, positions }) {
//     const [view, setView] = useState('rashi');
//     return (
//         <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${THEME.border}`, p: 2.5, ...sx }}>
//             <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
//                 <Typography sx={{ fontWeight: 700, fontSize: 16, color: THEME.ink }}>Planetary Transit Chart</Typography>
//             </Stack>

//             <ToggleButtonGroup
//                 value={view}
//                 exclusive
//                 onChange={(e, val) => val && setView(val)}
//                 size="small"
//                 fullWidth
//                 sx={{
//                     mb: 1,
//                     '& .MuiToggleButton-root': {
//                         textTransform: 'none',
//                         fontWeight: 600,
//                         fontSize: 12.5,
//                         color: THEME.mutedInk,
//                         borderColor: THEME.border
//                     },
//                     '& .Mui-selected': {
//                         bgcolor: `${THEME.navy} !important`,
//                         color: '#FFFFFF !important'
//                     }
//                 }}
//             >
//                 <ToggleButton value="rashi">Rashi Wheel</ToggleButton>
//                 <ToggleButton value="solar">Solar System</ToggleButton>
//             </ToggleButtonGroup>

//             {view === 'rashi' ? <RashiWheel positions={positions} /> : <SolarSystemStrip positions={positions} />}
//         </Card>
//     );
// }

// // "Key Transit Insights" — right column, top card. One row per entry in
// // the live `insights` prop (getPlanetaryTransit()'s keyInsights array),
// // with a colored dot, the headline and a chevron.
// function KeyInsightsCard({ sx, insights, loading }) {
//     return (
//         <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${THEME.border}`, p: 2.5, ...sx }}>
//             <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
//                 <TbBulb size={18} color={THEME.gold} />
//                 <Typography sx={{ fontWeight: 700, fontSize: 16, color: THEME.ink }}>Key Transit Insights</Typography>
//             </Stack>
//             <Stack spacing={1.25}>
//                 {loading && (
//                     <Typography sx={{ fontSize: 12.5, color: THEME.mutedInk, textAlign: 'center', py: 1 }}>Loading...</Typography>
//                 )}
//                 {!loading && insights.length === 0 && (
//                     <Typography sx={{ fontSize: 12.5, color: THEME.mutedInk, textAlign: 'center', py: 1 }}>
//                         Insights are temporarily unavailable.
//                     </Typography>
//                 )}
//                 {!loading && insights.map(({ planet, rashi, text }) => (
//                     <Stack
//                         key={planet}
//                         direction="row"
//                         spacing={1.25}
//                         alignItems="flex-start"
//                         sx={{
//                             p: 1.25,
//                             borderRadius: 2,
//                             bgcolor: '#F7F8FC',
//                             cursor: 'pointer',
//                             '&:hover': { bgcolor: '#EFF1F8' }
//                         }}
//                     >
//                         <Box
//                             sx={{
//                                 mt: 0.4,
//                                 width: 8,
//                                 height: 8,
//                                 borderRadius: '50%',
//                                 flexShrink: 0,
//                                 bgcolor: PLANET_META[planet]?.color || THEME.gold
//                             }}
//                         />
//                         <Box sx={{ flex: 1 }}>
//                             <Typography sx={{ fontWeight: 700, fontSize: 13, color: THEME.ink }}>
//                                 {planet} in {rashi}
//                             </Typography>
//                             <Typography sx={{ fontSize: 12, color: THEME.mutedInk, mt: 0.25 }}>{text}</Typography>
//                         </Box>
//                         <TbChevronRight size={16} color={THEME.mutedInk} style={{ marginTop: 4, flexShrink: 0 }} />
//                     </Stack>
//                 ))}
//             </Stack>
//         </Card>
//     );
// }

// // "Important Note" — right column, bottom card. Disclaimer + Sanskrit shloka
// // with its translation, in the same warm/gold tone as the hero quote box.
// function ImportantNoteCard({ sx }) {
//     return (
//         <Card
//             elevation={0}
//             sx={{
//                 borderRadius: 3,
//                 border: `1px dashed ${THEME.gold}66`,
//                 bgcolor: '#FFF8EC',
//                 p: 2.5,
//                 ...sx
//             }}
//         >
//             <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
//                 <TbInfoCircle size={18} color={THEME.gold} />
//                 <Typography sx={{ fontWeight: 700, fontSize: 15, color: THEME.ink }}>Important Note</Typography>
//             </Stack>
//             <Typography sx={{ fontSize: 12.5, color: THEME.ink, lineHeight: 1.6 }}>{IMPORTANT_NOTE.text}</Typography>

//             <Stack spacing={0.5} sx={{ mt: 1.75, pt: 1.75, borderTop: `1px dashed ${THEME.gold}66` }}>
//                 <Typography sx={{ fontStyle: 'italic', fontWeight: 600, fontSize: 13, color: THEME.gold, textAlign: 'center' }}>
//                     {IMPORTANT_NOTE.sanskrit}
//                 </Typography>
//                 <Typography sx={{ fontSize: 11.5, color: THEME.mutedInk, textAlign: 'center' }}>
//                     {IMPORTANT_NOTE.translation}
//                 </Typography>
//             </Stack>
//         </Card>
//     );
// }

// // "Upcoming Major Transits" — row 2, left. Same table styling as
// // CurrentPositionsTable, plus a gold "View All" link in the header. Data
// // comes from the live `transits` prop (getUpcomingTransits()).
// function UpcomingTransitsCard({ sx, transits, loading }) {
//     return (
//         <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${THEME.border}`, ...sx }}>
//             <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2.5, pb: 1.5 }}>
//                 <Typography sx={{ fontWeight: 700, fontSize: 16, color: THEME.ink }}>Upcoming Major Transits</Typography>
//                 <Stack
//                     direction="row"
//                     spacing={0.5}
//                     alignItems="center"
//                     component="a"
//                     href="#"
//                     sx={{ color: THEME.gold, fontWeight: 700, fontSize: 12.5, textDecoration: 'none', flexShrink: 0 }}
//                 >
//                     <span>View All</span>
//                     <TbArrowRight size={14} />
//                 </Stack>
//             </Stack>
//             <TableContainer sx={{ overflowX: 'auto' }}>
//                 <Table size="small">
//                     <TableHead>
//                         <TableRow>
//                             {['Date', 'Planet', 'Transit', 'Impact'].map((head) => (
//                                 <TableCell key={head} sx={{ fontWeight: 700, fontSize: 12.5, color: THEME.mutedInk, borderColor: THEME.border }}>
//                                     {head}
//                                 </TableCell>
//                             ))}
//                         </TableRow>
//                     </TableHead>
//                     <TableBody>
//                         {loading && (
//                             <TableRow>
//                                 <TableCell colSpan={4} sx={{ textAlign: 'center', fontSize: 13, color: THEME.mutedInk, border: 0, py: 3 }}>
//                                     Loading upcoming transits...
//                                 </TableCell>
//                             </TableRow>
//                         )}
//                         {!loading && transits.length === 0 && (
//                             <TableRow>
//                                 <TableCell colSpan={4} sx={{ textAlign: 'center', fontSize: 13, color: THEME.mutedInk, border: 0, py: 3 }}>
//                                     Upcoming transits are temporarily unavailable.
//                                 </TableCell>
//                             </TableRow>
//                         )}
//                         {!loading && transits.map((row) => (
//                             <TableRow key={`${row.date}-${row.planet}`} sx={{ '&:last-child td': { borderBottom: 0 } }}>
//                                 <TableCell sx={{ fontSize: 13, color: THEME.ink, borderColor: THEME.border, whiteSpace: 'nowrap' }}>
//                                     {new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
//                                 </TableCell>
//                                 <TableCell sx={{ borderColor: THEME.border }}>
//                                     <Stack direction="row" spacing={1} alignItems="center">
//                                         <Box
//                                             sx={{
//                                                 width: 8,
//                                                 height: 8,
//                                                 borderRadius: '50%',
//                                                 flexShrink: 0,
//                                                 bgcolor: PLANET_META[row.planet]?.color || THEME.gold
//                                             }}
//                                         />
//                                         <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: THEME.ink }}>{row.planet}</Typography>
//                                     </Stack>
//                                 </TableCell>
//                                 <TableCell sx={{ fontSize: 13, color: THEME.ink, borderColor: THEME.border, whiteSpace: 'nowrap' }}>
//                                     {row.transit}
//                                 </TableCell>
//                                 <TableCell sx={{ fontSize: 13, color: THEME.mutedInk, borderColor: THEME.border }}>{row.impact}</TableCell>
//                             </TableRow>
//                         ))}
//                     </TableBody>
//                 </Table>
//             </TableContainer>
//         </Card>
//     );
// }

// // "Transit Impact by Area of Life" — row 2, right. 6-tile grid built from
// // LIFE_AREAS; 3 columns on wide screens, 2 on small ones.
// function LifeImpactCard({ sx }) {
//     return (
//         <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${THEME.border}`, p: 2.5, ...sx }}>
//             <Typography sx={{ fontWeight: 700, fontSize: 16, color: THEME.ink, mb: 1.75 }}>Transit Impact by Area of Life</Typography>
//             <Box
//                 sx={{
//                     display: 'grid',
//                     gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
//                     gap: 1.5
//                 }}
//             >
//                 {LIFE_AREAS.map(({ icon: Icon, label, sub, color, bg }) => (
//                     <Stack
//                         key={label}
//                         spacing={0.75}
//                         sx={{
//                             p: 1.5,
//                             borderRadius: 2.5,
//                             bgcolor: bg,
//                             cursor: 'pointer',
//                             transition: 'transform 0.15s ease',
//                             '&:hover': { transform: 'translateY(-2px)' }
//                         }}
//                     >
//                         <Box
//                             sx={{
//                                 width: 32,
//                                 height: 32,
//                                 borderRadius: '50%',
//                                 bgcolor: '#FFFFFF',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center'
//                             }}
//                         >
//                             <Icon size={16} color={color} />
//                         </Box>
//                         <Box>
//                             <Typography sx={{ fontWeight: 700, fontSize: 13, color: THEME.ink }}>{label}</Typography>
//                             <Typography sx={{ fontSize: 10.5, color: THEME.mutedInk, lineHeight: 1.3 }}>{sub}</Typography>
//                         </Box>
//                     </Stack>
//                 ))}
//             </Box>
//         </Card>
//     );
// }

// export default function PlanetaryTransit() {
//     const [tab, setTab] = useState(0);

//     const [positions, setPositions] = useState([]);
//     const [keyInsights, setKeyInsights] = useState([]);
//     const [positionsLoading, setPositionsLoading] = useState(true);

//     const [upcomingTransits, setUpcomingTransits] = useState([]);
//     const [upcomingLoading, setUpcomingLoading] = useState(true);

//     // Current positions + key insights — one request, backed by the same
//     // Panchang cache/Prokerala call as the rest of the Panchang/Muhurat
//     // pages (getOrFetchPanchang on the backend), so this costs zero extra
//     // API credits beyond what's already being fetched elsewhere.
//     const fetchPositions = useCallback(async () => {
//         setPositionsLoading(true);
//         try {
//             const res = await getPlanetaryTransit();
//             setPositions(res?.data?.positions || []);
//             setKeyInsights(res?.data?.keyInsights || []);
//         } catch (err) {
//             setPositions([]);
//             setKeyInsights([]);
//         } finally {
//             setPositionsLoading(false);
//         }
//     }, []);

//     // Upcoming transits — computed astronomically + cached on the backend,
//     // not polled from Prokerala. Independent request/loading state from
//     // the positions above since they hit different endpoints.
//     const fetchUpcomingTransits = useCallback(async () => {
//         setUpcomingLoading(true);
//         try {
//             const res = await getUpcomingTransits({ months: 12, limit: 10 });
//             setUpcomingTransits(res?.data || []);
//         } catch (err) {
//             setUpcomingTransits([]);
//         } finally {
//             setUpcomingLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchPositions();
//         fetchUpcomingTransits();
//     }, [fetchPositions, fetchUpcomingTransits]);

//     return (
//         <Box sx={{ bgcolor: '#F8F9FC', minHeight: '100vh' }}>
//             <HeroSection />

//             <Container maxWidth="xl" sx={{ py: 3 }}>
//                 <Stack direction="row" spacing={2.5} alignItems="flex-start">
//                     {/* Left rail: nav list + promo tile, stacked (matches reference) */}
//                     <Stack spacing={0} sx={{ display: { xs: 'none', lg: 'block' } }}>
//                         <SidebarNav />
//                         <SidebarPromo />
//                     </Stack>

//                     <Box sx={{ flex: 1, minWidth: 0 }}>
//                         <TransitTabsBar tab={tab} onChange={(e, val) => setTab(val)} />

//                         {tab !== 0 && (
//                             <Card
//                                 elevation={0}
//                                 sx={{ mt: 2.5, p: 5, borderRadius: 3, border: `1px solid ${THEME.border}`, textAlign: 'center' }}
//                             >
//                                 <Typography sx={{ color: THEME.mutedInk, fontSize: 14 }}>{TABS[tab]} — coming soon</Typography>
//                             </Card>
//                         )}

//                         {tab === 0 && (
//                             <>
//                                 {/* Row 1 — positions table | transit chart | insights column. All three are real now. */}
//                                 <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5} alignItems="stretch" sx={{ mt: 2.5 }}>
//                                     <Box sx={{ flex: '1 1 40%', minWidth: 0 }}>
//                                         <CurrentPositionsTable positions={positions} loading={positionsLoading} />
//                                     </Box>
//                                     <Box sx={{ flex: '1 1 32%', minWidth: 0 }}>
//                                         <TransitChartCard sx={{ height: '100%' }} positions={positions} />
//                                     </Box>
//                                     <Box sx={{ flex: '1 1 28%', minWidth: 0 }}>
//                                         <Stack spacing={2.5}>
//                                             <KeyInsightsCard insights={keyInsights} loading={positionsLoading} />
//                                             <ImportantNoteCard />
//                                         </Stack>
//                                     </Box>
//                                 </Stack>

//                                 {/* Row 2 — upcoming transits | transit impact by area of life. Both real now. */}
//                                 <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5} alignItems="stretch" sx={{ mt: 2.5 }}>
//                                     <Box sx={{ flex: '1 1 60%', minWidth: 0 }}>
//                                         <UpcomingTransitsCard sx={{ height: '100%' }} transits={upcomingTransits} loading={upcomingLoading} />
//                                     </Box>
//                                     <Box sx={{ flex: '1 1 40%', minWidth: 0 }}>
//                                         <LifeImpactCard sx={{ height: '100%' }} />
//                                     </Box>
//                                 </Stack>
//                             </>
//                         )}
//                     </Box>
//                 </Stack>
//             </Container>
//         </Box>
//     );
// }


// // Place at: src/components/_main/planetary-transit/index.js
// // Both build rounds are done: hero banner, sidebar, tabs, Current
// // Planetary Positions table, Planetary Transit Chart (Rashi Wheel / Solar
// // System), Key Transit Insights, Important Note, Upcoming Major Transits
// // and Transit Impact by Area of Life. All sample data (CURRENT_POSITIONS,
// // UPCOMING_TRANSITS, TRANSIT_INSIGHTS) is static — swap for the real
// // ephemeris/API feed when it's ready; the components don't need to change,
// // just the data shape they're fed.

// 'use client';
// import React, { useState } from 'react';
// import Image from 'next/image';

// // mui
// import {
//     Box,
//     Container,
//     Stack,
//     Typography,
//     Chip,
//     Card,
//     Tabs,
//     Tab,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     ToggleButton,
//     ToggleButtonGroup
// } from '@mui/material';

// // icons
// import {
//     TbCalendarEvent,
//     TbBuildingChurch,
//     TbClockHour4,
//     TbPlanet,
//     TbChartPie,
//     TbReportAnalytics,
//     TbHeartHandshake,
//     TbWand,
//     TbBook2,
//     TbChevronDown,
//     TbChevronRight,
//     TbArrowRight,
//     TbBulb,
//     TbInfoCircle,
//     TbBriefcase,
//     TbCurrencyRupee,
//     TbHeart,
//     TbHeartbeat,
//     TbSchool
// } from 'react-icons/tb';
// import { FaOm } from 'react-icons/fa';

// // Module-scoped tokens — only used on this Planetary Transit page.
// const THEME = {
//     navy: '#0B1330',
//     navyDeep: '#070C1F',
//     ink: '#1B2A4A',
//     gold: '#FB8B05',
//     border: '#E5E9F8',
//     mutedInk: '#6B7291'
// };

// // Left sidebar — same tool list style as the Panchang & Muhurat page.
// // "Planetary Transit" is marked active since we're on this page.
// const SIDEBAR_ITEMS = [
//     { icon: TbCalendarEvent, label: 'Daily Panchang', href: '#' },
//     { icon: TbBuildingChurch, label: 'Festival & Vrat', href: '#' },
//     { icon: TbClockHour4, label: 'Muhurat', href: '/muhurat' },
//     { icon: TbPlanet, label: 'Planetary Transit', href: '/planetary-transit', active: true },
//     { icon: TbChartPie, label: 'Rashi Phal', href: '#' },
//     { icon: TbReportAnalytics, label: 'Kundali', href: '/kundali-generation' },
//     { icon: TbHeartHandshake, label: 'Compatibility', href: '/kundali-matching' },
//     { icon: TbWand, label: 'Remedies', href: '#' },
//     { icon: TbBook2, label: 'Learn Astrology', href: '#' }
// ];

// // Tab bar — only "Current Transit" is wired up with real content for now;
// // the rest are static placeholders (design only) until later steps.
// const TABS = ['Current Transit', 'Upcoming Transits', 'Retrograde', 'Planetary Calendar', 'Effects by Rashi', 'Conjunctions', 'Historical Transits'];

// // Static sample data — matches the shape the real API response will have
// // (planet, sign/rashi, degree, nakshatra, status). Swap for a live fetch
// // once the backend endpoint is ready.
// const CURRENT_POSITIONS = [
//     { planet: 'Sun', sign: 'Aries (Mesha)', degree: "4\u00b0 12'", nakshatra: 'Ashwini', status: 'Direct' },
//     { planet: 'Moon', sign: 'Cancer (Karka)', degree: "27\u00b0 03'", nakshatra: 'Ashlesha', status: 'Direct' },
//     { planet: 'Mars', sign: 'Leo (Simha)', degree: "16\u00b0 28'", nakshatra: 'Purva Phalguni', status: 'Direct' },
//     { planet: 'Mercury', sign: 'Taurus (Vrishabha)', degree: "2\u00b0 11'", nakshatra: 'Krittika', status: 'Direct' },
//     { planet: 'Jupiter', sign: 'Gemini (Mithuna)', degree: "22\u00b0 46'", nakshatra: 'Punarvasu', status: 'Direct' },
//     { planet: 'Venus', sign: 'Pisces (Meena)', degree: "18\u00b0 19'", nakshatra: 'Revati', status: 'Direct' },
//     { planet: 'Saturn', sign: 'Aquarius (Kumbha)', degree: "10\u00b0 34'", nakshatra: 'Shatabhisha', status: 'Direct' },
//     { planet: 'Rahu', sign: 'Pisces (Meena)', degree: "3\u00b0 21'", nakshatra: 'Uttara Bhadrapada', status: 'Retrograde' },
//     { planet: 'Ketu', sign: 'Virgo (Kanya)', degree: "3\u00b0 21'", nakshatra: 'Uttara Phalguni', status: 'Retrograde' }
// ];

// // --- Step 2 data ---------------------------------------------------------

// // 12 signs in natural zodiac order, starting at the top of the wheel and
// // going clockwise (Aries at 12 o'clock) — matches the reference chart.
// const RASHI_ORDER = [
//     { en: 'Aries', sa: 'Mesha' },
//     { en: 'Taurus', sa: 'Vrishabha' },
//     { en: 'Gemini', sa: 'Mithuna' },
//     { en: 'Cancer', sa: 'Karka' },
//     { en: 'Leo', sa: 'Simha' },
//     { en: 'Virgo', sa: 'Kanya' },
//     { en: 'Libra', sa: 'Tula' },
//     { en: 'Scorpio', sa: 'Vrishchika' },
//     { en: 'Sagittarius', sa: 'Dhanu' },
//     { en: 'Capricorn', sa: 'Makara' },
//     { en: 'Aquarius', sa: 'Kumbha' },
//     { en: 'Pisces', sa: 'Meena' }
// ];

// // Same 9 grahas used in the hero banner + positions table — abbreviation,
// // wheel-marker color and relative dot size (used on the Solar System tab).
// const PLANET_META = {
//     Sun: { abbr: 'Su', color: '#FB8B05', size: 22 },
//     Moon: { abbr: 'Mo', color: '#C7CBD8', size: 16 },
//     Mars: { abbr: 'Ma', color: '#C0392B', size: 14 },
//     Mercury: { abbr: 'Me', color: '#9A8F72', size: 13 },
//     Jupiter: { abbr: 'Ju', color: '#D98C3D', size: 19 },
//     Venus: { abbr: 'Ve', color: '#E8C77A', size: 15 },
//     Saturn: { abbr: 'Sa', color: '#B99A63', size: 17 },
//     Rahu: { abbr: 'Ra', color: '#2C3E66', size: 13 },
//     Ketu: { abbr: 'Ke', color: '#8B909E', size: 13 }
// };

// // 4 headline call-outs — one per "special" graha (Jupiter/Saturn/Rahu/Ketu)
// // currently transiting, matching the reference "Key Transit Insights" list.
// const TRANSIT_INSIGHTS = [
//     { planet: 'Jupiter', sign: 'Gemini', text: 'Favors learning, communication and new opportunities.' },
//     { planet: 'Saturn', sign: 'Aquarius', text: 'Focus on discipline, long-term goals and inner growth.' },
//     { planet: 'Rahu', sign: 'Pisces', text: 'Brings spiritual inclination, imagination and karmic shifts.' },
//     { planet: 'Ketu', sign: 'Virgo', text: 'Encourages detachment and analytical thinking.' }
// ];

// const IMPORTANT_NOTE = {
//     text: 'Planetary transits influence tendencies, not certainties. Use this as guidance along with your birth chart for deeper insights.',
//     sanskrit: '\u0917\u094d\u0930\u0939\u093e\u0903 \u092b\u0932\u093e\u0928\u093f \u0926\u0926\u094d\u0924\u094d\u092f\u0947\u0935, \u092a\u0941\u0930\u0941\u0937\u093e\u0930\u094d\u0925\u0902 \u0935\u093f\u0928\u093e \u0915\u093e\u0932\u094b \u0928\u093e\u0964',
//     translation: 'Planets give results, but without effort, time does not.'
// };

// // --- Step 3 data ---------------------------------------------------------

// // "Upcoming Major Transits" — static sample rows; wire to the same
// // ephemeris feed as CURRENT_POSITIONS once it's available.
// const UPCOMING_TRANSITS = [
//     { date: '26 May 2026', planet: 'Mercury', transit: 'Enters Gemini', impact: 'Improved communication, business growth' },
//     { date: '01 Jun 2026', planet: 'Venus', transit: 'Enters Aries', impact: 'Passion, creativity, new relationships' },
//     { date: '14 Jun 2026', planet: 'Mars', transit: 'Enters Virgo', impact: 'Energy towards practical work' },
//     { date: '29 Jun 2026', planet: 'Jupiter', transit: 'Enters Cancer', impact: 'Emotional growth, family blessings' },
//     { date: '17 Jul 2026', planet: 'Saturn', transit: 'Retrograde (Aquarius)', impact: 'Re-evaluate goals, patience required' }
// ];

// // "Transit Impact by Area of Life" — 6-tile grid, icon + label + sub-label.
// const LIFE_AREAS = [
//     { icon: TbBriefcase, label: 'Career', sub: 'Growth & Opportunities', color: '#3B5BDB', bg: '#EEF1FD' },
//     { icon: TbCurrencyRupee, label: 'Finance', sub: 'Wealth & Stability', color: '#E8863B', bg: '#FDF1E8' },
//     { icon: TbHeart, label: 'Relationships', sub: 'Love & Harmony', color: '#D8567A', bg: '#FCEDF1' },
//     { icon: TbHeartbeat, label: 'Health', sub: 'Well-being & Energy', color: '#2E9E5B', bg: '#E9F7EF' },
//     { icon: TbSchool, label: 'Education', sub: 'Learning & Wisdom', color: '#2E7DBD', bg: '#E8F2FB' },
//     { icon: FaOm, label: 'Spirituality', sub: 'Inner Growth', color: '#8355C7', bg: '#F2ECFB' }
// ];

// // Real designed banner (galaxy background + rendered planets + baked-in
// // title/quote/feature-strip text) — same pattern as the Panchang page's
// // HERO_BANNERS (a single pre-made graphic, not a CSS recreation). Save the
// // asset at this exact path. Native ratio is 2172x454 (~4.78:1); aspectRatio
// // keeps it from stretching/cropping oddly at any screen width.
// const HERO_BANNER_SRC = '/images/planetary-transit-hero.png';

// function HeroSection() {
//     return (
//         <Box sx={{ position: 'relative', width: '100%', bgcolor: THEME.navyDeep, overflow: 'hidden' }}>
//             <Box sx={{ position: 'relative', width: '100%', aspectRatio: '2172 / 454' }}>
//                 <Image
//                     src={HERO_BANNER_SRC}
//                     alt="Planetary Transit — Cosmic Movements, Real Life Impact"
//                     fill
//                     priority
//                     style={{ objectFit: 'cover' }}
//                     sizes="100vw"
//                 />
//             </Box>
//         </Box>
//     );
// }

// // Left rail — matches the "Daily Panchang / Muhurat / Planetary Transit /
// // ..." quick-links list from the reference design. Non-active items are
// // href="#" placeholders except where a matching page already exists
// // elsewhere in the app (Muhurat, Kundali, Compatibility).
// function SidebarNav() {
//     return (
//         <Card
//             elevation={0}
//             sx={{
//                 p: 1.5,
//                 borderRadius: 3,
//                 border: `1px solid ${THEME.border}`,
//                 width: 220,
//                 flexShrink: 0,
//                 display: { xs: 'none', lg: 'block' }
//             }}
//         >
//             <Stack spacing={0.5}>
//                 {SIDEBAR_ITEMS.map(({ icon: Icon, label, href, active }) => (
//                     <Stack
//                         key={label}
//                         component="a"
//                         href={href}
//                         direction="row"
//                         spacing={1.5}
//                         alignItems="center"
//                         sx={{
//                             px: 1.5,
//                             py: 1.1,
//                             borderRadius: 2,
//                             textDecoration: 'none',
//                             cursor: 'pointer',
//                             bgcolor: active ? THEME.navy : 'transparent',
//                             color: active ? '#FFFFFF' : THEME.ink,
//                             '&:hover': { bgcolor: active ? THEME.navy : '#F5F6FA' }
//                         }}
//                     >
//                         <Icon size={17} color={active ? THEME.gold : THEME.mutedInk} />
//                         <Typography sx={{ fontSize: 13.5, fontWeight: active ? 700 : 600 }}>{label}</Typography>
//                     </Stack>
//                 ))}
//             </Stack>
//         </Card>
//     );
// }

// // Promo card under the sidebar nav — "Align with the Cosmos, Live in
// // Harmony" image tile from the reference design. Swap SIDEBAR_PROMO_SRC for
// // a real asset path once it's uploaded to /public/images.
// const SIDEBAR_PROMO_SRC = '/images/planetary-transit-sidebar-promo.jpg';

// function SidebarPromo() {
//     return (
//         <Card
//             elevation={0}
//             sx={{
//                 mt: 2,
//                 borderRadius: 3,
//                 overflow: 'hidden',
//                 border: `1px solid ${THEME.border}`,
//                 width: 220,
//                 flexShrink: 0,
//                 display: { xs: 'none', lg: 'block' },
//                 position: 'relative',
//                 height: 180
//             }}
//         >
//             <Image src={SIDEBAR_PROMO_SRC} alt="Align with the Cosmos, Live in Harmony" fill style={{ objectFit: 'cover' }} />
//             <Box
//                 sx={{
//                     position: 'absolute',
//                     inset: 0,
//                     background: 'linear-gradient(180deg, rgba(11,19,48,0) 40%, rgba(11,19,48,0.75) 100%)',
//                     display: 'flex',
//                     alignItems: 'flex-end',
//                     p: 2
//                 }}
//             >
//                 <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>
//                     Align with the Cosmos, Live in Harmony.
//                 </Typography>
//             </Box>
//         </Card>
//     );
// }

// // Tab bar + static date selector shown above the tab content.
// function TransitTabsBar({ tab, onChange }) {
//     return (
//         <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5}>
//             <Tabs
//                 value={tab}
//                 onChange={onChange}
//                 variant="scrollable"
//                 scrollButtons="auto"
//                 sx={{
//                     minHeight: 40,
//                     '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 13.5, minHeight: 40, color: THEME.mutedInk },
//                     '& .Mui-selected': { color: `${THEME.navy} !important` },
//                     '& .MuiTabs-indicator': { bgcolor: THEME.gold, height: 3, borderRadius: 2 }
//                 }}
//             >
//                 {TABS.map((label) => (
//                     <Tab key={label} label={label} />
//                 ))}
//             </Tabs>

//             <Stack
//                 direction="row"
//                 spacing={1}
//                 alignItems="center"
//                 sx={{ border: `1px solid ${THEME.border}`, borderRadius: 2, px: 1.5, py: 0.75, alignSelf: { xs: 'flex-start', sm: 'auto' } }}
//             >
//                 <TbCalendarEvent size={16} color={THEME.mutedInk} />
//                 <Typography sx={{ fontSize: 13, fontWeight: 600, color: THEME.ink }}>18 May 2026</Typography>
//                 <TbChevronDown size={14} color={THEME.mutedInk} />
//             </Stack>
//         </Stack>
//     );
// }

// // "Current Planetary Positions" table — static sample data (see
// // CURRENT_POSITIONS above); wire to the live Panchang/ephemeris API later.
// function CurrentPositionsTable() {
//     return (
//         <Card elevation={0} sx={{ mt: 2.5, borderRadius: 3, border: `1px solid ${THEME.border}` }}>
//             <Box sx={{ p: 2.5, pb: 1.5 }}>
//                 <Typography sx={{ fontWeight: 700, fontSize: 16, color: THEME.ink }}>Current Planetary Positions</Typography>
//                 <Typography sx={{ fontSize: 12.5, color: THEME.mutedInk, mt: 0.25 }}>
//                     Real-time position of planets (based on sidereal/Lahiri Ayanamsa)
//                 </Typography>
//             </Box>
//             <TableContainer sx={{ overflowX: 'auto' }}>
//                 <Table size="small">
//                     <TableHead>
//                         <TableRow>
//                             {['Planet', 'Sign (Rashi)', 'Degree', 'Nakshatra', 'Status'].map((head) => (
//                                 <TableCell key={head} sx={{ fontWeight: 700, fontSize: 12.5, color: THEME.mutedInk, borderColor: THEME.border }}>
//                                     {head}
//                                 </TableCell>
//                             ))}
//                         </TableRow>
//                     </TableHead>
//                     <TableBody>
//                         {CURRENT_POSITIONS.map((row) => (
//                             <TableRow key={row.planet} sx={{ '&:last-child td': { borderBottom: 0 } }}>
//                                 <TableCell sx={{ fontSize: 13.5, fontWeight: 600, color: THEME.ink, borderColor: THEME.border }}>
//                                     {row.planet}
//                                 </TableCell>
//                                 <TableCell sx={{ fontSize: 13.5, color: THEME.ink, borderColor: THEME.border }}>{row.sign}</TableCell>
//                                 <TableCell sx={{ fontSize: 13.5, color: THEME.ink, borderColor: THEME.border }}>{row.degree}</TableCell>
//                                 <TableCell sx={{ fontSize: 13.5, color: THEME.ink, borderColor: THEME.border }}>{row.nakshatra}</TableCell>
//                                 <TableCell sx={{ borderColor: THEME.border }}>
//                                     <Chip
//                                         label={row.status}
//                                         size="small"
//                                         sx={{
//                                             fontWeight: 700,
//                                             fontSize: 11.5,
//                                             bgcolor: row.status === 'Retrograde' ? '#F7E9E7' : '#E7F5EC',
//                                             color: row.status === 'Retrograde' ? '#B4544A' : '#2E7D4F'
//                                         }}
//                                     />
//                                 </TableCell>
//                             </TableRow>
//                         ))}
//                     </TableBody>
//                 </Table>
//             </TableContainer>
//         </Card>
//     );
// }

// // Polar -> cartesian helper for the wheel's radial lines, labels & markers.
// function pointOnCircle(cx, cy, r, angleDeg) {
//     const rad = (angleDeg * Math.PI) / 180;
//     return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
// }

// // Vedic "Rashi Chakra" — 12-sector wheel, Aries at the top going clockwise.
// // Built from CURRENT_POSITIONS so the graha markers always match the table
// // above; no hand-placed pixel coordinates.
// function RashiWheel() {
//     const size = 320;
//     const cx = size / 2;
//     const cy = size / 2;
//     const outerR = 138;
//     const innerR = 34;
//     const labelR = 100;

//     // Group today's planets by the sign they currently occupy.
//     const bySign = RASHI_ORDER.map(() => []);
//     CURRENT_POSITIONS.forEach((row) => {
//         const signEn = row.sign.split(' (')[0];
//         const idx = RASHI_ORDER.findIndex((r) => r.en === signEn);
//         if (idx !== -1) bySign[idx].push(row.planet);
//     });

//     return (
//         <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
//             <svg width="100%" height="auto" viewBox={`0 0 ${size} ${size}`} style={{ maxWidth: 300 }}>
//                 <circle cx={cx} cy={cy} r={outerR} fill="#FFF8EE" stroke={THEME.border} strokeWidth="1.5" />
//                 <circle cx={cx} cy={cy} r={innerR} fill="#FFFFFF" stroke={THEME.border} strokeWidth="1.5" />

//                 {RASHI_ORDER.map((_, i) => {
//                     const boundaryAngle = -90 - 15 + i * 30;
//                     const inner = pointOnCircle(cx, cy, innerR, boundaryAngle);
//                     const outer = pointOnCircle(cx, cy, outerR, boundaryAngle);
//                     return (
//                         <line
//                             key={`line-${i}`}
//                             x1={inner.x}
//                             y1={inner.y}
//                             x2={outer.x}
//                             y2={outer.y}
//                             stroke={THEME.border}
//                             strokeWidth="1"
//                         />
//                     );
//                 })}

//                 {RASHI_ORDER.map((rashi, i) => {
//                     const angle = -90 + i * 30;
//                     const label = pointOnCircle(cx, cy, labelR, angle);
//                     const planets = bySign[i];
//                     return (
//                         <React.Fragment key={rashi.en}>
//                             <text x={label.x} y={label.y - 3} textAnchor="middle" fontSize="9" fontWeight="700" fill={THEME.ink}>
//                                 {rashi.en}
//                             </text>
//                             <text x={label.x} y={label.y + 9} textAnchor="middle" fontSize="7.5" fill={THEME.mutedInk}>
//                                 {rashi.sa}
//                             </text>

//                             {planets.map((planet, j) => {
//                                 const offset = planets.length > 1 ? (j === 0 ? -9 : 9) : 0;
//                                 const pos = pointOnCircle(cx, cy, outerR - 20, angle + offset);
//                                 const meta = PLANET_META[planet];
//                                 return (
//                                     <g key={planet}>
//                                         <circle cx={pos.x} cy={pos.y} r="9" fill={meta.color} stroke="#FFFFFF" strokeWidth="1.5" />
//                                         <text x={pos.x} y={pos.y + 3} textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#FFFFFF">
//                                             {meta.abbr}
//                                         </text>
//                                     </g>
//                                 );
//                             })}
//                         </React.Fragment>
//                     );
//                 })}

//                 <circle cx={cx} cy={cy} r={innerR - 6} fill={THEME.gold} opacity="0.12" />
//                 <text x={cx} y={cy + 8} textAnchor="middle" fontSize="20" fill={THEME.gold}>
//                     {'\u0950'}
//                 </text>
//             </svg>
//         </Box>
//     );
// }

// // Compact "Solar System" alternative to the Rashi Wheel — same 9 grahas as
// // the hero banner, laid out on a single ecliptic line with today's sign
// // underneath each one.
// function SolarSystemStrip() {
//     return (
//         <Box
//             sx={{
//                 bgcolor: THEME.navyDeep,
//                 borderRadius: 2.5,
//                 py: 3,
//                 px: 1,
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 flexWrap: 'wrap',
//                 rowGap: 2
//             }}
//         >
//             {CURRENT_POSITIONS.map((row) => {
//                 const meta = PLANET_META[row.planet];
//                 return (
//                     <Stack key={row.planet} spacing={0.5} alignItems="center" sx={{ minWidth: 34 }}>
//                         <Box
//                             sx={{
//                                 width: meta.size,
//                                 height: meta.size,
//                                 borderRadius: '50%',
//                                 bgcolor: meta.color,
//                                 boxShadow: `0 0 8px ${meta.color}99`
//                             }}
//                         />
//                         <Typography sx={{ color: '#FFFFFF', fontSize: 10.5, fontWeight: 700 }}>{row.planet}</Typography>
//                         <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 9 }}>{row.sign.split(' (')[0]}</Typography>
//                     </Stack>
//                 );
//             })}
//         </Box>
//     );
// }

// // "Planetary Transit Chart" card — Rashi Wheel / Solar System toggle, same
// // spot the reference design uses it (middle column of row 1).
// function TransitChartCard({ sx }) {
//     const [view, setView] = useState('rashi');
//     return (
//         <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${THEME.border}`, p: 2.5, ...sx }}>
//             <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
//                 <Typography sx={{ fontWeight: 700, fontSize: 16, color: THEME.ink }}>Planetary Transit Chart</Typography>
//             </Stack>

//             <ToggleButtonGroup
//                 value={view}
//                 exclusive
//                 onChange={(e, val) => val && setView(val)}
//                 size="small"
//                 fullWidth
//                 sx={{
//                     mb: 1,
//                     '& .MuiToggleButton-root': {
//                         textTransform: 'none',
//                         fontWeight: 600,
//                         fontSize: 12.5,
//                         color: THEME.mutedInk,
//                         borderColor: THEME.border
//                     },
//                     '& .Mui-selected': {
//                         bgcolor: `${THEME.navy} !important`,
//                         color: '#FFFFFF !important'
//                     }
//                 }}
//             >
//                 <ToggleButton value="rashi">Rashi Wheel</ToggleButton>
//                 <ToggleButton value="solar">Solar System</ToggleButton>
//             </ToggleButtonGroup>

//             {view === 'rashi' ? <RashiWheel /> : <SolarSystemStrip />}
//         </Card>
//     );
// }

// // "Key Transit Insights" — right column, top card. One row per graha in
// // TRANSIT_INSIGHTS, with a colored dot, the headline and a chevron.
// function KeyInsightsCard({ sx }) {
//     return (
//         <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${THEME.border}`, p: 2.5, ...sx }}>
//             <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
//                 <TbBulb size={18} color={THEME.gold} />
//                 <Typography sx={{ fontWeight: 700, fontSize: 16, color: THEME.ink }}>Key Transit Insights</Typography>
//             </Stack>
//             <Stack spacing={1.25}>
//                 {TRANSIT_INSIGHTS.map(({ planet, sign, text }) => (
//                     <Stack
//                         key={planet}
//                         direction="row"
//                         spacing={1.25}
//                         alignItems="flex-start"
//                         sx={{
//                             p: 1.25,
//                             borderRadius: 2,
//                             bgcolor: '#F7F8FC',
//                             cursor: 'pointer',
//                             '&:hover': { bgcolor: '#EFF1F8' }
//                         }}
//                     >
//                         <Box
//                             sx={{
//                                 mt: 0.4,
//                                 width: 8,
//                                 height: 8,
//                                 borderRadius: '50%',
//                                 flexShrink: 0,
//                                 bgcolor: PLANET_META[planet].color
//                             }}
//                         />
//                         <Box sx={{ flex: 1 }}>
//                             <Typography sx={{ fontWeight: 700, fontSize: 13, color: THEME.ink }}>
//                                 {planet} in {sign}
//                             </Typography>
//                             <Typography sx={{ fontSize: 12, color: THEME.mutedInk, mt: 0.25 }}>{text}</Typography>
//                         </Box>
//                         <TbChevronRight size={16} color={THEME.mutedInk} style={{ marginTop: 4, flexShrink: 0 }} />
//                     </Stack>
//                 ))}
//             </Stack>
//         </Card>
//     );
// }

// // "Important Note" — right column, bottom card. Disclaimer + Sanskrit shloka
// // with its translation, in the same warm/gold tone as the hero quote box.
// function ImportantNoteCard({ sx }) {
//     return (
//         <Card
//             elevation={0}
//             sx={{
//                 borderRadius: 3,
//                 border: `1px dashed ${THEME.gold}66`,
//                 bgcolor: '#FFF8EC',
//                 p: 2.5,
//                 ...sx
//             }}
//         >
//             <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
//                 <TbInfoCircle size={18} color={THEME.gold} />
//                 <Typography sx={{ fontWeight: 700, fontSize: 15, color: THEME.ink }}>Important Note</Typography>
//             </Stack>
//             <Typography sx={{ fontSize: 12.5, color: THEME.ink, lineHeight: 1.6 }}>{IMPORTANT_NOTE.text}</Typography>

//             <Stack spacing={0.5} sx={{ mt: 1.75, pt: 1.75, borderTop: `1px dashed ${THEME.gold}66` }}>
//                 <Typography sx={{ fontStyle: 'italic', fontWeight: 600, fontSize: 13, color: THEME.gold, textAlign: 'center' }}>
//                     {IMPORTANT_NOTE.sanskrit}
//                 </Typography>
//                 <Typography sx={{ fontSize: 11.5, color: THEME.mutedInk, textAlign: 'center' }}>
//                     {IMPORTANT_NOTE.translation}
//                 </Typography>
//             </Stack>
//         </Card>
//     );
// }

// // "Upcoming Major Transits" — row 2, left. Same table styling as
// // CurrentPositionsTable, plus a gold "View All" link in the header.
// function UpcomingTransitsCard({ sx }) {
//     return (
//         <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${THEME.border}`, ...sx }}>
//             <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2.5, pb: 1.5 }}>
//                 <Typography sx={{ fontWeight: 700, fontSize: 16, color: THEME.ink }}>Upcoming Major Transits</Typography>
//                 <Stack
//                     direction="row"
//                     spacing={0.5}
//                     alignItems="center"
//                     component="a"
//                     href="#"
//                     sx={{ color: THEME.gold, fontWeight: 700, fontSize: 12.5, textDecoration: 'none', flexShrink: 0 }}
//                 >
//                     <span>View All</span>
//                     <TbArrowRight size={14} />
//                 </Stack>
//             </Stack>
//             <TableContainer sx={{ overflowX: 'auto' }}>
//                 <Table size="small">
//                     <TableHead>
//                         <TableRow>
//                             {['Date', 'Planet', 'Transit', 'Impact'].map((head) => (
//                                 <TableCell key={head} sx={{ fontWeight: 700, fontSize: 12.5, color: THEME.mutedInk, borderColor: THEME.border }}>
//                                     {head}
//                                 </TableCell>
//                             ))}
//                         </TableRow>
//                     </TableHead>
//                     <TableBody>
//                         {UPCOMING_TRANSITS.map((row) => (
//                             <TableRow key={`${row.date}-${row.planet}`} sx={{ '&:last-child td': { borderBottom: 0 } }}>
//                                 <TableCell sx={{ fontSize: 13, color: THEME.ink, borderColor: THEME.border, whiteSpace: 'nowrap' }}>
//                                     {row.date}
//                                 </TableCell>
//                                 <TableCell sx={{ borderColor: THEME.border }}>
//                                     <Stack direction="row" spacing={1} alignItems="center">
//                                         <Box
//                                             sx={{
//                                                 width: 8,
//                                                 height: 8,
//                                                 borderRadius: '50%',
//                                                 flexShrink: 0,
//                                                 bgcolor: PLANET_META[row.planet].color
//                                             }}
//                                         />
//                                         <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: THEME.ink }}>{row.planet}</Typography>
//                                     </Stack>
//                                 </TableCell>
//                                 <TableCell sx={{ fontSize: 13, color: THEME.ink, borderColor: THEME.border, whiteSpace: 'nowrap' }}>
//                                     {row.transit}
//                                 </TableCell>
//                                 <TableCell sx={{ fontSize: 13, color: THEME.mutedInk, borderColor: THEME.border }}>{row.impact}</TableCell>
//                             </TableRow>
//                         ))}
//                     </TableBody>
//                 </Table>
//             </TableContainer>
//         </Card>
//     );
// }

// // "Transit Impact by Area of Life" — row 2, right. 6-tile grid built from
// // LIFE_AREAS; 3 columns on wide screens, 2 on small ones.
// function LifeImpactCard({ sx }) {
//     return (
//         <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${THEME.border}`, p: 2.5, ...sx }}>
//             <Typography sx={{ fontWeight: 700, fontSize: 16, color: THEME.ink, mb: 1.75 }}>Transit Impact by Area of Life</Typography>
//             <Box
//                 sx={{
//                     display: 'grid',
//                     gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
//                     gap: 1.5
//                 }}
//             >
//                 {LIFE_AREAS.map(({ icon: Icon, label, sub, color, bg }) => (
//                     <Stack
//                         key={label}
//                         spacing={0.75}
//                         sx={{
//                             p: 1.5,
//                             borderRadius: 2.5,
//                             bgcolor: bg,
//                             cursor: 'pointer',
//                             transition: 'transform 0.15s ease',
//                             '&:hover': { transform: 'translateY(-2px)' }
//                         }}
//                     >
//                         <Box
//                             sx={{
//                                 width: 32,
//                                 height: 32,
//                                 borderRadius: '50%',
//                                 bgcolor: '#FFFFFF',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center'
//                             }}
//                         >
//                             <Icon size={16} color={color} />
//                         </Box>
//                         <Box>
//                             <Typography sx={{ fontWeight: 700, fontSize: 13, color: THEME.ink }}>{label}</Typography>
//                             <Typography sx={{ fontSize: 10.5, color: THEME.mutedInk, lineHeight: 1.3 }}>{sub}</Typography>
//                         </Box>
//                     </Stack>
//                 ))}
//             </Box>
//         </Card>
//     );
// }

// export default function PlanetaryTransit() {
//     const [tab, setTab] = useState(0);

//     return (
//         <Box sx={{ bgcolor: '#F8F9FC', minHeight: '100vh' }}>
//             <HeroSection />

//             <Container maxWidth="xl" sx={{ py: 3 }}>
//                 <Stack direction="row" spacing={2.5} alignItems="flex-start">
//                     {/* Left rail: nav list + promo tile, stacked (matches reference) */}
//                     <Stack spacing={0} sx={{ display: { xs: 'none', lg: 'block' } }}>
//                         <SidebarNav />
//                         <SidebarPromo />
//                     </Stack>

//                     <Box sx={{ flex: 1, minWidth: 0 }}>
//                         <TransitTabsBar tab={tab} onChange={(e, val) => setTab(val)} />

//                         {tab !== 0 && (
//                             <Card
//                                 elevation={0}
//                                 sx={{ mt: 2.5, p: 5, borderRadius: 3, border: `1px solid ${THEME.border}`, textAlign: 'center' }}
//                             >
//                                 <Typography sx={{ color: THEME.mutedInk, fontSize: 14 }}>{TABS[tab]} — coming soon</Typography>
//                             </Card>
//                         )}

//                         {tab === 0 && (
//                             <>
//                                 {/* Row 1 — positions table | transit chart | insights column. All three are real now. */}
//                                 <Stack direction={{ xs: 'column', xl: 'row' }} spacing={2.5} alignItems="stretch" sx={{ mt: 2.5 }}>
//                                     <Box sx={{ flex: '1 1 40%', minWidth: 0 }}>
//                                         <CurrentPositionsTable />
//                                     </Box>
//                                     <Box sx={{ flex: '1 1 32%', minWidth: 0 }}>
//                                         <TransitChartCard sx={{ height: '100%' }} />
//                                     </Box>
//                                     <Box sx={{ flex: '1 1 28%', minWidth: 0 }}>
//                                         <Stack spacing={2.5}>
//                                             <KeyInsightsCard />
//                                             <ImportantNoteCard />
//                                         </Stack>
//                                     </Box>
//                                 </Stack>

//                                 {/* Row 2 — upcoming transits | transit impact by area of life. Both real now. */}
//                                 <Stack direction={{ xs: 'column', xl: 'row' }} spacing={2.5} alignItems="stretch" sx={{ mt: 2.5 }}>
//                                     <Box sx={{ flex: '1 1 60%', minWidth: 0 }}>
//                                         <UpcomingTransitsCard sx={{ height: '100%' }} />
//                                     </Box>
//                                     <Box sx={{ flex: '1 1 40%', minWidth: 0 }}>
//                                         <LifeImpactCard sx={{ height: '100%' }} />
//                                     </Box>
//                                 </Stack>
//                             </>
//                         )}
//                     </Box>
//                 </Stack>
//             </Container>
//         </Box>
//     );
// }


// Place at: src/components/_main/planetary-transit/index.js
// Both build rounds are done: hero banner, sidebar, tabs, Current
// Planetary Positions table, Planetary Transit Chart (Rashi Wheel / Solar
// System), Key Transit Insights, Important Note, Upcoming Major Transits
// and Transit Impact by Area of Life. All sample data (CURRENT_POSITIONS,
// UPCOMING_TRANSITS, TRANSIT_INSIGHTS) is static — swap for the real
// ephemeris/API feed when it's ready; the components don't need to change,
// just the data shape they're fed.

'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// mui
import {
    Box,
    Container,
    Stack,
    Typography,
    Chip,
    Card,
    Tabs,
    Tab,
    Skeleton,
    Collapse,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';

// icons
import {
    TbCalendarEvent,
    TbBuildingChurch,
    TbClockHour4,
    TbPlanet,
    TbChartPie,
    TbReportAnalytics,
    TbHeartHandshake,
    TbWand,
    TbBook2,
    TbChevronDown,
    TbChevronRight,
    TbArrowRight,
    TbBulb,
    TbInfoCircle,
    TbBriefcase,
    TbCurrencyRupee,
    TbHeart,
    TbHeartbeat,
    TbSchool
} from 'react-icons/tb';
import { FaOm } from 'react-icons/fa';

// Live data — see PlanetaryTransit() at the bottom of this file for the
// fetch/loading wiring. CURRENT_POSITIONS/TRANSIT_INSIGHTS/UPCOMING_TRANSITS
// no longer exist as hardcoded consts; every component below now takes its
// data as props.
import { getPlanetaryTransit, getUpcomingTransits } from '@/services/panchang-service';

// Module-scoped tokens — only used on this Planetary Transit page.
const THEME = {
    navy: '#0B1330',
    navyDeep: '#070C1F',
    ink: '#1B2A4A',
    gold: '#FB8B05',
    border: '#E5E9F8',
    mutedInk: '#6B7291'
};

// Left sidebar — same tool list style as the Panchang & Muhurat page.
// "Planetary Transit" is marked active since we're on this page.
const SIDEBAR_ITEMS = [
    { icon: TbCalendarEvent, label: 'Daily Panchang', href: '/panchang-muhurat' },
    { icon: TbBuildingChurch, label: 'Festival & Vrat', href: '/festivals' },
    { icon: TbClockHour4, label: 'Muhurat', href: '/muhurat' },
    { icon: TbPlanet, label: 'Planetary Transit', href: '/planetary-transit', active: true },
    { icon: TbChartPie, label: 'Rashi Phal', href: '#' },
    { icon: TbReportAnalytics, label: 'Kundali', href: '/kundali-generation' },
    { icon: TbHeartHandshake, label: 'Compatibility', href: '/kundali-matching' },
    { icon: TbWand, label: 'Remedies', href: '#' },
    { icon: TbBook2, label: 'Learn Astrology', href: '#' }
];

// Tab bar — only "Current Transit" is wired up with real content for now;
// the rest are static placeholders (design only) until later steps.
const TABS = ['Current Transit', 'Upcoming Transits', 'Retrograde', 'Planetary Calendar', 'Effects by Rashi', 'Conjunctions', 'Historical Transits'];

// Live "Current Planetary Positions" now comes from GET
// /panchang/planetary-transit (panchang-service.js -> getPlanetaryTransit).
// Row shape from the API: { planet, rashi, rashiEn, degree, nakshatra,
// pada, isRetrograde } — rashi is Prokerala's own display string, rashiEn
// is the astronomically-normalized English sign name used for grouping
// (Rashi Wheel) and matching against TRANSIT_INSIGHT_RULES.

// --- Step 2 data ---------------------------------------------------------

// 12 signs in natural zodiac order, starting at the top of the wheel and
// going clockwise (Aries at 12 o'clock) — matches the reference chart.
const RASHI_ORDER = [
    { en: 'Aries', sa: 'Mesha' },
    { en: 'Taurus', sa: 'Vrishabha' },
    { en: 'Gemini', sa: 'Mithuna' },
    { en: 'Cancer', sa: 'Karka' },
    { en: 'Leo', sa: 'Simha' },
    { en: 'Virgo', sa: 'Kanya' },
    { en: 'Libra', sa: 'Tula' },
    { en: 'Scorpio', sa: 'Vrishchika' },
    { en: 'Sagittarius', sa: 'Dhanu' },
    { en: 'Capricorn', sa: 'Makara' },
    { en: 'Aquarius', sa: 'Kumbha' },
    { en: 'Pisces', sa: 'Meena' }
];

// Same 9 grahas used in the hero banner + positions table — abbreviation,
// wheel-marker color and relative dot size (used on the Solar System tab).
const PLANET_META = {
    Sun: { abbr: 'Su', color: '#FB8B05', size: 22 },
    Moon: { abbr: 'Mo', color: '#C7CBD8', size: 16 },
    Mars: { abbr: 'Ma', color: '#C0392B', size: 14 },
    Mercury: { abbr: 'Me', color: '#9A8F72', size: 13 },
    Jupiter: { abbr: 'Ju', color: '#D98C3D', size: 19 },
    Venus: { abbr: 'Ve', color: '#E8C77A', size: 15 },
    Saturn: { abbr: 'Sa', color: '#B99A63', size: 17 },
    Rahu: { abbr: 'Ra', color: '#2C3E66', size: 13 },
    Ketu: { abbr: 'Ke', color: '#8B909E', size: 13 }
};

// "Key Transit Insights" — live now, from getPlanetaryTransit()'s
// keyInsights array (backend: transit-insight-rules.js). Shape:
// { planet, rashi, isRetrograde, text }.

const IMPORTANT_NOTE = {
    text: 'Planetary transits influence tendencies, not certainties. Use this as guidance along with your birth chart for deeper insights.',
    sanskrit: '\u0917\u094d\u0930\u0939\u093e\u0903 \u092b\u0932\u093e\u0928\u093f \u0926\u0926\u094d\u0924\u094d\u092f\u0947\u0935, \u092a\u0941\u0930\u0941\u0937\u093e\u0930\u094d\u0925\u0902 \u0935\u093f\u0928\u093e \u0915\u093e\u0932\u094b \u0928\u093e\u0964',
    translation: 'Planets give results, but without effort, time does not.'
};

// --- Step 3 data ---------------------------------------------------------
// "Upcoming Major Transits" is live now, from GET
// /panchang/planetary-transit/upcoming (panchang-service.js ->
// getUpcomingTransits). Row shape from the API: { date, planet, fromRashi,
// toRashi, transit, isRetrograde, impact }.

// "Transit Impact by Area of Life" — 6-tile grid, icon + label + sub-label.
const LIFE_AREAS = [
    { icon: TbBriefcase, label: 'Career', sub: 'Growth & Opportunities', color: '#3B5BDB', bg: '#EEF1FD' },
    { icon: TbCurrencyRupee, label: 'Finance', sub: 'Wealth & Stability', color: '#E8863B', bg: '#FDF1E8' },
    { icon: TbHeart, label: 'Relationships', sub: 'Love & Harmony', color: '#D8567A', bg: '#FCEDF1' },
    { icon: TbHeartbeat, label: 'Health', sub: 'Well-being & Energy', color: '#2E9E5B', bg: '#E9F7EF' },
    { icon: TbSchool, label: 'Education', sub: 'Learning & Wisdom', color: '#2E7DBD', bg: '#E8F2FB' },
    { icon: FaOm, label: 'Spirituality', sub: 'Inner Growth', color: '#8355C7', bg: '#F2ECFB' }
];

// Real designed banner (galaxy background + rendered planets + baked-in
// title/quote/feature-strip text) — same pattern as the Panchang page's
// HERO_BANNERS (a single pre-made graphic, not a CSS recreation). Save the
// asset at this exact path. Native ratio is 2172x454 (~4.78:1); aspectRatio
// keeps it from stretching/cropping oddly at any screen width.
const HERO_BANNER_SRC = '/images/planetary-transit-hero.png';

function HeroSection() {
    return (
        <Box sx={{ position: 'relative', width: '100%', bgcolor: THEME.navyDeep, overflow: 'hidden' }}>
            <Box sx={{ position: 'relative', width: '100%', aspectRatio: '2172 / 454' }}>
                <Image
                    src={HERO_BANNER_SRC}
                    alt="Planetary Transit — Cosmic Movements, Real Life Impact"
                    fill
                    priority
                    style={{ objectFit: 'cover' }}
                    sizes="100vw"
                />
            </Box>
        </Box>
    );
}

// Left rail — matches the "Daily Panchang / Muhurat / Planetary Transit /
// ..." quick-links list from the reference design. Non-active items are
// href="#" placeholders except where a matching page already exists
// elsewhere in the app (Muhurat, Kundali, Compatibility).



// Tab bar + static date selector shown above the tab content.

// "Current Planetary Positions" table — live data from getPlanetaryTransit()
// (see PlanetaryTransit() at the bottom of this file).

// Polar -> cartesian helper for the wheel's radial lines, labels & markers.
// Shared premium card look for every block on this page.
const CARD_SX = {
    borderRadius: 3,
    border: `1px solid ${THEME.border}`,
    bgcolor: '#FFFFFF',
    boxShadow: '0 10px 30px rgba(11, 19, 48, 0.05)'
};

// Column template shared by the positions header + every row so they align.
const POSITIONS_GRID = 'minmax(128px, 1fr) minmax(0, 1.35fr) minmax(0, 1fr) 100px';
const LIGHT_PLANETS = ['Moon', 'Venus'];

function SectionHeader({ icon: Icon, title, subtitle, action }) {
    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
                <Box
                    sx={{
                        width: 38,
                        height: 38,
                        flexShrink: 0,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE2B8 100%)'
                    }}
                >
                    <Icon size={20} color={THEME.gold} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 16.5, color: THEME.ink, lineHeight: 1.25 }}>{title}</Typography>
                    {subtitle && (
                        <Typography sx={{ fontSize: 12.5, color: THEME.mutedInk, mt: 0.25, lineHeight: 1.45 }}>{subtitle}</Typography>
                    )}
                </Box>
            </Stack>
            {action}
        </Stack>
    );
}

function TransitTabsBar({ tab, onChange }) {
    return (
        <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ md: 'center' }}
            spacing={1.5}
            sx={{ ...CARD_SX, p: 0.75 }}
        >
            <Tabs
                value={tab}
                onChange={onChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                    flex: 1,
                    minWidth: 0,
                    minHeight: 44,
                    '& .MuiTabs-indicator': { display: 'none' },
                    '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: 13.5,
                        minHeight: 44,
                        px: 2,
                        borderRadius: 2,
                        color: THEME.mutedInk,
                        transition: 'background-color .2s ease, color .2s ease',
                        '&:hover': { bgcolor: '#F5F7FD' }
                    },
                    '& .Mui-selected': {
                        color: `${THEME.navy} !important`,
                        fontWeight: 800,
                        bgcolor: '#FFF3E0',
                        boxShadow: `inset 0 -3px 0 ${THEME.gold}`
                    }
                }}
            >
                {TABS.map((label) => (
                    <Tab key={label} label={label} disableRipple />
                ))}
            </Tabs>

            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    bgcolor: '#F7F8FC',
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 2,
                    px: 1.75,
                    height: 40,
                    mr: { md: 0.5 },
                    alignSelf: { xs: 'flex-start', md: 'auto' }
                }}
            >
                <TbCalendarEvent size={16} color={THEME.gold} />
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: THEME.ink, whiteSpace: 'nowrap' }}>
                    {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Typography>
            </Stack>
        </Stack>
    );
}

function CurrentPositionsTable({ positions, loading }) {
    return (
        <Card elevation={0} sx={{ ...CARD_SX, p: 2.5, height: '100%' }}>
            <SectionHeader
                icon={TbPlanet}
                title="Current Planetary Positions"
                subtitle="Real-time position of planets (based on sidereal/Lahiri Ayanamsa)"
            />

            <Box sx={{ border: `1px solid ${THEME.border}`, borderRadius: 2.5, overflow: 'hidden' }}>
                {/* Header: same 4-column template as every row, so nothing can overlap */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: POSITIONS_GRID,
                        columnGap: 1.5,
                        alignItems: 'center',
                        px: 2,
                        py: 1.25,
                        bgcolor: '#F5F7FD',
                        borderBottom: `1px solid ${THEME.border}`,
                        color: THEME.mutedInk,
                        fontSize: 11.5,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 0.6
                    }}
                >
                    <Box>Planet</Box>
                    <Box>Sign &amp; Degree</Box>
                    <Box>Nakshatra</Box>
                    <Box>Status</Box>
                </Box>

                {loading &&
                    [...Array(9)].map((_, i) => (
                        <Box key={i} sx={{ px: 2, py: 1.5, borderTop: i === 0 ? 0 : `1px solid ${THEME.border}` }}>
                            <Skeleton height={32} />
                        </Box>
                    ))}

                {!loading && positions.length === 0 && (
                    <Typography sx={{ textAlign: 'center', fontSize: 13, color: THEME.mutedInk, py: 4 }}>
                        Planetary positions are temporarily unavailable.
                    </Typography>
                )}

                {!loading &&
                    positions.map((row, idx) => {
                        const meta = PLANET_META[row.planet] || { abbr: (row.planet || '?').slice(0, 2), color: THEME.gold };
                        const signMain = row.rashiEn || row.rashi;
                        const signSub = row.rashi && row.rashiEn && row.rashi !== row.rashiEn ? row.rashi : null;
                        return (
                            <Box
                                key={row.planet}
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: POSITIONS_GRID,
                                    columnGap: 1.5,
                                    alignItems: 'center',
                                    minHeight: 66,
                                    px: 2,
                                    py: 1,
                                    borderTop: idx === 0 ? 0 : `1px solid ${THEME.border}`,
                                    transition: 'background-color .15s ease',
                                    '&:hover': { bgcolor: '#FAFBFE' }
                                }}
                            >
                                {/* Planet */}
                                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            flexShrink: 0,
                                            borderRadius: '50%',
                                            bgcolor: meta.color,
                                            color: LIGHT_PLANETS.includes(row.planet) ? THEME.navy : '#FFFFFF',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 11,
                                            fontWeight: 800,
                                            boxShadow: `0 0 0 3px ${meta.color}26`
                                        }}
                                    >
                                        {meta.abbr}
                                    </Box>
                                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: THEME.ink, minWidth: 0, overflowWrap: 'anywhere' }}>
                                        {row.planet}
                                    </Typography>
                                </Stack>

                                {/* Sign + degree stacked */}
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: THEME.ink, lineHeight: 1.35, overflowWrap: 'anywhere' }}>
                                        {signMain}
                                        {signSub && (
                                            <Box component="span" sx={{ color: THEME.mutedInk, fontWeight: 500 }}>
                                                {' '}
                                                ({signSub})
                                            </Box>
                                        )}
                                    </Typography>
                                    <Typography sx={{ fontSize: 12, color: THEME.mutedInk, mt: 0.25, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                                        {row.degree}
                                    </Typography>
                                </Box>

                                {/* Nakshatra */}
                                <Typography sx={{ fontSize: 13.5, color: THEME.ink, lineHeight: 1.35, minWidth: 0, overflowWrap: 'anywhere' }}>
                                    {row.nakshatra}
                                </Typography>

                                {/* Status */}
                                <Box>
                                    <Chip
                                        label={row.isRetrograde ? 'Retrograde' : 'Direct'}
                                        size="small"
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: 11.5,
                                            height: 26,
                                            borderRadius: '8px',
                                            bgcolor: row.isRetrograde ? '#FBEAE7' : '#E7F5EC',
                                            color: row.isRetrograde ? '#B4544A' : '#2E7D4F'
                                        }}
                                    />
                                </Box>
                            </Box>
                        );
                    })}
            </Box>
        </Card>
    );
}

function SidebarNav() {
    return (
        <Card
            elevation={0}
            sx={{
                ...CARD_SX,
                p: 1.25,
                width: 220,
                flexShrink: 0,
                display: { xs: 'none', lg: 'block' }
            }}
        >
            <Stack spacing={0.5}>
                {SIDEBAR_ITEMS.map(({ icon: Icon, label, href, active }) => {
                    // href '#' = page not built yet -> non-clickable "SOON" (same as the navbar)
                    const soon = !active && (!href || href === '#');

                    if (soon) {
                        return (
                            <Stack
                                key={label}
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                                aria-disabled="true"
                                sx={{ px: 1.5, py: 1.1, borderRadius: 2, cursor: 'default', opacity: 0.5, userSelect: 'none' }}
                            >
                                <Icon size={17} color={THEME.mutedInk} />
                                <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: THEME.ink, flex: 1, minWidth: 0 }}>{label}</Typography>
                                <Typography
                                    sx={{
                                        fontSize: 9.5,
                                        fontWeight: 800,
                                        letterSpacing: 0.6,
                                        color: '#4C5FD6',
                                        bgcolor: '#EEF1FC',
                                        borderRadius: '6px',
                                        px: 0.75,
                                        py: 0.25,
                                        flexShrink: 0
                                    }}
                                >
                                    SOON
                                </Typography>
                            </Stack>
                        );
                    }

                    return (
                        <Stack
                            key={label}
                            component={Link}
                            href={href}
                            aria-current={active ? 'page' : undefined}
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                            sx={{
                                px: 1.5,
                                py: 1.1,
                                borderRadius: 2,
                                textDecoration: 'none',
                                cursor: 'pointer',
                                background: active ? `linear-gradient(135deg, ${THEME.navy} 0%, #1B2A5A 100%)` : 'transparent',
                                color: active ? '#FFFFFF' : THEME.ink,
                                boxShadow: active ? '0 6px 16px rgba(11, 19, 48, 0.25)' : 'none',
                                transition: 'background-color .15s ease, transform .15s ease',
                                '&:hover': { bgcolor: active ? undefined : '#F5F7FD', transform: active ? 'none' : 'translateX(2px)' }
                            }}
                        >
                            <Icon size={17} color={active ? THEME.gold : THEME.mutedInk} />
                            <Typography sx={{ fontSize: 13.5, fontWeight: active ? 700 : 600 }}>{label}</Typography>
                        </Stack>
                    );
                })}
            </Stack>
        </Card>
    );
}

function TransitChartCard({ sx, positions }) {
    const [view, setView] = useState('rashi');
    return (
        <Card elevation={0} sx={{ ...CARD_SX, p: 2.5, display: 'flex', flexDirection: 'column', ...sx }}>
            <SectionHeader icon={TbChartPie} title="Planetary Transit Chart" subtitle="Where every graha sits right now" />

            <ToggleButtonGroup
                value={view}
                exclusive
                onChange={(e, val) => val && setView(val)}
                size="small"
                fullWidth
                sx={{
                    mb: 1.5,
                    p: 0.5,
                    bgcolor: '#F5F7FD',
                    borderRadius: 2.5,
                    '& .MuiToggleButtonGroup-grouped': { border: 0, borderRadius: '10px !important', mx: 0 },
                    '& .MuiToggleButton-root': {
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: 12.5,
                        py: 0.9,
                        color: THEME.mutedInk
                    },
                    '& .Mui-selected': {
                        bgcolor: `${THEME.navy} !important`,
                        color: '#FFFFFF !important',
                        boxShadow: '0 4px 12px rgba(11, 19, 48, 0.25)'
                    }
                }}
            >
                <ToggleButton value="rashi">Rashi Wheel</ToggleButton>
                <ToggleButton value="solar">Solar System</ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0 }}>
                {view === 'rashi' ? <RashiWheel positions={positions} /> : <SolarSystemStrip positions={positions} />}
            </Box>
        </Card>
    );
}

// One expandable insight: collapsed = headline + 1-line preview, click to read all.
function InsightItem({ planet, rashi, text }) {
    const [open, setOpen] = useState(false);
    const color = PLANET_META[planet]?.color || THEME.gold;
    const abbr = PLANET_META[planet]?.abbr || (planet || '?').slice(0, 2);
    return (
        <Box
            sx={{
                borderRadius: 2.5,
                border: `1px solid ${THEME.border}`,
                borderLeft: `4px solid ${color}`,
                bgcolor: open ? '#FBFCFF' : '#FFFFFF',
                overflow: 'hidden',
                transition: 'box-shadow .2s ease, background-color .2s ease',
                boxShadow: open ? '0 8px 22px rgba(11, 19, 48, 0.08)' : 'none'
            }}
        >
            <Stack
                role="button"
                tabIndex={0}
                aria-expanded={open}
                direction="row"
                alignItems="center"
                spacing={1.5}
                onClick={() => setOpen((v) => !v)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setOpen((v) => !v);
                    }
                }}
                sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    outline: 'none',
                    '&:hover': { bgcolor: '#F7F8FC' },
                    '&:focus-visible': { boxShadow: `inset 0 0 0 2px ${THEME.gold}` }
                }}
            >
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        flexShrink: 0,
                        borderRadius: '50%',
                        bgcolor: color,
                        color: LIGHT_PLANETS.includes(planet) ? THEME.navy : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 800
                    }}
                >
                    {abbr}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: THEME.ink }}>
                        {planet} in {rashi}
                    </Typography>
                    {!open && (
                        <Typography
                            sx={{
                                fontSize: 12,
                                color: THEME.mutedInk,
                                mt: 0.25,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {text}
                        </Typography>
                    )}
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        color: THEME.mutedInk,
                        transition: 'transform .25s ease',
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                >
                    <TbChevronDown size={18} />
                </Box>
            </Stack>
            <Collapse in={open} timeout={250} unmountOnExit>
                <Typography sx={{ fontSize: 12.5, color: THEME.ink, lineHeight: 1.7, px: 1.5, pb: 1.75, pl: 6.75 }}>{text}</Typography>
            </Collapse>
        </Box>
    );
}

function KeyInsightsCard({ sx, insights, loading }) {
    return (
        <Card elevation={0} sx={{ ...CARD_SX, p: 2.5, ...sx }}>
            <SectionHeader icon={TbBulb} title="Key Transit Insights" subtitle="Tap any planet to read what it means for you" />
            {loading && (
                <Stack spacing={1.25}>
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={62} />
                    ))}
                </Stack>
            )}
            {!loading && insights.length === 0 && (
                <Typography sx={{ fontSize: 12.5, color: THEME.mutedInk, textAlign: 'center', py: 1 }}>
                    Insights are temporarily unavailable.
                </Typography>
            )}
            {!loading && insights.length > 0 && (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                        gap: 1.25,
                        alignItems: 'start'
                    }}
                >
                    {insights.map(({ planet, rashi, text }) => (
                        <InsightItem key={planet} planet={planet} rashi={rashi} text={text} />
                    ))}
                </Box>
            )}
        </Card>
    );
}

function ImportantNoteCard({ sx }) {
    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 3,
                border: `1px solid ${THEME.gold}55`,
                background: 'linear-gradient(160deg, #FFF8EC 0%, #FFEFD3 100%)',
                boxShadow: '0 10px 30px rgba(251, 139, 5, 0.10)',
                p: 2.5,
                ...sx
            }}
        >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 3 }} alignItems={{ md: 'center' }}>
                <Box sx={{ flex: '1 1 55%', minWidth: 0 }}>
                    <SectionHeader icon={TbInfoCircle} title="Important Note" />
                    <Typography sx={{ fontSize: 13, color: THEME.ink, lineHeight: 1.7 }}>{IMPORTANT_NOTE.text}</Typography>
                </Box>
                <Stack
                    spacing={0.75}
                    sx={{
                        flex: '1 1 45%',
                        minWidth: 0,
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: 'rgba(255, 255, 255, 0.65)',
                        border: `1px dashed ${THEME.gold}66`
                    }}
                >
                    <Typography sx={{ fontStyle: 'italic', fontWeight: 700, fontSize: 14.5, color: '#C86A00', textAlign: 'center', lineHeight: 1.6 }}>
                        {IMPORTANT_NOTE.sanskrit}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: THEME.mutedInk, textAlign: 'center' }}>{IMPORTANT_NOTE.translation}</Typography>
                </Stack>
            </Stack>
        </Card>
    );
}

function UpcomingTransitsCard({ sx, transits, loading }) {
    return (
        <Card elevation={0} sx={{ ...CARD_SX, p: 2.5, ...sx }}>
            <SectionHeader
                icon={TbCalendarEvent}
                title="Upcoming Major Transits"
                subtitle="Next big planetary shifts to plan around"
                action={
                    <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        component="a"
                        href="#"
                        sx={{
                            color: THEME.gold,
                            fontWeight: 700,
                            fontSize: 12.5,
                            textDecoration: 'none',
                            flexShrink: 0,
                            px: 1.5,
                            py: 0.75,
                            borderRadius: 2,
                            bgcolor: '#FFF3E0',
                            '&:hover': { bgcolor: '#FFE7C2' }
                        }}
                    >
                        <span>View All</span>
                        <TbArrowRight size={14} />
                    </Stack>
                }
            />
            <TableContainer sx={{ overflowX: 'auto', border: `1px solid ${THEME.border}`, borderRadius: 2.5 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#F5F7FD' }}>
                            {['Date', 'Planet', 'Transit', 'Impact'].map((head) => (
                                <TableCell
                                    key={head}
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: 11.5,
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.6,
                                        color: THEME.mutedInk,
                                        borderColor: THEME.border,
                                        py: 1.25
                                    }}
                                >
                                    {head}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={4} sx={{ textAlign: 'center', fontSize: 13, color: THEME.mutedInk, border: 0, py: 3 }}>
                                    Loading upcoming transits...
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && transits.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} sx={{ textAlign: 'center', fontSize: 13, color: THEME.mutedInk, border: 0, py: 3 }}>
                                    Upcoming transits are temporarily unavailable.
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading &&
                            transits.map((row) => (
                                <TableRow
                                    key={`${row.date}-${row.planet}`}
                                    sx={{ '&:last-child td': { borderBottom: 0 }, '&:hover': { bgcolor: '#FAFBFE' } }}
                                >
                                    <TableCell sx={{ fontSize: 13, fontWeight: 600, color: THEME.ink, borderColor: THEME.border, whiteSpace: 'nowrap', py: 1.5 }}>
                                        {new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </TableCell>
                                    <TableCell sx={{ borderColor: THEME.border }}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Box
                                                sx={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '50%',
                                                    flexShrink: 0,
                                                    bgcolor: PLANET_META[row.planet]?.color || THEME.gold,
                                                    boxShadow: `0 0 0 3px ${(PLANET_META[row.planet]?.color || THEME.gold)}26`
                                                }}
                                            />
                                            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: THEME.ink }}>{row.planet}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ fontSize: 13, color: THEME.ink, borderColor: THEME.border, whiteSpace: 'nowrap' }}>
                                        {row.transit}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: 13, color: THEME.mutedInk, borderColor: THEME.border, lineHeight: 1.5 }}>
                                        {row.impact || (
                                            <Box component="span" sx={{ opacity: 0.5 }}>
                                                —
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    );
}

function LifeImpactCard({ sx }) {
    return (
        <Card elevation={0} sx={{ ...CARD_SX, p: 2.5, ...sx }}>
            <SectionHeader icon={FaOm} title="Transit Impact by Area of Life" subtitle="How the sky touches your everyday life" />
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', xl: 'repeat(6, 1fr)' },
                    gap: 1.5
                }}
            >
                {LIFE_AREAS.map(({ icon: Icon, label, sub, color, bg }) => (
                    <Stack
                        key={label}
                        spacing={1}
                        sx={{
                            p: 1.75,
                            borderRadius: 3,
                            bgcolor: bg,
                            border: `1px solid ${color}1F`,
                            cursor: 'pointer',
                            transition: 'transform .18s ease, box-shadow .18s ease',
                            '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 10px 22px ${color}26` }
                        }}
                    >
                        <Box
                            sx={{
                                width: 38,
                                height: 38,
                                borderRadius: '12px',
                                bgcolor: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 4px 10px ${color}26`
                            }}
                        >
                            <Icon size={19} color={color} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: 13.5, color: THEME.ink }}>{label}</Typography>
                            <Typography sx={{ fontSize: 11.5, color: THEME.mutedInk, lineHeight: 1.35, mt: 0.25 }}>{sub}</Typography>
                        </Box>
                    </Stack>
                ))}
            </Box>
        </Card>
    );
}

function pointOnCircle(cx, cy, r, angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// SVG path for a ring "wedge" (donut slice) between two radii/angles — used
// for the alternating sector shading behind each rashi.
function wedgePath(cx, cy, rOuter, rInner, startAngle, endAngle) {
    const o1 = pointOnCircle(cx, cy, rOuter, startAngle);
    const o2 = pointOnCircle(cx, cy, rOuter, endAngle);
    const i1 = pointOnCircle(cx, cy, rInner, endAngle);
    const i2 = pointOnCircle(cx, cy, rInner, startAngle);
    return `M ${o1.x} ${o1.y} A ${rOuter} ${rOuter} 0 0 1 ${o2.x} ${o2.y} L ${i1.x} ${i1.y} A ${rInner} ${rInner} 0 0 0 ${i2.x} ${i2.y} Z`;
}

// Vedic "Rashi Chakra" — 12-sector wheel, Aries at the top going clockwise.
// Built entirely from the live `positions` prop (real sidereal longitude,
// same numbers as the Current Positions table and the backend's
// astronomy-engine/Prokerala pipeline) — no hand-placed pixel coordinates
// and no made-up degrees:
//   - which sign a graha sits in comes from rashiEn (Panchang-derived)
//   - WHERE inside that 30° sector its marker sits comes from its actual
//     longitudeDegrees (mod 30), so two planets in the same rashi land at
//     visibly different angles instead of being crammed into one spot.
// When several grahas fall close together, markers are staggered across
// two radii bands purely to stay legible — the angle itself is never
// altered, so the chart stays a true read of the position table.
function RashiWheel({ positions }) {
    const size = 380;
    const cx = size / 2;
    const cy = size / 2;
    const outerR = 176;
    const ringOuterR = 176;
    const ringInnerR = 104;
    const labelR = 140;
    const markerROuter = 86;
    const markerRInner = 62;
    const innerR = 46;

    // Real within-sign degree (0-30) straight from longitudeDegrees, so a
    // planet's angular position on the wheel matches its actual place in
    // the sky — not just "somewhere in this sign".
    const degreeInSign = (row) => {
        const lon = row.longitudeDegrees;
        return typeof lon === 'number' && !Number.isNaN(lon) ? ((lon % 30) + 30) % 30 : 15;
    };

    // Group today's live planets by the sign they currently occupy
    // (rashiEn is the astronomically-normalized English name — see
    // resolveEnglishRashi on the backend), each sorted by real degree so
    // staggering (when needed) reads left-to-right in sky order.
    const bySign = RASHI_ORDER.map(() => []);
    positions.forEach((row) => {
        const idx = RASHI_ORDER.findIndex((r) => r.en === row.rashiEn);
        if (idx !== -1 && PLANET_META[row.planet]) bySign[idx].push(row);
    });
    bySign.forEach((rows) => rows.sort((a, b) => degreeInSign(a) - degreeInSign(b)));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}>
            <svg width="100%" height="auto" viewBox={`0 0 ${size} ${size}`} style={{ maxWidth: Math.round(size * 1.1) }}>
                <defs>
                    <radialGradient id="rw-center" cx="50%" cy="42%" r="65%">
                        <stop offset="0%" stopColor="#FFF3DC" />
                        <stop offset="100%" stopColor="#FDE7C2" />
                    </radialGradient>
                </defs>

                {/* Alternating sector shading — makes each rashi's boundary
                    easy to scan at a glance instead of one flat wash. */}
                {RASHI_ORDER.map((rashi, i) => {
                    const start = -90 - 15 + i * 30;
                    const end = start + 30;
                    return (
                        <path
                            key={`wedge-${rashi.en}`}
                            d={wedgePath(cx, cy, ringOuterR, innerR, start, end)}
                            fill={i % 2 === 0 ? '#FFF9EF' : '#FFFFFF'}
                        />
                    );
                })}

                <circle cx={cx} cy={cy} r={ringOuterR} fill="none" stroke={THEME.gold} strokeWidth="1.5" opacity="0.55" />
                <circle cx={cx} cy={cy} r={ringInnerR} fill="none" stroke={THEME.border} strokeWidth="1" />
                <circle cx={cx} cy={cy} r={innerR} fill="url(#rw-center)" stroke={THEME.gold} strokeWidth="1.5" />

                {/* Sector boundary lines, full sign name + Sanskrit label. */}
                {RASHI_ORDER.map((rashi, i) => {
                    const boundaryAngle = -90 - 15 + i * 30;
                    const inner = pointOnCircle(cx, cy, innerR, boundaryAngle);
                    const outer = pointOnCircle(cx, cy, ringOuterR, boundaryAngle);
                    const midAngle = -90 + i * 30;
                    const label = pointOnCircle(cx, cy, labelR, midAngle);
                    return (
                        <React.Fragment key={`sector-${rashi.en}`}>
                            <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={THEME.border} strokeWidth="1" />
                            <text x={label.x} y={label.y - 2} textAnchor="middle" fontSize="9.5" fontWeight="700" letterSpacing="0" fill={THEME.ink}>
                                {rashi.en}
                            </text>
                            <text x={label.x} y={label.y + 9} textAnchor="middle" fontSize="7.5" letterSpacing="0" fill={THEME.mutedInk}>
                                {rashi.sa}
                            </text>
                        </React.Fragment>
                    );
                })}

                {/* Graha markers — angle is the real sidereal degree inside
                    the sector; radius only alternates to dodge overlap. */}
                {bySign.map((rows, i) =>
                    rows.map((row, j) => {
                        const sectorStart = -90 - 15 + i * 30;
                        const angle = sectorStart + degreeInSign(row);
                        const r = j % 2 === 0 ? markerROuter : markerRInner;
                        const pos = pointOnCircle(cx, cy, r, angle);
                        const meta = PLANET_META[row.planet];
                        return (
                            <g key={row.planet}>
                                <title>
                                    {row.planet} — {row.rashiEn || row.rashi} {row.degree || ''} {row.isRetrograde ? '(Retrograde)' : ''}
                                </title>
                                <circle cx={pos.x} cy={pos.y} r="10.5" fill={meta.color} stroke="#FFFFFF" strokeWidth="1.75" />
                                <text x={pos.x} y={pos.y + 3.3} textAnchor="middle" fontSize="8" fontWeight="700" fill="#FFFFFF">
                                    {meta.abbr}
                                </text>
                                {row.isRetrograde && (
                                    <circle cx={pos.x + 8} cy={pos.y - 8} r="5" fill="#C0392B" stroke="#FFFFFF" strokeWidth="1" />
                                )}
                                {row.isRetrograde && (
                                    <text x={pos.x + 8} y={pos.y - 5.3} textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#FFFFFF">
                                        R
                                    </text>
                                )}
                            </g>
                        );
                    })
                )}

                <text x={cx} y={cy + 8} textAnchor="middle" fontSize="20" fill={THEME.gold}>
                    {'\u0950'}
                </text>
            </svg>

            {/* Compact legend — same colors as the markers above, so a
                crowded sign is still easy to read at a glance. */}
            <Box
                sx={{
                    mt: 1,
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: 0.75,
                    maxWidth: 300
                }}
            >
                {Object.entries(PLANET_META).map(([planet, meta]) => (
                    <Stack key={planet} direction="row" spacing={0.5} alignItems="center">
                        <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: meta.color, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 9.5, color: THEME.mutedInk, fontWeight: 600 }}>{planet}</Typography>
                    </Stack>
                ))}
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <Box
                        sx={{
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            bgcolor: '#C0392B',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Typography sx={{ fontSize: 6.5, color: '#FFFFFF', fontWeight: 700, lineHeight: 1 }}>R</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 9.5, color: THEME.mutedInk, fontWeight: 600 }}>Retrograde</Typography>
                </Stack>
            </Box>
        </Box>
    );
}

// Chunk an array into fixed-size groups — used below so the "ecliptic"
// line under each row only ever spans the planets actually sitting in
// that row (with 9 grahas, a single flex-wrap row can't hold them all).
function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

// Compact "Solar System" alternative to the Rashi Wheel — same 9 grahas,
// in the same order as the Current Positions table above (so the two
// views never disagree), each showing today's live rashi underneath. A
// thin ecliptic line ties each row together and a small "R" badge flags
// retrograde motion, straight from the same `positions` data as the wheel
// and the table.
function SolarSystemStrip({ positions }) {
    const rows = positions.filter((row) => PLANET_META[row.planet]);
    const rowChunks = chunk(rows, 5);
    return (
        <Box
            sx={{
                bgcolor: THEME.navyDeep,
                borderRadius: 2.5,
                py: 3,
                px: 2
            }}
        >
            {rowChunks.map((chunkRows, chunkIdx) => (
                <Box
                    key={chunkIdx}
                    sx={{
                        position: 'relative',
                        display: 'flex',
                        justifyContent: chunkRows.length >= 5 ? 'space-between' : 'center',
                        gap: chunkRows.length >= 5 ? 0 : 3,
                        mt: chunkIdx > 0 ? 3 : 0
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            left: '8%',
                            right: '8%',
                            top: '30%',
                            height: '1px',
                            background:
                                'linear-gradient(90deg, rgba(251,139,5,0) 0%, rgba(251,139,5,0.35) 12%, rgba(251,139,5,0.35) 88%, rgba(251,139,5,0) 100%)'
                        }}
                    />
                    {chunkRows.map((row) => {
                        const meta = PLANET_META[row.planet];
                        return (
                            <Stack key={row.planet} spacing={0.6} alignItems="center" sx={{ minWidth: 34, position: 'relative' }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Box
                                        sx={{
                                            width: meta.size,
                                            height: meta.size,
                                            borderRadius: '50%',
                                            bgcolor: meta.color,
                                            boxShadow: `0 0 10px ${meta.color}AA`
                                        }}
                                    />
                                    {row.isRetrograde && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: -4,
                                                right: -6,
                                                width: 13,
                                                height: 13,
                                                borderRadius: '50%',
                                                bgcolor: '#C0392B',
                                                border: '1.5px solid #070C1F',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Typography sx={{ fontSize: 7.5, color: '#FFFFFF', fontWeight: 700, lineHeight: 1 }}>R</Typography>
                                        </Box>
                                    )}
                                </Box>
                                <Typography sx={{ color: '#FFFFFF', fontSize: 10.5, fontWeight: 700 }}>{row.planet}</Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 9 }}>{row.rashiEn || row.rashi}</Typography>
                            </Stack>
                        );
                    })}
                </Box>
            ))}
        </Box>
    );
}

// "Planetary Transit Chart" card — Rashi Wheel / Solar System toggle, same
// spot the reference design uses it (middle column of row 1).

// "Key Transit Insights" — right column, top card. One row per entry in
// the live `insights` prop (getPlanetaryTransit()'s keyInsights array),
// with a colored dot, the headline and a chevron.

// "Important Note" — right column, bottom card. Disclaimer + Sanskrit shloka
// with its translation, in the same warm/gold tone as the hero quote box.

// "Upcoming Major Transits" — row 2, left. Same table styling as
// CurrentPositionsTable, plus a gold "View All" link in the header. Data
// comes from the live `transits` prop (getUpcomingTransits()).

// "Transit Impact by Area of Life" — row 2, right. 6-tile grid built from
// LIFE_AREAS; 3 columns on wide screens, 2 on small ones.

export default function PlanetaryTransit() {
    const [tab, setTab] = useState(0);

    const [positions, setPositions] = useState([]);
    const [keyInsights, setKeyInsights] = useState([]);
    const [positionsLoading, setPositionsLoading] = useState(true);

    const [upcomingTransits, setUpcomingTransits] = useState([]);
    const [upcomingLoading, setUpcomingLoading] = useState(true);

    // Current positions + key insights — one request, backed by the same
    // Panchang cache/Prokerala call as the rest of the Panchang/Muhurat
    // pages (getOrFetchPanchang on the backend), so this costs zero extra
    // API credits beyond what's already being fetched elsewhere.
    const fetchPositions = useCallback(async () => {
        setPositionsLoading(true);
        try {
            const res = await getPlanetaryTransit();
            setPositions(res?.data?.positions || []);
            setKeyInsights(res?.data?.keyInsights || []);
        } catch (err) {
            setPositions([]);
            setKeyInsights([]);
        } finally {
            setPositionsLoading(false);
        }
    }, []);

    // Upcoming transits — computed astronomically + cached on the backend,
    // not polled from Prokerala. Independent request/loading state from
    // the positions above since they hit different endpoints.
    const fetchUpcomingTransits = useCallback(async () => {
        setUpcomingLoading(true);
        try {
            const res = await getUpcomingTransits({ months: 12, limit: 10 });
            setUpcomingTransits(res?.data || []);
        } catch (err) {
            setUpcomingTransits([]);
        } finally {
            setUpcomingLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPositions();
        fetchUpcomingTransits();
    }, [fetchPositions, fetchUpcomingTransits]);

    return (
        <Box sx={{ bgcolor: '#F8F9FC', minHeight: '100vh' }}>
            <HeroSection />

            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Stack direction="row" spacing={2.5} alignItems="flex-start">
                    {/* Left rail: nav list + promo tile, stacked (matches reference) */}
                    <Stack spacing={0} sx={{ display: { xs: 'none', lg: 'block' } }}>
                        <SidebarNav />
                    </Stack>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <TransitTabsBar tab={tab} onChange={(e, val) => setTab(val)} />

                        {tab !== 0 && (
                            <Card
                                elevation={0}
                                sx={{ mt: 2.5, p: 5, borderRadius: 3, border: `1px solid ${THEME.border}`, textAlign: 'center' }}
                            >
                                <Typography sx={{ color: THEME.mutedInk, fontSize: 14 }}>{TABS[tab]} — coming soon</Typography>
                            </Card>
                        )}

                        {tab === 0 && (
                            <>
                                {/* Row 1: positions | transit chart */}
                                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5} alignItems="stretch" sx={{ mt: 2.5 }}>
                                    <Box sx={{ flex: '1 1 58%', minWidth: 0 }}>
                                        <CurrentPositionsTable positions={positions} loading={positionsLoading} />
                                    </Box>
                                    <Box sx={{ flex: '1 1 42%', minWidth: 0 }}>
                                        <TransitChartCard sx={{ height: '100%' }} positions={positions} />
                                    </Box>
                                </Stack>

                                {/* Row 2: key insights (full width) */}
                                <Box sx={{ mt: 2.5 }}>
                                    <KeyInsightsCard insights={keyInsights} loading={positionsLoading} />
                                </Box>

                                {/* Row 3: important note banner */}
                                <Box sx={{ mt: 2.5 }}>
                                    <ImportantNoteCard />
                                </Box>

                                {/* Row 4: upcoming transits (full width) */}
                                <Box sx={{ mt: 2.5 }}>
                                    <UpcomingTransitsCard transits={upcomingTransits} loading={upcomingLoading} />
                                </Box>

                                {/* Row 5: transit impact by area of life */}
                                <Box sx={{ mt: 2.5 }}>
                                    <LifeImpactCard />
                                </Box>
                            </>
                        )}
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}