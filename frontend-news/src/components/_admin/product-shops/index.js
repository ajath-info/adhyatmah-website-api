'use client';
import { Suspense } from 'react';
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';

// api
import * as api from 'src/services';
import { useQuery } from '@tanstack/react-query';

// components
import Table from 'src/components/table/table';
import ProductShopRow from 'src/components/table/rows/product-shop';

const TABLE_HEAD = [
    { id: 'name', label: 'Shop' },
    { id: 'owner', label: 'Owner' },
    { id: 'products', label: 'Products' },
    { id: 'status', label: 'Status' },
    { id: '', label: 'Actions' }
];

const SHOP_STATUS_FILTERS = {
    name: 'Status',
    param: 'status',
    data: [
        { name: 'Active', slug: 'approved' },
        { name: 'Pending', slug: 'pending' },
        { name: 'Rejected', slug: 'rejected' },
        { name: 'Inactive', slug: 'inactive' }
    ]
};

function AdminProductShops() {
    const searchParams = useSearchParams();
    const pageParam = searchParams.get('page');
    const searchParam = searchParams.get('search');
    const statusParam = searchParams.get('status');
    const [apicall, setApicall] = useState(false);

    const { data, isPending: isLoading } = useQuery({
        queryKey: ['admin-product-shops', apicall, searchParam, pageParam, statusParam],
        // shopType: 'seller' keeps this scoped to Product Seller shops only —
        // Pandit shops (existing /admin/shops page) are completely unaffected.
        queryFn: () => api.getShopsByAdmin(+pageParam || 1, searchParam || '', 'seller', statusParam || '')
    });

    return (
        <Table
            headData={TABLE_HEAD}
            data={data}
            isLoading={isLoading}
            row={ProductShopRow}
            apicall={setApicall}
            isSearch
            filters={[{ ...SHOP_STATUS_FILTERS }]}
        />
    );
}

// Suspense boundary: this component reads useSearchParams(); Next.js requires a
// <Suspense> wrapper on statically rendered routes (CSR bailout rule).
export default function AdminProductShopsSuspenseWrapper(props) {
    return (
        <Suspense fallback={null}>
            <AdminProductShops {...props} />
        </Suspense>
    );
}