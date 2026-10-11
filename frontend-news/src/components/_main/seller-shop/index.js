'use client';
import React, { useEffect } from 'react';
import { useRouter } from '@bprogress/next';
import { useSelector } from 'react-redux';
import SellerShopForm from '@/components/forms/seller-shop';

export default function SellerShopMain() {
    const { user, isInitialized } = useSelector((state) => state.user);
    const router = useRouter();
    useEffect(() => {
        // Same guard as the Become a Pandit flow: guests can create a shop,
        // only users who already have a non-customer role get redirected away.
        if (!isInitialized) return;
        if (user && user.role !== 'user') {
            router.push('/');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isInitialized, user]);
    return <SellerShopForm />;
}