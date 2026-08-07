'use client';

import { useState } from 'react';
import { Box, Stack, Typography, Grid, Collapse } from '@mui/material';
import Link from 'next/link';
import { MdAdd, MdRemove } from 'react-icons/md';

const ORANGE = '#fb8b05';

const FAQS = [
    {
        question: 'How can I book a pandit online through Adhyatmah?',
        answer: (
            <>
                Select your preferred puja, choose a verified pandit, pick your date and location, and
                complete your booking through Adhyatmah&apos;s{' '}
                <Typography
                    component={Link}
                    href="/book-pandit-online"
                    sx={{ fontSize: 'inherit', fontWeight: 600, color: ORANGE, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                    online pandit booking platform
                </Typography>
                .
            </>
        ),
    },
    {
        question: 'Are the pandits verified?',
        answer: 'Yes. All listed pandits are verified and experienced in performing traditional Hindu rituals.',
    },
    {
        question: 'Can I book an online puja?',
        answer: 'Yes. Online puja services are available for devotees who are unable to attend the ceremony in person.',
    },
    {
        question: 'Do you provide puja samagri?',
        answer: 'Yes. You can purchase puja samagri, puja kits, Rudraksha, idols, and other spiritual products through Adhyatmah.',
    },
    {
        question: 'Which Hindu pujas can I book through Adhyatmah?',
        answer: (
            <>
                You can book Griha Pravesh, Satyanarayan Katha, Rudrabhishek, Ganesh Puja, Lakshmi Puja,
                Marriage Puja, Mundan, Namkaran, and many other Vedic rituals through our{' '}
                <Typography
                    component={Link}
                    href="/book-pandit-online"
                    sx={{ fontSize: 'inherit', fontWeight: 600, color: ORANGE, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                    Pandit Booking Service
                </Typography>
                .
            </>
        ),
    },
    {
        question: 'Can I choose a pandit based on language or location?',
        answer: 'Yes. You can select a pandit based on language, experience, and availability.',
    },
    {
        question: 'Do you offer online puja services outside India?',
        answer: 'Yes. Devotees across the world can participate in traditional Hindu rituals through our online puja services.',
    },
    {
        question: 'How do I get support after booking?',
        answer: 'Our support team is available to assist you before, during, and after your booking to ensure a smooth experience.',
    },
];

/* ---------------- SINGLE FAQ CARD (question + circular toggle + collapsible answer) ---------------- */
function FaqRow({ faq, isOpen, onToggle }) {
    return (
        <Box
            onClick={onToggle}
            sx={{
                cursor: 'pointer',
                bgcolor: '#fff',
                borderRadius: 2.5,
                px: { xs: 2, md: 2.5 },
                boxShadow: isOpen ? '0 4px 14px rgba(251,139,5,0.16)' : '0 1px 4px rgba(0,0,0,0.06)',
                border: '1px solid',
                borderColor: isOpen ? 'rgba(251,139,5,0.35)' : 'rgba(0,0,0,0.06)',
                transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                '&:hover .faq-question': { color: ORANGE },
            }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ py: 1.75 }}>
                <Typography
                    className="faq-question"
                    sx={{
                        fontWeight: 600,
                        fontSize: { xs: 13.5, md: 14.5 },
                        color: isOpen ? ORANGE : '#1A1A1A',
                        transition: 'color 0.2s ease',
                        pr: 1,
                    }}
                >
                    {faq.question}
                </Typography>
                <Stack
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        flexShrink: 0,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        border: '1.5px solid',
                        borderColor: ORANGE,
                        color: ORANGE,
                        bgcolor: isOpen ? 'rgba(251,139,5,0.1)' : 'transparent',
                        transition: 'background-color 0.2s ease',
                    }}
                >
                    {isOpen ? <MdRemove size={15} /> : <MdAdd size={15} />}
                </Stack>
            </Stack>
            <Collapse in={isOpen} timeout={220} unmountOnExit>
                <Typography sx={{ fontSize: { xs: 12.5, md: 13 }, color: '#5C5C5C', lineHeight: 1.7, pb: 2, pr: 5 }}>
                    {faq.answer}
                </Typography>
            </Collapse>
        </Box>
    );
}

// SEO Fix: FAQ accordion.
// Placement: below the Blog section, above the Footer.
// Layout matches arthum.co.in's reference FAQ pattern — left column has the
// heading + description + illustration, right column is a single-file stack
// of accordion cards (one open at a time) — restyled with Adhyatmah's own
// saffron/cream brand theme.
export default function FaqSection() {
    const [openIndex, setOpenIndex] = useState(-1);

    const handleToggle = (index) => {
        setOpenIndex((prev) => (prev === index ? -1 : index));
    };

    return (
        <Box
            sx={{
                width: '100%',
                bgcolor: '#FBEBDA',
                borderRadius: 3,
                px: { xs: 2.5, md: 5 },
                py: { xs: 3.5, md: 5 },
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <Grid container spacing={{ xs: 3, md: 6 }} alignItems="flex-start">
                {/* Left: heading + description + illustration (image path below) */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Stack spacing={2}>
                        <Typography
                            component="h2"
                            sx={{
                                fontSize: { xs: 24, sm: 28, md: 32 },
                                fontWeight: 700,
                                color: '#1A1A1A',
                                lineHeight: 1.2,
                            }}
                        >
                            Frequently asked questions
                        </Typography>
                        <Typography sx={{ fontSize: { xs: 13.5, md: 14.5 }, color: '#5C5C5C', lineHeight: 1.7, maxWidth: 380 }}>
                            Get quick answers to the most common questions about pandit booking, puja services, and
                            how Adhyatmah works.
                        </Typography>

                        {/* Illustration — drop the generated PNG/SVG at public/images/faq-illustration.png */}
                        <Box
                            sx={{
                                display: { xs: 'none', md: 'flex' },
                                justifyContent: 'center',
                                width: '100%',
                                mt: 2,
                            }}
                        >
                            <img
                                src="/images/faq-illustration.png"
                                alt="Frequently asked questions about Adhyatmah pandit booking"
                                style={{
                                    width: '100%',
                                    maxWidth: 400,
                                    height: 'auto',
                                    display: 'block',
                                    margin: '0 auto',
                                }}
                            />
                        </Box>
                    </Stack>
                </Grid>

                {/* Right: single-column stack of accordion cards */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Stack spacing={1.5}>
                        {FAQS.map((faq, index) => (
                            <FaqRow
                                key={index}
                                faq={faq}
                                isOpen={openIndex === index}
                                onToggle={() => handleToggle(index)}
                            />
                        ))}
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}