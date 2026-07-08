'use client';

import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Alert,
  Stack,
  Skeleton
} from '@mui/material';
import { MdClose } from 'react-icons/md';
import * as api from 'src/services';
import BookingDetailsContent from './booking-details-content';

export default function BookingDetailsModal({ open, onClose, bookingId }) {
  const {
    data: booking,
    isPending,
    isError,
    error
  } = useQuery({
    queryKey: ['booking-detail', bookingId],
    queryFn: async () => {
      const res = await api.getBookingById(bookingId);
      return res;
    },
    enabled: open && Boolean(bookingId)
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      aria-labelledby="booking-details-dialog-title"
      PaperProps={{
        sx: {
          m: { xs: 1, sm: 2 },
          maxHeight: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' }
        }
      }}
    >
      <DialogTitle
        id="booking-details-dialog-title"
        sx={{
          pr: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 0.5
        }}
      >
        <Typography variant="h6" component="span" fontWeight="bold">
          Booking Details
        </Typography>
        {booking?.bookingID && (
          <Typography variant="body2" color="text.secondary">
            {booking.bookingID}
          </Typography>
        )}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <MdClose size={22} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        {isPending && (
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={120} />
            <Skeleton variant="rectangular" height={100} />
            <Skeleton variant="rectangular" height={140} />
          </Stack>
        )}

        {isError && (
          <Alert severity="error">
            {error?.message || 'Failed to load booking details. Please try again.'}
          </Alert>
        )}

        {!isPending && !isError && booking && (
          <Box>
            <BookingDetailsContent booking={booking} showCustomer compact />
          </Box>
        )}

        {!isPending && !isError && !booking && open && (
          <Typography color="text.secondary">Booking not found.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}

BookingDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookingId: PropTypes.string
};