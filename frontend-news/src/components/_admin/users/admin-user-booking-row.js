'use client';

import PropTypes from 'prop-types';
import {
  TableRow,
  TableCell,
  Typography,
  Skeleton,
  Chip,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import { MdEdit, MdOutlineDeleteOutline } from 'react-icons/md';
import { IoEye } from 'react-icons/io5';
import Link from '@/utils/link';
import { fDate, fDateTime } from '@/utils/format-time';
import { useCurrencyFormat } from '@/hooks/use-currency-format';
import { useSelector } from '@/redux';

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
    case 'payment_pending':
      return 'warning';
    case 'accept':
    case 'upcoming':
      return 'info';
    case 'ongoing':
      return 'primary';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const getPaymentStatus = (status) => {
  if (status === 'payment_pending') return 'Pending';
  if (status === 'cancelled') return 'Cancelled';
  return 'Paid';
};

const formatAddress = (address) => {
  if (!address) return '—';
  if (typeof address === 'string') return address;
  return [address.streetAddress, address.city, address.state, address.country, address.zip]
    .filter(Boolean)
    .join(', ');
};

export default function AdminUserBookingRow({
  isLoading,
  row,
  isVendorView,
  showLocation = true,
  onEdit,
  onDelete
}) {
  const { currency } = useSelector((state) => state.settings);
  const fCurrency = useCurrencyFormat('base');

  const panditName = `${row?.vendor?.firstName || ''} ${row?.vendor?.lastName || ''}`.trim() || '—';
  const customerName = `${row?.customer?.firstName || ''} ${row?.customer?.lastName || ''}`.trim() || '—';
  const location = formatAddress(row?.address);

  return (
    <TableRow hover>
      <TableCell>
        {isLoading ? <Skeleton width={100} /> : <Typography variant="body2">{row?.bookingID || '—'}</Typography>}
      </TableCell>
      <TableCell>
        {isLoading ? <Skeleton width={90} /> : fDate(row?.createdAt)}
      </TableCell>
      <TableCell>
        {isLoading ? <Skeleton width={140} /> : row?.poojaType || '—'}
      </TableCell>
      <TableCell>
        {isLoading ? <Skeleton width={100} /> : row?.package || '—'}
      </TableCell>
      <TableCell>
        {isLoading ? (
          <Skeleton width={80} />
        ) : (
          <Chip size="small" label={row?.status} color={getStatusColor(row?.status)} />
        )}
      </TableCell>
      <TableCell>
        {isLoading ? <Skeleton width={70} /> : getPaymentStatus(row?.status)}
      </TableCell>
      <TableCell>
        {isLoading ? <Skeleton width={70} /> : fCurrency(row?.paymentAmount, currency)}
      </TableCell>
      <TableCell>
        {isLoading ? <Skeleton width={120} /> : fDateTime(row?.dateTime)}
      </TableCell>
      <TableCell>
        {isLoading ? (
          <Skeleton width={120} />
        ) : isVendorView ? (
          customerName
        ) : (
          panditName
        )}
      </TableCell>
      {showLocation && (
        <TableCell sx={{ maxWidth: 220 }}>
          {isLoading ? (
            <Skeleton width={180} />
          ) : (
            <Typography variant="body2" noWrap title={location}>
              {location}
            </Typography>
          )}
        </TableCell>
      )}
      <TableCell align="right">
        {isLoading ? (
          <Skeleton variant="circular" width={34} height={34} />
        ) : (
          <Stack direction="row" justifyContent="flex-end">
            <Tooltip title="View">
              <IconButton component={Link} href={`/admin/bookings/${row?._id}`} size="small">
                <IoEye />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(row)}>
                <MdEdit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => onDelete(row)}>
                <MdOutlineDeleteOutline />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </TableCell>
    </TableRow>
  );
}

AdminUserBookingRow.propTypes = {
  isLoading: PropTypes.bool,
  row: PropTypes.object,
  isVendorView: PropTypes.bool,
  showLocation: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};
