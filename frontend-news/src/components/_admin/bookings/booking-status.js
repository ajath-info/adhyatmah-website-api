'use client';
import * as React from 'react';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import { Menu, MenuItem, Button } from '@mui/material';
import { IoIosArrowDown } from 'react-icons/io';
import * as api from 'src/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';

BookingStatus.propTypes = { data: PropTypes.object };

export default function BookingStatus({ data }) {
  const queryClient = useQueryClient();

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: (payload) => api.updateBookingStatus(payload),
    onSuccess: (res) => {
      toast.success(res?.message || 'Status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-detail', data?._id || data?.id] });
      queryClient.invalidateQueries({ queryKey: ['booking-detail-admin', data?._id || data?.id] });
    },
    onError: () => {
      toast.error('Something went wrong!');
    }
  });

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selected, setSelected] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (status) => {
    setSelected(status);
    if (status !== selected && status) {
      mutate({ bookingId: data?._id || data?.id, status });
    }
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        id="status-button"
        aria-controls={open ? 'status-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        variant="outlined"
        endIcon={<IoIosArrowDown />}
        sx={{ ml: 1 }}
        loading={isLoading || !data}
        loadingPosition="end"
      >
        {selected || data?.status || 'Loading'}
      </Button>
      <Menu
        id="status-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{ 'aria-labelledby': 'status-button' }}
      >
        {['pending', 'accepted', 'ongoing', 'upcoming', 'completed', 'cancelled'].map((status) => (
          <MenuItem sx={{ textTransform: 'capitalize' }} key={status} onClick={() => handleClose(status)}>
            {status}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
