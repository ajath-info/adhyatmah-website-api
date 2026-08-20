'use client';

import PropTypes from 'prop-types';
import { TableRow, TableCell, Typography, Skeleton, Chip, Stack, IconButton, Tooltip } from '@mui/material';
import { IoEye } from 'react-icons/io5';
import Link from '@/utils/link';
import { fDateShort } from '@/utils/format-time';
import { useCurrencyFormat } from '@/hooks/use-currency-format';

const getStatusColor = (status) => {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'on-the-way':
      return 'warning';
    case 'pending':
      return 'info';
    case 'canceled':
    case 'returned':
      return 'error';
    default:
      return 'default';
  }
};

export default function AdminUserOrderRow({ isLoading, row }) {
  const fCurrency = useCurrencyFormat('custom', row?.currency);
  const itemsCount = row?.items?.length || 0;

  return (
    <TableRow hover>
      <TableCell>
        {isLoading ? <Skeleton width={100} /> : <Typography variant="body2">{row?.orderNo || '—'}</Typography>}
      </TableCell>
      <TableCell>{isLoading ? <Skeleton width={90} /> : fDateShort(row?.createdAt)}</TableCell>
      <TableCell>
        {isLoading ? <Skeleton width={70} /> : `${itemsCount} item${itemsCount > 1 ? 's' : ''}`}
      </TableCell>
      <TableCell>
        {isLoading ? (
          <Skeleton width={90} />
        ) : row?.paymentMethod === 'COD' ? (
          'Cash on delivery'
        ) : (
          row?.paymentMethod || '—'
        )}
      </TableCell>
      <TableCell>
        {isLoading ? <Skeleton width={80} /> : <Chip size="small" label={row?.status} color={getStatusColor(row?.status)} />}
      </TableCell>
      <TableCell>{isLoading ? <Skeleton width={80} /> : fCurrency(row?.total)}</TableCell>
      <TableCell align="right">
        {isLoading ? (
          <Skeleton variant="circular" width={34} height={34} />
        ) : (
          <Stack direction="row" justifyContent="flex-end">
            <Tooltip title="View">
              <IconButton component={Link} href={`/admin/orders/${row?._id}`} size="small">
                <IoEye />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </TableCell>
    </TableRow>
  );
}

AdminUserOrderRow.propTypes = {
  isLoading: PropTypes.bool,
  row: PropTypes.object
};