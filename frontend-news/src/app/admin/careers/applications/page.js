import React from 'react';

import HeaderBreadcrumbs from '@/components/header-breadcrumbs';

import ApplicationList from '@/components/_admin/careers/application/application-list';

export const metadata = {
    title: 'Applications - adhyatmah',
    applicationName: 'adhyatmah',
    authors: 'adhyatmah'
};

export default function Page() {
    return (
        <>
            <HeaderBreadcrumbs
                admin
                heading="Applications"
                links={[
                    {
                        name: 'Dashboard',
                        href: '/admin/dashboard'
                    },
                    {
                        name: 'Applications'
                    }
                ]}
            />

            <ApplicationList />
        </>
    );
}