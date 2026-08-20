'use client';
import React, { use } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from '@bprogress/next';
// mui
import { alpha } from '@mui/material/styles';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Stack, 
  Typography, 
  Button, 
  Box,
  Chip,
  Skeleton,
  Grid,
  Divider
} from '@mui/material';
import { IoArrowBackOutline, IoCalendarOutline, IoPricetagOutline, IoCubeOutline, IoTimeOutline } from 'react-icons/io5';
// components
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import BookingDetails from '@/components/_admin/bookings/booking-details';
// api
import * as api from 'src/services';
import { useQuery } from '@tanstack/react-query';

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'accept':
      return 'info';
    case 'ongoing':
      return 'primary';
    case 'upcoming':
      return 'secondary';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'accept':
      return 'Accepted';
    case 'ongoing':
      return 'Ongoing';
    case 'upcoming':
      return 'Upcoming';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

export default function ViewBooking(props) {
  const router = useRouter();
  const { id } = use(props.params);

  const { data, isPending: isLoading } = useQuery({
    queryKey: ['vendor-booking', id],
    queryFn: () => api.getBookingByVendor(id)
  });

  const booking = data?.data;

  if (isLoading) {
    return (
      <div>
        <HeaderBreadcrumbs
          admin
          heading="Pandit Booking Details"
          links={[
            { name: 'Dashboard', href: '/vendor/dashboard' },
            { name: 'Pandit Bookings', href: '/vendor/orders' },
            { name: 'Pandit Booking Details' }
          ]}
        />
        <Card>
          <CardHeader title={<Skeleton variant="text" width={200} />} />
          <CardContent>
            <Stack spacing={3}>
              <Skeleton variant="rectangular" height={56} />
              <Skeleton variant="rectangular" height={56} />
              <Skeleton variant="rectangular" height={56} />
              <Skeleton variant="rectangular" height={100} />
            </Stack>
          </CardContent>
        </Card>
      </div>
    );
  }

  const infoItems = [
    { icon: <IoPricetagOutline size={18} />, label: 'Pooja Type', value: booking?.poojaType },
    { icon: <IoCubeOutline size={18} />, label: 'Package', value: booking?.package },
    { icon: <IoTimeOutline size={18} />, label: 'Duration', value: booking?.duration },
    {
      icon: <IoCalendarOutline size={18} />,
      label: 'Date & Time',
      value: booking?.dateTime ? new Date(booking.dateTime).toLocaleString() : '—'
    }
  ];

  return (
    <div>
      <HeaderBreadcrumbs
        admin
        heading="Pandit Booking Details"
        links={[
          { name: 'Dashboard', href: '/vendor/dashboard' },
          { name: 'Pandit Bookings', href: '/vendor/orders' },
          { name: 'Pandit Booking Details' }
        ]}
      />

      <Button
        variant="outlined"
        startIcon={<IoArrowBackOutline />}
        onClick={() => router.push('/vendor/orders')}
        sx={{ mb: 2 }}
      >
        Back to Bookings
      </Button>

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            px: { xs: 2.5, sm: 4 },
            py: 3,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'common.white'
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <Box>
              <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1 }}>
                Booking ID
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {booking?.bookingID}
              </Typography>
            </Box>
            <Chip
              label={getStatusLabel(booking?.status)}
              color={getStatusColor(booking?.status)}
              variant="filled"
              sx={{ fontWeight: 600, px: 1 }}
            />
          </Stack>
        </Box>

        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Service Information
              </Typography>
              <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                {infoItems.map((item) => (
                  <Grid item xs={12} sm={6} key={item.label}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          flexShrink: 0
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {item.label}
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {item.value || '—'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Divider />

            {(booking?.pujaSamagri?.pujaKit?.length > 0 || booking?.pujaSamagri?.instantKit?.length > 0) && (
              <>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Puja Kit
                  </Typography>

                  <Stack spacing={2} sx={{ mt: 1 }}>
                    {booking?.pujaSamagri?.pujaKit?.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Puja Kit
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 0.5 }}>
                          {booking.pujaSamagri.pujaKit.map((kitName, index) => (
                            <Chip key={`puja-kit-${index}`} label={kitName} variant="outlined" color="primary" />
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {booking?.pujaSamagri?.instantKit?.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Instant Kit
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 0.5 }}>
                          {booking.pujaSamagri.instantKit.map((kitName, index) => (
                            <Chip key={`instant-kit-${index}`} label={kitName} variant="outlined" color="secondary" />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </Box>

                <Divider />
              </>
            )}

            <BookingDetails data={booking} isLoading={isLoading} hideVendorDetails hidePaymentMethod />
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
}

ViewBooking.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired
};