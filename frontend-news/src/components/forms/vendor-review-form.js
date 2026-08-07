import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

// mui
import { styled } from '@mui/material/styles';
import {
    Button,
    TextField,
    Typography,
    FormHelperText,
    Stack,
    Rating,
    MenuItem,
    Alert
} from '@mui/material';

// react
import { useMutation, useQuery } from '@tanstack/react-query';
// api
import * as api from 'src/services';
// formik
import { useFormik, Form, FormikProvider } from 'formik';
import { useUploadMultiFiles } from '@/hooks/use-upload-file';
import { reviewSchema } from '@/validations';
// dynamic
const UploadMultiFile = dynamic(() => import('@/components/upload/upload-multi-files'));

const RootStyle = styled('div')(({ theme }) => ({
    margin: theme.spacing(3),
    padding: theme.spacing(3),
    borderRadius: '8px',
    backgroundColor: theme.palette.background.default
}));

export default function VendorReviewForm({ ...props }) {
    const { onClose, vendorId, onClickCancel, onAddingReview, ...other } = props;

    // Same restriction as the existing backend: only a completed booking with
    // this vendor can be reviewed. We fetch the customer's completed bookings
    // and let them pick which one to review.
    const { data: bookingsData, isPending: bookingsLoading } = useQuery({
        queryKey: ['previous-bookings-for-review'],
        queryFn: () => api.getUserBookings('previous')
    });

    const eligibleBookings = useMemo(() => {
        const bookings = bookingsData?.payload?.bookings || bookingsData?.bookings || [];
        return bookings.filter((b) => (b.vendor?._id || b.vendor) === vendorId);
    }, [bookingsData, vendorId]);

    const { mutateAsync: deleteMutate } = useMutation({
        mutationFn: api.singleDeleteFile,
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to delete file.');
        }
    });

    const { mutate, isPending: isLoading } = useMutation({
        mutationFn: api.addVendorReview,
        onSuccess: (res) => {
            if (res?.error) {
                toast.error(res?.message || 'Failed to add review.');
                return;
            }
            onAddingReview(res?.payload?.review);
            toast.success(res?.message || 'Added review');
            resetForm();
            onClose();
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to add review.');
        }
    });

    const { mutate: uploadMutate, isPending: uploadLoading } = useUploadMultiFiles(
        (results) => {
            const newImages = results.map((data) => ({
                _id: data.public_id,
                url: data.secure_url
            }));

            setFieldValue('images', [...values.images, ...newImages]);
        },
        (error) => {
            console.error(error);
            toast.error(error.message);
        }
    );

    const formik = useFormik({
        initialValues: { bookingId: '', rating: null, review: '', images: [], blob: [] },
        validationSchema: reviewSchema,
        onSubmit: async () => {
            if (!values.bookingId) {
                toast.error('Please select the booking you want to review.');
                return;
            }
            mutate({
                bookingId: values.bookingId,
                rating: values.rating,
                review: values.review,
                images: values.images.map((v) => v.url)
            });
        }
    });

    const { values, errors, touched, resetForm, handleSubmit, setFieldValue, getFieldProps } = formik;

    const onCancel = () => {
        onClickCancel();
        resetForm();
    };

    const handleDrop = (acceptedFiles) => {
        if (!acceptedFiles?.length) return;
        const blobs = acceptedFiles.map((file) => URL.createObjectURL(file));
        setFieldValue('blob', [...values.blob, ...blobs]);
        uploadMutate({ files: acceptedFiles });
    };

    const handleRemoveAll = () => {
        values.images.forEach((image) => {
            deleteMutate(image._id);
        });
        setFieldValue('images', []);
        setFieldValue('blob', []);
    };
    const handleRemove = (file) => {
        const filtered = values.images.filter((_file) => {
            if (_file._id === file._id) {
                deleteMutate(file._id);
            }
            return _file !== file;
        });
        setFieldValue('images', filtered);
        setFieldValue('blob', [...filtered]);
    };

    if (!bookingsLoading && eligibleBookings.length === 0) {
        return (
            <RootStyle {...other}>
                <Typography variant="subtitle1" gutterBottom>
                    Add Review
                </Typography>
                <Alert severity="info">
                    You can review this Pandit Ji after a completed booking with them.
                </Alert>
                <Stack direction="row" justifyContent="flex-end" mt={2}>
                    <Button type="button" color="inherit" variant="outlined" onClick={onCancel}>
                        Close
                    </Button>
                </Stack>
            </RootStyle>
        );
    }

    return (
        <RootStyle {...other}>
            <Typography variant="subtitle1" gutterBottom>
                Add Review
            </Typography>

            <FormikProvider value={formik}>
                <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        <TextField
                            select
                            fullWidth
                            label="Which booking is this review for?"
                            {...getFieldProps('bookingId')}
                            disabled={bookingsLoading}
                        >
                            {eligibleBookings.map((booking) => (
                                <MenuItem key={booking._id} value={booking._id}>
                                    {booking.service?.poojaType || 'Puja Booking'} —{' '}
                                    {new Date(booking.dateTime).toLocaleDateString()}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1.5}>
                            <Typography variant="body2">Your Rating</Typography>
                            <Rating
                                {...getFieldProps('rating')}
                                onChange={(event) => setFieldValue('rating', Number(event.target.value))}
                            />
                        </Stack>
                        {errors.rating && <FormHelperText error>{touched.rating && 'Rating Required'}</FormHelperText>}

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Review"
                            type="text"
                            {...getFieldProps('review')}
                            error={Boolean(touched.review && errors.review)}
                            helperText={touched.review && errors.review}
                        />
                        <UploadMultiFile
                            showPreview
                            maxSize={3145728}
                            accept="image/*"
                            files={values.images}
                            loading={uploadLoading}
                            onDrop={handleDrop}
                            onRemove={handleRemove}
                            onRemoveAll={handleRemoveAll}
                            blob={values.blob}
                            error={Boolean(touched.images && errors.images)}
                        />
                        {touched.images && errors.images && (
                            <FormHelperText error sx={{ px: 2 }}>
                                {touched.images && errors.images}
                            </FormHelperText>
                        )}
                        <Stack direction="row" justifyContent="flex-end">
                            <Button type="button" color="inherit" variant="outlined" onClick={onCancel} sx={{ mr: 1.5 }}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" loading={isLoading}>
                                Post Review
                            </Button>
                        </Stack>
                    </Stack>
                </Form>
            </FormikProvider>
        </RootStyle>
    );
}
VendorReviewForm.propTypes = {
    onClose: PropTypes.func,
    vendorId: PropTypes.string,
    onClickCancel: PropTypes.func,
    onAddingReview: PropTypes.func
};