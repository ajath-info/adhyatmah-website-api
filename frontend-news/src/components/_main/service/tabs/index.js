'use client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from '@bprogress/next';
import PropTypes from 'prop-types';
// mui
import { Dialog, DialogContent, IconButton } from '@mui/material';
import { MdClose } from 'react-icons/md';
// react
import { useQuery, useQueryClient } from '@tanstack/react-query';
// api
import * as api from 'src/services';
// components
import ServiceReviewForm from '@/components/forms/service-review-form';
import ServiceReview from '../reviews';

ServiceReviewsSection.propTypes = {
    serviceId: PropTypes.string.isRequired
};

// Reviews-only for services (no rating/star summary anywhere) - both the
// review list and the "Write Review" form only ever show up as popups,
// opened via the Read Reviews / Write Review buttons on the service page.
// This component itself renders nothing inline into the page flow.
export default function ServiceReviewsSection({ serviceId }) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const { isAuthenticated } = useSelector(({ user }) => user);

    const [state, setstate] = useState([]);
    const [reviewBox, setReviewBox] = useState(false);
    const [allReviewsOpen, setAllReviewsOpen] = useState(false);

    const { data, isPending: isLoading } = useQuery({
        queryKey: ['service-reviews-summary', serviceId],
        queryFn: () => api.getServiceReviews(serviceId),
        enabled: Boolean(serviceId)
    });

    const reviews = data?.reviews || [];
    const serverIds = new Set(reviews.map((r) => r._id));
    const pendingState = state.filter((r) => !serverIds.has(r._id));
    const mergedReviews = [...pendingState, ...reviews];
    const totalReviews = mergedReviews.length;

    const handleOpenReviewBox = () => {
        if (!isAuthenticated) {
            router.push('/auth/sign-in?redirect=' + router.asPath);
            return;
        }
        setReviewBox(true);
    };
    const handleCloseReviewBox = () => setReviewBox(false);
    const handleCloseAllReviews = () => setAllReviewsOpen(false);

    // Lets the "Write Review" button on the service page open this form
    // as a popup.
    useEffect(() => {
        const handler = () => handleOpenReviewBox();
        window.addEventListener('adhyatmah:open-service-review', handler);
        return () => window.removeEventListener('adhyatmah:open-service-review', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, router]);

    // Lets the "Read Reviews" button open the reviews list as a popup
    // instead of scrolling down the page to an inline section.
    useEffect(() => {
        const handler = () => setAllReviewsOpen(true);
        window.addEventListener('adhyatmah:open-service-reviews', handler);
        return () => window.removeEventListener('adhyatmah:open-service-reviews', handler);
    }, []);

    if (isLoading) return null;

    const reviewDialog = (
        <Dialog open={reviewBox} onClose={handleCloseReviewBox} fullWidth maxWidth="sm">
            <IconButton onClick={handleCloseReviewBox} sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}>
                <MdClose />
            </IconButton>
            <DialogContent sx={{ p: 0 }}>
                <ServiceReviewForm
                    onAddingReview={(v) => {
                        if (v) setstate([v, ...state]);
                        queryClient.invalidateQueries({ queryKey: ['service-reviews-summary', serviceId] });
                    }}
                    sid={serviceId}
                    onClose={handleCloseReviewBox}
                    id="move_add_service_review"
                    onClickCancel={handleCloseReviewBox}
                />
            </DialogContent>
        </Dialog>
    );

    const allReviewsDialog = (
        <Dialog open={allReviewsOpen} onClose={handleCloseAllReviews} fullWidth maxWidth="sm" scroll="paper">
            <IconButton onClick={handleCloseAllReviews} sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}>
                <MdClose />
            </IconButton>
            <DialogContent>
                <ServiceReview
                    reviews={mergedReviews}
                    totalReviews={totalReviews}
                    onWriteReview={() => {
                        setAllReviewsOpen(false);
                        handleOpenReviewBox();
                    }}
                />
            </DialogContent>
        </Dialog>
    );

    return (
        <>
            {reviewDialog}
            {allReviewsDialog}
        </>
    );
}