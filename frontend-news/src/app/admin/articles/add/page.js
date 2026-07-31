import React from 'react';

import HeaderBreadcrumbs from '@/components/header-breadcrumbs';

import AddArticle from '@/components/_admin/blogs/article/add-article';

export const metadata = {
    title: 'Add Article - adhyatmah',
    applicationName: 'adhyatmah',
    authors: 'adhyatmah'
};

export default function Page() {
    return (
        <>
            <HeaderBreadcrumbs
                admin
                heading="Add Article"
                links={[
                    {
                        name: 'Dashboard',
                        href: '/admin/dashboard'
                    },
                    {
                        name: 'Articles',
                        href: '/admin/articles'
                    },
                    {
                        name: 'Add Article'
                    }
                ]}
            />

            <AddArticle />
        </>
    );
}