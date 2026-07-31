import React from 'react';

import HeaderBreadcrumbs from '@/components/header-breadcrumbs';

import ArticleList from '@/components/_admin/blogs/article/article-list';

export const metadata = {
    title: 'Articles - adhyatmah',
    applicationName: 'adhyatmah',
    authors: 'adhyatmah'
};

export default function Page() {
    return (
        <>
            <HeaderBreadcrumbs
                admin
                heading="Articles"
                links={[
                    {
                        name: 'Dashboard',
                        href: '/admin/dashboard'
                    },
                    {
                        name: 'Articles'
                    }
                ]}
                action={{
                    href: '/admin/articles/add',
                    title: 'Add Article'
                }}
            />

            <ArticleList />
        </>
    );
}