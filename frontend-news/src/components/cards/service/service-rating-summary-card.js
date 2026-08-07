'use client';

import PropTypes from 'prop-types';
import { Box, Stack, Button, Typography, Skeleton } from '@mui/material';
import Rating from '@mui/material/Rating';
import { MdOutlineRateReview, MdOutlineReviews } from 'react-icons/md';
import { useQuery } from '@tanstack/react-query';
import * as api from 'src/services';

/**
 * Shown right below the service title on the service detail page, before
 * the booking form - acts as a trust signal at the point where the user is
 * deciding whether to book. "Read Reviews" and "Write Review" open the
 * reviews list / review form as popups (handled inside
 * ServiceReviewsSection) instead of scrolling the page down to an inline
 * section, so this card only needs to summarise + link out to them.
 */
export default function ServiceRatingSummaryCard({ serviceId }) {
    const { data, isPending } = useQuery({
        queryKey: ['service-reviews-summary', serviceId],
        queryFn: () => api.getServiceReviews(serviceId),
        enabled: Boolean(serviceId)
    });

    const openReviews = () => {
        window.dispatchEvent(new CustomEvent('adhyatmah:open-service-reviews'));
    };

    const openWriteReview = () => {
        window.dispatchEvent(new CustomEvent('adhyatmah:open-service-review'));
    };

    if (!serviceId) return null;

    if (isPending) {
        return <Skeleton variant="rounded" width={220} height={32} />;
    }

    const reviews = data?.reviews || [];
    const totalReviews = reviews.length;
    const avgRating = totalReviews
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
        : 0;

    if (!totalReviews) {
        return (
            <Box>
                <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                    <Rating value={0} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                        No Reviews Yet · Be the first to review this service
                    </Typography>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<MdOutlineRateReview size={16} />}
                        onClick={openWriteReview}
                    >
                        Write Review
                    </Button>
                </Stack>
            </Box>
        );
    }

    return (
        <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                <Rating value={avgRating} precision={0.1} readOnly size="small" />
                <Typography variant="body2" fontWeight={600}>
                    {avgRating.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    ({totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'})
                </Typography>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<MdOutlineReviews size={16} />}
                    onClick={openReviews}
                >
                    See All Reviews
                </Button>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<MdOutlineRateReview size={16} />}
                    onClick={openWriteReview}
                >
                    Write Review
                </Button>
            </Stack>
        </Box>
    );
}

ServiceRatingSummaryCard.propTypes = {
    serviceId: PropTypes.string
};