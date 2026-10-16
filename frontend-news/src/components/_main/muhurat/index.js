// 'use client';
// import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';

// // mui
// import {
//     Box,
//     Card,
//     Stack,
//     Chip,
//     Button,
//     IconButton,
//     MenuItem,
//     Select,
//     Popover,
//     Checkbox,
//     FormControlLabel,
//     Rating,
//     Skeleton,
//     Typography,
//     Table,
//     TableHead,
//     TableBody,
//     TableRow,
//     TableCell,
//     TableContainer,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     Divider
// } from '@mui/material';

// // icons
// import {
//     TbChevronLeft,
//     TbChevronRight,
//     TbCategory2,
//     TbHeartHandshake,
//     TbHome,
//     TbUserPlus,
//     TbGift,
//     TbCar,
//     TbMapPin,
//     TbBriefcase,
//     TbPlane,
//     TbSchool,
//     TbDots,
//     TbSparkles,
//     TbSun,
//     TbCalendar,
//     TbCalendarEvent,
//     TbListDetails,
//     TbShieldCheck,
//     TbOm,
//     TbCurrentLocation,
//     TbMapPin as TbLocationPin
// } from 'react-icons/tb';
// import { WiSunrise, WiSunset } from 'react-icons/wi';

// // services
// import { getPanchang, getPanchangCities, getMuhurat, getMuhuratMonth } from '@/services/panchang-service';

// // ----------------------------------------------------------------------
// // Theme tokens — same family used across Calendar / Vrat & Upvas so every
// // (spiritual) page feels like one product.
// // ----------------------------------------------------------------------
// // ----------------------------------------------------------------------
// // Theme tokens — same "Chandra" (silver-white/navy) palette used across
// // Panchang, Horoscope, Calendar and Vrat & Upvas, so every (spiritual)
// // page feels like one product instead of each having its own colors.
// // ----------------------------------------------------------------------
// const THEME = {
//     navy: '#2B3A63',
//     navySoft: '#46577E',
//     accent: '#4C6FA5',
//     accentSoft: '#E7EEFA',
//     bgGradient: 'linear-gradient(180deg, #DDE6F5 0%, #EEF3FC 45%, #FFFFFF 100%)',
//     panelBorder: '#C9D6EE',
//     iconBg: '#E7EEFA',
//     muted: '#64748B',
//     auspicious: '#2E9E5B',
//     moderate: '#D97706',
//     inauspicious: '#C0392B',
//     shadow: '0 6px 20px rgba(43, 58, 99, 0.08)',
//     shadowLg: '0 16px 40px rgba(43, 58, 99, 0.16)'
// };

// const TONE_COLOR = { auspicious: THEME.auspicious, moderate: THEME.moderate, inauspicious: THEME.inauspicious };

// // Thin, brand-colored scrollbar for the horizontally-scrollable chip row and
// // table — without this, browsers/OS render their own bulky native scrollbar
// // (complete with arrow buttons on Windows/Firefox), which clashes with the
// // flat, rounded look of everything else on the page.
// const THIN_SCROLLBAR_X = {
//     scrollbarWidth: 'thin', // Firefox
//     scrollbarColor: `${THEME.panelBorder} transparent`, // Firefox
//     '&::-webkit-scrollbar': { height: 6 },
//     '&::-webkit-scrollbar-track': { background: 'transparent' },
//     '&::-webkit-scrollbar-thumb': { background: THEME.panelBorder, borderRadius: 999 },
//     '&::-webkit-scrollbar-button': { display: 'none', width: 0, height: 0 }
// };

// // Hero banner — plain full-width image, text is already baked into it
// // (same convention as /calendar and /vrat-upvas).
// const HERO_BANNER_SRC = '/images/muhurat-hero-banner.png';

// const MUHURAT_CATEGORIES = [
//     { id: 'vivah', chipLabel: 'Vivah Muhurt', sidebarLabel: 'Vivah (Marriage)', icon: TbHeartHandshake },
//     { id: 'griha-pravesh', chipLabel: 'Griha Pravesh', sidebarLabel: 'Griha Pravesh', icon: TbHome },
//     { id: 'namkaran', chipLabel: 'Namkaran', sidebarLabel: 'Namkaran', icon: TbUserPlus },
//     { id: 'annaprashan', chipLabel: 'Annaprashan', sidebarLabel: 'Annaprashan', icon: TbGift },
//     { id: 'vehicle', chipLabel: 'Vehicle Purchase', sidebarLabel: 'Vehicle Purchase', icon: TbCar },
//     { id: 'property', chipLabel: 'Property Purchase', sidebarLabel: 'Property Purchase', icon: TbMapPin },
//     { id: 'business', chipLabel: 'Business Start', sidebarLabel: 'Business Start', icon: TbBriefcase },
//     { id: 'travel', chipLabel: 'Travel Muhurt', sidebarLabel: 'Travel', icon: TbPlane },
//     { id: 'education', chipLabel: 'Education', sidebarLabel: 'Education', icon: TbSchool },
//     { id: 'others', chipLabel: 'Others', sidebarLabel: 'Others', icon: TbDots }
// ];

// const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// const MOST_POPULAR = [
//     { id: 'vivah', label: 'Vivah Muhurt', sub: 'Find best marriage timings', icon: TbHeartHandshake },
//     { id: 'griha-pravesh', label: 'Griha Pravesh Muhurat', sub: 'Auspicious home entry', icon: TbHome },
//     { id: 'vehicle', label: 'Vehicle Purchase Muhurat', sub: 'Buy with positive energy', icon: TbCar },
//     { id: 'business', label: 'Business Start Muhurat', sub: 'Begin your venture', icon: TbBriefcase },
//     { id: 'annaprashan', label: 'Annaprashan Muhurat', sub: 'First food ceremony', icon: TbGift }
// ];

// function toDateInputValue(d = new Date()) {
//     return d.toLocaleDateString('en-CA');
// }

// function formatTime(value) {
//     if (!value) return '--';
//     const date = typeof value === 'string' ? new Date(value) : value;
//     if (Number.isNaN(date.getTime())) return '--';
//     return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
// }

// function addMinutes(date, mins) {
//     return new Date(date.getTime() + mins * 60000);
// }

// // Builds a 6x7 mini-calendar grid, same trick as the Calendar page.
// function buildMonthGrid(year, monthIdx) {
//     const firstOfMonth = new Date(year, monthIdx, 1);
//     const startOffset = firstOfMonth.getDay();
//     const gridStart = new Date(year, monthIdx, 1 - startOffset);
//     const cells = [];
//     for (let i = 0; i < 42; i++) {
//         const date = new Date(gridStart);
//         date.setDate(gridStart.getDate() + i);
//         cells.push(date);
//     }
//     return cells;
// }

// // Icon lookup for each row id — backend sends plain data (can't serialize
// // React components over JSON), so icons are attached client-side by id.
// const MUHURAT_ROW_ICONS = {
//     brahma: TbSparkles,
//     abhijit: TbSun,
//     'griha-pravesh': TbHome,
//     namkaran: TbUserPlus,
//     annaprashan: TbGift,
//     vivah: TbHeartHandshake,
//     vehicle: TbCar,
//     property: TbMapPin,
//     business: TbBriefcase,
//     education: TbSchool,
//     travel: TbPlane
// };

// // Turns the real, calculated rows returned by GET /panchang/muhurat into the
// // shape the table/UI expects: parses start/end into Date objects and attaches
// // the matching icon component. All the actual Muhurat calculation (Choghadiya +
// // Tithi/Nakshatra/Weekday suitability rules) happens on the backend now — see
// // backend/src/utils/muhurat-rules-util.js — nothing here is fabricated client-side.
// function mapMuhuratApiRows(apiRows) {
//     if (!Array.isArray(apiRows)) return [];
//     return apiRows
//         .map((row) => ({
//             ...row,
//             start: new Date(row.start),
//             end: new Date(row.end),
//             icon: MUHURAT_ROW_ICONS[row.id] || TbSparkles
//         }))
//         .sort((a, b) => a.start - b.start);
// }

// function haversineKm(lat1, lng1, lat2, lng2) {
//     const toRad = (d) => (d * Math.PI) / 180;
//     const R = 6371;
//     const dLat = toRad(lat2 - lat1);
//     const dLng = toRad(lng2 - lng1);
//     const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
//     return 2 * R * Math.asin(Math.sqrt(a));
// }

// export default function Muhurat() {
//     const today = useMemo(() => new Date(), []);
//     const [viewMonth, setViewMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
//     const [selectedDate, setSelectedDate] = useState(toDateInputValue(today));
//     const [cities, setCities] = useState([]);
//     const [selectedCity, setSelectedCity] = useState('New Delhi');
//     // GPS auto-detected location — same idea as DrikPanchang's own location
//     // resolution: try the browser's geolocation first and use exact
//     // lat/lng for the Panchang calculation (the backend already accepts
//     // lat/lng directly, see panchang-service.js), falling back to the
//     // manually-picked/default city if permission is denied, unsupported,
//     // or times out. "nearestLabel" is just for display — the nearest known
//     // city name shown next to the pin — the actual calculation still uses
//     // the browser's precise coordinates, not that city's coordinates.
//     const [gpsLocation, setGpsLocation] = useState(null); // { lat, lng, nearestLabel }
//     const [locationSource, setLocationSource] = useState('city'); // 'gps' | 'city'
//     const [locationLoading, setLocationLoading] = useState(true);
//     const [cityAnchor, setCityAnchor] = useState(null);
//     const [panchang, setPanchang] = useState(null);
//     const [muhuratApiRows, setMuhuratApiRows] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [purposeFilters, setPurposeFilters] = useState([]);
//     const [detailsRow, setDetailsRow] = useState(null);
//     // "This Month" quick link — real, calculated list of every auspicious
//     // date (+ exact Muhurat interval) for a category across the currently
//     // viewed month, from GET /panchang/muhurat/month (see muhurat-rules-util.js
//     // on the backend). Nothing fabricated client-side — same as the main table.
//     const [monthlyOpen, setMonthlyOpen] = useState(false);
//     const [monthlyLoading, setMonthlyLoading] = useState(false);
//     const [monthlyError, setMonthlyError] = useState(null);
//     const [monthlyResult, setMonthlyResult] = useState(null); // { category, dates: [...] }
//     const tableRef = useRef(null);
//     const dateCardRef = useRef(null);

//     useEffect(() => {
//         getPanchangCities()
//             .then((res) => setCities(res?.data || []))
//             .catch(() => setCities([]));
//     }, []);

//     // Try to auto-fetch the user's current location once, on first load —
//     // matches how DrikPanchang resolves a visitor's city automatically
//     // instead of always defaulting to New Delhi. If the user has already
//     // picked a city by hand this session, that always wins (see the
//     // `locationSource === 'city'` guard below, flipped by handleManualCity).
//     useEffect(() => {
//         if (typeof window === 'undefined' || !navigator.geolocation) {
//             setLocationLoading(false);
//             return;
//         }
//         navigator.geolocation.getCurrentPosition(
//             (pos) => {
//                 const { latitude, longitude } = pos.coords;
//                 setGpsLocation((prev) => ({ ...prev, lat: latitude, lng: longitude }));
//                 setLocationSource('gps');
//                 setLocationLoading(false);
//             },
//             () => {
//                 // permission denied / unavailable / timed out — silently
//                 // keep the default city, same as DrikPanchang falls back
//                 // to its default location when it can't resolve one.
//                 setLocationLoading(false);
//             },
//             { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 }
//         );
//     }, []);

//     // Once we have both the GPS coordinates and the known-city list, resolve
//     // a friendly "near <city>" label for display purposes only.
//     useEffect(() => {
//         if (!gpsLocation?.lat || !cities.length) return;
//         let nearest = null;
//         let nearestDist = Infinity;
//         cities.forEach((c) => {
//             const d = haversineKm(gpsLocation.lat, gpsLocation.lng, c.lat, c.lng);
//             if (d < nearestDist) {
//                 nearestDist = d;
//                 nearest = c.city;
//             }
//         });
//         if (nearest) setGpsLocation((prev) => (prev ? { ...prev, nearestLabel: nearest } : prev));
//     }, [gpsLocation?.lat, gpsLocation?.lng, cities]);

//     const handleManualCity = (cityName) => {
//         setSelectedCity(cityName);
//         setLocationSource('city');
//         setCityAnchor(null);
//     };

//     const handleUseMyLocation = () => {
//         if (gpsLocation?.lat) setLocationSource('gps');
//         setCityAnchor(null);
//     };

//     const activeLocation = useMemo(() => {
//         if (locationSource === 'gps' && gpsLocation?.lat) {
//             return { lat: gpsLocation.lat, lng: gpsLocation.lng, label: gpsLocation.nearestLabel ? `Near ${gpsLocation.nearestLabel}` : 'Your Location' };
//         }
//         return { city: selectedCity, label: selectedCity };
//     }, [locationSource, gpsLocation, selectedCity]);

//     // Fetches BOTH the general Panchang (sunrise/sunset/tithi card etc — used
//     // elsewhere on the page) AND the real, calculated Muhurat table from the
//     // new /panchang/muhurat endpoint (see muhurat-rules-util.js on the
//     // backend). Run in parallel since they're independent requests.
//     const fetchForDate = useCallback(async (dateStr, location) => {
//         setLoading(true);
//         setError(null);
//         try {
//             const [panchangRes, muhuratRes] = await Promise.all([
//                 getPanchang({ date: dateStr, lat: location.lat, lng: location.lng, city: location.city }),
//                 getMuhurat({ date: dateStr, lat: location.lat, lng: location.lng, city: location.city })
//             ]);
//             setPanchang(panchangRes?.data || null);
//             setMuhuratApiRows(muhuratRes?.data?.muhurats || []);
//         } catch (err) {
//             setError(err?.response?.data?.message || 'Muhurat data is temporarily unavailable. Please try again in a moment.');
//             setPanchang(null);
//             setMuhuratApiRows([]);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         if (locationLoading) return; // wait for the one-time geolocation attempt to settle first
//         fetchForDate(selectedDate, activeLocation);
//     }, [selectedDate, activeLocation, locationLoading, fetchForDate]);

//     const monthCells = useMemo(() => buildMonthGrid(viewMonth.year, viewMonth.month), [viewMonth]);
//     const muhuratRows = useMemo(() => mapMuhuratApiRows(muhuratApiRows), [muhuratApiRows]);

//     const visibleRows = useMemo(() => {
//         if (purposeFilters.length === 0) return muhuratRows;
//         return muhuratRows.filter((r) => purposeFilters.includes(r.category));
//     }, [muhuratRows, purposeFilters]);

//     const activeChip = purposeFilters.length === 1 ? purposeFilters[0] : 'all';

//     const toggleCategory = (id) => {
//         setPurposeFilters((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
//     };

//     const selectSingleCategory = (id) => {
//         setPurposeFilters(id === 'all' ? [] : [id]);
//     };

//     const goToMonth = (delta) => {
//         setViewMonth((prev) => {
//             const d = new Date(prev.year, prev.month + delta, 1);
//             return { year: d.getFullYear(), month: d.getMonth() };
//         });
//     };

//     const goToToday = () => {
//         const t = new Date();
//         setViewMonth({ year: t.getFullYear(), month: t.getMonth() });
//         setSelectedDate(toDateInputValue(t));
//     };

//     const jumpToPopular = (id) => {
//         selectSingleCategory(id);
//         tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     };

//     // "This Month" quick link — uses whichever single category is currently
//     // selected (falls back to Griha Pravesh when "All Muhurats" is active,
//     // since the month finder is per-category, same as DrikPanchang's own
//     // muhurat pages), for the month currently shown in the mini calendar.
//     const openMonthlyMuhurat = async (categoryOverride) => {
//         const category = categoryOverride || (purposeFilters.length === 1 ? purposeFilters[0] : 'griha-pravesh');
//         setMonthlyOpen(true);
//         setMonthlyLoading(true);
//         setMonthlyError(null);
//         try {
//             const res = await getMuhuratMonth({
//                 year: viewMonth.year,
//                 month: viewMonth.month + 1,
//                 category,
//                 lat: activeLocation.lat,
//                 lng: activeLocation.lng,
//                 city: activeLocation.city
//             });
//             setMonthlyResult(res?.data || null);
//         } catch (err) {
//             setMonthlyError(err?.response?.data?.message || 'Monthly Muhurat data is temporarily unavailable. Please try again in a moment.');
//             setMonthlyResult(null);
//         } finally {
//             setMonthlyLoading(false);
//         }
//     };

//     const selectedDateObj = new Date(`${selectedDate}T00:00:00`);
//     const dateLabel = selectedDateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
//     const weekdayLabel = selectedDateObj.toLocaleDateString('en-IN', { weekday: 'long' });

//     return (
//         <Box sx={{ overflowX: 'hidden', maxWidth: '100%' }}>
//             {/* ---------------------------------------------------------- */}
//             {/* HERO BANNER — same treatment as Calendar / Vrat & Upvas:    */}
//             {/* sits directly below the navbar (outside the padded panel), */}
//             {/* plain full-width image, text baked into the art itself.    */}
//             {/* Fixed aspect-ratio (matched to the Vrat & Upvas banner) +   */}
//             {/* objectFit: cover, so this renders at the exact same height */}
//             {/* as that banner regardless of this PNG's own dimensions —   */}
//             {/* before this, the raw image's own (taller) aspect ratio was */}
//             {/* making this banner visibly bigger than the other pages'.   */}
//             {/* ---------------------------------------------------------- */}
//             <Box sx={{ position: 'relative', mb: 3 }}>
//                 <Box
//                     component="img"
//                     src={HERO_BANNER_SRC}
//                     alt="Panchang Muhurat — Auspicious Timings for a Blessed Beginning"
//                     sx={{
//                         width: '100%',
//                         aspectRatio: '4.08 / 1',
//                         height: 'auto',
//                         objectFit: 'cover',
//                         objectPosition: 'center',
//                         display: 'block',
//                         borderRadius: 4,
//                         boxShadow: THEME.shadow
//                     }}
//                 />
//                 <Typography
//                     component="h1"
//                     sx={{
//                         position: 'absolute',
//                         top: 0,
//                         left: 0,
//                         width: 1,
//                         height: 1,
//                         p: 0,
//                         m: 0,
//                         overflow: 'hidden',
//                         clip: 'rect(0 0 0 0)',
//                         whiteSpace: 'nowrap',
//                         border: 0
//                     }}
//                 >
//                     Panchang Muhurat — Auspicious Timings for a Blessed Beginning
//                 </Typography>
//             </Box>

//             <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 3, p: { xs: 2, md: 3 } }}>
//                 {/* ---------------------------------------------------------- */}
//                 {/* CATEGORY FILTER CHIPS — horizontally scrollable row        */}
//                 {/* ---------------------------------------------------------- */}
//                 <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1, mb: 3, ...THIN_SCROLLBAR_X }}>
//                     <Chip
//                         clickable
//                         icon={<TbCategory2 size={15} />}
//                         label="All Muhurats"
//                         onClick={() => selectSingleCategory('all')}
//                         sx={{
//                             fontWeight: 700,
//                             px: 0.5,
//                             whiteSpace: 'nowrap',
//                             bgcolor: activeChip === 'all' ? THEME.accent : '#fff',
//                             color: activeChip === 'all' ? '#fff' : THEME.navy,
//                             border: `1px solid ${activeChip === 'all' ? THEME.accent : THEME.panelBorder}`
//                         }}
//                     />
//                     {MUHURAT_CATEGORIES.map((cat) => (
//                         <Chip
//                             key={cat.id}
//                             clickable
//                             icon={<cat.icon size={15} />}
//                             label={cat.chipLabel}
//                             onClick={() => selectSingleCategory(cat.id)}
//                             sx={{
//                                 fontWeight: 700,
//                                 px: 0.5,
//                                 whiteSpace: 'nowrap',
//                                 bgcolor: activeChip === cat.id ? THEME.accent : '#fff',
//                                 color: activeChip === cat.id ? '#fff' : THEME.navy,
//                                 border: `1px solid ${activeChip === cat.id ? THEME.accent : THEME.panelBorder}`
//                             }}
//                         />
//                     ))}
//                 </Stack>

//                 {/* ---------------------------------------------------------- */}
//                 {/* MAIN 3-COLUMN LAYOUT — plain CSS Grid (see Calendar page   */}
//                 {/* for why: MUI <Grid item xs={fraction}> silently breaks     */}
//                 {/* on non-integer values, CSS Grid never has that problem).   */}
//                 {/* ---------------------------------------------------------- */}
//                 <Box
//                     sx={{
//                         display: 'grid',
//                         gridTemplateColumns: { xs: '1fr', lg: '280px minmax(0, 1fr) 300px' },
//                         gap: 3,
//                         alignItems: 'start',
//                         minWidth: 0
//                     }}
//                 >
//                     {/* LEFT SIDEBAR */}
//                     <Stack spacing={2}>
//                         <Card ref={dateCardRef} sx={{ p: 2, borderRadius: 3, boxShadow: THEME.shadow }}>
//                             <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
//                                 <Typography sx={{ fontWeight: 700, fontSize: 13, color: THEME.navy }}>Select Date</Typography>
//                             </Stack>
//                             <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
//                                 <IconButton size="small" onClick={() => goToMonth(-1)}>
//                                     <TbChevronLeft />
//                                 </IconButton>
//                                 <Typography sx={{ fontWeight: 700, color: THEME.navy, fontSize: 13.5 }}>
//                                     {new Date(viewMonth.year, viewMonth.month, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
//                                 </Typography>
//                                 <IconButton size="small" onClick={() => goToMonth(1)}>
//                                     <TbChevronRight />
//                                 </IconButton>
//                             </Stack>
//                             <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', mb: 0.5 }}>
//                                 {WEEKDAY_LABELS.map((d) => (
//                                     <Typography key={d} sx={{ textAlign: 'center', fontSize: 10.5, color: THEME.muted, fontWeight: 700 }}>
//                                         {d}
//                                     </Typography>
//                                 ))}
//                             </Box>
//                             <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 0.25 }}>
//                                 {monthCells.map((date, i) => {
//                                     const inMonth = date.getMonth() === viewMonth.month;
//                                     const dateStr = toDateInputValue(date);
//                                     const isSelected = dateStr === selectedDate;
//                                     return (
//                                         <Box
//                                             key={i}
//                                             onClick={() => setSelectedDate(dateStr)}
//                                             sx={{
//                                                 cursor: 'pointer',
//                                                 textAlign: 'center',
//                                                 py: 0.5,
//                                                 borderRadius: 1.5,
//                                                 fontSize: 12,
//                                                 fontWeight: isSelected ? 700 : 500,
//                                                 color: isSelected ? '#fff' : THEME.navy,
//                                                 bgcolor: isSelected ? THEME.accent : 'transparent',
//                                                 opacity: inMonth ? 1 : 0.35,
//                                                 '&:hover': { bgcolor: isSelected ? THEME.accent : THEME.panelBorder }
//                                             }}
//                                         >
//                                             {date.getDate()}
//                                         </Box>
//                                     );
//                                 })}
//                             </Box>
//                         </Card>

//                         <Card sx={{ p: 1, borderRadius: 3, boxShadow: THEME.shadow }}>
//                             <Typography sx={{ fontWeight: 700, fontSize: 12.5, color: THEME.navy, px: 1, pt: 0.5, pb: 1 }}>
//                                 Quick Links
//                             </Typography>
//                             <Stack spacing={0.5}>
//                                 <Button
//                                     startIcon={<TbCalendarEvent size={17} />}
//                                     onClick={goToToday}
//                                     sx={{
//                                         justifyContent: 'flex-start',
//                                         px: 1.5,
//                                         py: 0.75,
//                                         borderRadius: 2,
//                                         fontWeight: 600,
//                                         fontSize: 13,
//                                         textTransform: 'none',
//                                         color: THEME.navy,
//                                         '&:hover': { bgcolor: THEME.panelBorder }
//                                     }}
//                                 >
//                                     Today&apos;s Muhurat
//                                 </Button>
//                                 <Stack
//                                     direction="row"
//                                     alignItems="center"
//                                     spacing={0.5}
//                                     sx={{ px: 1.5, py: 0.75, opacity: 0.45 }}
//                                 >
//                                     <TbListDetails size={17} color={THEME.navy} />
//                                     <Typography sx={{ fontWeight: 600, fontSize: 13, color: THEME.navy }}>This Week</Typography>
//                                     <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: THEME.accent }}>SOON</Typography>
//                                 </Stack>
//                                 <Button
//                                     startIcon={<TbListDetails size={17} />}
//                                     onClick={() => openMonthlyMuhurat()}
//                                     sx={{
//                                         justifyContent: 'flex-start',
//                                         px: 1.5,
//                                         py: 0.75,
//                                         borderRadius: 2,
//                                         fontWeight: 600,
//                                         fontSize: 13,
//                                         textTransform: 'none',
//                                         color: THEME.navy,
//                                         '&:hover': { bgcolor: THEME.panelBorder }
//                                     }}
//                                 >
//                                     This Month&apos;s Dates
//                                 </Button>
//                                 <Button
//                                     startIcon={<TbCalendar size={17} />}
//                                     onClick={() => dateCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
//                                     sx={{
//                                         justifyContent: 'flex-start',
//                                         px: 1.5,
//                                         py: 0.75,
//                                         borderRadius: 2,
//                                         fontWeight: 600,
//                                         fontSize: 13,
//                                         textTransform: 'none',
//                                         color: THEME.navy,
//                                         '&:hover': { bgcolor: THEME.panelBorder }
//                                     }}
//                                 >
//                                     Custom Date
//                                 </Button>
//                             </Stack>
//                         </Card>

//                         <Card sx={{ p: 2, borderRadius: 3, boxShadow: THEME.shadow }}>
//                             <Typography sx={{ fontWeight: 700, fontSize: 12.5, color: THEME.navy, mb: 1 }}>
//                                 Filter by Purpose
//                             </Typography>
//                             <Stack spacing={0.25}>
//                                 {MUHURAT_CATEGORIES.map((cat) => (
//                                     <FormControlLabel
//                                         key={cat.id}
//                                         control={
//                                             <Checkbox
//                                                 size="small"
//                                                 checked={purposeFilters.includes(cat.id)}
//                                                 onChange={() => toggleCategory(cat.id)}
//                                                 sx={{ color: THEME.panelBorder, '&.Mui-checked': { color: THEME.accent } }}
//                                             />
//                                         }
//                                         label={<Typography sx={{ fontSize: 12.5, color: THEME.navySoft }}>{cat.sidebarLabel}</Typography>}
//                                         sx={{ ml: 0 }}
//                                     />
//                                 ))}
//                             </Stack>
//                         </Card>
//                     </Stack>

//                     {/* MAIN TABLE */}
//                     <Card ref={tableRef} sx={{ p: { xs: 1.5, md: 2.5 }, borderRadius: 3, boxShadow: THEME.shadow, minWidth: 0 }}>
//                         <Stack
//                             direction={{ xs: 'column', sm: 'row' }}
//                             alignItems={{ xs: 'flex-start', sm: 'center' }}
//                             justifyContent="space-between"
//                             spacing={1.5}
//                             sx={{ mb: 2 }}
//                         >
//                             <Box>
//                                 <Typography sx={{ fontWeight: 800, color: THEME.navy, fontSize: 18 }}>
//                                     Muhurat for {dateLabel}
//                                 </Typography>
//                                 <Typography sx={{ fontSize: 12.5, color: THEME.muted }}>
//                                     Auspicious timings based on Vedic astrology, Panchang and planetary positions.
//                                 </Typography>
//                             </Box>
//                             <Chip
//                                 icon={<TbLocationPin size={15} color={THEME.accent} />}
//                                 onClick={(e) => setCityAnchor(e.currentTarget)}
//                                 label={
//                                     <Stack direction="row" spacing={0.75} alignItems="center">
//                                         <span>{activeLocation.label}</span>
//                                         <Typography component="span" sx={{ fontSize: 11.5, fontWeight: 700, color: THEME.accent }}>
//                                             Change
//                                         </Typography>
//                                     </Stack>
//                                 }
//                                 sx={{ bgcolor: '#fff', border: `1px solid ${THEME.panelBorder}`, fontWeight: 600, cursor: 'pointer' }}
//                             />
//                             <Popover
//                                 open={Boolean(cityAnchor)}
//                                 anchorEl={cityAnchor}
//                                 onClose={() => setCityAnchor(null)}
//                                 anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//                             >
//                                 <Stack sx={{ p: 1, minWidth: 220 }} spacing={0.5}>
//                                     <Button
//                                         size="small"
//                                         startIcon={<TbCurrentLocation size={15} />}
//                                         disabled={!gpsLocation?.lat}
//                                         onClick={handleUseMyLocation}
//                                         sx={{ justifyContent: 'flex-start', textTransform: 'none', fontWeight: 700, color: THEME.accent }}
//                                     >
//                                         {gpsLocation?.lat ? 'Use My Current Location' : 'Locating…'}
//                                     </Button>
//                                     <Select
//                                         autoFocus
//                                         size="small"
//                                         value={selectedCity}
//                                         onChange={(e) => handleManualCity(e.target.value)}
//                                         sx={{ minWidth: 200 }}
//                                     >
//                                         <MenuItem value="New Delhi">New Delhi, Delhi</MenuItem>
//                                         {cities
//                                             .filter((c) => c.city !== 'New Delhi')
//                                             .map((c) => (
//                                                 <MenuItem key={c.city} value={c.city}>
//                                                     {c.city}
//                                                 </MenuItem>
//                                             ))}
//                                     </Select>
//                                 </Stack>
//                             </Popover>
//                         </Stack>

//                         {loading ? (
//                             <Stack spacing={1.25}>
//                                 {[...Array(6)].map((_, i) => (
//                                     <Skeleton key={i} height={48} />
//                                 ))}
//                             </Stack>
//                         ) : error ? (
//                             <Typography sx={{ fontSize: 12.5, color: THEME.inauspicious }}>{error}</Typography>
//                         ) : visibleRows.length === 0 ? (
//                             <Typography sx={{ fontSize: 13, color: THEME.muted, py: 4, textAlign: 'center' }}>
//                                 No muhurat entries match this filter for the selected date.
//                             </Typography>
//                         ) : (
//                             <TableContainer sx={{ overflowX: 'auto', ...THIN_SCROLLBAR_X }}>
//                                 <Table size="small" sx={{ minWidth: 640 }}>
//                                     <TableHead>
//                                         <TableRow sx={{ '& th': { border: 0, color: THEME.muted, fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 } }}>
//                                             <TableCell>Time</TableCell>
//                                             <TableCell>Muhurat Name</TableCell>
//                                             <TableCell>Purpose</TableCell>
//                                             <TableCell>Auspiciousness</TableCell>
//                                             <TableCell>Details</TableCell>
//                                             <TableCell align="right">Actions</TableCell>
//                                         </TableRow>
//                                     </TableHead>
//                                     <TableBody>
//                                         {visibleRows.map((row) => (
//                                             <TableRow key={row.id} sx={{ '& td': { border: 0, borderTop: `1px solid ${THEME.panelBorder}`, py: 1.5 } }}>
//                                                 <TableCell sx={{ whiteSpace: 'nowrap' }}>
//                                                     <Typography sx={{ fontWeight: 700, fontSize: 12.5, color: THEME.navy }}>
//                                                         {formatTime(row.start)} – {formatTime(row.end)}
//                                                     </Typography>
//                                                 </TableCell>
//                                                 <TableCell sx={{ whiteSpace: 'nowrap' }}>
//                                                     <Stack direction="row" alignItems="center" spacing={1}>
//                                                         <row.icon size={17} color={THEME.accent} />
//                                                         <Typography sx={{ fontWeight: 700, fontSize: 13, color: THEME.navy }}>{row.name}</Typography>
//                                                     </Stack>
//                                                 </TableCell>
//                                                 <TableCell sx={{ whiteSpace: 'nowrap' }}>
//                                                     <Typography sx={{ fontSize: 12.5, color: THEME.navySoft }}>{row.purpose}</Typography>
//                                                 </TableCell>
//                                                 <TableCell sx={{ whiteSpace: 'nowrap' }}>
//                                                     <Rating value={row.stars} precision={0.5} readOnly size="small" />
//                                                     <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: TONE_COLOR[row.tone] }}>
//                                                         {row.label}
//                                                     </Typography>
//                                                 </TableCell>
//                                                 <TableCell sx={{ minWidth: 180 }}>
//                                                     <Typography sx={{ fontSize: 12.5, color: THEME.muted }}>{row.details}</Typography>
//                                                 </TableCell>
//                                                 <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
//                                                     <Button
//                                                         size="small"
//                                                         onClick={() => setDetailsRow(row)}
//                                                         sx={{ textTransform: 'none', fontWeight: 700, color: THEME.accent }}
//                                                     >
//                                                         View Details →
//                                                     </Button>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))}
//                                     </TableBody>
//                                 </Table>
//                             </TableContainer>
//                         )}
//                     </Card>

//                     {/* RIGHT SIDEBAR */}
//                     <Stack spacing={2}>
//                         <Card sx={{ p: 2.5, borderRadius: 3, boxShadow: THEME.shadow, bgcolor: THEME.iconBg }}>
//                             <Typography sx={{ fontWeight: 700, color: THEME.navy, fontSize: 14, mb: 0.25 }}>
//                                 Today&apos;s Highlights
//                             </Typography>
//                             <Typography sx={{ fontSize: 12, color: THEME.muted, mb: 1.5 }}>
//                                 {dateLabel}, {weekdayLabel}
//                             </Typography>
//                             {loading ? (
//                                 <Skeleton height={120} />
//                             ) : (
//                                 <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 1.5, columnGap: 1 }}>
//                                     <HighlightItem icon={<WiSunrise size={22} color={THEME.accent} />} label="Sunrise" value={formatTime(panchang?.sunrise)} />
//                                     <HighlightItem icon={<WiSunset size={22} color={THEME.accent} />} label="Sunset" value={formatTime(panchang?.sunset)} />
//                                     <HighlightItem icon={<TbSparkles size={18} color={THEME.accent} />} label="Tithi" value={panchang?.tithi?.name} sub={panchang?.tithi?.endTime && `till ${formatTime(panchang.tithi.endTime)}`} />
//                                     <HighlightItem icon={<TbOm size={18} color={THEME.accent} />} label="Nakshatra" value={panchang?.nakshatra?.name} sub={panchang?.nakshatra?.endTime && `till ${formatTime(panchang.nakshatra.endTime)}`} />
//                                     <HighlightItem icon={<TbSun size={18} color={THEME.accent} />} label="Yoga" value={panchang?.yoga?.name} sub={panchang?.yoga?.endTime && `till ${formatTime(panchang.yoga.endTime)}`} />
//                                     <HighlightItem icon={<TbCategory2 size={18} color={THEME.accent} />} label="Karana" value={panchang?.karana?.name} sub={panchang?.karana?.endTime && `till ${formatTime(panchang.karana.endTime)}`} />
//                                 </Box>
//                             )}
//                         </Card>

//                         <Card sx={{ p: 2.5, borderRadius: 3, boxShadow: THEME.shadow }}>
//                             <Typography sx={{ fontWeight: 700, color: THEME.navy, fontSize: 14, mb: 1.5 }}>
//                                 Most Popular Muhurats
//                             </Typography>
//                             <Stack divider={<Divider />} spacing={1.25}>
//                                 {MOST_POPULAR.map((item, i) => (
//                                     <Stack
//                                         key={item.id}
//                                         direction="row"
//                                         alignItems="center"
//                                         spacing={1.25}
//                                         onClick={() => jumpToPopular(item.id)}
//                                         sx={{ cursor: 'pointer', pt: i === 0 ? 0 : 1.25, '&:hover': { opacity: 0.75 } }}
//                                     >
//                                         <Box
//                                             sx={{
//                                                 width: 22,
//                                                 height: 22,
//                                                 borderRadius: '50%',
//                                                 bgcolor: THEME.navy,
//                                                 color: '#fff',
//                                                 fontSize: 11,
//                                                 fontWeight: 700,
//                                                 display: 'flex',
//                                                 alignItems: 'center',
//                                                 justifyContent: 'center',
//                                                 flexShrink: 0
//                                             }}
//                                         >
//                                             {i + 1}
//                                         </Box>
//                                         <item.icon size={18} color={THEME.accent} style={{ flexShrink: 0 }} />
//                                         <Box sx={{ minWidth: 0 }}>
//                                             <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: THEME.navy }} noWrap>
//                                                 {item.label}
//                                             </Typography>
//                                             <Typography sx={{ fontSize: 11, color: THEME.muted }} noWrap>
//                                                 {item.sub}
//                                             </Typography>
//                                         </Box>
//                                     </Stack>
//                                 ))}
//                             </Stack>
//                         </Card>
//                     </Stack>
//                 </Box>

//                 {/* ---------------------------------------------------------- */}
//                 {/* BOTTOM CTA STRIP                                            */}
//                 {/* ---------------------------------------------------------- */}
//                 <Box
//                     sx={{
//                         mt: 3,
//                         borderRadius: 3,
//                         boxShadow: THEME.shadow,
//                         background: `linear-gradient(120deg, ${THEME.navy} 0%, #16213E 100%)`,
//                         p: { xs: 2.5, md: 3 },
//                         display: 'grid',
//                         gridTemplateColumns: { xs: '1fr', md: 'minmax(0,1fr) auto' },
//                         alignItems: 'center',
//                         gap: 2.5
//                     }}
//                 >
//                     <Box>
//                         <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: 18, md: 20 } }}>
//                             Right Time. Brighter Future.
//                         </Typography>
//                         <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, mt: 0.5 }}>
//                             Let ancient wisdom guide your important moments.
//                         </Typography>
//                     </Box>
//                     <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 4 }} alignItems="center">
//                         <Button
//                             variant="contained"
//                             endIcon={<TbSparkles size={16} />}
//                             sx={{
//                                 bgcolor: THEME.accent,
//                                 color: '#fff',
//                                 fontWeight: 700,
//                                 textTransform: 'none',
//                                 px: 2.5,
//                                 py: 1,
//                                 borderRadius: 2,
//                                 whiteSpace: 'nowrap',
//                                 '&:hover': { bgcolor: '#3A5488' }
//                             }}
//                         >
//                             Explore Personalized Muhurat
//                         </Button>
//                         <Stack direction="row" spacing={2.5}>
//                             <CtaBadge icon={<TbOm size={18} />} label="Trust Vedic Wisdom" />
//                             <CtaBadge icon={<TbShieldCheck size={18} />} label="Make Confident Decisions" />
//                             <CtaBadge icon={<TbSun size={18} />} label="Bring Positivity" />
//                         </Stack>
//                     </Stack>
//                 </Box>
//             </Box>

//             {/* ---------------------------------------------------------- */}
//             {/* THIS MONTH'S AUSPICIOUS DATES DIALOG                        */}
//             {/* Real, calculated list from GET /panchang/muhurat/month —    */}
//             {/* every day in the month is scored dynamically, same rule     */}
//             {/* engine as the main table above; nothing hardcoded.          */}
//             {/* ---------------------------------------------------------- */}
//             <Dialog open={monthlyOpen} onClose={() => setMonthlyOpen(false)} maxWidth="sm" fullWidth>
//                 <DialogTitle sx={{ fontWeight: 800, color: THEME.navy }}>
//                     Auspicious Dates —{' '}
//                     {new Date(viewMonth.year, viewMonth.month, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
//                 </DialogTitle>
//                 <DialogContent dividers>
//                     <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto', pb: 0.5, ...THIN_SCROLLBAR_X }}>
//                         {MUHURAT_CATEGORIES.filter((c) => c.id !== 'others').map((cat) => (
//                             <Chip
//                                 key={cat.id}
//                                 size="small"
//                                 clickable
//                                 icon={<cat.icon size={13} />}
//                                 label={cat.chipLabel}
//                                 onClick={() => openMonthlyMuhurat(cat.id)}
//                                 sx={{
//                                     fontWeight: 700,
//                                     fontSize: 11.5,
//                                     whiteSpace: 'nowrap',
//                                     bgcolor: monthlyResult?.category === cat.id ? THEME.accent : '#fff',
//                                     color: monthlyResult?.category === cat.id ? '#fff' : THEME.navy,
//                                     border: `1px solid ${monthlyResult?.category === cat.id ? THEME.accent : THEME.panelBorder}`
//                                 }}
//                             />
//                         ))}
//                     </Stack>

//                     {monthlyLoading ? (
//                         <Stack spacing={1.25}>
//                             {[...Array(4)].map((_, i) => (
//                                 <Skeleton key={i} height={44} />
//                             ))}
//                         </Stack>
//                     ) : monthlyError ? (
//                         <Typography sx={{ fontSize: 12.5, color: THEME.inauspicious }}>{monthlyError}</Typography>
//                     ) : !monthlyResult?.dates?.length ? (
//                         <Typography sx={{ fontSize: 13, color: THEME.muted, py: 3, textAlign: 'center' }}>
//                             No auspicious dates found for this category this month.
//                         </Typography>
//                     ) : (
//                         <Stack divider={<Divider />} spacing={1.25}>
//                             {monthlyResult.dates.map((d) => {
//                                 const dObj = new Date(`${d.date}T00:00:00`);
//                                 return (
//                                     <Stack key={d.date} direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
//                                         <Box sx={{ minWidth: 0 }}>
//                                             <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: THEME.navy }}>
//                                                 {dObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}, {d.weekday}
//                                             </Typography>
//                                             <Typography sx={{ fontSize: 11.5, color: THEME.muted }} noWrap>
//                                                 {d.tithi} {d.nakshatra ? `• ${d.nakshatra}` : ''}
//                                             </Typography>
//                                             <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: TONE_COLOR.auspicious }}>{d.label}</Typography>
//                                         </Box>
//                                         <Stack alignItems="flex-end" spacing={0.25} sx={{ flexShrink: 0 }}>
//                                             <Typography sx={{ fontWeight: 700, fontSize: 12.5, color: THEME.navy }}>
//                                                 {formatTime(d.start)} – {formatTime(d.end)}
//                                             </Typography>
//                                             <Button
//                                                 size="small"
//                                                 onClick={() => {
//                                                     setSelectedDate(d.date);
//                                                     setViewMonth({ year: dObj.getFullYear(), month: dObj.getMonth() });
//                                                     setMonthlyOpen(false);
//                                                 }}
//                                                 sx={{ textTransform: 'none', fontWeight: 700, fontSize: 11.5, color: THEME.accent, minWidth: 0, p: 0 }}
//                                             >
//                                                 View this date →
//                                             </Button>
//                                         </Stack>
//                                     </Stack>
//                                 );
//                             })}
//                         </Stack>
//                     )}
//                 </DialogContent>
//                 <DialogActions sx={{ px: 3, pb: 2 }}>
//                     <Button onClick={() => setMonthlyOpen(false)} variant="contained" sx={{ textTransform: 'none', bgcolor: THEME.navy }}>
//                         Close
//                     </Button>
//                 </DialogActions>
//             </Dialog>

//             {/* ---------------------------------------------------------- */}
//             {/* VIEW DETAILS DIALOG                                         */}
//             {/* ---------------------------------------------------------- */}
//             <Dialog open={Boolean(detailsRow)} onClose={() => setDetailsRow(null)} maxWidth="xs" fullWidth>
//                 {detailsRow && (
//                     <>
//                         <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800, color: THEME.navy }}>
//                             <detailsRow.icon size={20} color={THEME.accent} />
//                             {detailsRow.name}
//                         </DialogTitle>
//                         <DialogContent>
//                             <Stack spacing={1.25}>
//                                 <Typography sx={{ fontSize: 13, color: THEME.muted }}>{detailsRow.details}</Typography>
//                                 <Divider />
//                                 <Stack direction="row" justifyContent="space-between">
//                                     <Typography sx={{ fontSize: 12.5, color: THEME.muted }}>Time Window</Typography>
//                                     <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: THEME.navy }}>
//                                         {formatTime(detailsRow.start)} – {formatTime(detailsRow.end)}
//                                     </Typography>
//                                 </Stack>
//                                 <Stack direction="row" justifyContent="space-between">
//                                     <Typography sx={{ fontSize: 12.5, color: THEME.muted }}>Purpose</Typography>
//                                     <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: THEME.navy }}>{detailsRow.purpose}</Typography>
//                                 </Stack>
//                                 <Stack direction="row" justifyContent="space-between" alignItems="center">
//                                     <Typography sx={{ fontSize: 12.5, color: THEME.muted }}>Rating</Typography>
//                                     <Stack direction="row" alignItems="center" spacing={1}>
//                                         <Rating value={detailsRow.stars} precision={0.5} readOnly size="small" />
//                                         <Typography sx={{ fontSize: 12, fontWeight: 700, color: TONE_COLOR[detailsRow.tone] }}>
//                                             {detailsRow.label}
//                                         </Typography>
//                                     </Stack>
//                                 </Stack>
//                             </Stack>
//                         </DialogContent>
//                         <DialogActions sx={{ px: 3, pb: 2.5 }}>
//                             <Button href="/panchang-muhurat" sx={{ textTransform: 'none', fontWeight: 700 }}>
//                                 Full Day Panchang
//                             </Button>
//                             <Button onClick={() => setDetailsRow(null)} variant="contained" sx={{ textTransform: 'none', bgcolor: THEME.navy }}>
//                                 Close
//                             </Button>
//                         </DialogActions>
//                     </>
//                 )}
//             </Dialog>
//         </Box>
//     );
// }

// function HighlightItem({ icon, label, value, sub }) {
//     return (
//         <Stack direction="row" spacing={1} alignItems="flex-start">
//             <Box sx={{ mt: 0.25 }}>{icon}</Box>
//             <Box sx={{ minWidth: 0 }}>
//                 <Typography sx={{ fontSize: 11, color: THEME.muted }}>{label}</Typography>
//                 <Typography sx={{ fontSize: 13, fontWeight: 700, color: THEME.navy }} noWrap>
//                     {value || '--'}
//                 </Typography>
//                 {sub && (
//                     <Typography sx={{ fontSize: 10, color: THEME.muted }} noWrap>
//                         {sub}
//                     </Typography>
//                 )}
//             </Box>
//         </Stack>
//     );
// }

// function CtaBadge({ icon, label }) {
//     return (
//         <Stack alignItems="center" spacing={0.5} sx={{ color: '#fff', textAlign: 'center', maxWidth: 90 }}>
//             <Box sx={{ color: THEME.accent }}>{icon}</Box>
//             <Typography sx={{ fontSize: 10.5, fontWeight: 600, lineHeight: 1.2 }}>{label}</Typography>
//         </Stack>
//     );
// }







// 'use client';
// import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';

// // mui
// import {
//     Box,
//     Card,
//     Stack,
//     Chip,
//     Button,
//     IconButton,
//     MenuItem,
//     Select,
//     Popover,
//     Checkbox,
//     FormControlLabel,
//     Rating,
//     Skeleton,
//     Typography,
//     Table,
//     TableHead,
//     TableBody,
//     TableRow,
//     TableCell,
//     TableContainer,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     Divider
// } from '@mui/material';

// // icons
// import {
//     TbChevronLeft,
//     TbChevronRight,
//     TbCategory2,
//     TbHeartHandshake,
//     TbHome,
//     TbUserPlus,
//     TbGift,
//     TbCar,
//     TbMapPin,
//     TbBriefcase,
//     TbPlane,
//     TbSchool,
//     TbDots,
//     TbSparkles,
//     TbSun,
//     TbCalendar,
//     TbCalendarEvent,
//     TbListDetails,
//     TbShieldCheck,
//     TbOm,
//     TbCurrentLocation,
//     TbMapPin as TbLocationPin
// } from 'react-icons/tb';
// import { WiSunrise, WiSunset } from 'react-icons/wi';

// // services
// import { getPanchang, getPanchangCities } from '@/services/panchang-service';

// // ----------------------------------------------------------------------
// // Theme tokens — same family used across Calendar / Vrat & Upvas so every
// // (spiritual) page feels like one product.
// // ----------------------------------------------------------------------
// // ----------------------------------------------------------------------
// // Theme tokens — same "Chandra" (silver-white/navy) palette used across
// // Panchang, Horoscope, Calendar and Vrat & Upvas, so every (spiritual)
// // page feels like one product instead of each having its own colors.
// // ----------------------------------------------------------------------
// const THEME = {
//     navy: '#2B3A63',
//     navySoft: '#46577E',
//     accent: '#4C6FA5',
//     accentSoft: '#E7EEFA',
//     bgGradient: 'linear-gradient(180deg, #DDE6F5 0%, #EEF3FC 45%, #FFFFFF 100%)',
//     panelBorder: '#C9D6EE',
//     iconBg: '#E7EEFA',
//     muted: '#64748B',
//     auspicious: '#2E9E5B',
//     moderate: '#D97706',
//     inauspicious: '#C0392B',
//     shadow: '0 6px 20px rgba(43, 58, 99, 0.08)',
//     shadowLg: '0 16px 40px rgba(43, 58, 99, 0.16)'
// };

// const TONE_COLOR = { auspicious: THEME.auspicious, moderate: THEME.moderate, inauspicious: THEME.inauspicious };

// // Thin, brand-colored scrollbar for the horizontally-scrollable chip row and
// // table — without this, browsers/OS render their own bulky native scrollbar
// // (complete with arrow buttons on Windows/Firefox), which clashes with the
// // flat, rounded look of everything else on the page.
// const THIN_SCROLLBAR_X = {
//     scrollbarWidth: 'thin', // Firefox
//     scrollbarColor: `${THEME.panelBorder} transparent`, // Firefox
//     '&::-webkit-scrollbar': { height: 6 },
//     '&::-webkit-scrollbar-track': { background: 'transparent' },
//     '&::-webkit-scrollbar-thumb': { background: THEME.panelBorder, borderRadius: 999 },
//     '&::-webkit-scrollbar-button': { display: 'none', width: 0, height: 0 }
// };

// // Hero banner — plain full-width image, text is already baked into it
// // (same convention as /calendar and /vrat-upvas).
// const HERO_BANNER_SRC = '/images/muhurat-hero-banner.png';

// const MUHURAT_CATEGORIES = [
//     { id: 'vivah', chipLabel: 'Vivah Muhurt', sidebarLabel: 'Vivah (Marriage)', icon: TbHeartHandshake },
//     { id: 'griha-pravesh', chipLabel: 'Griha Pravesh', sidebarLabel: 'Griha Pravesh', icon: TbHome },
//     { id: 'namkaran', chipLabel: 'Namkaran', sidebarLabel: 'Namkaran', icon: TbUserPlus },
//     { id: 'annaprashan', chipLabel: 'Annaprashan', sidebarLabel: 'Annaprashan', icon: TbGift },
//     { id: 'vehicle', chipLabel: 'Vehicle Purchase', sidebarLabel: 'Vehicle Purchase', icon: TbCar },
//     { id: 'property', chipLabel: 'Property Purchase', sidebarLabel: 'Property Purchase', icon: TbMapPin },
//     { id: 'business', chipLabel: 'Business Start', sidebarLabel: 'Business Start', icon: TbBriefcase },
//     { id: 'travel', chipLabel: 'Travel Muhurt', sidebarLabel: 'Travel', icon: TbPlane },
//     { id: 'education', chipLabel: 'Education', sidebarLabel: 'Education', icon: TbSchool },
//     { id: 'others', chipLabel: 'Others', sidebarLabel: 'Others', icon: TbDots }
// ];

// const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// const MOST_POPULAR = [
//     { id: 'vivah', label: 'Vivah Muhurt', sub: 'Find best marriage timings', icon: TbHeartHandshake },
//     { id: 'griha-pravesh', label: 'Griha Pravesh Muhurat', sub: 'Auspicious home entry', icon: TbHome },
//     { id: 'vehicle', label: 'Vehicle Purchase Muhurat', sub: 'Buy with positive energy', icon: TbCar },
//     { id: 'business', label: 'Business Start Muhurat', sub: 'Begin your venture', icon: TbBriefcase },
//     { id: 'annaprashan', label: 'Annaprashan Muhurat', sub: 'First food ceremony', icon: TbGift }
// ];

// function toDateInputValue(d = new Date()) {
//     return d.toLocaleDateString('en-CA');
// }

// function formatTime(value) {
//     if (!value) return '--';
//     const date = typeof value === 'string' ? new Date(value) : value;
//     if (Number.isNaN(date.getTime())) return '--';
//     return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
// }

// function addMinutes(date, mins) {
//     return new Date(date.getTime() + mins * 60000);
// }

// // Builds a 6x7 mini-calendar grid, same trick as the Calendar page.
// function buildMonthGrid(year, monthIdx) {
//     const firstOfMonth = new Date(year, monthIdx, 1);
//     const startOffset = firstOfMonth.getDay();
//     const gridStart = new Date(year, monthIdx, 1 - startOffset);
//     const cells = [];
//     for (let i = 0; i < 42; i++) {
//         const date = new Date(gridStart);
//         date.setDate(gridStart.getDate() + i);
//         cells.push(date);
//     }
//     return cells;
// }

// // See the DATA NOTE at the top of the file — Brahma/Abhijit/sunrise/sunset
// // are real API data, the rest are a simplified even-split of the real
// // daylight window into the same 8 categories shown in the reference UI.
// function buildMuhuratRows(panchang) {
//     if (!panchang?.sunrise || !panchang?.sunset) return [];

//     const sunrise = new Date(panchang.sunrise);
//     const sunset = new Date(panchang.sunset);
//     const daylightMins = (sunset.getTime() - sunrise.getTime()) / 60000;
//     if (!(daylightMins > 0)) return [];

//     const slot = daylightMins / 11;
//     const at = (i) => addMinutes(sunrise, slot * i);

//     const abhijitStart = panchang?.abhijitMuhurat?.start ? new Date(panchang.abhijitMuhurat.start) : addMinutes(sunrise, daylightMins / 2 - 24);
//     const abhijitEnd = panchang?.abhijitMuhurat?.end ? new Date(panchang.abhijitMuhurat.end) : addMinutes(sunrise, daylightMins / 2 + 24);

//     const rows = [
//         {
//             id: 'brahma',
//             category: 'others',
//             icon: TbSparkles,
//             name: 'Brahma Muhurat',
//             purpose: 'Spiritual Practice, Meditation',
//             start: addMinutes(sunrise, -96),
//             end: addMinutes(sunrise, -48),
//             stars: 5,
//             label: 'Highly Auspicious',
//             tone: 'auspicious',
//             details: 'Best for meditation, prayers and self-growth.'
//         },
//         {
//             id: 'abhijit',
//             category: 'others',
//             icon: TbSun,
//             name: 'Abhijit Muhurat',
//             purpose: 'General, All Auspicious Works',
//             start: abhijitStart,
//             end: abhijitEnd,
//             stars: 4.5,
//             label: 'Very Auspicious',
//             tone: 'auspicious',
//             details: 'Favorable for important new beginnings.'
//         },
//         {
//             id: 'griha-pravesh',
//             category: 'griha-pravesh',
//             icon: TbHome,
//             name: 'Griha Pravesh Muhurat',
//             purpose: 'Housewarming',
//             start: at(1),
//             end: at(1.6),
//             stars: 5,
//             label: 'Highly Auspicious',
//             tone: 'auspicious',
//             details: 'Ideal for entering a new home.'
//         },
//         {
//             id: 'namkaran',
//             category: 'namkaran',
//             icon: TbUserPlus,
//             name: 'Namkaran Muhurat',
//             purpose: 'Naming Ceremony',
//             start: at(2.2),
//             end: at(2.8),
//             stars: 4,
//             label: 'Auspicious',
//             tone: 'moderate',
//             details: 'Good for naming the child.'
//         },
//         {
//             id: 'annaprashan',
//             category: 'annaprashan',
//             icon: TbGift,
//             name: 'Annaprashan Muhurat',
//             purpose: 'First Food Ceremony',
//             start: at(3.2),
//             end: at(3.7),
//             stars: 4,
//             label: 'Auspicious',
//             tone: 'moderate',
//             details: "Favorable for a child's first-food ceremony."
//         },
//         {
//             id: 'vivah',
//             category: 'vivah',
//             icon: TbHeartHandshake,
//             name: 'Vivah Muhurat',
//             purpose: 'Marriage',
//             start: at(4.2),
//             end: at(4.8),
//             stars: 4,
//             label: 'Very Auspicious',
//             tone: 'auspicious',
//             details: 'Suitable for wedding ceremonies.'
//         },
//         {
//             id: 'vehicle',
//             category: 'vehicle',
//             icon: TbCar,
//             name: 'Vehicle Purchase Muhurat',
//             purpose: 'New Vehicle',
//             start: at(5.2),
//             end: at(5.8),
//             stars: 4,
//             label: 'Auspicious',
//             tone: 'moderate',
//             details: 'Favorable for buying new vehicles.'
//         },
//         {
//             id: 'property',
//             category: 'property',
//             icon: TbMapPin,
//             name: 'Property Purchase Muhurat',
//             purpose: 'Property/Land Purchase',
//             start: at(6.2),
//             end: at(6.7),
//             stars: 4,
//             label: 'Auspicious',
//             tone: 'moderate',
//             details: 'Favorable for registering or buying property.'
//         },
//         {
//             id: 'business',
//             category: 'business',
//             icon: TbBriefcase,
//             name: 'Business Start Muhurat',
//             purpose: 'New Business',
//             start: at(7.2),
//             end: at(7.8),
//             stars: 4,
//             label: 'Auspicious',
//             tone: 'moderate',
//             details: 'Good for business launch or new venture.'
//         },
//         {
//             id: 'education',
//             category: 'education',
//             icon: TbSchool,
//             name: 'Vidyarambh Muhurat',
//             purpose: 'Starting Education',
//             start: at(8.2),
//             end: at(8.7),
//             stars: 4,
//             label: 'Auspicious',
//             tone: 'moderate',
//             details: 'Good for starting studies or admission.'
//         },
//         {
//             id: 'travel',
//             category: 'travel',
//             icon: TbPlane,
//             name: 'Yatra Muhurat',
//             purpose: 'Travel',
//             start: at(9.2),
//             end: at(9.8),
//             stars: 4,
//             label: 'Auspicious',
//             tone: 'moderate',
//             details: 'Suitable for long-distance travel.'
//         }
//     ];

//     return rows.sort((a, b) => a.start - b.start);
// }

// function haversineKm(lat1, lng1, lat2, lng2) {
//     const toRad = (d) => (d * Math.PI) / 180;
//     const R = 6371;
//     const dLat = toRad(lat2 - lat1);
//     const dLng = toRad(lng2 - lng1);
//     const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
//     return 2 * R * Math.asin(Math.sqrt(a));
// }

// export default function Muhurat() {
//     const today = useMemo(() => new Date(), []);
//     const [viewMonth, setViewMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
//     const [selectedDate, setSelectedDate] = useState(toDateInputValue(today));
//     const [cities, setCities] = useState([]);
//     const [selectedCity, setSelectedCity] = useState('New Delhi');
//     // GPS auto-detected location — same idea as DrikPanchang's own location
//     // resolution: try the browser's geolocation first and use exact
//     // lat/lng for the Panchang calculation (the backend already accepts
//     // lat/lng directly, see panchang-service.js), falling back to the
//     // manually-picked/default city if permission is denied, unsupported,
//     // or times out. "nearestLabel" is just for display — the nearest known
//     // city name shown next to the pin — the actual calculation still uses
//     // the browser's precise coordinates, not that city's coordinates.
//     const [gpsLocation, setGpsLocation] = useState(null); // { lat, lng, nearestLabel }
//     const [locationSource, setLocationSource] = useState('city'); // 'gps' | 'city'
//     const [locationLoading, setLocationLoading] = useState(true);
//     const [cityAnchor, setCityAnchor] = useState(null);
//     const [panchang, setPanchang] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [purposeFilters, setPurposeFilters] = useState([]);
//     const [detailsRow, setDetailsRow] = useState(null);
//     const tableRef = useRef(null);
//     const dateCardRef = useRef(null);

//     useEffect(() => {
//         getPanchangCities()
//             .then((res) => setCities(res?.data || []))
//             .catch(() => setCities([]));
//     }, []);

//     // Try to auto-fetch the user's current location once, on first load —
//     // matches how DrikPanchang resolves a visitor's city automatically
//     // instead of always defaulting to New Delhi. If the user has already
//     // picked a city by hand this session, that always wins (see the
//     // `locationSource === 'city'` guard below, flipped by handleManualCity).
//     useEffect(() => {
//         if (typeof window === 'undefined' || !navigator.geolocation) {
//             setLocationLoading(false);
//             return;
//         }
//         navigator.geolocation.getCurrentPosition(
//             (pos) => {
//                 const { latitude, longitude } = pos.coords;
//                 setGpsLocation((prev) => ({ ...prev, lat: latitude, lng: longitude }));
//                 setLocationSource('gps');
//                 setLocationLoading(false);
//             },
//             () => {
//                 // permission denied / unavailable / timed out — silently
//                 // keep the default city, same as DrikPanchang falls back
//                 // to its default location when it can't resolve one.
//                 setLocationLoading(false);
//             },
//             { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 }
//         );
//     }, []);

//     // Once we have both the GPS coordinates and the known-city list, resolve
//     // a friendly "near <city>" label for display purposes only.
//     useEffect(() => {
//         if (!gpsLocation?.lat || !cities.length) return;
//         let nearest = null;
//         let nearestDist = Infinity;
//         cities.forEach((c) => {
//             const d = haversineKm(gpsLocation.lat, gpsLocation.lng, c.lat, c.lng);
//             if (d < nearestDist) {
//                 nearestDist = d;
//                 nearest = c.city;
//             }
//         });
//         if (nearest) setGpsLocation((prev) => (prev ? { ...prev, nearestLabel: nearest } : prev));
//     }, [gpsLocation?.lat, gpsLocation?.lng, cities]);

//     const handleManualCity = (cityName) => {
//         setSelectedCity(cityName);
//         setLocationSource('city');
//         setCityAnchor(null);
//     };

//     const handleUseMyLocation = () => {
//         if (gpsLocation?.lat) setLocationSource('gps');
//         setCityAnchor(null);
//     };

//     const activeLocation = useMemo(() => {
//         if (locationSource === 'gps' && gpsLocation?.lat) {
//             return { lat: gpsLocation.lat, lng: gpsLocation.lng, label: gpsLocation.nearestLabel ? `Near ${gpsLocation.nearestLabel}` : 'Your Location' };
//         }
//         return { city: selectedCity, label: selectedCity };
//     }, [locationSource, gpsLocation, selectedCity]);

//     const fetchForDate = useCallback(async (dateStr, location) => {
//         setLoading(true);
//         setError(null);
//         try {
//             const res = await getPanchang({ date: dateStr, lat: location.lat, lng: location.lng, city: location.city });
//             setPanchang(res?.data || null);
//         } catch (err) {
//             setError(err?.response?.data?.message || 'Muhurat data is temporarily unavailable. Please try again in a moment.');
//             setPanchang(null);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         if (locationLoading) return; // wait for the one-time geolocation attempt to settle first
//         fetchForDate(selectedDate, activeLocation);
//     }, [selectedDate, activeLocation, locationLoading, fetchForDate]);

//     const monthCells = useMemo(() => buildMonthGrid(viewMonth.year, viewMonth.month), [viewMonth]);
//     const muhuratRows = useMemo(() => buildMuhuratRows(panchang), [panchang]);

//     const visibleRows = useMemo(() => {
//         if (purposeFilters.length === 0) return muhuratRows;
//         return muhuratRows.filter((r) => purposeFilters.includes(r.category));
//     }, [muhuratRows, purposeFilters]);

//     const activeChip = purposeFilters.length === 1 ? purposeFilters[0] : 'all';

//     const toggleCategory = (id) => {
//         setPurposeFilters((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
//     };

//     const selectSingleCategory = (id) => {
//         setPurposeFilters(id === 'all' ? [] : [id]);
//     };

//     const goToMonth = (delta) => {
//         setViewMonth((prev) => {
//             const d = new Date(prev.year, prev.month + delta, 1);
//             return { year: d.getFullYear(), month: d.getMonth() };
//         });
//     };

//     const goToToday = () => {
//         const t = new Date();
//         setViewMonth({ year: t.getFullYear(), month: t.getMonth() });
//         setSelectedDate(toDateInputValue(t));
//     };

//     const jumpToPopular = (id) => {
//         selectSingleCategory(id);
//         tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     };

//     const selectedDateObj = new Date(`${selectedDate}T00:00:00`);
//     const dateLabel = selectedDateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
//     const weekdayLabel = selectedDateObj.toLocaleDateString('en-IN', { weekday: 'long' });

//     return (
//         <Box sx={{ overflowX: 'hidden', maxWidth: '100%' }}>
//             {/* ---------------------------------------------------------- */}
//             {/* HERO BANNER — same treatment as Calendar / Vrat & Upvas:    */}
//             {/* sits directly below the navbar (outside the padded panel), */}
//             {/* plain full-width image, text baked into the art itself.    */}
//             {/* Fixed aspect-ratio (matched to the Vrat & Upvas banner) +   */}
//             {/* objectFit: cover, so this renders at the exact same height */}
//             {/* as that banner regardless of this PNG's own dimensions —   */}
//             {/* before this, the raw image's own (taller) aspect ratio was */}
//             {/* making this banner visibly bigger than the other pages'.   */}
//             {/* ---------------------------------------------------------- */}
//             <Box sx={{ position: 'relative', mb: 3 }}>
//                 <Box
//                     component="img"
//                     src={HERO_BANNER_SRC}
//                     alt="Panchang Muhurat — Auspicious Timings for a Blessed Beginning"
//                     sx={{
//                         width: '100%',
//                         aspectRatio: '4.08 / 1',
//                         height: 'auto',
//                         objectFit: 'cover',
//                         objectPosition: 'center',
//                         display: 'block',
//                         borderRadius: 4,
//                         boxShadow: THEME.shadow
//                     }}
//                 />
//                 <Typography
//                     component="h1"
//                     sx={{
//                         position: 'absolute',
//                         top: 0,
//                         left: 0,
//                         width: 1,
//                         height: 1,
//                         p: 0,
//                         m: 0,
//                         overflow: 'hidden',
//                         clip: 'rect(0 0 0 0)',
//                         whiteSpace: 'nowrap',
//                         border: 0
//                     }}
//                 >
//                     Panchang Muhurat — Auspicious Timings for a Blessed Beginning
//                 </Typography>
//             </Box>

//             <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 3, p: { xs: 2, md: 3 } }}>
//                 {/* ---------------------------------------------------------- */}
//                 {/* CATEGORY FILTER CHIPS — horizontally scrollable row        */}
//                 {/* ---------------------------------------------------------- */}
//                 <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1, mb: 3, ...THIN_SCROLLBAR_X }}>
//                     <Chip
//                         clickable
//                         icon={<TbCategory2 size={15} />}
//                         label="All Muhurats"
//                         onClick={() => selectSingleCategory('all')}
//                         sx={{
//                             fontWeight: 700,
//                             px: 0.5,
//                             whiteSpace: 'nowrap',
//                             bgcolor: activeChip === 'all' ? THEME.accent : '#fff',
//                             color: activeChip === 'all' ? '#fff' : THEME.navy,
//                             border: `1px solid ${activeChip === 'all' ? THEME.accent : THEME.panelBorder}`
//                         }}
//                     />
//                     {MUHURAT_CATEGORIES.map((cat) => (
//                         <Chip
//                             key={cat.id}
//                             clickable
//                             icon={<cat.icon size={15} />}
//                             label={cat.chipLabel}
//                             onClick={() => selectSingleCategory(cat.id)}
//                             sx={{
//                                 fontWeight: 700,
//                                 px: 0.5,
//                                 whiteSpace: 'nowrap',
//                                 bgcolor: activeChip === cat.id ? THEME.accent : '#fff',
//                                 color: activeChip === cat.id ? '#fff' : THEME.navy,
//                                 border: `1px solid ${activeChip === cat.id ? THEME.accent : THEME.panelBorder}`
//                             }}
//                         />
//                     ))}
//                 </Stack>

//                 {/* ---------------------------------------------------------- */}
//                 {/* MAIN 3-COLUMN LAYOUT — plain CSS Grid (see Calendar page   */}
//                 {/* for why: MUI <Grid item xs={fraction}> silently breaks     */}
//                 {/* on non-integer values, CSS Grid never has that problem).   */}
//                 {/* ---------------------------------------------------------- */}
//                 <Box
//                     sx={{
//                         display: 'grid',
//                         gridTemplateColumns: { xs: '1fr', lg: '280px minmax(0, 1fr) 300px' },
//                         gap: 3,
//                         alignItems: 'start',
//                         minWidth: 0
//                     }}
//                 >
//                     {/* LEFT SIDEBAR */}
//                     <Stack spacing={2}>
//                         <Card ref={dateCardRef} sx={{ p: 2, borderRadius: 3, boxShadow: THEME.shadow }}>
//                             <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
//                                 <Typography sx={{ fontWeight: 700, fontSize: 13, color: THEME.navy }}>Select Date</Typography>
//                             </Stack>
//                             <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
//                                 <IconButton size="small" onClick={() => goToMonth(-1)}>
//                                     <TbChevronLeft />
//                                 </IconButton>
//                                 <Typography sx={{ fontWeight: 700, color: THEME.navy, fontSize: 13.5 }}>
//                                     {new Date(viewMonth.year, viewMonth.month, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
//                                 </Typography>
//                                 <IconButton size="small" onClick={() => goToMonth(1)}>
//                                     <TbChevronRight />
//                                 </IconButton>
//                             </Stack>
//                             <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', mb: 0.5 }}>
//                                 {WEEKDAY_LABELS.map((d) => (
//                                     <Typography key={d} sx={{ textAlign: 'center', fontSize: 10.5, color: THEME.muted, fontWeight: 700 }}>
//                                         {d}
//                                     </Typography>
//                                 ))}
//                             </Box>
//                             <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 0.25 }}>
//                                 {monthCells.map((date, i) => {
//                                     const inMonth = date.getMonth() === viewMonth.month;
//                                     const dateStr = toDateInputValue(date);
//                                     const isSelected = dateStr === selectedDate;
//                                     return (
//                                         <Box
//                                             key={i}
//                                             onClick={() => setSelectedDate(dateStr)}
//                                             sx={{
//                                                 cursor: 'pointer',
//                                                 textAlign: 'center',
//                                                 py: 0.5,
//                                                 borderRadius: 1.5,
//                                                 fontSize: 12,
//                                                 fontWeight: isSelected ? 700 : 500,
//                                                 color: isSelected ? '#fff' : THEME.navy,
//                                                 bgcolor: isSelected ? THEME.accent : 'transparent',
//                                                 opacity: inMonth ? 1 : 0.35,
//                                                 '&:hover': { bgcolor: isSelected ? THEME.accent : THEME.panelBorder }
//                                             }}
//                                         >
//                                             {date.getDate()}
//                                         </Box>
//                                     );
//                                 })}
//                             </Box>
//                         </Card>

//                         <Card sx={{ p: 1, borderRadius: 3, boxShadow: THEME.shadow }}>
//                             <Typography sx={{ fontWeight: 700, fontSize: 12.5, color: THEME.navy, px: 1, pt: 0.5, pb: 1 }}>
//                                 Quick Links
//                             </Typography>
//                             <Stack spacing={0.5}>
//                                 <Button
//                                     startIcon={<TbCalendarEvent size={17} />}
//                                     onClick={goToToday}
//                                     sx={{
//                                         justifyContent: 'flex-start',
//                                         px: 1.5,
//                                         py: 0.75,
//                                         borderRadius: 2,
//                                         fontWeight: 600,
//                                         fontSize: 13,
//                                         textTransform: 'none',
//                                         color: THEME.navy,
//                                         '&:hover': { bgcolor: THEME.panelBorder }
//                                     }}
//                                 >
//                                     Today&apos;s Muhurat
//                                 </Button>
//                                 {['This Week', 'This Month'].map((label) => (
//                                     <Stack
//                                         key={label}
//                                         direction="row"
//                                         alignItems="center"
//                                         spacing={0.5}
//                                         sx={{ px: 1.5, py: 0.75, opacity: 0.45 }}
//                                     >
//                                         <TbListDetails size={17} color={THEME.navy} />
//                                         <Typography sx={{ fontWeight: 600, fontSize: 13, color: THEME.navy }}>{label}</Typography>
//                                         <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: THEME.accent }}>SOON</Typography>
//                                     </Stack>
//                                 ))}
//                                 <Button
//                                     startIcon={<TbCalendar size={17} />}
//                                     onClick={() => dateCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
//                                     sx={{
//                                         justifyContent: 'flex-start',
//                                         px: 1.5,
//                                         py: 0.75,
//                                         borderRadius: 2,
//                                         fontWeight: 600,
//                                         fontSize: 13,
//                                         textTransform: 'none',
//                                         color: THEME.navy,
//                                         '&:hover': { bgcolor: THEME.panelBorder }
//                                     }}
//                                 >
//                                     Custom Date
//                                 </Button>
//                             </Stack>
//                         </Card>

//                         <Card sx={{ p: 2, borderRadius: 3, boxShadow: THEME.shadow }}>
//                             <Typography sx={{ fontWeight: 700, fontSize: 12.5, color: THEME.navy, mb: 1 }}>
//                                 Filter by Purpose
//                             </Typography>
//                             <Stack spacing={0.25}>
//                                 {MUHURAT_CATEGORIES.map((cat) => (
//                                     <FormControlLabel
//                                         key={cat.id}
//                                         control={
//                                             <Checkbox
//                                                 size="small"
//                                                 checked={purposeFilters.includes(cat.id)}
//                                                 onChange={() => toggleCategory(cat.id)}
//                                                 sx={{ color: THEME.panelBorder, '&.Mui-checked': { color: THEME.accent } }}
//                                             />
//                                         }
//                                         label={<Typography sx={{ fontSize: 12.5, color: THEME.navySoft }}>{cat.sidebarLabel}</Typography>}
//                                         sx={{ ml: 0 }}
//                                     />
//                                 ))}
//                             </Stack>
//                         </Card>
//                     </Stack>

//                     {/* MAIN TABLE */}
//                     <Card ref={tableRef} sx={{ p: { xs: 1.5, md: 2.5 }, borderRadius: 3, boxShadow: THEME.shadow, minWidth: 0 }}>
//                         <Stack
//                             direction={{ xs: 'column', sm: 'row' }}
//                             alignItems={{ xs: 'flex-start', sm: 'center' }}
//                             justifyContent="space-between"
//                             spacing={1.5}
//                             sx={{ mb: 2 }}
//                         >
//                             <Box>
//                                 <Typography sx={{ fontWeight: 800, color: THEME.navy, fontSize: 18 }}>
//                                     Muhurat for {dateLabel}
//                                 </Typography>
//                                 <Typography sx={{ fontSize: 12.5, color: THEME.muted }}>
//                                     Auspicious timings based on Vedic astrology, Panchang and planetary positions.
//                                 </Typography>
//                             </Box>
//                             <Chip
//                                 icon={<TbLocationPin size={15} color={THEME.accent} />}
//                                 onClick={(e) => setCityAnchor(e.currentTarget)}
//                                 label={
//                                     <Stack direction="row" spacing={0.75} alignItems="center">
//                                         <span>{activeLocation.label}</span>
//                                         <Typography component="span" sx={{ fontSize: 11.5, fontWeight: 700, color: THEME.accent }}>
//                                             Change
//                                         </Typography>
//                                     </Stack>
//                                 }
//                                 sx={{ bgcolor: '#fff', border: `1px solid ${THEME.panelBorder}`, fontWeight: 600, cursor: 'pointer' }}
//                             />
//                             <Popover
//                                 open={Boolean(cityAnchor)}
//                                 anchorEl={cityAnchor}
//                                 onClose={() => setCityAnchor(null)}
//                                 anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//                             >
//                                 <Stack sx={{ p: 1, minWidth: 220 }} spacing={0.5}>
//                                     <Button
//                                         size="small"
//                                         startIcon={<TbCurrentLocation size={15} />}
//                                         disabled={!gpsLocation?.lat}
//                                         onClick={handleUseMyLocation}
//                                         sx={{ justifyContent: 'flex-start', textTransform: 'none', fontWeight: 700, color: THEME.accent }}
//                                     >
//                                         {gpsLocation?.lat ? 'Use My Current Location' : 'Locating…'}
//                                     </Button>
//                                     <Select
//                                         autoFocus
//                                         size="small"
//                                         value={selectedCity}
//                                         onChange={(e) => handleManualCity(e.target.value)}
//                                         sx={{ minWidth: 200 }}
//                                     >
//                                         <MenuItem value="New Delhi">New Delhi, Delhi</MenuItem>
//                                         {cities
//                                             .filter((c) => c.city !== 'New Delhi')
//                                             .map((c) => (
//                                                 <MenuItem key={c.city} value={c.city}>
//                                                     {c.city}
//                                                 </MenuItem>
//                                             ))}
//                                     </Select>
//                                 </Stack>
//                             </Popover>
//                         </Stack>

//                         {loading ? (
//                             <Stack spacing={1.25}>
//                                 {[...Array(6)].map((_, i) => (
//                                     <Skeleton key={i} height={48} />
//                                 ))}
//                             </Stack>
//                         ) : error ? (
//                             <Typography sx={{ fontSize: 12.5, color: THEME.inauspicious }}>{error}</Typography>
//                         ) : visibleRows.length === 0 ? (
//                             <Typography sx={{ fontSize: 13, color: THEME.muted, py: 4, textAlign: 'center' }}>
//                                 No muhurat entries match this filter for the selected date.
//                             </Typography>
//                         ) : (
//                             <TableContainer sx={{ overflowX: 'auto', ...THIN_SCROLLBAR_X }}>
//                                 <Table size="small" sx={{ minWidth: 640 }}>
//                                     <TableHead>
//                                         <TableRow sx={{ '& th': { border: 0, color: THEME.muted, fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 } }}>
//                                             <TableCell>Time</TableCell>
//                                             <TableCell>Muhurat Name</TableCell>
//                                             <TableCell>Purpose</TableCell>
//                                             <TableCell>Auspiciousness</TableCell>
//                                             <TableCell>Details</TableCell>
//                                             <TableCell align="right">Actions</TableCell>
//                                         </TableRow>
//                                     </TableHead>
//                                     <TableBody>
//                                         {visibleRows.map((row) => (
//                                             <TableRow key={row.id} sx={{ '& td': { border: 0, borderTop: `1px solid ${THEME.panelBorder}`, py: 1.5 } }}>
//                                                 <TableCell sx={{ whiteSpace: 'nowrap' }}>
//                                                     <Typography sx={{ fontWeight: 700, fontSize: 12.5, color: THEME.navy }}>
//                                                         {formatTime(row.start)} – {formatTime(row.end)}
//                                                     </Typography>
//                                                 </TableCell>
//                                                 <TableCell sx={{ whiteSpace: 'nowrap' }}>
//                                                     <Stack direction="row" alignItems="center" spacing={1}>
//                                                         <row.icon size={17} color={THEME.accent} />
//                                                         <Typography sx={{ fontWeight: 700, fontSize: 13, color: THEME.navy }}>{row.name}</Typography>
//                                                     </Stack>
//                                                 </TableCell>
//                                                 <TableCell sx={{ whiteSpace: 'nowrap' }}>
//                                                     <Typography sx={{ fontSize: 12.5, color: THEME.navySoft }}>{row.purpose}</Typography>
//                                                 </TableCell>
//                                                 <TableCell sx={{ whiteSpace: 'nowrap' }}>
//                                                     <Rating value={row.stars} precision={0.5} readOnly size="small" />
//                                                     <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: TONE_COLOR[row.tone] }}>
//                                                         {row.label}
//                                                     </Typography>
//                                                 </TableCell>
//                                                 <TableCell sx={{ minWidth: 180 }}>
//                                                     <Typography sx={{ fontSize: 12.5, color: THEME.muted }}>{row.details}</Typography>
//                                                 </TableCell>
//                                                 <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
//                                                     <Button
//                                                         size="small"
//                                                         onClick={() => setDetailsRow(row)}
//                                                         sx={{ textTransform: 'none', fontWeight: 700, color: THEME.accent }}
//                                                     >
//                                                         View Details →
//                                                     </Button>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))}
//                                     </TableBody>
//                                 </Table>
//                             </TableContainer>
//                         )}
//                     </Card>

//                     {/* RIGHT SIDEBAR */}
//                     <Stack spacing={2}>
//                         <Card sx={{ p: 2.5, borderRadius: 3, boxShadow: THEME.shadow, bgcolor: THEME.iconBg }}>
//                             <Typography sx={{ fontWeight: 700, color: THEME.navy, fontSize: 14, mb: 0.25 }}>
//                                 Today&apos;s Highlights
//                             </Typography>
//                             <Typography sx={{ fontSize: 12, color: THEME.muted, mb: 1.5 }}>
//                                 {dateLabel}, {weekdayLabel}
//                             </Typography>
//                             {loading ? (
//                                 <Skeleton height={120} />
//                             ) : (
//                                 <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 1.5, columnGap: 1 }}>
//                                     <HighlightItem icon={<WiSunrise size={22} color={THEME.accent} />} label="Sunrise" value={formatTime(panchang?.sunrise)} />
//                                     <HighlightItem icon={<WiSunset size={22} color={THEME.accent} />} label="Sunset" value={formatTime(panchang?.sunset)} />
//                                     <HighlightItem icon={<TbSparkles size={18} color={THEME.accent} />} label="Tithi" value={panchang?.tithi?.name} sub={panchang?.tithi?.endTime && `till ${formatTime(panchang.tithi.endTime)}`} />
//                                     <HighlightItem icon={<TbOm size={18} color={THEME.accent} />} label="Nakshatra" value={panchang?.nakshatra?.name} sub={panchang?.nakshatra?.endTime && `till ${formatTime(panchang.nakshatra.endTime)}`} />
//                                     <HighlightItem icon={<TbSun size={18} color={THEME.accent} />} label="Yoga" value={panchang?.yoga?.name} sub={panchang?.yoga?.endTime && `till ${formatTime(panchang.yoga.endTime)}`} />
//                                     <HighlightItem icon={<TbCategory2 size={18} color={THEME.accent} />} label="Karana" value={panchang?.karana?.name} sub={panchang?.karana?.endTime && `till ${formatTime(panchang.karana.endTime)}`} />
//                                 </Box>
//                             )}
//                         </Card>

//                         <Card sx={{ p: 2.5, borderRadius: 3, boxShadow: THEME.shadow }}>
//                             <Typography sx={{ fontWeight: 700, color: THEME.navy, fontSize: 14, mb: 1.5 }}>
//                                 Most Popular Muhurats
//                             </Typography>
//                             <Stack divider={<Divider />} spacing={1.25}>
//                                 {MOST_POPULAR.map((item, i) => (
//                                     <Stack
//                                         key={item.id}
//                                         direction="row"
//                                         alignItems="center"
//                                         spacing={1.25}
//                                         onClick={() => jumpToPopular(item.id)}
//                                         sx={{ cursor: 'pointer', pt: i === 0 ? 0 : 1.25, '&:hover': { opacity: 0.75 } }}
//                                     >
//                                         <Box
//                                             sx={{
//                                                 width: 22,
//                                                 height: 22,
//                                                 borderRadius: '50%',
//                                                 bgcolor: THEME.navy,
//                                                 color: '#fff',
//                                                 fontSize: 11,
//                                                 fontWeight: 700,
//                                                 display: 'flex',
//                                                 alignItems: 'center',
//                                                 justifyContent: 'center',
//                                                 flexShrink: 0
//                                             }}
//                                         >
//                                             {i + 1}
//                                         </Box>
//                                         <item.icon size={18} color={THEME.accent} style={{ flexShrink: 0 }} />
//                                         <Box sx={{ minWidth: 0 }}>
//                                             <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: THEME.navy }} noWrap>
//                                                 {item.label}
//                                             </Typography>
//                                             <Typography sx={{ fontSize: 11, color: THEME.muted }} noWrap>
//                                                 {item.sub}
//                                             </Typography>
//                                         </Box>
//                                     </Stack>
//                                 ))}
//                             </Stack>
//                         </Card>
//                     </Stack>
//                 </Box>

//                 {/* ---------------------------------------------------------- */}
//                 {/* BOTTOM CTA STRIP                                            */}
//                 {/* ---------------------------------------------------------- */}
//                 <Box
//                     sx={{
//                         mt: 3,
//                         borderRadius: 3,
//                         boxShadow: THEME.shadow,
//                         background: `linear-gradient(120deg, ${THEME.navy} 0%, #16213E 100%)`,
//                         p: { xs: 2.5, md: 3 },
//                         display: 'grid',
//                         gridTemplateColumns: { xs: '1fr', md: 'minmax(0,1fr) auto' },
//                         alignItems: 'center',
//                         gap: 2.5
//                     }}
//                 >
//                     <Box>
//                         <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: 18, md: 20 } }}>
//                             Right Time. Brighter Future.
//                         </Typography>
//                         <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, mt: 0.5 }}>
//                             Let ancient wisdom guide your important moments.
//                         </Typography>
//                     </Box>
//                     <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 4 }} alignItems="center">
//                         <Button
//                             variant="contained"
//                             endIcon={<TbSparkles size={16} />}
//                             sx={{
//                                 bgcolor: THEME.accent,
//                                 color: '#fff',
//                                 fontWeight: 700,
//                                 textTransform: 'none',
//                                 px: 2.5,
//                                 py: 1,
//                                 borderRadius: 2,
//                                 whiteSpace: 'nowrap',
//                                 '&:hover': { bgcolor: '#3A5488' }
//                             }}
//                         >
//                             Explore Personalized Muhurat
//                         </Button>
//                         <Stack direction="row" spacing={2.5}>
//                             <CtaBadge icon={<TbOm size={18} />} label="Trust Vedic Wisdom" />
//                             <CtaBadge icon={<TbShieldCheck size={18} />} label="Make Confident Decisions" />
//                             <CtaBadge icon={<TbSun size={18} />} label="Bring Positivity" />
//                         </Stack>
//                     </Stack>
//                 </Box>
//             </Box>

//             {/* ---------------------------------------------------------- */}
//             {/* VIEW DETAILS DIALOG                                         */}
//             {/* ---------------------------------------------------------- */}
//             <Dialog open={Boolean(detailsRow)} onClose={() => setDetailsRow(null)} maxWidth="xs" fullWidth>
//                 {detailsRow && (
//                     <>
//                         <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800, color: THEME.navy }}>
//                             <detailsRow.icon size={20} color={THEME.accent} />
//                             {detailsRow.name}
//                         </DialogTitle>
//                         <DialogContent>
//                             <Stack spacing={1.25}>
//                                 <Typography sx={{ fontSize: 13, color: THEME.muted }}>{detailsRow.details}</Typography>
//                                 <Divider />
//                                 <Stack direction="row" justifyContent="space-between">
//                                     <Typography sx={{ fontSize: 12.5, color: THEME.muted }}>Time Window</Typography>
//                                     <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: THEME.navy }}>
//                                         {formatTime(detailsRow.start)} – {formatTime(detailsRow.end)}
//                                     </Typography>
//                                 </Stack>
//                                 <Stack direction="row" justifyContent="space-between">
//                                     <Typography sx={{ fontSize: 12.5, color: THEME.muted }}>Purpose</Typography>
//                                     <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: THEME.navy }}>{detailsRow.purpose}</Typography>
//                                 </Stack>
//                                 <Stack direction="row" justifyContent="space-between" alignItems="center">
//                                     <Typography sx={{ fontSize: 12.5, color: THEME.muted }}>Rating</Typography>
//                                     <Stack direction="row" alignItems="center" spacing={1}>
//                                         <Rating value={detailsRow.stars} precision={0.5} readOnly size="small" />
//                                         <Typography sx={{ fontSize: 12, fontWeight: 700, color: TONE_COLOR[detailsRow.tone] }}>
//                                             {detailsRow.label}
//                                         </Typography>
//                                     </Stack>
//                                 </Stack>
//                             </Stack>
//                         </DialogContent>
//                         <DialogActions sx={{ px: 3, pb: 2.5 }}>
//                             <Button href="/panchang-muhurat" sx={{ textTransform: 'none', fontWeight: 700 }}>
//                                 Full Day Panchang
//                             </Button>
//                             <Button onClick={() => setDetailsRow(null)} variant="contained" sx={{ textTransform: 'none', bgcolor: THEME.navy }}>
//                                 Close
//                             </Button>
//                         </DialogActions>
//                     </>
//                 )}
//             </Dialog>
//         </Box>
//     );
// }

// function HighlightItem({ icon, label, value, sub }) {
//     return (
//         <Stack direction="row" spacing={1} alignItems="flex-start">
//             <Box sx={{ mt: 0.25 }}>{icon}</Box>
//             <Box sx={{ minWidth: 0 }}>
//                 <Typography sx={{ fontSize: 11, color: THEME.muted }}>{label}</Typography>
//                 <Typography sx={{ fontSize: 13, fontWeight: 700, color: THEME.navy }} noWrap>
//                     {value || '--'}
//                 </Typography>
//                 {sub && (
//                     <Typography sx={{ fontSize: 10, color: THEME.muted }} noWrap>
//                         {sub}
//                     </Typography>
//                 )}
//             </Box>
//         </Stack>
//     );
// }

// function CtaBadge({ icon, label }) {
//     return (
//         <Stack alignItems="center" spacing={0.5} sx={{ color: '#fff', textAlign: 'center', maxWidth: 90 }}>
//             <Box sx={{ color: THEME.accent }}>{icon}</Box>
//             <Typography sx={{ fontSize: 10.5, fontWeight: 600, lineHeight: 1.2 }}>{label}</Typography>
//         </Stack>
//     );
// }








// 'use client';
// import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';

// // mui
// import {
//     Box,
//     Card,
//     Stack,
//     Chip,
//     Button,
//     IconButton,
//     MenuItem,
//     Select,
//     Popover,
//     Checkbox,
//     FormControlLabel,
//     Rating,
//     Skeleton,
//     Typography,
//     Table,
//     TableHead,
//     TableBody,
//     TableRow,
//     TableCell,
//     TableContainer,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     Divider
// } from '@mui/material';

// // icons
// import {
//     TbChevronLeft,
//     TbChevronRight,
//     TbCategory2,
//     TbHeartHandshake,
//     TbHome,
//     TbUserPlus,
//     TbGift,
//     TbCar,
//     TbMapPin,
//     TbBriefcase,
//     TbPlane,
//     TbSchool,
//     TbDots,
//     TbSparkles,
//     TbSun,
//     TbCalendar,
//     TbCalendarEvent,
//     TbListDetails,
//     TbShieldCheck,
//     TbOm,
//     TbMapPin as TbLocationPin
// } from 'react-icons/tb';
// import { WiSunrise, WiSunset } from 'react-icons/wi';

// // services
// import { getPanchang, getPanchangCities } from '@/services/panchang-service';

// // ----------------------------------------------------------------------
// // Theme tokens — same family used across Calendar / Vrat & Upvas so every
// // (spiritual) page feels like one product.
// // ----------------------------------------------------------------------
// // ----------------------------------------------------------------------
// // Theme tokens — same "Chandra" (silver-white/navy) palette used across
// // Panchang, Horoscope, Calendar and Vrat & Upvas, so every (spiritual)
// // page feels like one product instead of each having its own colors.
// // ----------------------------------------------------------------------
// const THEME = {
//     navy: '#2B3A63',
//     navySoft: '#46577E',
//     accent: '#4C6FA5',
//     accentSoft: '#E7EEFA',
//     bgGradient: 'linear-gradient(180deg, #DDE6F5 0%, #EEF3FC 45%, #FFFFFF 100%)',
//     panelBorder: '#C9D6EE',
//     iconBg: '#E7EEFA',
//     muted: '#64748B',
//     auspicious: '#2E9E5B',
//     moderate: '#D97706',
//     inauspicious: '#C0392B',
//     shadow: '0 6px 20px rgba(43, 58, 99, 0.08)',
//     shadowLg: '0 16px 40px rgba(43, 58, 99, 0.16)'
// };

// const TONE_COLOR = { auspicious: THEME.auspicious, moderate: THEME.moderate, inauspicious: THEME.inauspicious };

// // Thin, brand-colored scrollbar for the horizontally-scrollable chip row and
// // table — without this, browsers/OS render their own bulky native scrollbar
// // (complete with arrow buttons on Windows/Firefox), which clashes with the
// // flat, rounded look of everything else on the page.
// const THIN_SCROLLBAR_X = {
//     scrollbarWidth: 'thin', // Firefox
//     scrollbarColor: `${THEME.panelBorder} transparent`, // Firefox
//     '&::-webkit-scrollbar': { height: 6 },
//     '&::-webkit-scrollbar-track': { background: 'transparent' },
//     '&::-webkit-scrollbar-thumb': { background: THEME.panelBorder, borderRadius: 999 },
//     '&::-webkit-scrollbar-button': { display: 'none', width: 0, height: 0 }
// };

// // Hero banner — plain full-width image, text is already baked into it
// // (same convention as /calendar and /vrat-upvas).
// const HERO_BANNER_SRC = '/images/muhurat-hero-banner.png';

// const MUHURAT_CATEGORIES = [
//     { id: 'vivah', chipLabel: 'Vivah Muhurt', sidebarLabel: 'Vivah (Marriage)', icon: TbHeartHandshake },
//     { id: 'griha-pravesh', chipLabel: 'Griha Pravesh', sidebarLabel: 'Griha Pravesh', icon: TbHome },
//     { id: 'namkaran', chipLabel: 'Namkaran', sidebarLabel: 'Namkaran', icon: TbUserPlus },
//     { id: 'annaprashan', chipLabel: 'Annaprashan', sidebarLabel: 'Annaprashan', icon: TbGift },
//     { id: 'vehicle', chipLabel: 'Vehicle Purchase', sidebarLabel: 'Vehicle Purchase', icon: TbCar },
//     { id: 'property', chipLabel: 'Property Purchase', sidebarLabel: 'Property Purchase', icon: TbMapPin },
//     { id: 'business', chipLabel: 'Business Start', sidebarLabel: 'Business Start', icon: TbBriefcase },
//     { id: 'travel', chipLabel: 'Travel Muhurt', sidebarLabel: 'Travel', icon: TbPlane },
//     { id: 'education', chipLabel: 'Education', sidebarLabel: 'Education', icon: TbSchool },
//     { id: 'others', chipLabel: 'Others', sidebarLabel: 'Others', icon: TbDots }
// ];

// const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// const MOST_POPULAR = [
//     { id: 'vivah', label: 'Vivah Muhurt', sub: 'Find best marriage timings', icon: TbHeartHandshake },
//     { id: 'griha-pravesh', label: 'Griha Pravesh Muhurat', sub: 'Auspicious home entry', icon: TbHome },
//     { id: 'vehicle', label: 'Vehicle Purchase Muhurat', sub: 'Buy with positive energy', icon: TbCar },
//     { id: 'business', label: 'Business Start Muhurat', sub: 'Begin your venture', icon: TbBriefcase },
//     { id: 'annaprashan', label: 'Annaprashan Muhurat', sub: 'First food ceremony', icon: TbGift }
// ];

// function toDateInputValue(d = new Date()) {
//     return d.toLocaleDateString('en-CA');
// }

// function formatTime(value) {
//     if (!value) return '--';
//     const date = typeof value === 'string' ? new Date(value) : value;
//     if (Number.isNaN(date.getTime())) return '--';
//     return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
// }

// function addMinutes(date, mins) {
//     return new Date(date.getTime() + mins * 60000);
// }

// // Builds a 6x7 mini-calendar grid, same trick as the Calendar page.
// function buildMonthGrid(year, monthIdx) {
//     const firstOfMonth = new Date(year, monthIdx, 1);
//     const startOffset = firstOfMonth.getDay();
//     const gridStart = new Date(year, monthIdx, 1 - startOffset);
//     const cells = [];
//     for (let i = 0; i < 42; i++) {
//         const date = new Date(gridStart);
//         date.setDate(gridStart.getDate() + i);
//         cells.push(date);
//     }
//     return cells;
// }

// // See the DATA NOTE at the top of the file — Brahma/Abhijit/sunrise/sunset
// // are real API data, the rest are a simplified even-split of the real
// // daylight window into the same 8 categories shown in the reference UI.
// function buildMuhuratRows(panchang) {
//     if (!panchang?.sunrise || !panchang?.sunset) return [];

//     const sunrise = new Date(panchang.sunrise);
//     const sunset = new Date(panchang.sunset);
//     const daylightMins = (sunset.getTime() - sunrise.getTime()) / 60000;
//     if (!(daylightMins > 0)) return [];

//     const slot = daylightMins / 11;
//     const at = (i) => addMinutes(sunrise, slot * i);

//     const abhijitStart = panchang?.abhijitMuhurat?.start ? new Date(panchang.abhijitMuhurat.start) : addMinutes(sunrise, daylightMins / 2 - 24);
//     const abhijitEnd = panchang?.abhijitMuhurat?.end ? new Date(panchang.abhijitMuhurat.end) : addMinutes(sunrise, daylightMins / 2 + 24);

//     const rows = [
//         {
//             id: 'brahma',
//             category: 'others',
//             icon: TbSparkles,
//             name: 'Brahma Muhurat',
//             purpose: 'Spiritual Practice, Meditation',
//             start: addMinutes(sunrise, -96),
//             end: addMinutes(sunrise, -48),
//             stars: 5,
//             label: 'Highly Auspicious',
//             tone: 'auspicious',
//             details: 'Best for meditation, prayers and self-growth.'
//         },
//         {
//             id: 'abhijit',
//             category: 'others',
//             icon: TbSun,
//             name: 'Abhijit Muhurat',
//             purpose: 'General, All Auspicious Works',
//             start: abhijitStart,
//             end: abhijitEnd,
//             stars: 4.5,
//             label: 'Very Auspicious',
//             tone: 'auspicious',
//             details: 'Favorable for important new beginnings.'
//         },
//         {
//             id: 'griha-pravesh',
//             category: 'griha-pravesh',
//             icon: TbHome,
//             name: 'Griha Pravesh Muhurat',
//             purpose: 'Housewarming',
//             start: at(1),
//             end: at(1.6),
//             stars: 5,
//             label: 'Highly Auspicious',
//             tone: 'auspicious',
//             details: 'Ideal for entering a new home.'
//         },
//         {
//             id: 'namkaran',
//             category: 'namkaran',
//             icon: TbUserPlus,
//             name: 'Namkaran Muhurat',
//             purpose: 'Naming Ceremony',
//             start: at(2.2),
//             end: at(2.8),
//             stars: 4,
//             label: 'Auspicious',
//             tone: 'moderate',
//             details: 'Good for naming the child.'
//         },
//         {
//             id: 'annaprashan',
//             category: 'annaprashan',
//             icon: TbGift,
//             name: 'Annaprashan Muhurat',
//             purpose: 'First Food Ceremony',
//             start: at(3.2),
//             end: at(3.7),
//             stars: 4,
//             label: 'Auspicious',
//             tone: 'moderate',
//             details: "Favorable for a child's first-food ceremony."
//         },
//         {
//             id: 'vivah',
//             category: 'vivah',
//             icon: TbHeartHandshake,
//             name: 'Vivah Muhurat',
//             purpose: 'Marriage',
//             start: at(4.2),
//             end: at(4.8),
//             stars: 4,
//             label: 'Very Auspicious',
//             tone: 'auspicious',
//             details: 'Suitable for wedding ceremonies.'
//         },
//         {
//             id: 'vehicle',
//             category: 'vehicle',
//             icon: TbCar,
//             name: 'Vehicle Purchase Muhurat',
//             purpose: 'New Vehicle',
//             start: at(5.2),
//             end: at(5.8),
//             stars: 4,
//             label: 'Auspicious',
//             tone: 'moderate',
//             details: 'Favorable for buying new vehicles.'
//         },
//         {
//             id: 'property',
//             category: 'property',
//             icon: TbMapPin,
//             name: 'Property Purchase Muhurat',
//             purpose: 'Property/Land Purchase',
//             start: at(6.2),
//             end: at(6.7),
//             stars: 4,
//             label: 'Auspicious',
//             tone: 'moderate',
//             details: 'Favorable for registering or buying property.'
//         },
//         {
//             id: 'business',
//             category: 'business',
//             icon: TbBriefcase,
//             name: 'Business Start Muhurat',
//             purpose: 'New Business',
//             start: at(7.2),
//             end: at(7.8),
//             stars: 4,
//             label: 'Auspicious',
//             tone: 'moderate',
//             details: 'Good for business launch or new venture.'
//         },
//         {
//             id: 'education',
//             category: 'education',
//             icon: TbSchool,
//             name: 'Vidyarambh Muhurat',
//             purpose: 'Starting Education',
//             start: at(8.2),
//             end: at(8.7),
//             stars: 4,
//             label: 'Auspicious',
//             tone: 'moderate',
//             details: 'Good for starting studies or admission.'
//         },
//         {
//             id: 'travel',
//             category: 'travel',
//             icon: TbPlane,
//             name: 'Yatra Muhurat',
//             purpose: 'Travel',
//             start: at(9.2),
//             end: at(9.8),
//             stars: 4,
//             label: 'Auspicious',
//             tone: 'moderate',
//             details: 'Suitable for long-distance travel.'
//         }
//     ];

//     return rows.sort((a, b) => a.start - b.start);
// }

// export default function Muhurat() {
//     const today = useMemo(() => new Date(), []);
//     const [viewMonth, setViewMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
//     const [selectedDate, setSelectedDate] = useState(toDateInputValue(today));
//     const [cities, setCities] = useState([]);
//     const [selectedCity, setSelectedCity] = useState('New Delhi');
//     const [cityAnchor, setCityAnchor] = useState(null);
//     const [panchang, setPanchang] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [purposeFilters, setPurposeFilters] = useState([]);
//     const [detailsRow, setDetailsRow] = useState(null);
//     const tableRef = useRef(null);
//     const dateCardRef = useRef(null);

//     useEffect(() => {
//         getPanchangCities()
//             .then((res) => setCities(res?.data || []))
//             .catch(() => setCities([]));
//     }, []);

//     const fetchForDate = useCallback(async (dateStr, cityName) => {
//         setLoading(true);
//         setError(null);
//         try {
//             const res = await getPanchang({ date: dateStr, city: cityName });
//             setPanchang(res?.data || null);
//         } catch (err) {
//             setError(err?.response?.data?.message || 'Muhurat data is temporarily unavailable. Please try again in a moment.');
//             setPanchang(null);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchForDate(selectedDate, selectedCity);
//     }, [selectedDate, selectedCity, fetchForDate]);

//     const monthCells = useMemo(() => buildMonthGrid(viewMonth.year, viewMonth.month), [viewMonth]);
//     const muhuratRows = useMemo(() => buildMuhuratRows(panchang), [panchang]);

//     const visibleRows = useMemo(() => {
//         if (purposeFilters.length === 0) return muhuratRows;
//         return muhuratRows.filter((r) => purposeFilters.includes(r.category));
//     }, [muhuratRows, purposeFilters]);

//     const activeChip = purposeFilters.length === 1 ? purposeFilters[0] : 'all';

//     const toggleCategory = (id) => {
//         setPurposeFilters((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
//     };

//     const selectSingleCategory = (id) => {
//         setPurposeFilters(id === 'all' ? [] : [id]);
//     };

//     const goToMonth = (delta) => {
//         setViewMonth((prev) => {
//             const d = new Date(prev.year, prev.month + delta, 1);
//             return { year: d.getFullYear(), month: d.getMonth() };
//         });
//     };

//     const goToToday = () => {
//         const t = new Date();
//         setViewMonth({ year: t.getFullYear(), month: t.getMonth() });
//         setSelectedDate(toDateInputValue(t));
//     };

//     const jumpToPopular = (id) => {
//         selectSingleCategory(id);
//         tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     };

//     const selectedDateObj = new Date(`${selectedDate}T00:00:00`);
//     const dateLabel = selectedDateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
//     const weekdayLabel = selectedDateObj.toLocaleDateString('en-IN', { weekday: 'long' });

//     return (
//         <Box sx={{ overflowX: 'hidden', maxWidth: '100%' }}>
//             {/* ---------------------------------------------------------- */}
//             {/* HERO BANNER — same treatment as Calendar / Vrat & Upvas:    */}
//             {/* sits directly below the navbar (outside the padded panel), */}
//             {/* plain full-width image, text baked into the art itself.    */}
//             {/* Fixed aspect-ratio (matched to the Vrat & Upvas banner) +   */}
//             {/* objectFit: cover, so this renders at the exact same height */}
//             {/* as that banner regardless of this PNG's own dimensions —   */}
//             {/* before this, the raw image's own (taller) aspect ratio was */}
//             {/* making this banner visibly bigger than the other pages'.   */}
//             {/* ---------------------------------------------------------- */}
//             <Box sx={{ position: 'relative', mb: 3 }}>
//                 <Box
//                     component="img"
//                     src={HERO_BANNER_SRC}
//                     alt="Panchang Muhurat — Auspicious Timings for a Blessed Beginning"
//                     sx={{
//                         width: '100%',
//                         aspectRatio: '4.08 / 1',
//                         height: 'auto',
//                         objectFit: 'cover',
//                         objectPosition: 'center',
//                         display: 'block',
//                         borderRadius: 4,
//                         boxShadow: THEME.shadow
//                     }}
//                 />
//                 <Typography
//                     component="h1"
//                     sx={{
//                         position: 'absolute',
//                         top: 0,
//                         left: 0,
//                         width: 1,
//                         height: 1,
//                         p: 0,
//                         m: 0,
//                         overflow: 'hidden',
//                         clip: 'rect(0 0 0 0)',
//                         whiteSpace: 'nowrap',
//                         border: 0
//                     }}
//                 >
//                     Panchang Muhurat — Auspicious Timings for a Blessed Beginning
//                 </Typography>
//             </Box>

//             <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 3, p: { xs: 2, md: 3 } }}>
//                 {/* ---------------------------------------------------------- */}
//                 {/* CATEGORY FILTER CHIPS — horizontally scrollable row        */}
//                 {/* ---------------------------------------------------------- */}
//                 <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1, mb: 3, ...THIN_SCROLLBAR_X }}>
//                     <Chip
//                         clickable
//                         icon={<TbCategory2 size={15} />}
//                         label="All Muhurats"
//                         onClick={() => selectSingleCategory('all')}
//                         sx={{
//                             fontWeight: 700,
//                             px: 0.5,
//                             whiteSpace: 'nowrap',
//                             bgcolor: activeChip === 'all' ? THEME.accent : '#fff',
//                             color: activeChip === 'all' ? '#fff' : THEME.navy,
//                             border: `1px solid ${activeChip === 'all' ? THEME.accent : THEME.panelBorder}`
//                         }}
//                     />
//                     {MUHURAT_CATEGORIES.map((cat) => (
//                         <Chip
//                             key={cat.id}
//                             clickable
//                             icon={<cat.icon size={15} />}
//                             label={cat.chipLabel}
//                             onClick={() => selectSingleCategory(cat.id)}
//                             sx={{
//                                 fontWeight: 700,
//                                 px: 0.5,
//                                 whiteSpace: 'nowrap',
//                                 bgcolor: activeChip === cat.id ? THEME.accent : '#fff',
//                                 color: activeChip === cat.id ? '#fff' : THEME.navy,
//                                 border: `1px solid ${activeChip === cat.id ? THEME.accent : THEME.panelBorder}`
//                             }}
//                         />
//                     ))}
//                 </Stack>

//                 {/* ---------------------------------------------------------- */}
//                 {/* MAIN 3-COLUMN LAYOUT — plain CSS Grid (see Calendar page   */}
//                 {/* for why: MUI <Grid item xs={fraction}> silently breaks     */}
//                 {/* on non-integer values, CSS Grid never has that problem).   */}
//                 {/* ---------------------------------------------------------- */}
//                 <Box
//                     sx={{
//                         display: 'grid',
//                         gridTemplateColumns: { xs: '1fr', lg: '280px minmax(0, 1fr) 300px' },
//                         gap: 3,
//                         alignItems: 'start',
//                         minWidth: 0
//                     }}
//                 >
//                     {/* LEFT SIDEBAR */}
//                     <Stack spacing={2}>
//                         <Card ref={dateCardRef} sx={{ p: 2, borderRadius: 3, boxShadow: THEME.shadow }}>
//                             <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
//                                 <Typography sx={{ fontWeight: 700, fontSize: 13, color: THEME.navy }}>Select Date</Typography>
//                             </Stack>
//                             <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
//                                 <IconButton size="small" onClick={() => goToMonth(-1)}>
//                                     <TbChevronLeft />
//                                 </IconButton>
//                                 <Typography sx={{ fontWeight: 700, color: THEME.navy, fontSize: 13.5 }}>
//                                     {new Date(viewMonth.year, viewMonth.month, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
//                                 </Typography>
//                                 <IconButton size="small" onClick={() => goToMonth(1)}>
//                                     <TbChevronRight />
//                                 </IconButton>
//                             </Stack>
//                             <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', mb: 0.5 }}>
//                                 {WEEKDAY_LABELS.map((d) => (
//                                     <Typography key={d} sx={{ textAlign: 'center', fontSize: 10.5, color: THEME.muted, fontWeight: 700 }}>
//                                         {d}
//                                     </Typography>
//                                 ))}
//                             </Box>
//                             <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 0.25 }}>
//                                 {monthCells.map((date, i) => {
//                                     const inMonth = date.getMonth() === viewMonth.month;
//                                     const dateStr = toDateInputValue(date);
//                                     const isSelected = dateStr === selectedDate;
//                                     return (
//                                         <Box
//                                             key={i}
//                                             onClick={() => setSelectedDate(dateStr)}
//                                             sx={{
//                                                 cursor: 'pointer',
//                                                 textAlign: 'center',
//                                                 py: 0.5,
//                                                 borderRadius: 1.5,
//                                                 fontSize: 12,
//                                                 fontWeight: isSelected ? 700 : 500,
//                                                 color: isSelected ? '#fff' : THEME.navy,
//                                                 bgcolor: isSelected ? THEME.accent : 'transparent',
//                                                 opacity: inMonth ? 1 : 0.35,
//                                                 '&:hover': { bgcolor: isSelected ? THEME.accent : THEME.panelBorder }
//                                             }}
//                                         >
//                                             {date.getDate()}
//                                         </Box>
//                                     );
//                                 })}
//                             </Box>
//                         </Card>

//                         <Card sx={{ p: 1, borderRadius: 3, boxShadow: THEME.shadow }}>
//                             <Typography sx={{ fontWeight: 700, fontSize: 12.5, color: THEME.navy, px: 1, pt: 0.5, pb: 1 }}>
//                                 Quick Links
//                             </Typography>
//                             <Stack spacing={0.5}>
//                                 <Button
//                                     startIcon={<TbCalendarEvent size={17} />}
//                                     onClick={goToToday}
//                                     sx={{
//                                         justifyContent: 'flex-start',
//                                         px: 1.5,
//                                         py: 0.75,
//                                         borderRadius: 2,
//                                         fontWeight: 600,
//                                         fontSize: 13,
//                                         textTransform: 'none',
//                                         color: THEME.navy,
//                                         '&:hover': { bgcolor: THEME.panelBorder }
//                                     }}
//                                 >
//                                     Today&apos;s Muhurat
//                                 </Button>
//                                 {['This Week', 'This Month'].map((label) => (
//                                     <Stack
//                                         key={label}
//                                         direction="row"
//                                         alignItems="center"
//                                         spacing={0.5}
//                                         sx={{ px: 1.5, py: 0.75, opacity: 0.45 }}
//                                     >
//                                         <TbListDetails size={17} color={THEME.navy} />
//                                         <Typography sx={{ fontWeight: 600, fontSize: 13, color: THEME.navy }}>{label}</Typography>
//                                         <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: THEME.accent }}>SOON</Typography>
//                                     </Stack>
//                                 ))}
//                                 <Button
//                                     startIcon={<TbCalendar size={17} />}
//                                     onClick={() => dateCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
//                                     sx={{
//                                         justifyContent: 'flex-start',
//                                         px: 1.5,
//                                         py: 0.75,
//                                         borderRadius: 2,
//                                         fontWeight: 600,
//                                         fontSize: 13,
//                                         textTransform: 'none',
//                                         color: THEME.navy,
//                                         '&:hover': { bgcolor: THEME.panelBorder }
//                                     }}
//                                 >
//                                     Custom Date
//                                 </Button>
//                             </Stack>
//                         </Card>

//                         <Card sx={{ p: 2, borderRadius: 3, boxShadow: THEME.shadow }}>
//                             <Typography sx={{ fontWeight: 700, fontSize: 12.5, color: THEME.navy, mb: 1 }}>
//                                 Filter by Purpose
//                             </Typography>
//                             <Stack spacing={0.25}>
//                                 {MUHURAT_CATEGORIES.map((cat) => (
//                                     <FormControlLabel
//                                         key={cat.id}
//                                         control={
//                                             <Checkbox
//                                                 size="small"
//                                                 checked={purposeFilters.includes(cat.id)}
//                                                 onChange={() => toggleCategory(cat.id)}
//                                                 sx={{ color: THEME.panelBorder, '&.Mui-checked': { color: THEME.accent } }}
//                                             />
//                                         }
//                                         label={<Typography sx={{ fontSize: 12.5, color: THEME.navySoft }}>{cat.sidebarLabel}</Typography>}
//                                         sx={{ ml: 0 }}
//                                     />
//                                 ))}
//                             </Stack>
//                         </Card>
//                     </Stack>

//                     {/* MAIN TABLE */}
//                     <Card ref={tableRef} sx={{ p: { xs: 1.5, md: 2.5 }, borderRadius: 3, boxShadow: THEME.shadow, minWidth: 0 }}>
//                         <Stack
//                             direction={{ xs: 'column', sm: 'row' }}
//                             alignItems={{ xs: 'flex-start', sm: 'center' }}
//                             justifyContent="space-between"
//                             spacing={1.5}
//                             sx={{ mb: 2 }}
//                         >
//                             <Box>
//                                 <Typography sx={{ fontWeight: 800, color: THEME.navy, fontSize: 18 }}>
//                                     Muhurat for {dateLabel}
//                                 </Typography>
//                                 <Typography sx={{ fontSize: 12.5, color: THEME.muted }}>
//                                     Auspicious timings based on Vedic astrology, Panchang and planetary positions.
//                                 </Typography>
//                             </Box>
//                             <Chip
//                                 icon={<TbLocationPin size={15} color={THEME.accent} />}
//                                 onClick={(e) => setCityAnchor(e.currentTarget)}
//                                 label={
//                                     <Stack direction="row" spacing={0.75} alignItems="center">
//                                         <span>{selectedCity}</span>
//                                         <Typography component="span" sx={{ fontSize: 11.5, fontWeight: 700, color: THEME.accent }}>
//                                             Change
//                                         </Typography>
//                                     </Stack>
//                                 }
//                                 sx={{ bgcolor: '#fff', border: `1px solid ${THEME.panelBorder}`, fontWeight: 600, cursor: 'pointer' }}
//                             />
//                             <Popover
//                                 open={Boolean(cityAnchor)}
//                                 anchorEl={cityAnchor}
//                                 onClose={() => setCityAnchor(null)}
//                                 anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//                             >
//                                 <Select
//                                     autoFocus
//                                     size="small"
//                                     value={selectedCity}
//                                     onChange={(e) => {
//                                         setSelectedCity(e.target.value);
//                                         setCityAnchor(null);
//                                     }}
//                                     sx={{ m: 1, minWidth: 200 }}
//                                 >
//                                     <MenuItem value="New Delhi">New Delhi, Delhi</MenuItem>
//                                     {cities
//                                         .filter((c) => c.city !== 'New Delhi')
//                                         .map((c) => (
//                                             <MenuItem key={c.city} value={c.city}>
//                                                 {c.city}
//                                             </MenuItem>
//                                         ))}
//                                 </Select>
//                             </Popover>
//                         </Stack>

//                         {loading ? (
//                             <Stack spacing={1.25}>
//                                 {[...Array(6)].map((_, i) => (
//                                     <Skeleton key={i} height={48} />
//                                 ))}
//                             </Stack>
//                         ) : error ? (
//                             <Typography sx={{ fontSize: 12.5, color: THEME.inauspicious }}>{error}</Typography>
//                         ) : visibleRows.length === 0 ? (
//                             <Typography sx={{ fontSize: 13, color: THEME.muted, py: 4, textAlign: 'center' }}>
//                                 No muhurat entries match this filter for the selected date.
//                             </Typography>
//                         ) : (
//                             <TableContainer sx={{ overflowX: 'auto', ...THIN_SCROLLBAR_X }}>
//                                 <Table size="small" sx={{ minWidth: 640 }}>
//                                     <TableHead>
//                                         <TableRow sx={{ '& th': { border: 0, color: THEME.muted, fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 } }}>
//                                             <TableCell>Time</TableCell>
//                                             <TableCell>Muhurat Name</TableCell>
//                                             <TableCell>Purpose</TableCell>
//                                             <TableCell>Auspiciousness</TableCell>
//                                             <TableCell>Details</TableCell>
//                                             <TableCell align="right">Actions</TableCell>
//                                         </TableRow>
//                                     </TableHead>
//                                     <TableBody>
//                                         {visibleRows.map((row) => (
//                                             <TableRow key={row.id} sx={{ '& td': { border: 0, borderTop: `1px solid ${THEME.panelBorder}`, py: 1.5 } }}>
//                                                 <TableCell sx={{ whiteSpace: 'nowrap' }}>
//                                                     <Typography sx={{ fontWeight: 700, fontSize: 12.5, color: THEME.navy }}>
//                                                         {formatTime(row.start)} – {formatTime(row.end)}
//                                                     </Typography>
//                                                 </TableCell>
//                                                 <TableCell sx={{ whiteSpace: 'nowrap' }}>
//                                                     <Stack direction="row" alignItems="center" spacing={1}>
//                                                         <row.icon size={17} color={THEME.accent} />
//                                                         <Typography sx={{ fontWeight: 700, fontSize: 13, color: THEME.navy }}>{row.name}</Typography>
//                                                     </Stack>
//                                                 </TableCell>
//                                                 <TableCell sx={{ whiteSpace: 'nowrap' }}>
//                                                     <Typography sx={{ fontSize: 12.5, color: THEME.navySoft }}>{row.purpose}</Typography>
//                                                 </TableCell>
//                                                 <TableCell sx={{ whiteSpace: 'nowrap' }}>
//                                                     <Rating value={row.stars} precision={0.5} readOnly size="small" />
//                                                     <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: TONE_COLOR[row.tone] }}>
//                                                         {row.label}
//                                                     </Typography>
//                                                 </TableCell>
//                                                 <TableCell sx={{ minWidth: 180 }}>
//                                                     <Typography sx={{ fontSize: 12.5, color: THEME.muted }}>{row.details}</Typography>
//                                                 </TableCell>
//                                                 <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
//                                                     <Button
//                                                         size="small"
//                                                         onClick={() => setDetailsRow(row)}
//                                                         sx={{ textTransform: 'none', fontWeight: 700, color: THEME.accent }}
//                                                     >
//                                                         View Details →
//                                                     </Button>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))}
//                                     </TableBody>
//                                 </Table>
//                             </TableContainer>
//                         )}
//                     </Card>

//                     {/* RIGHT SIDEBAR */}
//                     <Stack spacing={2}>
//                         <Card sx={{ p: 2.5, borderRadius: 3, boxShadow: THEME.shadow, bgcolor: THEME.iconBg }}>
//                             <Typography sx={{ fontWeight: 700, color: THEME.navy, fontSize: 14, mb: 0.25 }}>
//                                 Today&apos;s Highlights
//                             </Typography>
//                             <Typography sx={{ fontSize: 12, color: THEME.muted, mb: 1.5 }}>
//                                 {dateLabel}, {weekdayLabel}
//                             </Typography>
//                             {loading ? (
//                                 <Skeleton height={120} />
//                             ) : (
//                                 <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 1.5, columnGap: 1 }}>
//                                     <HighlightItem icon={<WiSunrise size={22} color={THEME.accent} />} label="Sunrise" value={formatTime(panchang?.sunrise)} />
//                                     <HighlightItem icon={<WiSunset size={22} color={THEME.accent} />} label="Sunset" value={formatTime(panchang?.sunset)} />
//                                     <HighlightItem icon={<TbSparkles size={18} color={THEME.accent} />} label="Tithi" value={panchang?.tithi?.name} sub={panchang?.tithi?.endTime && `till ${formatTime(panchang.tithi.endTime)}`} />
//                                     <HighlightItem icon={<TbOm size={18} color={THEME.accent} />} label="Nakshatra" value={panchang?.nakshatra?.name} sub={panchang?.nakshatra?.endTime && `till ${formatTime(panchang.nakshatra.endTime)}`} />
//                                     <HighlightItem icon={<TbSun size={18} color={THEME.accent} />} label="Yoga" value={panchang?.yoga?.name} sub={panchang?.yoga?.endTime && `till ${formatTime(panchang.yoga.endTime)}`} />
//                                     <HighlightItem icon={<TbCategory2 size={18} color={THEME.accent} />} label="Karana" value={panchang?.karana?.name} sub={panchang?.karana?.endTime && `till ${formatTime(panchang.karana.endTime)}`} />
//                                 </Box>
//                             )}
//                         </Card>

//                         <Card sx={{ p: 2.5, borderRadius: 3, boxShadow: THEME.shadow }}>
//                             <Typography sx={{ fontWeight: 700, color: THEME.navy, fontSize: 14, mb: 1.5 }}>
//                                 Most Popular Muhurats
//                             </Typography>
//                             <Stack divider={<Divider />} spacing={1.25}>
//                                 {MOST_POPULAR.map((item, i) => (
//                                     <Stack
//                                         key={item.id}
//                                         direction="row"
//                                         alignItems="center"
//                                         spacing={1.25}
//                                         onClick={() => jumpToPopular(item.id)}
//                                         sx={{ cursor: 'pointer', pt: i === 0 ? 0 : 1.25, '&:hover': { opacity: 0.75 } }}
//                                     >
//                                         <Box
//                                             sx={{
//                                                 width: 22,
//                                                 height: 22,
//                                                 borderRadius: '50%',
//                                                 bgcolor: THEME.navy,
//                                                 color: '#fff',
//                                                 fontSize: 11,
//                                                 fontWeight: 700,
//                                                 display: 'flex',
//                                                 alignItems: 'center',
//                                                 justifyContent: 'center',
//                                                 flexShrink: 0
//                                             }}
//                                         >
//                                             {i + 1}
//                                         </Box>
//                                         <item.icon size={18} color={THEME.accent} style={{ flexShrink: 0 }} />
//                                         <Box sx={{ minWidth: 0 }}>
//                                             <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: THEME.navy }} noWrap>
//                                                 {item.label}
//                                             </Typography>
//                                             <Typography sx={{ fontSize: 11, color: THEME.muted }} noWrap>
//                                                 {item.sub}
//                                             </Typography>
//                                         </Box>
//                                     </Stack>
//                                 ))}
//                             </Stack>
//                         </Card>
//                     </Stack>
//                 </Box>

//                 {/* ---------------------------------------------------------- */}
//                 {/* BOTTOM CTA STRIP                                            */}
//                 {/* ---------------------------------------------------------- */}
//                 <Box
//                     sx={{
//                         mt: 3,
//                         borderRadius: 3,
//                         boxShadow: THEME.shadow,
//                         background: `linear-gradient(120deg, ${THEME.navy} 0%, #16213E 100%)`,
//                         p: { xs: 2.5, md: 3 },
//                         display: 'grid',
//                         gridTemplateColumns: { xs: '1fr', md: 'minmax(0,1fr) auto' },
//                         alignItems: 'center',
//                         gap: 2.5
//                     }}
//                 >
//                     <Box>
//                         <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: 18, md: 20 } }}>
//                             Right Time. Brighter Future.
//                         </Typography>
//                         <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, mt: 0.5 }}>
//                             Let ancient wisdom guide your important moments.
//                         </Typography>
//                     </Box>
//                     <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 4 }} alignItems="center">
//                         <Button
//                             variant="contained"
//                             endIcon={<TbSparkles size={16} />}
//                             sx={{
//                                 bgcolor: THEME.accent,
//                                 color: '#fff',
//                                 fontWeight: 700,
//                                 textTransform: 'none',
//                                 px: 2.5,
//                                 py: 1,
//                                 borderRadius: 2,
//                                 whiteSpace: 'nowrap',
//                                 '&:hover': { bgcolor: '#3A5488' }
//                             }}
//                         >
//                             Explore Personalized Muhurat
//                         </Button>
//                         <Stack direction="row" spacing={2.5}>
//                             <CtaBadge icon={<TbOm size={18} />} label="Trust Vedic Wisdom" />
//                             <CtaBadge icon={<TbShieldCheck size={18} />} label="Make Confident Decisions" />
//                             <CtaBadge icon={<TbSun size={18} />} label="Bring Positivity" />
//                         </Stack>
//                     </Stack>
//                 </Box>
//             </Box>

//             {/* ---------------------------------------------------------- */}
//             {/* VIEW DETAILS DIALOG                                         */}
//             {/* ---------------------------------------------------------- */}
//             <Dialog open={Boolean(detailsRow)} onClose={() => setDetailsRow(null)} maxWidth="xs" fullWidth>
//                 {detailsRow && (
//                     <>
//                         <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800, color: THEME.navy }}>
//                             <detailsRow.icon size={20} color={THEME.accent} />
//                             {detailsRow.name}
//                         </DialogTitle>
//                         <DialogContent>
//                             <Stack spacing={1.25}>
//                                 <Typography sx={{ fontSize: 13, color: THEME.muted }}>{detailsRow.details}</Typography>
//                                 <Divider />
//                                 <Stack direction="row" justifyContent="space-between">
//                                     <Typography sx={{ fontSize: 12.5, color: THEME.muted }}>Time Window</Typography>
//                                     <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: THEME.navy }}>
//                                         {formatTime(detailsRow.start)} – {formatTime(detailsRow.end)}
//                                     </Typography>
//                                 </Stack>
//                                 <Stack direction="row" justifyContent="space-between">
//                                     <Typography sx={{ fontSize: 12.5, color: THEME.muted }}>Purpose</Typography>
//                                     <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: THEME.navy }}>{detailsRow.purpose}</Typography>
//                                 </Stack>
//                                 <Stack direction="row" justifyContent="space-between" alignItems="center">
//                                     <Typography sx={{ fontSize: 12.5, color: THEME.muted }}>Rating</Typography>
//                                     <Stack direction="row" alignItems="center" spacing={1}>
//                                         <Rating value={detailsRow.stars} precision={0.5} readOnly size="small" />
//                                         <Typography sx={{ fontSize: 12, fontWeight: 700, color: TONE_COLOR[detailsRow.tone] }}>
//                                             {detailsRow.label}
//                                         </Typography>
//                                     </Stack>
//                                 </Stack>
//                             </Stack>
//                         </DialogContent>
//                         <DialogActions sx={{ px: 3, pb: 2.5 }}>
//                             <Button href="/panchang-muhurat" sx={{ textTransform: 'none', fontWeight: 700 }}>
//                                 Full Day Panchang
//                             </Button>
//                             <Button onClick={() => setDetailsRow(null)} variant="contained" sx={{ textTransform: 'none', bgcolor: THEME.navy }}>
//                                 Close
//                             </Button>
//                         </DialogActions>
//                     </>
//                 )}
//             </Dialog>
//         </Box>
//     );
// }

// function HighlightItem({ icon, label, value, sub }) {
//     return (
//         <Stack direction="row" spacing={1} alignItems="flex-start">
//             <Box sx={{ mt: 0.25 }}>{icon}</Box>
//             <Box sx={{ minWidth: 0 }}>
//                 <Typography sx={{ fontSize: 11, color: THEME.muted }}>{label}</Typography>
//                 <Typography sx={{ fontSize: 13, fontWeight: 700, color: THEME.navy }} noWrap>
//                     {value || '--'}
//                 </Typography>
//                 {sub && (
//                     <Typography sx={{ fontSize: 10, color: THEME.muted }} noWrap>
//                         {sub}
//                     </Typography>
//                 )}
//             </Box>
//         </Stack>
//     );
// }

// function CtaBadge({ icon, label }) {
//     return (
//         <Stack alignItems="center" spacing={0.5} sx={{ color: '#fff', textAlign: 'center', maxWidth: 90 }}>
//             <Box sx={{ color: THEME.accent }}>{icon}</Box>
//             <Typography sx={{ fontSize: 10.5, fontWeight: 600, lineHeight: 1.2 }}>{label}</Typography>
//         </Stack>
//     );
// }




// Place at: src/components/_main/muhurat/index.js
//
// New "Muhurat" page — replaces the "Learn (Soon)" nav item. Layout follows
// the reference UI: hero banner -> category filter chips -> 3-column body
// (date/filters sidebar, muhurat table, highlights + popular sidebar) ->
// bottom CTA strip. Same THEME tokens / CSS-Grid-not-MUI-Grid / banner
// convention as the Calendar and Vrat & Upvas pages, for a consistent feel.
//
// DATA NOTE: Brahma Muhurat, Abhijit Muhurat, sunrise/sunset, Tithi,
// Nakshatra, Yoga and Karana all come straight from the real Panchang API
// (same one Calendar/Panchang pages use). The other category rows (Griha
// Pravesh, Vivah, Namkaran, Vehicle Purchase, Business Start, Travel) are
// derived from the day's real sunrise/sunset window using a simplified
// even-split heuristic — a reasonable stand-in until a dedicated
// /muhurat calculation endpoint exists on the backend. This keeps the page
// fully functional today without inventing a whole new astrology engine
// for what was asked as a UI/design task.

'use client';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';

// mui
import {
    Box,
    Card,
    Stack,
    Chip,
    Button,
    IconButton,
    MenuItem,
    Select,
    Popover,
    Checkbox,
    FormControlLabel,
    Rating,
    Skeleton,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Collapse
} from '@mui/material';

// icons
import {
    TbChevronLeft,
    TbChevronRight,
    TbChevronDown,
    TbCategory2,
    TbHeartHandshake,
    TbHome,
    TbUserPlus,
    TbGift,
    TbCar,
    TbMapPin,
    TbBriefcase,
    TbPlane,
    TbSchool,
    TbDots,
    TbSparkles,
    TbSun,
    TbCalendar,
    TbCalendarEvent,
    TbListDetails,
    TbShieldCheck,
    TbOm,
    TbCurrentLocation,
    TbMapPin as TbLocationPin
} from 'react-icons/tb';
import { WiSunrise, WiSunset } from 'react-icons/wi';

// services
import { getPanchang, getPanchangCities, getMuhurat, getMuhuratMonth } from '@/services/panchang-service';

// ----------------------------------------------------------------------
// Theme tokens — same family used across Calendar / Vrat & Upvas so every
// (spiritual) page feels like one product.
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// Theme tokens — same "Chandra" (silver-white/navy) palette used across
// Panchang, Horoscope, Calendar and Vrat & Upvas, so every (spiritual)
// page feels like one product instead of each having its own colors.
// ----------------------------------------------------------------------
const THEME = {
    navy: '#2B3A63',
    navySoft: '#46577E',
    accent: '#4C6FA5',
    accentSoft: '#E7EEFA',
    bgGradient: 'linear-gradient(180deg, #DDE6F5 0%, #EEF3FC 45%, #FFFFFF 100%)',
    panelBorder: '#C9D6EE',
    iconBg: '#E7EEFA',
    muted: '#64748B',
    auspicious: '#2E9E5B',
    moderate: '#D97706',
    inauspicious: '#C0392B',
    shadow: '0 6px 20px rgba(43, 58, 99, 0.08)',
    shadowLg: '0 16px 40px rgba(43, 58, 99, 0.16)'
};

const TONE_COLOR = { auspicious: THEME.auspicious, moderate: THEME.moderate, inauspicious: THEME.inauspicious };

// Thin, brand-colored scrollbar for the horizontally-scrollable chip row and
// table — without this, browsers/OS render their own bulky native scrollbar
// (complete with arrow buttons on Windows/Firefox), which clashes with the
// flat, rounded look of everything else on the page.
const THIN_SCROLLBAR_X = {
    scrollbarWidth: 'thin', // Firefox
    scrollbarColor: `${THEME.panelBorder} transparent`, // Firefox
    '&::-webkit-scrollbar': { height: 6 },
    '&::-webkit-scrollbar-track': { background: 'transparent' },
    '&::-webkit-scrollbar-thumb': { background: THEME.panelBorder, borderRadius: 999 },
    '&::-webkit-scrollbar-button': { display: 'none', width: 0, height: 0 }
};

// Hero banner — plain full-width image, text is already baked into it
// (same convention as /calendar and /vrat-upvas).
// Shared column template so header and every row line up exactly.
const MUHURAT_GRID_COLS = '150px minmax(0, 1.35fr) minmax(0, 1fr) 138px 28px';

const HERO_BANNER_SRC = '/images/muhurat-hero-banner.png';

const MUHURAT_CATEGORIES = [
    { id: 'vivah', chipLabel: 'Vivah Muhurt', sidebarLabel: 'Vivah (Marriage)', icon: TbHeartHandshake },
    { id: 'griha-pravesh', chipLabel: 'Griha Pravesh', sidebarLabel: 'Griha Pravesh', icon: TbHome },
    { id: 'namkaran', chipLabel: 'Namkaran', sidebarLabel: 'Namkaran', icon: TbUserPlus },
    { id: 'annaprashan', chipLabel: 'Annaprashan', sidebarLabel: 'Annaprashan', icon: TbGift },
    { id: 'vehicle', chipLabel: 'Vehicle Purchase', sidebarLabel: 'Vehicle Purchase', icon: TbCar },
    { id: 'property', chipLabel: 'Property Purchase', sidebarLabel: 'Property Purchase', icon: TbMapPin },
    { id: 'business', chipLabel: 'Business Start', sidebarLabel: 'Business Start', icon: TbBriefcase },
    { id: 'travel', chipLabel: 'Travel Muhurt', sidebarLabel: 'Travel', icon: TbPlane },
    { id: 'education', chipLabel: 'Education', sidebarLabel: 'Education', icon: TbSchool },
    { id: 'others', chipLabel: 'Others', sidebarLabel: 'Others', icon: TbDots }
];

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const MOST_POPULAR = [
    { id: 'vivah', label: 'Vivah Muhurt', sub: 'Find best marriage timings', icon: TbHeartHandshake },
    { id: 'griha-pravesh', label: 'Griha Pravesh Muhurat', sub: 'Auspicious home entry', icon: TbHome },
    { id: 'vehicle', label: 'Vehicle Purchase Muhurat', sub: 'Buy with positive energy', icon: TbCar },
    { id: 'business', label: 'Business Start Muhurat', sub: 'Begin your venture', icon: TbBriefcase },
    { id: 'annaprashan', label: 'Annaprashan Muhurat', sub: 'First food ceremony', icon: TbGift }
];

function toDateInputValue(d = new Date()) {
    return d.toLocaleDateString('en-CA');
}

function formatTime(value) {
    if (!value) return '--';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return '--';
    return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function addMinutes(date, mins) {
    return new Date(date.getTime() + mins * 60000);
}

// Builds a 6x7 mini-calendar grid, same trick as the Calendar page.
function buildMonthGrid(year, monthIdx) {
    const firstOfMonth = new Date(year, monthIdx, 1);
    const startOffset = firstOfMonth.getDay();
    const gridStart = new Date(year, monthIdx, 1 - startOffset);
    const cells = [];
    for (let i = 0; i < 42; i++) {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + i);
        cells.push(date);
    }
    return cells;
}

// Icon lookup for each row id — backend sends plain data (can't serialize
// React components over JSON), so icons are attached client-side by id.
const MUHURAT_ROW_ICONS = {
    brahma: TbSparkles,
    abhijit: TbSun,
    'griha-pravesh': TbHome,
    namkaran: TbUserPlus,
    annaprashan: TbGift,
    vivah: TbHeartHandshake,
    vehicle: TbCar,
    property: TbMapPin,
    business: TbBriefcase,
    education: TbSchool,
    travel: TbPlane
};

// Turns the real, calculated rows returned by GET /panchang/muhurat into the
// shape the table/UI expects: parses start/end into Date objects and attaches
// the matching icon component. All the actual Muhurat calculation (Choghadiya +
// Tithi/Nakshatra/Weekday suitability rules) happens on the backend now — see
// backend/src/utils/muhurat-rules-util.js — nothing here is fabricated client-side.
function mapMuhuratApiRows(apiRows) {
    if (!Array.isArray(apiRows)) return [];
    return apiRows
        .map((row) => ({
            ...row,
            start: new Date(row.start),
            end: new Date(row.end),
            icon: MUHURAT_ROW_ICONS[row.id] || TbSparkles
        }))
        .sort((a, b) => a.start - b.start);
}

function haversineKm(lat1, lng1, lat2, lng2) {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

export default function Muhurat() {
    const today = useMemo(() => new Date(), []);
    const [viewMonth, setViewMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
    const [selectedDate, setSelectedDate] = useState(toDateInputValue(today));
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('New Delhi');
    // GPS auto-detected location — same idea as DrikPanchang's own location
    // resolution: try the browser's geolocation first and use exact
    // lat/lng for the Panchang calculation (the backend already accepts
    // lat/lng directly, see panchang-service.js), falling back to the
    // manually-picked/default city if permission is denied, unsupported,
    // or times out. "nearestLabel" is just for display — the nearest known
    // city name shown next to the pin — the actual calculation still uses
    // the browser's precise coordinates, not that city's coordinates.
    const [gpsLocation, setGpsLocation] = useState(null); // { lat, lng, nearestLabel }
    const [locationSource, setLocationSource] = useState('city'); // 'gps' | 'city'
    const [locationLoading, setLocationLoading] = useState(true);
    const [cityAnchor, setCityAnchor] = useState(null);
    const [panchang, setPanchang] = useState(null);
    const [muhuratApiRows, setMuhuratApiRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [purposeFilters, setPurposeFilters] = useState([]);
    const [detailsRow, setDetailsRow] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    // "This Month" quick link — real, calculated list of every auspicious
    // date (+ exact Muhurat interval) for a category across the currently
    // viewed month, from GET /panchang/muhurat/month (see muhurat-rules-util.js
    // on the backend). Nothing fabricated client-side — same as the main table.
    const [monthlyOpen, setMonthlyOpen] = useState(false);
    const [monthlyLoading, setMonthlyLoading] = useState(false);
    const [monthlyError, setMonthlyError] = useState(null);
    const [monthlyResult, setMonthlyResult] = useState(null); // { category, dates: [...] }
    const tableRef = useRef(null);
    const dateCardRef = useRef(null);

    useEffect(() => {
        getPanchangCities()
            .then((res) => setCities(res?.data || []))
            .catch(() => setCities([]));
    }, []);

    // Try to auto-fetch the user's current location once, on first load —
    // matches how DrikPanchang resolves a visitor's city automatically
    // instead of always defaulting to New Delhi. If the user has already
    // picked a city by hand this session, that always wins (see the
    // `locationSource === 'city'` guard below, flipped by handleManualCity).
    useEffect(() => {
        if (typeof window === 'undefined' || !navigator.geolocation) {
            setLocationLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setGpsLocation((prev) => ({ ...prev, lat: latitude, lng: longitude }));
                setLocationSource('gps');
                setLocationLoading(false);
            },
            () => {
                // permission denied / unavailable / timed out — silently
                // keep the default city, same as DrikPanchang falls back
                // to its default location when it can't resolve one.
                setLocationLoading(false);
            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 }
        );
    }, []);

    // Once we have both the GPS coordinates and the known-city list, resolve
    // a friendly "near <city>" label for display purposes only.
    useEffect(() => {
        if (!gpsLocation?.lat || !cities.length) return;
        let nearest = null;
        let nearestDist = Infinity;
        cities.forEach((c) => {
            const d = haversineKm(gpsLocation.lat, gpsLocation.lng, c.lat, c.lng);
            if (d < nearestDist) {
                nearestDist = d;
                nearest = c.city;
            }
        });
        if (nearest) setGpsLocation((prev) => (prev ? { ...prev, nearestLabel: nearest } : prev));
    }, [gpsLocation?.lat, gpsLocation?.lng, cities]);

    const handleManualCity = (cityName) => {
        setSelectedCity(cityName);
        setLocationSource('city');
        setCityAnchor(null);
    };

    const handleUseMyLocation = () => {
        if (gpsLocation?.lat) setLocationSource('gps');
        setCityAnchor(null);
    };

    const activeLocation = useMemo(() => {
        if (locationSource === 'gps' && gpsLocation?.lat) {
            return { lat: gpsLocation.lat, lng: gpsLocation.lng, label: gpsLocation.nearestLabel ? `Near ${gpsLocation.nearestLabel}` : 'Your Location' };
        }
        return { city: selectedCity, label: selectedCity };
    }, [locationSource, gpsLocation, selectedCity]);

    // Fetches BOTH the general Panchang (sunrise/sunset/tithi card etc — used
    // elsewhere on the page) AND the real, calculated Muhurat table from the
    // new /panchang/muhurat endpoint (see muhurat-rules-util.js on the
    // backend). Run in parallel since they're independent requests.
    const fetchForDate = useCallback(async (dateStr, location) => {
        setLoading(true);
        setError(null);
        try {
            const [panchangRes, muhuratRes] = await Promise.all([
                getPanchang({ date: dateStr, lat: location.lat, lng: location.lng, city: location.city }),
                getMuhurat({ date: dateStr, lat: location.lat, lng: location.lng, city: location.city })
            ]);
            setPanchang(panchangRes?.data || null);
            setMuhuratApiRows(muhuratRes?.data?.muhurats || []);
        } catch (err) {
            setError(err?.response?.data?.message || 'Muhurat data is temporarily unavailable. Please try again in a moment.');
            setPanchang(null);
            setMuhuratApiRows([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (locationLoading) return; // wait for the one-time geolocation attempt to settle first
        fetchForDate(selectedDate, activeLocation);
    }, [selectedDate, activeLocation, locationLoading, fetchForDate]);

    const monthCells = useMemo(() => buildMonthGrid(viewMonth.year, viewMonth.month), [viewMonth]);
    const muhuratRows = useMemo(() => mapMuhuratApiRows(muhuratApiRows), [muhuratApiRows]);

    const visibleRows = useMemo(() => {
        if (purposeFilters.length === 0) return muhuratRows;
        return muhuratRows.filter((r) => purposeFilters.includes(r.category));
    }, [muhuratRows, purposeFilters]);

    const activeChip = purposeFilters.length === 1 ? purposeFilters[0] : 'all';

    const toggleCategory = (id) => {
        setPurposeFilters((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
    };

    const selectSingleCategory = (id) => {
        setPurposeFilters(id === 'all' ? [] : [id]);
    };

    const goToMonth = (delta) => {
        setViewMonth((prev) => {
            const d = new Date(prev.year, prev.month + delta, 1);
            return { year: d.getFullYear(), month: d.getMonth() };
        });
    };

    const goToToday = () => {
        const t = new Date();
        setViewMonth({ year: t.getFullYear(), month: t.getMonth() });
        setSelectedDate(toDateInputValue(t));
    };

    const jumpToPopular = (id) => {
        selectSingleCategory(id);
        tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // "This Month" quick link — uses whichever single category is currently
    // selected (falls back to Griha Pravesh when "All Muhurats" is active,
    // since the month finder is per-category, same as DrikPanchang's own
    // muhurat pages), for the month currently shown in the mini calendar.
    const openMonthlyMuhurat = async (categoryOverride) => {
        const category = categoryOverride || (purposeFilters.length === 1 ? purposeFilters[0] : 'griha-pravesh');
        setMonthlyOpen(true);
        setMonthlyLoading(true);
        setMonthlyError(null);
        try {
            const res = await getMuhuratMonth({
                year: viewMonth.year,
                month: viewMonth.month + 1,
                category,
                lat: activeLocation.lat,
                lng: activeLocation.lng,
                city: activeLocation.city
            });
            setMonthlyResult(res?.data || null);
        } catch (err) {
            setMonthlyError(err?.response?.data?.message || 'Monthly Muhurat data is temporarily unavailable. Please try again in a moment.');
            setMonthlyResult(null);
        } finally {
            setMonthlyLoading(false);
        }
    };

    const selectedDateObj = new Date(`${selectedDate}T00:00:00`);
    const dateLabel = selectedDateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const weekdayLabel = selectedDateObj.toLocaleDateString('en-IN', { weekday: 'long' });

    return (
        <Box sx={{ overflowX: 'hidden', maxWidth: '100%' }}>
            {/* ---------------------------------------------------------- */}
            {/* HERO BANNER — same treatment as Calendar / Vrat & Upvas:    */}
            {/* sits directly below the navbar (outside the padded panel), */}
            {/* plain full-width image, text baked into the art itself.    */}
            {/* Fixed aspect-ratio (matched to the Vrat & Upvas banner) +   */}
            {/* objectFit: cover, so this renders at the exact same height */}
            {/* as that banner regardless of this PNG's own dimensions —   */}
            {/* before this, the raw image's own (taller) aspect ratio was */}
            {/* making this banner visibly bigger than the other pages'.   */}
            {/* ---------------------------------------------------------- */}
            <Box sx={{ position: 'relative', mb: 3 }}>
                <Box
                    component="img"
                    src={HERO_BANNER_SRC}
                    alt="Panchang Muhurat — Auspicious Timings for a Blessed Beginning"
                    sx={{
                        width: '100%',
                        aspectRatio: '4.08 / 1',
                        height: 'auto',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        display: 'block',
                        borderRadius: 4,
                        boxShadow: THEME.shadow
                    }}
                />
                <Typography
                    component="h1"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 1,
                        height: 1,
                        p: 0,
                        m: 0,
                        overflow: 'hidden',
                        clip: 'rect(0 0 0 0)',
                        whiteSpace: 'nowrap',
                        border: 0
                    }}
                >
                    Panchang Muhurat — Auspicious Timings for a Blessed Beginning
                </Typography>
            </Box>

            <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 3, p: { xs: 2, md: 3 } }}>
                {/* ---------------------------------------------------------- */}
                {/* CATEGORY FILTER CHIPS — horizontally scrollable row        */}
                {/* ---------------------------------------------------------- */}
                <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1, mb: 3, ...THIN_SCROLLBAR_X }}>
                    <Chip
                        clickable
                        icon={<TbCategory2 size={15} />}
                        label="All Muhurats"
                        onClick={() => selectSingleCategory('all')}
                        sx={{
                            fontWeight: 700,
                            px: 0.5,
                            whiteSpace: 'nowrap',
                            bgcolor: activeChip === 'all' ? THEME.accent : '#fff',
                            color: activeChip === 'all' ? '#fff' : THEME.navy,
                            border: `1px solid ${activeChip === 'all' ? THEME.accent : THEME.panelBorder}`
                        }}
                    />
                    {MUHURAT_CATEGORIES.map((cat) => (
                        <Chip
                            key={cat.id}
                            clickable
                            icon={<cat.icon size={15} />}
                            label={cat.chipLabel}
                            onClick={() => selectSingleCategory(cat.id)}
                            sx={{
                                fontWeight: 700,
                                px: 0.5,
                                whiteSpace: 'nowrap',
                                bgcolor: activeChip === cat.id ? THEME.accent : '#fff',
                                color: activeChip === cat.id ? '#fff' : THEME.navy,
                                border: `1px solid ${activeChip === cat.id ? THEME.accent : THEME.panelBorder}`
                            }}
                        />
                    ))}
                </Stack>

                {/* ---------------------------------------------------------- */}
                {/* MAIN 3-COLUMN LAYOUT — plain CSS Grid (see Calendar page   */}
                {/* for why: MUI <Grid item xs={fraction}> silently breaks     */}
                {/* on non-integer values, CSS Grid never has that problem).   */}
                {/* ---------------------------------------------------------- */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: '280px minmax(0, 1fr) 300px' },
                        gap: 3,
                        alignItems: 'start',
                        minWidth: 0
                    }}
                >
                    {/* LEFT SIDEBAR */}
                    <Stack spacing={2}>
                        <Card ref={dateCardRef} sx={{ p: 2, borderRadius: 3, boxShadow: THEME.shadow }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 13, color: THEME.navy }}>Select Date</Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                <IconButton size="small" onClick={() => goToMonth(-1)}>
                                    <TbChevronLeft />
                                </IconButton>
                                <Typography sx={{ fontWeight: 700, color: THEME.navy, fontSize: 13.5 }}>
                                    {new Date(viewMonth.year, viewMonth.month, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                </Typography>
                                <IconButton size="small" onClick={() => goToMonth(1)}>
                                    <TbChevronRight />
                                </IconButton>
                            </Stack>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', mb: 0.5 }}>
                                {WEEKDAY_LABELS.map((d) => (
                                    <Typography key={d} sx={{ textAlign: 'center', fontSize: 10.5, color: THEME.muted, fontWeight: 700 }}>
                                        {d}
                                    </Typography>
                                ))}
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 0.25 }}>
                                {monthCells.map((date, i) => {
                                    const inMonth = date.getMonth() === viewMonth.month;
                                    const dateStr = toDateInputValue(date);
                                    const isSelected = dateStr === selectedDate;
                                    return (
                                        <Box
                                            key={i}
                                            onClick={() => setSelectedDate(dateStr)}
                                            sx={{
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                py: 0.5,
                                                borderRadius: 1.5,
                                                fontSize: 12,
                                                fontWeight: isSelected ? 700 : 500,
                                                color: isSelected ? '#fff' : THEME.navy,
                                                bgcolor: isSelected ? THEME.accent : 'transparent',
                                                opacity: inMonth ? 1 : 0.35,
                                                '&:hover': { bgcolor: isSelected ? THEME.accent : THEME.panelBorder }
                                            }}
                                        >
                                            {date.getDate()}
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Card>

                        <Card sx={{ p: 1, borderRadius: 3, boxShadow: THEME.shadow }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 12.5, color: THEME.navy, px: 1, pt: 0.5, pb: 1 }}>
                                Quick Links
                            </Typography>
                            <Stack spacing={0.5}>
                                <Button
                                    startIcon={<TbCalendarEvent size={17} />}
                                    onClick={goToToday}
                                    sx={{
                                        justifyContent: 'flex-start',
                                        px: 1.5,
                                        py: 0.75,
                                        borderRadius: 2,
                                        fontWeight: 600,
                                        fontSize: 13,
                                        textTransform: 'none',
                                        color: THEME.navy,
                                        '&:hover': { bgcolor: THEME.panelBorder }
                                    }}
                                >
                                    Today&apos;s Muhurat
                                </Button>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={0.5}
                                    sx={{ px: 1.5, py: 0.75, opacity: 0.45 }}
                                >
                                    <TbListDetails size={17} color={THEME.navy} />
                                    <Typography sx={{ fontWeight: 600, fontSize: 13, color: THEME.navy }}>This Week</Typography>
                                    <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: THEME.accent }}>SOON</Typography>
                                </Stack>
                                <Button
                                    startIcon={<TbListDetails size={17} />}
                                    onClick={() => openMonthlyMuhurat()}
                                    sx={{
                                        justifyContent: 'flex-start',
                                        px: 1.5,
                                        py: 0.75,
                                        borderRadius: 2,
                                        fontWeight: 600,
                                        fontSize: 13,
                                        textTransform: 'none',
                                        color: THEME.navy,
                                        '&:hover': { bgcolor: THEME.panelBorder }
                                    }}
                                >
                                    This Month&apos;s Dates
                                </Button>
                                <Button
                                    startIcon={<TbCalendar size={17} />}
                                    onClick={() => dateCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                    sx={{
                                        justifyContent: 'flex-start',
                                        px: 1.5,
                                        py: 0.75,
                                        borderRadius: 2,
                                        fontWeight: 600,
                                        fontSize: 13,
                                        textTransform: 'none',
                                        color: THEME.navy,
                                        '&:hover': { bgcolor: THEME.panelBorder }
                                    }}
                                >
                                    Custom Date
                                </Button>
                            </Stack>
                        </Card>

                        <Card sx={{ p: 2, borderRadius: 3, boxShadow: THEME.shadow }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 12.5, color: THEME.navy, mb: 1 }}>
                                Filter by Purpose
                            </Typography>
                            <Stack spacing={0.25}>
                                {MUHURAT_CATEGORIES.map((cat) => (
                                    <FormControlLabel
                                        key={cat.id}
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={purposeFilters.includes(cat.id)}
                                                onChange={() => toggleCategory(cat.id)}
                                                sx={{ color: THEME.panelBorder, '&.Mui-checked': { color: THEME.accent } }}
                                            />
                                        }
                                        label={<Typography sx={{ fontSize: 12.5, color: THEME.navySoft }}>{cat.sidebarLabel}</Typography>}
                                        sx={{ ml: 0 }}
                                    />
                                ))}
                            </Stack>
                        </Card>
                    </Stack>

                    {/* MAIN TABLE */}
                    <Card ref={tableRef} sx={{ p: { xs: 1.5, md: 2.5 }, borderRadius: 3, boxShadow: THEME.shadow, minWidth: 0 }}>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            justifyContent="space-between"
                            spacing={1.5}
                            sx={{ mb: 2 }}
                        >
                            <Box>
                                <Typography sx={{ fontWeight: 800, color: THEME.navy, fontSize: 18 }}>
                                    Muhurat for {dateLabel}
                                </Typography>
                                <Typography sx={{ fontSize: 12.5, color: THEME.muted }}>
                                    Auspicious timings based on Vedic astrology, Panchang and planetary positions.
                                </Typography>
                            </Box>
                            <Chip
                                icon={<TbLocationPin size={15} color={THEME.accent} />}
                                onClick={(e) => setCityAnchor(e.currentTarget)}
                                label={
                                    <Stack direction="row" spacing={0.75} alignItems="center">
                                        <span>{activeLocation.label}</span>
                                        <Typography component="span" sx={{ fontSize: 11.5, fontWeight: 700, color: THEME.accent }}>
                                            Change
                                        </Typography>
                                    </Stack>
                                }
                                sx={{ bgcolor: '#fff', border: `1px solid ${THEME.panelBorder}`, fontWeight: 600, cursor: 'pointer' }}
                            />
                            <Popover
                                open={Boolean(cityAnchor)}
                                anchorEl={cityAnchor}
                                onClose={() => setCityAnchor(null)}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            >
                                <Stack sx={{ p: 1, minWidth: 220 }} spacing={0.5}>
                                    <Button
                                        size="small"
                                        startIcon={<TbCurrentLocation size={15} />}
                                        disabled={!gpsLocation?.lat}
                                        onClick={handleUseMyLocation}
                                        sx={{ justifyContent: 'flex-start', textTransform: 'none', fontWeight: 700, color: THEME.accent }}
                                    >
                                        {gpsLocation?.lat ? 'Use My Current Location' : 'Locating…'}
                                    </Button>
                                    <Select
                                        autoFocus
                                        size="small"
                                        value={selectedCity}
                                        onChange={(e) => handleManualCity(e.target.value)}
                                        sx={{ minWidth: 200 }}
                                    >
                                        <MenuItem value="New Delhi">New Delhi, Delhi</MenuItem>
                                        {cities
                                            .filter((c) => c.city !== 'New Delhi')
                                            .map((c) => (
                                                <MenuItem key={c.city} value={c.city}>
                                                    {c.city}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </Stack>
                            </Popover>
                        </Stack>

                        {loading ? (
                            <Stack spacing={1.25}>
                                {[...Array(6)].map((_, i) => (
                                    <Skeleton key={i} height={48} />
                                ))}
                            </Stack>
                        ) : error ? (
                            <Typography sx={{ fontSize: 12.5, color: THEME.inauspicious }}>{error}</Typography>
                        ) : visibleRows.length === 0 ? (
                            <Typography sx={{ fontSize: 13, color: THEME.muted, py: 4, textAlign: 'center' }}>
                                No muhurat entries match this filter for the selected date.
                            </Typography>
                        ) : (
                            <Box
                                sx={{
                                    border: `1px solid ${THEME.panelBorder}`,
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    bgcolor: 'background.paper'
                                }}
                            >
                                {/* Header (desktop only) */}
                                <Box
                                    sx={{
                                        display: { xs: 'none', md: 'grid' },
                                        gridTemplateColumns: MUHURAT_GRID_COLS,
                                        columnGap: 1.5,
                                        alignItems: 'center',
                                        px: 2.5,
                                        py: 1.5,
                                        bgcolor: THEME.accentSoft,
                                        borderBottom: `1px solid ${THEME.panelBorder}`,
                                        color: THEME.muted,
                                        fontSize: 11.5,
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.6
                                    }}
                                >
                                    <Box>Time</Box>
                                    <Box>Muhurat Name</Box>
                                    <Box>Purpose</Box>
                                    <Box>Auspiciousness</Box>
                                    <Box />
                                </Box>

                                {visibleRows.map((row, idx) => {
                                    const isOpen = expandedId === row.id;
                                    const toneColor = TONE_COLOR[row.tone] || THEME.accent;
                                    return (
                                        <Box
                                            key={row.id}
                                            sx={{
                                                borderTop: idx === 0 ? 0 : `1px solid ${THEME.panelBorder}`,
                                                bgcolor: isOpen ? 'rgba(231, 238, 250, 0.45)' : 'transparent',
                                                transition: 'background-color .2s ease'
                                            }}
                                        >
                                            {/* Summary row: every row has the same fixed height */}
                                            <Box
                                                role="button"
                                                tabIndex={0}
                                                aria-expanded={isOpen}
                                                onClick={() => setExpandedId(isOpen ? null : row.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        setExpandedId(isOpen ? null : row.id);
                                                    }
                                                }}
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: { xs: '1fr 32px', md: MUHURAT_GRID_COLS },
                                                    columnGap: 1.5,
                                                    rowGap: 0.75,
                                                    alignItems: 'center',
                                                    minHeight: { md: 84 },
                                                    px: 2.5,
                                                    py: { xs: 1.75, md: 1.25 },
                                                    cursor: 'pointer',
                                                    outline: 'none',
                                                    '&:hover': { bgcolor: 'rgba(231, 238, 250, 0.6)' },
                                                    '&:focus-visible': { boxShadow: `inset 0 0 0 2px ${THEME.accent}` }
                                                }}
                                            >
                                                {/* Time */}
                                                <Box sx={{ gridColumn: { xs: '1 / 2', md: 'auto' }, order: { xs: 2, md: 0 } }}>
                                                    <Typography sx={{ fontWeight: 700, fontSize: 13, color: THEME.navy, whiteSpace: 'nowrap' }}>
                                                        {formatTime(row.start)} – {formatTime(row.end)}
                                                    </Typography>
                                                </Box>

                                                {/* Name */}
                                                <Stack
                                                    direction="row"
                                                    alignItems="center"
                                                    spacing={1.25}
                                                    sx={{ minWidth: 0, gridColumn: { xs: '1 / 2', md: 'auto' }, order: { xs: 1, md: 0 } }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 34,
                                                            height: 34,
                                                            flexShrink: 0,
                                                            borderRadius: '10px',
                                                            bgcolor: THEME.iconBg,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <row.icon size={18} color={THEME.accent} />
                                                    </Box>
                                                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: THEME.navy, lineHeight: 1.3, minWidth: 0, flex: 1, overflowWrap: 'anywhere' }}>
                                                        {row.name}
                                                    </Typography>
                                                </Stack>

                                                {/* Purpose */}
                                                <Typography
                                                    sx={{
                                                        fontSize: 13,
                                                        color: THEME.navySoft,
                                                        lineHeight: 1.45,
                                                        minWidth: 0,
                                                        overflowWrap: 'anywhere',
                                                        gridColumn: { xs: '1 / 2', md: 'auto' },
                                                        order: { xs: 3, md: 0 },
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {row.purpose}
                                                </Typography>

                                                {/* Auspiciousness */}
                                                <Stack spacing={0.25} sx={{ gridColumn: { xs: '1 / 2', md: 'auto' }, order: { xs: 4, md: 0 } }}>
                                                    <Rating value={row.stars} precision={0.5} readOnly size="small" />
                                                    <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: toneColor }}>{row.label}</Typography>
                                                </Stack>

                                                {/* Chevron */}
                                                <Box
                                                    sx={{
                                                        gridColumn: { xs: '2 / 3', md: 'auto' },
                                                        gridRow: { xs: '1 / 2', md: 'auto' },
                                                        order: { xs: 1, md: 0 },
                                                        justifySelf: 'end',
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: THEME.accent,
                                                        bgcolor: isOpen ? THEME.accentSoft : 'transparent',
                                                        transition: 'transform .25s ease, background-color .2s ease',
                                                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                                    }}
                                                >
                                                    <TbChevronDown size={18} />
                                                </Box>
                                            </Box>

                                            {/* Dropdown: long details live here */}
                                            <Collapse in={isOpen} timeout={250} unmountOnExit>
                                                <Box sx={{ px: 2.5, pb: 2.25, pt: 0.25 }}>
                                                    <Box
                                                        sx={{
                                                            borderLeft: `3px solid ${toneColor}`,
                                                            bgcolor: 'background.paper',
                                                            borderRadius: '0 12px 12px 0',
                                                            boxShadow: '0 2px 10px rgba(43, 58, 99, 0.06)',
                                                            px: 2,
                                                            py: 1.75
                                                        }}
                                                    >
                                                        <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: THEME.muted, textTransform: 'uppercase', letterSpacing: 0.6, mb: 0.75 }}>
                                                            About this muhurat
                                                        </Typography>
                                                        <Typography sx={{ fontSize: 13.5, color: THEME.navySoft, lineHeight: 1.7 }}>
                                                            {row.details}
                                                        </Typography>
                                                        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
                                                            <Button
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setDetailsRow(row);
                                                                }}
                                                                sx={{ textTransform: 'none', fontWeight: 700, color: THEME.accent }}
                                                            >
                                                                View Details →
                                                            </Button>
                                                        </Stack>
                                                    </Box>
                                                </Box>
                                            </Collapse>
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Card>

                    {/* RIGHT SIDEBAR */}
                    <Stack spacing={2}>
                        <Card sx={{ p: 2.5, borderRadius: 3, boxShadow: THEME.shadow, bgcolor: THEME.iconBg }}>
                            <Typography sx={{ fontWeight: 700, color: THEME.navy, fontSize: 14, mb: 0.25 }}>
                                Today&apos;s Highlights
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: THEME.muted, mb: 1.5 }}>
                                {dateLabel}, {weekdayLabel}
                            </Typography>
                            {loading ? (
                                <Skeleton height={120} />
                            ) : (
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 1.5, columnGap: 1 }}>
                                    <HighlightItem icon={<WiSunrise size={22} color={THEME.accent} />} label="Sunrise" value={formatTime(panchang?.sunrise)} />
                                    <HighlightItem icon={<WiSunset size={22} color={THEME.accent} />} label="Sunset" value={formatTime(panchang?.sunset)} />
                                    <HighlightItem icon={<TbSparkles size={18} color={THEME.accent} />} label="Tithi" value={panchang?.tithi?.name} sub={panchang?.tithi?.endTime && `till ${formatTime(panchang.tithi.endTime)}`} />
                                    <HighlightItem icon={<TbOm size={18} color={THEME.accent} />} label="Nakshatra" value={panchang?.nakshatra?.name} sub={panchang?.nakshatra?.endTime && `till ${formatTime(panchang.nakshatra.endTime)}`} />
                                    <HighlightItem icon={<TbSun size={18} color={THEME.accent} />} label="Yoga" value={panchang?.yoga?.name} sub={panchang?.yoga?.endTime && `till ${formatTime(panchang.yoga.endTime)}`} />
                                    <HighlightItem icon={<TbCategory2 size={18} color={THEME.accent} />} label="Karana" value={panchang?.karana?.name} sub={panchang?.karana?.endTime && `till ${formatTime(panchang.karana.endTime)}`} />
                                </Box>
                            )}
                        </Card>

                        <Card sx={{ p: 2.5, borderRadius: 3, boxShadow: THEME.shadow }}>
                            <Typography sx={{ fontWeight: 700, color: THEME.navy, fontSize: 14, mb: 1.5 }}>
                                Most Popular Muhurats
                            </Typography>
                            <Stack divider={<Divider />} spacing={1.25}>
                                {MOST_POPULAR.map((item, i) => (
                                    <Stack
                                        key={item.id}
                                        direction="row"
                                        alignItems="center"
                                        spacing={1.25}
                                        onClick={() => jumpToPopular(item.id)}
                                        sx={{ cursor: 'pointer', pt: i === 0 ? 0 : 1.25, '&:hover': { opacity: 0.75 } }}
                                    >
                                        <Box
                                            sx={{
                                                width: 22,
                                                height: 22,
                                                borderRadius: '50%',
                                                bgcolor: THEME.navy,
                                                color: '#fff',
                                                fontSize: 11,
                                                fontWeight: 700,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}
                                        >
                                            {i + 1}
                                        </Box>
                                        <item.icon size={18} color={THEME.accent} style={{ flexShrink: 0 }} />
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: THEME.navy }} noWrap>
                                                {item.label}
                                            </Typography>
                                            <Typography sx={{ fontSize: 11, color: THEME.muted }} noWrap>
                                                {item.sub}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                ))}
                            </Stack>
                        </Card>
                    </Stack>
                </Box>

                {/* ---------------------------------------------------------- */}
                {/* BOTTOM CTA STRIP                                            */}
                {/* ---------------------------------------------------------- */}
                <Box
                    sx={{
                        mt: 3,
                        borderRadius: 3,
                        boxShadow: THEME.shadow,
                        background: `linear-gradient(120deg, ${THEME.navy} 0%, #16213E 100%)`,
                        p: { xs: 2.5, md: 3 },
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'minmax(0,1fr) auto' },
                        alignItems: 'center',
                        gap: 2.5
                    }}
                >
                    <Box>
                        <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: 18, md: 20 } }}>
                            Right Time. Brighter Future.
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, mt: 0.5 }}>
                            Let ancient wisdom guide your important moments.
                        </Typography>
                    </Box>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 4 }} alignItems="center">
                        <Button
                            variant="contained"
                            endIcon={<TbSparkles size={16} />}
                            sx={{
                                bgcolor: THEME.accent,
                                color: '#fff',
                                fontWeight: 700,
                                textTransform: 'none',
                                px: 2.5,
                                py: 1,
                                borderRadius: 2,
                                whiteSpace: 'nowrap',
                                '&:hover': { bgcolor: '#3A5488' }
                            }}
                        >
                            Explore Personalized Muhurat
                        </Button>
                        <Stack direction="row" spacing={2.5}>
                            <CtaBadge icon={<TbOm size={18} />} label="Trust Vedic Wisdom" />
                            <CtaBadge icon={<TbShieldCheck size={18} />} label="Make Confident Decisions" />
                            <CtaBadge icon={<TbSun size={18} />} label="Bring Positivity" />
                        </Stack>
                    </Stack>
                </Box>
            </Box>

            {/* ---------------------------------------------------------- */}
            {/* THIS MONTH'S AUSPICIOUS DATES DIALOG                        */}
            {/* Real, calculated list from GET /panchang/muhurat/month —    */}
            {/* every day in the month is scored dynamically, same rule     */}
            {/* engine as the main table above; nothing hardcoded.          */}
            {/* ---------------------------------------------------------- */}
            <Dialog open={monthlyOpen} onClose={() => setMonthlyOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 800, color: THEME.navy }}>
                    Auspicious Dates —{' '}
                    {new Date(viewMonth.year, viewMonth.month, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </DialogTitle>
                <DialogContent dividers>
                    <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto', pb: 0.5, ...THIN_SCROLLBAR_X }}>
                        {MUHURAT_CATEGORIES.filter((c) => c.id !== 'others').map((cat) => (
                            <Chip
                                key={cat.id}
                                size="small"
                                clickable
                                icon={<cat.icon size={13} />}
                                label={cat.chipLabel}
                                onClick={() => openMonthlyMuhurat(cat.id)}
                                sx={{
                                    fontWeight: 700,
                                    fontSize: 11.5,
                                    whiteSpace: 'nowrap',
                                    bgcolor: monthlyResult?.category === cat.id ? THEME.accent : '#fff',
                                    color: monthlyResult?.category === cat.id ? '#fff' : THEME.navy,
                                    border: `1px solid ${monthlyResult?.category === cat.id ? THEME.accent : THEME.panelBorder}`
                                }}
                            />
                        ))}
                    </Stack>

                    {monthlyLoading ? (
                        <Stack spacing={1.25}>
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} height={44} />
                            ))}
                        </Stack>
                    ) : monthlyError ? (
                        <Typography sx={{ fontSize: 12.5, color: THEME.inauspicious }}>{monthlyError}</Typography>
                    ) : !monthlyResult?.dates?.length ? (
                        <Typography sx={{ fontSize: 13, color: THEME.muted, py: 3, textAlign: 'center' }}>
                            No auspicious dates found for this category this month.
                        </Typography>
                    ) : (
                        <Stack divider={<Divider />} spacing={1.25}>
                            {monthlyResult.dates.map((d) => {
                                const dObj = new Date(`${d.date}T00:00:00`);
                                return (
                                    <Stack key={d.date} direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: THEME.navy }}>
                                                {dObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}, {d.weekday}
                                            </Typography>
                                            <Typography sx={{ fontSize: 11.5, color: THEME.muted }} noWrap>
                                                {d.tithi} {d.nakshatra ? `• ${d.nakshatra}` : ''}
                                            </Typography>
                                            <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: TONE_COLOR.auspicious }}>{d.label}</Typography>
                                        </Box>
                                        <Stack alignItems="flex-end" spacing={0.25} sx={{ flexShrink: 0 }}>
                                            <Typography sx={{ fontWeight: 700, fontSize: 12.5, color: THEME.navy }}>
                                                {formatTime(d.start)} – {formatTime(d.end)}
                                            </Typography>
                                            <Button
                                                size="small"
                                                onClick={() => {
                                                    setSelectedDate(d.date);
                                                    setViewMonth({ year: dObj.getFullYear(), month: dObj.getMonth() });
                                                    setMonthlyOpen(false);
                                                }}
                                                sx={{ textTransform: 'none', fontWeight: 700, fontSize: 11.5, color: THEME.accent, minWidth: 0, p: 0 }}
                                            >
                                                View this date →
                                            </Button>
                                        </Stack>
                                    </Stack>
                                );
                            })}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setMonthlyOpen(false)} variant="contained" sx={{ textTransform: 'none', bgcolor: THEME.navy }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ---------------------------------------------------------- */}
            {/* VIEW DETAILS DIALOG                                         */}
            {/* ---------------------------------------------------------- */}
            <Dialog open={Boolean(detailsRow)} onClose={() => setDetailsRow(null)} maxWidth="xs" fullWidth>
                {detailsRow && (
                    <>
                        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800, color: THEME.navy }}>
                            <detailsRow.icon size={20} color={THEME.accent} />
                            {detailsRow.name}
                        </DialogTitle>
                        <DialogContent>
                            <Stack spacing={1.25}>
                                <Typography sx={{ fontSize: 13, color: THEME.muted }}>{detailsRow.details}</Typography>
                                <Divider />
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography sx={{ fontSize: 12.5, color: THEME.muted }}>Time Window</Typography>
                                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: THEME.navy }}>
                                        {formatTime(detailsRow.start)} – {formatTime(detailsRow.end)}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography sx={{ fontSize: 12.5, color: THEME.muted }}>Purpose</Typography>
                                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: THEME.navy }}>{detailsRow.purpose}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography sx={{ fontSize: 12.5, color: THEME.muted }}>Rating</Typography>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Rating value={detailsRow.stars} precision={0.5} readOnly size="small" />
                                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: TONE_COLOR[detailsRow.tone] }}>
                                            {detailsRow.label}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2.5 }}>
                            <Button href="/panchang-muhurat" sx={{ textTransform: 'none', fontWeight: 700 }}>
                                Full Day Panchang
                            </Button>
                            <Button onClick={() => setDetailsRow(null)} variant="contained" sx={{ textTransform: 'none', bgcolor: THEME.navy }}>
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}

function HighlightItem({ icon, label, value, sub }) {
    return (
        <Stack direction="row" spacing={1} alignItems="flex-start">
            <Box sx={{ mt: 0.25 }}>{icon}</Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 11, color: THEME.muted }}>{label}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: THEME.navy }} noWrap>
                    {value || '--'}
                </Typography>
                {sub && (
                    <Typography sx={{ fontSize: 10, color: THEME.muted }} noWrap>
                        {sub}
                    </Typography>
                )}
            </Box>
        </Stack>
    );
}

function CtaBadge({ icon, label }) {
    return (
        <Stack alignItems="center" spacing={0.5} sx={{ color: '#fff', textAlign: 'center', maxWidth: 90 }}>
            <Box sx={{ color: THEME.accent }}>{icon}</Box>
            <Typography sx={{ fontSize: 10.5, fontWeight: 600, lineHeight: 1.2 }}>{label}</Typography>
        </Stack>
    );
}