'use client';

import React, { use } from 'react';
import PropTypes from 'prop-types';

import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import EditBlogCategory from '@/components/_admin/blogs/category/edit-blog-category';

import * as api from 'src/services';

import { useQuery } from '@tanstack/react-query';

Page.propTypes = {
  params: PropTypes.shape({
    slug: PropTypes.string.isRequired
  }).isRequired
};

export default function Page(props) {

  const params = use(props.params);

  const { data, isPending } = useQuery({

    queryKey: [
      'blog-category',
      params.slug
    ],

    queryFn: () =>
      api.getBlogByAdmin(params.slug)

  });

  return (
    <>
      <HeaderBreadcrumbs
        admin
        heading="Edit Blog Category"
        links={[
          {
            name: 'Dashboard',
            href: '/admin/dashboard'
          },
          {
            name: 'Blog Categories',
            href: '/admin/blog-categories'
          },
          {
            name: 'Edit Blog Category'
          }
        ]}
      />

      <EditBlogCategory
        data={data?.data}
        isLoading={isPending}
      />
    </>
  );

}