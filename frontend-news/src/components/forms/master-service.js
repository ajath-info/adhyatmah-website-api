'use client';
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@bprogress/next';
import PropTypes from 'prop-types';

// mui
import {
    Card,
    Stack,
    TextField,
    Typography,
    Box,
    Select,
    Button,
    FormControl,
    FormHelperText,
    Grid,
    Skeleton
} from '@mui/material';
// components
import UploadSingleFile from '@/components/upload/upload-single-file';
// toast
import toast from 'react-hot-toast';
// formik
import { Form, FormikProvider, useFormik } from 'formik';
// api
import * as api from 'src/services';
import { useUploadSingleFile } from '@/hooks/use-upload-file';
import { masterServiceSchema } from '@/validations';

MasterServiceForm.propTypes = {
    data: PropTypes.object,
    isLoading: PropTypes.bool
};

const STATUS_OPTIONS = ['active', 'inactive'];

export default function MasterServiceForm({
    data: currentMasterService,
    isLoading: masterServiceLoading
}) {
    const router = useRouter();

    const [state, setstate] = useState({ loading: false });

    const mutationFn =
        currentMasterService
            ?
            api.updateMasterServiceByAdmin
            :
            api.createMasterServiceByAdmin;

    const { mutate, isPending: isLoading } = useMutation({
        mutationFn,
        retry: false,
        onSuccess: (data) => {
            toast.success(data.message);
            router.push('/admin/master-services');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Something went wrong!');
        }
    });

    // Delete file mutation
    const { mutateAsync: deleteMutate } = useMutation({
        mutationFn: api.singleDeleteFile,
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Something went wrong!');
        }
    });
    const { mutate: uploadMutate } = useUploadSingleFile(
        async (data) => {
            // onSuccess
            setFieldValue('image', { _id: data.public_id, url: data.secure_url });

            // delete previous if exists
            if (values.image?._id) {
                await deleteMutate(values.image._id);
            }

            setstate((prev) => ({ ...prev, loading: false }));
        },
        (error) => {
            console.error(error);
            setstate((prev) => ({ ...prev, loading: false }));
        }
    );

    const formik = useFormik({
        initialValues: {
            name: currentMasterService?.name || '',
            slug: currentMasterService?.slug || '',
            description: currentMasterService?.description || '',
            duration: currentMasterService?.duration || '',
            price: currentMasterService?.price ?? '',
            originalPrice: currentMasterService?.originalPrice ?? '',
            image: currentMasterService?.image || null,
            status: currentMasterService?.status || 'active'
        },
        enableReinitialize: true,
        validationSchema: masterServiceSchema,
        onSubmit: async (values) => {

            const payload = {
                ...values,
                price: parseFloat(values.price),
                originalPrice: values.originalPrice === '' ? 0 : parseFloat(values.originalPrice)
            };

            mutate({
                ...payload,
                ...(currentMasterService && {
                    slug: currentMasterService.slug
                })
            });

        }
    });
    const { errors, values, touched, handleSubmit, setFieldValue, getFieldProps } = formik;

    const handleDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        Object.assign(file, { preview: URL.createObjectURL(file) });

        uploadMutate({
            file,
            config: {
                onUploadProgress: (progressEvent) => {
                    const { loaded, total } = progressEvent;
                    const percentage = Math.floor((loaded * 100) / total);
                    setstate((prev) => ({ ...prev, loading: percentage }));
                }
            }
        });
    };

    const handleNameChange = (event) => {
        const name = event.target.value;

        formik.setFieldValue("name", name);

        // Sirf Create me auto slug banao
        if (!currentMasterService) {
            const slug = name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");

            formik.setFieldValue("slug", slug);
        }
    };

    return (
        <Box position="relative">
            <FormikProvider value={formik}>
                <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid size={{ md: 8, xs: 12 }}>
                            <Card sx={{ p: 3 }}>
                                <Stack spacing={3}>
                                    <Stack gap={1}>
                                        {masterServiceLoading ? (
                                            <Skeleton variant="text" width={140} />
                                        ) : (
                                            <Typography variant="overline" color="text.primary" htmlFor="name" component={'label'}>
                                                Service Name
                                            </Typography>
                                        )}
                                        {masterServiceLoading ? (
                                            <Skeleton variant="rounded" width="100%" height={56} />
                                        ) : (
                                            <TextField
                                                id="name"
                                                fullWidth
                                                {...getFieldProps('name')}
                                                onChange={handleNameChange}
                                                error={Boolean(touched.name && errors.name)}
                                                helperText={touched.name && errors.name}
                                                placeholder="e.g. Satyanarayan Puja"
                                            />
                                        )}
                                    </Stack>
                                    <Stack gap={1}>
                                        {masterServiceLoading ? (
                                            <Skeleton variant="text" width={70} />
                                        ) : (
                                            <Typography variant="overline" color="text.primary" htmlFor="slug" component={'label'}>
                                                Slug
                                            </Typography>
                                        )}
                                        {masterServiceLoading ? (
                                            <Skeleton variant="rounded" width="100%" height={56} />
                                        ) : (
                                            <TextField
                                                fullWidth
                                                id="slug"
                                                {...getFieldProps('slug')}
                                                error={Boolean(touched.slug && errors.slug)}
                                                helperText={touched.slug && errors.slug}
                                            />
                                        )}
                                    </Stack>
                                    <Stack gap={1}>
                                        {masterServiceLoading ? (
                                            <Skeleton variant="text" width={100} />
                                        ) : (
                                            <Typography variant="overline" color="text.primary" htmlFor="description" component={'label'}>
                                                Description
                                            </Typography>
                                        )}
                                        {masterServiceLoading ? (
                                            <Skeleton variant="rounded" width="100%" height={180} />
                                        ) : (
                                            <TextField
                                                fullWidth
                                                id="description"
                                                {...getFieldProps('description')}
                                                error={Boolean(touched.description && errors.description)}
                                                helperText={touched.description && errors.description}
                                                rows={7}
                                                multiline
                                            />
                                        )}
                                    </Stack>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <Stack gap={1}>
                                                {masterServiceLoading ? (
                                                    <Skeleton variant="text" width={80} />
                                                ) : (
                                                    <Typography variant="overline" color="text.primary" htmlFor="price" component={'label'}>
                                                        Price (₹)
                                                    </Typography>
                                                )}
                                                {masterServiceLoading ? (
                                                    <Skeleton variant="rounded" width="100%" height={56} />
                                                ) : (
                                                    <TextField
                                                        id="price"
                                                        type="number"
                                                        fullWidth
                                                        {...getFieldProps('price')}
                                                        error={Boolean(touched.price && errors.price)}
                                                        helperText={touched.price && errors.price}
                                                    />
                                                )}
                                            </Stack>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <Stack gap={1}>
                                                {masterServiceLoading ? (
                                                    <Skeleton variant="text" width={110} />
                                                ) : (
                                                    <Typography variant="overline" color="text.primary" htmlFor="originalPrice" component={'label'}>
                                                        Original Price (₹)
                                                    </Typography>
                                                )}
                                                {masterServiceLoading ? (
                                                    <Skeleton variant="rounded" width="100%" height={56} />
                                                ) : (
                                                    <TextField
                                                        id="originalPrice"
                                                        type="number"
                                                        fullWidth
                                                        {...getFieldProps('originalPrice')}
                                                        error={Boolean(touched.originalPrice && errors.originalPrice)}
                                                        helperText={touched.originalPrice && errors.originalPrice}
                                                    />
                                                )}
                                            </Stack>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <Stack gap={1}>
                                                {masterServiceLoading ? (
                                                    <Skeleton variant="text" width={80} />
                                                ) : (
                                                    <Typography variant="overline" color="text.primary" htmlFor="duration" component={'label'}>
                                                        Duration
                                                    </Typography>
                                                )}
                                                {masterServiceLoading ? (
                                                    <Skeleton variant="rounded" width="100%" height={56} />
                                                ) : (
                                                    <TextField
                                                        id="duration"
                                                        fullWidth
                                                        {...getFieldProps('duration')}
                                                        error={Boolean(touched.duration && errors.duration)}
                                                        helperText={touched.duration && errors.duration}
                                                        placeholder="e.g. 2-3 Hrs"
                                                    />
                                                )}
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                    {currentMasterService && (
                                        <Typography variant="caption" color="text.secondary">
                                            Changing the price here will automatically update this price on every
                                            existing Pandit/Vendor service for this pooja.
                                        </Typography>
                                    )}
                                </Stack>
                            </Card>
                        </Grid>
                        <Grid size={{ md: 4, xs: 12 }}>
                            <div style={{ position: '-webkit-sticky', position: 'sticky', top: 0 }}>
                                <Stack spacing={3}>
                                    <Card sx={{ p: 3 }}>
                                        <Stack spacing={3}>
                                            <div>
                                                <Stack gap={1}>
                                                    <Stack direction="row" justifyContent="space-between">
                                                        {masterServiceLoading ? (
                                                            <Skeleton variant="text" width={150} />
                                                        ) : (
                                                            <Typography variant="overline" color="text.primary" htmlFor="file" component={'label'}>
                                                                Image
                                                            </Typography>
                                                        )}
                                                        {masterServiceLoading ? (
                                                            <Skeleton variant="text" width={150} />
                                                        ) : (
                                                            <Typography variant="overline" component={'label'} htmlFor="master-service-image">
                                                                <span>800 * 600</span>
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                    {masterServiceLoading ? (
                                                        <Skeleton variant="rounded" width="100%" height={225} />
                                                    ) : (
                                                        <UploadSingleFile
                                                            id="file"
                                                            file={values.image}
                                                            onDrop={handleDrop}
                                                            error={Boolean(touched.image && errors.image)}
                                                            category
                                                            accept="image/*"
                                                            loading={state.loading}
                                                        />
                                                    )}
                                                </Stack>
                                                {touched.image && errors.image && (
                                                    <FormHelperText error sx={{ px: 2, mx: 0 }}>
                                                        {touched.image && errors.image}
                                                    </FormHelperText>
                                                )}
                                            </div>
                                            <FormControl fullWidth sx={{ select: { textTransform: 'capitalize' } }}>
                                                <Stack gap={1}>
                                                    {masterServiceLoading ? (
                                                        <Skeleton variant="text" width={70} />
                                                    ) : (
                                                        <Typography variant="overline" color="text.primary" htmlFor="status" component={'label'}>
                                                            Status
                                                        </Typography>
                                                    )}
                                                    {masterServiceLoading ? (
                                                        <Skeleton variant="rounded" width="100%" height={56} />
                                                    ) : (
                                                        <Select
                                                            id="status"
                                                            native
                                                            {...getFieldProps('status')}
                                                            error={Boolean(touched.status && errors.status)}
                                                        >
                                                            {STATUS_OPTIONS.map((status) => (
                                                                <option key={status} value={status}>
                                                                    {status}
                                                                </option>
                                                            ))}
                                                        </Select>
                                                    )}
                                                </Stack>

                                                {touched.status && errors.status && (
                                                    <FormHelperText error sx={{ px: 2, mx: 0 }}>
                                                        {touched.status && errors.status}
                                                    </FormHelperText>
                                                )}
                                            </FormControl>
                                            {currentMasterService && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Marking this inactive hides it from the homepage, /services and
                                                    /offline-puja-services listings. Existing vendor services for this
                                                    pooja are not deleted.
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Card>
                                    {masterServiceLoading ? (
                                        <Skeleton variant="rounded" width="100%" height={56} />
                                    ) : (
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            loading={isLoading}
                                            sx={{ ml: 'auto', mt: 3 }}
                                        >
                                            {currentMasterService ? 'Update' : 'Create'}
                                        </Button>
                                    )}
                                </Stack>
                            </div>
                        </Grid>
                    </Grid>
                </Form>
            </FormikProvider>
        </Box>
    );
}