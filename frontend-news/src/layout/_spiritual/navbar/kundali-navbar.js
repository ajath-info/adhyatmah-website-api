// Place at: src/layout/_spiritual/navbar/kundali-navbar.js
//
// Standalone navbar used ONLY on the Kundali Matching page
// (/kundali-matching). This file is intentionally 100% independent from
// ./index.js (the default spiritual navbar used by Panchang, Festivals,
// etc.) — its own theme tokens, its own NAV_LINKS, its own BrandMark/NavLink
// components. Editing colors, text or links here can never affect any other
// page, and editing the default navbar can never affect this one.

'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

// mui
import {
    AppBar,
    Toolbar,
    Container,
    Box,
    Stack,
    Typography,
    Button,
    IconButton,
    Drawer,
    List,
    ListItemButton,
    ListItemText,
    useMediaQuery,
    useTheme
} from '@mui/material';

// icons
import { IoMoonOutline, IoSunnyOutline } from 'react-icons/io5';
import { TbMenu2, TbX } from 'react-icons/tb';

// redux
import { useSelector, useDispatch } from '@/redux';
import { setThemeMode } from '@/redux/slices/settings';

// Premium gold theme tokens — only used on this page.
const NAV_THEME = {
    navy: '#1B2A4A',
    muted: '#6B7291',
    accent: '#C9971A',
    accentSoft: '#F4C430',
    border: '#F0E1C4'
};

// Edit these labels/links freely — this list is only used on the Kundali
// Matching navbar and has no effect on Panchang/Festivals/etc.
// href: '#' renders as a disabled "Soon" item (no matching page exists yet).
// "Match" links to this page itself since that's the real matching feature;
// "Kundli" links to the new premium-design Kundali Generation page (same
// form/logic as the old /kundali page, new module/shell — see
// src/app/(spiritual)/kundali-generation/page.js).
const NAV_LINKS = [
    { label: 'Home', href: '#' },
    { label: 'Kundli', href: '/kundali-generation' },
    { label: 'Match', href: '/kundali-matching' },
    // { label: 'Panchang', href: '/panchang-muhurat' },
    { label: 'Predictions', href: '#' },
    { label: 'Remedies', href: '#' },
    { label: 'Astrologers', href: '#' }
];

function BrandMark({ branding }) {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const logoSrc = isDarkMode ? branding?.logoDark?.url : branding?.logoLight?.url;

    return (
        <Stack direction="row" spacing={1.25} alignItems="center">
            {logoSrc && (
                <Box sx={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
                    <Image src={logoSrc} alt="Adhyatmah" fill style={{ objectFit: 'contain' }} draggable="false" />
                </Box>
            )}
            <Box>
                <Typography sx={{ color: NAV_THEME.navy, fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>
                    Adhyatmah
                </Typography>
                <Typography sx={{ color: NAV_THEME.muted, fontSize: 11, letterSpacing: 0.4 }}>
                    Awaken. Align. Achieve.
                </Typography>
            </Box>
        </Stack>
    );
}

function NavLink({ label, href, active }) {
    if (href === '#') {
        return (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ opacity: 0.45, cursor: 'default' }}>
                <Typography sx={{ fontWeight: 600, fontSize: 14, color: NAV_THEME.navy }}>{label}</Typography>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: NAV_THEME.accent }}>SOON</Typography>
            </Stack>
        );
    }
    return (
        <Typography
            component={Link}
            href={href}
            sx={{
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
                color: active ? NAV_THEME.accent : NAV_THEME.navy,
                borderBottom: active ? `2px solid ${NAV_THEME.accent}` : '2px solid transparent',
                pb: 0.5,
                '&:hover': { color: NAV_THEME.accent }
            }}
        >
            {label}
        </Typography>
    );
}

export default function KundaliNavbar({ branding }) {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const { themeMode } = useSelector((state) => state.settings);
    const isMobile = useMediaQuery('(max-width:960px)');
    const [drawerOpen, setDrawerOpen] = useState(false);

    const isDark = themeMode === 'dark';
    const toggleTheme = () => dispatch(setThemeMode(isDark ? 'light' : 'dark'));

    return (
        <>
            <AppBar
                elevation={0}
                position="sticky"
                sx={{
                    top: 0,
                    zIndex: 999,
                    bgcolor: '#FFFFFF',
                    borderBottom: `1px solid ${NAV_THEME.border}`
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ py: 1.5, justifyContent: 'space-between' }}>
                        <BrandMark branding={branding} />

                        {!isMobile && (
                            <Stack direction="row" spacing={3.5} alignItems="center">
                                {NAV_LINKS.map((link) => (
                                    <NavLink key={link.label} {...link} active={pathname === link.href} />
                                ))}
                            </Stack>
                        )}

                        <Stack direction="row" spacing={1.25} alignItems="center">
                            <IconButton
                                onClick={toggleTheme}
                                aria-label="Toggle dark mode"
                                sx={{ color: NAV_THEME.navy, border: `1px solid ${NAV_THEME.border}` }}
                            >
                                {isDark ? <IoSunnyOutline size={18} /> : <IoMoonOutline size={18} />}
                            </IconButton>

                            {!isMobile && (
                                <>
                                    <Button
                                        component={Link}
                                        href="/auth/sign-in"
                                        variant="outlined"
                                        sx={{
                                            borderRadius: 50,
                                            color: NAV_THEME.navy,
                                            borderColor: NAV_THEME.border,
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            '&:hover': { borderColor: NAV_THEME.accent, bgcolor: '#FBF3E4' }
                                        }}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        component={Link}
                                        href="/auth/sign-up"
                                        variant="contained"
                                        sx={{
                                            borderRadius: 50,
                                            background: `linear-gradient(90deg, ${NAV_THEME.accentSoft} 0%, ${NAV_THEME.accent} 100%)`,
                                            color: NAV_THEME.navy,
                                            fontWeight: 700,
                                            textTransform: 'none',
                                            boxShadow: '0 6px 16px rgba(201,151,26,0.3)',
                                            '&:hover': {
                                                background: `linear-gradient(90deg, ${NAV_THEME.accent} 0%, ${NAV_THEME.accent} 100%)`,
                                                boxShadow: '0 8px 20px rgba(201,151,26,0.4)'
                                            }
                                        }}
                                    >
                                        Sign Up
                                    </Button>
                                </>
                            )}

                            {isMobile && (
                                <IconButton onClick={() => setDrawerOpen(true)} aria-label="Open menu" sx={{ color: NAV_THEME.navy }}>
                                    <TbMenu2 size={22} />
                                </IconButton>
                            )}
                        </Stack>
                    </Toolbar>
                </Container>
            </AppBar>

            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box sx={{ width: 280, p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography sx={{ fontWeight: 700, color: NAV_THEME.navy }}>Menu</Typography>
                        <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                            <TbX size={20} />
                        </IconButton>
                    </Stack>
                    <List>
                        {NAV_LINKS.map((link) => (
                            <ListItemButton
                                key={link.label}
                                component={link.href === '#' ? 'div' : Link}
                                href={link.href === '#' ? undefined : link.href}
                                disabled={link.href === '#'}
                                onClick={() => link.href !== '#' && setDrawerOpen(false)}
                            >
                                <ListItemText primary={link.href === '#' ? `${link.label} (Soon)` : link.label} />
                            </ListItemButton>
                        ))}
                    </List>
                    <Stack spacing={1.5} sx={{ mt: 2 }}>
                        <Button
                            component={Link}
                            href="/auth/sign-in"
                            variant="outlined"
                            fullWidth
                            onClick={() => setDrawerOpen(false)}
                            sx={{ borderRadius: 50, color: NAV_THEME.navy, borderColor: NAV_THEME.border, textTransform: 'none' }}
                        >
                            Login
                        </Button>
                        <Button
                            component={Link}
                            href="/auth/sign-up"
                            variant="contained"
                            fullWidth
                            onClick={() => setDrawerOpen(false)}
                            sx={{
                                borderRadius: 50,
                                background: `linear-gradient(90deg, ${NAV_THEME.accentSoft} 0%, ${NAV_THEME.accent} 100%)`,
                                color: NAV_THEME.navy,
                                fontWeight: 700,
                                textTransform: 'none',
                                boxShadow: 'none'
                            }}
                        >
                            Sign Up
                        </Button>
                    </Stack>
                </Box>
            </Drawer>
        </>
    );
}