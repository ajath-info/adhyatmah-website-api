'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from '@bprogress/next';

// mui
import {
    TableRow,
    Skeleton,
    TableCell,
    Typography,
    Stack,
    IconButton,
    Tooltip,
    Chip
} from '@mui/material';

// icons
import { MdDelete, MdFileDownload } from 'react-icons/md';
import { IoEye } from 'react-icons/io5';

// toast
import toast from 'react-hot-toast';

// api
import * as api from 'src/services';

// utils
import { fDateShort } from '@/utils/format-time';

JobApplicationRow.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    row: PropTypes.object,
    handleClickOpen: PropTypes.func.isRequired
};

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

export default function JobApplicationRow({
    isLoading,
    row,
    handleClickOpen
}) {
    const router = useRouter();

    const handleDownloadResume = async () => {
        try {
            const data = await api.getCareerApplicationResumeUrl(row._id);
            if (data?.url) {
                window.open(data.url, '_blank', 'noopener,noreferrer');
            } else {
                toast.error('Resume not found for this application.');
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                'Failed to open resume. Please try again.'
            );
        }
    };

    return (
        <TableRow hover>

            {/* Candidate */}

            <TableCell component="th" scope="row" sx={{ maxWidth: 260 }}>

                <Typography variant="subtitle2" noWrap>
                    {isLoading ? (
                        <Skeleton width={140} />
                    ) : (
                        row?.name
                    )}
                </Typography>

                {!isLoading && (
                    <Typography variant="caption" color="text.secondary" noWrap component="div">
                        {row?.email}
                    </Typography>
                )}

            </TableCell>

            {/* Job */}

            <TableCell>
                {isLoading ? (
                    <Skeleton variant="text" />
                ) : (
                    row?.job?.title || '—'
                )}
            </TableCell>

            {/* Phone */}

            <TableCell>
                {isLoading ? (
                    <Skeleton variant="text" />
                ) : (
                    row?.phone
                )}
            </TableCell>

            {/* Experience */}

            <TableCell>
                {isLoading ? (
                    <Skeleton variant="text" />
                ) : (
                    row?.experience || '—'
                )}
            </TableCell>

            {/* Status */}

            <TableCell>

                {isLoading ? (
                    <Skeleton />
                ) : (
                    <Chip
                        size="small"
                        label={row?.status}
                        color={getStatusColor(row?.status)}
                    />
                )}

            </TableCell>

            {/* Date */}

            <TableCell>

                {isLoading ? (
                    <Skeleton />
                ) : (
                    fDateShort(row?.createdAt)
                )}

            </TableCell>

            {/* Actions */}

            <TableCell align="right">

                <Stack
                    direction="row"
                    justifyContent="flex-end"
                >

                    {isLoading ? (
                        <>
                            <Skeleton
                                variant="circular"
                                width={34}
                                height={34}
                            />
                            <Skeleton
                                variant="circular"
                                width={34}
                                height={34}
                                sx={{ ml: 1 }}
                            />
                        </>
                    ) : (
                        <>

                            <Tooltip title="View">

                                <IconButton
                                    onClick={() =>
                                        router.push(
                                            `/admin/careers/applications/${row?._id}`
                                        )
                                    }
                                >
                                    <IoEye />
                                </IconButton>

                            </Tooltip>

                            {row?.resume?.url && (
                                <Tooltip title="Download Resume">

                                    <IconButton onClick={handleDownloadResume}>
                                        <MdFileDownload />
                                    </IconButton>

                                </Tooltip>
                            )}

                            <Tooltip title="Delete">

                                <IconButton
                                    onClick={handleClickOpen(
                                        row?._id
                                    )}
                                >
                                    <MdDelete />
                                </IconButton>

                            </Tooltip>

                        </>
                    )}

                </Stack>

            </TableCell>

        </TableRow>
    );
}