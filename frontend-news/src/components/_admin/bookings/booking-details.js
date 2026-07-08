'use client';
import React from 'react';
// mui
import { Typography, Card, CardContent, Stack, Fab, Skeleton } from '@mui/material';
import { IoPersonSharp } from 'react-icons/io5';
import { HiCurrencyDollar } from 'react-icons/hi2';

// styled
import { styled, alpha } from '@mui/material/styles';
import { createGradient } from 'src/theme/palette';
import PropTypes from 'prop-types';

const RootStyled = styled(Stack)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .detail-card': {
    minHeight: 226,
    position: 'relative',
    background: createGradient(theme.palette.primary.main, theme.palette.primary.dark),
    color: theme.palette.common.white,
    zIndex: 0,
    '&:before': {
      content: "''",
      position: 'absolute',
      top: '-20%',
      left: '40%',
      transform: 'translateX(-50%)',
      background: alpha(theme.palette.primary.light, 0.5),
      height: 80,
      width: 80,
      borderRadius: '50px',
      zIndex: 2
    },
    '&:after': {
      content: "''",
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      right: '-14%',
      background: alpha(theme.palette.primary.light, 0.5),
      height: 80,
      width: 80,
      borderRadius: '50px',
      zIndex: 2
    },
    '& .detail-card-content': {
      position: 'relative',
      zIndex: 2,
      '&:before': {
        content: "''",
        position: 'absolute',
        bottom: '-20%',
        left: '50%',
        transform: 'translateX(-50%)',
        background: alpha(theme.palette.primary.light, 0.5),
        height: 80,
        width: 80,
        borderRadius: '50px',
        zIndex: -1
      }
    },
    '& .detail-card-btn': {
      display: 'block',
      minWidth: 50,
      lineHeight: 0,
      minHeight: 50,
      color: theme.palette.common.white,
      background: alpha(theme.palette.primary.light, 0.5),
      boxShadow: 'none',
      '&:hover': {
        background: theme.palette.primary.dark
      },
      '& .email-heading': {
        wordWrap: 'break-word'
      }
    }
  },
  '& .skeleton': {
    marginLeft: 'auto'
  }
}));

BookingDetails.propTypes = {
  data: PropTypes.object,
  isLoading: PropTypes.bool.isRequired
};

export default function BookingDetails({ data, isLoading }) {
  const customer = data?.customer || {};
  const vendor = data?.vendor || {};

  return (
    <RootStyled gap={2}>
      <Card className="detail-card">
        <CardContent className="detail-card-content">
          <Stack spacing={2} direction="row" justifyContent="flex-start" alignItems="center">
            {isLoading ? (
              <>
                <Skeleton variant="rectangular" width={50} height={50} />
                <Skeleton variant="text" width={150} />
              </>
            ) : (
              <>
                <Fab className="detail-card-btn" variant="contained" color="primary">
                  <IoPersonSharp size={25} />
                </Fab>
                <Typography variant="h6">Customer Details</Typography>
              </>
            )}
          </Stack>
          <Stack spacing={isLoading ? 0 : 1} mt={3}>
            {isLoading ? (
              <>
                <Skeleton variant="text" width={200} />
                <Skeleton variant="text" width={200} />
                <Skeleton variant="text" width={200} />
                <Skeleton variant="text" width={200} />
              </>
            ) : (
              <>
                <Typography variant="body2">
                  <strong>Name</strong>: {customer.firstName && customer.lastName ? `${customer.firstName} ${customer.lastName}` : customer.firstName || customer.lastName || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Phone</strong>: {customer.phone || 'N/A'}
                </Typography>
                <Typography className="email-heading" variant="body2">
                  <strong>Email</strong>: {customer.email || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Address</strong>: {[
                    data?.address?.streetAddress,
                    data?.address?.landmark,
                    data?.address?.city,
                    data?.address?.state,
                    data?.address?.country,
                    data?.address?.zip
                  ].filter(Boolean).join(', ') || 'N/A'}
                </Typography>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card className="detail-card">
        <CardContent className="detail-card-content">
          <Stack spacing={2} direction="row" justifyContent="flex-start" alignItems="center">
            {isLoading ? (
              <>
                <Skeleton variant="rectangular" width={50} height={50} />
                <Skeleton variant="text" width={150} />
              </>
            ) : (
              <>
                <Fab className="detail-card-btn" variant="contained" color="primary">
                  <IoPersonSharp size={25} />
                </Fab>
                <Typography variant="h6">Pandit Details</Typography>
              </>
            )}
          </Stack>
          <Stack spacing={isLoading ? 0 : 1} mt={3}>
            {isLoading ? (
              <>
                <Skeleton variant="text" width={200} />
                <Skeleton variant="text" width={200} />
                <Skeleton variant="text" width={200} />
              </>
            ) : (
              <>
                <Typography variant="body2">
                  <strong>Name</strong>: {vendor.firstName && vendor.lastName ? `${vendor.firstName} ${vendor.lastName}` : vendor.firstName || vendor.lastName || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Phone</strong>: {vendor.phone || 'N/A'}
                </Typography>
                <Typography className="email-heading" variant="body2">
                  <strong>Email</strong>: {vendor.email || 'N/A'}
                </Typography>
                <Typography variant="body2" textTransform="capitalize">
                  <strong>Languages</strong>: {data?.language?.length ? data.language.join(', ') : (Array.isArray(vendor.language) ? vendor.language.join(', ') : 'Not specified')}
                </Typography>
                <Typography variant="body2">
                  <strong>Address</strong>: {[
                    vendor.address,
                    vendor.city,
                    vendor.state,
                    vendor.country,
                    vendor.zip
                  ].filter(Boolean).join(', ') || 'N/A'}
                </Typography>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card className="detail-card">
        <CardContent className="detail-card-content">
          <Stack spacing={2} direction="row" justifyContent="flex-start" alignItems="center">
            {isLoading ? (
              <>
                <Skeleton variant="rectangular" width={50} height={50} />
                <Skeleton variant="text" width={150} />
              </>
            ) : (
              <>
                <Fab className="detail-card-btn" variant="contained" color="primary">
                  <HiCurrencyDollar size={40} />
                </Fab>
                <Typography variant="h6">Payment Method</Typography>
              </>
            )}
          </Stack>
          <Stack spacing={isLoading ? 0 : 1} mt={3}>
            {isLoading ? (
              <>
                <Skeleton variant="text" width={200} />
                <Skeleton variant="text" width={200} />
                <Skeleton variant="text" width={200} />
                <Skeleton variant="text" width={200} />
              </>
            ) : (
              <>
                <Typography variant="body2">
                  <strong>Booking Number</strong>: {data?.bookingID || (data?._id ? `#${String(data._id).slice(-8)}` : 'N/A')}
                </Typography>
                <Typography variant="body2">
                  <strong>Payment Method</strong>: {data?.paymentMethod || 'Online'}
                </Typography>
                <Typography variant="body2">
                  <strong>Transaction ID</strong>: {data?.transactionId || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Notes</strong>: {data?.notes || data?.specialInstructions || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Amount</strong>: ₹{Number(data?.paymentAmount || 0).toFixed(2)}
                </Typography>
                <Typography variant="body2" textTransform="capitalize">
                  <strong>Status</strong>: {data?.status}
                </Typography>
                <Typography variant="body2">
                  <strong>Booking Date</strong>:{' '}
                  {data?.createdAt &&
                    new Date(data?.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      minute: 'numeric',
                      hour: 'numeric'
                    })}
                </Typography>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </RootStyled>
  );
}
