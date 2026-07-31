'use client';
import React from 'react';
// mui
import { Box, Grid } from '@mui/material';
// redux
import { useDispatch, useSelector } from 'react-redux';
// components
import { getCart } from '@/redux/slices/product';
import ShoppingCart from '@/components/_main/cart/shopping-cart';
import PaymentSummary from '@/components/_main/cart/payment-summary';
import { getSyncedCart } from '@/services';

export default function CartMain() {
  const dispatch = useDispatch();
  const { checkout } = useSelector(({ product }) => product);
  const { cart, shipping } = checkout;
  const { isAuthenticated } = useSelector(({ user }) => user);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadCart = async () => {
      // Logged-in users: pull the real cart from the account (DB) so any
      // add/remove done on the app also reflects here on the website.
      if (isAuthenticated) {
        try {
          const res = await getSyncedCart();
          dispatch(getCart({ cart: res?.data || [], shipping }));
          setLoading(false);
          return;
        } catch {
          // If the sync call fails, fall back to the existing local cart below
          // so the page still works exactly as before.
        }
      }
      dispatch(getCart({ cart, shipping }));
      setLoading(false);
    };
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <Box py={5}>
        <Grid container spacing={2}>
          <Grid size={{ md: 8, xs: 12 }}>
            <ShoppingCart loading={loading} />
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <PaymentSummary loading={loading} cart={cart} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}