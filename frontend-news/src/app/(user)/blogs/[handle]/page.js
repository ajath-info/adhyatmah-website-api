'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import {
    Box, Container, Stack, Typography, Chip, Skeleton, Divider, Button
} from '@mui/material';
import { MdAccessTime, MdArrowBack } from 'react-icons/md';

import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import * as api from 'src/services';

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

export default function ArticleDetailPage() {
    const params = useParams();
    const handle = params.handle;

    const { data, isPending: isLoading, isError } = useQuery({
        queryKey: ['article', handle],
        queryFn: () => api.getArticleByHandle(handle),
        enabled: !!handle,
        retry: false
    });

    const article = data?.data;

    // ---- Not found state ----
    if (!isLoading && (isError || !article)) {
        return (
            <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    Article Not Found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    The article you're looking for doesn't exist or has been removed.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    href="/blogs"
                    startIcon={<MdArrowBack />}
                >
                    Back to Blogs
                </Button>
            </Container>
        );
    }

    return (
        <>
            <Container maxWidth="xl">
                <HeaderBreadcrumbs
                    heading={isLoading ? 'Loading...' : article.title}
                    links={[
                        { name: 'Home', href: '/' },
                        { name: 'Blogs', href: '/blogs' },
                        { name: isLoading ? '...' : article.title }
                    ]}
                />
            </Container>

            <Container maxWidth="md" sx={{ pt: { xs: 3, md: 4 }, pb: { xs: 6, md: 8 } }}>
                <Stack spacing={3}>

                    {/* Hero image */}
                    {isLoading ? (
                        <Skeleton variant="rounded" width="100%" height={380} sx={{ borderRadius: 3 }} />
                    ) : article.image?.url ? (
                        <Box
                            sx={{
                                width: '100%',
                                borderRadius: 3,
                                overflow: 'hidden',
                                border: '1px solid',
                                borderColor: 'divider',
                                position: 'relative'
                            }}
                        >
                            <Box
                                component="img"
                                src={article.image.url}
                                alt={article.image.altText || article.title}
                                sx={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }}
                            />
                        </Box>
                    ) : null}

                    {/* Meta row: category / date / read time */}
                    <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1.5}>
                        {isLoading ? (
                            <Skeleton variant="rounded" width={90} height={26} />
                        ) : (
                            article.blog?.title && (
                                <Chip
                                    label={article.blog.title}
                                    size="small"
                                    color="primary"
                                    sx={{ fontWeight: 700, color: 'common.white' }}
                                />
                            )
                        )}

                        <Stack direction="row" alignItems="center" spacing={0.75}>
                            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                                {isLoading ? <Skeleton width={110} /> : formatDate(article.publishedAt || article.createdAt)}
                            </Typography>
                        </Stack>

                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />

                        <Stack direction="row" alignItems="center" spacing={0.5}>
                            <MdAccessTime size={14} color="#9e9e9e" />
                            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                                {isLoading ? <Skeleton width={70} /> : estimateReadTime(article.content)}
                            </Typography>
                        </Stack>
                    </Stack>

                    {/* Title (repeated below hero, styled bigger for readability) */}
                    {!isLoading && (
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 800,
                                color: 'text.primary',
                                fontSize: { xs: 24, sm: 30, md: 34 }
                            }}
                        >
                            {article.title}
                        </Typography>
                    )}

                    {/* Excerpt */}
                    {isLoading ? (
                        <Skeleton variant="text" width="90%" height={30} />
                    ) : article.excerpt ? (
                        <Typography
                            sx={{
                                fontSize: 17,
                                color: 'text.secondary',
                                fontStyle: 'italic',
                                lineHeight: 1.6
                            }}
                        >
                            {article.excerpt}
                        </Typography>
                    ) : null}

                    <Divider />

                    {/* Content */}
                    <Stack spacing={2}>
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} variant="text" width={i % 3 === 0 ? '95%' : '100%'} height={22} />
                            ))
                        ) : (
                            <Box
                                sx={{
                                    fontSize: 16,
                                    lineHeight: 1.9,
                                    color: 'text.primary',
                                    '& p': {
                                        marginBottom: 2
                                    },
                                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                                        color: 'text.primary',
                                        marginTop: 3,
                                        marginBottom: 1.5
                                    },
                                    '& h2': {
                                        backgroundColor: '#b5451b',
                                        color: '#fff !important',
                                        padding: '10px 15px',
                                        fontSize: '18px',
                                        borderRadius: '4px 4px 0 0'
                                    },
                                    '& a': {
                                        color: '#f5a623',
                                        textDecoration: 'underline'
                                    },
                                    '& ul, & ol': {
                                        paddingLeft: 3,
                                        marginBottom: 2
                                    },
                                    '& blockquote': {
                                        borderLeft: '4px solid #f5a623',
                                        margin: 0,
                                        marginBottom: 2,
                                        paddingLeft: 2,
                                        color: 'text.secondary',
                                        fontStyle: 'italic'
                                    },
                                    '& table': {
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        marginBottom: 2
                                    },
                                    '& th': {
                                        backgroundColor: '#f5a623',
                                        color: '#fff',
                                        padding: '10px 14px',
                                        textAlign: 'left',
                                        fontSize: 14
                                    },
                                    '& td': {
                                        padding: '8px 14px',
                                        fontSize: 14,
                                        borderBottom: '1px solid #e0e0e0'
                                    }
                                }}
                                dangerouslySetInnerHTML={{ __html: article.content }}
                            />
                        )}
                    </Stack>

                    {!isLoading && (
                        <Box sx={{ pt: 2 }}>
                            <Button
                                variant="outlined"
                                color="primary"
                                component={Link}
                                href="/blogs"
                                startIcon={<MdArrowBack />}
                            >
                                Back to All Blogs
                            </Button>
                        </Box>
                    )}
                </Stack>
            </Container>
        </>
    );
}