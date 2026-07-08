'use client';
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Table from 'src/components/table/table';
import ServiceRow from '@/components/table/rows/service';
import { useQuery } from '@tanstack/react-query';
import * as api from 'src/services';
import { Box, Typography, Button } from '@mui/material';

const SERVICE_TABLE_HEAD = [
  { id: 'poojaType', label: 'Pooja/Service' },
  { id: 'price', label: 'Price' },
  { id: 'duration', label: 'Duration' },
  { id: 'status', label: 'Status' },
  { id: 'description', label: 'Description' },
  { id: 'date', label: 'Date' }
];

export default function PoojaServicesTab({ vendorId }) {
  const [, setDeleteId] = useState(null);

  const { data, isPending: isLoading, isError, refetch } = useQuery({
    queryKey: ['vendor-services', vendorId],
    queryFn: () => api.getPanditServices(vendorId),
    enabled: !!vendorId,
    retry: 1
  });

  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const currentPage = Number(pageParam) || 1;
  const PAGE_SIZE = 10;

  // ✅ Backend returns: { error, status, payload: { vendor: {}, services: [] } }
  const rawServices = data?.payload?.services || [];

  const totalItems = rawServices.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  const start = (safePage - 1) * PAGE_SIZE;
  const paginatedServices = rawServices.slice(start, start + PAGE_SIZE);

  // ✅ Curried function — render time pe call nahi hoga (crash fix)
  const handleClickOpen = (id) => () => {
    setDeleteId(id);
  };

  const servicesData = {
    data: paginatedServices,
    count: totalPages,
    currentPage: safePage,
    total: totalItems
  };

  if (isError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" mb={2}>
          Puja services load nahi ho sake.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => refetch()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Table
        headData={SERVICE_TABLE_HEAD}
        data={servicesData}
        isLoading={isLoading}
        row={ServiceRow}
        hideActions={true}
        handleClickOpen={handleClickOpen}
      />
    </Box>
  );
}