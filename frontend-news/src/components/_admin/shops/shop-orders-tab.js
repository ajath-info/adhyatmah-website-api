'use client';

import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import { Box, Card, CardHeader, Table, TableBody, TableContainer, TableHead, TableRow, TableCell, Typography, Skeleton, Chip, IconButton, Tooltip, Stack, Button } from '@mui/material';
import MuiPagination from '@mui/material/Pagination';
import { IoEye } from 'react-icons/io5';
import Link from '@/utils/link';
import { fDateShort } from '@/utils/format-time';
import { useCurrencyFormat } from '@/hooks/use-currency-format';
import * as api from 'src/services';

const TABLE_HEAD = [
    { id: 'orderNo', label: 'Order No' },
    { id: 'customer', label: 'Customer' },
    { id: 'createdAt', label: 'Date' },
    { id: 'items', label: 'Items' },
    { id: 'payment', label: 'Paid Via' },
    { id: 'status', label: 'Status' },
    { id: 'total', label: 'Total' },
    { id: 'actions', label: 'Actions', align: 'right' }
];

const getStatusColor = (status) => {
    switch (status) {
        case 'delivered':
            return 'success';
        case 'on-the-way':
            return 'warning';
        case 'pending':
            return 'info';
        case 'canceled':
        case 'returned':
            return 'error';
        default:
            return 'default';
    }
};

// Same row shape as AdminUserOrderRow (src/components/_admin/users/admin-user-order-row.js),
// plus the Customer column — kept as its own component instead of editing
// the shared one, since that one is also used for a single user's own
// order history (where repeating their name on every row would be noise).
function ShopOrderRow({ isLoading, row }) {
    const fCurrency = useCurrencyFormat('custom', row?.currency);
    const itemsCount = row?.items?.length || 0;
    const customerName =
        row?.user?.firstName || row?.user?.lastName
            ? `${row?.user?.firstName || ''} ${row?.user?.lastName || ''}`.trim()
            : '—';

    return (
        <TableRow hover>
            <TableCell>{isLoading ? <Skeleton width={100} /> : <Typography variant="body2">{row?.orderNo || '—'}</Typography>}</TableCell>
            <TableCell>{isLoading ? <Skeleton width={100} /> : customerName}</TableCell>
            <TableCell>{isLoading ? <Skeleton width={90} /> : fDateShort(row?.createdAt)}</TableCell>
            <TableCell>{isLoading ? <Skeleton width={70} /> : `${itemsCount} item${itemsCount > 1 ? 's' : ''}`}</TableCell>
            <TableCell>
                {isLoading ? (
                    <Skeleton width={90} />
                ) : row?.paymentMethod === 'COD' ? (
                    'Cash on delivery'
                ) : (
                    row?.paymentMethod || '—'
                )}
            </TableCell>
            <TableCell>
                {isLoading ? <Skeleton width={80} /> : <Chip size="small" label={row?.status} color={getStatusColor(row?.status)} />}
            </TableCell>
            <TableCell>{isLoading ? <Skeleton width={80} /> : fCurrency(row?.total)}</TableCell>
            <TableCell align="right">
                {isLoading ? (
                    <Skeleton variant="circular" width={34} height={34} sx={{ ml: 'auto' }} />
                ) : (
                    <Stack direction="row" justifyContent="flex-end">
                        <Tooltip title="View">
                            <IconButton component={Link} href={`/admin/orders/${row?._id}`} size="small">
                                <IoEye />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                )}
            </TableCell>
        </TableRow>
    );
}

ShopOrderRow.propTypes = { isLoading: PropTypes.bool, row: PropTypes.object };

export default function ShopOrdersTab({ slug, embedded = false }) {
    const [page, setPage] = useState(1);

    const { data, isPending: isLoading, isError, refetch } = useQuery({
        queryKey: ['shop-orders-by-admin', slug, page],
        queryFn: () => api.getOrdersByAdmin(`shop=${slug}&page=${page}&limit=5`),
        enabled: !!slug,
        retry: 1
    });

    const orders = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);
    const totalPages = data?.count || 1;

    const content = (
        <>
            {isError ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="error" mb={2}>
                        Failed to load orders.
                    </Typography>
                    <Button variant="contained" onClick={() => refetch()}>
                        Retry
                    </Button>
                </Box>
            ) : (
                <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {TABLE_HEAD.map((col) => (
                                    <TableCell key={col.id} align={col.align || 'left'}>
                                        {col.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading &&
                                [...Array(3)].map((_, index) => <ShopOrderRow key={`skeleton-${index}`} isLoading />)}
                            {!isLoading && orders.map((order) => <ShopOrderRow key={order._id} row={order} />)}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {!isLoading && !isError && orders.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No orders placed for this shop&apos;s products yet.</Typography>
                </Box>
            )}

            {!isLoading && !isError && totalPages > 1 && (
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                    <MuiPagination
                        page={page}
                        count={totalPages}
                        onChange={(_, value) => setPage(value)}
                        variant="outlined"
                        shape="rounded"
                        color="primary"
                    />
                </Box>
            )}
        </>
    );

    const subheader = !isLoading
        ? `${data?.total ?? orders.length} order${(data?.total ?? orders.length) === 1 ? '' : 's'} placed for this shop's products`
        : null;

    if (embedded) {
        return (
            <Box>
                {subheader && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {subheader}
                    </Typography>
                )}
                {content}
            </Box>
        );
    }

    return (
        <Card sx={{ mb: 3 }}>
            <CardHeader title="Orders" subheader={subheader} />
            {content}
        </Card>
    );
}

ShopOrdersTab.propTypes = { slug: PropTypes.string, embedded: PropTypes.bool };