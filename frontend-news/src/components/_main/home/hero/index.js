'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

// mui
import {
  Box,
  Container,
  Stack,
  Typography,
  InputBase,
  Button,
  Paper
} from '@mui/material';

import { alpha } from '@mui/material/styles';

// icons
import { IoSearch } from 'react-icons/io5';
import { GiOilLamp } from 'react-icons/gi';
import { MdVerified, MdOutlineSecurity } from 'react-icons/md';
import { BsCashCoin, BsClockHistory } from 'react-icons/bs';
import { TbHeadset } from 'react-icons/tb';
import { FaHome, FaLaptop } from 'react-icons/fa';
import { MdLocalShipping } from 'react-icons/md';

// components
import SingleSlideCarousel from '@/components/carousels/single-slide';

/* ---------------- TRUST BADGES ---------------- */
const TRUST_BADGES = [
  { icon: MdVerified, label: 'Verified Pandit Ji' },
  { icon: BsCashCoin, label: 'Transparent Pricing' },
  { icon: BsClockHistory, label: 'On-time Service' },
  { icon: MdOutlineSecurity, label: 'Secure Payments' },
  { icon: TbHeadset, label: '24x7 Support' }
];

/* ---------------- QUICK ACCESS CARDS ---------------- */
const QUICK_CARDS = [
  { icon: FaHome, title: 'Book Puja', subtitle: 'at Your Place', href: '/offline-puja-services' },
  { icon: FaLaptop, title: 'Online Puja', subtitle: 'from Home', href: '/online-puja-services' },
  { icon: MdLocalShipping, title: 'Puja Samagri', subtitle: 'Delivered', href: '/products' }
];

/* ---------------------------------------------------------------- */
/* 🖼️ HARDCODED HERO BANNER SLIDES                                   */
/* ---------------------------------------------------------------- */
/* These 3 slides are fixed in the code and are NOT fetched from the
   admin dashboard / backend anymore. To change a banner image, just
   replace the file in /public/images/hero/ (or swap the `url` below)
   and redeploy — no admin-panel action needed.
   `link` is optional; set to null if a slide should not be clickable. */
const HARDCODED_SLIDES = [
  {
    image: { _id: 'hero-slide-1', url: '/images/hero-banner1.png' },
    link: null
  },
  {
    image: { _id: 'hero-slide-2', url: '/images/hero-banner2.png' },
    link: null
  },
  {
    image: { _id: 'hero-slide-3', url: '/images/hero-banner3.png' },
    link: null
  }
];

// The hero banner is a moving/autoplay carousel (SingleSlideCarousel),
// now fed by the HARDCODED_SLIDES array above instead of banners?.slides
// from the backend. The box below just fixes the overall footprint height;
// the carousel is stretched to fill it via '& > div': { height: '100% !important' }
// so it always fits this exact box regardless of its own internal
// breakpoint heights.
const HERO_HEIGHT = {
  xs: 125,
  sm: 225,
  md: 560,
  lg: 620
};

export default function Hero({ data }) {
  const router = useRouter();
  const [search, setSearch] = React.useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = search.trim();
    if (trimmed) {
      router.push(`/products?search=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', overflow: 'hidden' }}>

      {/* Background box — SAME fixed height as before (area does not
          grow). The moving carousel (HARDCODED_SLIDES) fills it edge
          to edge; the '& > div': { height: '100% !important' } rule
          overrides the carousel's own internal breakpoint heights so
          it always matches this box exactly. */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: HERO_HEIGHT,
          bgcolor: '#f3e4d0' // fallback tone while slides load
        }}
      >
        {/* Moving banner carousel — hardcoded slides, no backend/admin dependency */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            overflow: 'hidden',
            '& > div': { height: '100% !important' }
          }}
        >
          <SingleSlideCarousel data={HARDCODED_SLIDES} />
        </Box>

        {/* Subtle overlay — only enough for text contrast on the left,
            the rest of the banner stays sharp and vivid like the source image.
            Theme-aware: uses the theme's own background color (light or dark)
            instead of a hardcoded white, so heading text stays readable in
            dark mode too. Only needed on desktop where the text overlay is shown. */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            display: { xs: 'none', md: 'block' },
            background: (theme) =>
              `linear-gradient(90deg, ${alpha(theme.palette.background.default, 0.92)} 0%, ${alpha(
                theme.palette.background.default,
                0.72
              )} 28%, ${alpha(theme.palette.background.default, 0.15)} 55%, ${alpha(
                theme.palette.background.default,
                0
              )} 70%)`
          }}
        />

        {/* Foreground content — absolutely positioned INSIDE the
            aspect-ratio box so it scales with the banner instead of
            forcing the box to a fixed pixel height.
            Hidden on mobile (xs/sm) so only the banner image shows there —
            desktop (md and up) is unchanged. */}
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 2, display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
          <Container maxWidth="xl" sx={{ width: '100%' }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              justifyContent="space-between"
              spacing={{ xs: 2, md: 4 }}
            >
              {/* Left - text content */}
              <Stack spacing={{ xs: 1.5, md: 3 }} sx={{ maxWidth: 560, width: '100%' }}>
                <Typography
                  sx={{
                    fontSize: { xs: 24, sm: 34, md: 48 },
                    fontWeight: 800,
                    lineHeight: 1.15,
                    color: 'text.primary'
                  }}
                >
                  Your Faith.
                  <br />
                  Our Responsibility.
                  <br />
                  <Box component="span" sx={{ color: '#E87722' }}>
                    Divine Experience.
                  </Box>
                </Typography>

                <Typography
                  sx={{
                    fontSize: { xs: 12, md: 16 },
                    color: 'text.secondary',
                    maxWidth: 480,
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  Book verified Pandit Ji for Online or Offline Puja or shop
                  100% authentic spiritual products.
                </Typography>



                {/* Trust badges */}
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  rowGap={1.5}
                  columnGap={3}
                  sx={{ pt: 1, display: { xs: 'none', sm: 'flex' } }}
                >
                  {TRUST_BADGES.map(({ icon: Icon, label }) => (
                    <Stack
                      key={label}
                      direction="row"
                      alignItems="center"
                      spacing={0.75}
                    >
                      <Icon size={16} color="#E87722" />
                      <Typography sx={{ fontSize: 12.5, color: 'text.secondary', fontWeight: 500 }}>
                        {label}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>

              {/* Right - quick access cards */}
              <Stack
                spacing={1.5}
                sx={{
                  width: { xs: '100%', md: 230 },
                  flexShrink: 0,
                  display: { xs: 'none', md: 'flex' }
                }}
              >
                {QUICK_CARDS.map(({ icon: Icon, title, subtitle, href }) => (
                  <Paper
                    key={title}
                    component="a"
                    href={href}
                    elevation={0}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.75,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      textDecoration: 'none',
                      transition: 'all .2s',
                      '&:hover': {
                        borderColor: '#E87722',
                        boxShadow: '0 4px 12px rgba(232,119,34,0.15)'
                      }
                    }}
                  >
                    <Stack
                      alignItems="center"
                      justifyContent="center"
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        bgcolor: 'rgba(232,119,34,0.1)',
                        flexShrink: 0
                      }}
                    >
                      <Icon size={20} color="#E87722" />
                    </Stack>
                    <Box>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>
                        {title}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                        {subtitle}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Stack>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}