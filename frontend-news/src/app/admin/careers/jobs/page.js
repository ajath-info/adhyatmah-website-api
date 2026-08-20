import React from 'react';

import HeaderBreadcrumbs from '@/components/header-breadcrumbs';

import JobList from '@/components/_admin/careers/job/job-list';

export const metadata = {
    title: 'Jobs - adhyatmah',
    applicationName: 'adhyatmah',
    authors: 'adhyatmah'
};

export default function Page() {
    return (
        <>
            <HeaderBreadcrumbs
                admin
                heading="Jobs"
                links={[
                    {
                        name: 'Dashboard',
                        href: '/admin/dashboard'
                    },
                    {
                        name: 'Jobs'
                    }
                ]}
                action={{
                    href: '/admin/careers/jobs/add',
                    title: 'Add Job'
                }}
            />

            <JobList />
        </>
    );
}