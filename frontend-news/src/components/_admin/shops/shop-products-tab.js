'use client';

import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Card,
    CardHeader,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    Typography,
    Skeleton,
    Chip,
    IconButton,
    Tooltip,
    Button
} from '@mui/material';
import MuiPagination from '@mui/material/Pagination';
import { IoEye } from 'react-icons/io5';
import Link from '@/utils/link';
import BlurImage from '@/components/blur-image';
import { fCurrency } from '@/utils/format-number';
import { fDateShort } from '@/utils/format-time';
import * as api from 'src/services';

const TABLE_HEAD = [
    { id: 'name', label: 'Product' },
    { id: 'price', label: 'Price' },
    { id: 'stock', label: 'Stock' },
    { id: 'status', label: 'Status' },
    { id: 'createdAt', label: 'Date' },
    { id: 'actions', label: 'Actions', align: 'right' }
];

const stockChip = (qty) =>
    qty < 1
        ? { label: 'Out of stock', color: 'error' }
        : qty < 20
            ? { label: 'Low stock', color: 'warning' }
            : { label: 'In stock', color: 'success' };

function ProductRow({ isLoading, row }) {
    return (
        <TableRow hover>
            <TableCell sx={{ maxWidth: 300 }}>
                <Box display="flex" alignItems="center">
                    {isLoading ? (
                        <Skeleton variant="rectangular" width={44} height={44} sx={{ borderRadius: 1 }} />
                    ) : (
                        <Box sx={{ width: 44, height: 44, mr: 2, position: 'relative', flexShrink: 0 }}>
                            <BlurImage alt={row?.name} src={row?.image?.url} layout="fill" objectFit="cover" />
                        </Box>
                    )}
                    <Typography variant="body2" noWrap>
                        {isLoading ? <Skeleton width={140} /> : row?.name}
                    </Typography>
                </Box>
            </TableCell>
            <TableCell>{isLoading ? <Skeleton width={60} /> : fCurrency(row?.salePrice || row?.price)}</TableCell>
            <TableCell>
                {isLoading ? (
                    <Skeleton width={80} />
                ) : (
                    <Chip size="small" {...stockChip(row?.stockQuantity)} />
                )}
            </TableCell>
            <TableCell>
                {isLoading ? <Skeleton width={70} /> : <Chip size="small" label={row?.status} sx={{ textTransform: 'capitalize' }} />}
            </TableCell>
            <TableCell>{isLoading ? <Skeleton width={80} /> : fDateShort(row?.createdAt)}</TableCell>
            <TableCell align="right">
                {isLoading ? (
                    <Skeleton variant="circular" width={34} height={34} sx={{ ml: 'auto' }} />
                ) : (
                    <Tooltip title="View product">
                        <IconButton component={Link} href={`/admin/products/${row?.slug}`} size="small">
                            <IoEye />
                        </IconButton>
                    </Tooltip>
                )}
            </TableCell>
        </TableRow>
    );
}

ProductRow.propTypes = { isLoading: PropTypes.bool, row: PropTypes.object };

export default function ShopProductsTab({ slug, embedded = false }) {
    const [page, setPage] = useState(1);

    const { data, isPending: isLoading, isError, refetch } = useQuery({
        queryKey: ['shop-products-by-admin', slug, page],
        queryFn: () => api.getProductsByAdmin(`shop=${slug}&page=${page}&limit=5`),
        enabled: !!slug,
        retry: 1
    });

    const products = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);
    const totalPages = data?.count || 1;

    const content = (
        <>
            {isError ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="error" mb={2}>
                        Failed to load products.
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
                            {isLoading && [...Array(3)].map((_, index) => <ProductRow key={`skeleton-${index}`} isLoading />)}
                            {!isLoading && products.map((product) => <ProductRow key={product._id} row={product} />)}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {!isLoading && !isError && products.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No products added by this shop yet.</Typography>
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
        ? `${data?.total ?? products.length} product${(data?.total ?? products.length) === 1 ? '' : 's'} added by this shop`
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
            <CardHeader title="Products" subheader={subheader} />
            {content}
        </Card>
    );
}

ShopProductsTab.propTypes = { slug: PropTypes.string, embedded: PropTypes.bool };