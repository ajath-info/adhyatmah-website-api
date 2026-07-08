'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import Table from 'src/components/table/table';
import BookingRow from '@/components/table/rows/booking';
import { useQuery } from '@tanstack/react-query';
import * as api from 'src/services';
import { Box, Typography, Button } from '@mui/material';

const BOOKING_TABLE_HEAD = [
  { id: 'customer', label: 'Customer' },
  { id: 'paymentAmount', label: 'Total (₹)' },
  { id: 'poojaType', label: 'Pooja Service' },
  { id: 'duration', label: 'Duration' },
  { id: 'status', label: 'Status' },
  { id: 'date', label: 'Date & ID' },
  { id: '', label: 'Actions' }
];

export default function BookingDetailsTab({ vendorId }) {
  const { data, isPending: isLoading, isError, refetch } = useQuery({
    queryKey: ['vendor-bookings', vendorId],
    queryFn: () => api.getVendorBookingsByAdmin(vendorId),  // ✅ FIXED
    enabled: !!vendorId,
    retry: 1
  });

  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const currentPage = Number(pageParam) || 1;
  const PAGE_SIZE = 10;

  if (isError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" mb={2}>Failed to fetch booking details.</Typography>
        <Button variant="contained" color="primary" onClick={() => refetch()}>Retry</Button>
      </Box>
    );
  }

  const rawBookings = data?.data || [];  // ✅ FIXED
  const totalItems = rawBookings.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  const start = (safePage - 1) * PAGE_SIZE;
  const paginatedBookings = rawBookings.slice(start, start + PAGE_SIZE);

  const bookingsData = {
    data: paginatedBookings,
    count: totalPages,
    currentPage: safePage,
    total: totalItems
  };

  return (
    <Box sx={{ pt: 3 }}>
      <Table
        headData={BOOKING_TABLE_HEAD}
        data={bookingsData}
        isLoading={isLoading}
        row={BookingRow}
        hideVendor={true}
        handleClickOpen={() => { }}
      />
    </Box>
  );
}