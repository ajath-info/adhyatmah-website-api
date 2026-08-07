'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from '@bprogress/next';
import PropTypes from 'prop-types';
// mui
import { Dialog, DialogContent, IconButton, Grid, Typography } from '@mui/material';
import { MdClose } from 'react-icons/md';
// react
import { useQuery, useQueryClient } from '@tanstack/react-query';
// api
import * as api from 'src/services';
// components
import VendorReviewForm from '@/components/forms/vendor-review-form';
import ReviewOverview from '@/components/_main/product/reviews/overview';
import ReviewsList from 'src/components/lists/reviews';

VendorReviewsSection.propTypes = {
    vendorId: PropTypes.string.isRequired
};

// Normalizes VendorReview docs (which use `customer` + `image`) to the same
// shape ReviewOverview/ReviewsList already expect (`user` + `cover`), so we
// don't have to touch those shared components.
const normalizeReview = (review) => ({
    ...review,
    user: {
        firstName: review.customer?.firstName,
        lastName: review.customer?.lastName,
        cover: review.customer?.cover
    },
    images: review.images || []
});

export default function VendorReviewsSection({ vendorId }) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [state, setstate] = useState([]);
    const [reviewBox, setReviewBox] = useState(false);
    // Controls the "See All Reviews" popup - the reviews list + rating
    // breakdown open here instead of being rendered inline on the page.
    const [allReviewsOpen, setAllReviewsOpen] = useState(false);
    const { isAuthenticated } = useSelector(({ user }) => user);

    const { data, isPending: isLoading } = useQuery({
        queryKey: ['vendor-reviews-summary', vendorId],
        queryFn: () => api.getVendorReviewsList(vendorId),
        enabled: Boolean(vendorId)
    });

    const reviews = useMemo(
        () => (data?.payload?.reviews || []).map(normalizeReview),
        [data]
    );
    const totalReviews = data?.payload?.total || reviews.length;
    const totalRating = data?.payload?.averageRating || 0;

    const reviewsSummery = useMemo(() => {
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach((r) => {
            if (counts[r.rating] !== undefined) counts[r.rating] += 1;
        });
        return Object.entries(counts).map(([rating, count]) => ({ _id: Number(rating), count }));
    }, [reviews]);

    const serverIds = new Set(reviews.map((r) => r._id));
    const pendingState = state.filter((r) => !serverIds.has(r._id));
    const mergedReviews = [...pendingState.map(normalizeReview), ...reviews];

    const handleOpenReviewBox = () => {
        isAuthenticated ? setReviewBox((prev) => !prev) : router.push('/auth/sign-in?redirect=' + router.asPath);
    };
    const handleCloseReviewBox = () => setReviewBox(false);

    // Lets other UI (top rating card's "Write Review" button, "Review
    // Pending" CTAs on the bookings/dashboard pages) open this same form
    // without duplicating its logic. Purely additive - doesn't change any
    // existing open/close behaviour.
    useEffect(() => {
        const handler = () => {
            if (!isAuthenticated) {
                router.push('/auth/sign-in?redirect=' + router.asPath);
                return;
            }
            setReviewBox(true);
        };
        window.addEventListener('adhyatmah:open-vendor-review', handler);
        return () => window.removeEventListener('adhyatmah:open-vendor-review', handler);
    }, [isAuthenticated, router]);

    // Lets the "See All Reviews" button (top rating card) open the full
    // reviews list + rating breakdown as a popup instead of this section
    // rendering inline further down the page.
    useEffect(() => {
        const handler = () => setAllReviewsOpen(true);
        window.addEventListener('adhyatmah:open-vendor-reviews', handler);
        return () => window.removeEventListener('adhyatmah:open-vendor-reviews', handler);
    }, []);
    const handleCloseAllReviews = () => setAllReviewsOpen(false);

    if (isLoading) return null;

    const reviewDialog = (
        <Dialog open={reviewBox} onClose={handleCloseReviewBox} fullWidth maxWidth="sm">
            <IconButton
                onClick={handleCloseReviewBox}
                sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
            >
                <MdClose />
            </IconButton>
            <DialogContent sx={{ p: 0 }}>
                <VendorReviewForm
                    onAddingReview={(v) => {
                        if (v) setstate([v, ...state]);
                        queryClient.invalidateQueries({ queryKey: ['vendor-reviews-summary', vendorId] });
                    }}
                    vendorId={vendorId}
                    onClose={handleCloseReviewBox}
                    onClickCancel={() => setReviewBox(false)}
                />
            </DialogContent>
        </Dialog>
    );

    // The reviews list + rating breakdown no longer render inline on the
    // page (that made the profile page very tall) - they now only show up
    // inside this popup, opened via the "See All Reviews" button.
    const allReviewsDialog = (
        <Dialog open={allReviewsOpen} onClose={handleCloseAllReviews} fullWidth maxWidth="md" scroll="paper">
            <IconButton
                onClick={handleCloseAllReviews}
                sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
            >
                <MdClose />
            </IconButton>
            <DialogContent>
                <Grid container spacing={3}>
                    <Grid size={{ md: 8, xs: 12 }}>
                        {mergedReviews.length ? (
                            <ReviewsList reviews={mergedReviews} />
                        ) : (
                            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                                No reviews yet
                            </Typography>
                        )}
                    </Grid>
                    <Grid size={{ md: 4, xs: 12 }}>
                        <ReviewOverview
                            totalRating={totalRating}
                            totalReviews={totalReviews}
                            reviews={mergedReviews}
                            onOpen={handleOpenReviewBox}
                            reviewsSummery={reviewsSummery}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );

    // This component is now popup-only - it renders nothing inline into
    // the page flow, just the two dialogs (write review / see all reviews).
    return (
        <>
            {reviewDialog}
            {allReviewsDialog}
        </>
    );
}