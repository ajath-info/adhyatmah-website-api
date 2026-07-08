import AdminServicePanditsPage from 'src/components/_admin/services/admin-service-pandits-page';
import HeaderBreadcrumbs from 'src/components/header-breadcrumbs';

export const metadata = {
    applicationName: 'Adhyatmah',
    title: 'Service Pandits'
};

export default function ServicePanditsRoute() {
    return (
        <div>
            <HeaderBreadcrumbs
                admin
                heading="Service Pandits"
                links={[
                    { name: 'Dashboard', href: '/admin/dashboard' },
                    { name: 'Pandit Services', href: '/admin/services' },
                    { name: 'Pandits' }
                ]}
            />
            <AdminServicePanditsPage />
        </div>
    );
}