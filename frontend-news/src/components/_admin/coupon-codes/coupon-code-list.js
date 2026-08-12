'use client';
import { Suspense } from 'react';
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';

// api
import * as api from 'src/services';
import { useQuery } from '@tanstack/react-query';

// mui
import { Dialog } from '@mui/material';

// components
import DeleteDialog from 'src/components/dialog/delete';
import Table from 'src/components/table/table';
import CouponCode from '@/components/table/rows/coupon-code';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name' },
  { id: 'coupon', label: 'Coupon code' },
  { id: 'type', label: 'Type' },
  { id: 'discount', label: 'Discount' },
  { id: 'appliesTo', label: 'Applies To' },
  { id: 'applyDate', label: 'Apply Date' },
  { id: 'expire', label: 'Expire' },
  { id: '', label: 'actions' }
];

const APPLIES_TO_FILTER = [
  { slug: 'product', name: 'Products' },
  { slug: 'service', name: 'Services' },
  { slug: 'pandit', name: 'Pandit Booking' },
  { slug: 'all', name: 'All' }
];

// ----------------------------------------------------------------------
function CouponCodesMain() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const searchParam = searchParams.get('search');
  const appliesToParam = searchParams.get('appliesTo');
  const [open, setOpen] = useState(false);
  const [apicall, setApicall] = useState(false);
  const [id, setId] = useState(null);

  const { data, isPending: isLoading } = useQuery({
    queryKey: ['coupon-codes', apicall, searchParam, pageParam, appliesToParam],
    queryFn: () => api.getCouponCodesByAdmin(+pageParam || 1, searchParam || '', appliesToParam || '')
  });

  const handleClickOpen = (prop) => () => {
    setId(prop);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Dialog onClose={handleClose} open={open} maxWidth={'xs'}>
        <DeleteDialog
          onClose={handleClose}
          id={id}
          apicall={setApicall}
          endPoint="deleteCouponCodeByAdmin"
          type={'Coupon code deleted'}
          deleteMessage={'Are you sure you want Delete to Coupon Code!'}
        />
      </Dialog>
      <Table
        headData={TABLE_HEAD}
        data={data}
        isLoading={isLoading}
        row={CouponCode}
        handleClickOpen={handleClickOpen}
        isSearch
        filters={[{ name: 'Applies To', param: 'appliesTo', data: APPLIES_TO_FILTER }]}
      />
    </>
  );
}

// Suspense boundary: this component reads useSearchParams(); Next.js requires a
// <Suspense> wrapper on statically rendered routes (CSR bailout rule).
export default function CouponCodesMainSuspenseWrapper(props) {
  return (
    <Suspense fallback={null}>
      <CouponCodesMain {...props} />
    </Suspense>
  );
}