'use client';
import { Suspense } from 'react';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Dialog } from '@mui/material';

import * as api from 'src/services';

import DeleteDialog from 'src/components/dialog/delete';
import Table from 'src/components/table/table';
import JobRow from 'src/components/table/rows/job';

const TABLE_HEAD = [
    { id: 'title', label: 'Job' },
    { id: 'department', label: 'Department' },
    { id: 'location', label: 'Location' },
    { id: 'applicationsCount', label: 'Applications' },
    { id: 'status', label: 'Status' },
    { id: 'postedAt', label: 'Posted' },
    { id: '', label: 'Actions' }
];

function JobList() {

    const searchParams = useSearchParams();

    const [open, setOpen] = useState(false);
    const [id, setId] = useState(null);
    const [apiCall, setApiCall] = useState(false);

    const { data, isPending: isLoading } = useQuery({
        queryKey: ['career-jobs', apiCall, searchParams.toString()],
        queryFn: () => api.getCareerJobsByAdmin(searchParams.toString())
    });

    const handleClickOpen = (id) => () => {
        setId(id);
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
                    endPoint="deleteCareerJobByAdmin"
                    type="Job deleted"
                    deleteMessage="Are you sure you want to delete this job? All applications received for this job will also be deleted."
                />

            </Dialog>

            <Table
                headData={TABLE_HEAD}
                data={data}
                row={JobRow}
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
export default function JobListSuspenseWrapper(props) {
    return (
        <Suspense fallback={null}>
            <JobList {...props} />
        </Suspense>
    );
}