'use client';

import PropTypes from 'prop-types';
import { Card, CardContent, Typography, Stack, Chip, Grid } from '@mui/material';

function getStatusColor(status) {
  if (status === 'completed') return 'success';
  if (status === 'upcoming' || status === 'accept') return 'info';
  if (status === 'ongoing') return 'warning';
  if (status === 'pending') return 'default';
  return 'error';
}

function formatPayment(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return '0.00';
  return n.toFixed(2);
}

export default function BookingDetailsContent({ booking, showCustomer = true, compact = false }) {
  if (!booking) return null;

  const customer = booking.customer || {};
  const vendor = booking.vendor || {};
  const cardSx = compact ? { mb: 2, boxShadow: 1 } : { mb: 4, boxShadow: 2 };

  const pujaKits = booking?.pujaSamagri?.pujaKit || [];
  const instantKits = booking?.pujaSamagri?.instantKit || [];
  const hasSamagri = pujaKits.length > 0 || instantKits.length > 0;

  return (
    <Stack spacing={compact ? 2 : 0}>
      <Card sx={cardSx}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            Booking Details
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack>
                <Typography variant="caption">Booking Number</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {booking.bookingID || (booking.id ? `#${String(booking.id).slice(-8)}` : 'N/A')}
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack>
                <Typography variant="caption">Booking Date</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {booking.createdAt
                    ? new Date(booking.createdAt).toLocaleString('en-IN')
                    : 'N/A'}
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack>
                <Typography variant="caption">Puja / Service</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {booking.poojaType || booking.package || 'N/A'}
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack>
                <Typography variant="caption">Package</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {booking.package || 'N/A'}
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack>
                <Typography variant="caption">Scheduled Date & Time</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {booking.dateTime
                    ? new Date(booking.dateTime).toLocaleString('en-IN')
                    : 'N/A'}
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack>
                <Typography variant="caption">Duration</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {booking.duration || 'N/A'}
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack>
                <Typography variant="caption">Booking Status</Typography>
                <Chip
                  label={booking.status}
                  size="small"
                  color={getStatusColor(booking.status)}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack>
                <Typography variant="caption">Payment Amount</Typography>
                <Typography sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  ₹{formatPayment(booking.paymentAmount)}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={cardSx}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            Puja Samagri
          </Typography>

          {!hasSamagri && (
            <Typography variant="body2" color="text.secondary">
              No Puja Kit or Instant Kit selected for this booking.
            </Typography>
          )}

          {pujaKits.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Puja Kit
              </Typography>
              {pujaKits.map((item, idx) => (
                <Typography key={item._id || item.id || `puja-${idx}`} variant="body2">
                  • {item.name} — ₹{item.price}
                </Typography>
              ))}
            </>
          )}

          {instantKits.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mt: pujaKits.length ? 2 : 0, mb: 1 }}>
                Instant Kit
              </Typography>
              {instantKits.map((item, idx) => (
                <Typography key={item._id || item.id || `instant-${idx}`} variant="body2">
                  • {item.name} — ₹{item.price}
                </Typography>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      <Card sx={cardSx}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            Pandit Details
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption">Name</Typography>
              <Typography>
                {vendor.firstName} {vendor.lastName}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption">Email</Typography>
              <Typography>{vendor.email || '—'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption">Phone</Typography>
              <Typography>{vendor.phone || '—'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption">Languages</Typography>
              <Typography>
                {booking.language?.length
                  ? booking.language.join(', ')
                  : Array.isArray(vendor.language)
                    ? vendor.language.join(', ')
                    : 'Not specified'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {showCustomer && (
        <Card sx={cardSx}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Customer Information
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption">Name</Typography>
                <Typography>
                  {customer.firstName} {customer.lastName}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption">Email</Typography>
                <Typography>{customer.email || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption">Phone</Typography>
                <Typography>{customer.phone || '—'}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {booking.address && (
        <Card sx={{ ...cardSx, mb: 0 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Puja Address
            </Typography>

            <Typography variant="caption" display="block">
              Full Address
            </Typography>
            <Typography>
              {[
                booking.address.streetAddress,
                booking.address.landmark,
                booking.address.city,
                booking.address.district,
                booking.address.state,
                booking.address.country
              ]
                .filter(Boolean)
                .join(', ')}
              {booking.address.zip ? ` — ${booking.address.zip}` : ''}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}

BookingDetailsContent.propTypes = {
  booking: PropTypes.object,
  showCustomer: PropTypes.bool,
  compact: PropTypes.bool
};