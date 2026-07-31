'use client';

import React from 'react';
import PropTypes from 'prop-types';

import ArticleForm from '@/components/forms/article';

EditArticle.propTypes = {
    data: PropTypes.object,
    isLoading: PropTypes.bool
};

export default function EditArticle({
    data,
    isLoading
}) {
    return (
        <ArticleForm
            data={data}
            isLoading={isLoading}
        />
    );
}