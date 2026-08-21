'use client';
import { Suspense, useCallback } from 'react';
import React from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { useRouter } from '@bprogress/next';
import { useQuery } from '@tanstack/react-query';

import {
    Box, Grid, Stack, Chip, Typography, Skeleton, Pagination,
    Container, TextField, InputAdornment, MenuItem, Button, alpha
} from '@mui/material';
import { FiSearch, FiMapPin, FiBriefcase, FiClock } from 'react-icons/fi';
import { IoArrowForward } from 'react-icons/io5';
import {
    MdOutlineWorkOutline, MdOutlineTrendingUp, MdOutlineEmojiEvents,
    MdOutlineGroups, MdOutlineSchool, MdOutlineCelebration
} from 'react-icons/md';

import * as api from 'src/services';
import Logo from '@/components/logo';

const ORANGE = '#fb8b05';
const ORANGE_DARK = '#E87722';
const ORANGE_TINT = '#FDF0E6';
// Fixed dark text colors for content sitting on the cream/peach ORANGE_TINT
// background — these cards stay cream in both light and dark mode, so their
// text must not switch to the theme's (light) dark-mode text color.
const CREAM_TEXT = '#20160b';
const CREAM_TEXT_SECONDARY = 'rgba(32,22,11,0.68)';

/* ---------------- WHY JOIN US DATA ---------------- */
const WHY_JOIN_US = [
    {
        icon: <MdOutlineTrendingUp />,
        title: 'Growth Opportunities',
        description: 'Clear career paths with regular feedback, mentorship and opportunities to take on more responsibility.'
    },
    {
        icon: <MdOutlineEmojiEvents />,
        title: 'Recognition & Rewards',
        description: 'Your hard work gets noticed, celebrated and rewarded through regular appreciation and incentives.'
    },
    {
        icon: <MdOutlineGroups />,
        title: 'Collaborative Culture',
        description: 'Work alongside passionate, supportive teammates who value openness, respect and shared success.'
    },
    {
        icon: <MdOutlineWorkOutline />,
        title: 'Meaningful Work',
        description: 'Be part of a mission that brings spirituality, trust and authenticity to millions of homes.'
    },
    {
        icon: <MdOutlineSchool />,
        title: 'Learning & Development',
        description: 'Access to learning resources, workshops and cross-functional projects to keep growing your skills.'
    },
    {
        icon: <MdOutlineCelebration />,
        title: 'Great Work-Life Balance',
        description: 'Flexible working options and a culture that respects your time outside of work.'
    }
];

/* ---------------- WHY ADHYATMAH (logo + highlights) ---------------- */
const WHY_ADHYATMAH = [
    {
        icon: <MdOutlineWorkOutline />,
        title: 'Meaningful Mission',
        description: 'Help bring trusted pandit ji and authentic pujan experiences to every home across India.'
    },
    {
        icon: <MdOutlineTrendingUp />,
        title: 'Growth & Ownership',
        description: "You're not just an employee here — get real ownership and a say in what we build next."
    },
    {
        icon: <MdOutlineSchool />,
        title: 'Tech Meets Tradition',
        description: 'Build modern products that blend technology with centuries-old Vedic tradition.'
    },
    {
        icon: <MdOutlineGroups />,
        title: 'A Team That Cares',
        description: 'Work alongside a close-knit, driven team that genuinely cares about the mission and each other.'
    }
];

/* ---------------- HERO ---------------- */
function CareersHero() {
    return (
        <Box
            sx={{
                position: 'relative',
                overflow: 'hidden',
                bgcolor: ORANGE_TINT,
                borderRadius: { xs: 3, md: 4 },
                px: { xs: 3, md: 8 },
                py: { xs: 6, md: 9 },
                textAlign: 'center',
                border: '1px solid',
                borderColor: alpha(ORANGE, 0.12),
                boxShadow: '0 20px 48px rgba(232,119,34,0.08)'
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: -60,
                    right: -60,
                    width: 220,
                    height: 220,
                    borderRadius: '50%',
                    background: `radial-gradient(circle at 30% 30%, ${alpha(ORANGE, 0.22)}, ${alpha(ORANGE, 0.06)})`,
                    pointerEvents: 'none'
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -50,
                    left: -50,
                    width: 180,
                    height: 180,
                    borderRadius: '50%',
                    background: `radial-gradient(circle at 70% 70%, ${alpha(ORANGE, 0.18)}, ${alpha(ORANGE, 0.05)})`,
                    pointerEvents: 'none'
                }}
            />

            <Stack spacing={2.25} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.25}
                    sx={{
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: alpha(ORANGE, 0.35),
                        borderRadius: 50,
                        px: 2.75,
                        py: 1.1,
                        boxShadow: '0 6px 18px rgba(232,119,34,0.14)'
                    }}
                >
                    <Box
                        sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: ORANGE,
                            flexShrink: 0,
                            boxShadow: `0 0 0 5px ${alpha(ORANGE, 0.18)}`
                        }}
                    />
                    <Typography sx={{ fontSize: { xs: 14, md: 15.5 }, fontWeight: 800, color: ORANGE_DARK, letterSpacing: 0.3 }}>
                        We&apos;re Hiring
                    </Typography>
                </Stack>

                <Typography
                    sx={{
                        fontSize: { xs: 28, sm: 36, md: 46 },
                        fontWeight: 900,
                        lineHeight: 1.2,
                        color: CREAM_TEXT
                    }}
                >
                    Build Your Career With{' '}
                    <Box component="span" sx={{ color: ORANGE }}>
                        Adhyatmah
                    </Box>
                </Typography>

                <Typography
                    sx={{
                        fontSize: { xs: 14, md: 16 },
                        color: CREAM_TEXT_SECONDARY,
                        maxWidth: 680,
                        lineHeight: 1.7
                    }}
                >
                    At Adhyatmah, we're on a mission to bring spirituality, trust and authenticity to every
                    doorstep. We're looking for passionate, driven people who want to grow with us —
                    building products and experiences that touch millions of lives.
                </Typography>

                <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
                    <Button
                        component="a"
                        href="#openings"
                        variant="contained"
                        size="large"
                        endIcon={<IoArrowForward size={17} />}
                        sx={{
                            bgcolor: ORANGE,
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3.5,
                            boxShadow: '0 10px 24px rgba(232,119,34,0.28)',
                            transition: 'all .25s',
                            '&:hover': {
                                bgcolor: '#d06a1a',
                                boxShadow: '0 12px 28px rgba(232,119,34,0.36)',
                                transform: 'translateY(-1px)'
                            }
                        }}
                    >
                        View Open Roles
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
}

/* ---------------- WHY ADHYATMAH ---------------- */
function WhyAdhyatmahHighlightCard({ icon, title, description, sx }) {
    return (
        <Stack
            direction="row"
            spacing={1.5}
            sx={{
                p: 2.25,
                borderRadius: 3,
                bgcolor: ORANGE_TINT,
                border: '1px solid',
                borderColor: alpha(ORANGE, 0.15),
                boxShadow: '0 6px 18px rgba(232,119,34,0.06)',
                transition: 'all .25s',
                '&:hover': {
                    borderColor: alpha(ORANGE, 0.35),
                    boxShadow: '0 10px 26px rgba(232,119,34,0.14)',
                    transform: 'translateY(-2px)'
                },
                ...sx
            }}
        >
            <Box
                sx={{
                    flexShrink: 0,
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: ORANGE,
                    color: '#fff',
                    fontSize: 20,
                    boxShadow: `0 4px 10px ${alpha(ORANGE, 0.35)}`
                }}
            >
                {icon}
            </Box>
            <Stack spacing={0.25}>
                <Typography sx={{ fontSize: 14.5, fontWeight: 800, color: CREAM_TEXT }}>
                    {title}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: CREAM_TEXT_SECONDARY, lineHeight: 1.5 }}>
                    {description}
                </Typography>
            </Stack>
        </Stack>
    );
}

/* Circle with the site logo in the middle, used by both the desktop
   (absolutely-positioned) and mobile (stacked) layouts below. */
function WhyAdhyatmahLogoCircle({ branding, size = 220, logoSize = 100 }) {
    return (
        <Box
            sx={{
                position: 'relative',
                width: size,
                height: size,
                borderRadius: '50%',
                bgcolor: alpha(ORANGE, 0.08),
                border: '1px dashed',
                borderColor: alpha(ORANGE, 0.3),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Chip
                label="Why Adhyatmah?"
                size="small"
                sx={{
                    position: 'absolute',
                    top: -18,
                    left: '50%',
                    transform: 'translateX(-50%) rotate(-4deg)',
                    bgcolor: ORANGE,
                    color: '#fff',
                    fontWeight: 800,
                    fontStyle: 'italic',
                    fontSize: 12.5,
                    boxShadow: '0 6px 16px rgba(232,119,34,0.35)'
                }}
            />
            <Box
                sx={{
                    width: size * 0.65,
                    height: size * 0.65,
                    borderRadius: '50%',
                    bgcolor: 'background.paper',
                    boxShadow: '0 14px 34px rgba(0,0,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2
                }}
            >
                <Logo branding={branding} width={logoSize} height={logoSize / 2} />
            </Box>
        </Box>
    );
}

// Coordinates (in a 1000x460 unit canvas) for the desktop staggered layout,
// used both to position the cards (as %) and to draw the connector lines.
const DESKTOP_LAYOUT = {
    canvas: { w: 1000, h: 460 },
    circle: { cx: 500, cy: 230, r: 175 },
    cards: [
        { key: 0, left: '4%', top: '6%', width: '27%', anchor: { x: 320, y: 100 } },
        { key: 1, left: '5%', top: '60%', width: '27%', anchor: { x: 330, y: 360 } },
        { key: 2, left: '69%', top: '8%', width: '27%', anchor: { x: 680, y: 110 } },
        { key: 3, left: '68%', top: '58%', width: '27%', anchor: { x: 670, y: 350 } }
    ]
};

function WhyAdhyatmahConnectorLines() {
    const { canvas, circle, cards } = DESKTOP_LAYOUT;
    const paths = cards.map((card) => {
        const dx = circle.cx - card.anchor.x;
        const dy = circle.cy - card.anchor.y;
        const rimX = circle.cx - dx * 0.55;
        const rimY = circle.cy - dy * 0.55;
        return `M${card.anchor.x},${card.anchor.y} Q${(card.anchor.x + rimX) / 2},${(card.anchor.y + rimY) / 2 - 15} ${rimX},${rimY}`;
    });

    return (
        <Box
            component="svg"
            viewBox={`0 0 ${canvas.w} ${canvas.h}`}
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
        >
            {paths.map((d, i) => (
                <path
                    key={i}
                    d={d}
                    fill="none"
                    stroke={alpha(ORANGE, 0.35)}
                    strokeWidth={1.5}
                    strokeDasharray="5 6"
                    strokeLinecap="round"
                />
            ))}
        </Box>
    );
}

function WhyAdhyatmah() {
    const { data: branding } = useQuery({
        queryKey: ['public-branding'],
        queryFn: () => api.getPublicBranding().then((res) => res?.data),
        staleTime: 5 * 60 * 1000
    });

    return (
        <Box sx={{ py: { xs: 5, md: 8 } }}>
            <Stack spacing={1} alignItems="center" textAlign="center" sx={{ mb: { xs: 4, md: 6 } }}>
                <Typography sx={{ fontSize: { xs: 22, md: 30 }, fontWeight: 900, color: 'text.primary' }}>
                    Why <Box component="span" sx={{ color: ORANGE }}>Adhyatmah</Box>
                </Typography>
                <Typography sx={{ fontSize: 14, color: 'text.secondary', maxWidth: 560 }}>
                    Here's what makes Adhyatmah worth building your career with.
                </Typography>
            </Stack>

            {/* ----- Desktop: staggered layout with connector lines (matches reference) ----- */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Box sx={{ position: 'relative', width: '100%', maxWidth: 1100, mx: 'auto', aspectRatio: `${DESKTOP_LAYOUT.canvas.w} / ${DESKTOP_LAYOUT.canvas.h}` }}>
                    <WhyAdhyatmahConnectorLines />

                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 1
                        }}
                    >
                        <WhyAdhyatmahLogoCircle branding={branding} size={220} logoSize={100} />
                    </Box>

                    {DESKTOP_LAYOUT.cards.map((card, i) => (
                        <Box
                            key={card.key}
                            sx={{
                                position: 'absolute',
                                left: card.left,
                                top: card.top,
                                width: card.width,
                                zIndex: 1
                            }}
                        >
                            <WhyAdhyatmahHighlightCard {...WHY_ADHYATMAH[i]} />
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* ----- Mobile: simple stacked layout ----- */}
            <Stack spacing={3} alignItems="center" sx={{ display: { xs: 'flex', md: 'none' } }}>
                <WhyAdhyatmahLogoCircle branding={branding} size={150} logoSize={70} />
                <Grid container spacing={2}>
                    {WHY_ADHYATMAH.map((item) => (
                        <Grid size={{ xs: 12, sm: 6 }} key={item.title}>
                            <WhyAdhyatmahHighlightCard {...item} />
                        </Grid>
                    ))}
                </Grid>
            </Stack>
        </Box>
    );
}

/* ---------------- WHY JOIN US ---------------- */
function WhyJoinUs() {
    return (
        <Box sx={{ py: { xs: 5, md: 7 } }}>
            <Stack spacing={1} alignItems="center" textAlign="center" sx={{ mb: { xs: 3, md: 5 } }}>
                <Typography sx={{ fontSize: { xs: 22, md: 30 }, fontWeight: 900, color: 'text.primary' }}>
                    Why Join <Box component="span" sx={{ color: ORANGE }}>Us</Box>
                </Typography>
                <Typography sx={{ fontSize: 14, color: 'text.secondary', maxWidth: 560 }}>
                    Here's what makes working at Adhyatmah a rewarding experience.
                </Typography>
            </Stack>

            <Grid container spacing={2.5}>
                {WHY_JOIN_US.map((item) => (
                    <Grid size={{ md: 4, sm: 6, xs: 12 }} key={item.title}>
                        <Stack
                            spacing={1.5}
                            sx={{
                                height: '100%',
                                p: 3,
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: 'background.paper',
                                transition: 'all .25s',
                                '&:hover': {
                                    borderColor: 'transparent',
                                    boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                                    transform: 'translateY(-4px)'
                                }
                            }}
                        >
                            <Box
                                sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: alpha(ORANGE, 0.12),
                                    color: ORANGE,
                                    fontSize: 26
                                }}
                            >
                                {item.icon}
                            </Box>
                            <Typography sx={{ fontSize: 16.5, fontWeight: 800, color: 'text.primary' }}>
                                {item.title}
                            </Typography>
                            <Typography sx={{ fontSize: 13.5, color: 'text.secondary', lineHeight: 1.6 }}>
                                {item.description}
                            </Typography>
                        </Stack>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

/* ---------------- JOB CARD ---------------- */
function JobCard({ job }) {
    return (
        <Box
            component={Link}
            href={`/careers/${job.slug}`}
            className="job-card"
            sx={{
                display: 'block',
                height: '100%',
                p: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                textDecoration: 'none',
                transition: 'all .25s',
                '&:hover': {
                    borderColor: 'transparent',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                    transform: 'translateY(-4px)'
                }
            }}
        >
            <Stack spacing={1.5} sx={{ height: '100%' }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                    <Typography sx={{ fontSize: 17, fontWeight: 800, color: 'text.primary' }}>
                        {job.title}
                    </Typography>
                    <Chip
                        label={job.employmentType || 'Full-Time'}
                        size="small"
                        sx={{
                            bgcolor: alpha(ORANGE, 0.12),
                            color: ORANGE_DARK,
                            fontWeight: 700,
                            fontSize: 11,
                            flexShrink: 0
                        }}
                    />
                </Stack>

                <Typography sx={{ fontSize: 13, color: ORANGE, fontWeight: 700 }}>
                    {job.department}
                </Typography>

                <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ pt: 0.5 }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <FiMapPin size={13} color="#9e9e9e" />
                        <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{job.location}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <FiBriefcase size={13} color="#9e9e9e" />
                        <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{job.experience}</Typography>
                    </Stack>
                </Stack>

                <Box sx={{ mt: 'auto !important', pt: 1.5 }}>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: ORANGE,
                            border: '1px solid',
                            borderColor: ORANGE,
                            borderRadius: 999,
                            px: 1.5,
                            py: 0.75,
                            transition: 'all .25s',
                            '& svg': { transition: 'transform 0.3s ease' },
                            '.job-card:hover &': {
                                bgcolor: ORANGE,
                                color: '#fff',
                                '& svg': { transform: 'translateX(3px)' }
                            }
                        }}
                    >
                        View Details
                        <IoArrowForward size={13} />
                    </Box>
                </Box>
            </Stack>
        </Box>
    );
}

function JobCardSkeleton() {
    return (
        <Box sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={1.5}>
                <Skeleton variant="text" width="70%" height={28} />
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="rounded" width={110} height={28} sx={{ mt: 1 }} />
            </Stack>
        </Box>
    );
}

/* ---------------- BOTTOM CTA (take the next step) ---------------- */
function CareersCTA() {
    return (
        <Box
            sx={{
                mt: { xs: 5, md: 7 },
                p: { xs: 4, md: 6 },
                borderRadius: 3,
                bgcolor: ORANGE_TINT,
                textAlign: 'center'
            }}
        >
            <Typography sx={{ fontSize: { xs: 22, md: 32 }, fontWeight: 900, color: CREAM_TEXT }}>
                Take The Next Step In Your{' '}
                <Box component="span" sx={{ color: ORANGE }}>Career</Box>
            </Typography>

            <Box sx={{ width: 90, height: 3, bgcolor: ORANGE, borderRadius: 2, mx: 'auto', my: 2 }} />

            <Typography sx={{ fontSize: { xs: 13.5, md: 15 }, color: CREAM_TEXT_SECONDARY, maxWidth: 620, mx: 'auto', lineHeight: 1.7 }}>
                From building booking experiences to designing pujan kits, help us bring trusted, authentic
                spiritual services to every home across India.
            </Typography>

            <Typography sx={{ fontSize: { xs: 13.5, md: 15 }, color: CREAM_TEXT_SECONDARY, mt: 1 }}>
                Write To Us Today:{' '}
                <Box
                    component="a"
                    href="mailto:info@adhyatmah.com"
                    sx={{ color: ORANGE, fontWeight: 700, textDecoration: 'none' }}
                >
                    info@adhyatmah.com
                </Box>
            </Typography>
        </Box>
    );
}

/* ---------------- MAIN LISTING ---------------- */
function CareersListing() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [search, setSearch] = React.useState(searchParams.get('search') || '');
    const [department, setDepartment] = React.useState(searchParams.get('department') || '');
    const [location, setLocation] = React.useState(searchParams.get('location') || '');

    const page = searchParams.get('page');
    const [currentPage, setCurrentPage] = React.useState(Number(page) || 1);
    const limit = 9;

    const queryString = React.useMemo(() => {
        const params = new URLSearchParams();
        params.set('page', currentPage);
        params.set('limit', limit);
        if (search) params.set('search', search);
        if (department) params.set('department', department);
        if (location) params.set('location', location);
        return `?${params.toString()}`;
    }, [currentPage, search, department, location]);

    const { data, isPending: isLoading } = useQuery({
        queryKey: ['careers-listing', currentPage, search, department, location],
        queryFn: () => api.getCareerJobs(queryString)
    });

    const createQueryString = useCallback(
        (name, value) => {
            const params = new URLSearchParams(searchParams);
            if (value) params.set(name, value);
            else params.delete(name);
            return params.toString();
        },
        [searchParams]
    );

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        router.replace(`${pathname}?${createQueryString('page', value)}`, undefined, { scroll: true });
    };

    React.useEffect(() => {
        setCurrentPage(1);
    }, [search, department, location]);

    const jobs = data?.data || [];
    const total = data?.total || 0;
    const departments = data?.departments || [];
    const locations = data?.locations || [];
    const totalPages = Math.ceil(total / limit) || 1;

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
            <CareersHero />

            <WhyAdhyatmah />

            {/* ---------- OPENINGS ---------- */}
            <Box id="openings" sx={{ pt: 1 }}>
                <Stack spacing={1} sx={{ mb: 3 }}>
                    <Typography sx={{ fontSize: { xs: 22, md: 30 }, fontWeight: 900, color: 'text.primary' }}>
                        Current <Box component="span" sx={{ color: ORANGE }}>Openings</Box>
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                        {total} open {total === 1 ? 'position' : 'positions'} waiting for you.
                    </Typography>
                </Stack>

                {/* Search & Filter Bar */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid size={{ md: 6, xs: 12 }}>
                        <TextField
                            fullWidth
                            placeholder="Search by job title, skill or keyword..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FiSearch size={16} color="#9e9e9e" />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid size={{ md: 3, sm: 6, xs: 6 }}>
                        <TextField
                            select
                            fullWidth
                            label="Job Category"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        >
                            <MenuItem value="">All Job Categories</MenuItem>
                            {departments.map((dept) => (
                                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ md: 3, sm: 6, xs: 6 }}>
                        <TextField
                            select
                            fullWidth
                            label="Location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        >
                            <MenuItem value="">All Locations</MenuItem>
                            {locations.map((loc) => (
                                <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>

                {/* Job Cards */}
                {!isLoading && jobs.length === 0 ? (
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                            No open positions right now
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Try adjusting your search or filters.
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={2.5}>
                        {isLoading
                            ? Array.from({ length: 6 }).map((_, i) => (
                                <Grid size={{ md: 4, sm: 6, xs: 12 }} key={'job-skeleton-' + i}>
                                    <JobCardSkeleton />
                                </Grid>
                            ))
                            : jobs.map((job) => (
                                <Grid size={{ md: 4, sm: 6, xs: 12 }} key={job._id}>
                                    <JobCard job={job} />
                                </Grid>
                            ))
                        }
                    </Grid>
                )}

                {totalPages > 1 && (
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        variant="outlined"
                        shape="rounded"
                        color="primary"
                        sx={{
                            mt: 4,
                            mx: 'auto',
                            '.MuiPagination-ul': { justifyContent: 'center' }
                        }}
                    />
                )}
            </Box>

            {/* ---------- WHY JOIN US (bottom) ---------- */}
            <WhyJoinUs />

            {/* ---------- TAKE THE NEXT STEP CTA ---------- */}
            <CareersCTA />
        </Container>
    );
}

// Suspense boundary: this component reads useSearchParams(); Next.js requires a
// <Suspense> wrapper on statically rendered routes (CSR bailout rule).
export default function CareersListingSuspenseWrapper(props) {
    return (
        <Suspense fallback={null}>
            <CareersListing {...props} />
        </Suspense>
    );
}