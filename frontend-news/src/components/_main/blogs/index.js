'use client';
import { Suspense } from 'react';
import React from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { useRouter } from '@bprogress/next';
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
    Box, Grid, Stack, Chip, Typography,
    Skeleton, Pagination, Container
} from '@mui/material';
import { MdAccessTime } from 'react-icons/md';
import { IoArrowForward } from 'react-icons/io5';

import * as api from 'src/services';

const ORANGE = '#fb8b05';

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

function BlogCard({ article }) {
    const [imgError, setImgError] = React.useState(false);

    return (
        <Box
            component={Link}
            href={`/blogs/${article.handle}`}
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
            <Box sx={{ height: 190, overflow: 'hidden', position: 'relative', bgcolor: '#1a1a1a', flexShrink: 0 }}>
                {!imgError && article.image?.url ? (
                    <Box
                        component="img"
                        src={article.image.url}
                        alt={article.title}
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
                            background: 'linear-gradient(135deg, #fb8b05 0%, rgba(0,0,0,0.55) 100%)'
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
                            {article.title}
                        </Typography>
                    </Box>
                )}
                <Box sx={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)'
                }} />
                {article.blog?.title && (
                    <Chip
                        label={article.blog.title}
                        size="small"
                        sx={{
                            position: 'absolute', top: 10, left: 10,
                            bgcolor: '#fb8b05',
                            color: '#fff',
                            fontSize: 10.5,
                            fontWeight: 700,
                            height: 22,
                            '& .MuiChip-label': { px: 1 }
                        }}
                    />
                )}
            </Box>

            <Stack spacing={1} sx={{ p: 2, flex: 1 }}>
                <Typography sx={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'text.primary',
                    lineHeight: 1.45,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {article.title}
                </Typography>

                {article.excerpt && (
                    <Typography sx={{
                        fontSize: 13,
                        color: 'text.secondary',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {article.excerpt}
                    </Typography>
                )}

                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ pt: 0.5 }}>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                        {formatDate(article.publishedAt || article.createdAt)}
                    </Typography>
                    <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                    <MdAccessTime size={12} color="#9e9e9e" />
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                        {estimateReadTime(article.content)}
                    </Typography>
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

function BlogCardSkeleton() {
    return (
        <Box sx={{ width: '100%', height: '100%', borderRadius: 2.5, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            <Skeleton variant="rectangular" width="100%" height={190} />
            <Stack spacing={1} sx={{ p: 2 }}>
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="70%" />
                <Skeleton variant="text" width="40%" />
            </Stack>
        </Box>
    );
}

function BlogsListing() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const page = searchParams.get('page');
    const [currentPage, setCurrentPage] = React.useState(Number(page) || 1);
    const limit = 12;

    const { data, isPending: isLoading } = useQuery({
        queryKey: ['blogs-listing', currentPage],
        queryFn: () => api.getArticles(`?page=${currentPage}&limit=${limit}`)
    });

    const createQueryString = useCallback(
        (name, value) => {
            const params = new URLSearchParams(searchParams);
            params.set(name, value);
            return params.toString();
        },
        [searchParams]
    );

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        router.replace(`${pathname}?${createQueryString('page', value)}`, undefined, { scroll: true });
    };

    React.useEffect(() => {
        if (page) setCurrentPage(Number(page));
        else setCurrentPage(1);
    }, [page]);

    const articles = data?.data || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // Koi bhi published article nahi hai
    if (!isLoading && articles.length === 0) {
        return (
            <Container maxWidth="xl" sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    No articles published yet. Check back soon!
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
            <Grid container spacing={2.5}>
                {isLoading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <Grid size={{ lg: 3, md: 4, sm: 6, xs: 12 }} key={'blog-skeleton-' + i}>
                            <BlogCardSkeleton />
                        </Grid>
                    ))
                    : articles.map((article) => (
                        <Grid size={{ lg: 3, md: 4, sm: 6, xs: 12 }} key={article._id}>
                            <BlogCard article={article} />
                        </Grid>
                    ))
                }
            </Grid>

            {totalPages > 1 && (
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    variant="outlined"
                    shape="rounded"
                    color="primary"
                    sx={{
                        mt: 4,
                        mb: 2,
                        mx: 'auto',
                        '.MuiPagination-ul': { justifyContent: 'center' }
                    }}
                />
            )}
        </Container>
    );
}
// Suspense boundary: this component reads useSearchParams(); Next.js requires a
// <Suspense> wrapper on statically rendered routes (CSR bailout rule).
export default function BlogsListingSuspenseWrapper(props) {
  return (
    <Suspense fallback={null}>
      <BlogsListing {...props} />
    </Suspense>
  );
}
