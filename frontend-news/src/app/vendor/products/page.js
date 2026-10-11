import React from 'react';

// components
import ProductList from '@/components/_admin/products/products';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';

// Meta information
export const metadata = {
  title: 'Products - adhyatmah',
  applicationName: 'adhyatmah',
  authors: 'adhyatmah'
};
export default async function AdminProducts() {
  return (
    <div>
      <HeaderBreadcrumbs
        admin
        heading="Products"
        links={[
          {
            name: 'Dashboard',
            href: '/vendor/dashboard'
          },
          {
            name: 'Products'
          }
        ]}
        action={{
          href: `/vendor/products/add`,
          title: 'Add Product'
        }}
      />
      <ProductList isVendor />
    </div>
  );
}