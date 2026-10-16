// 'use client';
// import React, { useEffect, useMemo, useState } from 'react';
// import Link from 'next/link';
// import Image from 'next/image';

// // mui
// import {
//     Box,
//     Card,
//     Grid,
//     Stack,
//     Chip,
//     Typography,
//     Divider,
//     Alert,
//     Checkbox,
//     FormControlLabel,
//     IconButton,
//     Dialog,
//     DialogContent,
//     Button,
//     MenuItem,
//     Select,
//     TextField,
//     Skeleton
// } from '@mui/material';

// // icons
// import {
//     TbCalendarEvent,
//     TbSparkles,
//     TbFlame,
//     TbArrowRight,
//     TbCompass,
//     TbHeart,
//     TbX,
//     TbBell,
//     TbCategory,
//     TbOm,
//     TbMapPin,
//     TbLeaf,
//     TbSun,
//     TbDots,
//     TbHistory
// } from 'react-icons/tb';
// import { GiTempleGate } from 'react-icons/gi';

// // data comes from the real backend built in step 1/2 (src/services/festival-service.js
// // -> /api/festivals), not a static file, so anything added from the admin panel
// // shows up here automatically — same pattern as vrat-upvas/index.js.
// import { getFestivals as apiGetFestivals } from '@/services/festival-service';
// import * as api from 'src/services';
// import { useMutation } from '@tanstack/react-query';
// import { toast } from 'react-hot-toast';

// // Small fixed reference list for the "Recurring Vrat & Upvas" info panel —
// // not date-specific data, so it stays local here (was RECURRING_VRATS in
// // the old static file).
// const RECURRING_VRATS = [
//     { id: 'ekadashi', name: 'Ekadashi', frequency: 'Twice a month', blurb: '11th lunar day of each paksha — fasting dedicated to Lord Vishnu.' },
//     { id: 'purnima', name: 'Purnima', frequency: 'Monthly', blurb: 'Full moon day — considered auspicious for worship and charity.' },
//     { id: 'amavasya', name: 'Amavasya', frequency: 'Monthly', blurb: 'New moon day — ancestor worship (Pitru Tarpan) and remedies.' },
//     { id: 'pradosh-vrat', name: 'Pradosh Vrat', frequency: 'Twice a month', blurb: 'Evening fast dedicated to Lord Shiva, on Trayodashi.' },
//     { id: 'sankashti-chaturthi', name: 'Sankashti Chaturthi', frequency: 'Monthly', blurb: 'Fast dedicated to Lord Ganesha for removing obstacles.' },
//     { id: 'masik-shivratri', name: 'Masik Shivratri', frequency: 'Monthly', blurb: 'Monthly night of Lord Shiva worship, before Amavasya.' }
// ];


// // New saffron/warm colour family (Step 1 of the redesign) — kept local to
// // this module only, so no other page on the site is affected. Same shape
// // as the old THEME object, just a different palette.
// // Chandra (चंद्र) — Silver White theme, base #DDE6F5. Moon governs time/tithi
// // and the lunar calendar, so this cooler silvery-blue palette replaces the
// // earlier saffron one across the whole page (every color below flows from
// // these tokens, so this is the only place that needs to change).
// const THEME = {
//     navy: '#2B3A63',
//     navySoft: '#46577E',
//     accent: '#4C6FA5',
//     bgGradient: '#FFFFFF',
//     panelBorder: '#C9D6EE',
//     iconBg: '#E7EEFA',
//     muted: '#64748B',
//     shadow: '0 6px 20px rgba(43, 58, 99, 0.08)',
//     shadowLg: '0 16px 40px rgba(43, 58, 99, 0.16)'
// };

// const CATEGORY_COLORS = {
//     Festival: { bg: '#FEE2E2', color: '#B91C1C' },
//     Ekadashi: { bg: '#FCE7F3', color: '#BE185D' },
//     'Pradosh Vrat': { bg: '#DBEAFE', color: '#1D4ED8' },
//     Vrat: { bg: '#F3E8FF', color: '#7E22CE' },
//     Purnima: { bg: '#FEF9C3', color: '#A16207' },
//     Amavasya: { bg: '#E5E7EB', color: '#374151' },
//     'Shubh Din': { bg: '#E7EEFA', color: '#3E5C94' },
//     Other: { bg: '#F3E8FF', color: '#7E22CE' }
// };

// // Purely cosmetic — a small emoji "tile" standing in for a real photo on
// // each card until real festival images are supplied. Category-based only,
// // no new data field required.
// const CATEGORY_ART = {
//     Festival: { emoji: '🎉', bg: 'linear-gradient(135deg, #A9C0E8, #4C6FA5)' },
//     Ekadashi: { emoji: '🪷', bg: 'linear-gradient(135deg, #F9A8D4, #DB2777)' },
//     'Pradosh Vrat': { emoji: '🔱', bg: 'linear-gradient(135deg, #93C5FD, #2563EB)' },
//     Vrat: { emoji: '📿', bg: 'linear-gradient(135deg, #D8B4FE, #9333EA)' },
//     Purnima: { emoji: '🌕', bg: 'linear-gradient(135deg, #FDE68A, #CA8A04)' },
//     Amavasya: { emoji: '🌑', bg: 'linear-gradient(135deg, #9CA3AF, #374151)' },
//     'Shubh Din': { emoji: '✨', bg: 'linear-gradient(135deg, #E2E8F5, #93A6C9)' },
//     Other: { emoji: '✨', bg: 'linear-gradient(135deg, #D8B4FE, #9333EA)' }
// };

// // --- Real festival photos ---------------------------------------------
// //
// // Drop real photos in `public/images/festivals/`, named after the
// // festival — nothing to wire up per-entry, the filename is derived
// // automatically from `festival.name`:
// //   1. lowercase, spaces -> hyphens, punctuation stripped
// //   2. save as .jpg
// //
// // Examples:
// //   "Ganesh Visarjan"                  -> /images/festivals/ganesh-visarjan.jpg
// //   "Holi (Dhulandi)"                  -> /images/festivals/holi-dhulandi.jpg
// //   "Makar Sankranti"                  -> /images/festivals/makar-sankranti.jpg
// //
// // Several entries in the dataset share one name with an alternate name
// // after a "/" (e.g. "Ganesh Chaturthi / Siddhivinayaka Chaturthi") — for
// // those we also try each half on its own, so a single photo saved under
// // either the combined name OR just one half will still be picked up:
// //   "Ganesh Chaturthi / Siddhivinayaka Chaturthi" tries, in order:
// //     /images/festivals/ganesh-chaturthi-siddhivinayaka-chaturthi.jpg
// //     /images/festivals/ganesh-chaturthi.jpg
// //     /images/festivals/siddhivinayaka-chaturthi.jpg
// //
// // Every occurrence of a recurring festival (Kalashtami, Ekadashi, etc.)
// // shares the same one photo — no need for a picture per date. A festival
// // with no matching file simply keeps the existing emoji/gradient tile
// // (nothing breaks, nothing looks "broken" — the <img> onError swap is
// // silent).
// function slugifyFestivalName(name) {
//     return name
//         .toLowerCase()
//         .replace(/&/g, 'and')
//         .replace(/[^a-z0-9\s-]/g, '')
//         .trim()
//         .replace(/\s+/g, '-')
//         .replace(/-+/g, '-');
// }

// function getFestivalImageSlugs(name) {
//     if (!name) return [];
//     const combined = slugifyFestivalName(name.replace(/\//g, ' '));
//     const halves = name.split('/').map((part) => slugifyFestivalName(part));
//     // Strip any "(...)" suffix too — e.g. "Pradosh Vrat (Guru)" also tries
//     // "pradosh-vrat", so ONE generic photo can cover every day-name variant
//     // (Guru/Shukra/Shani/Ravi/Soma/Budha/Bhauma) of a recurring vrat instead
//     // of needing 7 separate photos.
//     const withoutParens = slugifyFestivalName(name.replace(/\([^)]*\)/g, ' '));
//     return [...new Set([combined, withoutParens, ...halves].filter(Boolean))];
// }

// // Matches a festival name against the list of photos that ACTUALLY exist in
// // public/images/festivals (read once on the server — see page.js — and
// // passed down as `availableImages`). This is a plain in-memory lookup, not
// // a client-side guess-and-check loop: previously each card fired up to 16
// // speculative /images/festivals/<slug>.<ext> requests, which across ~70
// // cards meant 1000+ parallel 404s and a page that took 40+ seconds to load.
// function resolveFestivalImageSrc(name, availableImages) {
//     if (!name || !availableImages || availableImages.length === 0) return null;
//     const slugs = getFestivalImageSlugs(name);
//     const bySlugLower = new Map(availableImages.map((f) => [f.toLowerCase().replace(/\.[^.]+$/, ''), f]));
//     for (const slug of slugs) {
//         const match = bySlugLower.get(slug.toLowerCase());
//         if (match) return `/images/festivals/${match}`;
//     }
//     return null;
// }

// // Real photo when one exists (resolved server-side, see above), else the
// // existing emoji/gradient tile — no network guessing on the client.
// function FestivalArtBackground({ festival, art, availableImages }) {
//     const src = useMemo(() => resolveFestivalImageSrc(festival?.name, availableImages), [festival?.name, availableImages]);
//     if (!src) return <>{art.emoji}</>;

//     return (
//         <Image
//             key={src}
//             src={src}
//             alt={festival.name}
//             fill
//             style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
//             sizes="(max-width: 600px) 45vw, 260px"
//         />
//     );
// }

// function formatDateLabel(dateStr) {
//     const d = new Date(`${dateStr}T00:00:00`);
//     if (Number.isNaN(d.getTime())) return dateStr;
//     return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
// }

// function daysUntil(dateStr) {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const target = new Date(`${dateStr}T00:00:00`);
//     return Math.round((target - today) / 86400000);
// }

// function FestivalCard({ festival, onViewDetails, availableImages }) {
//     const catStyle = CATEGORY_COLORS[festival.category] || CATEGORY_COLORS.Other;
//     const art = CATEGORY_ART[festival.category] || CATEGORY_ART.Other;
//     const remaining = daysUntil(festival.date);
//     const d = new Date(`${festival.date}T00:00:00`);
//     const dayNum = Number.isNaN(d.getTime()) ? '' : d.getDate();
//     const monthShort = Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { month: 'short' });

//     // Purely visual "favourite" toggle — local to this card, not persisted or
//     // wired to any account/wishlist backend. Can be connected to the real
//     // wishlist API later if wanted.
//     const [liked, setLiked] = useState(false);

//     return (
//         <Card
//             elevation={0}
//             sx={{
//                 overflow: 'hidden',
//                 height: '100%',
//                 borderRadius: 3,
//                 border: `1px solid ${THEME.panelBorder}`,
//                 boxShadow: THEME.shadow,
//                 display: 'flex',
//                 flexDirection: 'column',
//                 transition: 'transform 0.15s ease, box-shadow 0.15s ease',
//                 '&:hover': { transform: 'translateY(-3px)', boxShadow: THEME.shadowLg }
//             }}
//         >
//             {/* Real photo when one exists at public/images/festivals/<slug>.jpg,
//                 else the emoji/gradient tile — see FestivalArtBackground above.
//                 overflow: hidden so a tall/wide source photo still crops to
//                 this tile instead of spilling past the rounded corners. */}
//             <Box sx={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', background: art.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
//                 <FestivalArtBackground festival={festival} art={art} availableImages={availableImages} />

//                 <Box
//                     sx={{
//                         position: 'absolute',
//                         top: 10,
//                         left: 10,
//                         bgcolor: '#FFFFFF',
//                         borderRadius: 2,
//                         px: 1.1,
//                         py: 0.4,
//                         textAlign: 'center',
//                         boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
//                     }}
//                 >
//                     <Typography sx={{ fontSize: 16, fontWeight: 800, color: THEME.navy, lineHeight: 1 }}>{dayNum}</Typography>
//                     <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: THEME.accent, textTransform: 'uppercase', lineHeight: 1.2 }}>
//                         {monthShort}
//                     </Typography>
//                 </Box>

//                 <IconButton
//                     size="small"
//                     onClick={() => setLiked((v) => !v)}
//                     aria-label="Save festival"
//                     sx={{
//                         position: 'absolute',
//                         top: 8,
//                         right: 8,
//                         bgcolor: 'rgba(255,255,255,0.9)',
//                         '&:hover': { bgcolor: '#FFFFFF' }
//                     }}
//                 >
//                     <TbHeart size={16} color={liked ? '#DC2626' : THEME.muted} fill={liked ? '#DC2626' : 'none'} />
//                 </IconButton>

//                 {remaining >= 0 && remaining <= 30 && (
//                     <Chip
//                         size="small"
//                         icon={<TbSparkles size={12} />}
//                         label={remaining === 0 ? 'Today' : `In ${remaining}d`}
//                         sx={{
//                             position: 'absolute',
//                             bottom: 8,
//                             right: 8,
//                             bgcolor: THEME.accent,
//                             color: '#FFFFFF',
//                             fontWeight: 700,
//                             fontSize: 10.5,
//                             height: 22
//                         }}
//                     />
//                 )}
//             </Box>

//             <Stack sx={{ p: 1.75, flexGrow: 1 }} spacing={0.65}>
//                 <Stack direction="row" spacing={0.75} flexWrap="wrap">
//                     <Chip
//                         size="small"
//                         label={festival.category}
//                         sx={{ bgcolor: catStyle.bg, color: catStyle.color, fontWeight: 700, fontSize: 10, height: 20 }}
//                     />
//                 </Stack>

//                 <Typography
//                     sx={{
//                         fontWeight: 800,
//                         fontSize: 15,
//                         color: THEME.navy,
//                         whiteSpace: 'nowrap',
//                         overflow: 'hidden',
//                         textOverflow: 'ellipsis'
//                     }}
//                     title={festival.name}
//                 >
//                     {festival.name}
//                 </Typography>

//                 <Stack direction="row" spacing={0.75} alignItems="center">
//                     <TbCalendarEvent size={12} color={THEME.muted} />
//                     <Typography sx={{ fontSize: 11.5, color: THEME.muted, fontWeight: 600 }}>{formatDateLabel(festival.date)}</Typography>
//                 </Stack>

//                 <Typography
//                     sx={{
//                         fontSize: 12.5,
//                         color: THEME.navySoft,
//                         lineHeight: 1.5,
//                         flexGrow: 1,
//                         display: '-webkit-box',
//                         WebkitLineClamp: 2,
//                         WebkitBoxOrient: 'vertical',
//                         overflow: 'hidden'
//                     }}
//                 >
//                     {festival.blurb}
//                 </Typography>

//                 <Button
//                     size="small"
//                     onClick={() => onViewDetails(festival)}
//                     endIcon={<TbArrowRight size={14} />}
//                     sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 700, color: THEME.accent, px: 0, '&:hover': { bgcolor: 'transparent' } }}
//                 >
//                     View Details
//                 </Button>
//             </Stack>
//         </Card>
//     );
// }

// // Simple in-page details popup — no new route added, just surfaces the same
// // festival fields (name/date/category/blurb) that are already in the data.
// function FestivalDetailsDialog({ festival, onClose, availableImages }) {
//     if (!festival) return null;
//     const catStyle = CATEGORY_COLORS[festival.category] || CATEGORY_COLORS.Other;
//     const art = CATEGORY_ART[festival.category] || CATEGORY_ART.Other;

//     return (
//         <Dialog open={Boolean(festival)} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
//             <Box sx={{ position: 'relative', height: 130, overflow: 'hidden', background: art.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
//                 <FestivalArtBackground festival={festival} art={art} availableImages={availableImages} />
//                 <IconButton
//                     size="small"
//                     onClick={onClose}
//                     sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#FFFFFF' } }}
//                 >
//                     <TbX size={16} color={THEME.navy} />
//                 </IconButton>
//             </Box>
//             <DialogContent sx={{ p: 3 }}>
//                 <Chip size="small" label={festival.category} sx={{ bgcolor: catStyle.bg, color: catStyle.color, fontWeight: 700, mb: 1.5 }} />
//                 <Typography sx={{ fontWeight: 800, fontSize: 20, color: THEME.navy, mb: 0.75 }}>{festival.name}</Typography>
//                 <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1.5 }}>
//                     <TbCalendarEvent size={14} color={THEME.muted} />
//                     <Typography sx={{ fontSize: 13, color: THEME.muted, fontWeight: 600 }}>{formatDateLabel(festival.date)}</Typography>
//                 </Stack>
//                 <Typography sx={{ fontSize: 14, color: THEME.navySoft, lineHeight: 1.7, mb: 2.5 }}>{festival.blurb}</Typography>
//                 <Button
//                     component={Link}
//                     href="/panchang-muhurat"
//                     fullWidth
//                     variant="contained"
//                     endIcon={<TbCompass size={16} />}
//                     sx={{ bgcolor: THEME.accent, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: THEME.navySoft } }}
//                 >
//                     Check Muhurat for Your City
//                 </Button>
//             </DialogContent>
//         </Dialog>
//     );
// }

// const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// // "Never Miss a Festival" box — wired to the existing sendNewsletter API
// // (src/services/index.js -> POST /newsletter), same endpoint already used
// // elsewhere on the site. No new backend route added.
// function NewsletterBox() {
//     const [email, setEmail] = useState('');

//     const { mutate, isPending: isLoading } = useMutation({
//         mutationFn: api.sendNewsletter,
//         onSuccess: (data) => {
//             toast.success(data?.message || 'Subscribed!');
//             setEmail('');
//         },
//         onError: (err) => {
//             toast.error(err?.response?.data?.message || 'Something went wrong!');
//         }
//     });

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//         if (!valid) {
//             toast.error('Invalid email!');
//             return;
//         }
//         mutate({ email });
//     };

//     return (
//         <Card elevation={0} sx={{ p: 2.25, borderRadius: 3, border: `1px solid ${THEME.panelBorder}`, boxShadow: THEME.shadow }}>
//             <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
//                 <TbBell size={16} color={THEME.accent} />
//                 <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: THEME.navy }}>Never Miss a Festival</Typography>
//             </Stack>
//             <Typography sx={{ fontSize: 12, color: THEME.muted, mb: 1.5, lineHeight: 1.5 }}>
//                 Get updates for upcoming vrat, festival dates and puja guides.
//             </Typography>
//             <Box component="form" onSubmit={handleSubmit}>
//                 <Stack spacing={1}>
//                     <TextField
//                         size="small"
//                         type="email"
//                         placeholder="Enter your email address"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#FFFFFF', fontSize: 13 } }}
//                     />
//                     <Button
//                         type="submit"
//                         fullWidth
//                         disabled={isLoading}
//                         variant="contained"
//                         sx={{ bgcolor: THEME.accent, textTransform: 'none', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: THEME.navySoft } }}
//                     >
//                         {isLoading ? 'Sending...' : 'Send Me Reminders'}
//                     </Button>
//                 </Stack>
//             </Box>
//         </Card>
//     );
// }

// export default function Festivals({ availableImages = [] }) {
//     const [tab, setTab] = useState('upcoming');
//     const [monthFilter, setMonthFilter] = useState('all'); // 'all' | 0-11
//     const [typeFilters, setTypeFilters] = useState([]); // empty = all categories
//     const [activeFestival, setActiveFestival] = useState(null);
//     // 'all' = every year in the dataset (2026 + 2027 + ...); otherwise a
//     // specific year number. Options below are derived from whatever years
//     // actually exist in the fetched data, so a future 2028 seed shows up
//     // here automatically without another code change.
//     const [selectedYear, setSelectedYear] = useState('all');

//     // Full 2026 dataset from the Festival collection (DB), fetched once on
//     // mount — the list is small (~240 entries/year) so we still filter/tab
//     // client-side exactly like before, just off live data instead of the
//     // static festivals-2026.js file. `limit: 1000` effectively means "give
//     // me everything that matches", same as reading the whole static array.
//     const [allFestivals, setAllFestivals] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');

//     useEffect(() => {
//         let cancelled = false;
//         setLoading(true);
//         setError('');
//         apiGetFestivals({ limit: 1000 })
//             .then((res) => {
//                 if (!cancelled) setAllFestivals(res?.data || []);
//             })
//             .catch((err) => {
//                 if (!cancelled) {
//                     setError(err?.response?.data?.message || 'Could not load festivals. Please try again.');
//                 }
//             })
//             .finally(() => {
//                 if (!cancelled) setLoading(false);
//             });
//         return () => {
//             cancelled = true;
//         };
//     }, []);

//     const todayDateOnly = () => {
//         const d = new Date();
//         d.setHours(0, 0, 0, 0);
//         return d;
//     };

//     const upcoming = useMemo(() => {
//         const today = todayDateOnly();
//         return [...allFestivals]
//             .filter((f) => new Date(`${f.date}T00:00:00`) >= today)
//             .sort((a, b) => new Date(a.date) - new Date(b.date));
//     }, [allFestivals]);

//     const past = useMemo(() => {
//         const today = todayDateOnly();
//         return [...allFestivals]
//             .filter((f) => new Date(`${f.date}T00:00:00`) < today)
//             .sort((a, b) => new Date(b.date) - new Date(a.date));
//     }, [allFestivals]);

//     const featured = useMemo(() => {
//         if (allFestivals.length === 0) return null;
//         const today = todayDateOnly();
//         const sorted = [...allFestivals].sort((a, b) => new Date(a.date) - new Date(b.date));
//         const todays = sorted.find((f) => new Date(`${f.date}T00:00:00`).getTime() === today.getTime());
//         if (todays) return todays;
//         const next = sorted.find((f) => new Date(`${f.date}T00:00:00`) >= today);
//         return next || sorted[sorted.length - 1];
//     }, [allFestivals]);

//     const availableYears = useMemo(() => {
//         const years = new Set(allFestivals.map((f) => new Date(`${f.date}T00:00:00`).getFullYear()).filter((y) => !Number.isNaN(y)));
//         return [...years].sort((a, b) => a - b);
//     }, [allFestivals]);

//     const listForTab = tab === 'upcoming' ? upcoming : tab === 'past' ? past : allFestivals;

//     // Counts for the sidebar — derived from whichever list the active tab is
//     // showing (all / upcoming / already passed), so a number like "Jan 24"
//     // only shows up when there really are 24 selectable results in Jan for
//     // that tab. Previously these always counted the full 241-entry year,
//     // which is why "Upcoming" + "Jan" could show a count but 0 results
//     // (all of January had already passed).
//     const yearScopedForTab = useMemo(() => {
//         if (selectedYear === 'all') return listForTab;
//         return listForTab.filter((f) => new Date(`${f.date}T00:00:00`).getFullYear() === selectedYear);
//     }, [listForTab, selectedYear]);

//     const monthCounts = useMemo(() => {
//         const counts = Array(12).fill(0);
//         yearScopedForTab.forEach((f) => {
//             const m = new Date(`${f.date}T00:00:00`).getMonth();
//             if (!Number.isNaN(m)) counts[m] += 1;
//         });
//         return counts;
//     }, [yearScopedForTab]);

//     const typeCounts = useMemo(() => {
//         const counts = {};
//         yearScopedForTab.forEach((f) => {
//             counts[f.category] = (counts[f.category] || 0) + 1;
//         });
//         return counts;
//     }, [yearScopedForTab]);

//     const toggleType = (type) => {
//         setTypeFilters((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
//     };

//     const clearFilters = () => {
//         setMonthFilter('all');
//         setTypeFilters([]);
//     };

//     const filteredList = useMemo(() => {
//         return listForTab.filter((f) => {
//             if (selectedYear !== 'all') {
//                 const y = new Date(`${f.date}T00:00:00`).getFullYear();
//                 if (y !== selectedYear) return false;
//             }
//             if (monthFilter !== 'all') {
//                 const m = new Date(`${f.date}T00:00:00`).getMonth();
//                 if (m !== monthFilter) return false;
//             }
//             if (typeFilters.length > 0 && !typeFilters.includes(f.category)) return false;
//             return true;
//         });
//     }, [listForTab, selectedYear, monthFilter, typeFilters]);

//     return (
//         <Box sx={{ background: THEME.bgGradient, borderRadius: 4, overflow: 'hidden' }}>
//             {/* ---------- Hero (Step 1: banner with text baked in, same as the
//                 'promo' slide pattern on the homepage hero — no overlay text needed) ---------- */}
//             {/* Place the supplied file at public/images/festivals-hero-banner.png */}
//             <Box
//                 component="img"
//                 src="/images/festivals-hero-banner.png"
//                 alt="Panchang Festivals — Celebrating Dharma. Every Day."
//                 sx={{ width: '100%', height: 'auto', display: 'block' }}
//             />

//             {/* ---------- Today / Next Up strip ---------- */}
//             {featured && (
//                 <Box sx={{ px: { xs: 2.5, md: 6 }, mt: -3, position: 'relative', zIndex: 2 }}>
//                     <Card
//                         elevation={0}
//                         sx={{
//                             p: 2.25,
//                             maxWidth: 480,
//                             borderRadius: 3,
//                             bgcolor: '#FFFFFF',
//                             boxShadow: THEME.shadowLg,
//                             border: `1px solid ${THEME.panelBorder}`
//                         }}
//                     >
//                         <Stack direction="row" spacing={1.5} alignItems="center">
//                             <Box
//                                 sx={{
//                                     width: 44,
//                                     height: 44,
//                                     borderRadius: 2,
//                                     bgcolor: THEME.iconBg,
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     justifyContent: 'center',
//                                     flexShrink: 0
//                                 }}
//                             >
//                                 <TbFlame size={22} color={THEME.accent} />
//                             </Box>
//                             <Box>
//                                 <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: THEME.muted, textTransform: 'uppercase' }}>
//                                     Today / Next Up
//                                 </Typography>
//                                 <Typography sx={{ fontWeight: 800, fontSize: 17, color: THEME.navy }}>{featured.name}</Typography>
//                                 <Typography sx={{ fontSize: 12.5, color: THEME.muted }}>{formatDateLabel(featured.date)}</Typography>
//                             </Box>
//                         </Stack>
//                     </Card>
//                 </Box>
//             )}

//             {/* ---------- Top filter/pill bar (matches reference layout) ----------
//                 Only "All Festivals", "Upcoming" and "Already Passed" are backed by
//                 real data today (category/date fields already in festivals-2026.js).
//                 "Hindu / Regional / Temple / Seasonal / Deity Wise / More" need new
//                 fields (region, deity, temple, etc.) that don't exist on the 241
//                 entries yet, so — same as "Horoscope SOON" etc. in your main nav —
//                 they're shown but marked Soon and disabled until that data exists. */}
//             <Box sx={{ px: { xs: 2.5, md: 6 }, pt: { xs: 3, md: 4 } }}>
//                 <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
//                     {[
//                         { key: 'all', label: 'All Festivals', icon: <TbCategory size={16} />, enabled: true },
//                         { key: 'hindu', label: 'Hindu Festivals', icon: <TbOm size={16} />, enabled: false },
//                         { key: 'regional', label: 'Regional Festivals', icon: <TbMapPin size={16} />, enabled: false },
//                         { key: 'temple', label: 'Temple Festivals', icon: <GiTempleGate size={16} />, enabled: false },
//                         { key: 'seasonal', label: 'Seasonal Festivals', icon: <TbLeaf size={16} />, enabled: false },
//                         { key: 'deity', label: 'Deity Wise', icon: <TbSun size={16} />, enabled: false },
//                         { key: 'upcoming', label: `Upcoming (${upcoming.length})`, icon: <TbCalendarEvent size={16} />, enabled: true },
//                         { key: 'past', label: `Already Passed (${past.length})`, icon: <TbHistory size={16} />, enabled: true },
//                         { key: 'more', label: 'More', icon: <TbDots size={16} />, enabled: false }
//                     ].map((item) => {
//                         const selected = item.enabled && tab === item.key;
//                         return (
//                             <Button
//                                 key={item.key}
//                                 size="small"
//                                 onClick={() => (item.enabled ? setTab(item.key) : toast('Coming soon'))}
//                                 startIcon={item.icon}
//                                 sx={{
//                                     textTransform: 'none',
//                                     fontWeight: 700,
//                                     fontSize: 13.5,
//                                     borderRadius: 999,
//                                     border: `1px solid ${THEME.panelBorder}`,
//                                     px: 2.25,
//                                     py: 1,
//                                     minHeight: 40,
//                                     color: selected ? '#FFFFFF' : item.enabled ? THEME.navySoft : '#A9B4C9',
//                                     bgcolor: selected ? THEME.accent : '#FFFFFF',
//                                     borderColor: selected ? THEME.accent : THEME.panelBorder,
//                                     opacity: item.enabled ? 1 : 0.65,
//                                     '&:hover': { bgcolor: selected ? THEME.accent : item.enabled ? THEME.iconBg : '#FFFFFF' }
//                                 }}
//                             >
//                                 {item.label}
//                                 {!item.enabled && (
//                                     <Typography component="span" sx={{ ml: 0.6, fontSize: 9.5, fontWeight: 800, color: THEME.accent, textTransform: 'uppercase' }}>
//                                         Soon
//                                     </Typography>
//                                 )}
//                             </Button>
//                         );
//                     })}
//                 </Stack>
//             </Box>


//             {/* ---------- Main 2-column shell: left filters | grid | right sidebar (Step 3) ---------- */}
//             <Box sx={{ px: { xs: 2.5, md: 6 }, py: { xs: 3, md: 4 }, display: 'flex', gap: 3, alignItems: 'flex-start' }}>
//                 {/* Left filter sidebar */}
//                 <Stack
//                     spacing={2.5}
//                     sx={{
//                         display: { xs: 'none', md: 'flex' },
//                         width: 220,
//                         flexShrink: 0
//                     }}
//                 >
//                     {/* Select Year — options come from whatever years exist in the DB
//                         (availableYears), so seeding 2027/2028 later needs no UI change. */}
//                     <Box>
//                         <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: THEME.navy, mb: 1 }}>Select Year</Typography>
//                         <Select
//                             size="small"
//                             value={selectedYear}
//                             onChange={(e) => setSelectedYear(e.target.value)}
//                             fullWidth
//                             sx={{
//                                 borderRadius: 2,
//                                 fontWeight: 700,
//                                 fontSize: 13.5,
//                                 bgcolor: '#FFFFFF',
//                                 '& .MuiOutlinedInput-notchedOutline': { borderColor: THEME.panelBorder }
//                             }}
//                         >
//                             <MenuItem value="all">All Years</MenuItem>
//                             {availableYears.map((y) => (
//                                 <MenuItem key={y} value={y}>
//                                     {y}
//                                 </MenuItem>
//                             ))}
//                         </Select>
//                     </Box>

//                     <Divider />

//                     {/* Filter by Month */}
//                     <Box>
//                         <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: THEME.navy, mb: 1 }}>Filter by Month</Typography>
//                         <Stack spacing={0.25}>
//                             <Stack
//                                 direction="row"
//                                 justifyContent="space-between"
//                                 onClick={() => setMonthFilter('all')}
//                                 sx={{
//                                     cursor: 'pointer',
//                                     px: 1,
//                                     py: 0.6,
//                                     borderRadius: 1.5,
//                                     bgcolor: monthFilter === 'all' ? THEME.iconBg : 'transparent',
//                                     '&:hover': { bgcolor: THEME.iconBg }
//                                 }}
//                             >
//                                 <Typography sx={{ fontSize: 13, fontWeight: monthFilter === 'all' ? 800 : 600, color: THEME.navySoft }}>
//                                     All Months
//                                 </Typography>
//                                 <Typography sx={{ fontSize: 12, fontWeight: 700, color: THEME.muted }}>{listForTab.length}</Typography>
//                             </Stack>
//                             {MONTH_NAMES.map((name, idx) => (
//                                 <Stack
//                                     key={name}
//                                     direction="row"
//                                     justifyContent="space-between"
//                                     onClick={() => setMonthFilter(idx)}
//                                     sx={{
//                                         cursor: 'pointer',
//                                         px: 1,
//                                         py: 0.6,
//                                         borderRadius: 1.5,
//                                         bgcolor: monthFilter === idx ? THEME.iconBg : 'transparent',
//                                         '&:hover': { bgcolor: THEME.iconBg }
//                                     }}
//                                 >
//                                     <Typography sx={{ fontSize: 13, fontWeight: monthFilter === idx ? 800 : 600, color: THEME.navySoft }}>
//                                         {name}
//                                     </Typography>
//                                     <Typography sx={{ fontSize: 12, fontWeight: 700, color: THEME.muted }}>{monthCounts[idx]}</Typography>
//                                 </Stack>
//                             ))}
//                         </Stack>
//                     </Box>

//                     <Divider />

//                     {/* Filter by Type */}
//                     <Box>
//                         <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: THEME.navy, mb: 0.5 }}>Filter by Type</Typography>
//                         <Stack spacing={0}>
//                             {Object.keys(typeCounts).map((type) => (
//                                 <FormControlLabel
//                                     key={type}
//                                     sx={{ ml: 0, justifyContent: 'space-between', '& .MuiFormControlLabel-label': { fontSize: 13, color: THEME.navySoft, fontWeight: 600 } }}
//                                     control={
//                                         <Checkbox
//                                             size="small"
//                                             checked={typeFilters.includes(type)}
//                                             onChange={() => toggleType(type)}
//                                             sx={{ color: THEME.panelBorder, '&.Mui-checked': { color: THEME.accent } }}
//                                         />
//                                     }
//                                     label={`${type} (${typeCounts[type]})`}
//                                 />
//                             ))}
//                         </Stack>
//                     </Box>

//                     {(monthFilter !== 'all' || typeFilters.length > 0) && (
//                         <Button
//                             size="small"
//                             onClick={clearFilters}
//                             sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 700, color: THEME.accent, px: 0, '&:hover': { bgcolor: 'transparent' } }}
//                         >
//                             Clear filters
//                         </Button>
//                     )}
//                 </Stack>

//                 {/* Main content column — now full width, right sidebar removed */}
//                 <Box sx={{ flexGrow: 1, minWidth: 0 }}>
//                     {error && !loading && (
//                         <Alert severity="error" sx={{ mb: 2 }}>
//                             {error}
//                         </Alert>
//                     )}

//                     {/* ---------- Grid ---------- */}
//                     {loading ? (
//                         <Grid container spacing={2.5}>
//                             {Array.from({ length: 8 }).map((_, i) => (
//                                 <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }}>
//                                     <Skeleton variant="rounded" sx={{ borderRadius: 3, aspectRatio: '16 / 9' }} />
//                                     <Skeleton variant="text" width="70%" sx={{ mt: 1 }} />
//                                     <Skeleton variant="text" width="45%" />
//                                 </Grid>
//                             ))}
//                         </Grid>
//                     ) : (
//                         <>
//                             <Grid container spacing={2.5}>
//                                 {filteredList.map((festival) => (
//                                     <Grid key={festival.slug} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }}>
//                                         <FestivalCard festival={festival} onViewDetails={setActiveFestival} availableImages={availableImages} />
//                                     </Grid>
//                                 ))}
//                             </Grid>

//                             {filteredList.length === 0 && (
//                                 <Alert severity="info" sx={{ mt: 2 }}>
//                                     No festivals to show for this filter combination.
//                                 </Alert>
//                             )}
//                         </>
//                     )}

//                     {/* Newsletter — kept (it's wired to the real /newsletter API), just
//                         moved here as a full-width band since the right sidebar is gone */}
//                     <Box sx={{ maxWidth: 480, mt: 4 }}>
//                         <NewsletterBox />
//                     </Box>
//                 </Box>
//             </Box>

//             <FestivalDetailsDialog festival={activeFestival} onClose={() => setActiveFestival(null)} availableImages={availableImages} />

//             <Box sx={{ px: { xs: 2.5, md: 6 } }}>

//                 {/* ---------- Recurring Vrats ---------- */}
//                 <Divider sx={{ my: 4 }} />
//                 <Typography sx={{ fontWeight: 800, fontSize: 20, color: THEME.navy, mb: 2 }}>
//                     Recurring Fasts (Every Lunar Month)
//                 </Typography>
//                 <Grid container spacing={2.5}>
//                     {RECURRING_VRATS.map((vrat) => (
//                         <Grid key={vrat.id} size={{ xs: 12, sm: 6, md: 4 }}>
//                             <Card
//                                 elevation={0}
//                                 sx={{
//                                     p: 2.25,
//                                     borderRadius: 3,
//                                     border: `1px solid ${THEME.panelBorder}`,
//                                     boxShadow: THEME.shadow,
//                                     height: '100%'
//                                 }}
//                             >
//                                 <Typography sx={{ fontWeight: 700, fontSize: 15, color: THEME.navy, mb: 0.5 }}>{vrat.name}</Typography>
//                                 <Typography sx={{ fontSize: 13, color: THEME.navySoft, lineHeight: 1.55 }}>{vrat.blurb}</Typography>
//                             </Card>
//                         </Grid>
//                     ))}
//                 </Grid>

//                 {/* ---------- Muhurat CTA ---------- */}
//                 <Card
//                     elevation={0}
//                     sx={{
//                         mt: 4,
//                         p: 3,
//                         borderRadius: 3,
//                         bgcolor: THEME.navy,
//                         display: 'flex',
//                         flexDirection: { xs: 'column', sm: 'row' },
//                         alignItems: { xs: 'flex-start', sm: 'center' },
//                         justifyContent: 'space-between',
//                         gap: 2
//                     }}
//                 >
//                     <Stack direction="row" spacing={1.5} alignItems="center">
//                         <TbCompass size={22} color="#DDE6F5" />
//                         <Box>
//                             <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: 15 }}>
//                                 Want the exact Muhurat for a festival?
//                             </Typography>
//                             <Typography sx={{ color: '#B9C4E6', fontSize: 13 }}>
//                                 Dates above can shift by a day depending on your city — check the live Panchang for the precise timing.
//                             </Typography>
//                         </Box>
//                     </Stack>
//                     <Chip
//                         component={Link}
//                         href="/panchang-muhurat"
//                         clickable
//                         label="Open Panchang"
//                         icon={<TbArrowRight size={14} />}
//                         sx={{ bgcolor: '#FFFFFF', color: THEME.navy, fontWeight: 700, px: 1 }}
//                     />
//                 </Card>

//                 {/* ---------- Educational content ---------- */}
//                 <Box sx={{ mt: 5 }}>
//                     <Typography sx={{ fontWeight: 800, fontSize: 20, color: THEME.navy, mb: 1.5 }}>Why Festival Dates Change Every Year</Typography>
//                     <Typography sx={{ fontSize: 14, color: THEME.navySoft, lineHeight: 1.8, mb: 2 }}>
//                         Hindu festivals follow a lunisolar calendar, so most of them are tied to a specific Tithi (lunar day) rather than
//                         a fixed date on the Gregorian calendar. Because a lunar month is slightly shorter than a solar month, the same
//                         Tithi lands on a different date each year — which is why Diwali, Holi or Navratri never fall on the same day
//                         twice in a row. A handful of festivals, like Makar Sankranti and Pongal, are instead tied to the Sun's movement,
//                         so they stay close to the same date every year.
//                     </Typography>

//                     <Typography sx={{ fontWeight: 800, fontSize: 20, color: THEME.navy, mb: 1.5, mt: 3 }}>Muhurat: Why Timing Matters</Typography>
//                     <Typography sx={{ fontSize: 14, color: THEME.navySoft, lineHeight: 1.8 }}>
//                         Beyond just the date, Vedic tradition places importance on the exact window of time — the Muhurat — within
//                         which a puja, fast or ritual should begin for it to be most effective. This window is worked out from the five
//                         elements of the Panchang: Tithi, Vaar (weekday), Nakshatra, Yoga and Karana. Since sunrise, sunset and these
//                         planetary positions shift with location, the same festival can have a different Muhurat in two different
//                         cities — which is exactly what our Panchang page calculates for you.
//                     </Typography>
//                 </Box>
//             </Box>
//         </Box>
//     );
// }


'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// mui
import {
    Box,
    Card,
    Grid,
    Stack,
    Chip,
    Typography,
    Divider,
    Alert,
    Checkbox,
    FormControlLabel,
    IconButton,
    Dialog,
    DialogContent,
    Button,
    MenuItem,
    Select,
    TextField,
    Skeleton
} from '@mui/material';

// icons
import {
    TbCalendarEvent,
    TbSparkles,
    TbFlame,
    TbArrowRight,
    TbCompass,
    TbHeart,
    TbX,
    TbBell,
    TbCategory,
    TbHistory,
    TbChevronDown
} from 'react-icons/tb';

// data comes from the real backend built in step 1/2 (src/services/festival-service.js
// -> /api/festivals), not a static file, so anything added from the admin panel
// shows up here automatically — same pattern as vrat-upvas/index.js.
import { getFestivals as apiGetFestivals } from '@/services/festival-service';
import * as api from 'src/services';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Small fixed reference list for the "Recurring Vrat & Upvas" info panel —
// not date-specific data, so it stays local here (was RECURRING_VRATS in
// the old static file).
const RECURRING_VRATS = [
    { id: 'ekadashi', name: 'Ekadashi', frequency: 'Twice a month', blurb: '11th lunar day of each paksha — fasting dedicated to Lord Vishnu.' },
    { id: 'purnima', name: 'Purnima', frequency: 'Monthly', blurb: 'Full moon day — considered auspicious for worship and charity.' },
    { id: 'amavasya', name: 'Amavasya', frequency: 'Monthly', blurb: 'New moon day — ancestor worship (Pitru Tarpan) and remedies.' },
    { id: 'pradosh-vrat', name: 'Pradosh Vrat', frequency: 'Twice a month', blurb: 'Evening fast dedicated to Lord Shiva, on Trayodashi.' },
    { id: 'sankashti-chaturthi', name: 'Sankashti Chaturthi', frequency: 'Monthly', blurb: 'Fast dedicated to Lord Ganesha for removing obstacles.' },
    { id: 'masik-shivratri', name: 'Masik Shivratri', frequency: 'Monthly', blurb: 'Monthly night of Lord Shiva worship, before Amavasya.' }
];


// New saffron/warm colour family (Step 1 of the redesign) — kept local to
// this module only, so no other page on the site is affected. Same shape
// as the old THEME object, just a different palette.
// Chandra (चंद्र) — Silver White theme, base #DDE6F5. Moon governs time/tithi
// and the lunar calendar, so this cooler silvery-blue palette replaces the
// earlier saffron one across the whole page (every color below flows from
// these tokens, so this is the only place that needs to change).
const THEME = {
    navy: '#2B3A63',
    navySoft: '#46577E',
    accent: '#4C6FA5',
    bgGradient: '#FFFFFF',
    panelBorder: '#C9D6EE',
    iconBg: '#E7EEFA',
    muted: '#64748B',
    shadow: '0 6px 20px rgba(43, 58, 99, 0.08)',
    shadowLg: '0 16px 40px rgba(43, 58, 99, 0.16)'
};

const CATEGORY_COLORS = {
    Festival: { bg: '#FEE2E2', color: '#B91C1C' },
    Ekadashi: { bg: '#FCE7F3', color: '#BE185D' },
    'Pradosh Vrat': { bg: '#DBEAFE', color: '#1D4ED8' },
    Vrat: { bg: '#F3E8FF', color: '#7E22CE' },
    Purnima: { bg: '#FEF9C3', color: '#A16207' },
    Amavasya: { bg: '#E5E7EB', color: '#374151' },
    'Shubh Din': { bg: '#E7EEFA', color: '#3E5C94' },
    Other: { bg: '#F3E8FF', color: '#7E22CE' }
};

// Purely cosmetic — a small emoji "tile" standing in for a real photo on
// each card until real festival images are supplied. Category-based only,
// no new data field required.
const CATEGORY_ART = {
    Festival: { emoji: '🎉', bg: 'linear-gradient(135deg, #A9C0E8, #4C6FA5)' },
    Ekadashi: { emoji: '🪷', bg: 'linear-gradient(135deg, #F9A8D4, #DB2777)' },
    'Pradosh Vrat': { emoji: '🔱', bg: 'linear-gradient(135deg, #93C5FD, #2563EB)' },
    Vrat: { emoji: '📿', bg: 'linear-gradient(135deg, #D8B4FE, #9333EA)' },
    Purnima: { emoji: '🌕', bg: 'linear-gradient(135deg, #FDE68A, #CA8A04)' },
    Amavasya: { emoji: '🌑', bg: 'linear-gradient(135deg, #9CA3AF, #374151)' },
    'Shubh Din': { emoji: '✨', bg: 'linear-gradient(135deg, #E2E8F5, #93A6C9)' },
    Other: { emoji: '✨', bg: 'linear-gradient(135deg, #D8B4FE, #9333EA)' }
};

// --- Real festival photos ---------------------------------------------
//
// Drop real photos in `public/images/festivals/`, named after the
// festival — nothing to wire up per-entry, the filename is derived
// automatically from `festival.name`:
//   1. lowercase, spaces -> hyphens, punctuation stripped
//   2. save as .jpg
//
// Examples:
//   "Ganesh Visarjan"                  -> /images/festivals/ganesh-visarjan.jpg
//   "Holi (Dhulandi)"                  -> /images/festivals/holi-dhulandi.jpg
//   "Makar Sankranti"                  -> /images/festivals/makar-sankranti.jpg
//
// Several entries in the dataset share one name with an alternate name
// after a "/" (e.g. "Ganesh Chaturthi / Siddhivinayaka Chaturthi") — for
// those we also try each half on its own, so a single photo saved under
// either the combined name OR just one half will still be picked up:
//   "Ganesh Chaturthi / Siddhivinayaka Chaturthi" tries, in order:
//     /images/festivals/ganesh-chaturthi-siddhivinayaka-chaturthi.jpg
//     /images/festivals/ganesh-chaturthi.jpg
//     /images/festivals/siddhivinayaka-chaturthi.jpg
//
// Every occurrence of a recurring festival (Kalashtami, Ekadashi, etc.)
// shares the same one photo — no need for a picture per date. A festival
// with no matching file simply keeps the existing emoji/gradient tile
// (nothing breaks, nothing looks "broken" — the <img> onError swap is
// silent).
function slugifyFestivalName(name) {
    return name
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function getFestivalImageSlugs(name) {
    if (!name) return [];
    const combined = slugifyFestivalName(name.replace(/\//g, ' '));
    const halves = name.split('/').map((part) => slugifyFestivalName(part));
    // Strip any "(...)" suffix too — e.g. "Pradosh Vrat (Guru)" also tries
    // "pradosh-vrat", so ONE generic photo can cover every day-name variant
    // (Guru/Shukra/Shani/Ravi/Soma/Budha/Bhauma) of a recurring vrat instead
    // of needing 7 separate photos.
    const withoutParens = slugifyFestivalName(name.replace(/\([^)]*\)/g, ' '));
    return [...new Set([combined, withoutParens, ...halves].filter(Boolean))];
}

// Matches a festival name against the list of photos that ACTUALLY exist in
// public/images/festivals (read once on the server — see page.js — and
// passed down as `availableImages`). This is a plain in-memory lookup, not
// a client-side guess-and-check loop: previously each card fired up to 16
// speculative /images/festivals/<slug>.<ext> requests, which across ~70
// cards meant 1000+ parallel 404s and a page that took 40+ seconds to load.
function resolveFestivalImageSrc(name, availableImages) {
    if (!name || !availableImages || availableImages.length === 0) return null;
    const slugs = getFestivalImageSlugs(name);
    const bySlugLower = new Map(availableImages.map((f) => [f.toLowerCase().replace(/\.[^.]+$/, ''), f]));
    for (const slug of slugs) {
        const match = bySlugLower.get(slug.toLowerCase());
        if (match) return `/images/festivals/${match}`;
    }
    return null;
}

// Real photo when one exists (resolved server-side, see above), else the
// existing emoji/gradient tile — no network guessing on the client.
function FestivalArtBackground({ festival, art, availableImages }) {
    const src = useMemo(() => resolveFestivalImageSrc(festival?.name, availableImages), [festival?.name, availableImages]);
    if (!src) return <>{art.emoji}</>;

    return (
        <Image
            key={src}
            src={src}
            alt={festival.name}
            fill
            style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
            sizes="(max-width: 600px) 45vw, 260px"
        />
    );
}

function formatDateLabel(dateStr) {
    const d = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntil(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(`${dateStr}T00:00:00`);
    return Math.round((target - today) / 86400000);
}

function FestivalCard({ festival, onViewDetails, availableImages }) {
    const catStyle = CATEGORY_COLORS[festival.category] || CATEGORY_COLORS.Other;
    const art = CATEGORY_ART[festival.category] || CATEGORY_ART.Other;
    const remaining = daysUntil(festival.date);
    const d = new Date(`${festival.date}T00:00:00`);
    const dayNum = Number.isNaN(d.getTime()) ? '' : d.getDate();
    const monthShort = Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { month: 'short' });

    // Purely visual "favourite" toggle — local to this card, not persisted or
    // wired to any account/wishlist backend. Can be connected to the real
    // wishlist API later if wanted.
    const [liked, setLiked] = useState(false);

    return (
        <Card
            elevation={0}
            sx={{
                overflow: 'hidden',
                height: '100%',
                borderRadius: 4,
                border: `1px solid ${THEME.panelBorder}`,
                boxShadow: THEME.shadow,
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: THEME.shadowLg },
                '&:hover img': { transform: 'scale(1.06)' },
                '& img': { transition: 'transform 0.5s ease' }
            }}
        >
            {/* Real photo when one exists at public/images/festivals/<slug>.jpg,
                else the emoji/gradient tile — see FestivalArtBackground above.
                overflow: hidden so a tall/wide source photo still crops to
                this tile instead of spilling past the rounded corners. */}
            <Box sx={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', background: art.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                <FestivalArtBackground festival={festival} art={art} availableImages={availableImages} />

                {/* soft bottom fade so badges stay readable on any photo */}
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,28,52,0.55) 0%, rgba(20,28,52,0) 55%)', pointerEvents: 'none' }} />

                <Box
                    sx={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        bgcolor: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(6px)',
                        borderRadius: 2.5,
                        px: 1.25,
                        py: 0.5,
                        textAlign: 'center',
                        boxShadow: '0 6px 14px rgba(0,0,0,0.2)'
                    }}
                >
                    <Typography sx={{ fontSize: 16, fontWeight: 800, color: THEME.navy, lineHeight: 1 }}>{dayNum}</Typography>
                    <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: THEME.accent, textTransform: 'uppercase', lineHeight: 1.2 }}>
                        {monthShort}
                    </Typography>
                </Box>

                <IconButton
                    size="small"
                    onClick={() => setLiked((v) => !v)}
                    aria-label="Save festival"
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        '&:hover': { bgcolor: '#FFFFFF' }
                    }}
                >
                    <TbHeart size={16} color={liked ? '#DC2626' : THEME.muted} fill={liked ? '#DC2626' : 'none'} />
                </IconButton>

                {remaining >= 0 && remaining <= 30 && (
                    <Chip
                        size="small"
                        icon={<TbSparkles size={12} />}
                        label={remaining === 0 ? 'Today' : `In ${remaining}d`}
                        sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            bgcolor: THEME.accent,
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: 10.5,
                            height: 22
                        }}
                    />
                )}
            </Box>

            <Stack sx={{ p: 1.75, flexGrow: 1 }} spacing={0.65}>
                <Stack direction="row" spacing={0.75} flexWrap="wrap">
                    <Chip
                        size="small"
                        label={festival.category}
                        sx={{ bgcolor: catStyle.bg, color: catStyle.color, fontWeight: 700, fontSize: 10, height: 20 }}
                    />
                </Stack>

                <Typography
                    sx={{
                        fontWeight: 800,
                        fontSize: 15,
                        color: THEME.navy,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                    title={festival.name}
                >
                    {festival.name}
                </Typography>

                <Stack direction="row" spacing={0.75} alignItems="center">
                    <TbCalendarEvent size={12} color={THEME.muted} />
                    <Typography sx={{ fontSize: 11.5, color: THEME.muted, fontWeight: 600 }}>{formatDateLabel(festival.date)}</Typography>
                </Stack>

                <Typography
                    sx={{
                        fontSize: 12.5,
                        color: THEME.navySoft,
                        lineHeight: 1.5,
                        flexGrow: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}
                >
                    {festival.blurb}
                </Typography>

                <Button
                    size="small"
                    onClick={() => onViewDetails(festival)}
                    endIcon={<TbArrowRight size={14} />}
                    sx={{
                        alignSelf: 'flex-start',
                        textTransform: 'none',
                        fontWeight: 700,
                        color: THEME.accent,
                        px: 0,
                        '& .MuiButton-endIcon': { transition: 'transform 0.2s ease' },
                        '&:hover': { bgcolor: 'transparent', '& .MuiButton-endIcon': { transform: 'translateX(4px)' } }
                    }}
                >
                    View Details
                </Button>
            </Stack>
        </Card>
    );
}

// Simple in-page details popup — no new route added, just surfaces the same
// festival fields (name/date/category/blurb) that are already in the data.
function FestivalDetailsDialog({ festival, onClose, availableImages }) {
    if (!festival) return null;
    const catStyle = CATEGORY_COLORS[festival.category] || CATEGORY_COLORS.Other;
    const art = CATEGORY_ART[festival.category] || CATEGORY_ART.Other;

    return (
        <Dialog open={Boolean(festival)} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
            <Box sx={{ position: 'relative', height: 130, overflow: 'hidden', background: art.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                <FestivalArtBackground festival={festival} art={art} availableImages={availableImages} />
                <IconButton
                    size="small"
                    onClick={onClose}
                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#FFFFFF' } }}
                >
                    <TbX size={16} color={THEME.navy} />
                </IconButton>
            </Box>
            <DialogContent sx={{ p: 3 }}>
                <Chip size="small" label={festival.category} sx={{ bgcolor: catStyle.bg, color: catStyle.color, fontWeight: 700, mb: 1.5 }} />
                <Typography sx={{ fontWeight: 800, fontSize: 20, color: THEME.navy, mb: 0.75 }}>{festival.name}</Typography>
                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1.5 }}>
                    <TbCalendarEvent size={14} color={THEME.muted} />
                    <Typography sx={{ fontSize: 13, color: THEME.muted, fontWeight: 600 }}>{formatDateLabel(festival.date)}</Typography>
                </Stack>
                <Typography sx={{ fontSize: 14, color: THEME.navySoft, lineHeight: 1.7, mb: 2.5 }}>{festival.blurb}</Typography>
                <Button
                    component={Link}
                    href="/panchang-muhurat"
                    fullWidth
                    variant="contained"
                    endIcon={<TbCompass size={16} />}
                    sx={{ bgcolor: THEME.accent, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: THEME.navySoft } }}
                >
                    Check Muhurat for Your City
                </Button>
            </DialogContent>
        </Dialog>
    );
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "Never Miss a Festival" box — wired to the existing sendNewsletter API
// (src/services/index.js -> POST /newsletter), same endpoint already used
// elsewhere on the site. No new backend route added.
function NewsletterBox() {
    const [email, setEmail] = useState('');

    const { mutate, isPending: isLoading } = useMutation({
        mutationFn: api.sendNewsletter,
        onSuccess: (data) => {
            toast.success(data?.message || 'Subscribed!');
            setEmail('');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Something went wrong!');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!valid) {
            toast.error('Invalid email!');
            return;
        }
        mutate({ email });
    };

    return (
        <Card elevation={0} sx={{ p: 2.25, borderRadius: 3, border: `1px solid ${THEME.panelBorder}`, boxShadow: THEME.shadow }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <TbBell size={16} color={THEME.accent} />
                <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: THEME.navy }}>Never Miss a Festival</Typography>
            </Stack>
            <Typography sx={{ fontSize: 12, color: THEME.muted, mb: 1.5, lineHeight: 1.5 }}>
                Get updates for upcoming vrat, festival dates and puja guides.
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={1}>
                    <TextField
                        size="small"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#FFFFFF', fontSize: 13 } }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        disabled={isLoading}
                        variant="contained"
                        sx={{ bgcolor: THEME.accent, textTransform: 'none', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: THEME.navySoft } }}
                    >
                        {isLoading ? 'Sending...' : 'Send Me Reminders'}
                    </Button>
                </Stack>
            </Box>
        </Card>
    );
}

export default function Festivals({ availableImages = [] }) {
    const [tab, setTab] = useState('upcoming');
    // Opens on the month that is running right now (e.g. October), so the
    // person immediately sees what's relevant instead of the whole dataset.
    const currentMonth = new Date().getMonth();
    const [monthFilter, setMonthFilter] = useState(currentMonth); // 'all' | 0-11
    const [typeFilters, setTypeFilters] = useState([]); // empty = all categories
    const [activeFestival, setActiveFestival] = useState(null);
    // Defaults to the current year; the year switcher in the sidebar only
    // offers real years (no "All Years" option).
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);

    // Switching year: current year opens on the running month, any other
    // year opens on the full year (the running month means nothing there).
    const handleYearChange = (y) => {
        setSelectedYear(y);
        setMonthFilter(y === currentYear ? currentMonth : 'all');
    };

    // Full 2026 dataset from the Festival collection (DB), fetched once on
    // mount — the list is small (~240 entries/year) so we still filter/tab
    // client-side exactly like before, just off live data instead of the
    // static festivals-2026.js file. `limit: 1000` effectively means "give
    // me everything that matches", same as reading the whole static array.
    const [allFestivals, setAllFestivals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError('');
        apiGetFestivals({ limit: 1000 })
            .then((res) => {
                if (!cancelled) setAllFestivals(res?.data || []);
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err?.response?.data?.message || 'Could not load festivals. Please try again.');
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const todayDateOnly = () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const upcoming = useMemo(() => {
        const today = todayDateOnly();
        return [...allFestivals]
            .filter((f) => new Date(`${f.date}T00:00:00`) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [allFestivals]);

    const past = useMemo(() => {
        const today = todayDateOnly();
        return [...allFestivals]
            .filter((f) => new Date(`${f.date}T00:00:00`) < today)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [allFestivals]);

    const featured = useMemo(() => {
        if (allFestivals.length === 0) return null;
        const today = todayDateOnly();
        const sorted = [...allFestivals].sort((a, b) => new Date(a.date) - new Date(b.date));
        const todays = sorted.find((f) => new Date(`${f.date}T00:00:00`).getTime() === today.getTime());
        if (todays) return todays;
        const next = sorted.find((f) => new Date(`${f.date}T00:00:00`) >= today);
        return next || sorted[sorted.length - 1];
    }, [allFestivals]);

    // Years that exist in the data (always includes the current year), so a
    // future 2028 seed shows up here automatically.
    const availableYears = useMemo(() => {
        const years = new Set(allFestivals.map((f) => new Date(`${f.date}T00:00:00`).getFullYear()).filter((y) => !Number.isNaN(y)));
        years.add(currentYear);
        return [...years].sort((a, b) => a - b);
    }, [allFestivals, currentYear]);

    const inSelectedYear = (f) => new Date(`${f.date}T00:00:00`).getFullYear() === selectedYear;
    const upcomingCount = useMemo(() => upcoming.filter(inSelectedYear).length, [upcoming, selectedYear]);
    const pastCount = useMemo(() => past.filter(inSelectedYear).length, [past, selectedYear]);
    const allCount = useMemo(() => allFestivals.filter(inSelectedYear).length, [allFestivals, selectedYear]);

    const listForTab = tab === 'upcoming' ? upcoming : tab === 'past' ? past : allFestivals;

    // Counts for the sidebar — derived from whichever list the active tab is
    // showing (all / upcoming / already passed), so a number like "Jan 24"
    // only shows up when there really are 24 selectable results in Jan for
    // that tab. Previously these always counted the full 241-entry year,
    // which is why "Upcoming" + "Jan" could show a count but 0 results
    // (all of January had already passed).
    const yearScopedForTab = useMemo(() => {
        return listForTab.filter((f) => new Date(`${f.date}T00:00:00`).getFullYear() === selectedYear);
    }, [listForTab, selectedYear]);

    const monthCounts = useMemo(() => {
        const counts = Array(12).fill(0);
        yearScopedForTab.forEach((f) => {
            const m = new Date(`${f.date}T00:00:00`).getMonth();
            if (!Number.isNaN(m)) counts[m] += 1;
        });
        return counts;
    }, [yearScopedForTab]);

    const typeCounts = useMemo(() => {
        const counts = {};
        yearScopedForTab.forEach((f) => {
            counts[f.category] = (counts[f.category] || 0) + 1;
        });
        return counts;
    }, [yearScopedForTab]);

    const toggleType = (type) => {
        setTypeFilters((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
    };

    const clearFilters = () => {
        setMonthFilter('all');
        setTypeFilters([]);
    };

    const filteredList = useMemo(() => {
        return listForTab.filter((f) => {
            if (new Date(`${f.date}T00:00:00`).getFullYear() !== selectedYear) return false;
            if (monthFilter !== 'all') {
                const m = new Date(`${f.date}T00:00:00`).getMonth();
                if (m !== monthFilter) return false;
            }
            if (typeFilters.length > 0 && !typeFilters.includes(f.category)) return false;
            return true;
        });
    }, [listForTab, selectedYear, monthFilter, typeFilters]);

    return (
        <Box sx={{ background: THEME.bgGradient, borderRadius: 4, overflow: 'hidden' }}>
            {/* ---------- Hero (Step 1: banner with text baked in, same as the
                'promo' slide pattern on the homepage hero — no overlay text needed) ---------- */}
            {/* Place the supplied file at public/images/festivals-hero-banner.png */}
            <Box
                component="img"
                src="/images/festivals-hero-banner.png"
                alt="Panchang Festivals — Celebrating Dharma. Every Day."
                sx={{ width: '100%', height: 'auto', display: 'block' }}
            />

            {/* ---------- Today / Next Up strip ---------- */}
            {featured && (
                <Box sx={{ px: { xs: 2.5, md: 6 }, mt: -3, position: 'relative', zIndex: 2 }}>
                    <Card
                        elevation={0}
                        sx={{
                            p: 2.25,
                            maxWidth: 480,
                            borderRadius: 3,
                            bgcolor: '#FFFFFF',
                            boxShadow: THEME.shadowLg,
                            border: `1px solid ${THEME.panelBorder}`
                        }}
                    >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 2,
                                    bgcolor: THEME.iconBg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}
                            >
                                <TbFlame size={22} color={THEME.accent} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: THEME.muted, textTransform: 'uppercase' }}>
                                    Today / Next Up
                                </Typography>
                                <Typography sx={{ fontWeight: 800, fontSize: 17, color: THEME.navy }}>{featured.name}</Typography>
                                <Typography sx={{ fontSize: 12.5, color: THEME.muted }}>{formatDateLabel(featured.date)}</Typography>
                            </Box>
                        </Stack>
                    </Card>
                </Box>
            )}

            {/* ---------- Tabs: segmented control (only tabs backed by real data) ---------- */}
            <Box sx={{ px: { xs: 2.5, md: 6 }, pt: { xs: 3, md: 4 } }}>
                <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                        display: 'inline-flex',
                        maxWidth: '100%',
                        overflowX: 'auto',
                        p: 0.5,
                        borderRadius: 999,
                        bgcolor: '#F1F5FC',
                        border: `1px solid ${THEME.panelBorder}`,
                        boxShadow: 'inset 0 1px 2px rgba(43, 58, 99, 0.06)'
                    }}
                >
                    {[
                        { key: 'upcoming', label: 'Upcoming', count: upcomingCount, icon: <TbCalendarEvent size={16} /> },
                        { key: 'past', label: 'Already Passed', count: pastCount, icon: <TbHistory size={16} /> },
                        { key: 'all', label: 'All Festivals', count: allCount, icon: <TbCategory size={16} /> }
                    ].map((item) => {
                        const selected = tab === item.key;
                        return (
                            <Button
                                key={item.key}
                                size="small"
                                onClick={() => setTab(item.key)}
                                startIcon={item.icon}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: 13.5,
                                    borderRadius: 999,
                                    px: 2.25,
                                    minHeight: 38,
                                    whiteSpace: 'nowrap',
                                    color: selected ? '#FFFFFF' : THEME.navySoft,
                                    background: selected ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.navy})` : 'transparent',
                                    boxShadow: selected ? '0 6px 16px rgba(43, 58, 99, 0.28)' : 'none',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        background: selected ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.navy})` : '#FFFFFF'
                                    }
                                }}
                            >
                                {item.label}
                                <Box
                                    component="span"
                                    sx={{
                                        ml: 1,
                                        px: 0.9,
                                        minWidth: 24,
                                        borderRadius: 999,
                                        fontSize: 11.5,
                                        fontWeight: 800,
                                        lineHeight: '20px',
                                        textAlign: 'center',
                                        bgcolor: selected ? 'rgba(255,255,255,0.22)' : THEME.iconBg,
                                        color: selected ? '#FFFFFF' : THEME.accent
                                    }}
                                >
                                    {item.count}
                                </Box>
                            </Button>
                        );
                    })}
                </Stack>
            </Box>

            {/* ---------- Main 2-column shell: left filters | grid | right sidebar (Step 3) ---------- */}
            <Box sx={{ px: { xs: 2.5, md: 6 }, py: { xs: 3, md: 4 }, display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                {/* Left filter sidebar */}
                <Stack
                    spacing={2.5}
                    sx={{
                        display: { xs: 'none', md: 'flex' },
                        width: 250,
                        flexShrink: 0,
                        p: 2.5,
                        borderRadius: 4,
                        bgcolor: '#FFFFFF',
                        border: `1px solid ${THEME.panelBorder}`,
                        boxShadow: THEME.shadow,
                        position: 'sticky',
                        top: 96
                    }}
                >
                    {/* Year dropdown — shows the selected year (2026 by default);
                        opening it reveals the other real years (e.g. 2027). No "All Years". */}
                    <Box>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: THEME.navy, mb: 1, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                            Select Year
                        </Typography>
                        <Select
                            size="small"
                            fullWidth
                            value={selectedYear}
                            onChange={(e) => handleYearChange(e.target.value)}
                            IconComponent={TbChevronDown}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        mt: 0.75,
                                        borderRadius: 2.5,
                                        border: `1px solid ${THEME.panelBorder}`,
                                        boxShadow: THEME.shadowLg,
                                        '& .MuiMenuItem-root': { fontWeight: 700, fontSize: 14, color: THEME.navySoft, borderRadius: 1.5, mx: 0.75, my: 0.25 },
                                        '& .Mui-selected': { bgcolor: `${THEME.iconBg} !important`, color: THEME.navy }
                                    }
                                }
                            }}
                            sx={{
                                borderRadius: 2.5,
                                fontWeight: 800,
                                fontSize: 15,
                                color: THEME.navy,
                                bgcolor: '#F8FAFE',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: THEME.panelBorder },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: THEME.accent },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: THEME.accent, borderWidth: 1.5 },
                                '& .MuiSelect-icon': { right: 10, color: THEME.accent, fontSize: 18 }
                            }}
                        >
                            {availableYears.map((y) => (
                                <MenuItem key={y} value={y}>
                                    {y}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>

                    <Divider />

                    {/* Filter by Month */}
                    <Box>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: THEME.navy, mb: 1, textTransform: 'uppercase', letterSpacing: 0.8 }}>Filter by Month</Typography>
                        <Stack spacing={0.25}>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                onClick={() => setMonthFilter('all')}
                                sx={{
                                    cursor: 'pointer',
                                    px: 1,
                                    py: 0.6,
                                    borderRadius: 2,
                                    bgcolor: monthFilter === 'all' ? THEME.iconBg : 'transparent',
                                    borderLeft: `3px solid ${monthFilter === 'all' ? THEME.accent : 'transparent'}`,
                                    transition: 'all 0.15s ease',
                                    '&:hover': { bgcolor: THEME.iconBg }
                                }}
                            >
                                <Typography sx={{ fontSize: 13, fontWeight: monthFilter === 'all' ? 800 : 600, color: THEME.navySoft }}>
                                    All Months
                                </Typography>
                                <Typography sx={{ fontSize: 12, fontWeight: 700, color: THEME.muted }}>{yearScopedForTab.length}</Typography>
                            </Stack>
                            {MONTH_NAMES.map((name, idx) => (
                                <Stack
                                    key={name}
                                    direction="row"
                                    justifyContent="space-between"
                                    onClick={() => setMonthFilter(idx)}
                                    sx={{
                                        cursor: 'pointer',
                                        px: 1,
                                        py: 0.6,
                                        borderRadius: 2,
                                        bgcolor: monthFilter === idx ? THEME.iconBg : 'transparent',
                                        borderLeft: `3px solid ${monthFilter === idx ? THEME.accent : 'transparent'}`,
                                        opacity: monthCounts[idx] === 0 && monthFilter !== idx ? 0.5 : 1,
                                        transition: 'all 0.15s ease',
                                        '&:hover': { bgcolor: THEME.iconBg }
                                    }}
                                >
                                    <Typography sx={{ fontSize: 13, fontWeight: monthFilter === idx ? 800 : 600, color: THEME.navySoft }}>
                                        {name}
                                        {idx === currentMonth && selectedYear === currentYear && (
                                            <Box component="span" sx={{ display: 'inline-block', width: 6, height: 6, ml: 0.8, mb: 0.2, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                                        )}
                                    </Typography>
                                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: THEME.muted }}>{monthCounts[idx]}</Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </Box>

                    <Divider />

                    {/* Filter by Type */}
                    <Box>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: THEME.navy, mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.8 }}>Filter by Type</Typography>
                        <Stack spacing={0}>
                            {Object.keys(typeCounts).map((type) => (
                                <FormControlLabel
                                    key={type}
                                    sx={{ ml: 0, justifyContent: 'space-between', '& .MuiFormControlLabel-label': { fontSize: 13, color: THEME.navySoft, fontWeight: 600 } }}
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={typeFilters.includes(type)}
                                            onChange={() => toggleType(type)}
                                            sx={{ color: THEME.panelBorder, '&.Mui-checked': { color: THEME.accent } }}
                                        />
                                    }
                                    label={`${type} (${typeCounts[type]})`}
                                />
                            ))}
                        </Stack>
                    </Box>

                    {(monthFilter !== 'all' || typeFilters.length > 0) && (
                        <Button
                            size="small"
                            onClick={clearFilters}
                            sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 700, color: THEME.accent, px: 0, '&:hover': { bgcolor: 'transparent' } }}
                        >
                            Show full year
                        </Button>
                    )}
                </Stack>

                {/* Main content column — now full width, right sidebar removed */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    {error && !loading && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* ---------- Grid ---------- */}
                    {loading ? (
                        <Grid container spacing={2.5}>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }}>
                                    <Skeleton variant="rounded" sx={{ borderRadius: 3, aspectRatio: '16 / 9' }} />
                                    <Skeleton variant="text" width="70%" sx={{ mt: 1 }} />
                                    <Skeleton variant="text" width="45%" />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <>
                            <Grid container spacing={2.5}>
                                {filteredList.map((festival) => (
                                    <Grid key={festival.slug} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }}>
                                        <FestivalCard festival={festival} onViewDetails={setActiveFestival} availableImages={availableImages} />
                                    </Grid>
                                ))}
                            </Grid>

                            {filteredList.length === 0 && (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    No festivals to show for this filter combination.
                                </Alert>
                            )}
                        </>
                    )}

                    {/* Newsletter — kept (it's wired to the real /newsletter API), just
                        moved here as a full-width band since the right sidebar is gone */}
                    <Box sx={{ maxWidth: 480, mt: 4 }}>
                        <NewsletterBox />
                    </Box>
                </Box>
            </Box>

            <FestivalDetailsDialog festival={activeFestival} onClose={() => setActiveFestival(null)} availableImages={availableImages} />

            <Box sx={{ px: { xs: 2.5, md: 6 } }}>

                {/* ---------- Recurring Vrats ---------- */}
                <Divider sx={{ my: 4 }} />
                <Typography sx={{ fontWeight: 800, fontSize: 20, color: THEME.navy, mb: 2 }}>
                    Recurring Fasts (Every Lunar Month)
                </Typography>
                <Grid container spacing={2.5}>
                    {RECURRING_VRATS.map((vrat) => (
                        <Grid key={vrat.id} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card
                                elevation={0}
                                sx={{
                                    p: 2.25,
                                    borderRadius: 3,
                                    border: `1px solid ${THEME.panelBorder}`,
                                    boxShadow: THEME.shadow,
                                    height: '100%'
                                }}
                            >
                                <Typography sx={{ fontWeight: 700, fontSize: 15, color: THEME.navy, mb: 0.5 }}>{vrat.name}</Typography>
                                <Typography sx={{ fontSize: 13, color: THEME.navySoft, lineHeight: 1.55 }}>{vrat.blurb}</Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* ---------- Muhurat CTA ---------- */}
                <Card
                    elevation={0}
                    sx={{
                        mt: 4,
                        p: 3,
                        borderRadius: 3,
                        bgcolor: THEME.navy,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 2
                    }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <TbCompass size={22} color="#DDE6F5" />
                        <Box>
                            <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: 15 }}>
                                Want the exact Muhurat for a festival?
                            </Typography>
                            <Typography sx={{ color: '#B9C4E6', fontSize: 13 }}>
                                Dates above can shift by a day depending on your city — check the live Panchang for the precise timing.
                            </Typography>
                        </Box>
                    </Stack>
                    <Chip
                        component={Link}
                        href="/panchang-muhurat"
                        clickable
                        label="Open Panchang"
                        icon={<TbArrowRight size={14} />}
                        sx={{ bgcolor: '#FFFFFF', color: THEME.navy, fontWeight: 700, px: 1 }}
                    />
                </Card>

                {/* ---------- Educational content ---------- */}
                <Box sx={{ mt: 5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 20, color: THEME.navy, mb: 1.5 }}>Why Festival Dates Change Every Year</Typography>
                    <Typography sx={{ fontSize: 14, color: THEME.navySoft, lineHeight: 1.8, mb: 2 }}>
                        Hindu festivals follow a lunisolar calendar, so most of them are tied to a specific Tithi (lunar day) rather than
                        a fixed date on the Gregorian calendar. Because a lunar month is slightly shorter than a solar month, the same
                        Tithi lands on a different date each year — which is why Diwali, Holi or Navratri never fall on the same day
                        twice in a row. A handful of festivals, like Makar Sankranti and Pongal, are instead tied to the Sun's movement,
                        so they stay close to the same date every year.
                    </Typography>

                    <Typography sx={{ fontWeight: 800, fontSize: 20, color: THEME.navy, mb: 1.5, mt: 3 }}>Muhurat: Why Timing Matters</Typography>
                    <Typography sx={{ fontSize: 14, color: THEME.navySoft, lineHeight: 1.8 }}>
                        Beyond just the date, Vedic tradition places importance on the exact window of time — the Muhurat — within
                        which a puja, fast or ritual should begin for it to be most effective. This window is worked out from the five
                        elements of the Panchang: Tithi, Vaar (weekday), Nakshatra, Yoga and Karana. Since sunrise, sunset and these
                        planetary positions shift with location, the same festival can have a different Muhurat in two different
                        cities — which is exactly what our Panchang page calculates for you.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}