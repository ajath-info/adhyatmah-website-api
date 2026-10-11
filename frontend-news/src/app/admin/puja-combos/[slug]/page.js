'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import * as api from 'src/services';

import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import PujaComboForm from '@/components/forms/puja-combo';

export default function Page() {
    const { slug } = useParams();

    const { data, isPending } = useQuery({
        queryKey: ['puja-combo', slug],
        queryFn: () => api.getPujaComboByAdmin(slug),
        enabled: !!slug,
        // always load fresh data into the edit form
        gcTime: 0
    });

    return (
        <>
            <HeaderBreadcrumbs
                admin
                heading="Edit Combo"
                links={[
                    { name: 'Dashboard', href: '/admin/dashboard' },
                    { name: 'Puja Combos', href: '/admin/puja-combos' },
                    { name: 'Edit Combo' }
                ]}
            />

            <PujaComboForm data={data?.data} isLoading={isPending} />
        </>
    );
}