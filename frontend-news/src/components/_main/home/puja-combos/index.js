'use client';
import React from 'react';
import Link from 'next/link';
import { Typography, Grid, Stack, Box, Container, Button } from '@mui/material';
import { IoArrowForward } from 'react-icons/io5';
import { GiFireBowl, GiTakeMyMoney } from 'react-icons/gi';
import { FaUserTie, FaBoxOpen } from 'react-icons/fa';
import { RiSecurePaymentFill } from 'react-icons/ri';
import ComboCard from 'src/components/cards/combo';

const ORANGE = '#E87722';

function ArrowLine({ direction = 'left' }) {
    return (
        <Box component="svg" viewBox="0 0 46 14" sx={{ width: { xs: 26, sm: 36, md: 42 }, height: 14, display: { xs: 'none', sm: 'block' }, transform: direction === 'right' ? 'scaleX(-1)' : 'none' }}>
            <line x1="0" y1="7" x2="34" y2="7" stroke={ORANGE} strokeWidth="2" />
            <path d="M28 1.5 L37 7 L28 12.5" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Box>
    );
}

const HIGHLIGHTS = [
    { icon: FaUserTie, title: 'Verified Pandit Ji', sub: 'Experienced & Trusted' },
    { icon: GiFireBowl, title: 'Complete Puja Service', sub: 'As per Vedic Rituals' },
    { icon: FaBoxOpen, title: 'Puja Samagri Kit', sub: 'All Essential Items' },
    { icon: GiTakeMyMoney, title: 'Better Value', sub: 'Save More With Combos' },
    { icon: RiSecurePaymentFill, title: 'Secure Payments', sub: 'Safe & Hassle-Free Booking' }
];

/* combos: array of active, homepage-featured combos (see cards/combo for shape) */
export default function PujaCombosSection({ combos }) {
    const list = Array.isArray(combos) ? combos : [];
    return (
        <Container maxWidth="xl" disableGutters>
            <Stack gap={3}>
                <Stack alignItems="center" spacing={1}>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={{ xs: 1, sm: 1.5 }}>
                        <ArrowLine direction="left" />
                        <Typography component="h2" sx={{ fontSize: { xs: 20, sm: 24, md: 26 }, fontWeight: 700, color: 'text.primary' }}>
                            Complete <Box component="span" sx={{ color: ORANGE }}>Puja Combos</Box>
                        </Typography>
                        <ArrowLine direction="right" />
                    </Stack>
                    <Typography variant="body1" color="text.secondary" textAlign="center">
                        Everything You Need For Your Puja, In One Package
                    </Typography>
                </Stack>

                <Grid container spacing={2} justifyContent="center">
                    {HIGHLIGHTS.map(({ icon: Icon, title, sub }) => (
                        <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 12 }} key={title}>
                            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5}>
                                <Stack alignItems="center" justifyContent="center" sx={{ width: { xs: 56, md: 66 }, height: { xs: 56, md: 66 }, borderRadius: '50%', background: 'linear-gradient(135deg, #fff1e3 0%, #fdd9b5 100%)', border: '1.5px solid #f8c796', boxShadow: '0 6px 16px rgba(232,119,34,0.18)', flexShrink: 0 }}>
                                    <Icon size={32} color={ORANGE} />
                                </Stack>
                                <Box>
                                    <Typography sx={{ fontSize: { xs: 14.5, md: 16 }, fontWeight: 700, lineHeight: 1.25 }}>{title}</Typography>
                                    <Typography sx={{ fontSize: { xs: 13, md: 14 }, color: 'text.secondary' }}>{sub}</Typography>
                                </Box>
                            </Stack>
                        </Grid>
                    ))}
                </Grid>

                {list.length > 0 ? (
                    <Grid container spacing={2}>
                        {list.slice(0, 5).map((combo) => (
                            <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 12 }} key={combo.id || combo.slug}>
                                <ComboCard combo={combo} />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography textAlign="center" color="text.secondary" sx={{ py: 4 }}>
                        Complete Puja Combos are coming soon.
                    </Typography>
                )}

                {list.length > 0 && (
                    <Box sx={{ textAlign: 'center' }}>
                        <Button
                            variant="outlined"
                            color="secondary"
                            endIcon={<IoArrowForward />}
                            component={Link}
                            href="/puja-combos"
                            sx={{
                                '& svg': { transition: 'transform 0.3s ease' },
                                '&:hover': { svg: { transform: 'translateX(4px)' } }
                            }}
                        >
                            View All Combos
                        </Button>
                    </Box>
                )}
            </Stack>
        </Container>
    );
}