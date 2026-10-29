'use client';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';

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
    Skeleton
} from '@mui/material';

// icons
import {
    TbCalendarEvent,
    TbSparkles,
    TbFlame,
    TbArrowRight,
    TbBell,
    TbX,
    TbHeartHandshake,
    TbMoodSmile,
    TbShieldCheck,
    TbLeaf,
    TbHeartbeat,
    TbCoin,
    TbUsersGroup,
    TbBriefcase,
    TbAdjustmentsHorizontal,
    TbSunrise,
    TbSunset,
    TbMoon,
    TbStar,
    TbCheck,
    TbSearchOff
} from 'react-icons/tb';
import { GiLotus } from 'react-icons/gi';

import { getVrats, getVratBySlug } from '@/services/vrat-service';
import { getPanchang } from '@/services/panchang-service';
import { toast } from 'react-hot-toast';
import { resolveFestivalImageSrc } from 'src/utils/festival-image';

// ---------------------------------------------------------------------------
// Theme tokens — Chandra (चंद्र) silver-blue palette, local to this module.
// ---------------------------------------------------------------------------
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
    gold: 'var(--pm-gold)',
    shadow: 'var(--pm-shadow)',
    shadowLg: 'var(--pm-shadow-lg)'
};

const PURPOSE_ICONS = {
    'Health & Well-being': TbHeartbeat,
    'Prosperity & Wealth': TbCoin,
    'Marriage & Relationships': TbHeartHandshake,
    'Spiritual Growth': TbLeaf,
    'Removal of Obstacles': TbShieldCheck,
    'Peace & Happiness': TbMoodSmile,
    'Career & Success': TbBriefcase
};

const ALL_TYPES_LABEL = 'All Vrat';

// shared style for every white panel
const panelSx = {
    borderRadius: 3.5,
    border: `1px solid ${THEME.panelBorder}`,
    boxShadow: THEME.shadow,
    bgcolor: 'var(--pm-surface)'
};

// sticky offset so side panels sit below the site navbar
const STICKY_TOP = 88;

function monthOptions() {
    // Full calendar year (Jan -> Dec) of the current year.
    const opts = [];
    const year = new Date().getFullYear();
    for (let i = 0; i < 12; i++) {
        const d = new Date(year, i, 1);
        const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        opts.push({ value, label });
    }
    return opts;
}

function currentMonthValue() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatDateBadge(dateStr) {
    const d = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) return { day: '', month: '', weekday: '', long: dateStr || '' };
    return {
        day: d.getDate(),
        month: d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase(),
        weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        long: d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    };
}

// whole days between today (local) and the vrat date
function daysFromToday(dateStr) {
    const d = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return Math.round((d - t) / 86400000);
}

function relativeChip(diff) {
    if (diff === null) return null;
    if (diff === 0) return { label: 'Today', bg: '#16A34A', color: '#fff' };
    if (diff === 1) return { label: 'Tomorrow', bg: THEME.gold, color: '#fff' };
    if (diff > 1 && diff <= 30) return { label: `In ${diff} days`, bg: 'var(--pm-badge-bg)', color: THEME.navy };
    if (diff < 0) return { label: 'Passed', bg: 'rgba(23, 59, 103,0.7)', color: '#fff' };
    return null;
}

// "2026-09-28T06:16:15+05:30" -> "6:16 AM" (reads the clock digits as-is, no timezone shift)
function formatClock(value) {
    if (!value) return '—';
    const m = String(value).match(/T(\d{2}):(\d{2})/);
    if (!m) return String(value);
    let h = parseInt(m[1], 10);
    const min = m[2];
    const suffix = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${min} ${suffix}`;
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------
function VratCard({ vrat, onViewDetails, availableImages }) {
    const { day, month, weekday } = formatDateBadge(vrat.date);
    const rel = relativeChip(daysFromToday(vrat.date));
    // Admin-uploaded image wins; otherwise use the photo from public/images/festivals with a matching name.
    const festivalImg = useMemo(() => resolveFestivalImageSrc(vrat.title, availableImages), [vrat.title, availableImages]);
    const imgSrc = vrat.image?.url || festivalImg;

    const handleReminder = () => {
        toast.success(`Reminder set for ${vrat.title} (${vrat.date})`);
    };

    return (
        <Card
            elevation={0}
            sx={{
                ...panelSx,
                height: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: THEME.shadowLg,
                    '& .vrat-img': { transform: 'scale(1.06)' }
                }
            }}
        >
            {/* image + overlays */}
            <Box sx={{ position: 'relative', height: 150, overflow: 'hidden', flexShrink: 0 }}>
                {imgSrc ? (
                    <Box
                        component="img"
                        className="vrat-img"
                        src={imgSrc}
                        alt={vrat.image?.altText || vrat.title}
                        loading="lazy"
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center 20%',
                            display: 'block',
                            transition: 'transform 0.5s ease'
                        }}
                    />
                ) : (
                    <Box
                        sx={{
                            height: '100%',
                            background: 'linear-gradient(135deg, #B9CBE8, #173B67)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 38,
                            color: '#fff'
                        }}
                    >
                        <GiLotus />
                    </Box>
                )}
                {/* soft bottom fade so the image blends into the card body */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(23, 59, 103,0.18) 0%, rgba(23, 59, 103,0) 40%, rgba(23, 59, 103,0.35) 100%)',
                        pointerEvents: 'none'
                    }}
                />

                {/* date badge */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        minWidth: 46,
                        textAlign: 'center',
                        bgcolor: 'var(--pm-badge-bg)',
                        borderRadius: 2,
                        px: 1,
                        py: 0.5,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.18)'
                    }}
                >
                    <Typography sx={{ fontSize: 18, fontWeight: 800, color: THEME.navy, lineHeight: 1.05 }}>{day}</Typography>
                    <Typography sx={{ fontSize: 10, fontWeight: 800, color: THEME.accent, letterSpacing: 0.6 }}>{month}</Typography>
                </Box>

                {/* relative-day chip */}
                {rel && (
                    <Chip
                        size="small"
                        label={rel.label}
                        sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            bgcolor: rel.bg,
                            color: rel.color,
                            fontWeight: 800,
                            fontSize: 11,
                            backdropFilter: 'blur(4px)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}
                    />
                )}
            </Box>

            {/* body */}
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.1, flexGrow: 1 }}>
                <Box>
                    <Typography sx={{ fontSize: 11.5, color: THEME.muted, fontWeight: 600 }}>
                        {weekday && `${weekday}`}
                        {weekday && ' • '}
                        {vrat.tithi || vrat.date}
                    </Typography>
                    <Typography
                        sx={{
                            fontWeight: 800,
                            fontSize: 16.5,
                            color: THEME.navy,
                            lineHeight: 1.25,
                            mt: 0.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {vrat.title}
                    </Typography>
                </Box>

                <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
                    <Chip
                        size="small"
                        label={vrat.type || 'Vrat'}
                        sx={{ bgcolor: 'var(--pm-lav-bg)', color: 'var(--pm-lav)', fontWeight: 700, fontSize: 11 }}
                    />
                    {vrat.isHighlyAuspicious && (
                        <Chip
                            size="small"
                            icon={<TbStar size={12} />}
                            label="Highly Auspicious"
                            sx={{
                                bgcolor: '#DCFCE7',
                                color: '#15803D',
                                fontWeight: 700,
                                fontSize: 11,
                                '& .MuiChip-icon': { color: '#15803D' }
                            }}
                        />
                    )}
                    {(vrat.tags || []).slice(0, 2).map((tag) => (
                        <Chip
                            key={tag}
                            size="small"
                            label={tag}
                            sx={{ bgcolor: THEME.accentSoft, color: THEME.accent, fontWeight: 700, fontSize: 11 }}
                        />
                    ))}
                </Stack>

                <Typography
                    sx={{
                        fontSize: 13,
                        color: THEME.navySoft,
                        lineHeight: 1.55,
                        flexGrow: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}
                >
                    {vrat.shortDescription}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ pt: 0.6 }}>
                    <Button
                        size="small"
                        disableElevation
                        variant="contained"
                        endIcon={<TbArrowRight size={14} />}
                        onClick={() => onViewDetails(vrat)}
                        sx={{
                            flex: 1,
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: 12.5,
                            borderRadius: 2,
                            py: 0.8,
                            bgcolor: 'var(--pm-accent-solid)',
                            color: '#fff',
                            '&:hover': { bgcolor: 'var(--pm-accent-hover)' }
                        }}
                    >
                        View Details
                    </Button>
                    <Button
                        size="small"
                        startIcon={<TbBell size={14} />}
                        onClick={handleReminder}
                        sx={{
                            flex: 1,
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: 12.5,
                            borderRadius: 2,
                            py: 0.8,
                            color: THEME.navySoft,
                            border: `1px solid ${THEME.panelBorder}`,
                            '&:hover': { bgcolor: THEME.iconBg, borderColor: THEME.accent }
                        }}
                    >
                        Set Reminder
                    </Button>
                </Stack>
            </Box>
        </Card>
    );
}

// ---------------------------------------------------------------------------
// Details dialog
// ---------------------------------------------------------------------------
function SectionTitle({ children }) {
    return (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.2 }}>
            <Box sx={{ width: 4, height: 16, borderRadius: 2, bgcolor: THEME.accent }} />
            <Typography sx={{ fontWeight: 800, fontSize: 14.5, color: THEME.navy }}>{children}</Typography>
        </Stack>
    );
}

function VratDetailsDialog({ vrat, onClose, availableImages }) {
    const [full, setFull] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!vrat) {
            setFull(null);
            return;
        }
        setLoading(true);
        getVratBySlug(vrat.slug)
            .then((res) => setFull(res?.data || vrat))
            .catch(() => setFull(vrat))
            .finally(() => setLoading(false));
    }, [vrat]);

    if (!vrat) return null;
    const data = full || vrat;
    const { long } = formatDateBadge(data.date);
    const rel = relativeChip(daysFromToday(data.date));
    const headerImg = data.image?.url || resolveFestivalImageSrc(data.title, availableImages);

    return (
        <Dialog
            open={!!vrat}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
        >
            <DialogContent sx={{ p: 0 }}>
                <Box
                    sx={{
                        p: 3,
                        pt: headerImg ? 12 : 3,
                        background: headerImg
                            ? `linear-gradient(180deg, rgba(23, 59, 103,0.1) 0%, rgba(23, 59, 103,0.88) 100%), url(${headerImg}) center 20% / cover no-repeat`
                            : 'linear-gradient(135deg, #B9CBE8, #173B67)',
                        color: '#fff',
                        position: 'relative'
                    }}
                >
                    <IconButton
                        onClick={onClose}
                        aria-label="Close"
                        sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            color: '#fff',
                            bgcolor: 'rgba(0,0,0,0.3)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' }
                        }}
                    >
                        <TbX />
                    </IconButton>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, opacity: 0.9 }}>{long}</Typography>
                        {rel && (
                            <Chip
                                size="small"
                                label={rel.label}
                                sx={{ bgcolor: rel.bg, color: rel.color, fontWeight: 800, fontSize: 11, height: 22 }}
                            />
                        )}
                    </Stack>
                    <Typography sx={{ fontSize: 24, fontWeight: 800, mt: 0.6, lineHeight: 1.2 }}>{data.title}</Typography>
                    {data.tithi && <Typography sx={{ fontSize: 13.5, opacity: 0.92, mt: 0.6 }}>{data.tithi}</Typography>}
                </Box>

                <Box sx={{ p: 3 }}>
                    {loading && !full ? (
                        <Stack spacing={1}>
                            <Skeleton height={20} />
                            <Skeleton height={20} width="80%" />
                            <Skeleton height={20} width="60%" />
                        </Stack>
                    ) : (
                        <>
                            {data.description && (
                                <Typography sx={{ fontSize: 14, color: THEME.navySoft, lineHeight: 1.85, mb: 2.5 }}>
                                    {data.description}
                                </Typography>
                            )}

                            {!!(data.rituals || []).length && (
                                <Box sx={{ mb: 2.5 }}>
                                    <SectionTitle>Rituals</SectionTitle>
                                    <Stack spacing={1}>
                                        {data.rituals.map((r, i) => (
                                            <Stack key={i} direction="row" spacing={1.2} alignItems="flex-start">
                                                <Box
                                                    sx={{
                                                        width: 22,
                                                        height: 22,
                                                        borderRadius: '50%',
                                                        bgcolor: THEME.accentSoft,
                                                        color: THEME.accent,
                                                        fontSize: 11.5,
                                                        fontWeight: 800,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                        mt: 0.1
                                                    }}
                                                >
                                                    {i + 1}
                                                </Box>
                                                <Typography sx={{ fontSize: 13.5, color: THEME.navySoft, lineHeight: 1.6 }}>{r}</Typography>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Box>
                            )}

                            {!!(data.benefits || []).length && (
                                <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'var(--pm-green-bg)', border: '1px solid var(--pm-green-border)' }}>
                                    <SectionTitle>Benefits</SectionTitle>
                                    <Stack spacing={0.9}>
                                        {data.benefits.map((b, i) => (
                                            <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                                                <Box sx={{ color: 'var(--pm-green-text)', mt: '3px', display: 'flex' }}>
                                                    <TbCheck size={15} />
                                                </Box>
                                                <Typography sx={{ fontSize: 13.5, color: THEME.navySoft, lineHeight: 1.6 }}>{b}</Typography>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Sidebar cards
// ---------------------------------------------------------------------------
const QUOTES = [
    'A disciplined mind brings clarity, and a pure heart attracts positivity.',
    'Fasting is not starving the body — it is feeding the soul.',
    'Every Vrat observed with devotion plants a seed of good karma.'
];

function InfoTile({ icon: Icon, label, value }) {
    return (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 1.1, borderRadius: 2.5, bgcolor: 'var(--pm-soft-bg)' }}>
            <Box
                sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 2,
                    bgcolor: THEME.accentSoft,
                    color: THEME.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}
            >
                <Icon size={16} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 10.5, color: THEME.muted, fontWeight: 700, lineHeight: 1.2 }}>{label}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: THEME.navy, lineHeight: 1.3 }} noWrap>
                    {value}
                </Typography>
            </Box>
        </Stack>
    );
}

function TodaysVratCard({ today, panchang }) {
    // set after mount to avoid server/client date mismatch
    const [dateLabel, setDateLabel] = useState('');
    useEffect(() => {
        setDateLabel(new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }));
    }, []);

    return (
        <Card elevation={0} sx={{ ...panelSx, overflow: 'hidden' }}>
            <Box sx={{ px: 2.2, py: 1.6, background: THEME.bgGradient, borderBottom: `1px solid ${THEME.panelBorder}` }}>
                <Typography sx={{ fontWeight: 800, fontSize: 14.5, color: THEME.navy }}>Today's Tithi & Vrat</Typography>
                {dateLabel && <Typography sx={{ fontSize: 11.5, color: THEME.muted, fontWeight: 600 }}>{dateLabel}</Typography>}
            </Box>

            <Box sx={{ p: 2 }}>
                {panchang ? (
                    <Grid container spacing={1}>
                        <Grid size={6}>
                            <InfoTile icon={TbMoon} label="Tithi" value={panchang.tithi?.name || '—'} />
                        </Grid>
                        <Grid size={6}>
                            <InfoTile icon={TbStar} label="Nakshatra" value={panchang.nakshatra?.name || '—'} />
                        </Grid>
                        <Grid size={6}>
                            <InfoTile icon={TbSunrise} label="Sunrise" value={formatClock(panchang.sunrise)} />
                        </Grid>
                        <Grid size={6}>
                            <InfoTile icon={TbSunset} label="Sunset" value={formatClock(panchang.sunset)} />
                        </Grid>
                    </Grid>
                ) : (
                    <Skeleton variant="rounded" height={110} />
                )}

                <Divider sx={{ my: 1.6 }} />

                {today && today.length > 0 ? (
                    <Stack spacing={0.7}>
                        {today.map((v) => (
                            <Chip
                                key={v._id}
                                icon={<TbFlame size={14} />}
                                label={v.title}
                                sx={{
                                    justifyContent: 'flex-start',
                                    bgcolor: 'var(--pm-gold-bg)',
                                    color: 'var(--pm-gold-text)',
                                    fontWeight: 800,
                                    '& .MuiChip-icon': { color: 'var(--pm-gold)' }
                                }}
                            />
                        ))}
                    </Stack>
                ) : (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <GiLotus color={THEME.accent} size={16} />
                        <Typography sx={{ fontSize: 12.5, color: THEME.muted, fontWeight: 600 }}>No Vrat observed today.</Typography>
                    </Stack>
                )}
            </Box>
        </Card>
    );
}

function QuoteCard() {
    const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);
    return (
        <Card
            elevation={0}
            sx={{
                p: 2.2,
                borderRadius: 3.5,
                background: 'var(--pm-quote-grad)',
                border: `1px solid ${THEME.panelBorder}`
            }}
        >
            <TbSparkles size={20} color={THEME.accent} />
            <Typography sx={{ fontSize: 13.5, color: THEME.navy, fontWeight: 600, fontStyle: 'italic', mt: 1, lineHeight: 1.65 }}>
                “{quote}”
            </Typography>
        </Card>
    );
}

const BENEFITS = ['Detoxifies the body', 'Improves mental focus', 'Brings spiritual growth', 'Enhances self-discipline'];

function BenefitsCard() {
    return (
        <Card elevation={0} sx={{ ...panelSx, p: 2.2 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 14.5, color: THEME.navy, mb: 1.4 }}>Benefits of Vrat</Typography>
            <Stack spacing={1} sx={{ mb: 2 }}>
                {BENEFITS.map((b) => (
                    <Stack key={b} direction="row" spacing={1.2} alignItems="center">
                        <Box
                            sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                bgcolor: THEME.accentSoft,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}
                        >
                            <GiLotus color={THEME.accent} size={13} />
                        </Box>
                        <Typography sx={{ fontSize: 13, color: THEME.navySoft, fontWeight: 600 }}>{b}</Typography>
                    </Stack>
                ))}
            </Stack>
            <Button
                fullWidth
                href="#why-vrat"
                component={Link}
                disableElevation
                variant="contained"
                sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2,
                    py: 0.9,
                    bgcolor: 'var(--pm-accent-solid)',
                    color: '#fff',
                    '&:hover': { bgcolor: 'var(--pm-accent-hover)' }
                }}
                endIcon={<TbArrowRight size={14} />}
            >
                Learn More About Vrat
            </Button>
        </Card>
    );
}

// ---------------------------------------------------------------------------
// Filter helpers
// ---------------------------------------------------------------------------
const checkboxSx = { color: THEME.panelBorder, '&.Mui-checked': { color: THEME.accent } };

function CountPill({ children, active }) {
    return (
        <Box
            component="span"
            sx={{
                minWidth: 24,
                textAlign: 'center',
                px: 0.8,
                py: 0.1,
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 800,
                bgcolor: active ? 'var(--pm-accent-solid)' : THEME.accentSoft,
                color: active ? '#fff' : THEME.accent
            }}
        >
            {children}
        </Box>
    );
}

function FilterHeading({ children }) {
    return (
        <Typography sx={{ fontSize: 12, fontWeight: 800, color: THEME.navy, mb: 0.6, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            {children}
        </Typography>
    );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
export default function VratUpvas({ availableImages = [] }) {
    const months = useMemo(() => monthOptions(), []);
    // Default view = today's month; dropdown lists the full Jan-Dec year.
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const nowValue = currentMonthValue();
        return months.some((m) => m.value === nowValue) ? nowValue : months[0]?.value;
    });
    const [typeFilters, setTypeFilters] = useState([]); // multi-select, empty = All
    const [purposeFilters, setPurposeFilters] = useState([]);
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false); // mobile only

    const [vrats, setVrats] = useState([]);
    const [total, setTotal] = useState(0);
    const [pageCount, setPageCount] = useState(1);
    const [typeCounts, setTypeCounts] = useState({ all: 0 });
    const [types, setTypes] = useState([]);
    const [purposes, setPurposes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [activeVrat, setActiveVrat] = useState(null);
    const [today, setToday] = useState([]);
    const [panchang, setPanchang] = useState(null);

    const fetchVrats = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Backend supports a single `type` value — when multiple boxes are
            // checked we fetch "all" and filter client-side.
            const res = await getVrats({
                month: selectedMonth,
                type: typeFilters.length === 1 ? typeFilters[0] : 'all',
                purpose: purposeFilters,
                page,
                limit: 12
            });
            let list = res?.data || [];
            if (typeFilters.length > 1) {
                list = list.filter((v) => typeFilters.includes(v.type));
            }
            setVrats(list);
            setTotal(res?.total || 0);
            setPageCount(res?.count || 1);
            setTypeCounts(res?.typeCounts || { all: 0 });
            setTypes(res?.types || []);
            setPurposes(res?.purposes || []);
        } catch (err) {
            setError(err?.response?.data?.message || 'Could not load Vrat & Upvas list. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [selectedMonth, typeFilters, purposeFilters, page]);

    useEffect(() => {
        fetchVrats();
    }, [fetchVrats]);

    useEffect(() => {
        setPage(1);
    }, [selectedMonth, typeFilters, purposeFilters]);

    useEffect(() => {
        // Sidebar "Today's Tithi & Vrat" — reuses the existing Panchang API.
        getPanchang({ city: 'New Delhi' })
            .then((res) => setPanchang(res?.data || res?.payload || null))
            .catch(() => setPanchang(null));
    }, []);

    useEffect(() => {
        import('@/services/vrat-service').then(({ getTodayVrat }) =>
            getTodayVrat()
                .then((res) => setToday(res?.data || []))
                .catch(() => setToday([]))
        );
    }, []);

    const toggleType = (type) => {
        setTypeFilters((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
    };

    const selectSingleType = (type) => {
        setTypeFilters(type === 'all' ? [] : [type]);
    };

    const togglePurpose = (p) => {
        setPurposeFilters((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
    };

    const clearFilters = () => {
        setTypeFilters([]);
        setPurposeFilters([]);
    };

    const activeTypeTab = typeFilters.length === 1 ? typeFilters[0] : 'all';
    const activeFilterCount = typeFilters.length + purposeFilters.length;
    const monthLabel = months.find((m) => m.value === selectedMonth)?.label || '';

    const tabSx = (active) => ({
        fontWeight: 700,
        px: 0.8,
        height: 36,
        borderRadius: 10,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        bgcolor: active ? 'var(--pm-accent-solid)' : 'var(--pm-surface)',
        color: active ? '#fff' : THEME.navySoft,
        border: `1px solid ${active ? THEME.accent : THEME.panelBorder}`,
        boxShadow: active ? '0 6px 14px rgba(242,140,40,0.35)' : 'none',
        transition: 'all 0.15s ease',
        '&:hover': { bgcolor: active ? 'var(--pm-accent-hover)' : THEME.accentSoft },
        '& .MuiChip-icon': { color: active ? '#fff' : THEME.accent }
    });

    return (
        <Box>
            {/* ---------------- Hero ----------------
                The banner image already has the title, tagline and benefit
                icons designed into it, so nothing is drawn on top of it. */}
            <Box
                component="img"
                src="/images/vrat-upvas-banner.jpg"
                alt="Vrat & Upvas — Discipline Today. A Brighter Tomorrow."
                sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: 4,
                    mb: 3,
                    boxShadow: THEME.shadowLg
                }}
            />

            {/* ---------------- Type tabs ---------------- */}
            <Stack
                direction="row"
                spacing={1}
                sx={{
                    overflowX: 'auto',
                    pb: 1.2,
                    mb: 2.5,
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${THEME.panelBorder} transparent`,
                    '&::-webkit-scrollbar': { height: 5 },
                    '&::-webkit-scrollbar-thumb': { bgcolor: THEME.panelBorder, borderRadius: 4 }
                }}
            >
                <Chip
                    clickable
                    icon={<TbCalendarEvent size={15} />}
                    label={`${ALL_TYPES_LABEL} (${typeCounts.all ?? 0})`}
                    onClick={() => selectSingleType('all')}
                    sx={tabSx(activeTypeTab === 'all')}
                />
                {types.map((type) => (
                    <Chip
                        key={type}
                        clickable
                        label={`${type} (${typeCounts[type] ?? 0})`}
                        onClick={() => selectSingleType(type)}
                        sx={tabSx(activeTypeTab === type)}
                    />
                ))}
            </Stack>

            {/* mobile-only filter toggle */}
            <Button
                fullWidth
                onClick={() => setShowFilters((s) => !s)}
                startIcon={<TbAdjustmentsHorizontal size={18} />}
                sx={{
                    display: { xs: 'flex', md: 'none' },
                    mb: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2.5,
                    py: 1,
                    color: THEME.navy,
                    bgcolor: '#fff',
                    border: `1px solid ${THEME.panelBorder}`,
                    boxShadow: THEME.shadow
                }}
            >
                {showFilters ? 'Hide filters' : 'Filters'}
                {activeFilterCount > 0 && ` (${activeFilterCount})`}
            </Button>

            {/* ---------------- Body: sidebar + grid + sidebar ---------------- */}
            <Grid container spacing={3} alignItems="flex-start">
                {/* Left filters */}
                <Grid
                    size={{ xs: 12, md: 3 }}
                    sx={{
                        display: { xs: showFilters ? 'block' : 'none', md: 'block' },
                        position: { md: 'sticky' },
                        top: { md: STICKY_TOP },
                        alignSelf: 'flex-start'
                    }}
                >
                    <Card elevation={0} sx={{ ...panelSx, p: 2.2 }}>
                        <Stack spacing={2.2}>
                            <Box>
                                <FilterHeading>Select Month</FilterHeading>
                                <Select
                                    fullWidth
                                    size="small"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    sx={{ bgcolor: 'var(--pm-surface)', borderRadius: 2.5, fontWeight: 700, color: THEME.navy }}
                                >
                                    {months.map((m) => (
                                        <MenuItem key={m.value} value={m.value}>
                                            {m.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Box>

                            <Divider />

                            <Box>
                                <FilterHeading>Filter by Type</FilterHeading>
                                <FormControlLabel
                                    sx={{ ml: 0, mr: 0, width: '100%', '& .MuiFormControlLabel-label': { flex: 1 } }}
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={typeFilters.length === 0}
                                            onChange={() => setTypeFilters([])}
                                            sx={checkboxSx}
                                        />
                                    }
                                    label={
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography sx={{ fontSize: 13, color: THEME.navy, fontWeight: 800 }}>All</Typography>
                                            <CountPill active={typeFilters.length === 0}>{typeCounts.all ?? 0}</CountPill>
                                        </Stack>
                                    }
                                />
                                {types.map((type) => (
                                    <FormControlLabel
                                        key={type}
                                        sx={{ ml: 0, mr: 0, width: '100%', '& .MuiFormControlLabel-label': { flex: 1 } }}
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={typeFilters.includes(type)}
                                                onChange={() => toggleType(type)}
                                                sx={checkboxSx}
                                            />
                                        }
                                        label={
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography sx={{ fontSize: 13, color: THEME.navySoft, fontWeight: 600 }}>{type}</Typography>
                                                <CountPill active={typeFilters.includes(type)}>{typeCounts[type] ?? 0}</CountPill>
                                            </Stack>
                                        }
                                    />
                                ))}
                            </Box>

                            <Divider />

                            <Box>
                                <FilterHeading>Filter by Purpose</FilterHeading>
                                <Stack spacing={0}>
                                    {(purposes.length ? purposes : Object.keys(PURPOSE_ICONS)).map((p) => {
                                        const Icon = PURPOSE_ICONS[p] || TbSparkles;
                                        return (
                                            <FormControlLabel
                                                key={p}
                                                sx={{ ml: 0, '& .MuiFormControlLabel-label': { fontSize: 12.5, color: THEME.navySoft, fontWeight: 600 } }}
                                                control={
                                                    <Checkbox
                                                        size="small"
                                                        checked={purposeFilters.includes(p)}
                                                        onChange={() => togglePurpose(p)}
                                                        sx={checkboxSx}
                                                    />
                                                }
                                                label={
                                                    <Stack direction="row" spacing={0.8} alignItems="center">
                                                        <Box sx={{ color: THEME.accent, display: 'flex' }}>
                                                            <Icon size={15} />
                                                        </Box>
                                                        <span>{p}</span>
                                                    </Stack>
                                                }
                                            />
                                        );
                                    })}
                                </Stack>
                            </Box>

                            {activeFilterCount > 0 && (
                                <Button
                                    size="small"
                                    onClick={clearFilters}
                                    startIcon={<TbX size={14} />}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        color: THEME.accent,
                                        bgcolor: THEME.accentSoft,
                                        borderRadius: 2,
                                        '&:hover': { bgcolor: 'var(--pm-icon-bg-hover)' }
                                    }}
                                >
                                    Clear filters
                                </Button>
                            )}

                            <Box
                                sx={{
                                    p: 1.6,
                                    borderRadius: 3,
                                    bgcolor: THEME.accentSoft,
                                    border: `1px solid ${THEME.panelBorder}`
                                }}
                            >
                                <Typography sx={{ fontSize: 12.5, color: THEME.navy, fontWeight: 600, lineHeight: 1.6 }}>
                                    🙏 Vrat is not just about food, but about mindfulness.
                                </Typography>
                            </Box>
                        </Stack>
                    </Card>
                </Grid>

                {/* Main grid */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        flexWrap="wrap"
                        useFlexGap
                        spacing={1}
                        sx={{ mb: 1.8 }}
                    >
                        <Typography sx={{ fontSize: 13.5, color: THEME.muted, fontWeight: 600 }}>
                            {loading ? (
                                'Loading…'
                            ) : (
                                <>
                                    Showing{' '}
                                    <Box component="span" sx={{ color: THEME.navy, fontWeight: 800 }}>
                                        {vrats.length} of {total}
                                    </Box>{' '}
                                    vrat{monthLabel && ` in ${monthLabel}`}
                                </>
                            )}
                        </Typography>

                        {activeFilterCount > 0 && (
                            <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
                                {typeFilters.map((t) => (
                                    <Chip
                                        key={`t-${t}`}
                                        size="small"
                                        label={t}
                                        onDelete={() => toggleType(t)}
                                        sx={{ bgcolor: THEME.accentSoft, color: THEME.accent, fontWeight: 700 }}
                                    />
                                ))}
                                {purposeFilters.map((p) => (
                                    <Chip
                                        key={`p-${p}`}
                                        size="small"
                                        label={p}
                                        onDelete={() => togglePurpose(p)}
                                        sx={{ bgcolor: 'var(--pm-lav-bg)', color: 'var(--pm-lav)', fontWeight: 700 }}
                                    />
                                ))}
                            </Stack>
                        )}
                    </Stack>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Grid container spacing={2.2}>
                        {loading
                            ? Array.from({ length: 6 }).map((_, i) => (
                                <Grid key={i} size={{ xs: 12, sm: 6 }}>
                                    <Skeleton variant="rounded" height={340} sx={{ borderRadius: 3.5 }} />
                                </Grid>
                            ))
                            : vrats.map((vrat) => (
                                <Grid key={vrat._id} size={{ xs: 12, sm: 6 }}>
                                    <VratCard vrat={vrat} onViewDetails={setActiveVrat} availableImages={availableImages} />
                                </Grid>
                            ))}
                    </Grid>

                    {!loading && vrats.length === 0 && !error && (
                        <Card elevation={0} sx={{ ...panelSx, mt: 1, p: 4, textAlign: 'center' }}>
                            <Box sx={{ color: THEME.accent, mb: 1 }}>
                                <TbSearchOff size={38} />
                            </Box>
                            <Typography sx={{ fontWeight: 800, color: THEME.navy, fontSize: 16 }}>No Vrat found</Typography>
                            <Typography sx={{ fontSize: 13.5, color: THEME.muted, mt: 0.5, mb: 2 }}>
                                No Vrat to show for this filter combination. Try another month or clear the filters.
                            </Typography>
                            {activeFilterCount > 0 && (
                                <Button
                                    onClick={clearFilters}
                                    disableElevation
                                    variant="contained"
                                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, bgcolor: 'var(--pm-accent-solid)' }}
                                >
                                    Clear filters
                                </Button>
                            )}
                        </Card>
                    )}

                    {pageCount > 1 && (
                        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 3 }}>
                            {Array.from({ length: pageCount }).map((_, i) => (
                                <Button
                                    key={i}
                                    size="small"
                                    onClick={() => setPage(i + 1)}
                                    sx={{
                                        minWidth: 36,
                                        height: 36,
                                        borderRadius: 2,
                                        fontWeight: 700,
                                        color: page === i + 1 ? '#fff' : THEME.navySoft,
                                        bgcolor: page === i + 1 ? 'var(--pm-accent-solid)' : 'var(--pm-surface)',
                                        border: `1px solid ${page === i + 1 ? THEME.accent : THEME.panelBorder}`,
                                        '&:hover': { bgcolor: page === i + 1 ? 'var(--pm-accent-solid)' : THEME.iconBg }
                                    }}
                                >
                                    {i + 1}
                                </Button>
                            ))}
                        </Stack>
                    )}
                </Grid>

                {/* Right sidebar */}
                <Grid
                    size={{ xs: 12, md: 3 }}
                    sx={{ position: { md: 'sticky' }, top: { md: STICKY_TOP }, alignSelf: 'flex-start' }}
                >
                    <Stack spacing={2.5}>
                        <TodaysVratCard today={today} panchang={panchang} />
                        <QuoteCard />
                        <BenefitsCard />
                    </Stack>
                </Grid>
            </Grid>

            <VratDetailsDialog vrat={activeVrat} onClose={() => setActiveVrat(null)} availableImages={availableImages} />

            {/* ---------------- Educational content ---------------- */}
            <Card
                id="why-vrat"
                elevation={0}
                sx={{
                    mt: 6,
                    p: { xs: 2.5, md: 3.5 },
                    borderRadius: 4,
                    background: THEME.bgGradient,
                    border: `1px solid ${THEME.panelBorder}`,
                    scrollMarginTop: '96px'
                }}
            >
                <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1.5 }}>
                    <GiLotus color={THEME.accent} size={24} />
                    <Typography sx={{ fontWeight: 800, fontSize: 21, color: THEME.navy }}>Why Observe a Vrat?</Typography>
                </Stack>
                <Typography sx={{ fontSize: 14.5, color: THEME.navySoft, lineHeight: 1.9, maxWidth: 980 }}>
                    A Vrat is a vow of self-discipline — fasting, prayer and focused intention observed on
                    specific Tithis to honour a deity or planetary energy. Beyond the spiritual merit, the
                    discipline of a Vrat trains the mind, gives the digestive system rest, and creates a
                    recurring rhythm of reflection through the lunar month. Select a month above, or use the
                    filters on the left, to find the Vrat that matches what you're working towards.
                </Typography>
            </Card>
        </Box>
    );
}