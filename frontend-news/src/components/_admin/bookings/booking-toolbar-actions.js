import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';

import BookingPDF from './booking-pdf';
import BookingStatus from './booking-status';

import { Stack, Box, Button } from '@mui/material';
import { useRouter } from '@bprogress/next';
import * as api from 'src/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MdOutlineDeleteOutline, MdOutlineFileDownload } from 'react-icons/md';

BookingToolbarActions.propTypes = { data: PropTypes.object };

export default function BookingToolbarActions({ data }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate, isPending: deleteLoading } = useMutation({
    mutationFn: (id) => api.deleteBooking(id),
    onSuccess: (res) => {
      toast.success(res?.message || 'Booking deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      router.push('/admin/bookings');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete booking');
    }
  });

  return (
    <Box mb={{ sm: 0, xs: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        {data && (
          <PDFDownloadLink
            document={<BookingPDF data={data} />}
            fileName={`BOOKING-${data?._id || data?.id}.pdf`}
            style={{ textDecoration: 'none' }}
          >
            {({ loading }) => (
              <Button
                loading={loading}
                variant="contained"
                loadingPosition="start"
                startIcon={<MdOutlineFileDownload />}
                color="info"
              >
                Download
              </Button>
            )}
          </PDFDownloadLink>
        )}

        <Button
          variant="contained"
          startIcon={<MdOutlineDeleteOutline />}
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this booking?')) {
              mutate(data?._id || data?.id);
            }
          }}
          loading={deleteLoading}
          loadingPosition="start"
        >
          Delete
        </Button>

        <BookingStatus data={data} />
      </Stack>
    </Box>
  );
}
