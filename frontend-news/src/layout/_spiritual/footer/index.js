import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

// mui
import { Box, Container, Grid, Stack, Typography, IconButton, Divider } from '@mui/material';

// icons
import { FaFacebookF, FaInstagram, FaYoutube, FaXTwitter, FaLinkedinIn } from 'react-icons/fa6';

const FOOTER_THEME = {
    navy: 'var(--pm-navy)',
    muted: 'var(--pm-muted)',
    accent: 'var(--pm-accent)',
    border: 'var(--pm-border)',
    bg: 'var(--pm-soft-bg)'
};

// href: '#' = module not built yet in the new design — rendered with a
// "Soon" tag instead of a dead/misleading link. Flip to a real path once
// that module's page exists inside src/app/(spiritual).
const QUICK_LINKS = [
    { label: 'Panchang', href: '/panchang-muhurat' },
    { label: 'Kundali Matching', href: '/kundali-matching' },
    { label: 'Horoscope', href: '#' },
    { label: 'Consultation', href: '#' },
    { label: 'Remedies', href: '#' },
    { label: 'Learn', href: '#' },
    { label: 'About Us', href: '#' }
];

// These pages only exist on the old (user) group site, not inside this
// new (spiritual) module — so no redirect out of the module. Labels stay
// visible, `static` just suppresses the "Soon" tag since they aren't
// upcoming features, they simply aren't wired up in this module yet.
const SUPPORT_LINKS = [
    { label: 'Help Center', href: '#' },
    { label: 'Contact Us', href: '#', static: true },
    { label: 'Terms & Conditions', href: '#', static: true },
    { label: 'Privacy Policy', href: '#', static: true },
    { label: 'Refund Policy', href: '#', static: true },
    { label: 'Sitemap', href: '#' }
];

// Mirrors the "Tools for Your Spiritual Journey" tiles above — those tiles
// are label-only (no hrefs) today, so these stay '#' + Soon too.
const SERVICE_LINKS = [
    { label: 'Muhurat Finder', href: '#' },
    { label: 'Kundli Matching', href: '/kundali-matching' },
    { label: 'Puja Booking', href: '#' },
    { label: 'Gemstone Recommendation', href: '#' },
    { label: 'Vastu Consultation', href: '#' }
];

const SOCIAL_ICONS = [
    { Icon: FaFacebookF, key: 'facebook' },
    { Icon: FaInstagram, key: 'instagram' },
    { Icon: FaYoutube, key: 'youtube' },
    { Icon: FaXTwitter, key: 'twitter' },
    { Icon: FaLinkedinIn, key: 'linkedin' }
];

function SoonTag() {
    return (
        <Box
            component="span"
            sx={{
                ml: 0.75,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 0.4,
                color: FOOTER_THEME.accent,
                border: `1px solid ${FOOTER_THEME.accent}`,
                borderRadius: 1,
                px: 0.5,
                py: '1px',
                verticalAlign: 'middle'
            }}
        >
            SOON
        </Box>
    );
}

function FooterLink({ label, href, static: isStatic }) {
    const isDisabled = href === '#';
    return (
        <Typography
            component={isDisabled ? 'span' : Link}
            href={isDisabled ? undefined : href}
            sx={{
                fontSize: 13.5,
                color: FOOTER_THEME.muted,
                textDecoration: 'none',
                opacity: isDisabled ? 0.75 : 1,
                cursor: isDisabled ? 'default' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                transition: 'color .2s',
                '&:hover': isDisabled ? {} : { color: FOOTER_THEME.navy }
            }}
        >
            {label}
            {isDisabled && !isStatic && <SoonTag />}
        </Typography>
    );
}

function FooterHeading({ children }) {
    return (
        <Typography
            sx={{
                fontSize: 13,
                fontWeight: 800,
                color: FOOTER_THEME.navy,
                letterSpacing: 0.4,
                textTransform: 'uppercase',
                mb: 1.75
            }}
        >
            {children}
        </Typography>
    );
}

function BrandBlock({ branding }) {
    const logoSrc = branding?.logoLight?.url;

    return (
        <Stack spacing={2.25} sx={{ maxWidth: 300 }}>
            <Stack alignItems="flex-start">
                {logoSrc && (
                    <Box sx={{ position: 'relative', width: { xs: 120, md: 132 }, height: { xs: 44, md: 48 }, flexShrink: 0 }}>
                        <Image src={logoSrc} alt="Adhyatmah" fill sizes="132px" style={{ objectFit: 'contain', objectPosition: 'left center' }} draggable="false" />
                    </Box>
                )}
            </Stack>

            <Typography sx={{ color: FOOTER_THEME.muted, fontSize: 13, lineHeight: 1.6 }}>
                Your companion on the journey of self-discovery and spiritual growth through the timeless wisdom of
                Vedic astrology.
            </Typography>

            <Stack direction="row" spacing={1}>
                {SOCIAL_ICONS.map(({ Icon, key }) => (
                    <IconButton
                        key={key}
                        component={Link}
                        href={branding?.socialLinks?.[key] || '#'}
                        target={branding?.socialLinks?.[key] ? '_blank' : undefined}
                        sx={{
                            width: 34,
                            height: 34,
                            bgcolor: FOOTER_THEME.bg,
                            border: `1px solid ${FOOTER_THEME.border}`,
                            color: FOOTER_THEME.navy,
                            transition: 'all .2s',
                            '&:hover': { bgcolor: FOOTER_THEME.accent, color: '#fff', borderColor: FOOTER_THEME.accent }
                        }}
                    >
                        <Icon size={14} />
                    </IconButton>
                ))}
            </Stack>
        </Stack>
    );
}

function DownloadAppBlock() {
    return (
        <Stack spacing={1.5}>
            <FooterHeading>Download Our App</FooterHeading>
            <Typography sx={{ color: FOOTER_THEME.muted, fontSize: 13, lineHeight: 1.6, mb: 0.5 }}>
                Get the Adhyatmah app for a better experience.
            </Typography>
            <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
                <Box
                    component={Link}
                    href="https://play.google.com/store/apps/details?id=com.app.adhyatmah"
                    target="_blank"
                    sx={{ display: 'inline-flex', width: 130, height: 39, overflow: 'hidden' }}
                >
                    <Box
                        component="img"
                        src="https://raw.githubusercontent.com/pioug/google-play-badges/main/svg/en.svg"
                        alt="Get it on Google Play"
                        sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                </Box>
                <Box
                    component={Link}
                    href="https://apps.apple.com/in/app/adhyatmah/id6749001841"
                    target="_blank"
                    sx={{ display: 'inline-flex', width: 130, height: 39, overflow: 'hidden' }}
                >
                    <Box
                        component="img"
                        src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                        alt="Download on the App Store"
                        sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                </Box>
            </Stack>
        </Stack>
    );
}

export default function SpiritualFooter({ branding }) {
    return (
        <Box sx={{ borderTop: `1px solid ${FOOTER_THEME.border}`, bgcolor: 'var(--pm-surface)', mt: 0 }}>
            <Container maxWidth="xl" sx={{ pt: { xs: 5, md: 6 }, pb: { xs: 2, md: 2.5 } }}>
                <Grid container spacing={{ xs: 5, md: 4 }} justifyContent="space-between">
                    <Grid item xs={12} sm={6} md={3}>
                        <BrandBlock branding={branding} />
                    </Grid>

                    <Grid item xs={6} sm={3} md={2}>
                        <FooterHeading>Quick Links</FooterHeading>
                        <Stack spacing={1.25}>
                            {QUICK_LINKS.map((l) => (
                                <FooterLink key={l.label} {...l} />
                            ))}
                        </Stack>
                    </Grid>

                    <Grid item xs={6} sm={3} md={2}>
                        <FooterHeading>Support</FooterHeading>
                        <Stack spacing={1.25}>
                            {SUPPORT_LINKS.map((l) => (
                                <FooterLink key={l.label} {...l} />
                            ))}
                        </Stack>
                    </Grid>

                    <Grid item xs={6} sm={3} md={2}>
                        <FooterHeading>Services</FooterHeading>
                        <Stack spacing={1.25}>
                            {SERVICE_LINKS.map((l) => (
                                <FooterLink key={l.label} {...l} />
                            ))}
                        </Stack>
                    </Grid>

                    <Grid item xs={6} sm={3} md={2.5}>
                        <DownloadAppBlock />
                    </Grid>
                </Grid>

                <Divider sx={{ mt: { xs: 2, md: 2.5 }, mb: { xs: 1.5, md: 2 }, borderColor: FOOTER_THEME.border }} />

                <Typography sx={{ color: FOOTER_THEME.muted, fontSize: 12, textAlign: 'center' }}>
                    © {new Date().getFullYear()} Adhyatmah. All rights reserved.
                </Typography>
            </Container>
        </Box>
    );
}