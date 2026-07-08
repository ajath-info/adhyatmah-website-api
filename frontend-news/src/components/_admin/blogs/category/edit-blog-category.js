'use client';

import React from 'react';
import PropTypes from 'prop-types';

import BlogCategoryForm from '@/components/forms/blog-category';

EditBlogCategory.propTypes = {
  data: PropTypes.object,
  isLoading: PropTypes.bool
};

export default function EditBlogCategory({
  data,
  isLoading
}) {
  return (
    <BlogCategoryForm
      data={data}
      isLoading={isLoading}
    />
  );
}