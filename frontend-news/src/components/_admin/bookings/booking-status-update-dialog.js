'use client';
import * as React from 'react';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  TextField,
  Stack
} from '@mui/material';
import * as api from 'src/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const STATUS_OPTIONS = ['pending', 'ongoing', 'upcoming', 'completed', 'accepted', 'cancelled'];

BookingStatusUpdateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  bookingId: PropTypes.string,
  currentStatus: PropTypes.string,
  onClose: PropTypes.func.isRequired
};

export default function BookingStatusUpdateDialog({ open, bookingId, currentStatus, onClose }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = React.useState('');

  React.useEffect(() => {
    if (open) setStatus(currentStatus || '');
  }, [open, currentStatus]);

  const { mutate, isPending: isSaving } = useMutation({
    mutationFn: (payload) => api.updateBookingStatusByVendor(payload),
    onSuccess: (res) => {
      toast.success(res?.message || 'Booking status updated');
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-detail-vendor', bookingId] });
      onClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong!');
    }
  });

  const handleSave = () => {
    if (!status || !bookingId) return;
    mutate({ id: bookingId, status });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Update Booking</DialogTitle>
      <DialogContent>
        <Stack spacing={1} sx={{ mt: 1 }}>
          <TextField
            select
            fullWidth
            label="Booking Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option} value={option} sx={{ textTransform: 'capitalize' }}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!status}
          loading={isSaving}
          loadingPosition="start"
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}