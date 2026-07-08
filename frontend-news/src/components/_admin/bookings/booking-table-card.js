'use client';
import React from 'react';
import PropTypes from 'prop-types';

// mui
import { Typography, Skeleton, Divider, Table, TableHead, TableBody, TableRow, TableCell, Stack, Box, Card, TableContainer } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

const RootStyled = styled(Card)(({ theme }) => ({
  '& .body-row': {
    '& .MuiTableCell-root': {
      background: alpha(theme.palette.primary.main, 0.1)
    }
  },
  '& .skeleton-h5': {
    margin: theme.spacing(2)
  },
  '& .skeleton-text': {
    float: 'right'
  }
}));

BookingTableCard.propTypes = {
  data: PropTypes.object,
  isLoading: PropTypes.bool.isRequired
};

export default function BookingTableCard({ data, isLoading }) {

  const pujaKits = data?.pujaSamagri?.pujaKit || [];
  const instantKits = data?.pujaSamagri?.instantKit || [];
  const totalItems = (data ? 1 : 0) + pujaKits.length + instantKits.length;

  return (
    <RootStyled>
      {/* Summary Header */}
      {isLoading ? (
        <Skeleton variant="text" width={150} className="skeleton-h5" />
      ) : (
        <Typography variant="h5" p={2}>
          {totalItems} {totalItems > 1 ? 'Items' : 'Item'} in your booking
        </Typography>
      )}

      <Stack gap={2} sx={{ p: 2, mb: 3 }}>
        <TableContainer>
          <Table className="table-main">
            <TableHead>
              <TableRow className="head-row">
                <TableCell className="head-row-cell">Service / Item</TableCell>
                <TableCell className="head-row-cell">Details</TableCell>
                <TableCell className="head-row-cell" align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell><Skeleton variant="text" width={150} /></TableCell>
                  <TableCell><Skeleton variant="text" width={150} /></TableCell>
                  <TableCell align="right"><Skeleton variant="text" width={50} /></TableCell>
                </TableRow>
              ) : (
                <>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2" color="primary.main">
                        {data?.poojaType || data?.package || 'Pooja Service'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {data?.duration && <Typography variant="body2">Duration: {data.duration}</Typography>}
                      {data?.dateTime && (
                        <Typography variant="body2">
                          Scheduled: {new Date(data.dateTime).toLocaleString('en-IN')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      ₹{Number(data?.paymentAmount || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>

                  {pujaKits.map((item, idx) => (
                    <TableRow key={`puja-${idx}`}>
                      <TableCell>
                        <Typography variant="body2">Puja Kit: {item.name}</Typography>
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell align="right">₹{Number(item.price || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}

                  {instantKits.map((item, idx) => (
                    <TableRow key={`instant-${idx}`}>
                      <TableCell>
                        <Typography variant="body2">Instant Kit: {item.name}</Typography>
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell align="right">₹{Number(item.price || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      <Divider sx={{ my: 2 }} />
      <Box sx={{ maxWidth: 500, ml: 'auto' }}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>{isLoading ? <Skeleton variant="text" width={100} /> : <strong>Subtotal</strong>}</TableCell>
              <TableCell align="right">
                {isLoading ? (
                  <Skeleton variant="text" width={100} />
                ) : (
                  <strong>₹{Number(data?.paymentAmount || 0).toFixed(2)}</strong>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{isLoading ? <Skeleton variant="text" width={100} /> : <strong>Total</strong>}</TableCell>
              <TableCell align="right">
                {isLoading ? (
                  <Skeleton variant="text" width={100} />
                ) : (
                  <Typography variant="h6" fontWeight="bold">
                    ₹{Number(data?.paymentAmount || 0).toFixed(2)}
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </RootStyled>
  );
}
