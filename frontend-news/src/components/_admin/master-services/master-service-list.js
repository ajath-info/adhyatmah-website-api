'use client';
import { Suspense } from 'react';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Dialog } from '@mui/material';

import * as api from 'src/services';

import DeleteDialog from 'src/components/dialog/delete';
import Table from 'src/components/table/table';
import MasterServiceRow from 'src/components/table/rows/master-service';

const TABLE_HEAD = [
    { id: 'name', label: 'Service' },
    { id: 'price', label: 'Price' },
    { id: 'duration', label: 'Duration' },
    { id: 'status', label: 'Status' },
    { id: 'createdAt', label: 'Created' },
    { id: '', label: 'Actions' }
];

function MasterServiceList() {

    const searchParams = useSearchParams();

    const [open, setOpen] = useState(false);
    const [id, setId] = useState(null);
    const [apiCall, setApiCall] = useState(false);

    const { data, isPending: isLoading } = useQuery({
        queryKey: ['master-services', apiCall, searchParams.toString()],
        queryFn: () => api.getMasterServicesByAdmin(searchParams.toString())
    });

    const handleClickOpen = (slug) => () => {
        setId(slug);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>

            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="xs"
            >

                <DeleteDialog
                    id={id}
                    apicall={setApiCall}
                    onClose={handleClose}
                    endPoint="deleteMasterServiceByAdmin"
                    type="Master Service deleted"
                    deleteMessage="Are you sure you want to delete this master service? Existing pandit/vendor services for this pooja will NOT be deleted."
                />

            </Dialog>

            <Table
                headData={TABLE_HEAD}
                data={data}
                row={MasterServiceRow}
                isLoading={isLoading}
                handleClickOpen={handleClickOpen}
                isSearch
                filters={[STATUS_FILTER]}
            />

        </>
    );

}

const STATUS_FILTER = {
    name: 'Status',
    param: 'status',
    data: [
        { name: 'Active', slug: 'active' },
        { name: 'Inactive', slug: 'inactive' }
    ]
};

// Suspense boundary: this component reads useSearchParams(); Next.js requires a
// <Suspense> wrapper on statically rendered routes (CSR bailout rule).
export default function MasterServiceListSuspenseWrapper(props) {
    return (
        <Suspense fallback={null}>
            <MasterServiceList {...props} />
        </Suspense>
    );
}