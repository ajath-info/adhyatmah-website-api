'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// mui
import {
  Box, Container, Grid, Stack, Typography,
  TextField, IconButton, InputAdornment, Divider, alpha,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { IoSend } from 'react-icons/io5';
import { FaFacebookF, FaInstagram, FaXTwitter, FaLinkedinIn } from 'react-icons/fa6';
import { MdOutlineCall, MdLocationOn, MdKeyboardArrowDown } from 'react-icons/md';
import { FiMail } from 'react-icons/fi';
import { BsWhatsapp } from 'react-icons/bs';

// components
import Logo from '@/components/logo';

/* ---------- DATA ---------- */
const SERVICES = [
  { label: 'Puja Booking', href: '/offline-puja-services' },
  { label: 'Pandit Ji Booking', href: '/book-pandit-online' },
  { label: 'Online Puja', href: '/online-puja-services' },
  { label: 'Puja Samagri', href: '/puja-products-online-store' },
  { label: 'Panchang & Muhurat', href: '/panchang-muhurat' },
];

const QUICK_LINKS = [
  { label: 'About Us', href: '/about-us' },
  { label: 'How It Works', href: '/' },
  { label: 'FAQs', href: '/' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'Contact Us', href: '/contact-us' },
];

const FooterLink = ({ label, href }) => (
  <Typography
    component={Link}
    href={href}
    sx={{
      fontSize: 13.5,
      color: 'text.secondary',
      textDecoration: 'none',
      transition: 'color .2s',
      '&:hover': { color: 'primary.main' }
    }}
  >
    {label}
  </Typography>
);

const FooterHeading = ({ children }) => (
  <Typography sx={{
    fontSize: 14,
    fontWeight: 800,
    color: 'text.primary',
    letterSpacing: 0.5,
    mb: 1,
    textTransform: 'uppercase'
  }}>
    {children}
  </Typography>
);

function DesktopFooter({ branding, isHome }) {
  const [email, setEmail] = React.useState('');

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'background.paper' : '#FDF0E6'),
        pt: 6,
        pb: 0,
        mt: isHome ? 0 : 8,
        display: { xs: 'none', md: 'block' },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle decorative circles */}
      <Box sx={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06), pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: 40, left: -50, width: 160, height: 160, borderRadius: '50%', bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05), pointerEvents: 'none' }} />

      <Container maxWidth="xl">
        <Grid container spacing={0} sx={{ flexWrap: 'nowrap', justifyContent: 'space-between' }}>

          {/* Col 1 — Logo + tagline + contact */}
          <Grid item sx={{ width: 250, flexShrink: 0 }}>
            <Stack spacing={2.5}>
              <Logo branding={branding} width={185} height={74} />

              <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
                Bringing spirituality to your doorstep. Book Puja, Pandit Ji and shop authentic spiritual products with trust.
              </Typography>

              {/* Social icons */}
              <Stack direction="row" spacing={1}>
                {[
                  { icon: FaFacebookF, href: branding?.socialLinks?.facebook || '/' },
                  { icon: FaInstagram, href: branding?.socialLinks?.instagram || '/' },
                  { icon: FaXTwitter, href: branding?.socialLinks?.twitter || '/' },
                  { icon: FaLinkedinIn, href: branding?.socialLinks?.linkedin || '/' },
                ].map(({ icon: Icon, href }, i) => (
                  <IconButton
                    key={i}
                    component={Link}
                    href={href}
                    target="_blank"
                    sx={{
                      width: 42, height: 42,
                      bgcolor: 'primary.main',
                      color: '#fff',
                      transition: 'all .2s',
                      '&:hover': { bgcolor: 'primary.dark', transform: 'translateY(-2px)' }
                    }}
                  >
                    <Icon size={19} />
                  </IconButton>
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Col 2 — Services */}
          <Grid item sx={{ width: 'fit-content', flexShrink: 0 }}>
            <Stack spacing={1.75}>
              <FooterHeading>Services</FooterHeading>
              {SERVICES.map((item) => <FooterLink key={item.label} {...item} />)}
            </Stack>
          </Grid>

          {/* Col 3 — Quick Links */}
          <Grid item sx={{ width: 'fit-content', flexShrink: 0 }}>
            <Stack spacing={1.75}>
              <FooterHeading>Quick Links</FooterHeading>
              {QUICK_LINKS.map((item) => <FooterLink key={item.label} {...item} />)}
            </Stack>
          </Grid>

          {/* Col 4 — Customer Support */}
          <Grid item sx={{ width: 260, flexShrink: 0 }}>
            <Stack spacing={1.75}>
              <FooterHeading>Customer Support</FooterHeading>

              <Stack direction="row" alignItems="flex-start" spacing={1}>
                <MdLocationOn size={16} color="#E87722" style={{ marginTop: 2, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.5 }}>
                  108, 1st floor, Tower A, Plot No. A-40, I-THUM TOWER, Sector 62 Noida, Uttar Pradesh- 201309
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <MdOutlineCall size={15} color="#E87722" />
                <Typography
                  component="a"
                  href={`tel:${branding?.contact?.whatsappNo}`}
                  sx={{ fontSize: 13, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  {branding?.contact?.whatsappNo || '+91 94528 72182'}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <FiMail size={15} color="#E87722" />
                <Typography
                  component="a"
                  href={`mailto:${branding?.contact?.email}`}
                  sx={{ fontSize: 13, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  {branding?.contact?.email || 'info@adhyatmah.com'}
                </Typography>
              </Stack>

              {/* <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.5 }}>
                Mon – Sun: 06:00 AM – 10:00 PM
              </Typography> */}

              <Box
                component={Link}
                href="https://wa.me/919452872182?text=I'm%20interested%20in%20your%20app%20services"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'primary.main',
                  color: '#fff',
                  px: 2, py: 0.9,
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  width: 'fit-content',
                  transition: 'all .2s',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <BsWhatsapp size={15} /> Chat with Us →
              </Box>
            </Stack>
          </Grid>

          {/* Col 5 — Newsletter + App */}
          <Grid item sx={{ width: 220, flexShrink: 0 }}>
            <Stack spacing={2}>
              <FooterHeading>Newsletter</FooterHeading>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.5 }}>
                Subscribe to get updates on pujas, offers and more.
              </Typography>

              <TextField
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" sx={{ color: '#fff', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
                        <IoSend size={14} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    fontSize: 13,
                    color: 'text.primary',
                    '& fieldset': { borderColor: 'divider' },
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                  }
                }}
              />

              {/* App buttons */}
              <Stack direction="row" spacing={1.25} sx={{ pt: 0.5 }}>
                <Box
                  component={Link}
                  href="https://play.google.com/store/apps/details?id=com.app.adhyatmah"
                  target="_blank"
                  sx={{ display: 'inline-flex', width: 130, height: 40, overflow: 'hidden' }}
                >
                  <Box
                    component="img"
                    src="https://raw.githubusercontent.com/pioug/google-play-badges/main/svg/en.svg"
                    alt="Get it on Google Play"
                    sx={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 1 }}
                  />
                </Box>
                <Box
                  component={Link}
                  href="https://apps.apple.com/in/app/adhyatmah/id6749001841"
                  target="_blank"
                  sx={{ display: 'inline-flex', width: 130, height: 40, overflow: 'hidden' }}
                >
                  <Box
                    component="img"
                    src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                    alt="Download on the App Store"
                    sx={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 1 }}
                  />
                </Box>
              </Stack>
            </Stack>
          </Grid>

        </Grid>

        {/* Bottom bar */}
        <Divider sx={{ mt: 5, borderColor: 'divider' }} />
        <Box sx={{ position: 'relative', py: 2.5 }}>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
            © 2026 Adhyatmah. All Rights Reserved.
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {[
              { label: 'Privacy Policy', href: '/privacy-policy' },
              { label: 'Terms & Conditions', href: '/terms-and-conditions' },
              { label: 'Refund Policy', href: '/refund-return-policy' },
            ].map(({ label, href }) => (
              <Typography
                key={label}
                component={Link}
                href={href}
                sx={{ fontSize: 12.5, color: 'text.secondary', textDecoration: 'none', whiteSpace: 'nowrap', '&:hover': { color: 'primary.main' } }}
              >
                {label}
              </Typography>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

/* ==================================================================
   MOBILE FOOTER — shown only on xs (desktop footer above is untouched)
   ================================================================== */
function MobileFooter({ branding, isHome }) {
  const [email, setEmail] = React.useState('');

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'background.paper' : '#FDF0E6'),
        display: { xs: 'block', md: 'none' },
        pt: 4,
        pb: 3,
        mt: isHome ? 0 : 5,
      }}
    >
      <Container maxWidth="xl">
        <Stack alignItems="center" spacing={2} sx={{ textAlign: 'center' }}>
          <Logo branding={branding} width={150} height={60} />

          <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6, maxWidth: 320 }}>
            Bringing spirituality to your doorstep. Book Puja, Pandit Ji and shop authentic spiritual products with trust.
          </Typography>

          <Stack direction="row" spacing={1.25}>
            {[
              { icon: FaFacebookF, href: branding?.socialLinks?.facebook || '/' },
              { icon: FaInstagram, href: branding?.socialLinks?.instagram || '/' },
              { icon: FaXTwitter, href: branding?.socialLinks?.twitter || '/' },
              { icon: FaLinkedinIn, href: branding?.socialLinks?.linkedin || '/' },
            ].map(({ icon: Icon, href }, i) => (
              <IconButton
                key={i}
                component={Link}
                href={href}
                target="_blank"
                sx={{
                  width: 38, height: 38,
                  bgcolor: 'primary.main',
                  color: '#fff',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <Icon size={16} />
              </IconButton>
            ))}
          </Stack>
        </Stack>

        {/* Collapsible sections */}
        <Stack sx={{ mt: 3 }}>
          <Accordion
            disableGutters
            elevation={0}
            sx={{ bgcolor: 'transparent', '&:before': { display: 'none' }, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <AccordionSummary expandIcon={<MdKeyboardArrowDown size={20} />}>
              <Typography sx={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Services
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1.5}>
                {SERVICES.map((item) => <FooterLink key={item.label} {...item} />)}
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion
            disableGutters
            elevation={0}
            sx={{ bgcolor: 'transparent', '&:before': { display: 'none' }, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <AccordionSummary expandIcon={<MdKeyboardArrowDown size={20} />}>
              <Typography sx={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Quick Links
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1.5}>
                {QUICK_LINKS.map((item) => <FooterLink key={item.label} {...item} />)}
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion
            disableGutters
            elevation={0}
            sx={{ bgcolor: 'transparent', '&:before': { display: 'none' }, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <AccordionSummary expandIcon={<MdKeyboardArrowDown size={20} />}>
              <Typography sx={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Customer Support
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1.75}>
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <MdLocationOn size={16} color="#E87722" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.5 }}>
                    108, 1st floor, Tower A, Plot No. A-40, I-THUM TOWER, Sector 62 Noida, Uttar Pradesh- 201309
                  </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1}>
                  <MdOutlineCall size={15} color="#E87722" />
                  <Typography
                    component="a"
                    href={`tel:${branding?.contact?.whatsappNo}`}
                    sx={{ fontSize: 13, color: 'text.secondary', textDecoration: 'none' }}
                  >
                    {branding?.contact?.whatsappNo || '+91 94528 72182'}
                  </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1}>
                  <FiMail size={15} color="#E87722" />
                  <Typography
                    component="a"
                    href={`mailto:${branding?.contact?.email}`}
                    sx={{ fontSize: 13, color: 'text.secondary', textDecoration: 'none' }}
                  >
                    {branding?.contact?.email || 'info@adhyatmah.com'}
                  </Typography>
                </Stack>

                <Box
                  component={Link}
                  href="https://wa.me/919452872182?text=I'm%20interested%20in%20your%20app%20services"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: 'primary.main',
                    color: '#fff',
                    px: 2, py: 0.9,
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: 'none',
                    width: 'fit-content',
                  }}
                >
                  <BsWhatsapp size={15} /> Chat with Us →
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>

        {/* Newsletter */}
        <Stack spacing={1.5} sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Newsletter
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.5 }}>
            Subscribe to get updates on pujas, offers and more.
          </Typography>

          <TextField
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            size="small"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" sx={{ color: '#fff', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
                    <IoSend size={14} />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                bgcolor: 'background.paper',
                borderRadius: 2,
                fontSize: 13,
                color: 'text.primary',
                '& fieldset': { borderColor: 'divider' },
              }
            }}
          />

          {/* App buttons */}
          <Stack direction="row" justifyContent="center" spacing={1.25} sx={{ pt: 0.5 }}>
            <Box
              component={Link}
              href="https://play.google.com/store/apps/details?id=com.app.adhyatmah"
              target="_blank"
              sx={{ display: 'inline-flex', width: 130, height: 40, overflow: 'hidden' }}
            >
              <Box
                component="img"
                src="https://raw.githubusercontent.com/pioug/google-play-badges/main/svg/en.svg"
                alt="Get it on Google Play"
                sx={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 1 }}
              />
            </Box>
            <Box
              component={Link}
              href="https://apps.apple.com/in/app/adhyatmah/id6749001841"
              target="_blank"
              sx={{ display: 'inline-flex', width: 130, height: 40, overflow: 'hidden' }}
            >
              <Box
                component="img"
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="Download on the App Store"
                sx={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 1 }}
              />
            </Box>
          </Stack>
        </Stack>

        {/* Bottom bar */}
        <Divider sx={{ mt: 4, mb: 2.5, borderColor: 'divider' }} />
        <Stack spacing={1.5} alignItems="center" sx={{ textAlign: 'center' }}>
          <Stack direction="row" flexWrap="wrap" justifyContent="center" spacing={2} rowGap={1}>
            {[
              { label: 'Privacy Policy', href: '/privacy-policy' },
              { label: 'Terms & Conditions', href: '/terms-and-conditions' },
              { label: 'Refund Policy', href: '/refund-return-policy' },
            ].map(({ label, href }) => (
              <Typography
                key={label}
                component={Link}
                href={href}
                sx={{ fontSize: 12, color: 'text.secondary', textDecoration: 'none', whiteSpace: 'nowrap' }}
              >
                {label}
              </Typography>
            ))}
          </Stack>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            © 2026 Adhyatmah. All Rights Reserved.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

export default function Footer({ branding }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <>
      <DesktopFooter branding={branding} isHome={isHome} />
      <MobileFooter branding={branding} isHome={isHome} />
    </>
  );
}