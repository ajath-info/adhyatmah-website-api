'use client';
import React, { useState } from 'react';
import {
    Box, Stack, Typography, Grid, Accordion,
    AccordionSummary, AccordionDetails, Chip, Divider
} from '@mui/material';
import { MdExpandMore, MdCheck } from 'react-icons/md';
import {
    GiPartyPopper, GiOpenBook, GiBasket
} from 'react-icons/gi';
import {
    FaHome, FaUsers, FaHandsHelping, FaQuestionCircle
} from 'react-icons/fa';
import {
    BsCheckCircleFill, BsBoxSeam, BsLightningFill, BsStarFill
} from 'react-icons/bs';

const ORANGE = '#E87722';

/* ---------- SECTION HEADING ---------- */
function SectionHeading({ icon: Icon, title }) {
    return (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
            <Box sx={{
                width: 38, height: 38, borderRadius: '50%',
                bgcolor: 'rgba(232,119,34,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
            }}>
                <Icon size={18} color={ORANGE} />
            </Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#2C1A0E' }}>
                {title}
            </Typography>
        </Stack>
    );
}

/* ---------- PRODUCT HIGHLIGHTS ---------- */
function ProductHighlights({ highlights = [] }) {
    const defaultHighlights = [
        'Complete Puja Samagri',
        'Ready to Use',
        'Suitable for Home Ceremony',
        'Fresh & Carefully Packed'
    ];
    const items = highlights.length > 0 ? highlights : defaultHighlights;

    return (
        <Box sx={{ bgcolor: '#FDF0E6', borderRadius: 2, p: 2.5, border: '1px solid #F0DDD0' }}>
            <Stack direction="row" flexWrap="wrap" gap={1.5}>
                {items.map((item) => (
                    <Chip
                        key={item}
                        icon={<BsCheckCircleFill size={14} color={ORANGE} style={{ marginLeft: 8 }} />}
                        label={item}
                        sx={{
                            bgcolor: '#fff',
                            border: '1px solid #F0DDD0',
                            color: '#5C3D2E',
                            fontWeight: 600,
                            fontSize: 13,
                            '& .MuiChip-icon': { color: ORANGE }
                        }}
                    />
                ))}
            </Stack>
        </Box>
    );
}

/* ---------- WHY CHOOSE THIS KIT ---------- */
function WhyChooseKit({ points = [] }) {
    const defaultPoints = [
        'Includes essential Namkaran Puja samagri',
        'Saves time before the ceremony',
        'Suitable for home puja',
        'Ready-to-use kit',
        'Carefully packed'
    ];
    const items = points.length > 0 ? points : defaultPoints;

    return (
        <Box>
            <SectionHeading icon={BsStarFill} title="Why Choose This Kit?" />
            <Grid container spacing={2}>
                {items.map((point, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <BsCheckCircleFill size={16} color={ORANGE} style={{ marginTop: 3, flexShrink: 0 }} />
                            <Typography sx={{ fontSize: 14, color: '#5C3D2E', lineHeight: 1.6 }}>
                                {point}
                            </Typography>
                        </Stack>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

/* ---------- WHO IS THIS FOR ---------- */
function WhoIsThisFor({ audience = [] }) {
    const defaultAudience = [
        { icon: FaUsers, text: 'Parents performing Namkaran Sanskar' },
        { icon: FaHome, text: 'Family members organising the ceremony' },
        { icon: FaHandsHelping, text: 'Priests conducting Namkaran Puja' },
        { icon: GiBasket, text: 'Anyone looking for a ready-to-use puja kit' }
    ];
    const items = audience.length > 0
        ? audience.map((text, i) => ({ icon: defaultAudience[i % defaultAudience.length].icon, text }))
        : defaultAudience;

    return (
        <Box>
            <SectionHeading icon={FaUsers} title="Who Is This Kit For?" />
            <Grid container spacing={2}>
                {items.map(({ icon: Icon, text }, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                        <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                border: '1px solid #F0DDD0',
                                bgcolor: '#fff'
                            }}
                        >
                            <Box sx={{
                                width: 34, height: 34, borderRadius: '50%',
                                bgcolor: 'rgba(232,119,34,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Icon size={16} color={ORANGE} />
                            </Box>
                            <Typography sx={{ fontSize: 13.5, color: '#5C3D2E', lineHeight: 1.5 }}>
                                {text}
                            </Typography>
                        </Stack>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

/* ---------- HOW TO USE ---------- */
function HowToUse({ steps = [] }) {
    const defaultSteps = [
        'Open the kit.',
        'Check all the included items.',
        'Arrange the puja samagri.',
        'Perform the puja as guided by your priest.',
        'Complete the ceremony.'
    ];
    const items = steps.length > 0 ? steps : defaultSteps;

    return (
        <Box>
            <SectionHeading icon={GiOpenBook} title="How to Use" />
            <Stack spacing={1.5}>
                {items.map((step, i) => (
                    <Stack key={i} direction="row" spacing={2} alignItems="flex-start">
                        <Box sx={{
                            width: 28, height: 28, borderRadius: '50%',
                            bgcolor: ORANGE, color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, fontSize: 13, fontWeight: 700
                        }}>
                            {i + 1}
                        </Box>
                        <Typography sx={{ fontSize: 14, color: '#5C3D2E', lineHeight: 1.6, mt: 0.4 }}>
                            {step}
                        </Typography>
                    </Stack>
                ))}
            </Stack>
        </Box>
    );
}

/* ---------- FAQs ---------- */
function FAQSection({ faqs = [] }) {
    const defaultFaqs = [
        {
            q: 'What is included in the Namkaran Puja Instant Kit?',
            a: 'The Namkaran Puja Instant Kit contains the essential puja samagri commonly required for a traditional baby naming ceremony. The exact list of items is available on the product page, making it easier for families to prepare for the puja without arranging each item separately.'
        },
        {
            q: 'Is this Namkaran Puja Kit suitable for performing the ceremony at home?',
            a: 'The kit is specially prepared for families performing the Namkaran ceremony at home. It includes the commonly required puja items, allowing you to perform the ritual conveniently while following traditional customs.'
        },
        {
            q: 'Can I order the Namkaran Puja Kit before my ceremony date?',
            a: 'We recommend placing your order a few days before the scheduled ceremony to ensure timely delivery and a smooth puja preparation experience.'
        },
        {
            q: 'Are the puja items packed safely?',
            a: 'The puja samagri is packed carefully to help maintain cleanliness and ensure the items reach you in good condition.'
        },
        {
            q: 'Does this product include Pandit booking?',
            a: 'This product includes only the Namkaran Puja Samagri Kit. If pandit booking services are available, they can be booked separately through the platform.'
        },
        {
            q: 'Can I customise the Namkaran Puja Kit?',
            a: 'If you have any specific requirements or need additional puja items, please contact our support team before placing your order. Our team will guide you based on availability.'
        }
    ];
    const items = faqs.length > 0 ? faqs : defaultFaqs;

    return (
        <Box>
            <SectionHeading icon={FaQuestionCircle} title="Frequently Asked Questions" />
            <Stack spacing={1}>
                {items.map((faq, i) => (
                    <Accordion
                        key={i}
                        elevation={0}
                        sx={{
                            border: '1px solid #F0DDD0',
                            borderRadius: '10px !important',
                            bgcolor: '#fff',
                            '&:before': { display: 'none' },
                            '&.Mui-expanded': { bgcolor: '#FDF8F4' }
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<MdExpandMore size={20} color={ORANGE} />}
                            sx={{ px: 2.5, py: 0.5 }}
                        >
                            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#2C1A0E', lineHeight: 1.5 }}>
                                {faq.q}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2 }}>
                            <Typography sx={{ fontSize: 13.5, color: '#5C3D2E', lineHeight: 1.7 }}>
                                {faq.a}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Stack>
        </Box>
    );
}

/* ============================================================
   MAIN EXPORT — renders all SEO sections in correct order
   Props (all optional — falls back to Namkaran defaults):
     highlights, whyChoosePoints, audience, howToUseSteps, faqs
   ============================================================ */
export default function ProductSEOContent({
    highlights,
    whyChoosePoints,
    audience,
    howToUseSteps,
    faqs
}) {
    return (
        <Box sx={{ bgcolor: '#FDF0E6', borderRadius: 3, p: { xs: 2.5, md: 4 }, mt: 3 }}>
            <Stack spacing={4} divider={<Divider sx={{ borderColor: '#F0DDD0' }} />}>
                {/* 1. Product Highlights */}
                <Box>
                    <SectionHeading icon={BsBoxSeam} title="Product Highlights" />
                    <ProductHighlights highlights={highlights} />
                </Box>

                {/* 2. Why Choose This Kit */}
                <WhyChooseKit points={whyChoosePoints} />

                {/* 3. Who Is This For */}
                <WhoIsThisFor audience={audience} />

                {/* 4. How to Use */}
                <HowToUse steps={howToUseSteps} />

                {/* 5. FAQs */}
                <FAQSection faqs={faqs} />
            </Stack>
        </Box>
    );
}