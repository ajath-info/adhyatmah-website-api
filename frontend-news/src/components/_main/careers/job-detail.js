'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from '@bprogress/next';
import { useQuery } from '@tanstack/react-query';

import {
    Box, Container, Stack, Chip, Typography, Skeleton, Pagination,
    Dialog, DialogTitle, DialogContent, IconButton, Button,
    TextField, InputAdornment, MenuItem, useMediaQuery, alpha
} from '@mui/material';
import {
    FiMapPin, FiBriefcase, FiUsers, FiX, FiArrowLeft, FiSearch, FiClock, FiFileText
} from 'react-icons/fi';

import * as api from 'src/services';
import { fToNow } from 'src/utils/format-time';
import CareerApplyForm from './apply-form';

const ORANGE = '#fb8b05';
const ORANGE_DARK = '#E87722';
const ORANGE_TINT = '#FDF0E6';
// Fixed dark text colors for content sitting on the cream/peach ORANGE_TINT
// background — these blocks stay cream in both light and dark mode, so their
// text must not switch to the theme's (light) dark-mode text color.
const CREAM_TEXT = '#20160b';
const CREAM_TEXT_SECONDARY = 'rgba(32,22,11,0.68)';

const LIST_LIMIT = 8;

// The API doesn't return a human-readable requisition/reference number, only
// the Mongo _id. This derives a stable, unique-looking job reference code
// from that id (same id -> always same code) so every job shows one, in the
// same "ADH100001" style companies use for job req numbers — purely a
// display value, nothing is stored or sent anywhere.
const JOB_ID_BASE = 100000;
function getJobRefCode(id) {
    if (!id) return '';
    const hex = String(id).slice(-6);
    const num = parseInt(hex, 16) % 900000;
    return `ADH${JOB_ID_BASE + num}`;
}

/* ---------------- SHARED BITS ---------------- */
function InfoPill({ icon, label }) {
    return (
        <Stack direction="row" alignItems="center" spacing={0.75}>
            {icon}
            <Typography sx={{ fontSize: 13.5, color: CREAM_TEXT_SECONDARY }}>{label}</Typography>
        </Stack>
    );
}

function ListSection({ title, items }) {
    if (!items?.length) return null;
    return (
        <Stack spacing={1.5} sx={{ mb: 4 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: 'text.primary' }}>{title}</Typography>
            <Stack spacing={1}>
                {items.map((item, i) => (
                    <Stack direction="row" spacing={1.25} key={i} alignItems="center">
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: ORANGE, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 14, color: 'text.secondary', lineHeight: 1.7 }}>{item}</Typography>
                    </Stack>
                ))}
            </Stack>
        </Stack>
    );
}

/* ---------------- LEFT: JOB LIST PANEL ---------------- */
function JobListItemSkeleton() {
    return (
        <Box sx={{ p: 2.25, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Skeleton variant="text" width="70%" height={22} />
            <Skeleton variant="text" width="40%" height={18} />
            <Skeleton variant="text" width="55%" height={16} />
        </Box>
    );
}

function JobListItem({ job, selected, onSelect }) {
    return (
        <Box
            component="button"
            type="button"
            onClick={() => onSelect(job)}
            aria-current={selected ? 'true' : undefined}
            sx={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                appearance: 'none',
                border: 'none',
                borderBottom: '1px solid',
                borderColor: 'divider',
                borderLeft: '3px solid',
                borderLeftColor: selected ? ORANGE : 'transparent',
                bgcolor: selected ? alpha(ORANGE, 0.08) : 'transparent',
                cursor: 'pointer',
                p: 2.25,
                transition: 'background-color .15s',
                '&:hover': { bgcolor: selected ? alpha(ORANGE, 0.1) : alpha(ORANGE, 0.04) },
                '&:focus-visible': { outline: `2px solid ${ORANGE}`, outlineOffset: -2 }
            }}
        >
            <Stack spacing={0.5}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                    <Typography
                        sx={{
                            fontSize: 14.5,
                            fontWeight: 800,
                            color: selected ? ORANGE_DARK : 'text.primary',
                            lineHeight: 1.35
                        }}
                    >
                        {job.title}
                    </Typography>
                    <Chip
                        label={job.employmentType || 'Full-Time'}
                        size="small"
                        sx={{
                            bgcolor: alpha(ORANGE, 0.12),
                            color: ORANGE_DARK,
                            fontWeight: 700,
                            fontSize: 10,
                            height: 20,
                            flexShrink: 0
                        }}
                    />
                </Stack>

                <Typography sx={{ fontSize: 12, color: ORANGE, fontWeight: 700 }}>
                    {job.department}
                </Typography>

                <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1.25} sx={{ pt: 0.25 }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <FiMapPin size={12} color="#9e9e9e" />
                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{job.location}</Typography>
                    </Stack>
                    {job.postedAt && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                            <FiClock size={12} color="#9e9e9e" />
                            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{fToNow(job.postedAt)}</Typography>
                        </Stack>
                    )}
                </Stack>
            </Stack>
        </Box>
    );
}

function JobListPanel({ selectedSlug, onSelect }) {
    const [search, setSearch] = React.useState('');
    const [department, setDepartment] = React.useState('');
    const [location, setLocation] = React.useState('');
    const [page, setPage] = React.useState(1);

    const queryString = React.useMemo(() => {
        const params = new URLSearchParams();
        params.set('page', page);
        params.set('limit', LIST_LIMIT);
        if (search) params.set('search', search);
        if (department) params.set('department', department);
        if (location) params.set('location', location);
        return `?${params.toString()}`;
    }, [page, search, department, location]);

    const { data, isPending: isLoading } = useQuery({
        queryKey: ['careers-split-list', page, search, department, location],
        queryFn: () => api.getCareerJobs(queryString)
    });

    React.useEffect(() => {
        setPage(1);
    }, [search, department, location]);

    const jobs = data?.data || [];
    const total = data?.total || 0;
    const departments = data?.departments || [];
    const locations = data?.locations || [];
    const totalPages = Math.ceil(total / LIST_LIMIT) || 1;

    return (
        <Box
            sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                bgcolor: 'background.paper',
                overflow: 'hidden'
            }}
        >
            {/* Search & Filters */}
            <Stack spacing={1.25} sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: 'text.primary' }}>
                    {total} open {total === 1 ? 'position' : 'positions'}
                </Typography>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search roles..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <FiSearch size={14} color="#9e9e9e" />
                            </InputAdornment>
                        )
                    }}
                />
                <Stack direction="row" spacing={1}>
                    <TextField
                        select
                        fullWidth
                        size="small"
                        label="Department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                    >
                        <MenuItem value="">All Departments</MenuItem>
                        {departments.map((dept) => (
                            <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        fullWidth
                        size="small"
                        label="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    >
                        <MenuItem value="">All Locations</MenuItem>
                        {locations.map((loc) => (
                            <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                        ))}
                    </TextField>
                </Stack>
            </Stack>

            {/* Job list — flows naturally with the page, no inner scrollbar; pagination below handles going past this page's items */}
            <Box>
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <JobListItemSkeleton key={'list-skeleton-' + i} />)
                ) : jobs.length === 0 ? (
                    <Box sx={{ py: 6, px: 2, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                            No open positions found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12.5 }}>
                            Try adjusting your search or filters.
                        </Typography>
                    </Box>
                ) : (
                    jobs.map((job) => (
                        <JobListItem
                            key={job._id}
                            job={job}
                            selected={job.slug === selectedSlug}
                            onSelect={onSelect}
                        />
                    ))
                )}
            </Box>

            {totalPages > 1 && (
                <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(event, value) => setPage(value)}
                        size="small"
                        variant="outlined"
                        shape="rounded"
                        color="primary"
                        sx={{ '.MuiPagination-ul': { justifyContent: 'center' } }}
                    />
                </Box>
            )}
        </Box>
    );
}

/* ---------------- RIGHT: JOB DETAIL PANEL ---------------- */
function DetailSkeleton() {
    return (
        <Box>
            <Skeleton variant="rounded" height={180} sx={{ mb: 3, borderRadius: 3 }} />
            <Skeleton variant="text" width="30%" height={32} />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="80%" />
        </Box>
    );
}

function JobDetailPanel({ slug }) {
    const [applyOpen, setApplyOpen] = React.useState(false);

    const { data, isPending: isLoading, isError } = useQuery({
        queryKey: ['career-job-detail', slug],
        queryFn: () => api.getCareerJobBySlug(slug),
        enabled: Boolean(slug)
    });

    const job = data?.data;

    if (isLoading) return <DetailSkeleton />;

    if (isError || !job) {
        return (
            <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    This job posting is no longer available.
                </Typography>
                <Button component={Link} href="/careers" variant="outlined" sx={{ mt: 2, textTransform: 'none' }}>
                    Browse All Openings
                </Button>
            </Box>
        );
    }

    return (
        <>
            {/* Header */}
            <Box
                sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 3,
                    bgcolor: ORANGE_TINT,
                    mb: 4
                }}
            >
                <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} justifyContent="space-between">
                        <Typography sx={{ fontSize: { xs: 22, md: 30 }, fontWeight: 900, color: CREAM_TEXT }}>
                            {job.title}
                        </Typography>
                        <Chip
                            label={job.employmentType || 'Full-Time'}
                            sx={{ bgcolor: alpha(ORANGE, 0.16), color: ORANGE_DARK, fontWeight: 700, alignSelf: { xs: 'flex-start', sm: 'center' } }}
                        />
                    </Stack>

                    <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: ORANGE }}>
                        {job.department}
                    </Typography>

                    <Stack spacing={1.75}>
                        <Stack direction="row" flexWrap="wrap" gap={2.5}>
                            <InfoPill icon={<FiMapPin size={15} color={ORANGE_DARK} />} label={job.location} />
                            <InfoPill icon={<FiBriefcase size={15} color={ORANGE_DARK} />} label={job.experience} />
                            {Boolean(job.openings) && (
                                <InfoPill icon={<FiUsers size={15} color={ORANGE_DARK} />} label={`${job.openings} opening${job.openings > 1 ? 's' : ''}`} />
                            )}
                        </Stack>

                        {job.postedAt && (
                            <InfoPill icon={<FiClock size={16} color={ORANGE_DARK} />} label={`Posted ${fToNow(job.postedAt)}`} />
                        )}
                        <InfoPill icon={<FiFileText size={16} color={ORANGE_DARK} />} label={getJobRefCode(job._id)} />
                    </Stack>

                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => setApplyOpen(true)}
                        sx={{
                            alignSelf: 'flex-start',
                            bgcolor: ORANGE,
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 4,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: '#d06a1a', boxShadow: 'none' }
                        }}
                    >
                        Apply Now
                    </Button>
                </Stack>
            </Box>

            {job.description && (
                <Stack spacing={1.5} sx={{ mb: 4 }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 800, color: 'text.primary' }}>
                        Job Description
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: 'text.secondary', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                        {job.description}
                    </Typography>
                </Stack>
            )}

            <ListSection title="Responsibilities" items={job.responsibilities} />
            <ListSection title="Requirements" items={job.requirements} />

            {Boolean(job.skills?.length) && (
                <Stack spacing={1.5} sx={{ mb: 4 }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 800, color: 'text.primary' }}>
                        Skills
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                        {job.skills.map((skill, i) => (
                            <Chip
                                key={i}
                                label={skill}
                                size="small"
                                sx={{ bgcolor: alpha(ORANGE, 0.1), color: ORANGE_DARK, fontWeight: 600 }}
                            />
                        ))}
                    </Stack>
                </Stack>
            )}

            <Button
                variant="contained"
                size="large"
                onClick={() => setApplyOpen(true)}
                sx={{
                    bgcolor: ORANGE,
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 4,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#d06a1a', boxShadow: 'none' }
                }}
            >
                Apply Now
            </Button>

            <Dialog open={applyOpen} onClose={() => setApplyOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 800 }}>
                    Apply Now
                    <IconButton onClick={() => setApplyOpen(false)} size="small">
                        <FiX size={18} />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <CareerApplyForm jobId={job._id} jobTitle={job.title} onSuccess={() => setApplyOpen(false)} />
                </DialogContent>
            </Dialog>
        </>
    );
}

/* ---------------- MAIN: SPLIT VIEW ---------------- */
export default function CareerJobDetail({ slug }) {
    const router = useRouter();
    const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const detailRef = React.useRef(null);

    // `selectedSlug` drives which job's details render on the right. It starts
    // from the route param (so direct/shared job URLs open the right job) and
    // stays in sync if the URL changes from elsewhere (back/forward, or a
    // direct Link from outside this component).
    const [selectedSlug, setSelectedSlug] = React.useState(slug);

    React.useEffect(() => {
        setSelectedSlug(slug);
    }, [slug]);

    const handleSelectJob = (job) => {
        if (!job?.slug || job.slug === selectedSlug) return;

        // Update the right panel immediately (no page reload/navigation wait),
        // then sync the URL in the background so the link stays shareable and
        // browser back/forward keeps working.
        setSelectedSlug(job.slug);
        router.push(`/careers/${job.slug}`, undefined, { scroll: false });

        if (isMobile) {
            requestAnimationFrame(() => {
                detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
            <Button
                component={Link}
                href="/careers"
                startIcon={<FiArrowLeft size={16} />}
                sx={{ textTransform: 'none', color: 'text.secondary', mb: 2, fontWeight: 600 }}
            >
                Back to all openings
            </Button>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'flex-start',
                    gap: { xs: 3, md: 3.5 }
                }}
            >
                {/* Left: job list */}
                <Box sx={{ width: { xs: '100%', md: 360 }, flexShrink: 0, position: { md: 'sticky' }, top: { md: 24 } }}>
                    <JobListPanel selectedSlug={selectedSlug} onSelect={handleSelectJob} />
                </Box>

                {/* Right: selected job detail */}
                <Box ref={detailRef} sx={{ flex: 1, minWidth: 0, width: '100%', scrollMarginTop: 90 }}>
                    <JobDetailPanel slug={selectedSlug} />
                </Box>
            </Box>
        </Container>
    );
}