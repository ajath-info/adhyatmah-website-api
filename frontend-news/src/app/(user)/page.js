import { Stack, Box, Typography } from '@mui/material';

// Components
import Hero from 'src/components/_main/home/hero';
import TopBanners from '@/components/_main/home/banners';
import CategoriesWithProducts from '@/components/_main/home/categories-with-products';
import Vendors from '@/components/_main/home/shops';
import PoojaServices from '@/components/_main/home/pooja-services';
import Testimonials from 'src/components/_main/home/testimonials';
import SubscriptionModal from 'src/components/_main/home/subscription';
import WhyUs from '@/components/_main/home/why-us';
import Categories from '@/components/_main/home/categories';
import WhyChooseUs from '@/components/_main/home/why-choose-us';
import FestivalBanner from '@/components/_main/home/festival-banner';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const revalidate = 60;

// SEO Fix: Title (<60 chars), Meta Description (<160 chars), self-referencing canonical.
// This overrides the dynamic title/description from src/app/layout.js for the homepage route only.
export async function generateMetadata() {
  return {
    title: 'Book Pandit Online | Adhyatmah',
    description:
      'Book verified pandits for puja, havan, griha pravesh and Hindu rituals across India with Adhyatmah.',
    alternates: {
      canonical: 'https://www.adhyatmah.com/',
    },
  };
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Adhyatmah',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '108, 1st floor, Tower A, Plot No. A-40, I-THUM TOWER, Sector 62',
    addressLocality: 'Noida',
    addressRegion: 'Uttar Pradesh',
    postalCode: '201309',
    addressCountry: 'IN',
  },
  telephone: '+91-9452872182',
  email: 'info@adhyatmah.com',
  openingHours: 'Mo-Su 06:00-22:00',
  url: 'https://www.adhyatmah.com',
  image: 'https://res.cloudinary.com/dmtkuwoaf/image/upload/v1775472088/rglg6v0z7ynblkxrdtel.png',
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Pandit Booking',
  provider: {
    '@type': 'Organization',
    name: 'Adhyatmah',
  },
  areaServed: 'India',
  url: 'https://www.adhyatmah.com/shops',
};

const PageContainer = ({ children }) => (
  <Box
    sx={{
      maxWidth: '1440px',
      mx: 'auto',
      px: { xs: 2, sm: 3, md: 4, lg: 5 },
      width: '100%',
    }}
  >
    {children}
  </Box>
);

export default async function IndexPage() {
  const response = await fetch(`${baseUrl}/api/home/unified`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch homepage data');
  }

  const { data } = await response.json();
  const { banners, categories, vendors, reviews } = data;

  const categoriesList = await fetch(`${baseUrl}/api/home/categories`, {
    next: { revalidate: 60 },
  });

  if (!categoriesList.ok) {
    throw new Error('Failed to fetch categories data');
  }

  const categoriesListJson = await categoriesList.json();

  const dummyServices = [
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
      id: '4',
      name: 'Bhoomi (Neev) Puja',
      price: 3100,
      originalPrice: 3601,
      duration: '1-2 Hrs',
      views: 1200,
      image: { url: '/images/poojaas/bhoomi-neev-puja.png' }
    },
    // {
    //   id: '19',
    //   name: 'Hanuman Janmotsav Puja',
    //   price: 5100,
    //   originalPrice: 5901,
    //   duration: '2-3 Hrs',
    //   views: 1800,
    //   image: { url: '/images/poojaas/hanuman-janmotsav.png' }
    // },
    {
      id: '3',
      name: 'Mool Puja',
      price: 5100,
      originalPrice: 5901,
      duration: '3-4 Hrs',
      views: 3000,
      image: { url: '/images/poojaas/mool-puja.png' }
    },
  ];

  return (
    <Stack gap={5}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* Hero carousel first */}
      <Hero data={vendors || []} banners={banners || {}} />

      {/* SEO Fix: Visible, styled H1 for the homepage. Only one H1 allowed on this page. */}
      <Box sx={{ width: '100%', backgroundColor: '#FBEBDA' }}>
        <PageContainer>
          <Stack
            alignItems="center"
            spacing={1}
            sx={{
              pt: { xs: 3, md: 4 },
              pb: { xs: 3, md: 4 },
              textAlign: 'center',
            }}
          >

            {/* Eyebrow badge with diya icon — brand orange #fb8b05 */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{
                px: 2,
                py: 0.6,
                borderRadius: 999,
                background: 'rgba(251, 139, 5, 0.08)',
                border: '1px solid rgba(251, 139, 5, 0.4)',
              }}
            >
              <Box
                component="svg"
                viewBox="0 0 24 24"
                sx={{ width: 14, height: 14, color: '#FB8B05' }}
              >
                <path
                  fill="currentColor"
                  d="M12 2c1.2 2 1.6 3.6.8 5.2C11.8 8.6 11 9.6 11 11a3 3 0 1 0 6 0c0-.9-.3-1.6-.7-2.3.9.7 1.7 1.8 1.7 3.3 0 3-2.7 5-5.5 5S7 15 7 12c0-3.6 2.7-6 5-10Z"
                />
              </Box>
              <Typography
                sx={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: 1.8,
                  textTransform: 'uppercase',
                  color: '#B35C02',
                }}
              >
                Trusted Spiritual Platform
              </Typography>
            </Stack>

            {/* Two-tone headline — uses the site's default font */}
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: '1.15rem', sm: '1.5rem', md: '1.85rem' },
                fontWeight: 700,
                lineHeight: 1.3,
                maxWidth: 900,
                whiteSpace: { xs: 'normal', sm: 'nowrap' },
                color: '#241511',
              }}
            >
              Book Pandit Online{' '}
              <Box
                component="span"
                sx={{
                  color: '#B35C02',
                }}
              >
                for Puja &amp; Rituals at Home
              </Box>
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: 13.5, md: 15 },
                color: 'text.secondary',
                maxWidth: 560,
              }}
            >
              Connect with verified pandits for havan, griha pravesh, satyanarayan puja and more — right at home.
            </Typography>
          </Stack>
        </PageContainer>
      </Box>

      <PageContainer>
        <Stack gap={5}>

          <TopBanners banners={banners} />

          <Categories
            data={categoriesListJson?.data || []}
            isHome
          />

          <Vendors data={vendors || []} />

          <PoojaServices services={dummyServices} />


          <WhyChooseUs />


          <FestivalBanner
            image="/images/festival.png"
            title="Special Puja !"
            subtitle="Limited Slots Available"
            buttonText="Book Now"
            buttonLink="https://adhyatmah.com/online-puja-services"
          />


          <CategoriesWithProducts
            data={categories || []}
            isHome
          />
        </Stack>
      </PageContainer>

      {Boolean(reviews?.length) && (
        <Testimonials data={reviews} />
      )}

      <PageContainer>
        <WhyUs />
      </PageContainer>

      <SubscriptionModal />
    </Stack>
  );
}