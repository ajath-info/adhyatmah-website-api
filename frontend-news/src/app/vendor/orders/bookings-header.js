'use client';
import React from 'react';

// components
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';

// api
import * as api from 'src/services';
import { useQuery } from '@tanstack/react-query';

// Same shopType check the vendor sidebar uses to tell a product-selling
// shop (shopType: "seller") apart from a Pandit shop. Defaults to "Pandit"
// wording until the shop loads, and for shops that predate this field.
export default function BookingsHeader() {
    const { data: shopData } = useQuery({
        queryKey: ['vendor-shop-type'],
        queryFn: api.getShopByUser,
        staleTime: 5 * 60 * 1000,
        retry: false
    });
    const isSellerShop = shopData?.data?.shopType === 'seller';
    const heading = isSellerShop ? 'Product Bookings' : 'Pandit Bookings';

    return (
        <HeaderBreadcrumbs
            admin
            heading={heading}
            links={[
                {
                    name: 'Dashboard',
                    href: '/vendor/dashboard'
                },
                {
                    name: heading
                }
            ]}
        />
    );
}