'use client';
import React from 'react';

// components
import VendorBookingsMain from '@/components/_admin/bookings/bookings';
import OrdersMain from '@/components/_admin/orders/orders';

// api
import * as api from 'src/services';
import { useQuery } from '@tanstack/react-query';

// Same shopType check the vendor sidebar/dashboard use to tell a
// product-selling shop (shopType: "seller") apart from a Pandit shop.
// A seller shop's customers place real product Orders, not pooja
// Bookings, so this page must fetch/render the right dataset for each.
export default function BookingsOrOrders() {
    const { data: shopData, isPending } = useQuery({
        queryKey: ['vendor-shop-type'],
        queryFn: api.getShopByUser,
        staleTime: 5 * 60 * 1000,
        retry: false
    });
    const isSellerShop = shopData?.data?.shopType === 'seller';

    if (isPending) return null;

    return isSellerShop ? <OrdersMain isVendor /> : <VendorBookingsMain isVendor />;
}