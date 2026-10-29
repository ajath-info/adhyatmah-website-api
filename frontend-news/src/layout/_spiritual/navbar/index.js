'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// mui
import {
    AppBar,
    Toolbar,
    Container,
    Box,
    Stack,
    Typography,
    IconButton,
    Drawer,
    List,
    ListItemButton,
    ListItemText,
    useMediaQuery
} from '@mui/material';

// icons
import { IoMoonOutline, IoSunnyOutline } from 'react-icons/io5';
import { TbMenu2, TbX, TbHome2 } from 'react-icons/tb';

// redux
import { useSelector, useDispatch } from '@/redux';
import { setThemeMode } from '@/redux/slices/settings';

// Main site header (same one every other page uses) — Panchang pages now
// open INSIDE the main website, so this header stays on top and the
// Panchang links below act as a sub-navigation bar (like RideMyCars'
// Investor Portal bar).
import MainNavbar from 'src/layout/_main/navbar';

// Mantra announcement strip — shown BETWEEN the main header and the Panchang sub-nav
// (same strip the main site shows above its navbar).
import AnnouncementBar from '@/components/_main/announcement-bar';

// Kundali Matching's own, fully independent navbar (separate file/theme/links)
import KundaliNavbar from './kundali-navbar';

// Colours come from CSS variables (see src/theme/panchang-vars.js) so the
// sub-navbar follows light / dark mode automatically.
const NAV_THEME = {
    navy: 'var(--pm-navy)',
    muted: 'var(--pm-muted)',
    accent: 'var(--pm-accent)',
    border: 'var(--pm-border)'
};

const NAV_LINKS = [
    { label: 'Home', href: '/home', icon: TbHome2 }, // icon only in the desktop bar (label kept for mobile menu / a11y)
    { label: 'Panchang', href: '/panchang-muhurat' },
    { label: 'Calendar', href: '/calendar' },
    { label: 'Festivals', href: '/festivals' },
    { label: 'Vrat & Upvas', href: '/vrat-upvas' },
    { label: 'Muhurat', href: '/muhurat' },
    { label: 'Planetary Transit', href: '/planetary-transit' }
];

function NavLink({ label, href, active, icon: Icon }) {
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
                display: Icon ? 'inline-flex' : undefined,
                alignItems: Icon ? 'center' : undefined,
                '&:hover': { color: NAV_THEME.accent }
            }}
            aria-label={Icon ? label : undefined}
            title={Icon ? label : undefined}
        >
            {Icon ? <Icon size={20} /> : label}
        </Typography>
    );
}

export default function SpiritualNavbar({ branding }) {
    const pathname = usePathname();

    // Kundali pages keep their own separate navbar, untouched.
    if (pathname === '/kundali-matching' || pathname === '/kundali-generation') {
        return <KundaliNavbar branding={branding} />;
    }

    return (
        <>
            <MainNavbar branding={branding} />
            <AnnouncementBar />
            <PanchangSubNav />
        </>
    );
}

function PanchangSubNav() {
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
                    // sits right under the main site header (88px desktop / 64px mobile + 1px border)
                    top: { xs: 65, md: 89 },
                    zIndex: 998,
                    bgcolor: 'var(--pm-surface)',
                    backgroundImage: 'none',
                    borderBottom: `1px solid ${NAV_THEME.border}`
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ py: 0.6, minHeight: '52px !important', justifyContent: 'space-between' }}>
                        {!isMobile ? (
                            <Stack direction="row" spacing={3.5} alignItems="center" sx={{ flex: 1, justifyContent: 'center', pl: '40px' }}>
                                {NAV_LINKS.map((link) => (
                                    <NavLink key={link.label} {...link} active={pathname === link.href} />
                                ))}
                            </Stack>
                        ) : (
                            <Typography sx={{ fontWeight: 700, fontSize: 14, color: NAV_THEME.navy }}>
                                {NAV_LINKS.find((l) => l.href === pathname)?.label || 'Panchang'}
                            </Typography>
                        )}

                        <Stack direction="row" spacing={1.25} alignItems="center">
                            <IconButton
                                onClick={toggleTheme}
                                aria-label="Toggle dark mode"
                                size="small"
                                sx={{ color: NAV_THEME.navy, border: `1px solid ${NAV_THEME.border}` }}
                            >
                                {isDark ? <IoSunnyOutline size={18} /> : <IoMoonOutline size={18} />}
                            </IconButton>

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
                            <ListItemButton key={link.label} component={Link} href={link.href} onClick={() => setDrawerOpen(false)}>
                                <ListItemText primary={link.label} />
                            </ListItemButton>
                        ))}
                    </List>
                </Box>
            </Drawer>
        </>
    );
}