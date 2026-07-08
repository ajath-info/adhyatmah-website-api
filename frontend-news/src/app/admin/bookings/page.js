import React from 'react';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import AdminBookingsMain from '@/components/_admin/bookings/bookings';

export const metadata = {
  title: 'Bookings - adhyatmah',
};

export default function BookingsPage() {
  return (
    <div>
      <HeaderBreadcrumbs
        admin
        heading="Bookings List"
        links={[
          { name: 'Dashboard', href: '/admin/dashboard' },
          { name: 'Bookings' }
        ]}
      />
      <AdminBookingsMain />
    </div>
  );
}