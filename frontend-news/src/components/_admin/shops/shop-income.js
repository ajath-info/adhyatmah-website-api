// 'use client';
// import { Suspense } from 'react';
// import React, { useState, useEffect } from 'react';
// import { useSearchParams } from 'next/navigation';

// import PropTypes from 'prop-types';
// // api
// import * as api from 'src/services';
// import { useQuery } from '@tanstack/react-query';
// // components
// import Table from 'src/components/table/table';
// import IncomeList from '@/components/table/rows/payment';
// import EditPaymentDialog from '@/components/dialog/edit-payment';

// // mui
// import { Typography } from '@mui/material';
// const TABLE_HEAD = [
//   //   { id: 'name', label: 'Pandit'},
//   { id: 'items', label: 'Sale' },
//   { id: 'total', label: 'Total' },
//   { id: 'earning', label: 'Total Income' },
//   { id: 'commission', label: 'commission' },

//   { id: 'status', label: 'status' },
//   { id: 'createdAt', label: 'Created' },
//   { id: '', label: 'actions', align: 'right' }
// ];
// function ShopIcomeList({ slug, onUpdatePayment, isVendor }) {
//   const searchParams = useSearchParams();
//   const pageParam = searchParams.get('page');
//   const [payment, setPayment] = useState(null);
//   const [count, setCount] = useState(0);

//   const { data, isPending: loadingList } = useQuery({
//     queryKey: ['income', slug, pageParam, count, isVendor], // Added all dependencies
//     queryFn: () => api[isVendor ? 'getIncomeByVendor' : 'getShopIncomeByAdmin'](slug, pageParam)
//   });

//   useEffect(() => {
//     if (data) {
//       onUpdatePayment(); // Handle success case
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [data]);

//   const isLoading = loadingList;

//   return (
//     <div>
//       <Typography variant="h5" color="text.primary" mb={1}>
//         Income Report
//       </Typography>

//       <Table
//         headData={TABLE_HEAD}
//         data={data}
//         isLoading={isLoading}
//         row={IncomeList}
//         handleClickOpen={(v) => setPayment(v)}
//         isVendor={isVendor}
//       />

//       <EditPaymentDialog
//         handleClose={() => setPayment(null)}
//         open={Boolean(payment)}
//         data={payment}
//         setCount={setCount}
//       />
//     </div>
//   );
// }
// ShopIcomeList.propTypes = { 
//   isVendor: PropTypes.bool, 
//   slug: PropTypes.string, 
//   onUpdatePayment: PropTypes.func 
// };

// // Suspense boundary: this component reads useSearchParams(); Next.js requires a
// // <Suspense> wrapper on statically rendered routes (CSR bailout rule).
// export default function ShopIcomeListSuspenseWrapper(props) {
//   return (
//     <Suspense fallback={null}>
//       <ShopIcomeList {...props} />
//     </Suspense>
//   );
// }


'use client';
import { Suspense } from 'react';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import PropTypes from 'prop-types';
// api
import * as api from 'src/services';
import { useQuery } from '@tanstack/react-query';
// components
import Table from 'src/components/table/table';
import IncomeList from '@/components/table/rows/payment';
import EditPaymentDialog from '@/components/dialog/edit-payment';

// mui
import { Typography, Stack, Button } from '@mui/material';
import { MdAdd } from 'react-icons/md';
const TABLE_HEAD = [
  //   { id: 'name', label: 'Pandit'},
  { id: 'items', label: 'Sale' },
  { id: 'total', label: 'Total' },
  { id: 'earning', label: 'Total Income' },
  { id: 'commission', label: 'commission' },

  { id: 'status', label: 'status' },
  { id: 'createdAt', label: 'Created' },
  { id: '', label: 'actions', align: 'right' }
];
function ShopIcomeList({ slug, shopId, onUpdatePayment, isVendor }) {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const [payment, setPayment] = useState(null);
  const [count, setCount] = useState(0);

  const { data, isPending: loadingList } = useQuery({
    queryKey: ['income', slug, pageParam, count, isVendor], // Added all dependencies
    queryFn: () => api[isVendor ? 'getIncomeByVendor' : 'getShopIncomeByAdmin'](slug, pageParam)
  });

  // Notify the parent (Shop Details page) so its totals/cards refresh, but
  // only when a payment was actually added/edited here (local `count` bumps
  // on that mutation's onSuccess — see EditPaymentDialog). `count` starts at
  // 0 and only a real mutation moves it past 0, so gating on that (instead of
  // a "skip the first effect run" ref) is what actually prevents the loop:
  // a ref-based skip breaks under React 18 Strict Mode, which double-invokes
  // effects on mount without resetting refs in between — the ref ends up
  // already flipped to `false` on the second simulated mount, so
  // onUpdatePayment fired on every mount anyway. That refetches the parent's
  // `shop-by-admin` query, which remounts this component, which fires again —
  // the infinite shiva-ojha/products/orders/income request loop.
  useEffect(() => {
    if (count > 0) {
      onUpdatePayment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const isLoading = loadingList;

  // Opens the same dialog used for editing, but with no `_id` — the dialog
  // (and its mutation) already switches to createPaymentByAdmin whenever
  // data._id is missing, so no new mutation wiring is needed here.
  const handleAddPayment = () => {
    setPayment({
      shop: shopId,
      orders: [],
      date: new Date().toISOString(),
      total: '',
      totalIncome: '',
      totalCommission: '',
      status: 'pending'
    });
  };

  return (
    <div>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h5" color="text.primary">
          Income Report
        </Typography>
        {!isVendor && shopId && (
          <Button size="small" variant="contained" startIcon={<MdAdd />} onClick={handleAddPayment}>
            Add Payment
          </Button>
        )}
      </Stack>

      <Table
        headData={TABLE_HEAD}
        data={data}
        isLoading={isLoading}
        row={IncomeList}
        handleClickOpen={(v) => setPayment(v)}
        isVendor={isVendor}
      />

      <EditPaymentDialog
        handleClose={() => setPayment(null)}
        open={Boolean(payment)}
        data={payment}
        setCount={setCount}
      />
    </div>
  );
}
ShopIcomeList.propTypes = {
  isVendor: PropTypes.bool,
  slug: PropTypes.string,
  shopId: PropTypes.string,
  onUpdatePayment: PropTypes.func
};

// Suspense boundary: this component reads useSearchParams(); Next.js requires a
// <Suspense> wrapper on statically rendered routes (CSR bailout rule).
export default function ShopIcomeListSuspenseWrapper(props) {
  return (
    <Suspense fallback={null}>
      <ShopIcomeList {...props} />
    </Suspense>
  );
}