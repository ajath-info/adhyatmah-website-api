import React from 'react';

import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import AddJob from '@/components/_admin/careers/job/add-job';

export const metadata = {
    title: 'Add Job - adhyatmah',
    applicationName: 'adhyatmah',
    authors: 'adhyatmah'
};

export default function Page() {
    return (
        <>
            <HeaderBreadcrumbs
                admin
                heading="Add Job"
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
                        name: 'Add Job'
                    }
                ]}
            />

            <AddJob />
        </>
    );
}