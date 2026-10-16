'use client';
import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { TbTargetArrow, TbShieldCheck, TbMapPin, TbHeart, TbDeviceMobile } from 'react-icons/tb';
import { HOME_THEME } from './theme';

const TRUST_ITEMS = [
    { icon: TbTargetArrow, title: 'Authentic & Accurate', text: 'Panchang data' },
    { icon: TbShieldCheck, title: 'Traditional Knowledge,', text: 'Modern Technology' },
    { icon: TbMapPin, title: 'Region-wise Festivals', text: '& Customs' },
    { icon: TbHeart, title: 'Spiritual Growth', text: 'for Everyday Life' },
    { icon: TbDeviceMobile, title: 'Available on Web & App', text: 'Anytime, Anywhere' }
];

export default function TrustStrip() {
    return (
        <Container maxWidth="xl" sx={{ mt: { xs: 3, md: 4 } }}>
            <Box
                sx={{
                    display: 'grid',
                    gap: { xs: 2, lg: 1 },
                    alignItems: 'center',
                    p: { xs: 2, md: 2.5 },
                    borderRadius: '18px',
                    bgcolor: HOME_THEME.softBg,
                    border: `1px solid ${HOME_THEME.panelBorder}`,
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(5, minmax(0, 1fr)) minmax(0, 1.15fr)' }
                }}
            >
                {TRUST_ITEMS.map(({ icon: Icon, title, text }) => (
                    <Box key={title} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                        <Box sx={{ width: 42, height: 42, flexShrink: 0, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: HOME_THEME.silver }}>
                            <Icon size={22} color={HOME_THEME.accent} />
                        </Box>
                        <Typography sx={{ fontSize: 13, lineHeight: 1.35, color: HOME_THEME.navy }}>
                            <Box component="span" sx={{ fontWeight: 700 }}>
                                {title}
                            </Box>
                            <br />
                            {text}
                        </Typography>
                    </Box>
                ))}

                <Box sx={{ textAlign: { xs: 'left', sm: 'center', lg: 'right' }, gridColumn: { sm: '1 / -1', lg: 'auto' } }}>
                    <Typography lang="sa" sx={{ fontSize: 20, fontWeight: 700, color: HOME_THEME.accent }}>
                        ॥ सर्वे भवन्तु सुखिनः ॥
                    </Typography>
                    <Typography sx={{ fontSize: 12.5, color: HOME_THEME.muted }}>May all be happy, always.</Typography>
                </Box>
            </Box>
        </Container>
    );
}