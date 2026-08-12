'use client';

import { useState } from 'react';
import { Box, Container, Stack, Typography, Grid, Collapse } from '@mui/material';
import Link from 'next/link';

import { GiHouse, GiTempleGate, GiFireBowl, GiDiamondRing, GiFireworkRocket } from 'react-icons/gi';
import { MdLocationOn, MdOutlineTranslate, MdAdd, MdRemove } from 'react-icons/md';
import { BsShieldFillCheck, BsPersonBadge } from 'react-icons/bs';
import { FaRegCalendarCheck, FaRegUser, FaRegCreditCard, FaHome } from 'react-icons/fa';

// Long-form, server-rendered-content-turned-accordion for the /book-pandit-online landing page.
//
// Why this content exists at all: before this section, the page Googlebot received for the
// site's primary target keyword contained 318 words, no <h1>, and no pandit names — the
// directory is fetched client-side with react-query, so the server HTML held only skeleton
// placeholders. A page with no crawlable content cannot rank for a competitive head term no
// matter how good the title tag is.
//
// Every word below is still rendered into the DOM on load (React renders all children; MUI's
// Collapse just animates height/visibility) — nothing is fetched client-side or hidden behind
// an interaction, so none of the SEO copy, keyword tags or internal links are lost. They are
// just tucked away into accordion rows so the bottom of the page reads as a clean, interactive
// section instead of a wall of text — same visual pattern already used for
// "Explore More About Adhyatmah" on the homepage, so the two sections feel like one product.
//
// Content, hrefs, props and copy are all unchanged from the previous version — only the layout
// and styling changed.

const ORANGE = '#FB8B05';
const CREAM = '#FFF8F2';

const bookingSteps = [
  {
    icon: FaRegCalendarCheck,
    title: 'Choose the puja and your date',
    body: 'Pick the ceremony — Griha Pravesh, Satyanarayan Katha, Rudrabhishek, Navagraha Shanti, marriage or a naming ceremony — and the date you have in mind. If the muhurat is not fixed yet, our team suggests the auspicious windows for that month.'
  },
  {
    icon: FaRegUser,
    title: 'Pick a verified pandit ji',
    body: 'Compare pandits by experience, Veda and shakha, the languages they conduct rituals in, and the cities they travel to. Every profile shows the pujas that pandit performs and the price for each, so nothing is decided over a phone call.'
  },
  {
    icon: FaRegCreditCard,
    title: 'Confirm the booking online',
    body: 'Confirm the slot and pay online. You receive the pandit ji contact details and the samagri list for your ceremony immediately, so you know exactly what to arrange at home.'
  },
  {
    icon: FaHome,
    title: 'Puja is performed at your home',
    body: 'Pandit ji arrives at the agreed muhurat and performs the ritual following the correct Vedic vidhi and mantras for your family tradition. Samagri kits can be delivered to your address in advance if you would rather not source them yourself.'
  }
];

const ceremonies = [
  {
    icon: GiHouse,
    title: 'Griha Pravesh & Vastu Shanti',
    body: 'Vastu Shanti Havan, Navagraha Puja and Kalash Sthapana before you move into a new home or office, performed at the muhurat you choose.',
    href: '/offline-puja-services'
  },
  {
    icon: GiTempleGate,
    title: 'Satyanarayan Puja & Katha',
    body: 'The full Satyanarayan Katha with havan and prasad vidhi — the most commonly booked puja for new beginnings, anniversaries and family thanksgiving.',
    href: '/popular-puja'
  },
  {
    icon: GiFireBowl,
    title: 'Rudrabhishek & Shiva Puja',
    body: 'Rudrabhishek with panchamrit and the Rudri path, especially during Sawan. Read the full vidhi and samagri list on our Rudrabhishek guide.',
    href: '/blogs'
  },
  {
    icon: GiFireBowl,
    title: 'Graha Shanti & Dosh Nivaran',
    body: 'Mangal, Shani, Rahu, Ketu, Budh, Guru and Shukra Graha Shanti, plus Manglik Dosh, Pitru Dosh, Kaal Sarp and Mool Shanti remedies.',
    href: '/popular-puja'
  },
  {
    icon: GiDiamondRing,
    title: 'Vivah & Sanskar Ceremonies',
    body: 'Vivah, engagement, Namkaran, Annaprashan, Mundan and Upanayan sanskars conducted in your family tradition and language.',
    href: '/offline-puja-services'
  },
  {
    icon: GiFireworkRocket,
    title: 'Festival & Vrat Pujas',
    body: 'Ganesh Chaturthi, Navratri, Diwali Lakshmi Puja, Vishwakarma Puja and Sawan Somwar rituals, with the samagri kit delivered to your door.',
    href: '/products'
  }
];

// Direct-answer blocks. Each answer is written to stand alone if an answer engine lifts it
// out of the page.
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

// Pill-style keyword tag — same visual language as KeywordTag in the homepage's seo-content.
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

// Single accordion row — title + circular +/- toggle + collapsible content. Same visual
// language as ExploreRow in the homepage's seo-content, so this section reads as a matching
// pair with "Explore More About Adhyatmah" instead of a differently styled block.
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
      <Collapse in={isOpen} timeout={220} unmountOnExit={false}>
        <Box sx={{ pb: 2.5, pr: { xs: 0, md: 1 } }} onClick={(e) => e.stopPropagation()}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}

export default function BookPanditSeoContent({ panditCount = 0, cityList = [], pandits = [] }) {
  const geoCities = cityList.length ? cityList : cities;

  // Accordion behaviour: only one row open at a time. Clicking an already-open row closes
  // it; clicking a different row opens it and closes whichever was open. Nothing is open
  // by default — the user opens whichever row they want.
  const [openKey, setOpenKey] = useState(null);
  const handleToggle = (key) => () => setOpenKey((prev) => (prev === key ? null : key));

  return (
    <Box component="section" sx={{ width: '100%', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            width: '100%',
            bgcolor: CREAM,
            borderRadius: 3,
            px: { xs: 2.5, md: 5 },
            py: { xs: 3.5, md: 5 },
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Grid container spacing={{ xs: 3, md: 6 }} alignItems="flex-start">
            {/* Heading + intro blurb — on the left on desktop */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ order: { xs: 1, md: 1 } }}>
              <Stack spacing={2} sx={{ position: { md: 'sticky' }, top: { md: 96 } }}>
                <Typography
                  component="h2"
                  sx={{
                    fontSize: { xs: 24, sm: 28, md: 32 },
                    fontWeight: 700,
                    color: '#1A1A1A',
                    lineHeight: 1.2
                  }}
                >
                  Everything About Booking a Pandit Online
                </Typography>
                <Typography sx={{ fontSize: { xs: 13.5, md: 14.5 }, color: '#5C5C5C', lineHeight: 1.7, maxWidth: 380 }}>
                  How online pandit booking works, the ceremonies we cover, answers to the
                  questions families ask most, and the cities and languages Adhyatmah is
                  available in.
                </Typography>
              </Stack>
            </Grid>

            {/* Accordion stack — on the right on desktop */}
            <Grid size={{ xs: 12, md: 8 }} sx={{ order: { xs: 2, md: 2 } }}>
              <Stack spacing={1.5}>
                {/* Text directory of the same pandits shown in the interactive grid above.
                    Was previously its own plain-text section on the page; the data, links
                    and copy (name, city, experience, language, services) are unchanged —
                    it now just lives inside the same accordion pattern as everything else
                    here, and stays in the server HTML either way so it's still crawlable. */}
                {Boolean(pandits.length) && (
                  <ExploreRow
                    title="Verified Pandit Ji Available for Booking"
                    isOpen={openKey === 'directory'}
                    onToggle={handleToggle('directory')}
                  >
                    <Stack component="ul" gap={1.1} sx={{ listStyle: 'none', p: 0, m: 0 }}>
                      {pandits.map((pandit) => (
                        <Stack
                          component="li"
                          direction="row"
                          gap={1.1}
                          alignItems="flex-start"
                          key={pandit.slug}
                          sx={{
                            p: 1.25,
                            borderRadius: '10px',
                            transition: 'background-color .15s ease',
                            '&:hover': { bgcolor: 'rgba(251,139,5,0.06)' }
                          }}
                        >
                          <Stack
                            alignItems="center"
                            justifyContent="center"
                            sx={{
                              flexShrink: 0,
                              mt: 0.15,
                              width: 30,
                              height: 30,
                              borderRadius: '9px',
                              bgcolor: 'rgba(251,139,5,0.1)',
                              border: '1.5px solid rgba(251,139,5,0.25)'
                            }}
                          >
                            <BsPersonBadge size={14} color={ORANGE} />
                          </Stack>
                          <Typography sx={{ fontSize: 12.5, color: '#5C5C5C', lineHeight: 1.7 }}>
                            <Typography
                              component={Link}
                              href={`/${pandit.slug}`}
                              sx={{ fontSize: 'inherit', fontWeight: 700, color: ORANGE, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                            >
                              {pandit.name}
                            </Typography>
                            {pandit.city ? ` — ${pandit.city}` : ''}
                            {pandit.experience ? `, ${pandit.experience} years of experience` : ''}
                            {pandit.language ? `, conducts rituals in ${pandit.language}` : ''}
                            {pandit.services.length ? `. Performs ${pandit.services.slice(0, 6).join(', ')}.` : '.'}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </ExploreRow>
                )}

                <ExploreRow
                  title="Online Pandit Booking, Without the Phone Calls"
                  isOpen={openKey === 'intro'}
                  onToggle={handleToggle('intro')}
                >
                  <Stack gap={1.5}>
                    <Typography sx={{ fontSize: { xs: 12.5, md: 13 }, color: '#5C5C5C', lineHeight: 1.7 }}>
                      Adhyatmah is an online pandit booking platform for Hindu rituals performed at home.
                      You can book pandit online for Griha Pravesh, Satyanarayan Puja, Rudrabhishek, Navagraha
                      Shanti, marriage and naming ceremonies across India — choosing the pandit ji yourself
                      instead of accepting whoever happens to be available. Every profile lists the pujas that
                      pandit performs, the price of each, his years of experience and the languages he conducts
                      rituals in, so the decision is made before you commit rather than after.
                    </Typography>
                    <Typography sx={{ fontSize: { xs: 12.5, md: 13 }, color: '#5C5C5C', lineHeight: 1.7 }}>
                      {panditCount > 0
                        ? `${panditCount} verified pandits are currently listed, `
                        : 'Verified pandits are listed '}
                      covering Vedic traditions from across the country. Pandit booking online takes a few
                      minutes: pick the ceremony, pick the date and muhurat, pick your pandit ji, and confirm.
                      Booking charges are shown upfront and include dakshina, so there is no negotiating on the
                      morning of the ceremony. If you would rather buy the samagri than gather it,{' '}
                      <Typography
                        component={Link}
                        href="/products"
                        sx={{ fontSize: 'inherit', fontWeight: 600, color: ORANGE, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        ready puja kits
                      </Typography>{' '}
                      can be delivered to your address before the date.
                    </Typography>
                  </Stack>
                </ExploreRow>

                <ExploreRow
                  title="How to Book a Pandit Online in 4 Steps"
                  isOpen={openKey === 'steps'}
                  onToggle={handleToggle('steps')}
                >
                  <Grid container spacing={2}>
                    {bookingSteps.map((step, index) => {
                      const Icon = step.icon;
                      return (
                        <Grid size={{ xs: 12, sm: 6 }} key={step.title}>
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
                              <Icon size={16} color={ORANGE} />
                            </Stack>
                            <Stack gap={0.4}>
                              <Typography sx={{ fontSize: 11, fontWeight: 700, color: ORANGE, letterSpacing: 1 }}>
                                STEP {index + 1}
                              </Typography>
                              <Typography component="h4" sx={{ fontSize: 13.5, fontWeight: 700, color: '#1A1A1A' }}>
                                {step.title}
                              </Typography>
                              <Typography sx={{ fontSize: 12.5, color: '#5C5C5C', lineHeight: 1.65 }}>
                                {step.body}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Grid>
                      );
                    })}
                  </Grid>
                </ExploreRow>

                <ExploreRow
                  title="Pujas You Can Book a Pandit For"
                  isOpen={openKey === 'ceremonies'}
                  onToggle={handleToggle('ceremonies')}
                >
                  <Stack gap={1.75}>
                    <Typography sx={{ fontSize: { xs: 12.5, md: 13 }, color: '#5C5C5C', lineHeight: 1.7 }}>
                      Each ceremony below is performed following the vidhi that ritual actually requires — the
                      mantras, the sequence and the samagri differ, and a pandit ji is matched to the puja rather
                      than sent to whatever is next on a list.
                    </Typography>
                    <Grid container spacing={2}>
                      {ceremonies.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.title}>
                            <Box
                              sx={{
                                position: 'relative',
                                height: '100%',
                                p: 2.25,
                                pt: 2.75,
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
                                  width: 40,
                                  height: 40,
                                  borderRadius: '12px',
                                  bgcolor: 'rgba(251,139,5,0.1)',
                                  border: '1.5px solid rgba(251,139,5,0.25)',
                                  mb: 1.25
                                }}
                              >
                                <Icon size={19} color={ORANGE} />
                              </Stack>
                              <Typography component="h4" sx={{ fontSize: 13.5, fontWeight: 700, mb: 0.5 }}>
                                <Link href={item.href} style={{ color: 'inherit', textDecoration: 'none' }}>
                                  {item.title}
                                </Link>
                              </Typography>
                              <Typography sx={{ fontSize: 12.5, color: '#5C5C5C', lineHeight: 1.6 }}>
                                {item.body}
                              </Typography>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Stack>
                </ExploreRow>

                <ExploreRow
                  title="Pandit Booking Questions, Answered"
                  isOpen={openKey === 'faq'}
                  onToggle={handleToggle('faq')}
                >
                  <Stack gap={2}>
                    {answers.map((item) => (
                      <Box key={item.q}>
                        <Typography component="h4" sx={{ fontSize: 13.5, fontWeight: 700, mb: 0.4, color: '#1A1A1A' }}>
                          {item.q}
                        </Typography>
                        <Typography sx={{ fontSize: 12.5, color: '#5C5C5C', lineHeight: 1.7 }}>
                          {item.a}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </ExploreRow>

                <ExploreRow
                  title="Book Pandit Online in Your City"
                  isOpen={openKey === 'cities'}
                  onToggle={handleToggle('cities')}
                >
                  <Stack gap={1.75}>
                    <Typography sx={{ fontSize: { xs: 12.5, md: 13 }, color: '#5C5C5C', lineHeight: 1.7 }}>
                      Pandits listed on Adhyatmah travel across Delhi NCR, Uttar Pradesh and the major metros,
                      and many conduct ceremonies outside their home city for weddings and Griha Pravesh. If you
                      have been searching for a pandit near me, a purohit near me or puja services near me, the
                      directory above shows who is actually available for your date rather than a list of phone
                      numbers to call.
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1.25}>
                      {geoCities.map((city) => (
                        <KeywordTag icon={MdLocationOn} key={city}>Book pandit online in {city}</KeywordTag>
                      ))}
                    </Stack>
                  </Stack>
                </ExploreRow>

                <ExploreRow
                  title="Pandit Ji by Language and Tradition"
                  isOpen={openKey === 'languages'}
                  onToggle={handleToggle('languages')}
                >
                  <Stack gap={1.75}>
                    <Typography sx={{ fontSize: { xs: 12.5, md: 13 }, color: '#5C5C5C', lineHeight: 1.7 }}>
                      A ritual performed in a language the family does not follow loses much of its meaning.
                      Pandits on Adhyatmah conduct pujas in the languages below and in both North Indian and
                      South Indian traditions, and profiles state the Veda, shakha, sutra and pravar so families
                      who follow a specific parampara can match accordingly.
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1.25}>
                      {languages.map((language) => (
                        <KeywordTag icon={MdOutlineTranslate} key={language}>{language} speaking pandit</KeywordTag>
                      ))}
                    </Stack>
                  </Stack>
                </ExploreRow>

                <ExploreRow
                  title="Why Families Book Through Adhyatmah"
                  isOpen={openKey === 'trust'}
                  onToggle={handleToggle('trust')}
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
                      Verification comes first: identity and Vedic training are checked before a profile is
                      listed, and experience, tradition and languages are stated openly rather than implied.
                      Pricing is fixed and visible before booking, dakshina included. Samagri can be handled for
                      you through our{' '}
                      <Typography
                        component={Link}
                        href="/products"
                        sx={{ fontSize: 'inherit', fontWeight: 600, color: ORANGE, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        puja samagri store
                      </Typography>
                      , with kits assembled for specific ceremonies. And because the booking is confirmed online
                      with the pandit ji details shared immediately, there is no uncertainty in the days before
                      a ceremony that your family has been planning for months.
                    </Typography>
                  </Stack>
                </ExploreRow>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}