'use client';

import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import { Box, Card, Typography, Table, TableBody, TableContainer, TableHead, TableRow, TableCell, Button } from '@mui/material';
import * as api from 'src/services';
import AdminUserOrderRow from './admin-user-order-row';

const TABLE_HEAD = [
  { id: 'orderNo', label: 'Order No' },
  { id: 'createdAt', label: 'Date' },
  { id: 'items', label: 'Items' },
  { id: 'payment', label: 'Paid Via' },
  { id: 'status', label: 'Status' },
  { id: 'total', label: 'Total' },
  { id: 'actions', label: 'Actions', align: 'right' }
];

export default function UserOrderHistory({ userId, embedded = false }) {
  const queryKey = ['admin-user-orders', userId];

  const { data, isPending: isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => api.getAdminUserOrders(userId),
    enabled: !!userId,
    retry: 1,
    staleTime: 5 * 60 * 1000
  });

  const orders = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);

  const tableContent = (
    <>
      {isError ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" mb={2}>
            Failed to load order history.
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
                [...Array(3)].map((_, index) => <AdminUserOrderRow key={`skeleton-${index}`} isLoading />)}

              {!isLoading && orders.map((order) => <AdminUserOrderRow key={order._id} row={order} />)}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No orders found for this user.</Typography>
        </Box>
      )}
    </>
  );

  if (embedded) {
    return <Box>{tableContent}</Box>;
  }

  return (
    <Card>
      <Box sx={{ px: 3, pt: 3, pb: 1 }}>
        <Typography variant="h6">Order History</Typography>
      </Box>
      {tableContent}
    </Card>
  );
}

UserOrderHistory.propTypes = {
  userId: PropTypes.string.isRequired,
  embedded: PropTypes.bool
};