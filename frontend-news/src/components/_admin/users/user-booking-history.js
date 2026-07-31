'use client';

import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack
} from '@mui/material';
import * as api from 'src/services';
import AdminUserBookingRow from './admin-user-booking-row';

const STATUS_OPTIONS = [
  'payment_pending',
  'pending',
  'accept',
  'upcoming',
  'ongoing',
  'completed',
  'cancelled'
];

const TABLE_HEAD = (isVendorView, embedded = false) => {
  const columns = [
    { id: 'bookingID', label: 'Booking ID' },
    { id: 'createdAt', label: 'Booking Date' },
    { id: 'poojaType', label: 'Service Name' },
    { id: 'package', label: 'Category' },
    { id: 'status', label: 'Booking Status' },
    { id: 'payment', label: 'Payment Status' },
    { id: 'amount', label: 'Amount' },
    { id: 'dateTime', label: 'Booking Time / Slot' },
    ...(isVendorView
      ? [{ id: 'customer', label: 'Customer' }]
      : [{ id: 'pandit', label: 'Assigned Pandit' }])
  ];

  if (!(embedded && isVendorView)) {
    columns.push({ id: 'address', label: 'Location / Address' });
  }

  columns.push({ id: 'actions', label: 'Actions', align: 'right' });

  return columns;
};

export default function UserBookingHistory({ userId, isVendorView = false, embedded = false }) {
  const queryClient = useQueryClient();
  const [editBooking, setEditBooking] = useState(null);
  const [form, setForm] = useState({
    status: '',
    paymentAmount: '',
    dateTime: '',
    duration: '',
    poojaType: '',
    package: ''
  });

  const queryKey = isVendorView
    ? ['admin-user-bookings', 'vendor', userId]
    : ['admin-user-bookings', 'customer', userId];

  const { data, isPending: isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => api.getAdminUserBookings(userId, isVendorView),
    enabled: !!userId,
    retry: 1,
    staleTime: 5 * 60 * 1000
  });

  const bookings = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);

  const { mutate: updateBooking, isPending: isUpdating } = useMutation({
    mutationFn: api.updateBookingByAdmin,
    onSuccess: (res) => {
      toast.success(res?.message || 'Booking updated successfully');
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['admin-all-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setEditBooking(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update booking');
    }
  });

  const { mutate: removeBooking, isPending: isDeleting } = useMutation({
    mutationFn: api.deleteBooking,
    onSuccess: (res) => {
      toast.success(res?.message || 'Booking deleted successfully');
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['admin-all-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete booking');
    }
  });

  const openEdit = (booking) => {
    setEditBooking(booking);
    setForm({
      status: booking?.status || '',
      paymentAmount: booking?.paymentAmount ?? '',
      dateTime: booking?.dateTime ? new Date(booking.dateTime).toISOString().slice(0, 16) : '',
      duration: booking?.duration || '',
      poojaType: booking?.poojaType || '',
      package: booking?.package || ''
    });
  };

  const handleDelete = (booking) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      removeBooking(booking._id);
    }
  };

  const handleSave = () => {
    updateBooking({
      id: editBooking._id,
      status: form.status,
      paymentAmount: form.paymentAmount !== '' ? Number(form.paymentAmount) : undefined,
      dateTime: form.dateTime || undefined,
      duration: form.duration || undefined,
      poojaType: form.poojaType || undefined,
      package: form.package || undefined
    });
  };

  const head = TABLE_HEAD(isVendorView, embedded);
  const showLocation = !(embedded && isVendorView);

  const tableContent = (
    <>
      {isError ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" mb={2}>
            Failed to load booking history.
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
                {head.map((col) => (
                  <TableCell key={col.id} align={col.align || 'left'}>
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading &&
                [...Array(5)].map((_, index) => (
                  <AdminUserBookingRow
                    key={`skeleton-${index}`}
                    isLoading
                    isVendorView={isVendorView}
                    showLocation={showLocation}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))}

              {!isLoading &&
                bookings.map((booking) => (
                  <AdminUserBookingRow
                    key={booking._id}
                    row={booking}
                    isVendorView={isVendorView}
                    showLocation={showLocation}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!isLoading && !isError && bookings.length === 0 && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No bookings found for this user.</Typography>
        </Box>
      )}
    </>
  );

  return (
    <>
      {embedded ? (
        <Box>{tableContent}</Box>
      ) : (
        <Card>
          <Box sx={{ px: 3, pt: 3, pb: 1 }}>
            <Typography variant="h6">Booking History</Typography>
          </Box>
          {tableContent}
        </Card>
      )}

      <Dialog open={Boolean(editBooking)} onClose={() => setEditBooking(null)} fullWidth maxWidth="sm">
        <DialogTitle>Update Booking</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Booking Status"
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              fullWidth
            >
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status} sx={{ textTransform: 'capitalize' }}>
                  {status.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Payment Amount"
              type="number"
              value={form.paymentAmount}
              onChange={(e) => setForm((prev) => ({ ...prev, paymentAmount: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Booking Time / Slot"
              type="datetime-local"
              value={form.dateTime}
              onChange={(e) => setForm((prev) => ({ ...prev, dateTime: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Duration"
              value={form.duration}
              onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Service Name"
              value={form.poojaType}
              onChange={(e) => setForm((prev) => ({ ...prev, poojaType: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Category"
              value={form.package}
              onChange={(e) => setForm((prev) => ({ ...prev, package: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditBooking(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={isUpdating || isDeleting}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

UserBookingHistory.propTypes = {
  userId: PropTypes.string.isRequired,
  isVendorView: PropTypes.bool,
  embedded: PropTypes.bool
};
