import React from 'react';

import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import PujaComboForm from '@/components/forms/puja-combo';

export const metadata = {
    title: 'Add Puja Combo - adhyatmah',
    applicationName: 'adhyatmah',
    authors: 'adhyatmah'
};

export default function Page() {
    return (
        <>
            <HeaderBreadcrumbs
                admin
                heading="Add New Combo"
                links={[
                    { name: 'Dashboard', href: '/admin/dashboard' },
                    { name: 'Puja Combos', href: '/admin/puja-combos' },
                    { name: 'Add New Combo' }
                ]}
            />

            <PujaComboForm data={null} isLoading={false} />
        </>
    );
}