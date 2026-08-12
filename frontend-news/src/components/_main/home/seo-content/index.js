'use client';

import { useState } from 'react';
import { Box, Container, Stack, Typography, Grid, Collapse } from '@mui/material';

// icons — same react-icons package already used across the homepage (see why-choose-us.js, seo-intro/index.js)
import { GiHouse, GiTempleGate, GiFireBowl, GiDiamondRing, GiFamilyTree, GiFireworkRocket } from 'react-icons/gi';
import { MdLocationOn, MdOutlineTravelExplore, MdAdd, MdRemove } from 'react-icons/md';

import Link from 'next/link';
import { BsShieldFillCheck } from 'react-icons/bs';
import { GiPrayerBeads } from 'react-icons/gi';

// Keyword-focused SEO section for the homepage.
// Client component because the ceremonies / near-me / city keyword blocks are collapsed
// into accordion-style cards (same visual pattern as faq-section/index.js) so the page
// doesn't look text-heavy. Every word is still rendered into the DOM (just hidden with a
// CSS/height collapse), so none of the SEO copy or keyword tags are lost — they're just
// tucked away until a visitor taps to open a card.
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

/* ---------------- SINGLE EXPLORE CARD (title + circular toggle + collapsible content) ----------------
   Same visual language as FaqRow in faq-section/index.js — white rounded card, soft shadow,
   orange circular +/- toggle — so this section reads as a matching pair with the FAQ block
   below it instead of two differently-styled sections back to back. */
function ExploreRow({ title, isOpen, onToggle, children }) {
  return (
    <Box
      onClick={onToggle}
      sx={{
        cursor: 'pointer',
        bgcolor: '#fff',
        borderRadius: 2.5,
        px: { xs: 2, md: 2.5 },
        boxShadow: isOpen ? '0 4px 14px rgba(251,139,5,0.16)' : '0 1px 4px rgba(0,0,0,0.06)',
        border: '1px solid',
        borderColor: isOpen ? 'rgba(251,139,5,0.35)' : 'rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover .explore-title': { color: ORANGE }
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ py: 1.75 }}>
        <Typography
          component="h3"
          className="explore-title"
          sx={{
            fontWeight: 600,
            fontSize: { xs: 13.5, md: 14.5 },
            color: isOpen ? ORANGE : '#1A1A1A',
            transition: 'color 0.2s ease',
            pr: 1
          }}
        >
          {title}
        </Typography>
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            flexShrink: 0,
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '1.5px solid',
            borderColor: ORANGE,
            color: ORANGE,
            bgcolor: isOpen ? 'rgba(251,139,5,0.1)' : 'transparent',
            transition: 'background-color 0.2s ease'
          }}
        >
          {isOpen ? <MdRemove size={15} /> : <MdAdd size={15} />}
        </Stack>
      </Stack>
      <Collapse in={isOpen} timeout={220} unmountOnExit>
        <Box sx={{ pb: 2.5, pr: { xs: 0, md: 1 } }} onClick={(e) => e.stopPropagation()}>
          {children}
        </Box>
      </Collapse>
    </Box>
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

// SEO section, restyled to match faq-section/index.js exactly (cream card shell, white
// accordion rows with an orange +/- circle) so the two sections form a matching pair as a
// visitor scrolls. To avoid the page repeating the exact same left/right layout twice in a
// row, this block mirrors the FAQ section: FAQ has heading+illustration on the left and the
// accordion stack on the right — here the accordion stack is on the left and the
// heading+illustration is on the right (order flips back to heading-first on mobile).
export default function HomeSeoContent() {
  // Collapsed by default, each card toggles independently — same behaviour as before,
  // only the card styling changed.
  // Accordion behaviour: only one card open at a time. Clicking an already-open
  // card closes it; clicking a different card opens it and closes whichever was open.
  const [openKey, setOpenKey] = useState(null);
  const handleToggle = (key) => () => setOpenKey((prev) => (prev === key ? null : key));

  return (
    <Box component="section" sx={{ width: '100%' }}>
      {/* Match the width/padding of the page-level PageContainer wrapper (used around
          FaqSection) exactly, so both cream cards line up at the same width. */}
      <Box sx={{ maxWidth: '1440px', mx: 'auto', px: { xs: 2, sm: 3, md: 4, lg: 5 }, width: '100%' }}>
        <Box
          sx={{
            width: '100%',
            bgcolor: '#FBEBDA',
            borderRadius: 3,
            px: { xs: 2.5, md: 5 },
            py: { xs: 3.5, md: 5 },
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Grid container spacing={{ xs: 3, md: 6 }} alignItems="center">
            {/* Accordion stack — on the left on desktop (mirrors the FAQ section, which has it on the right) */}
            <Grid size={{ xs: 12, md: 7 }} sx={{ order: { xs: 2, md: 1 } }}>
              <Stack spacing={1.5}>
                <ExploreRow
                  title="Online Puja Booking with Verified Pandits Across India"
                  isOpen={openKey === 'intro'}
                  onToggle={handleToggle('intro')}
                >
                  <Stack direction={{ xs: 'column', md: 'row' }} gap={{ xs: 3, md: 4 }} alignItems="stretch">
                    <Stack gap={1.5} sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: { xs: 12.5, md: 13 }, color: '#5C5C5C', lineHeight: 1.7 }}>
                        Adhyatmah makes online pandit booking simple. Whether you need a pandit for Griha Pravesh, a
                        Satyanarayan Katha at home, Rudrabhishek or a wedding ceremony, you can book pandit online in
                        minutes and have an experienced purohit reach your doorstep at the right muhurat. Every pandit ji
                        is verified for Vedic training and experience, so your rituals are performed exactly as tradition
                        requires — no phone calls, no searching for a &ldquo;pandit near me&rdquo;, and no uncertainty about pricing.
                      </Typography>
                      <Typography sx={{ fontSize: { xs: 12.5, md: 13 }, color: '#5C5C5C', lineHeight: 1.7 }}>
                        From a Hindi speaking pandit to North Indian pandit booking and South Indian pandit booking, we
                        match you with a Hindu priest who follows your family tradition and language. Online puja booking
                        is available for homes, offices, shops and factories, with transparent and affordable pandit
                        booking charges shown upfront. Same day pandit booking is possible in most major cities, and
                        pandit booking online takes just a few clicks. You can also book puja online with Marathi,
                        Bengali, Tamil, Telugu, Kannada and Gujarati speaking purohits.
                      </Typography>
                    </Stack>

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
                          <Typography sx={{ fontSize: 12.5, color: '#1A1A1A', lineHeight: 1.5, fontWeight: 500 }}>
                            {point}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </ExploreRow>

                {/* These two used to render as separate, differently-styled open cards.
                    Restyled here into the same ExploreRow accordion pattern as every other
                    row in this section — content and links are unchanged. */}
                <ExploreRow
                  title="Why Devotees Trust Adhyatmah"
                  isOpen={openKey === 'whyTrust'}
                  onToggle={handleToggle('whyTrust')}
                >
                  <Stack direction="row" gap={1.5} alignItems="flex-start">
                    <Stack
                      alignItems="center"
                      justifyContent="center"
                      sx={{
                        flexShrink: 0,
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        bgcolor: 'rgba(251,139,5,0.1)',
                        border: '1.5px solid rgba(251,139,5,0.25)'
                      }}
                    >
                      <BsShieldFillCheck size={19} color={ORANGE} />
                    </Stack>
                    <Typography sx={{ fontSize: { xs: 12.5, md: 13 }, color: '#5C5C5C', lineHeight: 1.7 }}>
                      Adhyatmah is committed to making spiritual services simple, reliable, and accessible. We
                      connect devotees with verified pandits who perform authentic Vedic rituals with devotion
                      and care. Along with easy online booking, Adhyatmah also offers puja kits, puja samagri,
                      Rudraksha, and other spiritual essentials in one place.
                    </Typography>
                  </Stack>
                </ExploreRow>

                <ExploreRow
                  title="Book Pandit Online for Puja & Rituals Across India"
                  isOpen={openKey === 'bookPandit'}
                  onToggle={handleToggle('bookPandit')}
                >
                  <Stack direction="row" gap={1.5} alignItems="flex-start">
                    <Stack
                      alignItems="center"
                      justifyContent="center"
                      sx={{
                        flexShrink: 0,
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        bgcolor: 'rgba(251,139,5,0.1)',
                        border: '1.5px solid rgba(251,139,5,0.25)'
                      }}
                    >
                      <GiPrayerBeads size={20} color={ORANGE} />
                    </Stack>
                    <Typography sx={{ fontSize: { xs: 12.5, md: 13 }, color: '#5C5C5C', lineHeight: 1.7 }}>
                      Finding a trusted pandit for your religious ceremonies should be simple and stress-free.
                      Adhyatmah helps you{' '}
                      <Typography
                        component={Link}
                        href="/book-pandit-online"
                        sx={{ fontSize: 'inherit', fontWeight: 600, color: ORANGE, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        book verified pandits
                      </Typography>{' '}
                      for a wide range of Hindu pujas and rituals, including Griha Pravesh, Satyanarayan Katha,
                      Rudrabhishek, Marriage Puja, Mundan, and more. Whether you need a pandit at home or prefer
                      an online puja, our platform makes the booking process easy and reliable. You can also
                      explore puja kits,{' '}
                      <Typography
                        component={Link}
                        href="/products"
                        sx={{ fontSize: 'inherit', fontWeight: 600, color: ORANGE, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        puja samagri
                      </Typography>
                      , Rudraksha, and other spiritual essentials to complete every ritual with authenticity.
                    </Typography>
                  </Stack>
                </ExploreRow>

                <ExploreRow
                  title="Book Pandit for Puja — Ceremonies We Cover"
                  isOpen={openKey === 'ceremonies'}
                  onToggle={handleToggle('ceremonies')}
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
                            <Typography component="h4" sx={{ fontSize: 14.5, fontWeight: 700, mb: 0.75, color: 'text.primary' }}>
                              {c.title}
                            </Typography>
                            <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.65 }}>
                              {c.body}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </ExploreRow>

                <ExploreRow
                  title="Looking for a Pandit Near Me?"
                  isOpen={openKey === 'nearMe'}
                  onToggle={handleToggle('nearMe')}
                >
                  <Stack gap={1.75}>
                    <Typography sx={{ fontSize: { xs: 12.5, md: 13 }, color: '#5C5C5C', lineHeight: 1.7 }}>
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
                </ExploreRow>

                <ExploreRow
                  title="Book Pandit Online in Your City"
                  isOpen={openKey === 'cities'}
                  onToggle={handleToggle('cities')}
                >
                  <Stack gap={1.75}>
                    <Typography sx={{ fontSize: { xs: 12.5, md: 13 }, color: '#5C5C5C', lineHeight: 1.7 }}>
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
                </ExploreRow>
              </Stack>
            </Grid>

            {/* Heading + description + illustration — on the right on desktop (mirrors the FAQ
                section, which has this block on the left) */}
            <Grid size={{ xs: 12, md: 5 }} sx={{ order: { xs: 1, md: 2 } }}>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <Typography
                  component="h2"
                  sx={{
                    fontSize: { xs: 24, sm: 28, md: 32 },
                    fontWeight: 700,
                    color: '#1A1A1A',
                    lineHeight: 1.2
                  }}
                >
                  Explore More About Adhyatmah
                </Typography>
                <Typography sx={{ fontSize: { xs: 13.5, md: 14.5 }, color: '#5C5C5C', lineHeight: 1.7, maxWidth: 380 }}>
                  Everything you need to know about booking a verified pandit online — ceremonies we cover, how to
                  find a pandit near you, and the cities where Adhyatmah is available.
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}