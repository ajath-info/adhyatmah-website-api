'use client';
import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Typography, Grid, Stack, Button, Box, Chip, Container, Skeleton } from '@mui/material';
import { IoArrowForward } from 'react-icons/io5';
import { MdAccessTime } from 'react-icons/md';

import * as api from 'src/services';

const ORANGE = '#fb8b05';

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

/* ---------------- helpers ---------------- */
function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

function estimateReadTime(content) {
    if (!content) return '3 min read';
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
}

/* ---------------- SINGLE BLOG CARD — original design (whole card clickable) ---------------- */
function BlogCard({ blog }) {
    const [imgError, setImgError] = React.useState(false);

    return (
        <Box
            component={Link}
            href={blog.href}
            className="blog-card"
            sx={{
                width: '100%',
                height: '100%',
                borderRadius: 2.5,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all .25s',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                    borderColor: 'transparent'
                }
            }}
        >
            {/* Image */}
            <Box sx={{ height: 170, overflow: 'hidden', position: 'relative', bgcolor: '#1a1a1a', flexShrink: 0 }}>
                {!imgError && blog.image ? (
                    <Box
                        component="img"
                        src={blog.image}
                        alt={blog.title}
                        onError={() => setImgError(true)}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform .4s ease',
                            '.blog-card:hover &': { transform: 'scale(1.05)' }
                        }}
                    />
                ) : (
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            p: 2,
                            background: `linear-gradient(135deg, ${blog.categoryColor} 0%, rgba(0,0,0,0.55) 100%)`
                        }}
                    >
                        <Typography
                            sx={{
                                color: '#fff',
                                fontSize: 15,
                                fontWeight: 700,
                                lineHeight: 1.4,
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}
                        >
                            {blog.title}
                        </Typography>
                    </Box>
                )}
                <Box sx={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)'
                }} />
                {blog.category && (
                    <Chip
                        label={blog.category}
                        size="small"
                        sx={{
                            position: 'absolute', top: 10, left: 10,
                            bgcolor: blog.categoryColor,
                            color: '#fff',
                            fontSize: 10.5,
                            fontWeight: 700,
                            height: 22,
                            '& .MuiChip-label': { px: 1 }
                        }}
                    />
                )}
            </Box>

            {/* Content */}
            <Stack spacing={1} sx={{ p: 2, flex: 1 }}>
                <Typography sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'text.primary',
                    lineHeight: 1.45,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {blog.title}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ pt: 0.5 }}>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{blog.date}</Typography>
                    <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                    <MdAccessTime size={12} color="#9e9e9e" />
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{blog.readTime}</Typography>
                </Stack>

                <Box sx={{ mt: 'auto !important', pt: 1 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            width: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.5,
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: ORANGE,
                            border: '1px solid',
                            borderColor: ORANGE,
                            borderRadius: 999,
                            px: 1.5,
                            py: 0.75,
                            transition: 'all .25s',
                            '& svg': { transition: 'transform 0.3s ease' },
                            '.blog-card:hover &': {
                                bgcolor: ORANGE,
                                color: '#fff',
                                '& svg': { transform: 'translateX(3px)' }
                            }
                        }}
                    >
                        Read More
                        <IoArrowForward size={13} />
                    </Box>
                </Box>
            </Stack>
        </Box>
    );
}

/* ---------------- SKELETON CARD ---------------- */
function BlogCardSkeleton() {
    return (
        <Box sx={{ width: '100%', height: '100%', borderRadius: 2.5, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            <Skeleton variant="rectangular" width="100%" height={170} />
            <Stack spacing={1} sx={{ p: 2 }}>
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
            </Stack>
        </Box>
    );
}

/* ---------------- MAIN COMPONENT ---------------- */
export default function LatestBlogs() {

    const { data, isPending } = useQuery({
        queryKey: ['latest-articles'],
        queryFn: () => api.getLatestArticles(5)
    });

    const articles = data?.data || [];

    const blogs = articles.map((article) => ({
        id: article._id,
        title: article.title,
        date: formatDate(article.publishedAt || article.createdAt),
        readTime: estimateReadTime(article.content),
        category: article.blog?.title || '',
        categoryColor: '#fb8b05',
        image: article.image?.url || '',
        href: `/blogs/${article.handle}`
    }));

    // Koi bhi published article nahi hai to poora section hi hide kar do
    if (!isPending && blogs.length === 0) {
        return null;
    }

    return (
        <Container maxWidth="xl" disableGutters>
            <Stack gap={3}>
                <Stack alignItems="center" spacing={1}>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={{ xs: 1, sm: 1.5 }}>
                        <ArrowLine direction="left" />
                        <Typography
                            sx={{
                                fontSize: { xs: 20, sm: 24, md: 26 },
                                fontWeight: 700,
                                color: 'text.primary'
                            }}
                        >
                            Latest From Our Blog
                        </Typography>
                        <ArrowLine direction="right" />
                    </Stack>
                    <Typography variant="body1" color="text.secondary" textAlign="center">
                        Insights & Stories On Faith, Rituals And Spiritual Living
                    </Typography>
                </Stack>

                <Grid container spacing={2.5} alignItems="stretch">
                    {isPending
                        ? Array.from({ length: 5 }).map((_, i) => (
                            <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 12 }} key={'blog-skeleton-' + i} sx={{ display: 'flex' }}>
                                <BlogCardSkeleton />
                            </Grid>
                        ))
                        : blogs.slice(0, 5).map((blog) => (
                            <Grid size={{ lg: 2.4, md: 4, sm: 6, xs: 12 }} key={'blog-' + blog.id} sx={{ display: 'flex' }}>
                                <BlogCard blog={blog} />
                            </Grid>
                        ))
                    }
                </Grid>

                <Box sx={{ textAlign: 'center' }}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        endIcon={<IoArrowForward />}
                        component={Link}
                        href={'/blogs'}
                        sx={{
                            '& svg': { transition: 'transform 0.3s ease' },
                            '&:hover': { svg: { transform: 'translateX(4px)' } }
                        }}
                    >
                        View All
                    </Button>
                </Box>
            </Stack>
        </Container>
    );
}