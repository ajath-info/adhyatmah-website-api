'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from '@bprogress/next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { styled } from '@mui/material/styles';
import { Box, TableRow, Skeleton, TableCell, Typography, Stack, IconButton, Tooltip, Chip, Switch, Dialog, DialogTitle, DialogContent, Grid } from '@mui/material';
import { MdEdit, MdDelete, MdVisibility } from 'react-icons/md';

import * as api from 'src/services';
import BlurImage from '@/components/blur-image';
import ComboCard from '@/components/cards/combo';
import { useSelector } from '@/redux';
import { useCurrencyFormat } from '@/hooks/use-currency-format';

PujaComboRow.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    row: PropTypes.object,
    handleClickOpen: PropTypes.func.isRequired
};

const ThumbImgStyle = styled(Box)(({ theme }) => ({
    width: 50,
    height: 50,
    minWidth: 50,
    background: theme.palette.background.default,
    marginRight: theme.spacing(2),
    border: '1px solid ' + theme.palette.divider,
    borderRadius: theme.shape.borderRadiusSm,
    position: 'relative',
    overflow: 'hidden'
}));

export default function PujaComboRow({ isLoading, row, handleClickOpen }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { currency } = useSelector((state) => state.settings);
    const fCurrency = useCurrencyFormat('base');
    const [previewOpen, setPreviewOpen] = useState(false);

    const archived = row?.status === 'archived';
    const imageUrl = row?.images?.[0]?.url || row?.masterService?.image?.url;

    const refresh = () => queryClient.invalidateQueries({ queryKey: ['puja-combos'] });
    const onError = (error) => toast.error(error?.response?.data?.message || 'Something went wrong!');

    const { mutate: toggleStatus } = useMutation({
        mutationFn: api.togglePujaComboStatusByAdmin,
        onSuccess: (d) => { toast.success(d.message); refresh(); },
        onError
    });
    const { mutate: toggleFeatured } = useMutation({
        mutationFn: api.togglePujaComboFeaturedByAdmin,
        onSuccess: (d) => { toast.success(d.message); refresh(); },
        onError
    });

    const { data: preview, isPending: previewLoading } = useQuery({
        queryKey: ['puja-combo-preview', row?.slug, previewOpen],
        queryFn: () => api.getPujaComboPreviewByAdmin(row.slug),
        enabled: previewOpen && !!row?.slug,
        gcTime: 0
    });

    const cell = (content) => (isLoading ? <Skeleton variant="text" /> : content);

    return (
        <TableRow hover>
            <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {isLoading ? (
                        <Skeleton variant="rectangular" width={50} height={50} sx={{ borderRadius: 1 }} />
                    ) : (
                        <ThumbImgStyle>{imageUrl && <BlurImage fill priority objectFit="cover" alt={row?.name} src={imageUrl} />}</ThumbImgStyle>
                    )}
                    <Typography variant="subtitle2" noWrap sx={{ ml: 2, maxWidth: 220 }}>
                        {cell(row?.name)}
                    </Typography>
                </Box>
            </TableCell>

            <TableCell>{cell(row?.masterService?.name)}</TableCell>
            <TableCell>{cell((row?.kits?.length ? row.kits : row?.kit ? [row.kit] : []).map((k) => k?.name).filter(Boolean).join(' + ') || undefined)}</TableCell>
            <TableCell>{cell(fCurrency(row?.comboPrice, currency))}</TableCell>
            <TableCell>
                {cell(row?.discountAmount > 0 ? `${fCurrency(row.discountAmount, currency)} (${row.discountPercent}%)` : '—')}
            </TableCell>

            <TableCell>
                {isLoading ? (
                    <Skeleton />
                ) : (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                            size="small"
                            label={row?.status === 'active' ? 'Active' : row?.status === 'archived' ? 'Archived' : 'Inactive'}
                            color={row?.status === 'active' ? 'success' : row?.status === 'archived' ? 'default' : 'error'}
                        />
                        <Switch checked={row?.status === 'active'} disabled={archived} onChange={() => toggleStatus(row?.slug)} />
                    </Stack>
                )}
            </TableCell>

            <TableCell>
                {isLoading ? (
                    <Skeleton />
                ) : (
                    <Switch checked={!!row?.isFeatured} disabled={archived} onChange={() => toggleFeatured(row?.slug)} />
                )}
            </TableCell>

            <TableCell align="right">
                <Stack direction="row" justifyContent="flex-end">
                    {isLoading ? (
                        <Skeleton variant="circular" width={34} height={34} />
                    ) : (
                        <>
                            <Tooltip title="View / Preview">
                                <IconButton onClick={() => setPreviewOpen(true)}><MdVisibility /></IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                                <span>
                                    <IconButton disabled={archived} onClick={() => router.push(`/admin/puja-combos/${row?.slug}`)}><MdEdit /></IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title="Archive">
                                <span>
                                    <IconButton disabled={archived} onClick={handleClickOpen(row?.slug)}><MdDelete /></IconButton>
                                </span>
                            </Tooltip>
                        </>
                    )}
                </Stack>
            </TableCell>

            <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Preview: {row?.name}</DialogTitle>
                <DialogContent>
                    {previewLoading ? (
                        <Skeleton variant="rounded" height={320} />
                    ) : preview?.data ? (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 5 }}>
                                <ComboCard combo={preview.data} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 7 }}>
                                <Stack spacing={1}>
                                    <Typography variant="body2" color="text.secondary">{preview.data.shortDescription}</Typography>
                                    <Typography variant="body2">Eligible Pandits: {preview.data.panditCount}</Typography>
                                    <Typography variant="body2">Original total: {fCurrency(preview.data.originalPrice, currency)}</Typography>
                                    <Typography variant="body2">Kit stock: {preview.data.kit?.inStock ? 'In stock' : 'Out of stock'}</Typography>
                                    {preview.data.status !== 'active' && (
                                        <Typography variant="caption" color="warning.main">This combo is not public (status: {preview.data.status}).</Typography>
                                    )}
                                    {preview.data.panditCount === 0 && (
                                        <Typography variant="caption" color="error">No eligible Pandit available, so this combo will stay hidden from the website.</Typography>
                                    )}
                                    {preview.data.status === 'active' && (
                                        <Typography variant="caption">
                                            Public page: <a href={`/puja-combos/${preview.data.slug}`} target="_blank" rel="noreferrer">/puja-combos/{preview.data.slug}</a>
                                        </Typography>
                                    )}
                                </Stack>
                            </Grid>
                        </Grid>
                    ) : (
                        <Typography>Preview not available.</Typography>
                    )}
                </DialogContent>
            </Dialog>
        </TableRow>
    );
}