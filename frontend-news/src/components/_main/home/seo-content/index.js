import { Box, Container, Stack, Typography, Grid } from '@mui/material';

// Keyword-focused SEO section for the homepage.
// Server component (no 'use client') so every word is present in the server-rendered
// HTML that Google reads. This complements the existing SeoIntro / FaqSection blocks —
// it covers the target keyword phrases those sections do not: online puja booking,
// pandit booking online, book pandit for puja, pandit near me, book pandit for griha
// pravesh / satyanarayan puja, hindu priest booking, city long-tails, and the
// affordable / same-day / language variants.

const ceremonies = [
  {
    title: 'Book Pandit for Griha Pravesh Puja',
    body: 'Enter a new home the right way with Vastu Shanti, Navagraha Havan and Kalash Sthapana, performed at your chosen muhurat with complete samagri.'
  },
  {
    title: 'Book Pandit for Satyanarayan Puja',
    body: 'Satyanarayan Katha at home for new beginnings and family occasions — book pandit for puja online along with the full katha, havan and prasad vidhi.'
  },
  {
    title: 'Rudrabhishek & Graha Shanti Puja',
    body: 'Rudrabhishek, Mangal, Shani, Rahu and Ketu Graha Shanti pujas, each performed following the correct Vedic procedure and mantras.'
  },
  {
    title: 'Marriage, Namkaran & Sanskar Ceremonies',
    body: 'Vivah, Engagement, Namkaran, Annaprashan and Mundan sanskar — online Hindu priest booking for every milestone in the family.'
  },
  {
    title: 'Pitru Dosh & Dosh Nivaran Puja',
    body: 'Pitru Dosh Nivaran, Narayan Nagbali, Manglik Dosh and Mool Shanti puja, conducted by pandits trained in the specific vidhi each remedy needs.'
  },
  {
    title: 'Festival & Vrat Puja at Home',
    body: 'Navratri, Diwali Lakshmi Puja, Ganesh Puja and Vishwakarma Puja — book puja at home with samagri delivered to your doorstep.'
  }
];

const cities = [
  'Noida', 'Delhi', 'Greater Noida', 'Ghaziabad', 'Gurgaon',
  'Faridabad', 'Mumbai', 'Pune', 'Bangalore', 'Lucknow', 'Varanasi', 'Kanpur'
];

export default function HomeSeoContent() {
  return (
    <Box component="section" sx={{ width: '100%', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="xl">
        <Stack gap={{ xs: 4, md: 5 }}>
          {/* Intro */}
          <Stack gap={1.5}>
            <Typography
              component="h2"
              sx={{ fontSize: { xs: '1.25rem', md: '1.6rem' }, fontWeight: 700, color: '#241511' }}
            >
              Online Puja Booking with Verified Pandits Across India
            </Typography>
            <Typography sx={{ fontSize: { xs: 14, md: 15.5 }, color: 'text.secondary', lineHeight: 1.75 }}>
              Adhyatmah makes online pandit booking simple. Whether you need a pandit for Griha Pravesh, a
              Satyanarayan Katha at home, Rudrabhishek or a wedding ceremony, you can book pandit online in
              minutes and have an experienced purohit reach your doorstep at the right muhurat. Every pandit ji
              is verified for Vedic training and experience, so your rituals are performed exactly as tradition
              requires — no phone calls, no searching for a &ldquo;pandit near me&rdquo;, and no uncertainty about pricing.
            </Typography>
            <Typography sx={{ fontSize: { xs: 14, md: 15.5 }, color: 'text.secondary', lineHeight: 1.75 }}>
              From a Hindi speaking pandit to North Indian and South Indian purohits, we match you with a Hindu
              priest who follows your family tradition and language. Online puja booking is available for homes,
              offices, shops and factories, with transparent and affordable pandit booking charges shown upfront.
              Same day pandit booking is possible in most major cities, and pandit booking online takes just a
              few clicks.
            </Typography>
          </Stack>

          {/* Ceremonies */}
          <Stack gap={2}>
            <Typography
              component="h2"
              sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' }, fontWeight: 700, color: '#241511' }}
            >
              Book Pandit for Puja — Ceremonies We Cover
            </Typography>
            <Grid container spacing={2}>
              {ceremonies.map((c) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={c.title}>
                  <Box
                    sx={{
                      height: '100%',
                      p: 2.5,
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: 'divider',
                      background: 'rgba(251, 139, 5, 0.03)'
                    }}
                  >
                    <Typography component="h3" sx={{ fontSize: 15.5, fontWeight: 700, mb: 0.75, color: '#B35C02' }}>
                      {c.title}
                    </Typography>
                    <Typography sx={{ fontSize: 13.5, color: 'text.secondary', lineHeight: 1.65 }}>
                      {c.body}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Stack>

          {/* Cities */}
          <Stack gap={1.5}>
            <Typography
              component="h2"
              sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' }, fontWeight: 700, color: '#241511' }}
            >
              Book Pandit Online in Your City
            </Typography>
            <Typography sx={{ fontSize: { xs: 14, md: 15.5 }, color: 'text.secondary', lineHeight: 1.75 }}>
              Adhyatmah connects families with verified pandits for puja at home across India. Book pandit online
              in Noida, Delhi, Gurgaon, Ghaziabad, Mumbai and other major cities — for Griha Pravesh, Satyanarayan
              Puja, Havan, Vastu Shanti and every other Hindu ritual.
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {cities.map((c) => (
                <Box
                  key={c}
                  sx={{
                    px: 1.5,
                    py: 0.6,
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#B35C02',
                    background: 'rgba(251, 139, 5, 0.08)',
                    border: '1px solid rgba(251, 139, 5, 0.3)'
                  }}
                >
                  Pandit in {c}
                </Box>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
