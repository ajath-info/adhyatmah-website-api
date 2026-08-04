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

/* ---------------- SINGLE FAQ ROW (question + circular toggle + collapsible answer) ---------------- */
function FaqRow({ faq, isOpen, onToggle, isLast }) {
    return (
        <Box>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
                onClick={onToggle}
                sx={{
                    cursor: 'pointer',
                    py: 2,
                    '&:hover .faq-question': { color: ORANGE },
                }}
            >
                <Typography
                    className="faq-question"
                    sx={{
                        fontWeight: 600,
                        fontSize: { xs: 14, md: 15.5 },
                        color: isOpen ? ORANGE : 'text.primary',
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
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        border: '1.5px solid',
                        borderColor: ORANGE,
                        color: ORANGE,
                        bgcolor: isOpen ? 'rgba(232,119,34,0.1)' : 'transparent',
                        transition: 'background-color 0.2s ease',
                    }}
                >
                    {isOpen ? <MdRemove size={16} /> : <MdAdd size={16} />}
                </Stack>
            </Stack>
            <Collapse in={isOpen} timeout={220} unmountOnExit>
                <Typography sx={{ fontSize: { xs: 13, md: 13.5 }, color: 'text.secondary', lineHeight: 1.7, pb: 2, pr: 5 }}>
                    {faq.answer}
                </Typography>
            </Collapse>
            {!isLast && <Box sx={{ height: '1px', bgcolor: 'divider' }} />}
        </Box>
    );
}

// SEO Fix: FAQ accordion.
// Placement: below the Blog section, above the Footer.
// Layout/flow matches vodex.ai's two-column FAQ (single item open at a time,
// circular +/- toggle), restyled with Adhyatmah's own orange/white theme.
export default function FaqSection() {
    const [openIndex, setOpenIndex] = useState(0);

    const handleToggle = (index) => {
        setOpenIndex((prev) => (prev === index ? -1 : index));
    };

    const midPoint = Math.ceil(FAQS.length / 2);
    const leftColumn = FAQS.slice(0, midPoint).map((faq, i) => ({ faq, index: i }));
    const rightColumn = FAQS.slice(midPoint).map((faq, i) => ({ faq, index: i + midPoint }));

    return (
        <Box
            sx={{
                width: '100%',
                px: { xs: 2.5, md: 4 },
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

            <Grid container columnSpacing={{ xs: 0, md: 6 }} rowSpacing={0}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack divider={null}>
                        {leftColumn.map(({ faq, index }, i) => (
                            <FaqRow
                                key={index}
                                faq={faq}
                                isOpen={openIndex === index}
                                onToggle={() => handleToggle(index)}
                                isLast={i === leftColumn.length - 1 && rightColumn.length === 0}
                            />
                        ))}
                    </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack divider={null}>
                        {rightColumn.map(({ faq, index }, i) => (
                            <FaqRow
                                key={index}
                                faq={faq}
                                isOpen={openIndex === index}
                                onToggle={() => handleToggle(index)}
                                isLast={i === rightColumn.length - 1}
                            />
                        ))}
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}