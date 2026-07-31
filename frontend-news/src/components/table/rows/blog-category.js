'use client';

import React from 'react';
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
    Switch
} from '@mui/material';

// react-query
import { useMutation } from '@tanstack/react-query';

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

BlogCategory.propTypes = {
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

export default function BlogCategory({
    isLoading,
    row,
    handleClickOpen
}) {
    const router = useRouter();

    const { mutate: changeStatus } = useMutation({
        mutationFn: api.changeBlogStatusByAdmin,

        onSuccess: (data) => {
            toast.success(data.message);
            router.refresh();
        },

        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                'Something went wrong!'
            );
        }
    });

    return (
        <TableRow hover>

            {/* Category */}

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
                                alt={row?.title}
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
                            row?.title
                        )}
                    </Typography>

                </Box>

            </TableCell>

            {/* Description */}

            <TableCell>

                {isLoading ? (
                    <Skeleton />
                ) : (
                    row?.description?.slice(0, 80)
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
                                row?.status
                                    ? 'Active'
                                    : 'Inactive'
                            }
                            color={
                                row?.status
                                    ? 'success'
                                    : 'error'
                            }
                        />

                        <Switch
                            checked={row?.status}
                            onChange={() =>
                                changeStatus(row?.handle)
                            }
                        />

                    </Stack>
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

                            <Tooltip title="Edit">

                                <IconButton
                                    onClick={() =>
                                        router.push(
                                            `/admin/blog-categories/${row?.handle}`
                                        )
                                    }
                                >
                                    <MdEdit />
                                </IconButton>

                            </Tooltip>

                            <Tooltip title="Delete">

                                <IconButton
                                    onClick={handleClickOpen(
                                        row?.handle
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