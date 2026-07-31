'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from '@bprogress/next';
import { useMutation } from '@tanstack/react-query';

import {
    Box,
    Chip,
    Stack,
    Switch,
    Tooltip,
    TableRow,
    TableCell,
    Typography,
    IconButton,
    Skeleton
} from '@mui/material';

import { styled } from '@mui/material/styles';

import toast from 'react-hot-toast';

import { MdEdit, MdDelete } from 'react-icons/md';

import BlurImage from '@/components/blur-image';

import { fDateShort } from '@/utils/format-time';

import * as api from 'src/services';

ArticleRow.propTypes = {
    row: PropTypes.object,
    isLoading: PropTypes.bool,
    handleClickOpen: PropTypes.func
};

const ThumbImgStyle = styled(Box)(({ theme }) => ({
    width: 60,
    height: 60,
    minWidth: 60,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: theme.shape.borderRadiusSm,
    border: `1px solid ${theme.palette.divider}`,
    marginRight: theme.spacing(2)
}));

export default function ArticleRow({
    row,
    isLoading,
    handleClickOpen
}) {
    const router = useRouter();

    const { mutate: changeStatus } = useMutation({
        mutationFn: api.changeArticleStatusByAdmin,

        onSuccess: (data) => {
            toast.success(data.message);
            router.refresh();
        },

        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                'Something went wrong'
            );
        }
    });

    return (
        <TableRow hover>

            {/* Article */}

            <TableCell>

                <Box
                    display="flex"
                    alignItems="center"
                >

                    {isLoading ? (
                        <Skeleton
                            variant="rectangular"
                            width={60}
                            height={60}
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

                    <Box>

                        <Typography
                            variant="subtitle2"
                            noWrap
                        >
                            {isLoading ? (
                                <Skeleton width={150} />
                            ) : (
                                row?.title
                            )}
                        </Typography>

                        {!isLoading && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {row?.handle}
                            </Typography>
                        )}

                    </Box>

                </Box>

            </TableCell>

            {/* Category */}

            <TableCell>

                {isLoading ? (
                    <Skeleton width={100} />
                ) : (
                    row?.blog?.title
                )}

            </TableCell>

            {/* Status */}

            <TableCell>

                {isLoading ? (
                    <Skeleton width={80} />
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
                                changeStatus(row?._id)
                            }
                        />

                    </Stack>
                )}

            </TableCell>

            {/* Published */}

            <TableCell>

                {isLoading ? (
                    <Skeleton width={100} />
                ) : (
                    fDateShort(row?.publishedAt)
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
                                            `/admin/articles/${row?._id}`
                                        )
                                    }
                                >
                                    <MdEdit />
                                </IconButton>

                            </Tooltip>

                            <Tooltip title="Delete">

                                <IconButton
                                    onClick={handleClickOpen(row?._id)}
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