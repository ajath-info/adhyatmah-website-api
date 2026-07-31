'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Dialog } from '@mui/material';

import * as api from 'src/services';

import DeleteDialog from '@/components/dialog/delete';
import Table from '@/components/table/table';
import ArticleRow from '@/components/table/rows/article';

const TABLE_HEAD = [
    {
        id: 'title',
        label: 'Article'
    },
    {
        id: 'blog',
        label: 'Category'
    },
    {
        id: 'status',
        label: 'Status'
    },
    {
        id: 'publishedAt',
        label: 'Published'
    },
    {
        id: '',
        label: 'Actions'
    }
];

export default function ArticleList() {
    const searchParams = useSearchParams();

    const page = searchParams.get('page') || 1;
    const search = searchParams.get('search') || '';

    const [open, setOpen] = useState(false);
    const [id, setId] = useState(null);
    const [apiCall, setApiCall] = useState(false);

    const { data, isPending: isLoading } = useQuery({
        queryKey: [
            'articles',
            page,
            search,
            apiCall
        ],
        queryFn: () =>
            api.getArticlesByAdmin(
                `page=${page}&search=${search}`
            )
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
                    endPoint="deleteArticleByAdmin"
                    type="Article deleted"
                    deleteMessage="Are you sure you want to delete this article?"
                />
            </Dialog>

            <Table
                headData={TABLE_HEAD}
                data={data}
                row={ArticleRow}
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
        {
            name: 'Active',
            slug: 'active'
        },
        {
            name: 'Inactive',
            slug: 'inactive'
        }
    ]
};