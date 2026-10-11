import PropTypes from 'prop-types';
import { useState } from 'react';
import Link from '@/utils/link';
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
    FormControl,
    Select,
    MenuItem
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// components
import BlurImage from '@/components/blur-image';

// icons
import { IoEye } from 'react-icons/io5';

// api
import * as api from 'src/services';

// Statuses the admin can set from this page for a seller shop.
const STATUS_OPTIONS = [
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'inactive', label: 'Inactive' }
];

// Chip styling per status. Anything not listed here (e.g. "in review",
// "action required", "blocked" — used by the Pandit flow) falls back to the
// Pending look so this view never breaks on an unexpected value.
const STATUS_CHIP = {
    approved: { label: 'Active', bgcolor: 'success.light', color: 'success.dark' },
    pending: { label: 'Pending', bgcolor: 'info.light', color: 'info.dark' },
    rejected: { label: 'Rejected', bgcolor: 'error.light', color: 'error.dark' },
    inactive: { label: 'Inactive', bgcolor: 'grey.300', color: 'grey.800' }
};

// A pending seller shop shows "Pending"; the admin can move a shop to
// Approved, Rejected, or Inactive from the dropdown in the Actions column.
// This only relabels/extends the existing status values for this view — the
// underlying Shop.status field and the Pandit approval flow are untouched.
export default function ProductShopRow({ isLoading, row, apicall }) {
    const queryClient = useQueryClient();
    const [updating, setUpdating] = useState(false);
    const currentStatus = row?.status;
    const chip = STATUS_CHIP[currentStatus] || STATUS_CHIP.pending;

    const { mutate: changeStatus } = useMutation({
        mutationFn: (status) => api.updateShopStatusByAdmin({ slug: row?.slug, status }),
        onMutate: () => setUpdating(true),
        onSuccess: (_data, status) => {
            const label = STATUS_OPTIONS.find((o) => o.value === status)?.label || status;
            toast.success(`Shop marked as ${label}`);
            queryClient.invalidateQueries({ queryKey: ['admin-product-shops'] });
            apicall?.((prev) => !prev);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to update shop status');
        },
        onSettled: () => setUpdating(false)
    });

    return (
        <TableRow hover key={Math.random()}>
            <TableCell component="th" scope="row" sx={{ maxWidth: 300 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {isLoading ? (
                        <Skeleton variant="rectangular" width={50} height={50} sx={{ borderRadius: 1 }} />
                    ) : (
                        <Box
                            sx={{
                                position: 'relative',
                                overflow: 'hidden',
                                width: 50,
                                height: 50,
                                bgcolor: 'background.default',
                                mr: 2,
                                border: (theme) => '1px solid ' + theme.palette.divider,
                                borderRadius: '6px',
                                img: { borderRadius: '2px' }
                            }}
                        >
                            {/* Product-seller shops have no shop-logo upload of their own yet —
                                fall back to the vendor's profile photo (Settings → cover) so this
                                box doesn't sit empty once the vendor has uploaded one. */}
                            {(row?.logo?.url || row?.vendor?.cover?.url) && (
                                <BlurImage
                                    alt={row?.name}
                                    src={row?.logo?.url || row?.vendor?.cover?.url}
                                    layout="fill"
                                    objectFit="cover"
                                />
                            )}
                        </Box>
                    )}
                    <Typography variant="subtitle2" noWrap>
                        {isLoading ? <Skeleton variant="text" width={120} sx={{ ml: 1 }} /> : row?.name}
                    </Typography>
                </Box>
            </TableCell>
            <TableCell align="left">
                {isLoading ? (
                    <Skeleton variant="text" width={100} />
                ) : (
                    `${row?.vendor?.firstName || ''} ${row?.vendor?.lastName || ''}`
                )}
            </TableCell>
            <TableCell>{isLoading ? <Skeleton variant="text" /> : row?.products?.length || 0}</TableCell>
            <TableCell>
                {isLoading ? (
                    <Skeleton variant="text" />
                ) : (
                    <Chip
                        size="small"
                        label={chip.label}
                        sx={{
                            bgcolor: chip.bgcolor,
                            color: chip.color
                        }}
                    />
                )}
            </TableCell>
            <TableCell align="right">
                {isLoading ? (
                    <Stack direction="row" justifyContent="flex-end">
                        <Skeleton variant="circular" width={34} height={34} />
                    </Stack>
                ) : (
                    <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                        <FormControl size="small" sx={{ minWidth: 130 }} disabled={updating}>
                            <Select
                                displayEmpty
                                value={STATUS_OPTIONS.some((o) => o.value === currentStatus) ? currentStatus : ''}
                                onChange={(e) => changeStatus(e.target.value)}
                            >
                                <MenuItem value="" disabled>
                                    Change status
                                </MenuItem>
                                {STATUS_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Tooltip title="View shop details">
                            <Link href={`/admin/shops/${row?.slug}`}>
                                <IconButton>
                                    <IoEye />
                                </IconButton>
                            </Link>
                        </Tooltip>
                    </Stack>
                )}
            </TableCell>
        </TableRow>
    );
}

ProductShopRow.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    row: PropTypes.object,
    apicall: PropTypes.func
};