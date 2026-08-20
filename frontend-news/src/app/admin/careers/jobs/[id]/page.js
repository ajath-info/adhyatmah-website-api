'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import * as api from 'src/services';

import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import EditJob from '@/components/_admin/careers/job/edit-job';

export default function Page() {

    const { id } = useParams();

    const { data, isPending } = useQuery({

        queryKey: ['career-job', id],

        queryFn: () => api.getCareerJobByAdmin(id),

        enabled: !!id

    });

    return (
        <>
            <HeaderBreadcrumbs
                admin
                heading="Edit Job"
                links={[
                    {
                        name: 'Dashboard',
                        href: '/admin/dashboard'
                    },
                    {
                        name: 'Jobs',
                        href: '/admin/careers/jobs'
                    },
                    {
                        name: 'Edit Job'
                    }
                ]}
            />

            <EditJob
                data={data?.data}
                isLoading={isPending}
            />
        </>
    );
}