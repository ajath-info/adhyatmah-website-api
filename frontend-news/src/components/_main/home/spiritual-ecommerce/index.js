'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Stack, Typography } from '@mui/material';

import { GiCandleLight, GiTempleGate, GiPrayerBeads, GiFireBowl, GiBookCover } from 'react-icons/gi';
import { IoArrowForward } from 'react-icons/io5';
import Image from '@/components/blur-image';

const ORANGE = '#E87722';

// Fallback icons used only if a category has no cover image yet
const FALLBACK_ICONS = [GiCandleLight, GiTempleGate, GiPrayerBeads, GiFireBowl, GiBookCover];

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

/* ---------------- SINGLE CATEGORY ---------------- */
function CategoryItem({ category, FallbackIcon }) {
    const name = category?.name || '';
    const image = category?.cover?.url || category?.image?.url || '';
    const href = `/products?category=${category?.slug || ''}`;

    return (
        <Stack
            component={Link}
            href={href}
            alignItems="center"
            spacing={1.25}
            sx={{
                textDecoration: 'none',
                flex: { xs: '0 0 auto', md: '1 1 0' },
                width: { xs: 92, sm: 140, md: 'auto' },
                minWidth: 0,
                '&:hover img': { transform: 'scale(1.08)' }
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    width: { xs: 82, sm: 140, md: 170 },
                    height: { xs: 82, sm: 140, md: 170 },
                    borderRadius: '50%',
                    overflow: 'hidden',
                    bgcolor: 'rgba(232,119,34,0.08)',
                    border: '1px solid rgba(232,119,34,0.15)'
                }}
            >
                {image ? (
                    <Image
                        alt={name}
                        src={image}
                        fill
                        style={{ objectFit: 'cover', transition: 'transform .35s ease' }}
                    />
                ) : (
                    <Stack alignItems="center" justifyContent="center" sx={{ width: '100%', height: '100%' }}>
                        <FallbackIcon size={48} color={ORANGE} />
                    </Stack>
                )}
            </Box>

            <Typography
                sx={{
                    fontSize: { xs: 12, sm: 15, md: 16 },
                    fontWeight: 700,
                    color: 'text.primary',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    width: { xs: 92, sm: 140, md: 'auto' }
                }}
            >
                {name}
            </Typography>
        </Stack>
    );
}

/* ---------------- MAIN COMPONENT ---------------- */
export default function SpiritualEcommerce({ categories, title = 'Spiritual E-Commerce', viewAllHref = '/products' }) {
    const data = (categories || []).slice(0, 5);

    if (!data.length) return null;

    return (
        <Box>
            {/* Header */}
            <Stack direction="row" alignItems="center" justifyContent="center" sx={{ position: 'relative', mb: 4 }}>
                <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.5 }}>
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

                <Typography
                    component={Link}
                    href={viewAllHref}
                    sx={{
                        position: 'absolute',
                        right: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: { xs: 'none', sm: 'inline-flex' },
                        alignItems: 'center',
                        gap: 0.5,
                        fontSize: 14,
                        fontWeight: 700,
                        color: ORANGE,
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                    }}
                >
                    Explore All Products <IoArrowForward size={14} />
                </Typography>
            </Stack>

            {/* Single row, 5 items — scrollable strip on mobile so items never squish/overlap, unchanged single-row layout on tablet/desktop */}
            <Box
                sx={{
                    overflowX: { xs: 'auto', sm: 'visible' },
                    pb: { xs: 0.5, sm: 0 },
                    '&::-webkit-scrollbar': { display: 'none' },
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
            >
                <Stack
                    direction="row"
                    spacing={{ xs: 2, sm: 3, md: 4 }}
                    justifyContent={{ xs: 'flex-start', sm: 'space-between' }}
                    sx={{ width: { xs: 'max-content', sm: '100%' } }}
                >
                    {data.map((category, index) => (
                        <CategoryItem
                            key={category?.slug || category?.id || index}
                            category={category}
                            FallbackIcon={FALLBACK_ICONS[index % FALLBACK_ICONS.length]}
                        />
                    ))}
                </Stack>
            </Box>

            {/* Mobile Explore link */}
            <Stack alignItems="center" sx={{ mt: 3, display: { xs: 'flex', sm: 'none' } }}>
                <Typography
                    component={Link}
                    href={viewAllHref}
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontSize: 14,
                        fontWeight: 700,
                        color: ORANGE,
                        textDecoration: 'none'
                    }}
                >
                    Explore All Products <IoArrowForward size={14} />
                </Typography>
            </Stack>
        </Box>
    );
}