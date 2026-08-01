import { Box, Container, Stack, Typography, Grid } from '@mui/material';

// Keyword-focused SEO section for the homepage.
// Server component (no 'use client') so every word is present in the server-rendered
// HTML that Google reads. This complements the existing SeoIntro / FaqSection blocks —
// it covers the target keyword phrases those sections do not.
// Colours come from the theme (text.primary / text.secondary / background.paper) so the
// section stays readable in both the light and dark themes.

const ORANGE = '#E87722';

const ceremonies = [
  {
    title: 'Book Pandit for Griha Pravesh Puja',
    body: 'Enter a new home the right way with Vastu Shanti, Navagraha Havan and Kalash Sthapana, performed at your chosen muhurat with complete samagri. Looking for a Griha Pravesh pandit near me? We cover every major city.'
  },
  {
    title: 'Book Pandit for Satyanarayan Puja',
    body: 'Satyanarayan Katha at home for new beginnings and family occasions — book pandit for puja online along with the full katha, havan and prasad vidhi. Searching for Satyanarayan Puja near me is no longer needed.'
  },
  {
    title: 'Rudrabhishek & Graha Shanti Puja',
    body: 'Rudrabhishek, Mangal, Shani, Rahu and Ketu Graha Shanti pujas, each performed following the correct Vedic procedure and mantras by an experienced purohit.'
  },
  {
    title: 'Marriage, Namkaran & Sanskar Ceremonies',
    body: 'Vivah, Engagement, Namkaran, Annaprashan and Mundan sanskar — online Hindu priest booking for every milestone in the family, in your own tradition.'
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
  'Noida', 'Delhi', 'Greater Noida', 'Ghaziabad', 'Gurgaon', 'Faridabad',
  'Mumbai', 'Pune', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Jaipur', 'Lucknow', 'Varanasi', 'Kanpur', 'Indore', 'Ahmedabad'
];

const nearMe = [
  'Pandit near me',
  'Puja services near me',
  'Hindu priest near me',
  'Pandit for home puja near me',
  'Griha Pravesh pandit near me',
  'Satyanarayan Puja near me',
  'Online puja booking near me',
  'Best pandit near me',
  'Pandit ji near me',
  'Purohit near me'
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
              sx={{ fontSize: { xs: '1.25rem', md: '1.6rem' }, fontWeight: 700, color: 'text.primary' }}
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
              From a Hindi speaking pandit to North Indian pandit booking and South Indian pandit booking, we
              match you with a Hindu priest who follows your family tradition and language. Online puja booking
              is available for homes, offices, shops and factories, with transparent and affordable pandit
              booking charges shown upfront. Same day pandit booking is possible in most major cities, and
              pandit booking online takes just a few clicks. You can also book puja online with Marathi,
              Bengali, Tamil, Telugu, Kannada and Gujarati speaking purohits.
            </Typography>
          </Stack>

          {/* Ceremonies */}
          <Stack gap={2}>
            <Typography
              component="h2"
              sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' }, fontWeight: 700, color: 'text.primary' }}
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
                      bgcolor: 'background.paper'
                    }}
                  >
                    <Typography component="h3" sx={{ fontSize: 15.5, fontWeight: 700, mb: 0.75, color: ORANGE }}>
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

          {/* Near me / intent phrases */}
          <Stack gap={1.5}>
            <Typography
              component="h2"
              sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' }, fontWeight: 700, color: 'text.primary' }}
            >
              Looking for a Pandit Near Me?
            </Typography>
            <Typography sx={{ fontSize: { xs: 14, md: 15.5 }, color: 'text.secondary', lineHeight: 1.75 }}>
              Instead of searching for puja services near me or a Hindu priest near me and calling around,
              Adhyatmah shows you verified pandits available in your area with their experience, language and
              charges. Book a pandit for home puja near me for any ritual — Griha Pravesh, Satyanarayan Puja,
              Havan, Vastu Shanti, wedding or naming ceremony — and get confirmation the same day.
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {nearMe.map((n) => (
                <Box
                  key={n}
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
                  {n}
                </Box>
              ))}
            </Stack>
          </Stack>

          {/* Cities */}
          <Stack gap={1.5}>
            <Typography
              component="h2"
              sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' }, fontWeight: 700, color: 'text.primary' }}
            >
              Book Pandit Online in Your City
            </Typography>
            <Typography sx={{ fontSize: { xs: 14, md: 15.5 }, color: 'text.secondary', lineHeight: 1.75 }}>
              Adhyatmah connects families with verified pandits for puja at home across India. Book pandit online
              in Noida, Delhi, Gurgaon, Ghaziabad, Mumbai, Pune, Bangalore, Hyderabad and other major cities —
              for Griha Pravesh, Satyanarayan Puja, Havan, Vastu Shanti and every other Hindu ritual.
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
                    color: ORANGE,
                    bgcolor: 'rgba(232,119,34,0.1)',
                    border: '1px solid rgba(232,119,34,0.35)'
                  }}
                >
                  Book pandit online in {c}
                </Box>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
