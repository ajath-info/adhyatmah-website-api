'use client';

import React, { use } from 'react';
import PropTypes from 'prop-types';

import { useQuery } from '@tanstack/react-query';

import HeaderBreadcrumbs from '@/components/header-breadcrumbs';

import EditArticle from '@/components/_admin/blogs/article/edit-article';

import * as api from 'src/services';

Page.propTypes = {
    params: PropTypes.shape({
        id: PropTypes.string.isRequired
    }).isRequired
};

export default function Page(props) {
    const params = use(props.params);

    const { data, isPending } = useQuery({
        queryKey: ['article', params.id],

        queryFn: () =>
            api.getArticleByAdmin(params.id)
    });

    return (
        <>
            <HeaderBreadcrumbs
                admin
                heading="Edit Article"
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
                        name: 'Edit Article'
                    }
                ]}
            />

            <EditArticle
                data={data?.data}
                isLoading={isPending}
            />
        </>
    );
}