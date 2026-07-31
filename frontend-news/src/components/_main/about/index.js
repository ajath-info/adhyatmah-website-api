'use client';
import React from 'react';
// material ui
import { Box, Container, Grid, Stack, Typography, Chip, Button, alpha } from '@mui/material';
import Image from 'next/image';
import NextLink from 'next/link';

// images
import AboutImage from 'public/images/adhyatmah-about-1.jpg';
import AboutImage2 from 'public/images/adhyatmah-about-2.jpg';

// icons
import { MdVerified, MdOutlineSecurity } from 'react-icons/md';
import { BsCashCoin, BsClockHistory } from 'react-icons/bs';
import { TbHeadset } from 'react-icons/tb';
import { FaUsers, FaBoxOpen, FaGlobeAsia } from 'react-icons/fa';
import { GiCandleFlame } from 'react-icons/gi';
import { HiOutlineSparkles, HiOutlineShieldCheck, HiOutlineHeart, HiOutlineLightningBolt } from 'react-icons/hi';
import { PiHandshakeLight } from 'react-icons/pi';
import { HiOutlineCalendarDays } from 'react-icons/hi2';

// components
import WhyUs from '../home/why-us';

const TRUST_BADGES = [
  { icon: MdVerified, label: 'Verified Pandit Ji' },
  { icon: BsCashCoin, label: 'Transparent Pricing' },
  { icon: BsClockHistory, label: 'On-time Service' },
  { icon: MdOutlineSecurity, label: 'Secure Payments' },
  { icon: TbHeadset, label: '24x7 Support' }
];

const STATS = [
  {
    icon: PiHandshakeLight,
    range: '50+',
    name: 'Conscious Vendors',
    description: 'Partners who believe in quality, authenticity, and mindful commerce.'
  },
  {
    icon: FaGlobeAsia,
    range: '7+',
    name: 'Cities Covered',
    description: 'Value created by empowering businesses and conscious consumers alike.'
  },
  {
    icon: FaUsers,
    range: '10k+',
    name: 'Lives Reached',
    description: 'Every order is a step toward better living and trusted experiences.'
  },
  {
    icon: FaBoxOpen,
    range: '500+',
    name: 'Curated Products',
    description: 'Thoughtfully selected offerings that align with purpose and quality.'
  }
];

const VALUES = [
  {
    icon: HiOutlineShieldCheck,
    title: 'Authenticity',
    description: 'Every ritual, product and Pandit Ji on our platform is verified for genuineness.'
  },
  {
    icon: HiOutlineHeart,
    title: 'Devotion',
    description: 'We bring the same sincerity to every booking as you would to your own puja ghar.'
  },
  {
    icon: HiOutlineLightningBolt,
    title: 'Convenience',
    description: 'Book a Pandit Ji, puja or spiritual product in minutes, from anywhere in the world.'
  },
  {
    icon: HiOutlineSparkles,
    title: 'Transparency',
    description: 'Clear pricing, verified reviews and no hidden surprises — trust built on clarity.'
  }
];

const SERVICES = [
  { label: 'Puja Booking', description: 'Book offline puja at your place', href: '/offline-puja-services' },
  { label: 'Pandit Ji Booking', description: 'Choose from verified & experienced Pandit Ji', href: '/book-pandit-online' },
  { label: 'Online Puja', description: 'Live-streamed puja from home', href: '/online-puja-services' },
  { label: 'Spiritual E-Commerce', description: '1000+ authentic spiritual products', href: '/puja-products-online-store' },
  { label: 'Panchang & Muhurat', description: 'Plan every ritual at the right time', href: '/panchang-muhurat' }
];

export default function Index() {
  return (
    <>
      {/* ---------------- HERO / INTRO ---------------- */}
      <Box sx={{ my: { xs: 5, md: 8 } }}>
        <Grid container spacing={{ xs: 4, md: 3 }} alignItems="center">
          <Grid size={{ md: 6, xs: 12 }}>
            <Stack direction="row" spacing={2.5} sx={{ position: 'relative' }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 260, sm: 360, md: 418 },
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: (theme) => `0 20px 45px ${alpha(theme.palette.primary.main, 0.15)}`,
                  img: { objectFit: 'cover' }
                }}
              >
                <Image src={AboutImage} alt="Adhyatmah puja ritual" fill placeholder="blur" sizes="(max-width: 600px) 100vw, 50vw" />
              </Box>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 260, sm: 360, md: 418 },
                  borderRadius: 4,
                  overflow: 'hidden',
                  transform: { xs: 'none', md: 'translateY(-40px)' },
                  boxShadow: (theme) => `0 20px 45px ${alpha(theme.palette.primary.main, 0.15)}`,
                  img: { objectFit: 'cover' }
                }}
              >
                <Image src={AboutImage2} alt="Adhyatmah spiritual products" fill placeholder="blur" sizes="(max-width: 600px) 100vw, 50vw" />
              </Box>

              {/* Floating badge */}
              {/* <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  position: 'absolute',
                  bottom: { xs: -16, md: 12 },
                  left: 16,
                  bgcolor: 'background.paper',
                  borderRadius: 3,
                  px: 2,
                  py: 1.25,
                  boxShadow: (theme) => `0 10px 30px ${alpha(theme.palette.common.black, 0.15)}`
                }}
              >
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`
                  }}
                >

                </Box>
                <Stack spacing={0}>
                  <Typography sx={{ fontSize: 13, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                    Est. 2025
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: 'text.secondary', lineHeight: 1.2 }}>
                    Noida, India
                  </Typography>
                </Stack>
              </Stack> */}
            </Stack>
          </Grid>

          <Grid size={{ md: 6, xs: 12 }} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Chip
              icon={<HiOutlineSparkles size={14} style={{ color: 'inherit' }} />}
              label="Who We Are"
              size="small"
              sx={{
                width: 'fit-content',
                mb: 2,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: 'primary.dark',
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                fontSize: 11
              }}
            />

            <Typography variant="h2" fontWeight={800} sx={{ fontSize: { xs: 28, sm: 34, md: 40 }, lineHeight: 1.2 }}>
              Creating a World Where{' '}
              <Box component="span" sx={{ color: 'primary.main' }}>
                Spirituality
              </Box>{' '}
              Meets Everyday Life
            </Typography>

            <Typography variant="body1" fontWeight={400} color="text.secondary" mt={2.5} sx={{ lineHeight: 1.8 }}>
              Adhyatmah Bharat E-Commerce Private Limited is a next-generation digital platform transforming
              India's spiritual and devotional ecosystem. Established in 2025 and headquartered in Noida, the
              company bridges the gap between traditional religious practices and modern digital convenience.
            </Typography>
            <Typography variant="body1" fontWeight={400} color="text.secondary" mt={1.5} sx={{ lineHeight: 1.8 }}>
              The platform offers a comprehensive, technology-driven marketplace for pooja essentials, ritual
              kits, devotional products, and verified Pandit Ji services — ensuring authenticity, transparency
              and seamless access for users across India and global NRI communities.
            </Typography>

            {/* Trust badges */}
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.25} sx={{ mt: 3 }}>
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <Stack
                  key={label}
                  direction="row"
                  alignItems="center"
                  spacing={0.75}
                  sx={{
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                    border: '1px solid',
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.15),
                    borderRadius: 50,
                    px: 1.5,
                    py: 0.6
                  }}
                >
                  <Icon size={14} color="#E87722" />
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.primary' }}>{label}</Typography>
                </Stack>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* ---------------- STATS ---------------- */}
      <Box sx={{ my: { xs: 6, md: 9 } }}>
        <Grid container spacing={2.5}>
          {STATS.map((item) => (
            <Grid size={{ md: 3, sm: 6, xs: 12 }} key={item.name}>
              <Stack
                spacing={1.5}
                alignItems="center"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  p: 2.75,
                  height: '100%',
                  textAlign: 'center',
                  transition: 'all .25s ease',
                  bgcolor: 'background.paper',
                  '&:hover': {
                    borderColor: 'transparent',
                    boxShadow: (theme) => `0 14px 32px ${alpha(theme.palette.primary.main, 0.12)}`,
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <Box
                  sx={{
                    width: 62,
                    height: 62,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1)
                  }}
                >
                  <item.icon size={28} color="#E87722" />
                </Box>
                <Typography variant="h3" color="text.primary" fontWeight={800}>
                  {item.range}
                </Typography>
                <Typography variant="subtitle1" color="text.primary" fontWeight={700}>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ---------------- OUR VALUES ---------------- */}
      <Box sx={{ my: { xs: 6, md: 9 } }}>
        <Stack alignItems="center" spacing={1} sx={{ mb: 4 }}>
          <Typography
            sx={{ fontSize: 12.5, fontWeight: 700, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 1 }}
          >
            What Drives Us
          </Typography>
          <Typography variant="h3" fontWeight={800} textAlign="center" sx={{ fontSize: { xs: 24, md: 32 } }}>
            Our Core Values
          </Typography>
        </Stack>

        <Grid container spacing={2.5}>
          {VALUES.map((item) => (
            <Grid size={{ md: 3, sm: 6, xs: 12 }} key={item.title}>
              <Stack
                spacing={1.5}
                alignItems="center"
                textAlign="center"
                sx={{
                  borderRadius: 3,
                  p: 3,
                  height: '100%',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04)
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`
                  }}
                >
                  <item.icon size={24} color="#fff" />
                </Box>
                <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ---------------- OUR SERVICES ---------------- */}
      <Box sx={{ my: { xs: 6, md: 9 } }}>
        <Stack alignItems="center" spacing={1} sx={{ mb: 4 }}>
          <Typography
            sx={{ fontSize: 12.5, fontWeight: 700, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 1 }}
          >
            What We Offer
          </Typography>
          <Typography variant="h3" fontWeight={800} textAlign="center" sx={{ fontSize: { xs: 24, md: 32 } }}>
            Our Services
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 480 }}>
            Everything you need for authentic, verified spiritual living — in one platform.
          </Typography>
        </Stack>

        <Grid container spacing={2.5}>
          {SERVICES.map((service) => (
            <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 12 }} key={service.label}>
              <Stack
                component={NextLink}
                href={service.href}
                spacing={1}
                sx={{
                  textDecoration: 'none',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  p: 2.5,
                  height: '100%',
                  transition: 'all .25s ease',
                  '&:hover': {
                    borderColor: 'transparent',
                    boxShadow: (theme) => `0 14px 32px ${alpha(theme.palette.primary.main, 0.14)}`,
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'primary.main'
                  }}
                />
                <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                  {service.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {service.description}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ---------------- WHY US ---------------- */}
      <Box sx={{ mb: { xs: 6, md: 9 } }}>
        <WhyUs />
      </Box>

      {/* ---------------- CTA BANNER ---------------- */}
      {/* <Box sx={{ mb: { xs: 6, md: 9 } }}>
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,
            textAlign: 'center',
            px: 3,
            py: { xs: 5, md: 6 },
            background: (theme) =>
              `linear-gradient(145deg, #4a1208 0%, ${theme.palette.primary.dark} 45%, ${theme.palette.primary.main} 100%)`
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: 0.12,
              backgroundImage: (theme) =>
                `radial-gradient(${theme.palette.common.white} 1.5px, transparent 1.5px)`,
              backgroundSize: '22px 22px'
            }}
          />
          <Stack spacing={2} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <HiOutlineCalendarDays size={34} color="#fff" />
            <Typography variant="h4" sx={{ color: 'common.white', fontWeight: 800, fontSize: { xs: 22, md: 28 } }}>
              Begin Your Spiritual Journey With Us
            </Typography>
            <Typography sx={{ color: alpha('#fff', 0.85), maxWidth: 480 }}>
              Book a verified Pandit Ji or explore authentic spiritual products, today.
            </Typography>
            <Button
              component={NextLink}
              href="/offline-puja-services"
              variant="contained"
              sx={{
                mt: 1,
                bgcolor: 'common.white',
                color: 'primary.dark',
                px: 3.5,
                py: 1.2,
                borderRadius: 50,
                fontWeight: 700,
                '&:hover': { bgcolor: (theme) => alpha(theme.palette.common.white, 0.9) }
              }}
            >
              Book a Puja Now
            </Button>
          </Stack>
        </Box> */}
      {/* </Box> */}
    </>
  );
}