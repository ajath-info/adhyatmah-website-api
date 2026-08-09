import { Box, Container, Stack, Typography, Grid, Divider } from '@mui/material';
import Link from 'next/link';

// Long-form, server-rendered content for the /book-pandit-online landing page.
//
// Why: before this, the page Googlebot received for the site's primary target
// keyword contained 318 words, no <h1>, and no pandit names — the directory is
// fetched client-side with react-query, so the server HTML held only skeleton
// placeholders. A page with no crawlable content cannot rank for a competitive
// head term no matter how good the title tag is.
//
// This is a server component (no 'use client'), so every word below is in the
// initial HTML response.
//
// Structure is deliberate:
//   * one <h1>, then <h2> per topic, <h3> per item — a clean outline for both
//     classic ranking and for answer engines picking a passage to quote;
//   * each answer block opens with a short, self-contained factual sentence
//     (AEO: a snippet-able answer that makes sense out of context);
//   * city and language sections carry the local intent (GEO) that "pandit near
//     me" style queries need;
//   * every ceremony links to the page that actually serves it, so the section
//     also does internal-linking work.

const ORANGE = '#E87722';

const bookingSteps = [
  {
    title: 'Choose the puja and your date',
    body: 'Pick the ceremony — Griha Pravesh, Satyanarayan Katha, Rudrabhishek, Navagraha Shanti, marriage or a naming ceremony — and the date you have in mind. If the muhurat is not fixed yet, our team suggests the auspicious windows for that month.'
  },
  {
    title: 'Pick a verified pandit ji',
    body: 'Compare pandits by experience, Veda and shakha, the languages they conduct rituals in, and the cities they travel to. Every profile shows the pujas that pandit performs and the price for each, so nothing is decided over a phone call.'
  },
  {
    title: 'Confirm the booking online',
    body: 'Confirm the slot and pay online. You receive the pandit ji contact details and the samagri list for your ceremony immediately, so you know exactly what to arrange at home.'
  },
  {
    title: 'Puja is performed at your home',
    body: 'Pandit ji arrives at the agreed muhurat and performs the ritual following the correct Vedic vidhi and mantras for your family tradition. Samagri kits can be delivered to your address in advance if you would rather not source them yourself.'
  }
];

const ceremonies = [
  {
    title: 'Griha Pravesh & Vastu Shanti',
    body: 'Vastu Shanti Havan, Navagraha Puja and Kalash Sthapana before you move into a new home or office, performed at the muhurat you choose.',
    href: '/offline-puja-services'
  },
  {
    title: 'Satyanarayan Puja & Katha',
    body: 'The full Satyanarayan Katha with havan and prasad vidhi — the most commonly booked puja for new beginnings, anniversaries and family thanksgiving.',
    href: '/popular-puja'
  },
  {
    title: 'Rudrabhishek & Shiva Puja',
    body: 'Rudrabhishek with panchamrit and the Rudri path, especially during Sawan. Read the full vidhi and samagri list on our Rudrabhishek guide.',
    href: '/blogs'
  },
  {
    title: 'Graha Shanti & Dosh Nivaran',
    body: 'Mangal, Shani, Rahu, Ketu, Budh, Guru and Shukra Graha Shanti, plus Manglik Dosh, Pitru Dosh, Kaal Sarp and Mool Shanti remedies.',
    href: '/popular-puja'
  },
  {
    title: 'Vivah & Sanskar Ceremonies',
    body: 'Vivah, engagement, Namkaran, Annaprashan, Mundan and Upanayan sanskars conducted in your family tradition and language.',
    href: '/offline-puja-services'
  },
  {
    title: 'Festival & Vrat Pujas',
    body: 'Ganesh Chaturthi, Navratri, Diwali Lakshmi Puja, Vishwakarma Puja and Sawan Somwar rituals, with the samagri kit delivered to your door.',
    href: '/products'
  }
];

// Direct-answer blocks. Each answer is written to stand alone if an answer
// engine lifts it out of the page.
const answers = [
  {
    q: 'How do I book a pandit online?',
    a: 'To book a pandit online on Adhyatmah, choose your puja, select the date, time and city, compare verified pandit profiles, and confirm the booking with online payment. The pandit ji contact details and the samagri list are shared with you as soon as the booking is confirmed. The whole process takes about five minutes.'
  },
  {
    q: 'How much does online pandit booking cost?',
    a: 'Pandit booking charges on Adhyatmah start at around ₹2,100 for a Satyanarayan Puja and ₹5,100 for a Griha Pravesh or Rudrabhishek, depending on the ritual, its duration and your city. The price for each puja is shown on the pandit ji profile before you book, and dakshina is included in the listed amount.'
  },
  {
    q: 'How far in advance should a pandit be booked?',
    a: 'Book at least three to four days ahead for a normal puja, and two to three weeks ahead for wedding season, Navratri, Diwali and Sawan, when pandits are booked out early. Same-day pandit booking is often possible in Noida, Delhi NCR and other major cities if a slot is open.'
  },
  {
    q: 'Are the pandits on Adhyatmah verified?',
    a: 'Yes. Every pandit ji listed is verified for identity and for Vedic training before the profile goes live, and the profile states their years of experience, their Veda and shakha, and the languages they conduct rituals in.'
  },
  {
    q: 'Can I book a pandit who speaks my language?',
    a: 'Yes. You can filter for a Hindi, Marathi, Bengali, Tamil, Telugu, Kannada, Gujarati, Odia or Sanskrit speaking pandit, and for North Indian or South Indian ritual traditions, so the ceremony follows your family custom.'
  },
  {
    q: 'What is the difference between an online puja and booking a pandit at home?',
    a: 'Booking a pandit online means an experienced purohit travels to your home and performs the ritual in person. An online puja is live-streamed: the pandit ji performs it at a temple or his own place of worship while your family joins over video, with the prasad couriered afterwards. Adhyatmah offers both.'
  },
  {
    q: 'Do I need to arrange the puja samagri myself?',
    a: 'No. You can order a ready puja kit with the complete samagri for your ceremony and have it delivered before the date, or ask the pandit ji to bring the samagri. The item list for your specific ritual is shared with you at the time of booking.'
  }
];

const cities = [
  'Noida', 'Delhi', 'Greater Noida', 'Ghaziabad', 'Gurgaon', 'Faridabad',
  'Lucknow', 'Kanpur', 'Varanasi', 'Prayagraj', 'Bhadohi', 'Jaunpur',
  'Mumbai', 'Pune', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Jaipur', 'Indore', 'Ahmedabad', 'Chandigarh'
];

const languages = [
  'Hindi', 'Sanskrit', 'Bhojpuri', 'Marathi', 'Bengali', 'Gujarati',
  'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Odia', 'Punjabi'
];

function Pill({ children }) {
  return (
    <Box
      sx={{
        px: 1.5,
        py: 0.6,
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        color: ORANGE,
        bgcolor: 'rgba(232,119,34,0.1)',
        border: '1px solid rgba(232,119,34,0.35)'
      }}
    >
      {children}
    </Box>
  );
}

function SectionHeading({ children }) {
  return (
    <Typography
      component="h2"
      sx={{
        fontSize: { xs: '1.2rem', md: '1.5rem' },
        fontWeight: 700,
        color: 'text.primary'
      }}
    >
      {children}
    </Typography>
  );
}

function Body({ children }) {
  return (
    <Typography sx={{ fontSize: { xs: 14, md: 15.5 }, color: 'text.secondary', lineHeight: 1.8 }}>
      {children}
    </Typography>
  );
}

export default function BookPanditSeoContent({ panditCount = 0, cityList = [] }) {
  const geoCities = cityList.length ? cityList : cities;

  return (
    <Box component="section" sx={{ width: '100%', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="xl">
        <Stack gap={{ xs: 4, md: 5 }}>
          {/* Intro — carries the primary keyword in the first sentence. */}
          <Stack gap={1.5}>
            <SectionHeading>Online Pandit Booking, Without the Phone Calls</SectionHeading>
            <Body>
              Adhyatmah is an online pandit booking platform for Hindu rituals performed at home.
              You can book pandit online for Griha Pravesh, Satyanarayan Puja, Rudrabhishek, Navagraha
              Shanti, marriage and naming ceremonies across India — choosing the pandit ji yourself
              instead of accepting whoever happens to be available. Every profile lists the pujas that
              pandit performs, the price of each, his years of experience and the languages he conducts
              rituals in, so the decision is made before you commit rather than after.
            </Body>
            <Body>
              {panditCount > 0
                ? `${panditCount} verified pandits are currently listed, `
                : 'Verified pandits are listed '}
              covering Vedic traditions from across the country. Pandit booking online takes a few
              minutes: pick the ceremony, pick the date and muhurat, pick your pandit ji, and confirm.
              Booking charges are shown upfront and include dakshina, so there is no negotiating on the
              morning of the ceremony. If you would rather buy the samagri than gather it,{' '}
              <Link href="/products" style={{ color: ORANGE, fontWeight: 600 }}>
                ready puja kits
              </Link>{' '}
              can be delivered to your address before the date.
            </Body>
          </Stack>

          <Divider />

          {/* HowTo — mirrors the HowTo schema emitted by the page. */}
          <Stack gap={2}>
            <SectionHeading>How to Book a Pandit Online in 4 Steps</SectionHeading>
            <Grid container spacing={2}>
              {bookingSteps.map((step, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={step.title}>
                  <Box
                    sx={{
                      height: '100%',
                      p: 2.5,
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper'
                    }}
                  >
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: ORANGE, letterSpacing: 1.2 }}>
                      STEP {index + 1}
                    </Typography>
                    <Typography component="h3" sx={{ fontSize: 15.5, fontWeight: 700, mt: 0.5, mb: 0.75 }}>
                      {step.title}
                    </Typography>
                    <Typography sx={{ fontSize: 13.5, color: 'text.secondary', lineHeight: 1.7 }}>
                      {step.body}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Stack>

          {/* Ceremonies */}
          <Stack gap={2}>
            <SectionHeading>Pujas You Can Book a Pandit For</SectionHeading>
            <Body>
              Each ceremony below is performed following the vidhi that ritual actually requires — the
              mantras, the sequence and the samagri differ, and a pandit ji is matched to the puja rather
              than sent to whatever is next on a list.
            </Body>
            <Grid container spacing={2}>
              {ceremonies.map((item) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.title}>
                  <Box
                    sx={{
                      height: '100%',
                      p: 2.5,
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper'
                    }}
                  >
                    <Typography component="h3" sx={{ fontSize: 15.5, fontWeight: 700, mb: 0.75, color: ORANGE }}>
                      <Link href={item.href} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {item.title}
                      </Link>
                    </Typography>
                    <Typography sx={{ fontSize: 13.5, color: 'text.secondary', lineHeight: 1.7 }}>
                      {item.body}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Stack>

          <Divider />

          {/* Answer blocks — the AEO section. */}
          <Stack gap={2}>
            <SectionHeading>Pandit Booking Questions, Answered</SectionHeading>
            <Stack gap={2.5}>
              {answers.map((item) => (
                <Box key={item.q}>
                  <Typography component="h3" sx={{ fontSize: 15.5, fontWeight: 700, mb: 0.5 }}>
                    {item.q}
                  </Typography>
                  <Typography sx={{ fontSize: 14.5, color: 'text.secondary', lineHeight: 1.8 }}>
                    {item.a}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Stack>

          <Divider />

          {/* GEO — city coverage. */}
          <Stack gap={1.5}>
            <SectionHeading>Book Pandit Online in Your City</SectionHeading>
            <Body>
              Pandits listed on Adhyatmah travel across Delhi NCR, Uttar Pradesh and the major metros,
              and many conduct ceremonies outside their home city for weddings and Griha Pravesh. If you
              have been searching for a pandit near me, a purohit near me or puja services near me, the
              directory above shows who is actually available for your date rather than a list of phone
              numbers to call.
            </Body>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {geoCities.map((city) => (
                <Pill key={city}>Book pandit online in {city}</Pill>
              ))}
            </Stack>
          </Stack>

          {/* GEO — language / tradition coverage. */}
          <Stack gap={1.5}>
            <SectionHeading>Pandit Ji by Language and Tradition</SectionHeading>
            <Body>
              A ritual performed in a language the family does not follow loses much of its meaning.
              Pandits on Adhyatmah conduct pujas in the languages below and in both North Indian and
              South Indian traditions, and profiles state the Veda, shakha, sutra and pravar so families
              who follow a specific parampara can match accordingly.
            </Body>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {languages.map((language) => (
                <Pill key={language}>{language} speaking pandit</Pill>
              ))}
            </Stack>
          </Stack>

          <Divider />

          {/* Trust */}
          <Stack gap={1.5}>
            <SectionHeading>Why Families Book Through Adhyatmah</SectionHeading>
            <Body>
              Verification comes first: identity and Vedic training are checked before a profile is
              listed, and experience, tradition and languages are stated openly rather than implied.
              Pricing is fixed and visible before booking, dakshina included. Samagri can be handled for
              you through our{' '}
              <Link href="/products" style={{ color: ORANGE, fontWeight: 600 }}>
                puja samagri store
              </Link>
              , with kits assembled for specific ceremonies. And because the booking is confirmed online
              with the pandit ji details shared immediately, there is no uncertainty in the days before
              a ceremony that your family has been planning for months.
            </Body>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
