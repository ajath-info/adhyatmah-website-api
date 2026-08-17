import React from 'react';

import MasterServiceList from '@/components/_admin/master-services/master-service-list';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';

export const metadata = {
    title: 'Master Services - adhyatmah',
    applicationName: 'adhyatmah',
    authors: 'adhyatmah'
};

export default function MasterServices() {
    return (
        <>
            <HeaderBreadcrumbs
                admin
                heading="Master Services"
                links={[
                    {
                        name: 'Dashboard',
                        href: '/admin/dashboard'
                    },
                    {
                        name: 'Master Services'
                    }
                ]}
                action={{
                    href: '/admin/master-services/add',
                    title: 'Add Master Service'
                }}
            />

            <MasterServiceList />
        </>
    );
}