'use client';
import React from 'react';
import { Box, Stack, Typography, Button } from '@mui/material';

// icons
import { GiPrayerBeads } from 'react-icons/gi';
import { MdVerified } from 'react-icons/md';
import { BsPeopleFill, BsStarFill, BsShieldFillCheck } from 'react-icons/bs';

const STATS = [
    { icon: GiPrayerBeads, value: '40+', label: 'Pujas Completed' },
    { icon: MdVerified, value: '20+', label: 'Verified Pandit Ji' },
    { icon: BsPeopleFill, value: '2K+', label: 'Happy Devotees' },
    { icon: BsStarFill, value: '4.8/5', label: 'Average Rating' },
    { icon: BsShieldFillCheck, value: '99%', label: 'Satisfaction Guarantee' },
];

export default function WhyChooseUs() {
    return (
        <Box
            sx={{
                bgcolor: '#E87722',
                borderRadius: 3,
                px: { xs: 3, md: 6 },
                py: { xs: 3, md: 3.5 },
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            {/* Decorative circle top-right */}
            <Box sx={{
                position: 'absolute', top: -60, right: -60,
                width: 220, height: 220, borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.05)', pointerEvents: 'none'
            }} />
            <Box sx={{
                position: 'absolute', bottom: -40, right: 80,
                width: 140, height: 140, borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none'
            }} />

            <Stack
                direction={{ xs: 'column', md: 'row' }}
                alignItems={{ xs: 'center', md: 'center' }}
                spacing={{ xs: 3, md: 6 }}
            >
                {/* Left — title + description + button */}
                <Stack spacing={1.5} alignItems={{ xs: 'center', md: 'flex-start' }} sx={{ maxWidth: { md: 280 }, flexShrink: 0 }}>
                    <Typography
                        sx={{
                            fontSize: { xs: 22, md: 24 },
                            fontWeight: 800,
                            color: '#fff',
                            lineHeight: 1.25,
                            textAlign: { xs: 'center', md: 'left' }
                        }}
                    >
                        Why Choose<br />Adhyatmah?
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: 13.5,
                            color: 'rgba(255,255,255,0.82)',
                            lineHeight: 1.55,
                            textAlign: { xs: 'center', md: 'left' },
                            maxWidth: { xs: 280, md: 'none' }
                        }}
                    >
                        A trusted spiritual platform dedicated to your devotion and convenience.
                    </Typography>

                    <Button
                        variant="outlined"
                        href="/about"
                        sx={{
                            borderColor: '#fff',
                            color: '#fff',
                            borderRadius: 6,
                            px: 2.5,
                            py: 0.75,
                            fontWeight: 700,
                            fontSize: 12.5,
                            textTransform: 'none',
                            alignSelf: { xs: 'center', md: 'flex-start' },
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.12)',
                                borderColor: '#fff'
                            }
                        }}
                    >
                        Know More About Us
                    </Button>
                </Stack>

                {/* Divider — desktop only (unchanged) */}
                <Box sx={{
                    display: { xs: 'none', md: 'block' },
                    width: '1px', alignSelf: 'stretch',
                    bgcolor: 'rgba(255,255,255,0.2)', flexShrink: 0
                }} />

                {/* Divider — mobile only, horizontal */}
                <Box sx={{
                    display: { xs: 'block', md: 'none' },
                    width: '70%',
                    height: '1px',
                    bgcolor: 'rgba(255,255,255,0.25)'
                }} />

                {/* Right — stats grid */}
                <Box
                    sx={{
                        flex: 1,
                        width: '100%',
                        display: { xs: 'grid', md: 'flex' },
                        gridTemplateColumns: { xs: 'repeat(2, 1fr)' },
                        gap: { xs: 1.5, md: 0 },
                        rowGap: { md: 2.5 },
                        columnGap: { md: 0 },
                        flexWrap: { md: 'wrap' }
                    }}
                >
                    {STATS.map(({ icon: Icon, value, label }, i) => {
                        const isLastOdd = i === STATS.length - 1 && STATS.length % 2 !== 0;
                        return (
                            <Stack
                                key={label}
                                alignItems="center"
                                justifyContent="center"
                                spacing={0.75}
                                sx={{
                                    width: { xs: '100%', md: '20%' },
                                    gridColumn: { xs: isLastOdd ? '1 / -1' : 'auto', md: 'auto' },
                                    maxWidth: { xs: isLastOdd ? 160 : 'none', md: 'none' },
                                    mx: { xs: isLastOdd ? 'auto' : 0, md: 0 },
                                    px: 1,
                                    py: { xs: 2, md: 0 },
                                    bgcolor: { xs: 'rgba(255,255,255,0.08)', md: 'transparent' },
                                    borderRadius: { xs: 3, md: 0 },
                                    borderRight: {
                                        md: i !== STATS.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none'
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        display: { xs: 'flex', md: 'block' },
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: { xs: 52, md: 'auto' },
                                        height: { xs: 52, md: 'auto' },
                                        borderRadius: { xs: '50%', md: 0 },
                                        bgcolor: { xs: 'rgba(255,255,255,0.12)', md: 'transparent' }
                                    }}
                                >
                                    <Icon size={36} color="rgba(255,255,255,0.9)" />
                                </Box>
                                <Typography sx={{ fontSize: { xs: 19, md: 22 }, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                                    {value}
                                </Typography>
                                <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.78)', textAlign: 'center', lineHeight: 1.3 }}>
                                    {label}
                                </Typography>
                            </Stack>
                        );
                    })}
                </Box>

            </Stack>
        </Box>
    );
}