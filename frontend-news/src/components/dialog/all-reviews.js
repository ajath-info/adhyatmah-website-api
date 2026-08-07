'use client';
import * as React from 'react';
import PropTypes from 'prop-types';

// mui
import {
    Dialog,
    DialogContent,
    Box,
    Stack,
    Grid,
    Typography,
    IconButton,
    Button,
    CircularProgress,
    alpha
} from '@mui/material';
import { IoClose } from 'react-icons/io5';

// components
import { TestimonialCard } from '@/components/carousels/testimonial';

// services
import { getAllReviews } from '@/services';

const PAGE_SIZE = 9;

AllReviewsDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    // Reviews already loaded on the homepage strip, used as an instant
    // fallback so the popup never opens empty while the first page loads.
    fallbackData: PropTypes.array
};

export default function AllReviewsDialog({ open, onClose, fallbackData }) {
    const [reviews, setReviews] = React.useState([]);
    const [page, setPage] = React.useState(1);
    const [total, setTotal] = React.useState(0);
    const [totalPages, setTotalPages] = React.useState(1);
    const [loading, setLoading] = React.useState(false);
    const [loadingMore, setLoadingMore] = React.useState(false);
    const [errored, setErrored] = React.useState(false);

    const fetchPage = React.useCallback(async (pageToFetch, { append } = {}) => {
        append ? setLoadingMore(true) : setLoading(true);
        setErrored(false);
        try {
            const res = await getAllReviews(`?page=${pageToFetch}&limit=${PAGE_SIZE}`);
            const { reviews: newReviews = [], total: newTotal = 0, totalPages: newTotalPages = 1 } = res?.data || {};
            setReviews((prev) => (append ? [...prev, ...newReviews] : newReviews));
            setTotal(newTotal);
            setTotalPages(newTotalPages);
            setPage(pageToFetch);
        } catch (error) {
            // Fall back to whatever was already loaded on the homepage so the
            // popup still shows something useful instead of an error state.
            if (!append) {
                setReviews(fallbackData || []);
                setTotal(fallbackData?.length || 0);
                setTotalPages(1);
            }
            setErrored(true);
        } finally {
            append ? setLoadingMore(false) : setLoading(false);
        }
    }, [fallbackData]);

    React.useEffect(() => {
        if (open) {
            fetchPage(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleLoadMore = () => {
        if (page < totalPages && !loadingMore) {
            fetchPage(page + 1, { append: true });
        }
    };

    return (
        <Dialog
            onClose={onClose}
            open={open}
            fullWidth
            maxWidth="md"
            scroll="paper"
            PaperProps={{ sx: { borderRadius: 3, maxHeight: '85vh' } }}
        >
            <Box
                sx={{
                    px: 3,
                    py: 2.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between'
                }}
            >
                <Stack spacing={0.25}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        All Reviews
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {total ? `${total} review${total === 1 ? '' : 's'}` : 'Real experiences from our devotees'}
                    </Typography>
                </Stack>
                <IconButton aria-label="close" onClick={onClose} sx={{ mt: -0.5, mr: -1 }}>
                    <IoClose />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 3, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03) }}>
                {loading ? (
                    <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
                        <CircularProgress size={32} />
                    </Stack>
                ) : reviews?.length ? (
                    <>
                        <Grid container spacing={2.5}>
                            {reviews.map((item, index) => (
                                <Grid key={item._id || index} size={{ xs: 12, sm: 6, md: 4 }}>
                                    <TestimonialCard item={item} variant="grid" />
                                </Grid>
                            ))}
                        </Grid>

                        <Stack alignItems="center" spacing={1.5} sx={{ mt: 4 }}>
                            {total > 0 && (
                                <Typography variant="caption" color="text.secondary">
                                    Showing {reviews.length} of {total} reviews
                                </Typography>
                            )}
                            {page < totalPages && (
                                <Button
                                    variant="contained"
                                    onClick={handleLoadMore}
                                    loading={loadingMore}
                                    sx={{
                                        borderRadius: 10,
                                        px: 4,
                                        fontWeight: 700
                                    }}
                                >
                                    Load more reviews
                                </Button>
                            )}
                        </Stack>
                    </>
                ) : (
                    <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ py: 8 }}>
                        <Typography variant="body1" color="text.secondary">
                            {errored ? 'Could not load reviews right now.' : 'No reviews yet.'}
                        </Typography>
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    );
}