import React from 'react';

import PujaComboList from '@/components/_admin/puja-combos/puja-combo-list';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';

export const metadata = {
    title: 'Puja Combos - adhyatmah',
    applicationName: 'adhyatmah',
    authors: 'adhyatmah'
};

export default function PujaCombos() {
    return (
        <>
            <HeaderBreadcrumbs
                admin
                heading="Puja Combos"
                links={[
                    { name: 'Dashboard', href: '/admin/dashboard' },
                    { name: 'Puja Combos' }
                ]}
                action={{
                    href: '/admin/puja-combos/add',
                    title: 'Add New Combo'
                }}
            />

            <PujaComboList />
        </>
    );
}