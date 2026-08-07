import PropTypes from 'prop-types';
// mui
import { Box, Button, Stack, Typography } from '@mui/material';
import { MdEdit } from 'react-icons/md';
// components
import ReviewsList from 'src/components/lists/reviews';
import NoDataFoundIllustration from '@/illustrations/data-not-found';

ServiceReview.propTypes = {
    reviews: PropTypes.array.isRequired,
    totalReviews: PropTypes.number.isRequired,
    onWriteReview: PropTypes.func.isRequired
};

// Reviews-only content for the "See All Reviews" popup - just the review
// list (no rating/star breakdown), plus a Write Review action.
export default function ServiceReview({ reviews, totalReviews, onWriteReview }) {
    return (
        <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="subtitle1">
                    {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
                </Typography>
                <Button size="small" variant="outlined" startIcon={<MdEdit />} onClick={onWriteReview}>
                    Write A Review
                </Button>
            </Stack>

            {reviews?.length ? <ReviewsList reviews={reviews} /> : <NoDataFoundIllustration />}
        </Box>
    );
}