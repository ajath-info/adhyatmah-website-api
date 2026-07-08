'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Dialog } from '@mui/material';

import * as api from 'src/services';

import DeleteDialog from 'src/components/dialog/delete';
import Table from 'src/components/table/table';
import BlogCategoryRow from 'src/components/table/rows/blog-category';

const TABLE_HEAD = [
  {
    id: 'title',
    label: 'Category'
  },
  {
    id: 'description',
    label: 'Description'
  },
  {
    id: 'status',
    label: 'Status'
  },
  {
    id: 'createdAt',
    label: 'Created'
  },
  {
    id: '',
    label: 'Actions'
  }
];

export default function BlogCategoryList() {

  const searchParams = useSearchParams();

  const pageParam = searchParams.get('page');

  const searchParam = searchParams.get('search');

  const [open, setOpen] = useState(false);

  const [id, setId] = useState(null);

  const [apiCall, setApiCall] = useState(false);

  const { data, isPending: isLoading } = useQuery({

    queryKey: [
      'blog-categories',
      apiCall,
      pageParam,
      searchParam
    ],

    queryFn: () =>
      api.getBlogsByAdmin(
        +pageParam || 1,
        searchParam || ''
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
          endPoint="deleteBlogByAdmin"
          type="Blog Category deleted"
          deleteMessage="Are you sure you want to delete this blog category?"
        />

      </Dialog>

      <Table
        headData={TABLE_HEAD}
        data={data}
        row={BlogCategoryRow}
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