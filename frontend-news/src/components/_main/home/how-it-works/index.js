'use client';

import React from 'react';
import { Box, Container, Grid, Stack, Typography } from '@mui/material';

import { MdEventNote, MdOutlineEventAvailable, MdLocationOn, MdCheckCircle } from 'react-icons/md';
import { FaUserCheck } from 'react-icons/fa';
import { IoArrowForward } from 'react-icons/io5';

const ORANGE = '#E87722';

const STEPS = [
    {
        icon: MdEventNote,
        step: 1,
        title: 'Choose Service',
        subtitle: 'Select the puja or service you need'
    },
    {
        icon: FaUserCheck,
        step: 2,
        title: 'Select Pandit Ji',
        subtitle: 'Choose from verified & experienced Pandit Ji'
    },
    {
        icon: MdOutlineEventAvailable,
        step: 3,
        title: 'Pick Date & Time',
        subtitle: 'Choose your preferred slot'
    },
    {
        icon: MdLocationOn,
        step: 4,
        title: 'Provide Details',
        subtitle: 'Enter your address and puja details'
    },
    {
        icon: MdCheckCircle,
        step: 5,
        title: 'Booking Confirmed',
        subtitle: 'We will take care of the rest'
    }
];

/* ---------------- DECORATIVE ARROW LINE (matches other home sections) ---------------- */
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

/* ---------------- SINGLE STEP — now fills its grid cell, same width language as the rest of the homepage grid ---------------- */
function StepCard({ icon: Icon, step, title, subtitle }) {
    return (
        <Stack alignItems="center" spacing={1.25} sx={{ width: '100%', height: '100%', textAlign: 'center' }}>
            <Box sx={{ position: 'relative', mb: 1.5 }}>
                <Stack
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        width: 68,
                        height: 68,
                        borderRadius: '18px',
                        bgcolor: 'rgba(232,119,34,0.1)',
                        border: '1.5px solid rgba(232,119,34,0.25)'
                    }}
                >
                    <Icon size={28} color={ORANGE} />
                </Stack>

                <Stack
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        position: 'absolute',
                        bottom: -10,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        bgcolor: ORANGE,
                        border: '2px solid #fff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                    }}
                >
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                        {step}
                    </Typography>
                </Stack>
            </Box>

            <Typography
                sx={{
                    fontSize: { xs: 14.5, sm: 15.5 },
                    fontWeight: 700,
                    color: 'text.primary',
                    lineHeight: 1.3
                }}
            >
                {title}
            </Typography>

            <Typography
                sx={{
                    fontSize: { xs: 12, sm: 12.5 },
                    color: 'text.secondary',
                    lineHeight: 1.5,
                    maxWidth: 190
                }}
            >
                {subtitle}
            </Typography>
        </Stack>
    );
}

/* ---------------- MAIN COMPONENT ---------------- */
export default function HowItWorks({ title = 'How It Works' }) {
    return (
        <Container maxWidth="xl">
            <Stack gap={3}>
                <Stack alignItems="center" spacing={1}>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={{ xs: 1, sm: 1.5 }}>
                        <ArrowLine direction="left" />
                        <Typography
                            sx={{
                                fontSize: { xs: 20, sm: 24, md: 26 },
                                fontWeight: 700,
                                color: 'text.primary'
                            }}
                        >
                            {title}
                        </Typography>
                        <ArrowLine direction="right" />
                    </Stack>
                </Stack>

                {/* Steps — same 5-column grid used across the homepage (Pandit List, Puja Services, etc.) */}
                <Grid container spacing={2.5} alignItems="stretch">
                    {STEPS.map((stepData, index) => (
                        <Grid
                            size={{ lg: 2.4, md: 4, sm: 6, xs: 12 }}
                            key={stepData.step}
                            sx={{ display: 'flex', position: 'relative' }}
                        >
                            <StepCard {...stepData} />

                            {/* Connector arrow — sits in the gap between this card and the next */}
                            {index !== STEPS.length - 1 && (
                                <Box
                                    sx={{
                                        display: { xs: 'none', md: 'flex' },
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'absolute',
                                        top: 34,
                                        right: 0,
                                        transform: 'translate(50%, -50%)',
                                        zIndex: 2
                                    }}
                                >
                                    <IoArrowForward size={18} color="#8a8a8a" />
                                </Box>
                            )}
                        </Grid>
                    ))}
                </Grid>
            </Stack>
        </Container>
    );
}