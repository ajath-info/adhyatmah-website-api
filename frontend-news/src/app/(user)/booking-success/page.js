'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Skeleton
} from '@mui/material';
import { IoCheckmarkCircle, IoArrowBack } from 'react-icons/io5';
import * as api from 'src/services';
import BookingDetailsContent from '@/components/booking/booking-details-content';

export default function BookingSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bookingId = params.get('bookingId');

  useEffect(() => {
    if (!bookingId) {
      setError('Booking ID not found');
      setLoading(false);
      return;
    }

    async function fetchBooking() {
      try {
        setLoading(true);
        const data = await api.getBookingById(bookingId);
        setBooking(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [bookingId]);

  const handleContinueBrowsing = () => router.push('/');
  const handleViewBooking = () => router.push('/profile/bookings');

  if (error && !booking) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" color="error" sx={{ mb: 2 }}>
          Booking Error
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {error}
        </Typography>
        <Button variant="contained" startIcon={<IoArrowBack />} onClick={handleContinueBrowsing}>
          Back to Home
        </Button>
      </Container>
    );
  }

  if (loading || !booking) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Stack spacing={3}>
          <Skeleton variant="rectangular" height={100} />
          <Skeleton variant="rectangular" height={200} />
          <Skeleton variant="rectangular" height={200} />
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <IoCheckmarkCircle size={80} color="#4caf50" />
        <Typography variant="h3" sx={{ my: 2, fontWeight: 'bold', color: '#4caf50' }}>
          Booking Successful!
        </Typography>
        <Typography variant="body1">Thank you for your booking. Your puja has been confirmed.</Typography>
      </Box>

      <BookingDetailsContent booking={booking} showCustomer />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mt: 4 }}>
        <Button variant="contained" size="large" onClick={handleViewBooking}>
          View My Bookings
        </Button>
        <Button variant="outlined" size="large" onClick={handleContinueBrowsing} startIcon={<IoArrowBack />}>
          Continue Browsing
        </Button>
      </Stack>
    </Container>
  );
}