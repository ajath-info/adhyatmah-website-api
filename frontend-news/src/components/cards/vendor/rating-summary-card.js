'use client';

import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from '@bprogress/next';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';

// mui
import { Box, Stack, Rating, Typography, Button } from '@mui/material';
import { MdStar } from 'react-icons/md';

// api
import * as api from 'src/services';

// Same normalization used by VendorReviewsSection so both stay in sync -
// this hits the same react-query cache key, so no extra network calls.
const normalizeReview = (review) => ({
    ...review,
    user: {
        firstName: review.customer?.firstName,
        lastName: review.customer?.lastName,
        cover: review.customer?.cover
    },
    images: review.images || []
});

/**
 * Compact rating summary shown at the top of the pandit profile, and again
 * (with recent review previews) right above the Services list - so users
 * don't have to scroll past 20-25 services to find the review section.
 *
 * Purely additive/read-only: it reads the existing vendor-reviews-summary
 * query and, on "Write Review", scrolls to + dispatches an event that the
 * existing VendorReviewsSection listens for to open its own form. It does
 * not change any existing review flow or state.
 */
export default function VendorRatingSummaryCard({ vendorId, showRecentReviews = false, targetId = 'pandit-reviews-section' }) {
    const router = useRouter();
    const { isAuthenticated } = useSelector(({ user }) => user);

    const { data, isPending: isLoading } = useQuery({
        queryKey: ['vendor-reviews-summary', vendorId],
        queryFn: () => api.getVendorReviewsList(vendorId),
        enabled: Boolean(vendorId)
    });

    const reviews = useMemo(() => (data?.payload?.reviews || []).map(normalizeReview), [data]);
    const totalReviews = data?.payload?.total || reviews.length;
    const totalRating = data?.payload?.averageRating || 0;

    const scrollToReviews = () => {
        // Opens all reviews in a popup (handled inside VendorReviewsSection)
        // instead of scrolling down the page to an inline section - keeps
        // the profile page from growing tall with a full reviews list.
        window.dispatchEvent(new CustomEvent('adhyatmah:open-vendor-reviews'));
    };

    const handleWriteReview = () => {
        if (!isAuthenticated) {
            router.push('/auth/sign-in?redirect=' + router.asPath);
            return;
        }
        // Opens the review form as a popup (handled inside VendorReviewsSection)
        // instead of scrolling the page down to an inline form.
        window.dispatchEvent(new CustomEvent('adhyatmah:open-vendor-review'));
    };

    if (isLoading || !vendorId) return null;

    return (
        <Box>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" justifyContent={showRecentReviews ? 'flex-start' : 'center'}>
                <Rating value={totalRating} precision={0.1} readOnly icon={<MdStar size={20} />} emptyIcon={<MdStar size={20} style={{ opacity: 0.3 }} />} />
                <Typography variant="subtitle1" fontWeight={700}>
                    {totalRating ? totalRating.toFixed(1) : '0.0'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    ({totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'})
                </Typography>
            </Stack>

            <Stack direction="row" spacing={1.5} sx={{ mt: 1.5, justifyContent: showRecentReviews ? 'flex-start' : 'center' }}>
                <Button variant="contained" size="small" onClick={handleWriteReview}>
                    Write Review
                </Button>
                {showRecentReviews && (
                    <Button variant="text" size="small" onClick={scrollToReviews}>
                        See All Reviews
                    </Button>
                )}
            </Stack>
        </Box>
    );
}

VendorRatingSummaryCard.propTypes = {
    vendorId: PropTypes.string,
    showRecentReviews: PropTypes.bool,
    targetId: PropTypes.string
};