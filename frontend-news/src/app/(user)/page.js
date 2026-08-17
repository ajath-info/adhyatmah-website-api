import { Stack, Box, Typography } from '@mui/material';

// Components
import Hero from 'src/components/_main/home/hero';
import ServiceIcons from '@/components/_main/home/service-icons';
import TopBanners from '@/components/_main/home/banners';
import CategoriesWithProducts from '@/components/_main/home/categories-with-products';
import Vendors from '@/components/_main/home/shops';
import PoojaServices from '@/components/_main/home/pooja-services';
import Testimonials from 'src/components/_main/home/testimonials';
import HowItWorks from '@/components/_main/home/how-it-works';
import SpiritualEcommerce from '@/components/_main/home/spiritual-ecommerce';
import LatestBlogs from '@/components/_main/home/latest-blogs';
import FaqSection from '@/components/_main/home/faq-section';
import AppBanner from '@/components/_main/home/app-banner';
// Client-component wrapper that lazy-loads the modal with ssr:false —
// see components/_main/home/subscription/lazy.js
import SubscriptionModal from '@/components/_main/home/subscription/lazy';
import WhyUs from '@/components/_main/home/why-us';
import Categories from '@/components/_main/home/categories';
import WhyChooseUs from '@/components/_main/home/why-choose-us';
import FestivalBanner from '@/components/_main/home/festival-banner';
import HomeSeoContent from '@/components/_main/home/seo-content';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const revalidate = 60;

// SEO Fix: Title (<60 chars), Meta Description (<160 chars), self-referencing canonical.
// This overrides the dynamic title/description from src/app/layout.js for the homepage route only.
export async function generateMetadata() {
  return {
    // title: 'Book Pandit Online | Adhyatmah',
    title: 'Book Pandit Online for Puja & Rituals | Adhyatmah',
    description:
      // 'Book verified pandits for puja, havan, griha pravesh and Hindu rituals across India with Adhyatmah.',
      'Book verified pandits online for puja, havan, griha pravesh and satyanarayan katha across India. Trusted, authentic rituals at home.',
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


// FAQ schema — must mirror the questions actually visible on the page (FaqSection).
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    ['How can I book a pandit online through Adhyatmah?', 'Choose your puja, select your date, time and city, and confirm the booking. You receive the pandit ji details before the ceremony, so online pandit booking takes only a few minutes.'],
    ['Are the pandits verified?', 'Yes. All listed pandits are verified and experienced in performing traditional Hindu rituals.'],
    ['Can I book an online puja?', 'Yes. Online puja services are available for devotees who are unable to attend the ceremony in person.'],
    ['Do you provide puja samagri?', 'Yes. You can purchase puja samagri, puja kits, Rudraksha, idols and other spiritual products through Adhyatmah.'],
    ['Can I choose a pandit based on language or location?', 'Yes. You can select a pandit based on language, experience and availability.'],
  ].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
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
  const [response, categoriesList] = await Promise.all([
    fetch(`${baseUrl}/api/home/unified`, { next: { revalidate: 60 } }),
    fetch(`${baseUrl}/api/home/categories`, { next: { revalidate: 60 } }),
  ]);

  if (!response.ok) {
    throw new Error('Failed to fetch homepage data');
  }

  if (!categoriesList.ok) {
    throw new Error('Failed to fetch categories data');
  }

  const { data } = await response.json();
  const { banners, categories, vendors, reviews } = data;

  const categoriesListJson = await categoriesList.json();

  // Master Service catalog is now the single source of truth for the
  // public service listing shown here - was previously a hardcoded array.
  // PoojaServices/PoojaCard already slice/render this the same way.
  let dummyServices = [];

  try {
    const masterServicesRes = await fetch(
      `${baseUrl}/api/getHomepagePoojaServicesAll?page=1&limit=8`,
      { next: { revalidate: 60 } }
    );

    if (masterServicesRes.ok) {
      const masterServicesJson = await masterServicesRes.json();
      dummyServices = masterServicesJson?.data || [];
    }
  } catch (error) {
    // Keep the homepage rendering even if this section's data fails to
    // load - don't break the whole page over one section.
    dummyServices = [];
  }

  return (
    <Stack gap={5}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

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
          <ServiceIcons />

          <WhyChooseUs />
          {/* 
          <Categories
            data={categoriesListJson?.data || []}
            isHome
          /> */}

          <Vendors data={vendors || []} />

          <PoojaServices services={dummyServices} />

          <HowItWorks />

          <FestivalBanner
            image="/images/festival.png"
            title="Popular Pujas !"
            subtitle="Limited Slots Available"
            buttonText="Book Now"
            buttonLink="/popular-puja"
          />

          <SpiritualEcommerce categories={categoriesListJson?.data || []} />

          {/* <WhyChooseUs /> */}

          <CategoriesWithProducts
            data={categories || []}
            isHome
          />
        </Stack>
      </PageContainer>

      <PageContainer>
        <WhyUs />
      </PageContainer>

      {Boolean(reviews?.length) && (
        <Testimonials data={reviews} />
      )}


      <PageContainer>
        <LatestBlogs />
      </PageContainer>

      {/* SEO: keyword-focused crawlable content (server-rendered).
          WhyTrust and SeoIntro are now rendered inside this section's
          accordion area instead of as standalone blocks here. */}
      <HomeSeoContent />

      <PageContainer>
        <FaqSection />
      </PageContainer>

      {/* AppBanner temporarily disabled — spacer below reserves the gap for it.
          When re-enabling AppBanner, remove the spacer Box and uncomment this block. */}
      {/* <PageContainer>
        <AppBanner />
      </PageContainer> */}
      <Box sx={{ height: { xs: 40, md: 64 } }} />


      <SubscriptionModal />
    </Stack>
  );
}