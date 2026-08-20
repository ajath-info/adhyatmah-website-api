'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import * as api from 'src/services';

import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import ApplicationDetail from '@/components/_admin/careers/application/application-detail';

export default function Page() {

    const { id } = useParams();

    const { data, isPending } = useQuery({

        queryKey: ['career-application', id],

        queryFn: () => api.getCareerApplicationByAdmin(id),

        enabled: !!id

    });

    return (
        <>
            <HeaderBreadcrumbs
                admin
                heading="Application Details"
                links={[
                    {
                        name: 'Dashboard',
                        href: '/admin/dashboard'
                    },
                    {
                        name: 'Applications',
                        href: '/admin/careers/applications'
                    },
                    {
                        name: 'Details'
                    }
                ]}
            />

            <ApplicationDetail
                data={data?.data}
                isLoading={isPending}
            />
        </>
    );
}