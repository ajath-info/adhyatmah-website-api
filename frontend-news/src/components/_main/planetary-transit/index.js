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
// ink / border / mutedInk follow light-dark mode (CSS variables from
// src/theme/panchang-vars.js). navy, navyDeep and gold are fixed brand
// colours used as dark backgrounds, so they stay the same in both modes.
const THEME = {
    navy: '#0B1B33',
    navyDeep: '#08142A',
    ink: 'var(--pm-navy)',
    gold: '#F28C28',
    border: 'var(--pm-border)',
    mutedInk: 'var(--pm-muted)'
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
    Sun: { abbr: 'Su', color: '#F28C28', size: 22 },
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
    { icon: TbBriefcase, label: 'Career', sub: 'Growth & Opportunities', color: '#245A94', bg: 'rgba(36, 90, 148, 0.12)' },
    { icon: TbCurrencyRupee, label: 'Finance', sub: 'Wealth & Stability', color: '#F28C28', bg: 'rgba(242, 140, 40, 0.14)' },
    { icon: TbHeart, label: 'Relationships', sub: 'Love & Harmony', color: '#D8567A', bg: 'rgba(216, 86, 122, 0.12)' },
    { icon: TbHeartbeat, label: 'Health', sub: 'Well-being & Energy', color: '#2E9E5B', bg: 'rgba(46, 158, 91, 0.12)' },
    { icon: TbSchool, label: 'Education', sub: 'Learning & Wisdom', color: '#2E7DBD', bg: 'rgba(46, 125, 189, 0.12)' },
    { icon: FaOm, label: 'Spirituality', sub: 'Inner Growth', color: '#4F5FA8', bg: 'rgba(79, 95, 168, 0.14)' }
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
    bgcolor: 'var(--pm-surface)',
    boxShadow: '0 10px 30px rgba(8, 20, 42, 0.05)'
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
                        background: 'var(--pm-warm-grad)'
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
                        '&:hover': { bgcolor: 'var(--pm-soft-bg)' }
                    },
                    '& .Mui-selected': {
                        color: 'var(--pm-navy) !important',
                        fontWeight: 800,
                        bgcolor: 'var(--pm-warm-bg-2)',
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
                    bgcolor: 'var(--pm-soft-bg)',
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
                        bgcolor: 'var(--pm-soft-bg)',
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
                                    '&:hover': { bgcolor: 'var(--pm-surface-alt)' }
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
                                            boxShadow: `0 0 0 3px color-mix(in srgb, ${meta.color} 15%, transparent)`
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
                                        color: 'var(--pm-aus)',
                                        bgcolor: 'var(--pm-aus-bg)',
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
                                background: active ? `linear-gradient(135deg, var(--pm-solid-navy) 0%, #245A94 100%)` : 'transparent',
                                color: active ? '#FFFFFF' : THEME.ink,
                                boxShadow: active ? '0 6px 16px rgba(8, 20, 42, 0.25)' : 'none',
                                transition: 'background-color .15s ease, transform .15s ease',
                                '&:hover': { bgcolor: active ? undefined : 'var(--pm-soft-bg)', transform: active ? 'none' : 'translateX(2px)' }
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
                    bgcolor: 'var(--pm-soft-bg)',
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
                        bgcolor: 'var(--pm-solid-navy) !important',
                        color: '#FFFFFF !important',
                        boxShadow: '0 4px 12px rgba(8, 20, 42, 0.25)'
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
                bgcolor: open ? 'var(--pm-surface-alt)' : 'var(--pm-surface)',
                overflow: 'hidden',
                transition: 'box-shadow .2s ease, background-color .2s ease',
                boxShadow: open ? '0 8px 22px rgba(8, 20, 42, 0.08)' : 'none'
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
                    '&:hover': { bgcolor: 'var(--pm-soft-bg)' },
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
                border: `1px solid color-mix(in srgb, ${THEME.gold} 33%, transparent)`,
                background: 'var(--pm-warm-grad)',
                boxShadow: '0 10px 30px rgba(242, 140, 40, 0.10)',
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
                        bgcolor: 'var(--pm-glass)',
                        border: `1px dashed color-mix(in srgb, ${THEME.gold} 40%, transparent)`
                    }}
                >
                    <Typography sx={{ fontStyle: 'italic', fontWeight: 700, fontSize: 14.5, color: 'var(--pm-saffron)', textAlign: 'center', lineHeight: 1.6 }}>
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
                            bgcolor: 'var(--pm-warm-bg-2)',
                            '&:hover': { bgcolor: 'var(--pm-warm-hover)' }
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
                        <TableRow sx={{ bgcolor: 'var(--pm-soft-bg)' }}>
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
                                    sx={{ '&:last-child td': { borderBottom: 0 }, '&:hover': { bgcolor: 'var(--pm-surface-alt)' } }}
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
                            bgcolor: `color-mix(in srgb, ${color} 12%, var(--pm-surface))`,
                            border: `1px solid color-mix(in srgb, ${color} 12%, transparent)`,
                            cursor: 'pointer',
                            transition: 'transform .18s ease, box-shadow .18s ease',
                            '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 10px 22px color-mix(in srgb, ${color} 15%, transparent)` }
                        }}
                    >
                        <Box
                            sx={{
                                width: 38,
                                height: 38,
                                borderRadius: '12px',
                                bgcolor: 'var(--pm-surface)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 4px 10px color-mix(in srgb, ${color} 15%, transparent)`
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
                            fill={i % 2 === 0 ? 'var(--pm-warm-bg)' : 'var(--pm-surface)'}
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
                                'linear-gradient(90deg, rgba(242, 140, 40,0) 0%, rgba(242, 140, 40,0.35) 12%, rgba(242, 140, 40,0.35) 88%, rgba(242, 140, 40,0) 100%)'
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
                                            boxShadow: `0 0 10px color-mix(in srgb, ${meta.color} 67%, transparent)`
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
                                                border: '1.5px solid #08142A',
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
        <Box sx={{ bgcolor: 'var(--pm-plain-bg)', minHeight: '100vh' }}>
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