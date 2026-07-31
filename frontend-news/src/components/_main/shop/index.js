'use client';
import React, { useEffect } from 'react';
import { useRouter } from '@bprogress/next';
import { useSelector } from 'react-redux';
import ShopForm from '@/components/forms/shop';

export default function AdminShopMain() {
  const { user, isInitialized } = useSelector((state) => state.user);
  const router = useRouter();
  useEffect(() => {
    // Wait until the persisted user session has actually finished loading
    // before deciding to redirect — otherwise `user` is still null/undefined
    // for a moment on every page load (even for logged-in users) and this
    // would bounce everyone back to home before their session is restored.
    if (!isInitialized) return;

    // Guests (not signed in) can create a pandit profile — same as mobile.
    // Only redirect away users who already have a non-customer role.
    if (user && user.role !== 'user') {
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, user]);
  return <ShopForm type="create-shop" />;
}