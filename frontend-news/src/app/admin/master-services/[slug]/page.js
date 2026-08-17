'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import * as api from 'src/services';

import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import EditMasterService from '@/components/_admin/master-services/edit-master-service';

export default function Page() {

    const { slug } = useParams();

    const { data, isPending } = useQuery({

        queryKey: ['master-service', slug],

        queryFn: () => api.getMasterServiceByAdmin(slug),

        enabled: !!slug

    });

    return (
        <>
            <HeaderBreadcrumbs
                admin
                heading="Edit Master Service"
                links={[
                    {
                        name: 'Dashboard',
                        href: '/admin/dashboard'
                    },
                    {
                        name: 'Master Services',
                        href: '/admin/master-services'
                    },
                    {
                        name: 'Edit Master Service'
                    }
                ]}
            />

            <EditMasterService
                data={data?.data}
                isLoading={isPending}
            />
        </>
    );
}