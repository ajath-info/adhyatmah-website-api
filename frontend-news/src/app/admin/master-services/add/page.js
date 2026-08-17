import React from 'react';

import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import AddMasterService from '@/components/_admin/master-services/add-master-service';

export const metadata = {
    title: 'Add Master Service - adhyatmah',
    applicationName: 'adhyatmah',
    authors: 'adhyatmah'
};

export default function Page() {
    return (
        <>
            <HeaderBreadcrumbs
                admin
                heading="Add Master Service"
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
                        name: 'Add Master Service'
                    }
                ]}
            />

            <AddMasterService />
        </>
    );
}