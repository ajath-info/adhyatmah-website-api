import React from 'react';

// components
import BookingsHeader from './bookings-header';
import BookingsOrOrders from './bookings-or-orders';

// Meta information
export const metadata = {
  title: 'Booking Services - Adhyatmah',
  applicationName: 'Adhyatmah',
  authors: 'Adhyatmah'
};
export default function page() {
  return (
    <div>
      <BookingsHeader />
      <BookingsOrOrders />
    </div>
  );
}