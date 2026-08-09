import { Stack, Grid, Container } from '@mui/material';
import PoojaCard from 'src/components/cards/service/PoojaCard';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import { canonicalMeta } from 'src/utils/seo';

// SEO
export const metadata = {
  ...canonicalMeta('/popular-puja'),
    title: 'Popular Puja Services | Adhyatmah',
    description:
        'Book our most popular puja services — Rudrabhishek, Satyanarayan, Griha Pravesh, Engagement, Dhanteras and Tilak Puja — performed by verified Pandit Ji.'
};

const popularServices = [
    {
        id: '1',
        name: 'Rudrabhishek Puja',
        price: 5100,
        originalPrice: 5901,
        duration: '3-4 Hrs',
        views: 2800,
        image: { url: '/images/poojaas/rudrabhishek-puja.jpeg' }
    },
    {
        id: '2',
        name: 'Satyanarayan Puja',
        price: 2100,
        originalPrice: 2501,
        duration: '2-3 Hrs',
        views: 1500,
        image: { url: '/images/poojaas/satyanarayan-puja.jpeg' }
    },
    {
        id: '5',
        name: 'Griha Pravesh Puja',
        price: 5100,
        originalPrice: 5901,
        duration: '3-4 Hrs',
        views: 3000,
        image: { url: '/images/poojaas/griha-pravesh.png' }
    },
    {
        id: '12',
        name: 'Engagement Puja',
        price: 5100,
        originalPrice: 5901,
        duration: '2-3 Hrs',
        views: 1700,
        image: { url: '/images/poojaas/engagement-puja.png' }
    },
    {
        id: '10',
        name: 'Dhanteras Puja',
        price: 5100,
        originalPrice: 5901,
        duration: '2-3 Hrs',
        views: 3200,
        image: { url: '/images/poojaas/dhanteras-puja.png' }
    },
    {
        id: '13',
        name: 'Tilak Puja',
        price: 5100,
        originalPrice: 5901,
        duration: '2-3 Hrs',
        views: 3000,
        image: { url: '/images/poojaas/tilak-puja.png' }
    }
];

export default function PopularPujaPage() {
    return (
        <Container maxWidth="xl" sx={{ pb: { xs: 6, md: 10 } }}>
            <HeaderBreadcrumbs
                heading="Popular Puja"
                links={[
                    { name: 'Home', href: '/' },
                    { name: 'Popular Puja' }
                ]}
                sx={{ mb: 3 }}
            />

            <Stack gap={4}>
                <Grid container spacing={2.5}>
                    {popularServices.map((service, i) => (
                        <Grid size={{ lg: 3, md: 4, sm: 6, xs: 12 }} key={'popular-puja-' + i}>
                            <PoojaCard service={service} isLoading={false} />
                        </Grid>
                    ))}
                </Grid>
            </Stack>
        </Container>
    );
}