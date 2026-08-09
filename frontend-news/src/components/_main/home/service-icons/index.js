'use client';

import React from 'react';
import Link from 'next/link';

// mui
import { Box, Stack, Typography } from '@mui/material';

// icons
import { GiFireBowl, GiCrystalBall } from 'react-icons/gi';
import { FaUserTie, FaGift, FaShoppingBag } from 'react-icons/fa';
import { MdComputer } from 'react-icons/md';

/* ---------------- DATA ---------------- */

const SERVICES = [
    {
        icon: GiFireBowl,
        title: 'Puja Booking',
        subtitle: 'Book Offline Puja at your place with verified Pandit Ji',
        cta: 'Book Now',
        href: '/offline-puja-services'
    },
    {
        icon: FaUserTie,
        title: 'Pandit Ji Booking',
        subtitle: 'Choose from verified & experienced Pandit Ji',
        cta: 'View Pandit Ji',
        href: '/book-pandit-online'
    },
    {
        icon: MdComputer,
        title: 'Online Puja',
        subtitle: 'Attend live puja from the comfort of your home',
        cta: 'Book Online',
        href: '/online-puja-services'
    },
    {
        icon: FaShoppingBag,
        title: 'Spiritual E-Commerce',
        subtitle: '1000+ authentic spiritual products',
        cta: 'Shop Now',
        href: '/products'
    },
    {
        icon: GiCrystalBall,
        title: 'Panchang & Muhurat',
        subtitle: 'Plan Every Ritual with the Right Muhurat',
        cta: 'Consult Now',
        href: '/panchang-muhurat'
    }
];

export default function ServiceIcons() {
    return (
        <Box
            sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                bgcolor: 'background.paper',
                px: { xs: 2.5, md: 4 },
                py: { xs: 3.5, md: 3.5 }
            }}
        >
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                flexWrap={{ xs: 'nowrap', md: 'nowrap' }}
                sx={{ rowGap: { xs: 3, sm: 3.5 } }}
            >
                {SERVICES.map(({ icon: Icon, title, subtitle, cta, href }, index) => (
                    <Box
                        key={title}
                        sx={{
                            width: { xs: '100%', md: `${100 / SERVICES.length}%` },
                            flexShrink: { md: 0 },
                            borderRight: {
                                md: index !== SERVICES.length - 1 ? '1px solid' : 'none'
                            },
                            borderBottom: {
                                xs: index !== SERVICES.length - 1 ? '1px solid' : 'none',
                                md: 'none'
                            },
                            borderColor: 'divider',
                            px: { xs: 0, md: 2.5 },
                            pb: { xs: index !== SERVICES.length - 1 ? 2.5 : 0, md: 0 }
                        }}
                    >
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <Box sx={{ flexShrink: 0, mt: 0.25 }}>
                                <Icon size={48} color="#E87722" />
                            </Box>

                            <Stack spacing={0.5} alignItems="flex-start">
                                <Typography
                                    sx={{
                                        fontSize: { xs: 15, md: 16.5 },
                                        fontWeight: 700,
                                        color: 'text.primary',
                                        lineHeight: 1.25
                                    }}
                                >
                                    {title}
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: { xs: 12.5, md: 13.5 },
                                        color: 'text.secondary',
                                        lineHeight: 1.4
                                    }}
                                >
                                    {subtitle}
                                </Typography>

                                <Typography
                                    component={Link}
                                    href={href}
                                    sx={{
                                        fontSize: { xs: 12.5, md: 13.5 },
                                        fontWeight: 700,
                                        color: '#E87722',
                                        textDecoration: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        mt: 0.5,
                                        whiteSpace: 'nowrap',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    {cta} →
                                </Typography>
                            </Stack>
                        </Stack>
                    </Box>
                ))}
            </Stack>
        </Box>
    );
}