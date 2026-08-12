'use client';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';

// mui
import { Card, CardContent, Typography, Stack, Divider, TextField, Button, Chip } from '@mui/material';

// icons
import { MdClose } from 'react-icons/md';

// hook
import { useCurrencyConvert } from '@/hooks/use-currency';
import { useCurrencyFormat } from '@/hooks/use-currency-format';

// api
import * as api from 'src/services';
import { useMutation } from '@tanstack/react-query';
PaymentInfo.propTypes = { setCouponCode: PropTypes.func.isRequired, setTotal: PropTypes.func.isRequired };

function isExpired(expirationDate) {
  const currentDateTime = new Date();
  return currentDateTime >= new Date(expirationDate);
}

export default function PaymentInfo({ setCouponCode, setTotal }) {
  const { product } = useSelector((state) => state);
  const { total, shipping, subtotal } = product.checkout;
  const [code, setCode] = useState('');
  const cCurrency = useCurrencyConvert();
  const fCurrency = useCurrencyFormat();

  const [discountPrice, setDiscountPrice] = useState(null);
  const [appliedDiscount, setDiscount] = useState(null);
  const [activeCoupons, setActiveCoupons] = useState([]);

  // Show which coupons are currently active for product checkout, above the
  // coupon input, so the user knows a coupon is available before typing.
  useEffect(() => {
    let cancelled = false;
    api
      .getActiveCouponCodes('product')
      .then((response) => {
        if (!cancelled) setActiveCoupons(response?.data || []);
      })
      .catch(() => {
        if (!cancelled) setActiveCoupons([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: (couponCode) => api.applyCouponCode(couponCode, 'product'),
    onSuccess: ({ data }) => {
      if (isExpired(data.expire)) {
        toast.error('Coupon code is expired!');
        return;
      }

      const { type, discount } = data;
      setCouponCode(code);

      const calculateDiscount = () => {
        if (type === 'percent') {
          const discountAmount = (discount / 100) * subtotal;
          const discountedTotal = subtotal - discountAmount;
          setDiscount(discountAmount);
          return { total: discountedTotal + shipping, saved: discountAmount };
        } else {
          const discountedTotal = subtotal - discount;
          setDiscount(discount);
          return { total: discountedTotal + shipping, saved: discount };
        }
      };

      const { total, saved } = calculateDiscount();
      setTotal(total);
      setDiscountPrice(total);

      toast.success(`Coupon code applied. You saved ${fCurrency(cCurrency(saved))}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Coupon code is not valid');
    }
  });

  const onApplyCoupon = () => {
    if (code.length > 3) {
      mutate(code);
    } else {
      toast.error('Enter valid coupon code.');
    }
  };

  // Clicking one of the shown "active coupons" fills the code in and
  // applies it right away, same as if the user typed it and pressed Apply.
  const onSelectActiveCoupon = (couponCode) => {
    setCode(couponCode);
    mutate(couponCode);
  };

  const onRemoveCoupon = () => {
    setCode('');
    setDiscount(null);
    setDiscountPrice(null);
    setCouponCode(null);
    setTotal(null);
  };
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ py: 2 }}>
        <Typography variant="h4" mb={1}>
          Payment Summary
        </Typography>

        <Stack spacing={0} mt={1} mb={2} gap={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Subtotal:
            </Typography>
            <Typography variant="subtitle2">{fCurrency(cCurrency(subtotal))}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Discount:
            </Typography>
            <Typography variant="subtitle2">-{fCurrency(cCurrency(appliedDiscount || 0))}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Shipping:
            </Typography>
            <Typography variant="subtitle2">{!shipping ? 'Free' : fCurrency(cCurrency(shipping))}</Typography>
          </Stack>

          {!discountPrice && activeCoupons.length > 0 && (
            <Stack gap={0.75}>
              <Typography variant="caption" color="text.secondary">
                Available coupons
              </Typography>
              <Stack direction="row" gap={1} flexWrap="wrap">
                {activeCoupons.map((coupon) => (
                  <Chip
                    key={coupon._id || coupon.code}
                    label={`${coupon.code} · ${coupon.type === 'percent' ? `${coupon.discount}% off` : `${fCurrency(cCurrency(coupon.discount))} off`}`}
                    variant="outlined"
                    color="primary"
                    onClick={() => onSelectActiveCoupon(coupon.code)}
                    disabled={isLoading}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </Stack>
          )}

          <Stack direction={'row'} gap={1}>
            {discountPrice ? (
              <Chip
                label={`${code} applied`}
                color="success"
                variant="outlined"
                onDelete={onRemoveCoupon}
                deleteIcon={<MdClose />}
              />
            ) : (
              <>
                <TextField
                  id="coupon-field"
                  fullWidth
                  placeholder="Enter coupon code"
                  size="small"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <Button
                  loading={isLoading}
                  onClick={onApplyCoupon}
                  variant="contained"
                  color="primary"
                  disabled={code.length < 4}
                >
                  Apply
                </Button>
              </>
            )}
          </Stack>
        </Stack>
        <Divider />
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} mt={2}>
          <Typography variant="subtitle1">Total:</Typography>
          <Typography variant="subtitle1">{fCurrency(cCurrency(discountPrice || total))}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}