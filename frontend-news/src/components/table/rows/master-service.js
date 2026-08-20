'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from '@bprogress/next';

// mui
import { styled } from '@mui/material/styles';
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

// components
import BlurImage from '@/components/blur-image';

// utils
import { fDateShort } from '@/utils/format-time';
import { useSelector } from '@/redux';
import { useCurrencyFormat } from '@/hooks/use-currency-format';

MasterServiceRow.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    row: PropTypes.object,
    handleClickOpen: PropTypes.func.isRequired
};

const ThumbImgStyle = styled(Box)(({ theme }) => ({
    width: 50,
    height: 50,
    minWidth: 50,
    objectFit: 'cover',
    background: theme.palette.background.default,
    marginRight: theme.spacing(2),
    border: '1px solid ' + theme.palette.divider,
    borderRadius: theme.shape.borderRadiusSm,
    position: 'relative',
    overflow: 'hidden'
}));

export default function MasterServiceRow({
    isLoading,
    row,
    handleClickOpen
}) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { currency } = useSelector((state) => state.settings);
    const fCurrency = useCurrencyFormat('base');

    // confirmation popup state (only used when deactivating a service)
    const [confirmOpen, setConfirmOpen] = useState(false);

    const { mutate: changeStatus, isPending: isStatusChanging } = useMutation({
        mutationFn: api.toggleMasterServiceStatusByAdmin,

        onSuccess: (data) => {
            toast.success(data.message);
            // refetch the master services list so the updated status
            // shows up immediately, without needing a hard refresh
            queryClient.invalidateQueries({ queryKey: ['master-services'] });
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
        // ask for confirmation only when turning an active service inactive
        if (row?.status === 'active') {
            setConfirmOpen(true);
        } else {
            changeStatus(row?.slug);
        }
    };

    const handleConfirmInactive = () => {
        changeStatus(row?.slug);
    };

    return (
        <TableRow hover>

            {/* Service */}

            <TableCell>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >

                    {isLoading ? (
                        <Skeleton
                            variant="rectangular"
                            width={50}
                            height={50}
                            sx={{ borderRadius: 1 }}
                        />
                    ) : (
                        <ThumbImgStyle>

                            <BlurImage
                                fill
                                priority
                                objectFit="cover"
                                alt={row?.name}
                                src={row?.image?.url}
                            />

                        </ThumbImgStyle>
                    )}

                    <Typography
                        variant="subtitle2"
                        noWrap
                        sx={{ ml: 2 }}
                    >
                        {isLoading ? (
                            <Skeleton width={120} />
                        ) : (
                            row?.name
                        )}
                    </Typography>

                </Box>

            </TableCell>

            {/* Price */}

            <TableCell>
                {isLoading ? (
                    <Skeleton variant="text" />
                ) : (
                    fCurrency(row?.price, currency)
                )}
            </TableCell>

            {/* Duration */}

            <TableCell>
                {isLoading ? (
                    <Skeleton variant="text" />
                ) : (
                    row?.duration
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
                            label={
                                row?.status === 'active'
                                    ? 'Active'
                                    : 'Inactive'
                            }
                            color={
                                row?.status === 'active'
                                    ? 'success'
                                    : 'error'
                            }
                        />

                        <Switch
                            checked={row?.status === 'active'}
                            onChange={handleStatusToggle}
                        />

                    </Stack>
                )}

            </TableCell>

            {/* Confirm before inactivating a service */}

            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                maxWidth="xs"
            >

                <DialogTitle>
                    Inactivate Service
                </DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to inactivate this service?
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
                        Yes, Inactivate
                    </Button>

                </DialogActions>

            </Dialog>

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

                            <Tooltip title="Edit">

                                <IconButton
                                    onClick={() =>
                                        router.push(
                                            `/admin/master-services/${row?.slug}`
                                        )
                                    }
                                >
                                    <MdEdit />
                                </IconButton>

                            </Tooltip>

                            <Tooltip title="Delete">

                                <IconButton
                                    onClick={handleClickOpen(
                                        row?.slug
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