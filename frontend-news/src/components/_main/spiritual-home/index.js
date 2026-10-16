'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// mui
import { Box, Button, Chip, Container, InputBase, Skeleton, Stack, Typography } from '@mui/material';

// icons
import { WiSunrise, WiSunset, WiMoonrise, WiMoonset } from 'react-icons/wi';
import { TbSearch, TbArrowRight } from 'react-icons/tb';

// services
import { getPanchang } from '@/services/panchang-service';

// sections
import { HOME_THEME } from './theme';
import QuickNav from './quick-nav';
import HomeWidgets from './widgets';
import HomeBanners from './banners';
import TrustStrip from './trust-strip';

const HERO_IMAGE = '/images/home-hero-banner.jpg';
const DEFAULT_CITY = 'New Delhi';

// Popular searches -> the page that actually answers them.
const POPULAR_SEARCHES = [
    { label: 'Akshaya Tritiya', href: '/festivals' },
    { label: 'Ekadashi', href: '/vrat-upvas' },
    { label: 'Pradosh Vrat', href: '/vrat-upvas' },
    { label: 'Marriage Muhurat', href: '/muhurat' },
    { label: 'Griha Pravesh', href: '/muhurat' }
];

// Free-text search has no dedicated endpoint, so route by keyword to the
// page that covers it. Anything unmatched lands on Festivals (widest list).
const SEARCH_ROUTES = [
    { keys: ['vrat', 'upvas', 'ekadashi', 'pradosh', 'chaturthi', 'purnima', 'amavasya'], href: '/vrat-upvas' },
    { keys: ['muhurat', 'muhurta', 'vivah', 'marriage', 'griha', 'pravesh', 'vehicle', 'business', 'namkaran'], href: '/muhurat' },
    { keys: ['tithi', 'nakshatra', 'yoga', 'karana', 'panchang', 'rahu', 'choghadiya'], href: '/panchang-muhurat' },
    { keys: ['calendar'], href: '/calendar' },
    { keys: ['transit', 'gochar', 'planet', 'rashi'], href: '/planetary-transit' }
];

function resolveSearch(query) {
    const q = query.trim().toLowerCase();
    if (!q) return '/panchang-muhurat';
    const hit = SEARCH_ROUTES.find((r) => r.keys.some((k) => q.includes(k)));
    return hit ? hit.href : '/festivals';
}

// API returns full ISO datetimes — show only the local time.
function formatTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatTill(iso) {
    const t = formatTime(iso);
    return t === '—' ? '' : `till ${t}`;
}

function PanchangRow({ label, value, till }) {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '78px 1fr', sm: '88px 1fr auto' },
                columnGap: 1,
                alignItems: 'baseline',
                py: 0.45
            }}
        >
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: HOME_THEME.accent }}>{label}</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: HOME_THEME.navy, minWidth: 0 }}>{value || '—'}</Typography>
            <Typography sx={{ fontSize: 12, color: HOME_THEME.muted, gridColumn: { xs: '2', sm: 'auto' }, whiteSpace: 'nowrap' }}>{till}</Typography>
        </Box>
    );
}

function SkyTime({ icon: Icon, label, value }) {
    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            sx={{
                flex: '1 1 0',
                minWidth: 0,
                px: 1,
                py: 0.75,
                borderRadius: '12px',
                bgcolor: '#F0F3FB',
                border: `1px solid ${HOME_THEME.panelBorder}`
            }}
        >
            <Icon size={30} color={HOME_THEME.accent} style={{ flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 11, color: HOME_THEME.muted, lineHeight: 1.2 }}>{label}</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: HOME_THEME.navy, lineHeight: 1.3 }}>{value}</Typography>
            </Box>
        </Stack>
    );
}

function TodayPanchangCard() {
    const [panchang, setPanchang] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Local calendar date, so the card never shows a different day than the user's.
    const today = new Date();
    const dateParam = today.toLocaleDateString('en-CA');
    const dayNumber = today.getDate();
    const monthShort = today.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase();
    const year = today.getFullYear();
    const longLabel = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'long' });

    useEffect(() => {
        let cancelled = false;
        getPanchang({ city: DEFAULT_CITY, date: dateParam })
            .then((res) => {
                if (!cancelled) setPanchang(res?.data || null);
            })
            .catch(() => {
                if (!cancelled) setError(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Box
            sx={{
                bgcolor: '#FFFFFF',
                border: `1px solid ${HOME_THEME.panelBorder}`,
                borderRadius: '20px',
                boxShadow: HOME_THEME.shadowLg,
                p: { xs: 2, sm: 2.5 }
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1.5 }}>
                <Typography component="h2" sx={{ fontSize: 18, fontWeight: 800, color: HOME_THEME.navy }}>
                    Today&apos;s Panchang
                </Typography>
                <Typography sx={{ fontSize: 12, color: HOME_THEME.muted }}>{longLabel}</Typography>
            </Stack>

            <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="stretch">
                <Box
                    sx={{
                        width: { xs: 72, sm: 92 },
                        flexShrink: 0,
                        borderRadius: '14px',
                        bgcolor: HOME_THEME.silver,
                        border: `1px solid ${HOME_THEME.panelBorder}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 1.5
                    }}
                >
                    <Typography sx={{ fontSize: { xs: 30, sm: 38 }, fontWeight: 800, lineHeight: 1, color: HOME_THEME.accent }}>
                        {String(dayNumber).padStart(2, '0')}
                    </Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: HOME_THEME.navy, mt: 0.5 }}>{monthShort}</Typography>
                    <Typography sx={{ fontSize: 13, color: HOME_THEME.muted }}>{year}</Typography>
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    {loading && (
                        <Stack spacing={1}>
                            {[0, 1, 2, 3].map((i) => (
                                <Skeleton key={i} variant="rounded" height={22} />
                            ))}
                        </Stack>
                    )}

                    {!loading && error && (
                        <Typography sx={{ fontSize: 13.5, color: HOME_THEME.muted, py: 1 }}>
                            Panchang is temporarily unavailable. Open the full Panchang to try again.
                        </Typography>
                    )}

                    {!loading && !error && panchang && (
                        <>
                            <PanchangRow
                                label="Tithi"
                                value={[panchang.tithi?.paksha, panchang.tithi?.name].filter(Boolean).join(' ')}
                                till={formatTill(panchang.tithi?.endTime)}
                            />
                            <PanchangRow label="Nakshatra" value={panchang.nakshatra?.name} till={formatTill(panchang.nakshatra?.endTime)} />
                            <PanchangRow label="Yoga" value={panchang.yoga?.name} till={formatTill(panchang.yoga?.endTime)} />
                            <PanchangRow label="Karana" value={panchang.karana?.name} till={formatTill(panchang.karana?.endTime)} />
                        </>
                    )}
                </Box>
            </Stack>

            {!loading && !error && panchang && (
                <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' }, rowGap: 1 }}>
                    <SkyTime icon={WiSunrise} label="Sunrise" value={formatTime(panchang.sunrise)} />
                    <SkyTime icon={WiSunset} label="Sunset" value={formatTime(panchang.sunset)} />
                    {panchang.moonrise && <SkyTime icon={WiMoonrise} label="Moonrise" value={formatTime(panchang.moonrise)} />}
                    {panchang.moonset && <SkyTime icon={WiMoonset} label="Moonset" value={formatTime(panchang.moonset)} />}
                </Stack>
            )}

            <Button
                component={Link}
                href="/panchang-muhurat"
                fullWidth
                endIcon={<TbArrowRight size={18} />}
                sx={{
                    mt: 2,
                    py: 1,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 700,
                    color: HOME_THEME.accent,
                    border: `1px solid ${HOME_THEME.panelBorder}`,
                    '&:hover': { bgcolor: HOME_THEME.silver, borderColor: HOME_THEME.accent }
                }}
            >
                View Full Panchang
            </Button>
        </Box>
    );
}

function HomeHero() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const submitSearch = (e) => {
        e.preventDefault();
        router.push(resolveSearch(query));
    };

    return (
        <Box sx={{ position: 'relative', overflow: 'hidden', bgcolor: HOME_THEME.silver }}>
            {/* Banner photo + a silver-white wash on the left so the navy headline stays readable */}
            <Image src={HERO_IMAGE} alt="" fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center' }} />
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background: {
                        xs: 'linear-gradient(180deg, rgba(221,230,245,0.93) 0%, rgba(221,230,245,0.78) 55%, rgba(221,230,245,0.55) 100%)',
                        md: 'linear-gradient(90deg, rgba(221,230,245,0.96) 0%, rgba(221,230,245,0.84) 38%, rgba(221,230,245,0.18) 70%, rgba(221,230,245,0) 100%)'
                    }
                }}
            />

            <Container maxWidth="xl" sx={{ position: 'relative' }}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.25fr) minmax(0, 0.85fr)' },
                        gap: { xs: 3, md: 5 },
                        alignItems: 'center',
                        py: { xs: 4, md: 7 }
                    }}
                >
                    <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, color: HOME_THEME.navySoft, mb: 1.5 }}>
                            PANCHANG
                        </Typography>
                        <Typography
                            component="h1"
                            sx={{
                                fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.4rem' },
                                fontWeight: 800,
                                lineHeight: 1.1,
                                color: HOME_THEME.navy
                            }}
                        >
                            Timeless Wisdom
                            <br />
                            for a{' '}
                            <Box component="span" sx={{ color: HOME_THEME.accent }}>
                                Better Tomorrow
                            </Box>
                        </Typography>
                        <Typography sx={{ mt: 2, fontSize: { xs: 15, md: 17 }, color: HOME_THEME.navySoft, maxWidth: 520 }}>
                            Explore accurate Panchang, festivals, Vrat, Muhurat and more. Stay connected to your roots, every day.
                        </Typography>

                        <Box
                            component="form"
                            onSubmit={submitSearch}
                            role="search"
                            sx={{
                                mt: 3,
                                display: 'flex',
                                alignItems: 'center',
                                maxWidth: 600,
                                bgcolor: '#FFFFFF',
                                borderRadius: '16px',
                                border: `1px solid ${HOME_THEME.panelBorder}`,
                                boxShadow: HOME_THEME.shadowLg,
                                pl: 2,
                                pr: 0.75,
                                py: 0.75
                            }}
                        >
                            <TbSearch size={22} color={HOME_THEME.navy} style={{ flexShrink: 0 }} />
                            <InputBase
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search festivals, vrat, muhurat, tithi, nakshatra..."
                                inputProps={{ 'aria-label': 'Search festivals, vrat, muhurat, tithi, nakshatra' }}
                                sx={{ flex: 1, ml: 1.5, fontSize: 15, color: HOME_THEME.navy }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                disableElevation
                                sx={{
                                    px: { xs: 2, sm: 3.5 },
                                    py: 1.1,
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    bgcolor: HOME_THEME.accent,
                                    '&:hover': { bgcolor: '#3B4FBF' }
                                }}
                            >
                                Search
                            </Button>
                        </Box>

                        <Stack direction="row" alignItems="center" sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: HOME_THEME.navy }}>Popular Searches:</Typography>
                            {POPULAR_SEARCHES.map((item) => (
                                <Chip
                                    key={item.label}
                                    label={item.label}
                                    component={Link}
                                    href={item.href}
                                    clickable
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.8)',
                                        border: `1px solid ${HOME_THEME.panelBorder}`,
                                        color: HOME_THEME.navy,
                                        fontWeight: 500,
                                        '&:hover': { bgcolor: '#FFFFFF', borderColor: HOME_THEME.accent }
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>

                    <TodayPanchangCard />
                </Box>
            </Container>
        </Box>
    );
}

// Hero, quick links, calendar/festival/vrat/muhurat widgets, closing
// banners and the trust strip.
export default function SpiritualHome({ availableImages = [] }) {
    return (
        <Box component="main" sx={{ pb: { xs: 4, md: 6 } }}>
            <HomeHero />
            <QuickNav />
            <HomeWidgets availableImages={availableImages} />
            <HomeBanners />
            <TrustStrip />
        </Box>
    );
}