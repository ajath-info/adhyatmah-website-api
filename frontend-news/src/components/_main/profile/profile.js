'use client';
// react
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from '@bprogress/next';

// api
import * as api from 'src/services';
import { useSelector } from 'react-redux';
import ProfileSettingsForm from '@/components/forms/profile';

export default function ProfileSettingsMain() {
  const { user: adminUser } = useSelector(({ user }) => user);
  const pathname = usePathname();
  const router = useRouter();

  const { data, isPending: isLoading } = useQuery({ queryKey: ['user-profile'], queryFn: api.getProfile });

  const user = data?.data || null;

  // vendors also have a Pandit/Shop profile which holds a few extra
  // fields (designation, services, language) — fetch it so those fields
  // can be edited from this same settings form.
  const { data: shopData, isPending: isShopLoading } = useQuery({
    queryKey: ['get-vendor-shop'],
    queryFn: api.getVendorShop,
    retry: false,
    enabled: adminUser?.role === 'vendor'
  });

  React.useEffect(() => {
    if (!pathname.includes('dashboard') && adminUser?.role?.includes('admin')) {
      router.push('/admin/settings');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProfileSettingsForm
      isLoading={isLoading}
      user={user}
      shop={shopData?.data}
      isShopLoading={adminUser?.role === 'vendor' && isShopLoading}
    />
  );
}