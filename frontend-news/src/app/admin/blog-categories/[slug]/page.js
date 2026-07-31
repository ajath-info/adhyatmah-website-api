'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import * as api from 'src/services';

import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import EditBlogCategory from '@/components/_admin/blogs/category/edit-blog-category';

export default function Page() {

    const { slug } = useParams();

    const { data, isPending } = useQuery({

        queryKey: ['blog-category', slug],

        queryFn: () => api.getBlogByAdmin(slug),

        enabled: !!slug

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