import { Box, Stack, Typography } from '@mui/material';
import { BsShieldFillCheck } from 'react-icons/bs';

const ORANGE = '#E87722';

// SEO Fix: Homepage trust content block.
// Placement: above the "Latest From Our Blog" section, full-width content block.
export default function WhyTrust() {
    return (
        <Box
            sx={{
                width: '100%',
                bgcolor: '#FBEBDA',
                borderRadius: 3,
                px: { xs: 2.5, md: 4 },
                py: { xs: 3, md: 3.5 },
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Decorative circles — same treatment used in Why Choose Us */}
            <Box sx={{
                position: 'absolute', top: -60, right: -60,
                width: 220, height: 220, borderRadius: '50%',
                bgcolor: 'rgba(232,119,34,0.07)', pointerEvents: 'none'
            }} />
            <Box sx={{
                position: 'absolute', bottom: -50, right: 100,
                width: 130, height: 130, borderRadius: '50%',
                bgcolor: 'rgba(232,119,34,0.05)', pointerEvents: 'none'
            }} />

            {/* Decorative watermark icon — fills empty space on wide screens */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    right: { md: 40 },
                    transform: 'translateY(-50%)',
                    display: { xs: 'none', lg: 'block' },
                    opacity: 0.08,
                    pointerEvents: 'none',
                }}
            >
                <BsShieldFillCheck size={110} color={ORANGE} />
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 3 }} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ position: 'relative' }}>
                <Stack
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        flexShrink: 0,
                        width: 60,
                        height: 60,
                        borderRadius: '16px',
                        bgcolor: '#fff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                    }}
                >
                    <BsShieldFillCheck size={28} color={ORANGE} />
                </Stack>

                <Box sx={{ flex: 1, width: '100%' }}>
                    <Typography
                        component="h2"
                        sx={{
                            fontSize: { xs: 17, md: 21 },
                            fontWeight: 700,
                            color: '#241511',
                            mb: 1,
                        }}
                    >
                        Why Devotees Trust Adhyatmah
                    </Typography>

                    <Typography
                        component="p"
                        sx={{
                            fontSize: { xs: 13.5, md: 15 },
                            lineHeight: 1.8,
                            color: '#5B4A42',
                            maxWidth: 1050,
                        }}
                    >
                        Adhyatmah is committed to making spiritual services simple, reliable, and accessible. We
                        connect devotees with verified pandits who perform authentic Vedic rituals with devotion
                        and care. Along with easy online booking, Adhyatmah also offers puja kits, puja samagri,
                        Rudraksha, and other spiritual essentials in one place.
                    </Typography>
                </Box>
            </Stack>
        </Box>
    );
}