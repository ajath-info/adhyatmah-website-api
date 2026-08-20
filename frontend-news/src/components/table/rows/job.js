'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from '@bprogress/next';

// mui
import {
    Box,
    TableRow,
    Skeleton,
    TableCell,
    Typography,
    Stack,
    IconButton,
    Tooltip,
    Chip,
    Switch,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button
} from '@mui/material';

// react-query
import { useMutation, useQueryClient } from '@tanstack/react-query';

// toast
import toast from 'react-hot-toast';

// api
import * as api from 'src/services';

// icons
import { MdEdit, MdDelete } from 'react-icons/md';

// utils
import { fDateShort } from '@/utils/format-time';

JobRow.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    row: PropTypes.object,
    handleClickOpen: PropTypes.func.isRequired
};

export default function JobRow({
    isLoading,
    row,
    handleClickOpen
}) {
    const router = useRouter();
    const queryClient = useQueryClient();

    // confirmation popup state (only used when deactivating a job)
    const [confirmOpen, setConfirmOpen] = useState(false);

    const { mutate: changeStatus, isPending: isStatusChanging } = useMutation({
        mutationFn: api.changeCareerJobStatusByAdmin,

        onSuccess: (data) => {
            toast.success(data.message);
            // refetch the jobs list so the updated status shows up immediately
            queryClient.invalidateQueries({ queryKey: ['career-jobs'] });
            router.refresh();
        },

        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                'Something went wrong!'
            );
        },

        onSettled: () => {
            setConfirmOpen(false);
        }
    });

    const handleStatusToggle = () => {
        // ask for confirmation only when turning an active job inactive
        if (row?.status) {
            setConfirmOpen(true);
        } else {
            changeStatus(row?._id);
        }
    };

    const handleConfirmInactive = () => {
        changeStatus(row?._id);
    };

    return (
        <TableRow hover>

            {/* Job */}

            <TableCell component="th" scope="row" sx={{ maxWidth: 260 }}>

                <Typography variant="subtitle2" noWrap>
                    {isLoading ? (
                        <Skeleton width={160} />
                    ) : (
                        row?.title
                    )}
                </Typography>

                {!isLoading && (
                    <Typography variant="caption" color="text.secondary" noWrap component="div">
                        {row?.employmentType}
                    </Typography>
                )}

            </TableCell>

            {/* Department */}

            <TableCell>
                {isLoading ? (
                    <Skeleton variant="text" />
                ) : (
                    row?.department
                )}
            </TableCell>

            {/* Location */}

            <TableCell>
                {isLoading ? (
                    <Skeleton variant="text" />
                ) : (
                    row?.location
                )}
            </TableCell>

            {/* Applications */}

            <TableCell align="center">
                {isLoading ? (
                    <Skeleton variant="text" />
                ) : (
                    <Chip
                        size="small"
                        label={row?.applicationsCount || 0}
                        onClick={() =>
                            router.push(`/admin/careers/applications?job=${row?._id}`)
                        }
                        sx={{ cursor: 'pointer' }}
                    />
                )}
            </TableCell>

            {/* Status */}

            <TableCell>

                {isLoading ? (
                    <Skeleton />
                ) : (
                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                    >

                        <Chip
                            size="small"
                            label={row?.status ? 'Active' : 'Inactive'}
                            color={row?.status ? 'success' : 'error'}
                        />

                        <Switch
                            checked={Boolean(row?.status)}
                            onChange={handleStatusToggle}
                        />

                    </Stack>
                )}

            </TableCell>

            {/* Confirm before inactivating a job */}

            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                maxWidth="xs"
            >

                <DialogTitle>
                    Deactivate Job
                </DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to deactivate this job? It will stop showing on the public Careers page.
                    </DialogContentText>
                </DialogContent>

                <DialogActions>

                    <Button onClick={() => setConfirmOpen(false)}>
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        loading={isStatusChanging}
                        onClick={handleConfirmInactive}
                    >
                        Yes, Deactivate
                    </Button>

                </DialogActions>

            </Dialog>

            {/* Date */}

            <TableCell>

                {isLoading ? (
                    <Skeleton />
                ) : (
                    fDateShort(row?.postedAt || row?.createdAt)
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

                            <Tooltip title="Edit">

                                <IconButton
                                    onClick={() =>
                                        router.push(
                                            `/admin/careers/jobs/${row?._id}`
                                        )
                                    }
                                >
                                    <MdEdit />
                                </IconButton>

                            </Tooltip>

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