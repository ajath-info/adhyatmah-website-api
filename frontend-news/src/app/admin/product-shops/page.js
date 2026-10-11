import React from 'react';

// components
import ProductShopsMain from '@/components/_admin/product-shops';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';

// Meta information
export const metadata = {
    title: 'Shops - adhyatmah',
    applicationName: 'adhyatmah',
    authors: 'adhyatmah'
};

export default async function AdminProductShops() {
    return (
        <div>
            <HeaderBreadcrumbs
                admin
                heading="Shops"
                links={[
                    {
                        name: 'Dashboard',
                        href: '/admin/dashboard'
                    },
                    {
                        name: 'Shops'
                    }
                ]}
            />
            <ProductShopsMain />
        </div>
    );
}