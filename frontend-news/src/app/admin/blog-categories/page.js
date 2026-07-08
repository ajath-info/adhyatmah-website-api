import React from 'react';

import BlogCategoryList from '@/components/_admin/blogs/category/blog-category-list';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';

export const metadata = {
  title: 'Blog Categories - adhyatmah',
  applicationName: 'adhyatmah',
  authors: 'adhyatmah'
};

export default function BlogCategories() {
  return (
    <>
      <HeaderBreadcrumbs
        admin
        heading="Blog Categories"
        links={[
          {
            name: 'Dashboard',
            href: '/admin/dashboard'
          },
          {
            name: 'Blog Categories'
          }
        ]}
        action={{
          href: '/admin/blog-categories/add',
          title: 'Add Blog Category'
        }}
      />

      <BlogCategoryList />
    </>
  );
}