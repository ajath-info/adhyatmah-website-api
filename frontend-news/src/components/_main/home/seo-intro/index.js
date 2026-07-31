import { Box, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { GiPrayerBeads } from 'react-icons/gi';

const ORANGE = '#E87722';

// SEO Fix: Homepage intro content block.
// Placement: below the Hero Banner, above the service/category cards.
export default function SeoIntro() {
    return (
        <Box
            sx={{
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                bgcolor: 'background.paper',
                px: { xs: 2.5, md: 4 },
                py: { xs: 3, md: 3.5 },
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
        >
            {/* Decorative watermark icon — fills empty space on wide screens */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    right: { xs: -30, md: 24 },
                    transform: 'translateY(-50%)',
                    display: { xs: 'none', lg: 'block' },
                    opacity: 0.05,
                    pointerEvents: 'none',
                }}
            >
                <GiPrayerBeads size={140} color={ORANGE} />
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 3 }} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ position: 'relative' }}>
                <Stack
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        flexShrink: 0,
                        width: 64,
                        height: 64,
                        borderRadius: '18px',
                        bgcolor: 'rgba(232,119,34,0.1)',
                        border: '1.5px solid rgba(232,119,34,0.25)',
                    }}
                >
                    <GiPrayerBeads size={32} color={ORANGE} />
                </Stack>

                <Box sx={{ flex: 1, width: '100%' }}>
                    {/* <Typography
                        component="h2"
                        sx={{
                            fontSize: { xs: 17, md: 21 },
                            fontWeight: 700,
                            color: '#241511',
                            mb: 1,
                        }}
                    >
                        Book Pandit Online for Puja &amp; Rituals Across India
                    </Typography> */}

                    <Typography
                        component="p"
                        sx={{
                            fontSize: { xs: 13.5, md: 15 },
                            lineHeight: 1.8,
                            color: 'text.secondary',
                            maxWidth: 1150,
                        }}
                    >
                        Finding a trusted pandit for your religious ceremonies should be simple and stress-free.
                        Adhyatmah helps you{' '}
                        <Typography
                            component={Link}
                            href="/book-pandit-online"
                            sx={{ fontSize: 'inherit', fontWeight: 600, color: ORANGE, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                            book verified pandits
                        </Typography>{' '}
                        for a wide range of Hindu pujas and rituals, including Griha Pravesh, Satyanarayan Katha,
                        Rudrabhishek, Marriage Puja, Mundan, and more. Whether you need a pandit at home or prefer
                        an online puja, our platform makes the booking process easy and reliable. You can also
                        explore puja kits,{' '}
                        <Typography
                            component={Link}
                            href="/puja-products-online-store"
                            sx={{ fontSize: 'inherit', fontWeight: 600, color: ORANGE, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                            puja samagri
                        </Typography>
                        , Rudraksha, and other spiritual essentials to complete every ritual with authenticity.
                    </Typography>
                </Box>
            </Stack>
        </Box>
    );
}