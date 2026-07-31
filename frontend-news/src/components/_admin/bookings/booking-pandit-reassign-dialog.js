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
  Avatar,
  Stack,
  Typography,
  Skeleton
} from '@mui/material';
import * as api from 'src/services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

BookingPanditReassignDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  bookingId: PropTypes.string,
  onClose: PropTypes.func.isRequired
};

export default function BookingPanditReassignDialog({ open, bookingId, onClose }) {
  const queryClient = useQueryClient();
  const [selectedPandit, setSelectedPandit] = React.useState('');

  const { data, isPending: isLoading } = useQuery({
    queryKey: ['admin-active-pandits'],
    queryFn: () => api.getActivePanditsByAdmin(),
    enabled: open,
    retry: 1
  });

  const activePandits = data?.data || [];

  React.useEffect(() => {
    if (!open) setSelectedPandit('');
  }, [open]);

  const { mutate, isPending: isSaving } = useMutation({
    mutationFn: (payload) => api.updateBookingByAdmin(payload),
    onSuccess: (res) => {
      toast.success(res?.message || 'Pandit ji reassign ho gaye');
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-detail-admin', bookingId] });
      onClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Kuch galat ho gaya');
    }
  });

  const handleSave = () => {
    if (!selectedPandit || !bookingId) return;
    mutate({ id: bookingId, vendor: selectedPandit });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Pandit Ji Reassign</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Stack spacing={1} sx={{ mt: 1 }}>
            <Skeleton variant="rounded" height={56} />
          </Stack>
        ) : activePandits.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Pandit ji is not available.
          </Typography>
        ) : (
          <TextField
            select
            fullWidth
            label="Active Pandit Ji"
            value={selectedPandit}
            onChange={(e) => setSelectedPandit(e.target.value)}
            sx={{ mt: 1 }}
          >
            {activePandits.map((p) => (
              <MenuItem key={p._id} value={p._id}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar src={p.image} sx={{ width: 28, height: 28 }}>
                    {p.firstName?.charAt(0) || 'P'}
                  </Avatar>
                  <Stack>
                    <Typography variant="body2">
                      {`${p.firstName || ''} ${p.lastName || ''}`.trim()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.email}
                    </Typography>
                  </Stack>
                </Stack>
              </MenuItem>
            ))}
          </TextField>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!selectedPandit}
          loading={isSaving}
          loadingPosition="start"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}