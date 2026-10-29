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
// Colours are CSS variables from src/theme/panchang-vars.js (light + dark).
const THEME = {
    navy: 'var(--pm-navy)',
    navySoft: 'var(--pm-navy-soft)',
    accent: 'var(--pm-accent)',
    accentSoft: 'var(--pm-icon-bg)',
    bgGradient: 'var(--pm-page-grad)',
    panelBorder: 'var(--pm-border)',
    iconBg: 'var(--pm-icon-bg)',
    muted: 'var(--pm-muted)',
    auspicious: 'var(--pm-good)',
    moderate: 'var(--pm-warn)',
    inauspicious: 'var(--pm-bad)',
    shadow: 'var(--pm-shadow)',
    shadowLg: 'var(--pm-shadow-lg)'
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

            <Box sx={{ bgcolor: 'var(--pm-surface)', borderRadius: 3, p: { xs: 2, md: 3 } }}>
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
                            bgcolor: activeChip === 'all' ? 'var(--pm-accent-solid)' : 'var(--pm-surface)',
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
                                bgcolor: activeChip === cat.id ? 'var(--pm-accent-solid)' : 'var(--pm-surface)',
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
                                                bgcolor: isSelected ? 'var(--pm-royal)' : 'transparent',
                                                opacity: inMonth ? 1 : 0.35,
                                                '&:hover': { bgcolor: isSelected ? 'var(--pm-royal)' : THEME.panelBorder }
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
                                sx={{ bgcolor: 'var(--pm-surface)', border: `1px solid ${THEME.panelBorder}`, fontWeight: 600, cursor: 'pointer' }}
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
                                                bgcolor: isOpen ? 'color-mix(in srgb, var(--pm-icon-bg) 45%, transparent)' : 'transparent',
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
                                                    '&:hover': { bgcolor: 'color-mix(in srgb, var(--pm-icon-bg) 70%, transparent)' },
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
                                                            boxShadow: '0 2px 10px rgba(23, 59, 103, 0.06)',
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
                                                bgcolor: 'var(--pm-solid-navy)',
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
                        background: `linear-gradient(120deg, #173B67 0%, #0F2A4D 100%)`,
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
                                bgcolor: 'var(--pm-accent-solid)',
                                color: '#fff',
                                fontWeight: 700,
                                textTransform: 'none',
                                px: 2.5,
                                py: 1,
                                borderRadius: 2,
                                whiteSpace: 'nowrap',
                                '&:hover': { bgcolor: 'var(--pm-accent-hover)' }
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
                                    bgcolor: monthlyResult?.category === cat.id ? 'var(--pm-accent-solid)' : 'var(--pm-surface)',
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
                    <Button onClick={() => setMonthlyOpen(false)} variant="contained" sx={{ textTransform: 'none', bgcolor: 'var(--pm-solid-navy)' }}>
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
                            <Button onClick={() => setDetailsRow(null)} variant="contained" sx={{ textTransform: 'none', bgcolor: 'var(--pm-solid-navy)' }}>
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