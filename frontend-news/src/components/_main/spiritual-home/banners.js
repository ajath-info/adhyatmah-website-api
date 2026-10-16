'use client';
import React from 'react';
import Link from 'next/link';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { TbArrowRight, TbPlant2 } from 'react-icons/tb';
import { HOME_THEME } from './theme';

const BANNER_IMAGE = '/images/home-hero-banner.jpg';

const bannerShell = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '18px',
    minHeight: { xs: 190, md: 200 },
    display: 'flex',
    alignItems: 'center',
    p: { xs: 2.5, md: 3.5 }
};

// Three closing cards: a pointer into Panchang, a Sanskrit line, and a
// gentle "plant a tree" note. Kept calm so the page ends quietly.
export default function HomeBanners() {
    return (
        <Container maxWidth="xl" sx={{ mt: { xs: 2.5, md: 3.5 } }}>
            <Box
                sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.2fr) minmax(0, 1.1fr)', lg: 'minmax(0, 1.25fr) minmax(0, 1.1fr) minmax(0, 1fr)' }
                }}
            >
                {/* 1. Explore Panchang — navy over the hero photo */}
                <Box
                    sx={{
                        ...bannerShell,
                        color: '#FFFFFF',
                        backgroundColor: HOME_THEME.navy,
                        backgroundImage: `linear-gradient(90deg, rgba(27,42,74,0.96) 0%, rgba(27,42,74,0.82) 55%, rgba(27,42,74,0.45) 100%), url("${BANNER_IMAGE}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center right'
                    }}
                >
                    <Box>
                        <Typography component="h2" sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 800, lineHeight: 1.2 }}>
                            Not just dates,
                            <br />
                            but divine guidance.
                        </Typography>
                        <Typography sx={{ mt: 1, fontSize: 14, color: HOME_THEME.silver, maxWidth: 360 }}>
                            Let ancient wisdom light up your modern life.
                        </Typography>
                        <Button
                            component={Link}
                            href="/panchang-muhurat"
                            variant="contained"
                            disableElevation
                            endIcon={<TbArrowRight size={18} />}
                            sx={{
                                mt: 2,
                                px: 2.5,
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 700,
                                color: HOME_THEME.navy,
                                bgcolor: HOME_THEME.silver,
                                '&:hover': { bgcolor: '#FFFFFF' }
                            }}
                        >
                            Explore Panchang
                        </Button>
                    </Box>
                </Box>

                {/* 2. Quote */}
                <Box
                    sx={{
                        ...bannerShell,
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        bgcolor: HOME_THEME.silver,
                        border: `1px solid ${HOME_THEME.panelBorder}`
                    }}
                >
                    <Typography component="blockquote" sx={{ m: 0, fontSize: { xs: 19, md: 22 }, fontStyle: 'italic', fontWeight: 600, lineHeight: 1.4, color: HOME_THEME.navy }}>
                        &ldquo;Time is not just a measure, it is a teacher.&rdquo;
                    </Typography>
                    <Box sx={{ width: 56, height: 2, my: 1.75, borderRadius: 1, bgcolor: HOME_THEME.accent }} />
                    <Typography lang="sa" sx={{ fontSize: { xs: 19, md: 22 }, fontWeight: 600, color: HOME_THEME.navySoft }}>
                        कालः सर्वं शिक्षयति ॥
                    </Typography>
                </Box>

                {/* 3. Plant a tree */}
                <Box
                    sx={{
                        ...bannerShell,
                        gridColumn: { md: '1 / -1', lg: 'auto' },
                        bgcolor: '#FFFFFF',
                        border: `1px solid ${HOME_THEME.panelBorder}`,
                        boxShadow: HOME_THEME.shadow
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ width: 56, height: 56, flexShrink: 0, borderRadius: '16px', display: 'grid', placeItems: 'center', bgcolor: HOME_THEME.silver }}>
                            <TbPlant2 size={30} color={HOME_THEME.accent} />
                        </Box>
                        <Box>
                            <Typography component="h2" sx={{ fontSize: { xs: 18, md: 20 }, fontWeight: 800, color: HOME_THEME.navy, lineHeight: 1.25 }}>
                                Plant a Tree on Your Sacred Day
                            </Typography>
                            <Typography sx={{ mt: 0.5, fontSize: 13.5, color: HOME_THEME.muted }}>
                                Make your celebration meaningful. Contribute to a greener tomorrow.
                            </Typography>
                            <Button
                                component={Link}
                                href="/about"
                                endIcon={<TbArrowRight size={16} />}
                                sx={{
                                    mt: 1.25,
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    color: HOME_THEME.accent,
                                    border: `1px solid ${HOME_THEME.panelBorder}`,
                                    '&:hover': { bgcolor: HOME_THEME.silver, borderColor: HOME_THEME.accent }
                                }}
                            >
                                Know More
                            </Button>
                        </Box>
                    </Stack>
                </Box>
            </Box>
        </Container>
    );
}