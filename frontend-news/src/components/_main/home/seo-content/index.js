// import { Box, Container, Stack, Typography, Grid } from '@mui/material';

// // Keyword-focused SEO section for the homepage.
// // Server component (no 'use client') so every word is present in the server-rendered
// // HTML that Google reads. This complements the existing SeoIntro / FaqSection blocks —
// // it covers the target keyword phrases those sections do not.
// // Colours come from the theme (text.primary / text.secondary / background.paper) so the
// // section stays readable in both the light and dark themes.

// const ORANGE = '#E87722';

// const ceremonies = [
//   {
//     title: 'Book Pandit for Griha Pravesh Puja',
//     body: 'Enter a new home the right way with Vastu Shanti, Navagraha Havan and Kalash Sthapana, performed at your chosen muhurat with complete samagri. Looking for a Griha Pravesh pandit near me? We cover every major city.'
//   },
//   {
//     title: 'Book Pandit for Satyanarayan Puja',
//     body: 'Satyanarayan Katha at home for new beginnings and family occasions — book pandit for puja online along with the full katha, havan and prasad vidhi. Searching for Satyanarayan Puja near me is no longer needed.'
//   },
//   {
//     title: 'Rudrabhishek & Graha Shanti Puja',
//     body: 'Rudrabhishek, Mangal, Shani, Rahu and Ketu Graha Shanti pujas, each performed following the correct Vedic procedure and mantras by an experienced purohit.'
//   },
//   {
//     title: 'Marriage, Namkaran & Sanskar Ceremonies',
//     body: 'Vivah, Engagement, Namkaran, Annaprashan and Mundan sanskar — online Hindu priest booking for every milestone in the family, in your own tradition.'
//   },
//   {
//     title: 'Pitru Dosh & Dosh Nivaran Puja',
//     body: 'Pitru Dosh Nivaran, Narayan Nagbali, Manglik Dosh and Mool Shanti puja, conducted by pandits trained in the specific vidhi each remedy needs.'
//   },
//   {
//     title: 'Festival & Vrat Puja at Home',
//     body: 'Navratri, Diwali Lakshmi Puja, Ganesh Puja and Vishwakarma Puja — book puja at home with samagri delivered to your doorstep.'
//   }
// ];

// const cities = [
//   'Noida', 'Delhi', 'Greater Noida', 'Ghaziabad', 'Gurgaon', 'Faridabad',
//   'Mumbai', 'Pune', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
//   'Jaipur', 'Lucknow', 'Varanasi', 'Kanpur', 'Indore', 'Ahmedabad'
// ];

// const nearMe = [
//   'Pandit near me',
//   'Puja services near me',
//   'Hindu priest near me',
//   'Pandit for home puja near me',
//   'Griha Pravesh pandit near me',
//   'Satyanarayan Puja near me',
//   'Online puja booking near me',
//   'Best pandit near me',
//   'Pandit ji near me',
//   'Purohit near me'
// ];

// export default function HomeSeoContent() {
//   return (
//     <Box component="section" sx={{ width: '100%', py: { xs: 4, md: 6 } }}>
//       <Container maxWidth="xl">
//         <Stack gap={{ xs: 4, md: 5 }}>
//           {/* Intro */}
//           <Stack gap={1.5}>
//             <Typography
//               component="h2"
//               sx={{ fontSize: { xs: '1.25rem', md: '1.6rem' }, fontWeight: 700, color: 'text.primary' }}
//             >
//               Online Puja Booking with Verified Pandits Across India
//             </Typography>
//             <Typography sx={{ fontSize: { xs: 14, md: 15.5 }, color: 'text.secondary', lineHeight: 1.75 }}>
//               Adhyatmah makes online pandit booking simple. Whether you need a pandit for Griha Pravesh, a
//               Satyanarayan Katha at home, Rudrabhishek or a wedding ceremony, you can book pandit online in
//               minutes and have an experienced purohit reach your doorstep at the right muhurat. Every pandit ji
//               is verified for Vedic training and experience, so your rituals are performed exactly as tradition
//               requires — no phone calls, no searching for a &ldquo;pandit near me&rdquo;, and no uncertainty about pricing.
//             </Typography>
//             <Typography sx={{ fontSize: { xs: 14, md: 15.5 }, color: 'text.secondary', lineHeight: 1.75 }}>
//               From a Hindi speaking pandit to North Indian pandit booking and South Indian pandit booking, we
//               match you with a Hindu priest who follows your family tradition and language. Online puja booking
//               is available for homes, offices, shops and factories, with transparent and affordable pandit
//               booking charges shown upfront. Same day pandit booking is possible in most major cities, and
//               pandit booking online takes just a few clicks. You can also book puja online with Marathi,
//               Bengali, Tamil, Telugu, Kannada and Gujarati speaking purohits.
//             </Typography>
//           </Stack>

//           {/* Ceremonies */}
//           <Stack gap={2}>
//             <Typography
//               component="h2"
//               sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' }, fontWeight: 700, color: 'text.primary' }}
//             >
//               Book Pandit for Puja — Ceremonies We Cover
//             </Typography>
//             <Grid container spacing={2}>
//               {ceremonies.map((c) => (
//                 <Grid size={{ xs: 12, sm: 6, md: 4 }} key={c.title}>
//                   <Box
//                     sx={{
//                       height: '100%',
//                       p: 2.5,
//                       borderRadius: '12px',
//                       border: '1px solid',
//                       borderColor: 'divider',
//                       bgcolor: 'background.paper'
//                     }}
//                   >
//                     <Typography component="h3" sx={{ fontSize: 15.5, fontWeight: 700, mb: 0.75, color: ORANGE }}>
//                       {c.title}
//                     </Typography>
//                     <Typography sx={{ fontSize: 13.5, color: 'text.secondary', lineHeight: 1.65 }}>
//                       {c.body}
//                     </Typography>
//                   </Box>
//                 </Grid>
//               ))}
//             </Grid>
//           </Stack>

//           {/* Near me / intent phrases */}
//           <Stack gap={1.5}>
//             <Typography
//               component="h2"
//               sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' }, fontWeight: 700, color: 'text.primary' }}
//             >
//               Looking for a Pandit Near Me?
//             </Typography>
//             <Typography sx={{ fontSize: { xs: 14, md: 15.5 }, color: 'text.secondary', lineHeight: 1.75 }}>
//               Instead of searching for puja services near me or a Hindu priest near me and calling around,
//               Adhyatmah shows you verified pandits available in your area with their experience, language and
//               charges. Book a pandit for home puja near me for any ritual — Griha Pravesh, Satyanarayan Puja,
//               Havan, Vastu Shanti, wedding or naming ceremony — and get confirmation the same day.
//             </Typography>
//             <Stack direction="row" flexWrap="wrap" gap={1}>
//               {nearMe.map((n) => (
//                 <Box
//                   key={n}
//                   sx={{
//                     px: 1.5,
//                     py: 0.6,
//                     borderRadius: 999,
//                     fontSize: 13,
//                     fontWeight: 600,
//                     color: ORANGE,
//                     bgcolor: 'rgba(232,119,34,0.1)',
//                     border: '1px solid rgba(232,119,34,0.35)'
//                   }}
//                 >
//                   {n}
//                 </Box>
//               ))}
//             </Stack>
//           </Stack>

//           {/* Cities */}
//           <Stack gap={1.5}>
//             <Typography
//               component="h2"
//               sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' }, fontWeight: 700, color: 'text.primary' }}
//             >
//               Book Pandit Online in Your City
//             </Typography>
//             <Typography sx={{ fontSize: { xs: 14, md: 15.5 }, color: 'text.secondary', lineHeight: 1.75 }}>
//               Adhyatmah connects families with verified pandits for puja at home across India. Book pandit online
//               in Noida, Delhi, Gurgaon, Ghaziabad, Mumbai, Pune, Bangalore, Hyderabad and other major cities —
//               for Griha Pravesh, Satyanarayan Puja, Havan, Vastu Shanti and every other Hindu ritual.
//             </Typography>
//             <Stack direction="row" flexWrap="wrap" gap={1}>
//               {cities.map((c) => (
//                 <Box
//                   key={c}
//                   sx={{
//                     px: 1.5,
//                     py: 0.6,
//                     borderRadius: 999,
//                     fontSize: 13,
//                     fontWeight: 600,
//                     color: ORANGE,
//                     bgcolor: 'rgba(232,119,34,0.1)',
//                     border: '1px solid rgba(232,119,34,0.35)'
//                   }}
//                 >
//                   Book pandit online in {c}
//                 </Box>
//               ))}
//             </Stack>
//           </Stack>
//         </Stack>
//       </Container>
//     </Box>
//   );
// }

'use client';

import { useState } from 'react';
import { Box, Container, Stack, Typography, Grid, Accordion, AccordionSummary, AccordionDetails, Divider } from '@mui/material';

// icons — same react-icons package already used across the homepage (see why-choose-us.js, seo-intro/index.js)
import { GiHouse, GiTempleGate, GiFireBowl, GiDiamondRing, GiFamilyTree, GiFireworkRocket } from 'react-icons/gi';
import { MdLocationOn, MdOutlineTravelExplore, MdAdd, MdRemove } from 'react-icons/md';

// Keyword-focused SEO section for the homepage.
// Client component because the ceremonies / near-me / city keyword blocks are now collapsed
// into accordions (same pattern as faq-section/index.js) so the page doesn't look text-heavy.
// Every word is still rendered into the accordion's DOM (MUI keeps AccordionDetails mounted,
// it's only hidden with CSS/height collapse), so none of the SEO copy or keyword tags are lost —
// they're just tucked away until a visitor taps to open a section.
// Colours come from the theme (text.primary / text.secondary / background.paper) so the
// section stays readable in both the light and dark themes.

const ORANGE = '#FB8B05';

const ceremonies = [
  {
    icon: GiHouse,
    title: 'Book Pandit for Griha Pravesh Puja',
    body: 'Enter a new home the right way with Vastu Shanti, Navagraha Havan and Kalash Sthapana, performed at your chosen muhurat with complete samagri. Looking for a Griha Pravesh pandit near me? We cover every major city.'
  },
  {
    icon: GiTempleGate,
    title: 'Book Pandit for Satyanarayan Puja',
    body: 'Satyanarayan Katha at home for new beginnings and family occasions — book pandit for puja online along with the full katha, havan and prasad vidhi. Searching for Satyanarayan Puja near me is no longer needed.'
  },
  {
    icon: GiFireBowl,
    title: 'Rudrabhishek & Graha Shanti Puja',
    body: 'Rudrabhishek, Mangal, Shani, Rahu and Ketu Graha Shanti pujas, each performed following the correct Vedic procedure and mantras by an experienced purohit.'
  },
  {
    icon: GiDiamondRing,
    title: 'Marriage, Namkaran & Sanskar Ceremonies',
    body: 'Vivah, Engagement, Namkaran, Annaprashan and Mundan sanskar — online Hindu priest booking for every milestone in the family, in your own tradition.'
  },
  {
    icon: GiFamilyTree,
    title: 'Pitru Dosh & Dosh Nivaran Puja',
    body: 'Pitru Dosh Nivaran, Narayan Nagbali, Manglik Dosh and Mool Shanti puja, conducted by pandits trained in the specific vidhi each remedy needs.'
  },
  {
    icon: GiFireworkRocket,
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

// Small pill used above every sub-heading — matches the "TRUSTED SPIRITUAL PLATFORM"
// eyebrow style already used in the hero banner, so this section feels native to the page.
function Eyebrow({ children }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.75}
      sx={{
        alignSelf: 'flex-start',
        px: 1.5,
        py: 0.5,
        borderRadius: 999,
        bgcolor: 'rgba(251,139,5,0.1)',
        border: '1px solid rgba(251,139,5,0.3)'
      }}
    >
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: ORANGE }} />
      <Typography sx={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6, color: ORANGE, textTransform: 'uppercase' }}>
        {children}
      </Typography>
    </Stack>
  );
}

// Pill-style keyword tag shared by the "near me" and "city" tag clouds.
function KeywordTag({ icon: Icon, children }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.6}
      sx={{
        px: 1.75,
        py: 0.7,
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        color: ORANGE,
        bgcolor: 'background.paper',
        border: '1px solid rgba(251,139,5,0.35)',
        transition: 'all .18s ease',
        cursor: 'default',
        '&:hover': {
          bgcolor: ORANGE,
          color: '#fff',
          borderColor: ORANGE,
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 14px rgba(251,139,5,0.3)'
        }
      }}
    >
      <Icon size={13} style={{ flexShrink: 0 }} />
      <Typography component="span" sx={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>
        {children}
      </Typography>
    </Stack>
  );
}

// One collapsible section — same visual language as the FAQ accordion (faq-section/index.js):
// no boxed card, just a flat row with a circular +/- toggle and a divider line, so this block
// feels like one continuous section with the FAQ block that follows it.
function SeoAccordion({ eyebrow, title, expanded, onChange, children }) {
  return (
    <Accordion
      expanded={expanded}
      onChange={onChange}
      disableGutters
      elevation={0}
      square
      sx={{
        bgcolor: 'transparent',
        '&:before': { display: 'none' }
      }}
    >
      <AccordionSummary
        expandIcon={
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              flexShrink: 0,
              width: 30,
              height: 30,
              borderRadius: '50%',
              border: '1.5px solid',
              borderColor: ORANGE,
              color: ORANGE,
              bgcolor: expanded ? 'rgba(232,119,34,0.1)' : 'transparent',
              transition: 'background-color 0.2s ease'
            }}
          >
            {expanded ? <MdRemove size={16} /> : <MdAdd size={16} />}
          </Stack>
        }
        sx={{
          px: 0,
          py: 1.25,
          minHeight: 'unset',
          '& .MuiAccordionSummary-content': { my: 0 }
        }}
      >
        <Stack gap={0.75}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <Typography
            component="h2"
            sx={{
              fontSize: { xs: '1.05rem', md: '1.3rem' },
              fontWeight: 700,
              color: expanded ? ORANGE : 'text.primary',
              transition: 'color 0.2s ease'
            }}
          >
            {title}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0, pt: 0.5, pb: { xs: 3, md: 3.5 } }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}

/* ---------------- DECORATIVE ARROW LINE (matches the FAQ section title) ---------------- */
function ArrowLine({ direction = 'left' }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 46 14"
      sx={{
        width: { xs: 26, sm: 36, md: 42 },
        height: 14,
        display: { xs: 'none', sm: 'block' },
        transform: direction === 'right' ? 'scaleX(-1)' : 'none'
      }}
    >
      <line x1="0" y1="7" x2="34" y2="7" stroke={ORANGE} strokeWidth="2" />
      <path d="M28 1.5 L37 7 L28 12.5" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Box>
  );
}

export default function HomeSeoContent() {
  // Collapsed by default so the section reads as one compact strip instead of a wall of text —
  // opening one section doesn't need to close the others.
  const [expanded, setExpanded] = useState({ intro: false, ceremonies: false, nearMe: false, cities: false });
  const toggle = (key) => (_e, isExpanded) => setExpanded((prev) => ({ ...prev, [key]: isExpanded }));

  return (
    <Box component="section" sx={{ width: '100%' }}>
      <Container maxWidth="xl">
        <Stack alignItems="center" spacing={1} sx={{ width: '100%', mb: { xs: 2.5, md: 3 } }}>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={{ xs: 1, sm: 1.5 }} sx={{ width: '100%' }}>
            <ArrowLine direction="left" />
            <Typography
              component="h2"
              sx={{
                fontSize: { xs: 20, sm: 24, md: 26 },
                fontWeight: 700,
                color: 'text.primary',
                textAlign: 'center'
              }}
            >
              Explore More About Adhyatmah
            </Typography>
            <ArrowLine direction="right" />
          </Stack>
        </Stack>

        <Stack divider={<Divider />}>
          {/* Intro — same accordion shell as the other three sections below, so this compact
              strip doesn't look different from (or heavier than) the rest of the block. */}
          <SeoAccordion
            eyebrow="Online Puja Booking"
            title="Online Puja Booking with Verified Pandits Across India"
            expanded={expanded.intro}
            onChange={toggle('intro')}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} gap={{ xs: 3, md: 4 }} alignItems="stretch">
              {/* Text column — fills the available width so there's no dead space beside it */}
              <Stack gap={1.5} sx={{ flex: 1, minWidth: 0 }}>
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

              {/* Highlight column — fills the space beside the text on wide screens instead of
                  leaving it empty; every point here is already stated in the paragraph above. */}
              <Stack
                justifyContent="center"
                gap={1.5}
                sx={{
                  flexShrink: 0,
                  width: { xs: '100%', md: 260 },
                  p: 2.25,
                  borderRadius: '14px',
                  bgcolor: 'rgba(251,139,5,0.05)',
                  border: '1px solid rgba(251,139,5,0.18)'
                }}
              >
                {[
                  'Verified & Vedic-trained pandits',
                  'Hindi, Marathi, Bengali, Tamil & more',
                  'Same-day booking in major cities',
                  'Transparent pricing, no phone calls'
                ].map((point) => (
                  <Stack direction="row" alignItems="flex-start" gap={1} key={point}>
                    <Box
                      sx={{
                        mt: 0.65,
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: ORANGE,
                        flexShrink: 0
                      }}
                    />
                    <Typography sx={{ fontSize: 13.5, color: 'text.primary', lineHeight: 1.5, fontWeight: 500 }}>
                      {point}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </SeoAccordion>

          {/* Ceremonies — collapsed behind an accordion so the grid of six cards doesn't dominate the page */}
          <SeoAccordion
            eyebrow="Puja Services"
            title="Book Pandit for Puja — Ceremonies We Cover"
            expanded={expanded.ceremonies}
            onChange={toggle('ceremonies')}
          >
            <Grid container spacing={2.5}>
              {ceremonies.map((c) => {
                const Icon = c.icon;
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={c.title}>
                    <Box
                      sx={{
                        position: 'relative',
                        height: '100%',
                        p: 2.75,
                        pt: 3,
                        borderRadius: '14px',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        overflow: 'hidden',
                        transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 24px rgba(251,139,5,0.14)',
                          borderColor: 'rgba(251,139,5,0.4)'
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 3,
                          background: 'linear-gradient(90deg, #FB8B05, #FFB84D)'
                        }
                      }}
                    >
                      <Stack
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          bgcolor: 'rgba(251,139,5,0.1)',
                          border: '1.5px solid rgba(251,139,5,0.25)',
                          mb: 1.5
                        }}
                      >
                        <Icon size={24} color={ORANGE} />
                      </Stack>
                      <Typography component="h3" sx={{ fontSize: 15.5, fontWeight: 700, mb: 0.75, color: 'text.primary' }}>
                        {c.title}
                      </Typography>
                      <Typography sx={{ fontSize: 13.5, color: 'text.secondary', lineHeight: 1.65 }}>
                        {c.body}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </SeoAccordion>

          {/* Near me / intent phrases */}
          <SeoAccordion
            eyebrow="Find Nearby"
            title="Looking for a Pandit Near Me?"
            expanded={expanded.nearMe}
            onChange={toggle('nearMe')}
          >
            <Stack gap={1.75}>
              <Typography sx={{ fontSize: { xs: 14, md: 15.5 }, color: 'text.secondary', lineHeight: 1.75 }}>
                Instead of searching for puja services near me or a Hindu priest near me and calling around,
                Adhyatmah shows you verified pandits available in your area with their experience, language and
                charges. Book a pandit for home puja near me for any ritual — Griha Pravesh, Satyanarayan Puja,
                Havan, Vastu Shanti, wedding or naming ceremony — and get confirmation the same day.
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1.25}>
                {nearMe.map((n) => (
                  <KeywordTag icon={MdOutlineTravelExplore} key={n}>{n}</KeywordTag>
                ))}
              </Stack>
            </Stack>
          </SeoAccordion>

          {/* Cities */}
          <SeoAccordion
            eyebrow="Pan-India Coverage"
            title="Book Pandit Online in Your City"
            expanded={expanded.cities}
            onChange={toggle('cities')}
          >
            <Stack gap={1.75}>
              <Typography sx={{ fontSize: { xs: 14, md: 15.5 }, color: 'text.secondary', lineHeight: 1.75 }}>
                Adhyatmah connects families with verified pandits for puja at home across India. Book pandit online
                in Noida, Delhi, Gurgaon, Ghaziabad, Mumbai, Pune, Bangalore, Hyderabad and other major cities —
                for Griha Pravesh, Satyanarayan Puja, Havan, Vastu Shanti and every other Hindu ritual.
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1.25}>
                {cities.map((c) => (
                  <KeywordTag icon={MdLocationOn} key={c}>Book pandit online in {c}</KeywordTag>
                ))}
              </Stack>
            </Stack>
          </SeoAccordion>
        </Stack>
      </Container>
    </Box>
  );
}