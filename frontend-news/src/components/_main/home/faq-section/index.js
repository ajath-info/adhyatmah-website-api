'use client';

import { Box, Stack, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import Link from 'next/link';
import { MdExpandMore } from 'react-icons/md';

const ORANGE = '#E87722';

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

/* ---------------- DECORATIVE ARROW LINE (matches other home section titles) ---------------- */
function ArrowLine({ direction = 'left' }) {
    return (
        <Box
            component="svg"
            viewBox="0 0 46 14"
            sx={{
                width: { xs: 26, sm: 36, md: 42 },
                height: 14,
                display: { xs: 'none', sm: 'block' },
                transform: direction === 'right' ? 'scaleX(-1)' : 'none',
            }}
        >
            <line x1="0" y1="7" x2="34" y2="7" stroke={ORANGE} strokeWidth="2" />
            <path d="M28 1.5 L37 7 L28 12.5" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Box>
    );
}

// SEO Fix: FAQ accordion.
// Placement: below the Blog section, above the Footer.
export default function FaqSection() {
    return (
        <Box
            sx={{
                width: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                bgcolor: 'background.paper',
                px: { xs: 2.5, md: 4 },
                py: { xs: 3, md: 3.5 },
            }}
        >
            <Stack alignItems="center" spacing={1} sx={{ width: '100%', mb: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={{ xs: 1, sm: 1.5 }} sx={{ width: '100%' }}>
                    <ArrowLine direction="left" />
                    <Typography
                        component="h2"
                        sx={{
                            fontSize: { xs: 20, sm: 24, md: 26 },
                            fontWeight: 700,
                            color: 'text.primary',
                            textAlign: 'center',
                        }}
                    >
                        Frequently Asked Questions
                    </Typography>
                    <ArrowLine direction="right" />
                </Stack>
            </Stack>

            <Stack spacing={1.25} sx={{ maxWidth: 860, mx: 'auto' }}>
                {FAQS.map((faq, index) => (
                    <Accordion
                        key={index}
                        disableGutters
                        elevation={0}
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: '10px !important',
                            overflow: 'hidden',
                            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                            '&:before': { display: 'none' },
                            '&:hover': { borderColor: 'rgba(232,119,34,0.45)' },
                            '&.Mui-expanded': {
                                borderColor: ORANGE,
                                boxShadow: '0 2px 8px rgba(232,119,34,0.12)',
                            },
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<MdExpandMore size={20} color={ORANGE} />}
                            sx={{
                                px: 2,
                                py: 0.5,
                                minHeight: 52,
                                '&.Mui-expanded': { bgcolor: 'rgba(232,119,34,0.05)' },
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                <Stack
                                    alignItems="center"
                                    justifyContent="center"
                                    sx={{
                                        flexShrink: 0,
                                        width: 26,
                                        height: 26,
                                        borderRadius: '8px',
                                        bgcolor: 'rgba(232,119,34,0.1)',
                                    }}
                                >
                                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: ORANGE, lineHeight: 1 }}>
                                        Q
                                    </Typography>
                                </Stack>
                                <Typography sx={{ fontWeight: 600, fontSize: { xs: 13.5, md: 14.5 } }}>
                                    {faq.question}
                                </Typography>
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 2, pt: 0, pb: 2.25, pl: { xs: 6.25, sm: 6.5 } }}>
                            <Typography sx={{ fontSize: { xs: 13, md: 13.5 }, color: 'text.secondary', lineHeight: 1.7 }}>
                                {faq.answer}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Stack>
        </Box>
    );
}