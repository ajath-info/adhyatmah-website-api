import React from 'react';

import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import AddBlogCategory from '@/components/_admin/blogs/category/add-blog-category';

export const metadata = {
  title: 'Add Blog Category - adhyatmah',
  applicationName: 'adhyatmah',
  authors: 'adhyatmah'
};

export default function Page() {
  return (
    <>
      <HeaderBreadcrumbs
        admin
        heading="Add Blog Category"
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
            name: 'Add Blog Category'
          }
        ]}
      />

      <AddBlogCategory />
    </>
  );
}