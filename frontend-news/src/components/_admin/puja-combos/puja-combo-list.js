'use client';
import { Suspense } from 'react';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Dialog } from '@mui/material';

import * as api from 'src/services';

import DeleteDialog from 'src/components/dialog/delete';
import Table from 'src/components/table/table';
import PujaComboRow from 'src/components/table/rows/puja-combo';

const TABLE_HEAD = [
    { id: 'name', label: 'Combo' },
    { id: 'puja', label: 'Puja Service' },
    { id: 'kit', label: 'Puja Kit' },
    { id: 'comboPrice', label: 'Combo Price' },
    { id: 'discount', label: 'Discount' },
    { id: 'status', label: 'Status' },
    { id: 'isFeatured', label: 'Homepage' },
    { id: '', label: 'Actions' }
];

const STATUS_FILTER = {
    name: 'Status',
    param: 'status',
    data: [
        { name: 'Active', slug: 'active' },
        { name: 'Inactive', slug: 'inactive' },
        { name: 'Archived', slug: 'archived' }
    ]
};

const FEATURED_FILTER = {
    name: 'Homepage',
    param: 'featured',
    data: [
        { name: 'Featured', slug: 'true' },
        { name: 'Not featured', slug: 'false' }
    ]
};

function PujaComboList() {
    const searchParams = useSearchParams();

    const [open, setOpen] = useState(false);
    const [id, setId] = useState(null);
    const [apiCall, setApiCall] = useState(false);

    const { data, isPending: isLoading } = useQuery({
        queryKey: ['puja-combos', apiCall, searchParams.toString()],
        queryFn: () => api.getPujaCombosByAdmin(searchParams.toString())
    });

    const handleClickOpen = (slug) => () => {
        setId(slug);
        setOpen(true);
    };

    return (
        <>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs">
                <DeleteDialog
                    id={id}
                    apicall={setApiCall}
                    onClose={() => setOpen(false)}
                    endPoint="deletePujaComboByAdmin"
                    type="Combo archived"
                    deleteMessage="Archive this combo? It will be hidden from the website. The linked Puja Service, Pandits and Kit are NOT deleted."
                />
            </Dialog>

            <Table
                headData={TABLE_HEAD}
                data={data}
                row={PujaComboRow}
                isLoading={isLoading}
                handleClickOpen={handleClickOpen}
                isSearch
                filters={[STATUS_FILTER, FEATURED_FILTER]}
            />
        </>
    );
}

// Suspense boundary: reads useSearchParams()
export default function PujaComboListSuspenseWrapper(props) {
    return (
        <Suspense fallback={null}>
            <PujaComboList {...props} />
        </Suspense>
    );
}