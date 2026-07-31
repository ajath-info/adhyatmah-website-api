'use client';

import React from 'react';

import ArticleForm from '@/components/forms/article';

export default function AddArticle() {
    return (
        <ArticleForm
            data={null}
            isLoading={false}
        />
    );
}