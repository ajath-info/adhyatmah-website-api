'use client';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';

// mui
import {
    Box,
    Card,
    Stack,
    Chip,
    Button,
    ButtonGroup,
    MenuItem,
    Select,
    Skeleton,
    Typography,
    Tabs,
    Tab,
    IconButton
} from '@mui/material';

// icons
import { HiOutlineLocationMarker } from 'react-icons/hi';
import {
    TbChevronLeft,
    TbChevronRight,
    TbCalendar,
    TbCalendarEvent,
    TbClockExclamation,
    TbCompass,
    TbMoonStars,
    TbSparkles,
    TbFlag,
    TbFlower,
    TbCircleDot,
    TbCircleHalf2,
    TbClockHour4,
    TbLayoutGrid
} from 'react-icons/tb';
import { WiSunrise, WiSunset, WiMoonrise, WiMoonset } from 'react-icons/wi';

// services
import { getPanchang, getPanchangCities, getPanchangMonth } from '@/services/panchang-service';
import { getFestivals } from '@/services/festival-service';
import { resolveFestivalImageSrc } from '@/utils/festival-image';

// ----------------------------------------------------------------------
// Theme tokens — same navy/accent family as the Panchang page so the two
// pages feel like one product, with a warm saffron accent for the
// "selected day" / festival highlights (matches the reference design).
// ----------------------------------------------------------------------
// Colours are CSS variables from src/theme/panchang-vars.js (light + dark).
const THEME = {
    navy: 'var(--pm-navy)',
    navySoft: 'var(--pm-navy-soft)',
    accent: 'var(--pm-accent)',
    saffron: 'var(--pm-saffron)', // text / border
    saffronSolid: '#F28C28', // used as a background under white text
    muted: 'var(--pm-muted)',
    border: 'var(--pm-border)',
    panelBg: 'var(--pm-surface)',
    pageBg: 'var(--pm-page-bg)',
    auspicious: 'var(--pm-good)',
    moderate: 'var(--pm-warn)',
    inauspicious: 'var(--pm-bad)',
    shadow: 'var(--pm-shadow)'
};

// Hero banner — plain full-width image, text is already baked into it.
const HERO_BANNER_SRC = '/images/calendar-hero-banner.png';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TONE_COLOR = { auspicious: THEME.auspicious, moderate: THEME.moderate, inauspicious: THEME.inauspicious };

function toDateInputValue(d = new Date()) {
    return d.toLocaleDateString('en-CA');
}

function formatTime(isoString) {
    if (!isoString) return '--';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// Builds a 6x7 grid of dates covering the given month, including the
// trailing/leading days from adjacent months (like most calendar UIs).
function buildMonthGrid(year, monthIdx) {
    const firstOfMonth = new Date(year, monthIdx, 1);
    const startOffset = firstOfMonth.getDay(); // 0 = Sunday
    const gridStart = new Date(year, monthIdx, 1 - startOffset);

    const cells = [];
    for (let i = 0; i < 42; i++) {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + i);
        cells.push(date);
    }
    return cells;
}

const LEGEND_TONES = [
    { label: 'Auspicious', hint: 'Good for new beginnings', color: THEME.auspicious },
    { label: 'Moderate', hint: 'Proceed with care', color: THEME.moderate },
    { label: 'Not Auspicious', hint: 'Better to avoid', color: THEME.inauspicious }
];
const LEGEND_MARKS = [
    { label: 'Festival', icon: TbFlag },
    { label: 'Ekadashi', icon: TbFlower },
    { label: 'Amavasya', icon: TbCircleDot },
    { label: 'Purnima', icon: TbCircleHalf2 },
    { label: 'Special Muhurat', icon: TbClockHour4 }
];

const LEFT_NAV_ITEMS = [
    { label: 'Monthly Calendar', icon: TbCalendar, active: true },
    { label: 'Daily Panchang', icon: TbSparkles, href: '/panchang-muhurat' },
    { label: 'Festival List', icon: TbCalendarEvent, href: '/festivals' },
    { label: 'Muhurat Finder', icon: TbClockExclamation, href: '/muhurat' },
    { label: 'Vrat & Upvas', icon: TbMoonStars, href: '/vrat-upvas' },
    { label: 'Planetary Transit', icon: TbCompass, href: '/planetary-transit' }
];

// ---------------------------------------------------------------------
// Festival helpers — the Festivals tab now reads the same admin-managed
// Festival collection as the /festivals page (in addition to whatever the
// Panchang API returns for the day), and shows each one as an image card.
// Image order: admin-uploaded image -> photo in public/images/festivals
// (matched by name) -> category emoji tile. Nothing breaks if none exist.
// ---------------------------------------------------------------------
const FEST_CATEGORY_ART = {
    Festival: { emoji: '🎉', bg: 'linear-gradient(135deg, #F9C27A, #F28C28)' },
    Ekadashi: { emoji: '🪷', bg: 'linear-gradient(135deg, #8FB1E0, #173B67)' },
    'Pradosh Vrat': { emoji: '🔱', bg: 'linear-gradient(135deg, #B5C3F0, #4F5FA8)' },
    Vrat: { emoji: '📿', bg: 'linear-gradient(135deg, #B5C3F0, #4F5FA8)' },
    Purnima: { emoji: '🌕', bg: 'linear-gradient(135deg, #F0D9A0, #D6A84F)' },
    Amavasya: { emoji: '🌑', bg: 'linear-gradient(135deg, #9AA9C2, #2B4568)' },
    'Shubh Din': { emoji: '✨', bg: 'linear-gradient(135deg, #E2E8F5, #93A6C9)' },
    Other: { emoji: '✨', bg: 'linear-gradient(135deg, #B5C3F0, #4F5FA8)' }
};

const FEST_CATEGORY_CHIP = {
    Festival: { bg: 'var(--pm-warm-bg-2)', color: 'var(--pm-accent)' },
    Ekadashi: { bg: 'var(--pm-aus-bg)', color: 'var(--pm-aus)' },
    'Pradosh Vrat': { bg: 'var(--pm-lav-bg)', color: 'var(--pm-lav)' },
    Vrat: { bg: 'var(--pm-lav-bg)', color: 'var(--pm-lav)' },
    Purnima: { bg: 'var(--pm-gold-bg)', color: 'var(--pm-gold-text)' },
    Amavasya: { bg: 'var(--pm-inaus-bg)', color: 'var(--pm-inaus)' },
    'Shubh Din': { bg: 'var(--pm-neutral-bg)', color: 'var(--pm-neutral)' },
    Other: { bg: 'var(--pm-lav-bg)', color: 'var(--pm-lav)' }
};

const normFestName = (v) => String(v || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const isSameFestival = (a, b) => {
    const x = normFestName(a);
    const y = normFestName(b);
    return Boolean(x) && Boolean(y) && (x === y || x.includes(y) || y.includes(x));
};

function FestivalCard({ festival, availableImages }) {
    const art = FEST_CATEGORY_ART[festival.category] || FEST_CATEGORY_ART.Other;
    const chip = FEST_CATEGORY_CHIP[festival.category] || FEST_CATEGORY_CHIP.Other;
    const localSrc = useMemo(() => resolveFestivalImageSrc(festival.name, availableImages), [festival.name, availableImages]);
    const src = festival?.image?.url || localSrc;
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setFailed(false);
    }, [src]);

    return (
        <Box
            sx={{
                borderRadius: 2.5,
                overflow: 'hidden',
                border: '1px solid var(--pm-warm-border)',
                bgcolor: 'var(--pm-surface)',
                boxShadow: 'var(--pm-shadow)'
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    height: 132,
                    background: art.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 46,
                    overflow: 'hidden'
                }}
            >
                {src && !failed ? (
                    <Box
                        component="img"
                        src={src}
                        alt={festival?.image?.altText || festival.name}
                        loading="lazy"
                        onError={() => setFailed(true)}
                        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
                    />
                ) : (
                    art.emoji
                )}
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 42, 77, 0.55) 0%, rgba(15, 42, 77, 0) 55%)', pointerEvents: 'none' }} />
                <Chip
                    size="small"
                    label={festival.category}
                    sx={{ position: 'absolute', left: 10, bottom: 10, bgcolor: chip.bg, color: chip.color, fontWeight: 700, fontSize: 10.5, height: 22, backdropFilter: 'blur(4px)' }}
                />
            </Box>
            <Box sx={{ p: 1.5 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 800, color: THEME.navy, overflowWrap: 'anywhere' }}>{festival.name}</Typography>
                {festival.blurb ? (
                    <Typography
                        sx={{
                            mt: 0.5,
                            fontSize: 12,
                            lineHeight: 1.5,
                            color: THEME.muted,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {festival.blurb}
                    </Typography>
                ) : null}
            </Box>
        </Box>
    );
}

// ---------------------------------------------------------------------
// Interactive sidebar card — shows upcoming Festivals / Ekadashi /
// Purnima / Amavasya of the month being viewed. Tapping a row jumps the
// calendar to that date. Uses the month data already loaded by the page,
// so it makes no extra API calls.
// ---------------------------------------------------------------------
const COSMIC_FILTERS = [
    { key: 'ekadashi', label: 'Ekadashi' },
    { key: 'purnima', label: 'Purnima' },
    { key: 'amavasya', label: 'Amavasya' }
];

function CosmicTimingCard({ monthDataByDate, selectedDate, todayStr, loading, onPick }) {
    const [filter, setFilter] = useState('ekadashi');
    const [showAll, setShowAll] = useState(false);

    const items = useMemo(() => {
        const rows = [];
        Object.keys(monthDataByDate || {})
            .sort()
            .forEach((dateStr) => {
                const d = monthDataByDate[dateStr];
                if (!d) return;
                if (filter === 'festival') {
                    (d.festivals || []).forEach((f) => rows.push({ dateStr, label: f }));
                } else if ((d.tithi || '').toLowerCase().includes(filter)) {
                    rows.push({ dateStr, label: d.tithi });
                }
            });
        return rows;
    }, [monthDataByDate, filter]);

    // Upcoming (from today) first, past ones after — so the most useful rows lead
    const ordered = useMemo(() => {
        const upcoming = items.filter((r) => r.dateStr >= todayStr);
        const past = items.filter((r) => r.dateStr < todayStr);
        return [...upcoming, ...past];
    }, [items, todayStr]);

    const visible = showAll ? ordered : ordered.slice(0, 4);

    const dayDiff = (dateStr) => {
        const diff = Math.round((new Date(`${dateStr}T00:00:00`) - new Date(`${todayStr}T00:00:00`)) / 86400000);
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Tomorrow';
        if (diff > 1) return `In ${diff} days`;
        return `${Math.abs(diff)}d ago`;
    };

    return (
        <Card
            sx={{
                p: 2.5,
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                background: 'var(--pm-warm-grad)',
                border: `1px solid var(--pm-warm-border)`,
                boxShadow: THEME.shadow,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 140
            }}
        >
            <Box sx={{ position: 'absolute', top: -18, right: -18, width: 72, height: 72, borderRadius: '50%', bgcolor: 'rgba(242, 140, 40, 0.10)' }} />
            <Box sx={{ position: 'absolute', bottom: -22, left: -14, width: 56, height: 56, borderRadius: '50%', bgcolor: 'rgba(242, 140, 40, 0.07)' }} />

            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ position: 'relative', mb: 0.75 }}>
                <Stack
                    alignItems="center"
                    justifyContent="center"
                    sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: THEME.saffronSolid, boxShadow: '0 4px 10px rgba(242, 140, 40,0.28)', flexShrink: 0 }}
                >
                    <TbSparkles size={18} color="#fff" />
                </Stack>
                <Typography sx={{ fontWeight: 700, color: THEME.navy, fontSize: 14, lineHeight: 1.3 }}>
                    Live in Harmony with Cosmic Timing
                </Typography>
            </Stack>
            <Typography sx={{ color: THEME.muted, fontSize: 12, lineHeight: 1.5, position: 'relative', mb: 1.25 }}>
                Tap a chip to see what&apos;s coming this month, then tap a date to open it.
            </Typography>

            <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ position: 'relative', mb: 1.25 }}>
                {COSMIC_FILTERS.map((f) => {
                    const active = filter === f.key;
                    return (
                        <Chip
                            key={f.key}
                            label={f.label}
                            size="small"
                            clickable
                            onClick={() => {
                                setFilter(f.key);
                                setShowAll(false);
                            }}
                            sx={{
                                fontWeight: 700,
                                fontSize: 11.5,
                                color: active ? '#fff' : THEME.navy,
                                bgcolor: active ? THEME.saffronSolid : 'var(--pm-glass)',
                                border: `1px solid ${active ? THEME.saffronSolid : 'var(--pm-warm-border)'}`,
                                '&:hover': { bgcolor: active ? THEME.saffronSolid : 'var(--pm-surface)' }
                            }}
                        />
                    );
                })}
            </Stack>

            <Stack spacing={0.75} sx={{ position: 'relative' }}>
                {loading ? (
                    <>
                        <Skeleton variant="rounded" height={44} />
                        <Skeleton variant="rounded" height={44} />
                    </>
                ) : visible.length ? (
                    visible.map((r) => {
                        const d = new Date(`${r.dateStr}T00:00:00`);
                        const isSel = r.dateStr === selectedDate;
                        return (
                            <Stack
                                key={`${r.dateStr}-${r.label}`}
                                direction="row"
                                alignItems="center"
                                spacing={1.25}
                                role="button"
                                tabIndex={0}
                                aria-label={`${r.label}, ${d.toDateString()}`}
                                onClick={() => onPick(r.dateStr)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onPick(r.dateStr);
                                    }
                                }}
                                sx={{
                                    p: 1,
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    outline: 'none',
                                    bgcolor: isSel ? 'var(--pm-surface)' : 'var(--pm-glass)',
                                    border: `1px solid ${isSel ? THEME.saffron : 'var(--pm-warm-border)'}`,
                                    transition: 'transform .15s ease, background-color .15s ease',
                                    '&:hover, &:focus-visible': { bgcolor: 'var(--pm-surface)', transform: 'translateX(2px)' }
                                }}
                            >
                                <Stack
                                    alignItems="center"
                                    justifyContent="center"
                                    sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'var(--pm-solid-navy)', color: '#fff', flexShrink: 0 }}
                                >
                                    <Typography sx={{ fontSize: 13, fontWeight: 800, lineHeight: 1 }}>{d.getDate()}</Typography>
                                    <Typography sx={{ fontSize: 8.5, fontWeight: 700, lineHeight: 1.2, textTransform: 'uppercase' }}>
                                        {d.toLocaleDateString('en-IN', { month: 'short' })}
                                    </Typography>
                                </Stack>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: THEME.navy, overflowWrap: 'anywhere', lineHeight: 1.3 }}>
                                        {r.label}
                                    </Typography>
                                    <Typography sx={{ fontSize: 11, color: THEME.saffron, fontWeight: 600 }}>{dayDiff(r.dateStr)}</Typography>
                                </Box>
                            </Stack>
                        );
                    })
                ) : (
                    <Typography sx={{ fontSize: 12, color: THEME.muted, py: 1 }}>Nothing found in this month.</Typography>
                )}
                {!loading && ordered.length > 4 && (
                    <Button
                        size="small"
                        onClick={() => setShowAll((v) => !v)}
                        sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, color: THEME.saffron, alignSelf: 'flex-start' }}
                    >
                        {showAll ? 'Show less' : `Show all (${ordered.length})`}
                    </Button>
                )}
            </Stack>
        </Card>
    );
}

const DAILY_THOUGHTS = [
    { tag: 'Brahma Muhurta', text: 'The hour before sunrise belongs to the divine — wake early, and the whole day bends toward grace.', sa: 'ब्राह्मे मुहूर्ते उत्तिष्ठेत् ॥' },
    { tag: 'Tithi', text: 'Time is the sacred canvas; every tithi carries a blessing for those who pause to notice.', sa: 'कालः पचति भूतानि ॥' },
    { tag: 'Deep Daan', text: 'A single diya lit with devotion dissolves a thousand shadows.', sa: 'तमसो मा ज्योतिर्गमय ॥' },
    { tag: 'Dharma', text: 'Where there is righteousness, there is victory.', sa: 'यतो धर्मस्ततो जयः ॥' },
    { tag: 'Karma', text: 'Offer your action like a flower at the feet of the divine, and release the fruit.', sa: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ॥' },
    { tag: 'Shanti', text: 'Peace begins in a quiet heart — before the bell, before the mantra, before the prayer.', sa: 'ॐ शान्तिः शान्तिः शान्तिः ॥' }
];

// 3D-style puja illustration (Kalash + Diyas + Lotus). Pure inline SVG, no
// external images. Tilts gently with the pointer for a 3D feel.
function PujaIllustration() {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    const onMove = (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        setTilt({ x: -py * 12, y: px * 16 });
    };
    const resting = tilt.x === 0 && tilt.y === 0;

    return (
        <Box
            onMouseMove={onMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            sx={{ position: 'relative', perspective: '900px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
            {/* soft warm glow behind the objects (kept outside the SVG so it has no hard edge) */}
            <Box
                sx={{
                    position: 'absolute',
                    width: { xs: 240, md: 330 },
                    height: { xs: 240, md: 330 },
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 196, 92, 0.42) 0%, rgba(255, 196, 92, 0.16) 45%, rgba(255, 196, 92, 0) 70%)',
                    pointerEvents: 'none'
                }}
            />
            <Box
                sx={{
                    position: 'relative',
                    width: { xs: 190, md: 250 },
                    transformStyle: 'preserve-3d',
                    transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                    transition: 'transform .18s ease-out',
                    animation: resting ? 'pujaFloat 5s ease-in-out infinite' : 'none',
                    '@keyframes pujaFloat': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-7px)' } }
                }}
            >
                <svg viewBox="0 0 260 270" width="100%" aria-hidden="true">
                    <defs>
                        <linearGradient id="pjBrass" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#7A3D0C" />
                            <stop offset="22%" stopColor="#E8A92E" />
                            <stop offset="42%" stopColor="#FFE9A6" />
                            <stop offset="62%" stopColor="#F0B53A" />
                            <stop offset="100%" stopColor="#6B3309" />
                        </linearGradient>
                        <linearGradient id="pjRim" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#8C4A12" />
                            <stop offset="45%" stopColor="#FFD777" />
                            <stop offset="100%" stopColor="#7A3D0C" />
                        </linearGradient>
                        <radialGradient id="pjCoco" cx="38%" cy="32%" r="75%">
                            <stop offset="0%" stopColor="#D49A5A" />
                            <stop offset="55%" stopColor="#8A5628" />
                            <stop offset="100%" stopColor="#4A2A10" />
                        </radialGradient>
                        <linearGradient id="pjLeafA" x1="0" y1="1" x2="0" y2="0">
                            <stop offset="0%" stopColor="#1E7A43" />
                            <stop offset="100%" stopColor="#58C27D" />
                        </linearGradient>
                        <linearGradient id="pjLeafB" x1="0" y1="1" x2="0" y2="0">
                            <stop offset="0%" stopColor="#14602F" />
                            <stop offset="100%" stopColor="#3EA765" />
                        </linearGradient>
                        <linearGradient id="pjPetal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FFD3E1" />
                            <stop offset="100%" stopColor="#DB4F86" />
                        </linearGradient>
                        <linearGradient id="pjPetalBack" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F7A9C4" />
                            <stop offset="100%" stopColor="#B83A70" />
                        </linearGradient>
                        <linearGradient id="pjClay" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#7A3D0C" />
                            <stop offset="50%" stopColor="#E59A3C" />
                            <stop offset="100%" stopColor="#6B3309" />
                        </linearGradient>
                        <radialGradient id="pjFlame" cx="50%" cy="75%" r="65%">
                            <stop offset="0%" stopColor="#FFFBE0" />
                            <stop offset="45%" stopColor="#FFC83D" />
                            <stop offset="100%" stopColor="#F26B0F" />
                        </radialGradient>
                        <radialGradient id="pjFlameGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#FFD36B" stopOpacity="0.75" />
                            <stop offset="100%" stopColor="#FFD36B" stopOpacity="0" />
                        </radialGradient>
                        <filter id="pjBlur" x="-20%" y="-50%" width="140%" height="200%">
                            <feGaussianBlur stdDeviation="5" />
                        </filter>
                        <filter id="pjShadow" x="-20%" y="-20%" width="140%" height="150%">
                            <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#2A1408" floodOpacity="0.45" />
                        </filter>
                    </defs>

                    {/* ground shadow + rangoli ring */}
                    <ellipse cx="130" cy="246" rx="96" ry="10" fill="#000" opacity="0.4" filter="url(#pjBlur)" />
                    <ellipse cx="130" cy="240" rx="104" ry="14" fill="none" stroke="#FFD98A" strokeWidth="1.2" strokeDasharray="2 6" strokeLinecap="round" opacity="0.65" />

                    <g filter="url(#pjShadow)">
                        {/* lotus — back petals */}
                        {[-68, -46, 46, 68].map((r, i) => (
                            <path key={`b${i}`} d="M130 238 C113 216 113 192 130 172 C147 192 147 216 130 238Z" fill="url(#pjPetalBack)" transform={`rotate(${r} 130 238)`} />
                        ))}
                        {/* lotus — front petals */}
                        {[-24, 0, 24].map((r, i) => (
                            <path key={`f${i}`} d="M130 240 C112 218 112 192 130 170 C148 192 148 218 130 240Z" fill="url(#pjPetal)" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.8" transform={`rotate(${r} 130 240)`} />
                        ))}

                        {/* mango leaf fan */}
                        {[-52, 52, -28, 28, 0].map((r, i) => (
                            <g key={`l${i}`} transform={`rotate(${r} 130 94)`}>
                                <path d="M130 94 C116 78 117 56 130 40 C143 56 144 78 130 94Z" fill={i < 2 ? 'url(#pjLeafB)' : 'url(#pjLeafA)'} />
                                <path d="M130 92 V48" stroke="#0E4A24" strokeOpacity="0.45" strokeWidth="1" />
                            </g>
                        ))}

                        {/* coconut */}
                        <ellipse cx="130" cy="76" rx="18" ry="21" fill="url(#pjCoco)" />
                        <ellipse cx="123" cy="67" rx="5" ry="8" fill="#fff" opacity="0.22" />
                        <path d="M130 56 C126 50 128 46 130 44 C132 46 134 50 130 56Z" fill="#6B4020" />

                        {/* kalash body */}
                        <path
                            d="M104 94 H156 C158 100 151 105 149 112 C149 121 184 134 184 162 C184 188 166 204 156 207 H104 C94 204 76 188 76 162 C76 134 111 121 111 112 C109 105 102 100 104 94 Z"
                            fill="url(#pjBrass)"
                        />
                        {/* soft shading curves */}
                        <path d="M92 150 C94 176 104 194 116 202" stroke="#fff" strokeOpacity="0.4" strokeWidth="5" strokeLinecap="round" fill="none" />
                        <path d="M82 148 C108 160 152 160 178 148" stroke="#7A3D0C" strokeOpacity="0.4" strokeWidth="1.4" fill="none" />
                        <path d="M84 178 C108 190 152 190 176 178" stroke="#7A3D0C" strokeOpacity="0.4" strokeWidth="1.4" fill="none" />
                        {/* sacred red thread (kalava) on the neck */}
                        <path d="M111 108 C122 115 138 115 149 108" stroke="#C0261B" strokeWidth="3.2" fill="none" strokeLinecap="round" />
                        <path d="M111 113 C122 120 138 120 149 113" stroke="#E0463A" strokeWidth="2" fill="none" strokeLinecap="round" />
                        {/* swastik emblem */}
                        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M130 147 V175 M116 161 H144 M130 147 H138 M144 161 V169 M130 175 H122 M116 161 V153" stroke="#FFF1B8" strokeWidth="6.5" />
                            <path d="M130 147 V175 M116 161 H144 M130 147 H138 M144 161 V169 M130 175 H122 M116 161 V153" stroke="#C0261B" strokeWidth="3.4" />
                        </g>
                        {/* rim + base */}
                        <rect x="99" y="87" width="62" height="10" rx="5" fill="url(#pjRim)" />
                        <rect x="102" y="204" width="56" height="9" rx="4" fill="url(#pjRim)" />

                        {/* diya — left */}
                        <g transform="translate(22 204)">
                            <ellipse cx="26" cy="-6" rx="22" ry="22" fill="url(#pjFlameGlow)" />
                            <path d="M0 18 C2 38 50 38 52 18 Z" fill="url(#pjClay)" />
                            <ellipse cx="26" cy="18" rx="26" ry="6.5" fill="#F7C25B" />
                            <ellipse cx="26" cy="18" rx="20" ry="4" fill="#C9822A" />
                            <path d="M26 17 C15 4 24 -3 26 -14 C32 -3 38 4 26 17Z" fill="url(#pjFlame)" style={{ transformOrigin: '26px 17px', animation: 'pjFlicker 1.6s ease-in-out infinite' }} />
                        </g>
                        {/* diya — right */}
                        <g transform="translate(186 210) scale(0.85)">
                            <ellipse cx="26" cy="-6" rx="22" ry="22" fill="url(#pjFlameGlow)" />
                            <path d="M0 18 C2 38 50 38 52 18 Z" fill="url(#pjClay)" />
                            <ellipse cx="26" cy="18" rx="26" ry="6.5" fill="#F7C25B" />
                            <ellipse cx="26" cy="18" rx="20" ry="4" fill="#C9822A" />
                            <path d="M26 17 C15 4 24 -3 26 -14 C32 -3 38 4 26 17Z" fill="url(#pjFlame)" style={{ transformOrigin: '26px 17px', animation: 'pjFlicker 1.9s ease-in-out infinite' }} />
                        </g>
                    </g>

                    {/* sparkles */}
                    {[[48, 70, 0], [216, 96, 0.8], [200, 40, 1.5]].map(([x, y, d], i) => (
                        <path key={`s${i}`} d={`M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z`} fill="#FFE9A6" style={{ transformOrigin: `${x}px ${y}px`, animation: `pjTwinkle 2.8s ease-in-out ${d}s infinite` }} />
                    ))}
                    <style>{`@keyframes pjFlicker{0%,100%{transform:scale(1) rotate(-2deg)}50%{transform:scale(1.1,1.2) rotate(2deg)}}@keyframes pjTwinkle{0%,100%{opacity:.15;transform:scale(.6)}50%{opacity:1;transform:scale(1)}}`}</style>
                </svg>
            </Box>
        </Box>
    );
}

// Daily Thought — premium rotating shloka card with a 3D puja illustration.
// Starts on a thought that changes each day; arrows / dots flip through the rest.
function DailyThoughtCard() {
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        const t = new Date();
        const dayOfYear = Math.floor((t - new Date(t.getFullYear(), 0, 0)) / 86400000);
        setIdx(dayOfYear % DAILY_THOUGHTS.length);
    }, []);

    const go = (delta) => setIdx((i) => (i + delta + DAILY_THOUGHTS.length) % DAILY_THOUGHTS.length);
    const thought = DAILY_THOUGHTS[idx];

    return (
        <Card
            sx={{
                p: { xs: 2.5, md: 3.5 },
                borderRadius: 3.5,
                height: '100%',
                minHeight: 300,
                position: 'relative',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' },
                alignItems: 'center',
                gap: 2,
                background: 'linear-gradient(135deg, #0F2A4D 0%, #173B67 50%, #245A94 100%)',
                border: '1px solid #D6A84F',
                boxShadow: '0 18px 44px rgba(15, 42, 77, 0.35), inset 0 1px 0 rgba(214, 168, 79, 0.40)'
            }}
        >
            {/* decorative glow + big Om */}
            <Box sx={{ position: 'absolute', right: -60, top: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(214,168,79,0.30) 0%, rgba(214,168,79,0) 70%)' }} />
            <Typography sx={{ position: 'absolute', right: 8, top: -30, fontSize: 210, lineHeight: 1, color: 'rgba(255, 224, 138, 0.05)', fontFamily: 'serif', userSelect: 'none', pointerEvents: 'none' }}>ॐ</Typography>

            {/* text side */}
            <Stack sx={{ position: 'relative', zIndex: 1, height: '100%', justifyContent: 'space-between' }} spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1.2}>
                    <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.6, textTransform: 'uppercase', color: '#FFD98A' }}>
                        Thought of the Day
                    </Typography>
                    <Box sx={{ px: 1.1, py: 0.25, borderRadius: 5, border: '1px solid rgba(255, 217, 138, 0.5)', fontSize: 10.5, fontWeight: 700, color: '#FFE9B8' }}>
                        {thought.tag}
                    </Box>
                </Stack>

                <Stack
                    key={idx}
                    spacing={1.4}
                    sx={{
                        animation: 'thoughtFade .4s ease',
                        '@keyframes thoughtFade': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } }
                    }}
                >
                    <Typography sx={{ color: '#FFD98A', fontSize: 34, lineHeight: 0.6, fontFamily: 'Georgia, serif' }}>&ldquo;</Typography>
                    <Typography sx={{ color: '#FFF6E3', fontWeight: 500, fontStyle: 'normal', fontSize: { xs: 17, md: 20 }, lineHeight: 1.55, letterSpacing: 0.2, fontFamily: '"Playfair Display", Georgia, "Times New Roman", serif' }}>
                        {thought.text}
                    </Typography>
                    <Box sx={{ width: 46, height: 2, borderRadius: 1, background: 'linear-gradient(90deg, #FFD98A, transparent)' }} />
                    <Typography sx={{ color: '#F3C871', fontSize: 15, fontWeight: 500, letterSpacing: 0.3 }}>{thought.sa}</Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={2.5}>
                    <Stack direction="row" spacing={0.6} alignItems="center">
                        {DAILY_THOUGHTS.map((_, i) => (
                            <Box
                                key={i}
                                role="button"
                                tabIndex={0}
                                aria-label={`Thought ${i + 1}`}
                                onClick={() => setIdx(i)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setIdx(i);
                                    }
                                }}
                                sx={{
                                    width: i === idx ? 18 : 6,
                                    height: 6,
                                    borderRadius: 3,
                                    cursor: 'pointer',
                                    outline: 'none',
                                    bgcolor: i === idx ? '#FFD98A' : 'rgba(255, 217, 138, 0.3)',
                                    transition: 'width .2s ease, background-color .2s ease'
                                }}
                            />
                        ))}
                    </Stack>
                    <Stack direction="row" spacing={0.6}>
                        <IconButton aria-label="Previous thought" size="small" onClick={() => go(-1)} sx={{ color: '#FFE9B8', bgcolor: 'rgba(255,255,255,0.12)', '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' } }}>
                            <TbChevronLeft size={16} />
                        </IconButton>
                        <IconButton aria-label="Next thought" size="small" onClick={() => go(1)} sx={{ color: '#FFE9B8', bgcolor: 'rgba(255,255,255,0.12)', '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' } }}>
                            <TbChevronRight size={16} />
                        </IconButton>
                    </Stack>
                </Stack>
            </Stack>

            {/* 3D illustration side */}
            <Box sx={{ position: 'relative', zIndex: 1, display: { xs: 'none', sm: 'block' } }}>
                <PujaIllustration />
            </Box>
        </Card>
    );
}

export default function HinduCalendar({ availableImages = [] }) {
    const today = useMemo(() => new Date(), []);
    const [viewMonth, setViewMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
    const [selectedDate, setSelectedDate] = useState(toDateInputValue(today));
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('New Delhi');
    const [panchang, setPanchang] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [detailTab, setDetailTab] = useState('panchang');

    // Month grid data — { 'YYYY-MM-DD': { tithi, tone, festivals } }
    const [monthDataByDate, setMonthDataByDate] = useState({});
    const [monthLoading, setMonthLoading] = useState(true);
    const [monthError, setMonthError] = useState(null);

    useEffect(() => {
        getPanchangCities()
            .then((res) => setCities(res?.data || []))
            .catch(() => setCities([]));
    }, []);

    const fetchForDate = useCallback(
        async (dateStr, cityName) => {
            setLoading(true);
            setError(null);
            try {
                const cityMeta = cities.find((c) => c.city === cityName);
                const res = await getPanchang({
                    date: dateStr,
                    city: cityName,
                    lat: cityMeta?.lat,
                    lng: cityMeta?.lng
                });
                setPanchang(res?.data || null);
            } catch (err) {
                setError(err?.response?.data?.message || 'Panchang data is temporarily unavailable. Please try again in a moment.');
                setPanchang(null);
            } finally {
                setLoading(false);
            }
        },
        [cities]
    );

    useEffect(() => {
        fetchForDate(selectedDate, selectedCity);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate, selectedCity]);

    // Fetches the whole visible month's Tithi/festival data in ONE call
    // (backend caches per-day, so switching months back and forth doesn't
    // re-hit Prokerala after the first time).
    const fetchMonthData = useCallback(
        async (year, monthIdx, cityName) => {
            setMonthLoading(true);
            setMonthError(null);
            try {
                const cityMeta = cities.find((c) => c.city === cityName);
                const res = await getPanchangMonth({
                    year,
                    month: monthIdx + 1, // backend expects 1-12
                    city: cityName,
                    lat: cityMeta?.lat,
                    lng: cityMeta?.lng
                });
                const map = {};
                (res?.data?.days || []).forEach((d) => {
                    map[d.date] = d;
                });
                setMonthDataByDate(map);
            } catch (err) {
                setMonthError(err?.response?.data?.message || 'Calendar data is temporarily unavailable.');
                setMonthDataByDate({});
            } finally {
                setMonthLoading(false);
            }
        },
        [cities]
    );

    useEffect(() => {
        fetchMonthData(viewMonth.year, viewMonth.month, selectedCity);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewMonth, selectedCity]);

    // Festival collection (same data as the /festivals page) — loaded per
    // month and cached, for the viewed month AND the selected date's month
    // (a greyed-out day from the neighbouring month can be selected too).
    const [dbFestByMonth, setDbFestByMonth] = useState({});
    const requestedFestMonths = useRef(new Set());

    useEffect(() => {
        const wanted = new Set([`${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, '0')}`, String(selectedDate).slice(0, 7)]);
        wanted.forEach((ym) => {
            if (!/^\d{4}-\d{2}$/.test(ym) || requestedFestMonths.current.has(ym)) return;
            requestedFestMonths.current.add(ym);
            const [y, m] = ym.split('-').map(Number);
            getFestivals({ year: y, month: m, limit: 100 })
                .then((res) => {
                    const byDate = {};
                    (res?.data || []).forEach((f) => {
                        if (!byDate[f.date]) byDate[f.date] = [];
                        byDate[f.date].push(f);
                    });
                    setDbFestByMonth((prev) => ({ ...prev, [ym]: byDate }));
                })
                .catch(() => {
                    // allow a retry next time this month is needed
                    requestedFestMonths.current.delete(ym);
                });
        });
    }, [viewMonth, selectedDate]);

    const dbFestivalsByDate = useMemo(() => Object.assign({}, ...Object.values(dbFestByMonth)), [dbFestByMonth]);

    // Month grid + sidebar data with the collection's festival names merged in
    const mergedMonthData = useMemo(() => {
        const out = {};
        Object.keys(monthDataByDate).forEach((dateStr) => {
            const day = monthDataByDate[dateStr];
            const names = [...(day?.festivals || [])];
            (dbFestivalsByDate[dateStr] || []).forEach((f) => {
                if (!names.some((n) => isSameFestival(n, f.name))) names.push(f.name);
            });
            out[dateStr] = { ...day, festivals: names };
        });
        return out;
    }, [monthDataByDate, dbFestivalsByDate]);

    const selectedDbFestivals = dbFestivalsByDate[selectedDate] || [];
    const selectedExtraFestivals = (panchang?.festivals || []).filter((n) => !selectedDbFestivals.some((f) => isSameFestival(f.name, n)));

    const monthCells = useMemo(() => buildMonthGrid(viewMonth.year, viewMonth.month), [viewMonth]);

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

    const monthLabel = new Date(viewMonth.year, viewMonth.month, 1).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric'
    });

    const selectedDateObj = new Date(`${selectedDate}T00:00:00`);

    return (
        <Box sx={{ overflowX: 'hidden', maxWidth: '100%' }}>
            {/* ---------------------------------------------------------- */}
            {/* HERO BANNER — sits directly below the navbar, same gap as  */}
            {/* the Vrat & Upvas page. It used to be INSIDE the padded,    */}
            {/* rounded bgcolor panel below (p: {xs:2, md:3}), which added */}
            {/* extra top/side spacing on top of the page Container's own */}
            {/* padding — that's why this banner sat further down/inset    */}
            {/* than the Vrat & Upvas one. Moving it outside that panel,   */}
            {/* same as Vrat & Upvas does, gives it the exact same gap.    */}
            {/* ---------------------------------------------------------- */}
            <Box sx={{ position: 'relative', mb: 3 }}>
                <Box
                    component="img"
                    src={HERO_BANNER_SRC}
                    alt="Time Aligned with the Divine — Panchang Calendar"
                    sx={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        borderRadius: 4,
                        boxShadow: THEME.shadow
                    }}
                />
                {/* Visually-hidden but real heading — the banner's text is
                    baked into the image so it isn't crawlable/readable by
                    search engines or screen readers without this. Anchored
                    with an explicit top/left of 0 against the relatively-
                    positioned wrapper above, so it can never escape this
                    box and affect the page's scroll width. */}
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
                    Time Aligned with the Divine — Hindu Panchang Calendar
                </Typography>
            </Box>

            <Box sx={{ bgcolor: THEME.pageBg, borderRadius: 3, p: { xs: 2, md: 3 } }}>
                {/* ---------------------------------------------------------- */}
                {/* MAIN 3-COLUMN LAYOUT — plain CSS Grid, not MUI <Grid>.      */}
                {/* Fixed widths for the outer two columns + a flexible middle */}
                {/* column keeps this from ever mis-wrapping like before.      */}
                {/* ---------------------------------------------------------- */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '280px minmax(0, 1fr) 300px' },
                        gap: 3,
                        alignItems: 'stretch',
                        minWidth: 0
                    }}
                >
                    {/* LEFT SIDEBAR — stretched to match the tallest column; the
                    last card (Live in Harmony) grows to soak up any extra
                    space instead of leaving a blank gap below it. */}
                    <Stack spacing={2} sx={{ height: '100%' }}>
                        <Card sx={{ ...CARD_SX, p: 2, flexShrink: 0 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 13, color: THEME.navy, mb: 1 }}>
                                Select Location
                            </Typography>
                            <Select
                                fullWidth
                                size="small"
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                startAdornment={<HiOutlineLocationMarker style={{ marginRight: 6, color: THEME.accent }} />}
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
                        </Card>

                        <Card sx={{ ...CARD_SX, p: 1, flexShrink: 0 }}>
                            <Stack spacing={0.5}>
                                {LEFT_NAV_ITEMS.map((item) => (
                                    <Button
                                        key={item.label}
                                        href={item.href || undefined}
                                        disabled={!item.active && !item.href}
                                        startIcon={<item.icon size={18} />}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            px: 1.5,
                                            py: 1.1,
                                            borderRadius: 2,
                                            fontWeight: 600,
                                            fontSize: 13.5,
                                            textTransform: 'none',
                                            color: item.active ? '#fff' : THEME.navy,
                                            background: item.active ? `linear-gradient(135deg, var(--pm-solid-navy) 0%, #245A94 100%)` : 'transparent',
                                            boxShadow: item.active ? '0 6px 16px rgba(23, 59, 103, 0.25)' : 'none',
                                            transition: 'background-color .15s ease, transform .15s ease',
                                            '&:hover': {
                                                background: item.active ? undefined : 'var(--pm-soft-bg)',
                                                transform: item.active ? 'none' : 'translateX(2px)'
                                            },
                                            '&.Mui-disabled': { color: THEME.muted, opacity: 0.55 }
                                        }}
                                    >
                                        {item.label}
                                    </Button>
                                ))}
                            </Stack>
                        </Card>

                        <CosmicTimingCard
                            monthDataByDate={mergedMonthData}
                            selectedDate={selectedDate}
                            todayStr={toDateInputValue(today)}
                            loading={monthLoading}
                            onPick={setSelectedDate}
                        />
                    </Stack>

                    {/* MONTH CALENDAR GRID */}
                    <Card sx={{ ...CARD_SX, p: { xs: 1.5, md: 2.5 }, minWidth: 0, height: '100%' }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5} sx={{ mb: 2.25 }}>
                            <Stack direction="row" alignItems="center" spacing={1.25}>
                                <IconButton
                                    aria-label="Previous month"
                                    onClick={() => goToMonth(-1)}
                                    sx={{ width: 36, height: 36, border: `1px solid ${THEME.border}`, bgcolor: 'var(--pm-surface)', '&:hover': { bgcolor: 'var(--pm-soft-bg)' } }}
                                >
                                    <TbChevronLeft size={18} />
                                </IconButton>
                                <Box sx={{ minWidth: 168, textAlign: 'center' }}>
                                    <Typography sx={{ fontWeight: 800, color: THEME.navy, fontSize: 20, lineHeight: 1.2 }}>{monthLabel}</Typography>
                                    <Typography sx={{ fontSize: 11.5, color: THEME.muted, mt: 0.25 }}>Tap any date to see its Panchang</Typography>
                                </Box>
                                <IconButton
                                    aria-label="Next month"
                                    onClick={() => goToMonth(1)}
                                    sx={{ width: 36, height: 36, border: `1px solid ${THEME.border}`, bgcolor: 'var(--pm-surface)', '&:hover': { bgcolor: 'var(--pm-soft-bg)' } }}
                                >
                                    <TbChevronRight size={18} />
                                </IconButton>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <ButtonGroup size="small" sx={{ '& .MuiButton-root': { textTransform: 'none', fontWeight: 700, borderColor: THEME.border } }}>
                                    <Button variant="contained" disableElevation sx={{ bgcolor: 'var(--pm-solid-navy)', '&:hover': { bgcolor: 'var(--pm-solid-hover)' } }}>
                                        Month
                                    </Button>
                                    <Button disabled>Week</Button>
                                    <Button disabled>List</Button>
                                </ButtonGroup>
                                <Button
                                    size="small"
                                    onClick={goToToday}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        borderRadius: 2,
                                        px: 2,
                                        color: THEME.saffron,
                                        bgcolor: 'var(--pm-warm-bg-2)',
                                        '&:hover': { bgcolor: 'var(--pm-warm-hover)' }
                                    }}
                                >
                                    Today
                                </Button>
                            </Stack>
                        </Stack>

                        {/* Weekday header */}
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                                gap: 1,
                                bgcolor: 'var(--pm-soft-bg)',
                                borderRadius: 2,
                                py: 1,
                                mb: 1.25
                            }}
                        >
                            {WEEKDAY_LABELS.map((d, idx) => (
                                <Typography
                                    key={d}
                                    sx={{
                                        textAlign: 'center',
                                        fontSize: 11.5,
                                        fontWeight: 800,
                                        letterSpacing: 0.6,
                                        textTransform: 'uppercase',
                                        color: idx === today.getDay() ? '#fff' : THEME.muted,
                                        bgcolor: idx === today.getDay() ? 'var(--pm-solid-navy)' : 'transparent',
                                        borderRadius: 1.5,
                                        py: 0.25,
                                        mx: 0.5,
                                        boxShadow: idx === today.getDay() ? '0 2px 8px rgba(23, 59, 103, 0.25)' : 'none'
                                    }}
                                >
                                    {d}
                                </Typography>
                            ))}
                        </Box>

                        {/* Day cells */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 1 }}>
                            {monthCells.map((date, i) => {
                                const inMonth = date.getMonth() === viewMonth.month;
                                const dateStr = toDateInputValue(date);
                                const isSelected = dateStr === selectedDate;
                                const isToday = dateStr === toDateInputValue(today);
                                const dayData = inMonth ? mergedMonthData[dateStr] : null;
                                const hasFestival = (dayData?.festivals || []).length > 0;
                                const toneColor = TONE_COLOR[dayData?.tone] || THEME.muted;

                                return (
                                    <Box
                                        key={i}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={date.toDateString()}
                                        aria-pressed={isSelected}
                                        onClick={() => setSelectedDate(dateStr)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setSelectedDate(dateStr);
                                            }
                                        }}
                                        sx={{
                                            position: 'relative',
                                            cursor: 'pointer',
                                            outline: 'none',
                                            borderRadius: 2,
                                            p: { xs: 0.75, md: 1 },
                                            minHeight: { xs: 58, md: 84 },
                                            border: isSelected
                                                ? `2px solid ${THEME.saffron}`
                                                : `1px solid ${hasFestival ? 'var(--pm-warm-border)' : THEME.border}`,
                                            bgcolor: isSelected ? 'var(--pm-sel-bg)' : isToday ? 'var(--pm-soft-bg-2)' : hasFestival ? 'var(--pm-fest-bg)' : 'var(--pm-surface)',
                                            opacity: inMonth ? 1 : 0.4,
                                            boxShadow: isSelected ? '0 8px 20px rgba(242, 140, 40, 0.18)' : 'none',
                                            transition: 'transform .15s ease, box-shadow .15s ease, border-color .15s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                borderColor: THEME.saffron,
                                                boxShadow: '0 8px 18px rgba(23, 59, 103, 0.10)'
                                            },
                                            '&:focus-visible': { boxShadow: `0 0 0 3px color-mix(in srgb, ${THEME.saffron} 33%, transparent)` }
                                        }}
                                    >
                                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                                            <Box
                                                sx={{
                                                    minWidth: 26,
                                                    height: 26,
                                                    px: 0.5,
                                                    borderRadius: '13px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 800,
                                                    fontSize: 13,
                                                    color: isToday ? '#fff' : isSelected ? THEME.saffron : THEME.navy,
                                                    bgcolor: isToday ? 'var(--pm-solid-navy)' : 'transparent'
                                                }}
                                            >
                                                {date.getDate()}
                                            </Box>
                                            {hasFestival && <TbFlag size={14} color={THEME.saffron} />}
                                        </Stack>

                                        {inMonth && monthLoading && !dayData ? (
                                            <Skeleton width="70%" height={12} sx={{ mt: 0.75 }} />
                                        ) : (
                                            dayData?.tithi && (
                                                <Stack direction="row" alignItems="flex-start" spacing={0.6} sx={{ mt: 0.6 }}>
                                                    <Box sx={{ width: 7, height: 7, mt: '3px', borderRadius: '50%', bgcolor: toneColor, flexShrink: 0 }} />
                                                    <Typography
                                                        sx={{
                                                            display: { xs: 'none', sm: '-webkit-box' },
                                                            fontSize: 10.5,
                                                            fontWeight: 600,
                                                            letterSpacing: 0,
                                                            color: THEME.navySoft,
                                                            lineHeight: 1.25,
                                                            minWidth: 0,
                                                            overflowWrap: 'anywhere',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        {dayData.tithi}
                                                    </Typography>
                                                </Stack>
                                            )
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                        {monthError && <Typography sx={{ fontSize: 12, color: THEME.inauspicious, mt: 1.5 }}>{monthError}</Typography>}
                    </Card>

                    {/* RIGHT DETAIL PANEL: wired to the real single-day Panchang API */}
                    <Card
                        sx={{
                            ...CARD_SX,
                            overflow: 'hidden',
                            minWidth: 0,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Box
                            sx={{
                                background: `linear-gradient(135deg, var(--pm-solid-navy) 0%, #245A94 100%)`,
                                p: 2.25,
                                color: '#fff',
                                flexShrink: 0
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                <Box
                                    sx={{
                                        background: `linear-gradient(135deg, ${THEME.saffronSolid} 0%, #F9B04D 100%)`,
                                        color: '#fff',
                                        borderRadius: 2.5,
                                        width: 54,
                                        height: 54,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        boxShadow: '0 6px 16px rgba(242, 140, 40, 0.4)'
                                    }}
                                >
                                    <Typography sx={{ fontWeight: 800, fontSize: 24, lineHeight: 1 }}>{selectedDateObj.getDate()}</Typography>
                                </Box>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: 15 }}>
                                        {selectedDateObj.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                    </Typography>
                                    <Typography sx={{ fontSize: 12.5, opacity: 0.8 }}>
                                        {selectedDateObj.toLocaleDateString('en-IN', { weekday: 'long' })}
                                        {selectedDate === toDateInputValue(today) ? ' · Today' : ''}
                                    </Typography>
                                </Box>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 1.5, opacity: 0.85 }}>
                                <HiOutlineLocationMarker size={14} />
                                <Typography sx={{ fontSize: 12 }}>{selectedCity}</Typography>
                                {!loading && panchang?.tithi?.name && (
                                    <Chip
                                        label={panchang.tithi.name}
                                        size="small"
                                        sx={{ ml: 'auto !important', height: 22, fontWeight: 700, fontSize: 11, bgcolor: 'rgba(255,255,255,0.16)', color: '#fff' }}
                                    />
                                )}
                            </Stack>
                        </Box>

                        <Tabs
                            value={detailTab}
                            onChange={(_, v) => setDetailTab(v)}
                            variant="fullWidth"
                            sx={{
                                borderBottom: `1px solid ${THEME.border}`,
                                minHeight: 44,
                                flexShrink: 0,
                                '& .MuiTabs-indicator': { bgcolor: THEME.saffron, height: 3, borderRadius: '3px 3px 0 0' },
                                '& .MuiTab-root': { fontSize: 12.5, minHeight: 44, textTransform: 'none', fontWeight: 600, color: THEME.muted },
                                '& .Mui-selected': { color: `${THEME.navy} !important`, fontWeight: 800 }
                            }}
                        >
                            <Tab value="panchang" label="Panchang" />
                            <Tab value="muhurat" label="Muhurat" />
                            <Tab value="festivals" label="Festivals" />
                        </Tabs>

                        <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                            {loading ? (
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.25 }}>
                                    {[...Array(8)].map((_, i) => (
                                        <Skeleton key={i} variant="rounded" height={74} />
                                    ))}
                                </Box>
                            ) : error && !(detailTab === 'festivals' && selectedDbFestivals.length) ? (
                                <Typography sx={{ fontSize: 12.5, color: THEME.inauspicious }}>{error}</Typography>
                            ) : detailTab === 'panchang' ? (
                                <Stack spacing={2} sx={{ flexGrow: 1 }}>
                                    <Box>
                                        <PanelLabel>Panchang Elements</PanelLabel>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.25 }}>
                                            <InfoTile label="Tithi" value={panchang?.tithi?.name} sub={panchang?.tithi?.endTime && `till ${formatTime(panchang.tithi.endTime)}`} />
                                            <InfoTile label="Nakshatra" value={panchang?.nakshatra?.name} sub={panchang?.nakshatra?.endTime && `till ${formatTime(panchang.nakshatra.endTime)}`} />
                                            <InfoTile label="Yoga" value={panchang?.yoga?.name} sub={panchang?.yoga?.endTime && `till ${formatTime(panchang.yoga.endTime)}`} />
                                            <InfoTile label="Karana" value={panchang?.karana?.name} sub={panchang?.karana?.endTime && `till ${formatTime(panchang.karana.endTime)}`} />
                                        </Box>
                                    </Box>
                                    <Box>
                                        <PanelLabel>Sun &amp; Moon</PanelLabel>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.25 }}>
                                            <InfoTile tone="sun" icon={<WiSunrise size={24} />} label="Sunrise" value={formatTime(panchang?.sunrise)} />
                                            <InfoTile tone="sun" icon={<WiSunset size={24} />} label="Sunset" value={formatTime(panchang?.sunset)} />
                                            <InfoTile tone="moon" icon={<WiMoonrise size={24} />} label="Moonrise" value={formatTime(panchang?.moonrise)} />
                                            <InfoTile tone="moon" icon={<WiMoonset size={24} />} label="Moonset" value={formatTime(panchang?.moonset)} />
                                        </Box>
                                    </Box>
                                </Stack>
                            ) : detailTab === 'muhurat' ? (
                                <Stack spacing={1.25}>
                                    <TimeRow
                                        tone="bad"
                                        label="Rahu Kaal"
                                        value={panchang?.rahuKalam ? `${formatTime(panchang.rahuKalam.start)} - ${formatTime(panchang.rahuKalam.end)}` : '--'}
                                    />
                                    <TimeRow
                                        tone="good"
                                        label="Abhijit Muhurat"
                                        value={
                                            panchang?.abhijitMuhurat
                                                ? `${formatTime(panchang.abhijitMuhurat.start)} - ${formatTime(panchang.abhijitMuhurat.end)}`
                                                : '--'
                                        }
                                    />
                                    {(panchang?.inauspiciousPeriods || []).map((p) => (
                                        <TimeRow key={p.name} tone="bad" label={p.name} value={`${formatTime(p.start)} - ${formatTime(p.end)}`} />
                                    ))}
                                </Stack>
                            ) : (
                                <Stack spacing={1.5}>
                                    {selectedDbFestivals.length || selectedExtraFestivals.length ? (
                                        <>
                                            {selectedDbFestivals.map((f) => (
                                                <FestivalCard key={f._id || f.slug || f.name} festival={f} availableImages={availableImages} />
                                            ))}
                                            {selectedExtraFestivals.map((f) => (
                                                <Stack
                                                    key={f}
                                                    direction="row"
                                                    alignItems="center"
                                                    spacing={1.25}
                                                    sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'var(--pm-warm-bg)', border: '1px solid var(--pm-warm-border)' }}
                                                >
                                                    <Stack alignItems="center" justifyContent="center" sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: 'var(--pm-surface)', flexShrink: 0 }}>
                                                        <TbFlag size={17} color={THEME.saffron} />
                                                    </Stack>
                                                    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: THEME.navy, minWidth: 0, overflowWrap: 'anywhere' }}>{f}</Typography>
                                                </Stack>
                                            ))}
                                        </>
                                    ) : (
                                        <Stack alignItems="center" spacing={1} sx={{ py: 4, color: THEME.muted }}>
                                            <TbCalendarEvent size={30} />
                                            <Typography sx={{ fontSize: 13 }}>No festivals on this date.</Typography>
                                        </Stack>
                                    )}
                                </Stack>
                            )}
                        </Box>
                    </Card>
                </Box>

                {/* ---------------------------------------------------------- */}
                {/* BOTTOM: Legend + Quick Actions + Quote — also CSS Grid now */}
                {/* ---------------------------------------------------------- */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '3fr 8fr' },
                        gap: 2,
                        mt: 3,
                        alignItems: 'stretch'
                    }}
                >
                    <Card
                        sx={{
                            p: 2.25,
                            borderRadius: 3,
                            boxShadow: THEME.shadow,
                            border: `1px solid ${THEME.border}`,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: 2,
                            transition: 'box-shadow 0.2s ease',
                            '&:hover': { boxShadow: '0 10px 30px rgba(23, 59, 103, 0.10)' }
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Stack alignItems="center" justifyContent="center" sx={{ width: 28, height: 28, borderRadius: 1.75, bgcolor: 'var(--pm-soft-bg-2)' }}>
                                <TbLayoutGrid size={15} color={THEME.accent} />
                            </Stack>
                            <Typography sx={{ fontWeight: 700, color: THEME.navy, fontSize: 14 }}>Calendar Legend</Typography>
                        </Stack>

                        {/* day quality */}
                        <Stack spacing={0.9}>
                            {LEGEND_TONES.map((t) => (
                                <Stack
                                    key={t.label}
                                    direction="row"
                                    alignItems="center"
                                    spacing={1.25}
                                    sx={{ px: 1.4, py: 1, borderRadius: 2, bgcolor: `color-mix(in srgb, ${t.color} 7%, transparent)`, borderLeft: `3px solid ${t.color}` }}
                                >
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: t.color, flexShrink: 0, boxShadow: `0 0 0 3px color-mix(in srgb, ${t.color} 16%, transparent)` }} />
                                    <Typography sx={{ fontSize: 12.5, color: THEME.navy, fontWeight: 700, lineHeight: 1.2 }}>{t.label}</Typography>
                                    <Typography sx={{ fontSize: 11, color: THEME.muted, fontWeight: 500, ml: 'auto !important', textAlign: 'right' }}>{t.hint}</Typography>
                                </Stack>
                            ))}
                        </Stack>

                        {/* special days */}
                        <Box>
                            <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: THEME.muted, mb: 1 }}>
                                Special Days
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={0.8}>
                                {LEGEND_MARKS.map((m) => (
                                    <Stack
                                        key={m.label}
                                        direction="row"
                                        alignItems="center"
                                        spacing={0.6}
                                        sx={{ px: 1, py: 0.45, borderRadius: 5, bgcolor: 'var(--pm-warm-bg-2)' }}
                                    >
                                        <m.icon size={13} color={THEME.saffron} />
                                        <Typography sx={{ fontSize: 10.5, color: THEME.navySoft, fontWeight: 600 }}>{m.label}</Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Box>
                    </Card>

                    <DailyThoughtCard />
                </Box>
            </Box>
        </Box>
    );
}

// Shared premium card look.
const CARD_SX = {
    borderRadius: 3,
    border: `1px solid ${THEME.border}`,
    boxShadow: '0 10px 30px rgba(23, 59, 103, 0.05)'
};

function PanelLabel({ children }) {
    return (
        <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: THEME.muted, mb: 1 }}>
            {children}
        </Typography>
    );
}

// Small stat tile: label on top, big value, optional "till ..." line.
function InfoTile({ icon, label, value, sub, tone }) {
    const bg = tone === 'sun' ? 'var(--pm-warm-bg)' : tone === 'moon' ? 'var(--pm-soft-bg-2)' : 'var(--pm-soft-bg)';
    const border = tone === 'sun' ? 'var(--pm-warm-border)' : THEME.border;
    const iconColor = tone === 'sun' ? THEME.saffron : THEME.accent;
    return (
        <Box sx={{ p: 1.5, minHeight: 78, borderRadius: 2.5, bgcolor: bg, border: `1px solid ${border}`, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: iconColor }}>
                {icon}
                <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: THEME.muted }}>{label}</Typography>
            </Stack>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: THEME.navy, mt: 0.5, lineHeight: 1.3, overflowWrap: 'anywhere' }}>
                {value || '--'}
            </Typography>
            {sub && <Typography sx={{ fontSize: 11, color: THEME.muted, mt: 0.25 }}>{sub}</Typography>}
        </Box>
    );
}

// Muhurat row: green for auspicious windows, red for periods to avoid.
function TimeRow({ label, value, tone }) {
    const color = tone === 'good' ? THEME.auspicious : THEME.inauspicious;
    return (
        <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1.5}
            sx={{ p: 1.5, borderRadius: 2.5, bgcolor: `color-mix(in srgb, ${color} 6%, transparent)`, borderLeft: `4px solid ${color}` }}
        >
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: THEME.navy, minWidth: 0, overflowWrap: 'anywhere' }}>{label}</Typography>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color, whiteSpace: 'nowrap' }}>{value}</Typography>
        </Stack>
    );
}