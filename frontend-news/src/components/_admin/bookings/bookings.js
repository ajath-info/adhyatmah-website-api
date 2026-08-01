'use client';
import { Suspense } from 'react';
import React, { useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Table from 'src/components/table/table';
import BookingRow from '@/components/table/rows/booking';
import BookingPanditReassignDialog from './booking-pandit-reassign-dialog';
import BookingStatusUpdateDialog from './booking-status-update-dialog';
import * as api from 'src/services';
import { useQuery } from '@tanstack/react-query';

const TABLE_HEAD = [
  { id: 'customer',      label: 'Customer' },
  { id: 'vendor',        label: 'Pandit' },
  { id: 'paymentAmount', label: 'Total' },
  { id: 'poojaType',     label: 'Pooja Service' },
  { id: 'duration',      label: 'Duration' },
  { id: 'status',        label: 'Status' },
  { id: 'dateTime',      label: 'Date' },
  { id: '',              label: 'Actions' }
];

const STATUS_FILTER = {
  name: 'Status',
  param: 'status',
  data: [
    // { name: 'All',       slug: '' },
    { name: 'Pending',   slug: 'pending' },
    { name: 'Accepted',  slug: 'accept' },
    { name: 'Ongoing',   slug: 'ongoing' },
    { name: 'Upcoming',  slug: 'upcoming' },
    { name: 'Completed', slug: 'completed' },
    { name: 'Cancelled', slug: 'cancelled' }
  ]
};

const PAGE_SIZE = 10; // ek page par kitni rows

function AdminBookingsMain({ isVendor = false }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const statusParam  = searchParams.get('status') || '';
  const searchParam  = (searchParams.get('search') || '').trim().toLowerCase();
  const currentPage  = Number(searchParams.get('page') || 1);

  const [reassignBookingId, setReassignBookingId] = useState(null);

  const { data, isPending: isLoading } = useQuery({
    queryKey: isVendor
      ? ['vendor-bookings', statusParam, searchParam, currentPage]
      : ['admin-bookings', statusParam, searchParam],
    queryFn: () => {
      if (isVendor) {
        const params = new URLSearchParams();
        params.set('page', currentPage);
        params.set('limit', PAGE_SIZE);
        if (statusParam) params.set('status', statusParam);
        if (searchParam) params.set('search', searchParam);
        return api.getBookingsByVendor(params.toString());
      }
      return api.getUserBookings('all');
    },
    retry: 1
  });

  const transformedData = useMemo(() => {
    // Vendor: backend already paginates/filters — bookings jinhe iss pandit ko
    // customers ne book kiya hai
    if (isVendor) {
      const payload = data?.data || {};
      return {
        data:        payload.data || [],
        total:       payload.total || 0,
        count:       payload.count || payload.totalPages || 1,
        currentPage: payload.currentPage || currentPage
      };
    }

    const all = data?.payload?.bookings || [];

    const sorted = [...all].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const filtered = sorted.filter((b) => {
      const matchStatus = !statusParam || b.status === statusParam;
      if (!matchStatus) return false;
      if (!searchParam) return true;

      const hay = [
        `${b.customer?.firstName || ''} ${b.customer?.lastName || ''}`,
        b.customer?.email,
        `${b.vendor?.firstName || ''} ${b.vendor?.lastName || ''}`,
        b.bookingID,
        b.poojaType
      ].filter(Boolean).join(' ').toLowerCase();

      return hay.includes(searchParam);
    });

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    const safePage   = Math.min(Math.max(currentPage, 1), totalPages || 1);

    const start      = (safePage - 1) * PAGE_SIZE;
    const paginated  = filtered.slice(start, start + PAGE_SIZE);

    return {
      data:        paginated,
      total:       totalItems,
      count:       totalPages,  
      currentPage: safePage
    };
  }, [data, statusParam, searchParam, currentPage, isVendor]);

  // Page change hone par URL update karo (status/search preserve karte hue)
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <Table
        headData={TABLE_HEAD}
        data={transformedData}
        isLoading={isLoading}
        row={BookingRow}
        handleClickOpen={(id) => setReassignBookingId(id)}
        isVendor={isVendor}
        isSearch
        filters={[STATUS_FILTER]}
        onPageChange={handlePageChange} 
      />

      {isVendor ? (
        <BookingStatusUpdateDialog
          open={Boolean(reassignBookingId)}
          bookingId={reassignBookingId}
          currentStatus={transformedData.data.find((b) => b._id === reassignBookingId)?.status}
          onClose={() => setReassignBookingId(null)}
        />
      ) : (
        <BookingPanditReassignDialog
          open={Boolean(reassignBookingId)}
          bookingId={reassignBookingId}
          onClose={() => setReassignBookingId(null)}
        />
      )}
    </>
  );
}
// Suspense boundary: this component reads useSearchParams(); Next.js requires a
// <Suspense> wrapper on statically rendered routes (CSR bailout rule).
export default function AdminBookingsMainSuspenseWrapper(props) {
  return (
    <Suspense fallback={null}>
      <AdminBookingsMain {...props} />
    </Suspense>
  );
}
