'use client';
import React from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';

// mui
import {
    Box,
    Container,
    Stack,
    Typography,
    TextField,
    Button,
    Chip,
    InputAdornment,
    alpha
} from '@mui/material';

// icons
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi2';
import { IoCheckmarkCircle } from 'react-icons/io5';

export default function ComingSoon({
    title = 'Something Special Is Brewing',
    description = "We're crafting this experience with the same care we bring to every puja. It'll be live soon — stay connected.",
    topics = [],
    eyebrow = 'Coming Soon'
}) {
    const [email, setEmail] = React.useState('');
    const [submitted, setSubmitted] = React.useState(false);

    const handleNotify = (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        // Hook this up to your newsletter/API endpoint when ready.
        setSubmitted(true);
    };

    return (
        <Container maxWidth="sm" sx={{ py: { xs: 7, md: 10 } }}>
            <Stack spacing={3.5} alignItems="center" textAlign="center">
                {/* Diya-style icon accent */}
                <Box sx={{ position: 'relative' }}>
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: -14,
                            borderRadius: '50%',
                            border: (theme) => `1px dashed ${alpha(theme.palette.primary.main, 0.25)}`
                        }}
                    />
                    <Box
                        sx={{
                            width: 76,
                            height: 76,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: (theme) =>
                                `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                            boxShadow: (theme) => `0 10px 26px ${alpha(theme.palette.primary.main, 0.35)}`
                        }}
                    >
                        <Typography sx={{ fontSize: 34, color: 'common.white', lineHeight: 1 }}>ॐ</Typography>
                    </Box>
                </Box>

                <Chip
                    icon={<HiOutlineSparkles size={14} style={{ color: 'inherit' }} />}
                    label={eyebrow}
                    size="small"
                    sx={{
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.dark',
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                        fontSize: 11
                    }}
                />

                <Typography
                    variant="h3"
                    sx={{
                        color: 'text.primary',
                        fontWeight: 800,
                        fontSize: { xs: 26, sm: 32 }
                    }}
                >
                    {title}
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        color: 'text.secondary',
                        maxWidth: 460,
                        lineHeight: 1.75
                    }}
                >
                    {description}
                </Typography>

                {Boolean(topics?.length) && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" useFlexGap>
                        {topics.map((topic) => (
                            <Chip
                                key={topic}
                                label={topic}
                                size="small"
                                sx={{
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                    color: 'text.primary',
                                    border: '1px solid',
                                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.18),
                                    fontSize: 12.5
                                }}
                            />
                        ))}
                    </Stack>
                )}

                {/* Notify me */}
                <Box component="form" onSubmit={handleNotify} sx={{ width: '100%', maxWidth: 380, pt: 1.5 }}>
                    {submitted ? (
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            justifyContent="center"
                            sx={{
                                bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                                borderRadius: 3,
                                py: 1.5,
                                px: 2
                            }}
                        >
                            <IoCheckmarkCircle size={20} color="#26C196" />
                            <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: 14 }}>
                                Thanks! We'll notify you at launch.
                            </Typography>
                        </Stack>
                    ) : (
                        <Stack direction="row" spacing={1}>
                            <TextField
                                fullWidth
                                size="small"
                                type="email"
                                required
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FiMail size={16} color="#A38F7D" />
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        bgcolor: 'background.paper',
                                        borderRadius: 50,
                                        pl: 0.5,
                                        '& fieldset': { borderColor: 'divider' },
                                        '&:hover fieldset': { borderColor: 'primary.main' },
                                        '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                                    }
                                }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{
                                    flexShrink: 0,
                                    borderRadius: 50,
                                    px: 2.5,
                                    background: 'linear-gradient(135deg, #F4A94F 0%, #E87722 100%)',
                                    fontWeight: 700,
                                    boxShadow: '0 4px 12px rgba(232,119,34,0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #E87722 0%, #d06a1a 100%)'
                                    }
                                }}
                            >
                                Notify Me
                            </Button>
                        </Stack>
                    )}
                </Box>

                <Button
                    component={Link}
                    href="/"
                    startIcon={<FiArrowLeft size={15} />}
                    sx={{
                        color: 'text.secondary',
                        textTransform: 'none',
                        fontSize: 13.5,
                        '&:hover': { color: 'primary.main', bgcolor: 'transparent' }
                    }}
                >
                    Back to Home
                </Button>
            </Stack>
        </Container>
    );
}

ComingSoon.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    topics: PropTypes.arrayOf(PropTypes.string),
    eyebrow: PropTypes.string
};