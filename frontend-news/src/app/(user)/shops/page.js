import { Box, Container, Stack, Typography } from '@mui/material';

import ShopsClient from './ShopsClient';
import BookPanditSeoContent from '@/components/_main/book-pandit/seo-content';
import { CANONICAL_ORIGIN, canonicalMeta } from 'src/utils/seo';

// This file is what /book-pandit-online renders (see the rewrite in
// next.config.js); /shops now 301s onto that keyword URL.
//
// The page used to be nothing but <ShopsClient />, a client component that
// fetches the pandit list with react-query. The HTML Googlebot received
// therefore contained 318 words, no <h1>, and 26 skeleton cards reading
// "Pandit Ji" — no pandit names, no cities, no services. That is the reason the
// site sits around position 50-60 for "book pandit online" despite having an
// exact-match URL and a good title tag.
//
// The fix is to fetch the same data on the server and render a real, crawlable
// page around the interactive grid: one <h1>, an intro, a text directory of
// every pandit with a link to their profile, structured data, and the long-form
// section in BookPanditSeoContent. ShopsClient still provides the interactive
// experience for users.

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const revalidate = 300;

export const metadata = {
  ...canonicalMeta('/book-pandit-online'),

  title: 'Book Pandit Online | Verified Pandit Ji for Puja at Home',

  description:
    'Book pandit online for Griha Pravesh, Satyanarayan Puja, Rudrabhishek and havan at home. Compare verified pandit ji by experience, language and price. Booking in minutes.',

  keywords:
    'book pandit online, pandit online booking, online pandit booking, book pandit ji online, pandit booking online, pandit for griha pravesh, satyanarayan puja pandit, book purohit online, pandit near me'
};

const createVendorSlug = (vendor) => {
  if (vendor?.slug) return vendor.slug;

  const fullName = [vendor?.firstName || '', vendor?.lastName || ''].join(' ');

  const slug = fullName
    .toLowerCase()
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\./g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || `pandit-${vendor?.id}`;
};

async function getPandits() {
  if (!baseUrl) return [];

  try {
    const res = await fetch(`${baseUrl}/api/getAllPandit`, { next: { revalidate: 300 } });
    if (!res.ok) return [];

    const json = await res.json();
    return json?.payload?.vendors || [];
  } catch (err) {
    console.warn('book-pandit-online: failed to fetch pandit list', err);
    return [];
  }
}

export default async function Page() {
  const vendors = await getPandits();

  const pandits = vendors.map((vendor) => {
    const name = `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim();
    const services = (vendor.services || [])
      .map((service) => service?.poojaType)
      .filter(Boolean);

    return {
      name,
      slug: createVendorSlug(vendor),
      city: vendor.city || '',
      experience: vendor.experience,
      language: vendor.language || '',
      services: [...new Set(services)]
    };
  });

  // Unique, non-empty city names for the local-intent section.
  const cityList = [...new Set(pandits.map((p) => p.city).filter(Boolean))];

  const pageUrl = `${CANONICAL_ORIGIN}/book-pandit-online`;

  // Structured data. Emitted as a plain <script> rather than next/script so it
  // is part of the server HTML, not something added after hydration.
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Book Pandit Online', item: pageUrl }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Online Pandit Booking',
      serviceType: 'Pandit booking for Hindu puja and rituals at home',
      description:
        'Book a verified pandit ji online for Griha Pravesh, Satyanarayan Puja, Rudrabhishek, Graha Shanti, marriage and naming ceremonies performed at home.',
      provider: { '@type': 'Organization', name: 'Adhyatmah', url: CANONICAL_ORIGIN },
      areaServed: { '@type': 'Country', name: 'India' },
      url: pageUrl,
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceUrl: pageUrl,
        availableLanguage: ['Hindi', 'English', 'Sanskrit']
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How to book a pandit online',
      description:
        'Book a verified pandit ji for a puja at home in four steps on Adhyatmah.',
      totalTime: 'PT5M',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Choose the puja and your date',
          text: 'Select the ceremony you need and the date. If the muhurat is not fixed, the team suggests auspicious windows for that month.'
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Pick a verified pandit ji',
          text: 'Compare pandits by experience, Veda and shakha, languages and city, and see the price of each puja on the profile.'
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Confirm the booking online',
          text: 'Confirm the slot and pay online. Pandit ji contact details and the samagri list are shared immediately.'
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Puja is performed at your home',
          text: 'Pandit ji arrives at the agreed muhurat and performs the ritual following the correct Vedic vidhi.'
        }
      ]
    },
    // FAQPage must mirror questions that are visibly on the page — these are the
    // same seven answered in BookPanditSeoContent.
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        [
          'How do I book a pandit online?',
          'Choose your puja, select the date, time and city, compare verified pandit profiles, and confirm the booking with online payment. The pandit ji contact details and the samagri list are shared as soon as the booking is confirmed. The whole process takes about five minutes.'
        ],
        [
          'How much does online pandit booking cost?',
          'Pandit booking charges start at around Rs 2,100 for a Satyanarayan Puja and Rs 5,100 for a Griha Pravesh or Rudrabhishek, depending on the ritual, its duration and your city. The price for each puja is shown on the pandit ji profile before you book, and dakshina is included.'
        ],
        [
          'How far in advance should a pandit be booked?',
          'Book at least three to four days ahead for a normal puja, and two to three weeks ahead during wedding season, Navratri, Diwali and Sawan. Same-day pandit booking is often possible in Noida, Delhi NCR and other major cities if a slot is open.'
        ],
        [
          'Are the pandits on Adhyatmah verified?',
          'Yes. Every pandit ji is verified for identity and Vedic training before the profile goes live, and the profile states years of experience, Veda and shakha, and the languages they conduct rituals in.'
        ],
        [
          'Can I book a pandit who speaks my language?',
          'Yes. You can find a Hindi, Marathi, Bengali, Tamil, Telugu, Kannada, Gujarati, Odia or Sanskrit speaking pandit, and choose between North Indian and South Indian ritual traditions.'
        ],
        [
          'What is the difference between an online puja and booking a pandit at home?',
          'Booking a pandit online means a purohit travels to your home and performs the ritual in person. An online puja is live-streamed while your family joins over video, with the prasad couriered afterwards. Adhyatmah offers both.'
        ],
        [
          'Do I need to arrange the puja samagri myself?',
          'No. You can order a ready puja kit with the complete samagri for your ceremony, or ask the pandit ji to bring it. The item list for your ritual is shared at the time of booking.'
        ]
      ].map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a }
      }))
    }
  ];

  // ItemList of the actual pandits, so the directory itself is machine-readable.
  if (pandits.length) {
    schema.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Verified pandits available for online booking',
      numberOfItems: pandits.length,
      itemListElement: pandits.map((pandit, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Person',
          name: pandit.name,
          url: `${CANONICAL_ORIGIN}/${pandit.slug}`,
          jobTitle: 'Pandit',
          ...(pandit.city ? { address: { '@type': 'PostalAddress', addressLocality: pandit.city } } : {}),
          ...(pandit.language ? { knowsLanguage: pandit.language } : {})
        }
      }))
    });
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Server-rendered H1 and intro. The page previously had no h1 at all. */}
      <Box sx={{ width: '100%', backgroundColor: '#FBEBDA' }}>
        <Container maxWidth="xl">
          <Stack spacing={1.25} sx={{ py: { xs: 3, md: 4 }, textAlign: 'center' }} alignItems="center">
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: '1.35rem', sm: '1.7rem', md: '2rem' },
                fontWeight: 700,
                lineHeight: 1.3,
                maxWidth: 900,
                color: '#241511'
              }}
            >
              Book Pandit Online{' '}
              <Box component="span" sx={{ color: '#B35C02' }}>
                for Puja at Home
              </Box>
            </Typography>

            <Typography sx={{ fontSize: { xs: 14, md: 15.5 }, color: 'text.secondary', maxWidth: 680 }}>
              Compare {pandits.length > 0 ? `${pandits.length} ` : ''}verified pandit ji by experience,
              language, city and price — then confirm your Griha Pravesh, Satyanarayan Puja,
              Rudrabhishek or havan booking online in minutes.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Interactive directory (client-side). */}
      <ShopsClient />

      {/* The text directory of the same pandits used to render here as its own
          section. It's still exactly the same data, same links, same server HTML
          (still crawlable) — it now renders as the first accordion row inside
          BookPanditSeoContent instead of a separate plain-text block, so it
          matches the redesigned dropdown section below. */}
      <BookPanditSeoContent panditCount={pandits.length} cityList={cityList} pandits={pandits} />
    </>
  );
}