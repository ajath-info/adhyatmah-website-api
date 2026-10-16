// 'use client';
// import React, { useEffect, useMemo, useState } from 'react';
// import Link from 'next/link';
// import { Box, Container, IconButton, Skeleton, Stack, Typography } from '@mui/material';
// import { TbChevronLeft, TbChevronRight, TbArrowRight, TbClockHour4 } from 'react-icons/tb';

// import { getFestivals, getUpcomingFestivals } from '@/services/festival-service';
// import { getVrats } from '@/services/vrat-service';
// import { getMuhurat } from '@/services/panchang-service';
// import { resolveFestivalImageSrc } from 'src/utils/festival-image';
// import { HOME_THEME } from './theme';

// const DEFAULT_CITY = 'New Delhi';
// const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// // ---- helpers ---------------------------------------------------------
// const pad = (n) => String(n).padStart(2, '0');
// const isoDate = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`; // m is 1-12

// function dateParts(iso) {
//     const [y, m, d] = String(iso || '').split('-').map(Number);
//     if (!y || !m || !d) return null;
//     return { y, m, d, mon: new Date(y, m - 1, d).toLocaleDateString('en-IN', { month: 'short' }).toUpperCase() };
// }

// function formatLongDate(iso) {
//     const p = dateParts(iso);
//     if (!p) return '';
//     return new Date(p.y, p.m - 1, p.d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
// }

// function formatTime(iso) {
//     if (!iso) return '';
//     const d = new Date(iso);
//     if (Number.isNaN(d.getTime())) return '';
//     return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
// }

// // ---- shared card shell -----------------------------------------------
// function Panel({ title, href, children, sx }) {
//     return (
//         <Box
//             sx={{
//                 bgcolor: '#FFFFFF',
//                 border: `1px solid ${HOME_THEME.panelBorder}`,
//                 borderRadius: '18px',
//                 boxShadow: HOME_THEME.shadow,
//                 p: { xs: 2, sm: 2.25 },
//                 display: 'flex',
//                 flexDirection: 'column',
//                 minWidth: 0,
//                 ...sx
//             }}
//         >
//             <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
//                 <Typography component="h2" sx={{ fontSize: 17, fontWeight: 800, color: HOME_THEME.navy }}>
//                     {title}
//                 </Typography>
//                 {href && (
//                     <Typography
//                         component={Link}
//                         href={href}
//                         sx={{ fontSize: 12.5, fontWeight: 700, color: HOME_THEME.accent, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
//                     >
//                         View All <TbArrowRight size={14} />
//                     </Typography>
//                 )}
//             </Stack>
//             {children}
//         </Box>
//     );
// }

// function EmptyNote({ children }) {
//     return <Typography sx={{ fontSize: 13.5, color: HOME_THEME.muted, py: 1 }}>{children}</Typography>;
// }

// function RowSkeleton({ count = 4, height = 54 }) {
//     return (
//         <Stack spacing={1}>
//             {Array.from({ length: count }).map((_, i) => (
//                 <Skeleton key={i} variant="rounded" height={height} />
//             ))}
//         </Stack>
//     );
// }

// // ---- Hindu Calendar (mini) -------------------------------------------
// // Dot legend: Festival, Vrat (Ekadashi/Pradosh/Vrat), Auspicious day (Shubh Din), Others (Purnima/Amavasya).
// const DOT = { festival: HOME_THEME.accent, vrat: '#2C3E8C', shubh: '#3FA796', other: '#A9B1CC' };

// function categoryKind(category) {
//     if (category === 'Festival') return 'festival';
//     if (category === 'Shubh Din') return 'shubh';
//     if (['Ekadashi', 'Pradosh Vrat', 'Vrat'].includes(category)) return 'vrat';
//     return 'other';
// }

// function MiniCalendar() {
//     const now = new Date();
//     const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() + 1 });
//     const [kinds, setKinds] = useState({}); // { 'YYYY-MM-DD': Set(kind) }

//     useEffect(() => {
//         let cancelled = false;
//         getFestivals({ year: view.y, month: view.m, limit: 100 })
//             .then((res) => {
//                 if (cancelled) return;
//                 const map = {};
//                 (res?.data || []).forEach((f) => {
//                     if (!f?.date) return;
//                     (map[f.date] = map[f.date] || new Set()).add(categoryKind(f.category));
//                 });
//                 setKinds(map);
//             })
//             .catch(() => !cancelled && setKinds({}));
//         return () => {
//             cancelled = true;
//         };
//     }, [view.y, view.m]);

//     const cells = useMemo(() => {
//         const first = new Date(view.y, view.m - 1, 1).getDay();
//         const days = new Date(view.y, view.m, 0).getDate();
//         return [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
//     }, [view]);

//     const shift = (delta) =>
//         setView(({ y, m }) => {
//             const d = new Date(y, m - 1 + delta, 1);
//             return { y: d.getFullYear(), m: d.getMonth() + 1 };
//         });

//     const todayIso = isoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());

//     return (
//         <Panel title="Hindu Calendar">
//             <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
//                 <IconButton size="small" onClick={() => shift(-1)} aria-label="Previous month" sx={{ border: `1px solid ${HOME_THEME.panelBorder}` }}>
//                     <TbChevronLeft size={16} />
//                 </IconButton>
//                 <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: HOME_THEME.navy }}>
//                     {MONTH_NAMES[view.m - 1]} {view.y}
//                 </Typography>
//                 <IconButton size="small" onClick={() => shift(1)} aria-label="Next month" sx={{ border: `1px solid ${HOME_THEME.panelBorder}` }}>
//                     <TbChevronRight size={16} />
//                 </IconButton>
//             </Stack>

//             <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 0.25, textAlign: 'center' }}>
//                 {WEEKDAYS.map((w) => (
//                     <Typography key={w} sx={{ fontSize: 11, fontWeight: 600, color: HOME_THEME.muted, py: 0.5 }}>
//                         {w}
//                     </Typography>
//                 ))}
//                 {cells.map((day, i) => {
//                     if (!day) return <Box key={`b${i}`} />;
//                     const iso = isoDate(view.y, view.m, day);
//                     const isToday = iso === todayIso;
//                     const dayKinds = kinds[iso] ? [...kinds[iso]] : [];
//                     return (
//                         <Box key={iso} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 0.25 }}>
//                             <Box
//                                 sx={{
//                                     width: 26,
//                                     height: 26,
//                                     borderRadius: '50%',
//                                     display: 'grid',
//                                     placeItems: 'center',
//                                     fontSize: 12.5,
//                                     fontWeight: isToday ? 700 : 500,
//                                     color: isToday ? '#FFFFFF' : HOME_THEME.navy,
//                                     bgcolor: isToday ? HOME_THEME.accent : 'transparent'
//                                 }}
//                             >
//                                 {day}
//                             </Box>
//                             <Stack direction="row" spacing={0.25} sx={{ height: 5, mt: 0.25 }}>
//                                 {dayKinds.slice(0, 3).map((k) => (
//                                     <Box key={k} sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: DOT[k] }} />
//                                 ))}
//                             </Stack>
//                         </Box>
//                     );
//                 })}
//             </Box>

//             <Stack direction="row" flexWrap="wrap" sx={{ mt: 1.25, columnGap: 1.5, rowGap: 0.5 }}>
//                 {[
//                     ['Festival', DOT.festival],
//                     ['Vrat', DOT.vrat],
//                     ['Auspicious Day', DOT.shubh],
//                     ['Others', DOT.other]
//                 ].map(([label, color]) => (
//                     <Stack key={label} direction="row" spacing={0.5} alignItems="center">
//                         <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: color }} />
//                         <Typography sx={{ fontSize: 11, color: HOME_THEME.muted }}>{label}</Typography>
//                     </Stack>
//                 ))}
//             </Stack>

//             <Box sx={{ flexGrow: 1 }} />
//             <Box
//                 component={Link}
//                 href="/calendar"
//                 sx={{
//                     mt: 1.75,
//                     py: 1,
//                     textAlign: 'center',
//                     borderRadius: '12px',
//                     fontWeight: 700,
//                     fontSize: 13.5,
//                     color: HOME_THEME.accent,
//                     textDecoration: 'none',
//                     border: `1px solid ${HOME_THEME.panelBorder}`,
//                     '&:hover': { bgcolor: HOME_THEME.silver, borderColor: HOME_THEME.accent }
//                 }}
//             >
//                 View Full Calendar
//             </Box>
//         </Panel>
//     );
// }

// // ---- Upcoming Festivals ----------------------------------------------
// function FestivalCard({ festival, availableImages }) {
//     const p = dateParts(festival.date);
//     const img = resolveFestivalImageSrc(festival.name, availableImages) || festival.image?.url || '';
//     return (
//         <Box
//             component={Link}
//             href="/festivals"
//             sx={{
//                 display: 'flex',
//                 flexDirection: 'column',
//                 borderRadius: '14px',
//                 overflow: 'hidden',
//                 textDecoration: 'none',
//                 border: `1px solid ${HOME_THEME.panelBorder}`,
//                 bgcolor: '#FFFFFF',
//                 '&:hover': { borderColor: HOME_THEME.accent },
//                 '&:focus-visible': { outline: `2px solid ${HOME_THEME.accent}`, outlineOffset: 2 }
//             }}
//         >
//             <Box
//                 sx={{
//                     position: 'relative',
//                     height: 118,
//                     bgcolor: HOME_THEME.silver,
//                     backgroundImage: img ? `url("${img}")` : 'none',
//                     backgroundSize: 'cover',
//                     backgroundPosition: 'center'
//                 }}
//             >
//                 {p && (
//                     <Box
//                         sx={{
//                             position: 'absolute',
//                             top: 8,
//                             left: 8,
//                             minWidth: 42,
//                             px: 0.75,
//                             py: 0.5,
//                             borderRadius: '10px',
//                             textAlign: 'center',
//                             bgcolor: 'rgba(255,255,255,0.95)',
//                             border: `1px solid ${HOME_THEME.panelBorder}`
//                         }}
//                     >
//                         <Typography sx={{ fontSize: 17, fontWeight: 800, lineHeight: 1, color: HOME_THEME.accent }}>{pad(p.d)}</Typography>
//                         <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: HOME_THEME.navy }}>{p.mon}</Typography>
//                     </Box>
//                 )}
//             </Box>
//             <Box sx={{ p: 1.5 }}>
//                 <Typography sx={{ fontSize: 14.5, fontWeight: 800, color: HOME_THEME.navy, lineHeight: 1.25 }}>{festival.name}</Typography>
//                 <Typography
//                     sx={{
//                         mt: 0.5,
//                         fontSize: 12.5,
//                         color: HOME_THEME.muted,
//                         display: '-webkit-box',
//                         WebkitLineClamp: 2,
//                         WebkitBoxOrient: 'vertical',
//                         overflow: 'hidden'
//                     }}
//                 >
//                     {festival.shortDescription || festival.description || festival.category}
//                 </Typography>
//             </Box>
//         </Box>
//     );
// }

// function UpcomingFestivals({ availableImages }) {
//     const [items, setItems] = useState(null);

//     useEffect(() => {
//         let cancelled = false;
//         getUpcomingFestivals(6)
//             .then((res) => {
//                 if (cancelled) return;
//                 // Prefer real festivals; fall back to anything upcoming so the card is never empty.
//                 const all = res?.data || [];
//                 const main = all.filter((f) => f.category === 'Festival');
//                 setItems((main.length >= 3 ? main : all).slice(0, 3));
//             })
//             .catch(() => !cancelled && setItems([]));
//         return () => {
//             cancelled = true;
//         };
//     }, []);

//     return (
//         <Panel title="Upcoming Festivals" href="/festivals">
//             {items === null && (
//                 <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' } }}>
//                     {[0, 1, 2].map((i) => (
//                         <Skeleton key={i} variant="rounded" height={210} />
//                     ))}
//                 </Box>
//             )}
//             {items !== null && items.length === 0 && <EmptyNote>No upcoming festivals right now. Open the full list to browse the year.</EmptyNote>}
//             {items !== null && items.length > 0 && (
//                 <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' } }}>
//                     {items.map((f) => (
//                         <FestivalCard key={f._id || f.slug} festival={f} availableImages={availableImages} />
//                     ))}
//                 </Box>
//             )}
//         </Panel>
//     );
// }

// // ---- Upcoming Vrat & Upvas -------------------------------------------
// function UpcomingVrats() {
//     const [items, setItems] = useState(null);

//     useEffect(() => {
//         let cancelled = false;
//         const now = new Date();
//         const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
//         const todayIso = isoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());

//         // No "upcoming" endpoint exists for vrats, so read this month and next, keep dates from today on.
//         Promise.all([
//             getVrats({ year: now.getFullYear(), month: now.getMonth() + 1, limit: 40 }),
//             getVrats({ year: next.getFullYear(), month: next.getMonth() + 1, limit: 40 })
//         ])
//             .then(([a, b]) => {
//                 if (cancelled) return;
//                 const merged = [...(a?.data || []), ...(b?.data || [])]
//                     .filter((v) => v.date >= todayIso)
//                     .sort((x, y) => (x.date < y.date ? -1 : 1))
//                     .slice(0, 4);
//                 setItems(merged);
//             })
//             .catch(() => !cancelled && setItems([]));
//         return () => {
//             cancelled = true;
//         };
//     }, []);

//     return (
//         <Panel title="Upcoming Vrat & Upvas" href="/vrat-upvas">
//             {items === null && <RowSkeleton count={4} height={58} />}
//             {items !== null && items.length === 0 && <EmptyNote>No upcoming vrat found. Open the full list to browse.</EmptyNote>}
//             {items !== null && items.length > 0 && (
//                 <Stack spacing={1}>
//                     {items.map((v) => {
//                         const p = dateParts(v.date);
//                         return (
//                             <Box
//                                 key={v._id || v.slug}
//                                 component={Link}
//                                 href="/vrat-upvas"
//                                 sx={{
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     gap: 1.25,
//                                     p: 1,
//                                     borderRadius: '12px',
//                                     textDecoration: 'none',
//                                     border: `1px solid ${HOME_THEME.panelBorder}`,
//                                     '&:hover': { borderColor: HOME_THEME.accent, bgcolor: HOME_THEME.softBg }
//                                 }}
//                             >
//                                 {p && (
//                                     <Box
//                                         sx={{
//                                             width: 46,
//                                             flexShrink: 0,
//                                             py: 0.5,
//                                             textAlign: 'center',
//                                             borderRadius: '10px',
//                                             bgcolor: HOME_THEME.silver
//                                         }}
//                                     >
//                                         <Typography sx={{ fontSize: 18, fontWeight: 800, lineHeight: 1, color: HOME_THEME.accent }}>{pad(p.d)}</Typography>
//                                         <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: HOME_THEME.navy }}>{p.mon}</Typography>
//                                     </Box>
//                                 )}
//                                 <Box sx={{ minWidth: 0, flex: 1 }}>
//                                     <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 700, color: HOME_THEME.navy }}>
//                                         {v.title}
//                                     </Typography>
//                                     {v.type && (
//                                         <Typography
//                                             component="span"
//                                             sx={{
//                                                 display: 'inline-block',
//                                                 mt: 0.25,
//                                                 px: 0.9,
//                                                 py: 0.1,
//                                                 fontSize: 11,
//                                                 fontWeight: 600,
//                                                 borderRadius: '6px',
//                                                 color: HOME_THEME.navySoft,
//                                                 bgcolor: HOME_THEME.softBg
//                                             }}
//                                         >
//                                             {v.type}
//                                         </Typography>
//                                     )}
//                                 </Box>
//                                 <TbChevronRight size={16} color={HOME_THEME.muted} />
//                             </Box>
//                         );
//                     })}
//                 </Stack>
//             )}
//         </Panel>
//     );
// }

// // ---- Auspicious Muhurat (today) --------------------------------------
// function AuspiciousMuhurat() {
//     const [items, setItems] = useState(null);
//     const today = new Date();
//     const dateParam = today.toLocaleDateString('en-CA');

//     useEffect(() => {
//         let cancelled = false;
//         getMuhurat({ city: DEFAULT_CITY, date: dateParam })
//             .then((res) => {
//                 if (cancelled) return;
//                 const rows = (res?.data?.muhurats || [])
//                     .filter((r) => r.tone === 'auspicious')
//                     .sort((a, b) => (b.stars || 0) - (a.stars || 0))
//                     .slice(0, 4);
//                 setItems(rows);
//             })
//             .catch(() => !cancelled && setItems([]));
//         return () => {
//             cancelled = true;
//         };
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     return (
//         <Panel title="Auspicious Muhurat" href="/muhurat">
//             {items === null && <RowSkeleton count={4} height={58} />}
//             {items !== null && items.length === 0 && <EmptyNote>No highly auspicious window found for today. Open Muhurat to check other dates.</EmptyNote>}
//             {items !== null && items.length > 0 && (
//                 <Stack spacing={1}>
//                     {items.map((m) => (
//                         <Box
//                             key={m.id}
//                             component={Link}
//                             href="/muhurat"
//                             sx={{
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: 1.25,
//                                 p: 1,
//                                 borderRadius: '12px',
//                                 textDecoration: 'none',
//                                 border: `1px solid ${HOME_THEME.panelBorder}`,
//                                 '&:hover': { borderColor: HOME_THEME.accent, bgcolor: HOME_THEME.softBg }
//                             }}
//                         >
//                             <Box sx={{ width: 38, height: 38, flexShrink: 0, borderRadius: '10px', display: 'grid', placeItems: 'center', bgcolor: HOME_THEME.silver }}>
//                                 <TbClockHour4 size={20} color={HOME_THEME.accent} />
//                             </Box>
//                             <Box sx={{ minWidth: 0, flex: 1 }}>
//                                 <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 700, color: HOME_THEME.navy }}>
//                                     {m.name}
//                                 </Typography>
//                                 <Typography noWrap sx={{ fontSize: 12, color: HOME_THEME.muted }}>
//                                     {formatLongDate(dateParam)} · {formatTime(m.start)} – {formatTime(m.end)}
//                                 </Typography>
//                             </Box>
//                             <TbChevronRight size={16} color={HOME_THEME.muted} />
//                         </Box>
//                     ))}
//                 </Stack>
//             )}
//         </Panel>
//     );
// }

// // ---- Section ---------------------------------------------------------
// export default function HomeWidgets({ availableImages = [] }) {
//     return (
//         <Container maxWidth="xl" sx={{ mt: { xs: 2.5, md: 3.5 } }}>
//             <Box
//                 sx={{
//                     display: 'grid',
//                     gap: 2,
//                     alignItems: 'stretch',
//                     gridTemplateColumns: {
//                         xs: '1fr',
//                         md: 'repeat(2, minmax(0, 1fr))',
//                         lg: 'minmax(0, 0.9fr) minmax(0, 1.75fr) minmax(0, 1fr) minmax(0, 1fr)'
//                     }
//                 }}
//             >
//                 <MiniCalendar />
//                 <UpcomingFestivals availableImages={availableImages} />
//                 <UpcomingVrats />
//                 <AuspiciousMuhurat />
//             </Box>
//         </Container>
//     );
// }



'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Box, Container, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import { TbChevronLeft, TbChevronRight, TbArrowRight, TbClockHour4 } from 'react-icons/tb';

import { getFestivals, getUpcomingFestivals } from '@/services/festival-service';
import { getVrats } from '@/services/vrat-service';
import { getMuhurat } from '@/services/panchang-service';
import { resolveFestivalImageSrc } from 'src/utils/festival-image';
import { HOME_THEME } from './theme';

const DEFAULT_CITY = 'New Delhi';
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ---- helpers ---------------------------------------------------------
const pad = (n) => String(n).padStart(2, '0');
const isoDate = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`; // m is 1-12

function dateParts(iso) {
    const [y, m, d] = String(iso || '').split('-').map(Number);
    if (!y || !m || !d) return null;
    return { y, m, d, mon: new Date(y, m - 1, d).toLocaleDateString('en-IN', { month: 'short' }).toUpperCase() };
}

function formatLongDate(iso) {
    const p = dateParts(iso);
    if (!p) return '';
    return new Date(p.y, p.m - 1, p.d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// ---- shared card shell -----------------------------------------------
function Panel({ title, href, children, sx }) {
    return (
        <Box
            sx={{
                bgcolor: '#FFFFFF',
                border: `1px solid ${HOME_THEME.panelBorder}`,
                borderRadius: '18px',
                boxShadow: HOME_THEME.shadow,
                p: { xs: 2, sm: 2.25 },
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                ...sx
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5} sx={{ mb: 1.75 }}>
                <Typography component="h2" sx={{ fontSize: 17, fontWeight: 800, color: HOME_THEME.navy, minWidth: 0 }}>
                    {title}
                </Typography>
                {href && (
                    <Typography
                        component={Link}
                        href={href}
                        sx={{ fontSize: 12.5, fontWeight: 700, color: HOME_THEME.accent, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                        View All <TbArrowRight size={14} />
                    </Typography>
                )}
            </Stack>
            {children}
        </Box>
    );
}

function EmptyNote({ children }) {
    return <Typography sx={{ fontSize: 13.5, color: HOME_THEME.muted, py: 1 }}>{children}</Typography>;
}

function RowSkeleton({ count = 4, height = 54 }) {
    return (
        <Stack spacing={1}>
            {Array.from({ length: count }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={height} />
            ))}
        </Stack>
    );
}

// ---- Hindu Calendar (mini) -------------------------------------------
// Dot legend: Festival, Vrat (Ekadashi/Pradosh/Vrat), Auspicious day (Shubh Din), Others (Purnima/Amavasya).
const DOT = { festival: HOME_THEME.accent, vrat: '#2C3E8C', shubh: '#3FA796', other: '#A9B1CC' };

function categoryKind(category) {
    if (category === 'Festival') return 'festival';
    if (category === 'Shubh Din') return 'shubh';
    if (['Ekadashi', 'Pradosh Vrat', 'Vrat'].includes(category)) return 'vrat';
    return 'other';
}

function MiniCalendar() {
    const now = new Date();
    const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() + 1 });
    const [kinds, setKinds] = useState({}); // { 'YYYY-MM-DD': Set(kind) }

    useEffect(() => {
        let cancelled = false;
        getFestivals({ year: view.y, month: view.m, limit: 100 })
            .then((res) => {
                if (cancelled) return;
                const map = {};
                (res?.data || []).forEach((f) => {
                    if (!f?.date) return;
                    (map[f.date] = map[f.date] || new Set()).add(categoryKind(f.category));
                });
                setKinds(map);
            })
            .catch(() => !cancelled && setKinds({}));
        return () => {
            cancelled = true;
        };
    }, [view.y, view.m]);

    const cells = useMemo(() => {
        const first = new Date(view.y, view.m - 1, 1).getDay();
        const days = new Date(view.y, view.m, 0).getDate();
        return [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
    }, [view]);

    const shift = (delta) =>
        setView(({ y, m }) => {
            const d = new Date(y, m - 1 + delta, 1);
            return { y: d.getFullYear(), m: d.getMonth() + 1 };
        });

    const todayIso = isoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());

    return (
        <Panel title="Hindu Calendar">
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <IconButton size="small" onClick={() => shift(-1)} aria-label="Previous month" sx={{ border: `1px solid ${HOME_THEME.panelBorder}` }}>
                    <TbChevronLeft size={16} />
                </IconButton>
                <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: HOME_THEME.navy }}>
                    {MONTH_NAMES[view.m - 1]} {view.y}
                </Typography>
                <IconButton size="small" onClick={() => shift(1)} aria-label="Next month" sx={{ border: `1px solid ${HOME_THEME.panelBorder}` }}>
                    <TbChevronRight size={16} />
                </IconButton>
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 0.25, textAlign: 'center' }}>
                {WEEKDAYS.map((w) => (
                    <Typography key={w} sx={{ fontSize: 11, fontWeight: 600, color: HOME_THEME.muted, py: 0.5 }}>
                        {w}
                    </Typography>
                ))}
                {cells.map((day, i) => {
                    if (!day) return <Box key={`b${i}`} />;
                    const iso = isoDate(view.y, view.m, day);
                    const isToday = iso === todayIso;
                    const dayKinds = kinds[iso] ? [...kinds[iso]] : [];
                    return (
                        <Box key={iso} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 0.25 }}>
                            <Box
                                sx={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: '50%',
                                    display: 'grid',
                                    placeItems: 'center',
                                    fontSize: 12.5,
                                    fontWeight: isToday ? 700 : 500,
                                    color: isToday ? '#FFFFFF' : HOME_THEME.navy,
                                    bgcolor: isToday ? HOME_THEME.accent : 'transparent'
                                }}
                            >
                                {day}
                            </Box>
                            <Stack direction="row" spacing={0.25} sx={{ height: 5, mt: 0.25 }}>
                                {dayKinds.slice(0, 3).map((k) => (
                                    <Box key={k} sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: DOT[k] }} />
                                ))}
                            </Stack>
                        </Box>
                    );
                })}
            </Box>

            <Stack direction="row" flexWrap="wrap" sx={{ mt: 1.25, columnGap: 1.5, rowGap: 0.5 }}>
                {[
                    ['Festival', DOT.festival],
                    ['Vrat', DOT.vrat],
                    ['Auspicious Day', DOT.shubh],
                    ['Others', DOT.other]
                ].map(([label, color]) => (
                    <Stack key={label} direction="row" spacing={0.5} alignItems="center">
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: color }} />
                        <Typography sx={{ fontSize: 11, color: HOME_THEME.muted }}>{label}</Typography>
                    </Stack>
                ))}
            </Stack>

            <Box sx={{ flexGrow: 1 }} />
            <Box
                component={Link}
                href="/calendar"
                sx={{
                    mt: 1.75,
                    py: 1,
                    textAlign: 'center',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: 13.5,
                    color: HOME_THEME.accent,
                    textDecoration: 'none',
                    border: `1px solid ${HOME_THEME.panelBorder}`,
                    '&:hover': { bgcolor: HOME_THEME.silver, borderColor: HOME_THEME.accent }
                }}
            >
                View Full Calendar
            </Box>
        </Panel>
    );
}

// ---- Upcoming Festivals ----------------------------------------------
function FestivalCard({ festival, availableImages, imageHeight = 118 }) {
    const p = dateParts(festival.date);
    const img = resolveFestivalImageSrc(festival.name, availableImages) || festival.image?.url || '';
    return (
        <Box
            component={Link}
            href="/festivals"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '14px',
                overflow: 'hidden',
                textDecoration: 'none',
                border: `1px solid ${HOME_THEME.panelBorder}`,
                bgcolor: '#FFFFFF',
                '&:hover': { borderColor: HOME_THEME.accent },
                '&:focus-visible': { outline: `2px solid ${HOME_THEME.accent}`, outlineOffset: 2 }
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    height: imageHeight,
                    bgcolor: HOME_THEME.silver,
                    backgroundImage: img ? `url("${img}")` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                {p && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            minWidth: 42,
                            px: 0.75,
                            py: 0.5,
                            borderRadius: '10px',
                            textAlign: 'center',
                            bgcolor: 'rgba(255,255,255,0.95)',
                            border: `1px solid ${HOME_THEME.panelBorder}`
                        }}
                    >
                        <Typography sx={{ fontSize: 17, fontWeight: 800, lineHeight: 1, color: HOME_THEME.accent }}>{pad(p.d)}</Typography>
                        <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: HOME_THEME.navy }}>{p.mon}</Typography>
                    </Box>
                )}
            </Box>
            <Box sx={{ p: 1.5 }}>
                <Typography sx={{ fontSize: 14.5, fontWeight: 800, color: HOME_THEME.navy, lineHeight: 1.25 }}>{festival.name}</Typography>
                <Typography
                    sx={{
                        mt: 0.5,
                        fontSize: 12.5,
                        color: HOME_THEME.muted,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}
                >
                    {festival.shortDescription || festival.description || festival.category}
                </Typography>
            </Box>
        </Box>
    );
}

function UpcomingFestivals({ availableImages }) {
    const [items, setItems] = useState(null);

    useEffect(() => {
        let cancelled = false;
        getUpcomingFestivals(6)
            .then((res) => {
                if (cancelled) return;
                // Prefer real festivals; fall back to anything upcoming so the card is never empty.
                const all = res?.data || [];
                const main = all.filter((f) => f.category === 'Festival');
                setItems((main.length >= 3 ? main : all).slice(0, 3));
            })
            .catch(() => !cancelled && setItems([]));
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <Panel title="Upcoming Festivals" href="/festivals">
            {items === null && (
                <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' } }}>
                    {[0, 1, 2].map((i) => (
                        <Skeleton key={i} variant="rounded" height={290} />
                    ))}
                </Box>
            )}
            {items !== null && items.length === 0 && <EmptyNote>No upcoming festivals right now. Open the full list to browse the year.</EmptyNote>}
            {items !== null && items.length > 0 && (
                <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' } }}>
                    {items.map((f) => (
                        <FestivalCard key={f._id || f.slug} festival={f} availableImages={availableImages} imageHeight={{ xs: 190, sm: 170, lg: 210 }} />
                    ))}
                </Box>
            )}
        </Panel>
    );
}

// ---- Upcoming Vrat & Upvas -------------------------------------------
function UpcomingVrats() {
    const [items, setItems] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const now = new Date();
        const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const todayIso = isoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());

        // No "upcoming" endpoint exists for vrats, so read this month and next, keep dates from today on.
        Promise.all([
            getVrats({ year: now.getFullYear(), month: now.getMonth() + 1, limit: 40 }),
            getVrats({ year: next.getFullYear(), month: next.getMonth() + 1, limit: 40 })
        ])
            .then(([a, b]) => {
                if (cancelled) return;
                const merged = [...(a?.data || []), ...(b?.data || [])]
                    .filter((v) => v.date >= todayIso)
                    .sort((x, y) => (x.date < y.date ? -1 : 1))
                    .slice(0, 4);
                setItems(merged);
            })
            .catch(() => !cancelled && setItems([]));
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <Panel title="Upcoming Vrat & Upvas" href="/vrat-upvas">
            {items === null && <RowSkeleton count={4} height={58} />}
            {items !== null && items.length === 0 && <EmptyNote>No upcoming vrat found. Open the full list to browse.</EmptyNote>}
            {items !== null && items.length > 0 && (
                <Stack spacing={1} sx={{ flex: 1 }}>
                    {items.map((v) => {
                        const p = dateParts(v.date);
                        return (
                            <Box
                                key={v._id || v.slug}
                                component={Link}
                                href="/vrat-upvas"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flex: 1,
                                    gap: 1.25,
                                    p: 1.25,
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    border: `1px solid ${HOME_THEME.panelBorder}`,
                                    '&:hover': { borderColor: HOME_THEME.accent, bgcolor: HOME_THEME.softBg }
                                }}
                            >
                                {p && (
                                    <Box
                                        sx={{
                                            width: 46,
                                            flexShrink: 0,
                                            py: 0.5,
                                            textAlign: 'center',
                                            borderRadius: '10px',
                                            bgcolor: HOME_THEME.silver
                                        }}
                                    >
                                        <Typography sx={{ fontSize: 18, fontWeight: 800, lineHeight: 1, color: HOME_THEME.accent }}>{pad(p.d)}</Typography>
                                        <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: HOME_THEME.navy }}>{p.mon}</Typography>
                                    </Box>
                                )}
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 700, color: HOME_THEME.navy }}>
                                        {v.title}
                                    </Typography>
                                    {v.type && (
                                        <Typography
                                            component="span"
                                            sx={{
                                                display: 'inline-block',
                                                mt: 0.25,
                                                px: 0.9,
                                                py: 0.1,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                borderRadius: '6px',
                                                color: HOME_THEME.navySoft,
                                                bgcolor: HOME_THEME.softBg
                                            }}
                                        >
                                            {v.type}
                                        </Typography>
                                    )}
                                </Box>
                                <TbChevronRight size={16} color={HOME_THEME.muted} />
                            </Box>
                        );
                    })}
                </Stack>
            )}
        </Panel>
    );
}

// ---- Auspicious Muhurat (today) --------------------------------------
function AuspiciousMuhurat() {
    const [items, setItems] = useState(null);
    const today = new Date();
    const dateParam = today.toLocaleDateString('en-CA');

    useEffect(() => {
        let cancelled = false;
        getMuhurat({ city: DEFAULT_CITY, date: dateParam })
            .then((res) => {
                if (cancelled) return;
                const rows = (res?.data?.muhurats || [])
                    .filter((r) => r.tone === 'auspicious')
                    .sort((a, b) => (b.stars || 0) - (a.stars || 0))
                    .slice(0, 4);
                setItems(rows);
            })
            .catch(() => !cancelled && setItems([]));
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Panel title="Auspicious Muhurat" href="/muhurat">
            {items === null && <RowSkeleton count={4} height={58} />}
            {items !== null && items.length === 0 && <EmptyNote>No highly auspicious window found for today. Open Muhurat to check other dates.</EmptyNote>}
            {items !== null && items.length > 0 && (
                <Stack spacing={1} sx={{ flex: 1 }}>
                    {items.map((m) => (
                        <Box
                            key={m.id}
                            component={Link}
                            href="/muhurat"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                flex: 1,
                                gap: 1.25,
                                p: 1.25,
                                borderRadius: '12px',
                                textDecoration: 'none',
                                border: `1px solid ${HOME_THEME.panelBorder}`,
                                '&:hover': { borderColor: HOME_THEME.accent, bgcolor: HOME_THEME.softBg }
                            }}
                        >
                            <Box sx={{ width: 38, height: 38, flexShrink: 0, borderRadius: '10px', display: 'grid', placeItems: 'center', bgcolor: HOME_THEME.silver }}>
                                <TbClockHour4 size={20} color={HOME_THEME.accent} />
                            </Box>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 700, color: HOME_THEME.navy }}>
                                    {m.name}
                                </Typography>
                                <Typography noWrap sx={{ fontSize: 12, color: HOME_THEME.muted }}>
                                    {formatLongDate(dateParam)} · {formatTime(m.start)} – {formatTime(m.end)}
                                </Typography>
                            </Box>
                            <TbChevronRight size={16} color={HOME_THEME.muted} />
                        </Box>
                    ))}
                </Stack>
            )}
        </Panel>
    );
}

// ---- Section ---------------------------------------------------------
// Row 1: Calendar | Upcoming Vrat & Upvas | Auspicious Muhurat (3 equal columns)
// Row 2: Upcoming Festivals (full width)
export default function HomeWidgets({ availableImages = [] }) {
    return (
        <Container maxWidth="xl" sx={{ mt: { xs: 2.5, md: 3.5 } }}>
            <Box
                sx={{
                    display: 'grid',
                    gap: 2,
                    alignItems: 'stretch',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(2, minmax(0, 1fr))',
                        lg: 'repeat(3, minmax(0, 1fr))'
                    }
                }}
            >
                <MiniCalendar />
                <UpcomingVrats />
                <Box sx={{ display: 'grid', gridColumn: { md: '1 / -1', lg: 'auto' }, minWidth: 0 }}>
                    <AuspiciousMuhurat />
                </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
                <UpcomingFestivals availableImages={availableImages} />
            </Box>
        </Container>
    );
}