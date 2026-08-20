'use client';
import { Suspense } from 'react';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Dialog } from '@mui/material';

import * as api from 'src/services';

import DeleteDialog from 'src/components/dialog/delete';
import Table from 'src/components/table/table';
import JobApplicationRow from 'src/components/table/rows/job-application';

const TABLE_HEAD = [
    { id: 'name', label: 'Candidate' },
    { id: 'job', label: 'Job' },
    { id: 'phone', label: 'Phone' },
    { id: 'experience', label: 'Experience' },
    { id: 'status', label: 'Status' },
    { id: 'createdAt', label: 'Applied' },
    { id: '', label: 'Actions' }
];

function ApplicationList() {

    const searchParams = useSearchParams();

    const [open, setOpen] = useState(false);
    const [id, setId] = useState(null);
    const [apiCall, setApiCall] = useState(false);

    const { data, isPending: isLoading } = useQuery({
        queryKey: ['career-applications', apiCall, searchParams.toString()],
        queryFn: () => api.getCareerApplicationsByAdmin(searchParams.toString())
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
                    endPoint="deleteCareerApplicationByAdmin"
                    type="Application deleted"
                    deleteMessage="Are you sure you want to delete this application?"
                />

            </Dialog>

            <Table
                headData={TABLE_HEAD}
                data={data}
                row={JobApplicationRow}
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
        { name: 'Applied', slug: 'Applied' },
        { name: 'Shortlisted', slug: 'Shortlisted' },
        { name: 'Interview', slug: 'Interview' },
        { name: 'Selected', slug: 'Selected' },
        { name: 'Rejected', slug: 'Rejected' }
    ]
};

// Suspense boundary: this component reads useSearchParams(); Next.js requires a
// <Suspense> wrapper on statically rendered routes (CSR bailout rule).
export default function ApplicationListSuspenseWrapper(props) {
    return (
        <Suspense fallback={null}>
            <ApplicationList {...props} />
        </Suspense>
    );
}