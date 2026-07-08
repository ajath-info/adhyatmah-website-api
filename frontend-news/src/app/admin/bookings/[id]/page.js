'use client';
import React, { use } from 'react';
import PropTypes from 'prop-types';

// mui
import { Grid, Box, Alert, Skeleton } from '@mui/material';

// components
import BookingDetails from '@/components/_admin/bookings/booking-details';
import BookingTableCard from '@/components/_admin/bookings/booking-table-card';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import BookingToolbarActions from '@/components/_admin/bookings/booking-toolbar-actions';

// api
import * as api from 'src/services';
import { useQuery } from '@tanstack/react-query';

BookingDetail.propTypes = { params: PropTypes.shape({ id: PropTypes.string.isRequired }).isRequired };

export default function BookingDetail(props) {
  const params = use(props.params);

  const { data, isPending: isLoading, isError, error } = useQuery({
    queryKey: ['booking-detail-admin', params.id],
    queryFn: () => api.getBookingById(params.id),
    retry: 1
  });

  const booking = isLoading ? null : data;

  if (isError) {
    return (
      <Box>
        <HeaderBreadcrumbs
          admin
          heading="Booking Details"
          links={[
            { name: 'Dashboard', href: '/admin/dashboard' },
            { name: 'Bookings', href: '/admin/bookings' },
            { name: 'Booking Details' }
          ]}
        />
        <Alert severity="error">
          {error?.response?.data?.message || error?.message || 'Failed to load booking details'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <HeaderBreadcrumbs
        admin
        heading="Booking Details"
        links={[
          { name: 'Dashboard', href: '/admin/dashboard' },
          { name: 'Bookings', href: '/admin/bookings' },
          { name: 'Booking Details' }
        ]}
        action={
          <>
            <BookingToolbarActions data={booking} />
          </>
        }
      />

      <Grid container direction={{ xs: 'row', md: 'row-reverse' }} spacing={2}>
        <Grid size={{ md: 4, xs: 12 }}>
          <BookingDetails data={booking} isLoading={isLoading} />
        </Grid>
        <Grid size={{ md: 8, xs: 12 }}>
          <BookingTableCard data={booking} isLoading={isLoading} />
        </Grid>
      </Grid>
    </Box>
  );
}