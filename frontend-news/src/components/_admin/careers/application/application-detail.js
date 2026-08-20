'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from '@bprogress/next';
import Link from 'next/link';

// mui
import {
    Card,
    Stack,
    Typography,
    Box,
    Select,
    Grid,
    Skeleton,
    Chip,
    Divider,
    Button,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';

// react-query
import { useMutation, useQueryClient } from '@tanstack/react-query';

// toast
import toast from 'react-hot-toast';

// api
import * as api from 'src/services';

// icons
import { MdFileDownload } from 'react-icons/md';
import { FiLinkedin, FiGlobe } from 'react-icons/fi';

// utils
import { fDateShort } from '@/utils/format-time';

ApplicationDetail.propTypes = {
    data: PropTypes.object,
    isLoading: PropTypes.bool
};

const STATUS_OPTIONS = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

const getStatusColor = (status) => {
    switch (status) {
        case 'Applied':
            return 'info';
        case 'Shortlisted':
            return 'secondary';
        case 'Interview':
            return 'warning';
        case 'Selected':
            return 'success';
        case 'Rejected':
            return 'error';
        default:
            return 'default';
    }
};

function Field({ label, value, loading }) {
    return (
        <Stack gap={0.5}>
            {loading ? (
                <Skeleton variant="text" width={80} />
            ) : (
                <Typography variant="overline" color="text.secondary">
                    {label}
                </Typography>
            )}
            {loading ? (
                <Skeleton variant="text" width={160} />
            ) : (
                <Typography variant="body2">
                    {value || '—'}
                </Typography>
            )}
        </Stack>
    );
}
Field.propTypes = {
    label: PropTypes.string,
    value: PropTypes.node,
    loading: PropTypes.bool
};

export default function ApplicationDetail({
    data: application,
    isLoading
}) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { mutate: downloadResume, isPending: isResumeLoading } = useMutation({
        mutationFn: api.getCareerApplicationResumeUrl,

        onSuccess: (data) => {
            if (data?.url) {
                window.open(data.url, '_blank', 'noopener,noreferrer');
            } else {
                toast.error('Resume not found for this application.');
            }
        },

        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                'Failed to open resume. Please try again.'
            );
        }
    });

    const handleDownloadResume = () => {
        downloadResume(application._id);
    };

    const { mutate: changeStatus, isPending: isStatusChanging } = useMutation({
        mutationFn: api.updateCareerApplicationStatusByAdmin,

        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({ queryKey: ['career-application', application?._id] });
            queryClient.invalidateQueries({ queryKey: ['career-applications'] });
            router.refresh();
        },

        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                'Something went wrong!'
            );
        }
    });

    const handleStatusChange = (event) => {
        changeStatus({ id: application._id, status: event.target.value });
    };

    return (
        <Box position="relative">
            <Grid container spacing={2}>
                <Grid size={{ md: 8, xs: 12 }}>
                    <Card sx={{ p: 3 }}>
                        <Stack spacing={3}>

                            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                                {isLoading ? (
                                    <Skeleton variant="text" width={180} />
                                ) : (
                                    <Typography variant="h6">
                                        {application?.name}
                                    </Typography>
                                )}

                                {isLoading ? (
                                    <Skeleton variant="rounded" width={90} height={28} />
                                ) : (
                                    <Chip
                                        label={application?.status}
                                        color={getStatusColor(application?.status)}
                                    />
                                )}
                            </Stack>

                            <Divider />

                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Field label="Email" value={application?.email} loading={isLoading} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Field label="Phone" value={application?.phone} loading={isLoading} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Field label="Experience" value={application?.experience} loading={isLoading} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Field
                                        label="Applied For"
                                        value={
                                            application?.job?.slug ? (
                                                <Link href={`/careers/${application.job.slug}`} target="_blank">
                                                    {application.job.title}
                                                </Link>
                                            ) : (
                                                application?.job?.title
                                            )
                                        }
                                        loading={isLoading}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Field label="Applied On" value={!isLoading && fDateShort(application?.createdAt)} loading={isLoading} />
                                </Grid>
                            </Grid>

                            <Divider />

                            <Stack gap={0.5}>
                                {isLoading ? (
                                    <Skeleton variant="text" width={100} />
                                ) : (
                                    <Typography variant="overline" color="text.secondary">
                                        Cover Letter
                                    </Typography>
                                )}
                                {isLoading ? (
                                    <Skeleton variant="rounded" width="100%" height={100} />
                                ) : (
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {application?.coverLetter || 'No cover letter provided.'}
                                    </Typography>
                                )}
                            </Stack>

                        </Stack>
                    </Card>
                </Grid>

                <Grid size={{ md: 4, xs: 12 }}>
                    <Stack spacing={3}>
                        <Card sx={{ p: 3 }}>
                            <Stack spacing={3}>
                                <FormControl fullWidth>
                                    {isLoading ? (
                                        <Skeleton variant="rounded" width="100%" height={56} />
                                    ) : (
                                        <>
                                            <InputLabel id="application-status-label">Status</InputLabel>
                                            <Select
                                                labelId="application-status-label"
                                                label="Status"
                                                value={application?.status || 'Applied'}
                                                onChange={handleStatusChange}
                                                disabled={isStatusChanging}
                                            >
                                                {STATUS_OPTIONS.map((status) => (
                                                    <MenuItem key={status} value={status}>
                                                        {status}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </>
                                    )}
                                </FormControl>
                                <Typography variant="caption" color="text.secondary">
                                    Applied → Shortlisted → Interview → Selected / Rejected
                                </Typography>
                            </Stack>
                        </Card>

                        <Card sx={{ p: 3 }}>
                            <Stack spacing={2}>
                                {isLoading ? (
                                    <Skeleton variant="rounded" width="100%" height={48} />
                                ) : (
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<MdFileDownload />}
                                        onClick={handleDownloadResume}
                                        disabled={!application?.resume?.url || isResumeLoading}
                                    >
                                        {isResumeLoading ? 'Please wait...' : 'Download Resume'}
                                    </Button>
                                )}

                                {!isLoading && application?.linkedin && (
                                    <Button
                                        variant="outlined"
                                        startIcon={<FiLinkedin />}
                                        component="a"
                                        href={application.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        LinkedIn Profile
                                    </Button>
                                )}

                                {!isLoading && application?.portfolio && (
                                    <Button
                                        variant="outlined"
                                        startIcon={<FiGlobe />}
                                        component="a"
                                        href={application.portfolio}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Portfolio / GitHub
                                    </Button>
                                )}
                            </Stack>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}