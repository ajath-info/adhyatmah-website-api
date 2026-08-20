'use client';
import { Suspense } from 'react';
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
// api
import * as api from 'src/services';
// usequery
import { useQuery } from '@tanstack/react-query';
// mui
import { Dialog, Button } from '@mui/material';
// components
import DeleteDialog from 'src/components/dialog/delete';
import Table from 'src/components/table/table';
import Language from 'src/components/table/rows/language';
import FormDialog from '@/components/dialog/form-dialog';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import { IoMdAdd } from 'react-icons/io';
import LanguageForm from 'src/components/forms/language';

const TABLE_HEAD = [
    { id: 'label', label: 'Language' },
    { id: 'name', label: 'Key' },
    { id: 'order', label: 'Order' },
    { id: 'status', label: 'Status' },

    { id: '', label: 'Actions', alignRight: true }
];

function LanguageList() {
    const searchParams = useSearchParams();
    const pageParam = searchParams.get('page');
    const searchParam = searchParams.get('search');
    const [apicall, setApicall] = useState(false);
    const [id, setId] = useState(null);
    const [selected, setSelected] = useState(null);

    const { data, isPending: isLoading } = useQuery({
        queryKey: ['languages', apicall, searchParam, pageParam],
        queryFn: () => api.getLanguagesByAdmin(+pageParam || 1, searchParam || '')
    });

    const handleClickOpen = (prop) => () => {
        setId(prop);
    };
    const handleClose = () => {
        setId(null);
    };

    const onClickEdit = (language) => {
        setSelected(language);
    };
    return (
        <>
            <HeaderBreadcrumbs
                admin
                heading="Languages List"
                links={[
                    {
                        name: 'Admin Dashboard',
                        href: '/admin/dashboard'
                    },
                    {
                        name: 'Languages'
                    }
                ]}
                action={
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<IoMdAdd size={20} />}
                        onClick={() => setSelected(true)}
                    >
                        Add Language
                    </Button>
                }
            />
            <Dialog onClose={handleClose} open={id} maxWidth={'xs'}>
                <DeleteDialog
                    onClose={handleClose}
                    id={id}
                    apicall={setApicall}
                    endPoint="deleteLanguageByAdmin"
                    type={'Language deleted'}
                    deleteMessage={
                        'Are you sure you want to delete this language? Pandits who already selected it will keep it on their profile, but it will no longer show up as an option.'
                    }
                />
            </Dialog>
            <FormDialog title={'Language'} open={selected} handleClose={() => setSelected(null)}>
                <LanguageForm
                    data={typeof selected === 'boolean' ? null : selected}
                    handleClose={() => {
                        setApicall(!apicall);
                        setSelected(null);
                    }}
                    handleCancel={() => setSelected(null)}
                />
            </FormDialog>
            <Table
                headData={TABLE_HEAD}
                data={data}
                isLoading={isLoading}
                row={Language}
                handleClickOpen={handleClickOpen}
                onClickEdit={onClickEdit}
                isSearch
            />
        </>
    );
}

// Suspense boundary: this component reads useSearchParams(); Next.js requires a
// <Suspense> wrapper on statically rendered routes (CSR bailout rule).
export default function LanguageListSuspenseWrapper(props) {
    return (
        <Suspense fallback={null}>
            <LanguageList {...props} />
        </Suspense>
    );
}