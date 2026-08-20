'use client';
import React from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// mui
import {
    Button,
    Stack,
    TextField,
    Typography,
    Box,
    Select,
    FormControl,
    FormHelperText,
    Grid,
    Skeleton
} from '@mui/material';
// api
import * as api from 'src/services';
// formik
import { Form, FormikProvider, useFormik } from 'formik';
import { languageSchema } from '@/validations';

const STATUS_OPTIONS = ['active', 'inactive'];

export default function LanguageForm({ data: currentLanguage, isLoading: languageLoading, handleClose, handleCancel }) {
    const mutationFn = currentLanguage ? api.updateLanguageByAdmin : api.addLanguageByAdmin;

    const { mutate, isPending: isLoading } = useMutation({
        mutationFn,
        retry: false,
        onSuccess: (data) => {
            toast.success(data.message);
            handleClose();
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Something went wrong!');
        }
    });

    const formik = useFormik({
        initialValues: {
            name: currentLanguage?.name || '',
            label: currentLanguage?.label || '',
            order: currentLanguage?.order ?? '',
            status: currentLanguage?.status || 'active'
        },
        enableReinitialize: true,
        validationSchema: languageSchema,
        onSubmit: async (values) => {
            try {
                mutate({
                    ...values,
                    label: values.label || values.name,
                    order: values.order === '' ? undefined : Number(values.order),
                    ...(currentLanguage && { _id: currentLanguage._id })
                });
            } catch (error) {
                console.error(error);
            }
        }
    });
    const { errors, values, touched, handleSubmit, getFieldProps } = formik;

    return (
        <Box position="relative">
            <FormikProvider value={formik}>
                <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid size={{ md: 12, xs: 12 }}>
                            <Stack spacing={3}>
                                <FormControl fullWidth>
                                    <Stack gap={1}>
                                        {languageLoading ? (
                                            <Skeleton variant="text" width={70} />
                                        ) : (
                                            <Typography variant="overline" htmlFor="name" color="text.primary" component={'label'}>
                                                Language Key
                                            </Typography>
                                        )}

                                        {languageLoading ? (
                                            <Skeleton variant="rounded" width="100%" height={56} />
                                        ) : (
                                            <TextField
                                                id="name"
                                                fullWidth
                                                placeholder="e.g. hindi"
                                                {...getFieldProps('name')}
                                                error={Boolean(touched.name && errors.name)}
                                            />
                                        )}
                                        {touched.name && errors.name && (
                                            <FormHelperText error sx={{ px: 2, mx: 0 }}>
                                                {touched.name && errors.name}
                                            </FormHelperText>
                                        )}
                                        <Typography variant="caption" color="text.secondary">
                                            This is the value stored against a Pandit&apos;s profile — keep it lowercase, no spaces.
                                        </Typography>
                                    </Stack>
                                </FormControl>

                                <FormControl fullWidth>
                                    <Stack gap={1}>
                                        {languageLoading ? (
                                            <Skeleton variant="text" width={70} />
                                        ) : (
                                            <Typography variant="overline" htmlFor="label" color="text.primary" component={'label'}>
                                                Display Name
                                            </Typography>
                                        )}

                                        {languageLoading ? (
                                            <Skeleton variant="rounded" width="100%" height={56} />
                                        ) : (
                                            <TextField
                                                id="label"
                                                fullWidth
                                                placeholder="e.g. Hindi"
                                                {...getFieldProps('label')}
                                                error={Boolean(touched.label && errors.label)}
                                                helperText={touched.label && errors.label}
                                            />
                                        )}
                                    </Stack>
                                </FormControl>

                                <FormControl fullWidth>
                                    <Stack gap={1}>
                                        {languageLoading ? (
                                            <Skeleton variant="text" width={70} />
                                        ) : (
                                            <Typography variant="overline" htmlFor="order" color="text.primary" component={'label'}>
                                                Display Order
                                            </Typography>
                                        )}

                                        {languageLoading ? (
                                            <Skeleton variant="rounded" width="100%" height={56} />
                                        ) : (
                                            <TextField
                                                id="order"
                                                type="number"
                                                fullWidth
                                                {...getFieldProps('order')}
                                                error={Boolean(touched.order && errors.order)}
                                                helperText={touched.order && errors.order}
                                            />
                                        )}
                                    </Stack>
                                </FormControl>

                                <FormControl fullWidth sx={{ select: { textTransform: 'capitalize' } }}>
                                    <Stack gap={1}>
                                        {languageLoading ? (
                                            <Skeleton variant="text" width={70} />
                                        ) : (
                                            <Typography variant="overline" component={'label'} htmlFor="language-status">
                                                Status
                                            </Typography>
                                        )}
                                        {languageLoading ? (
                                            <Skeleton variant="rounded" width="100%" height={56} />
                                        ) : (
                                            <Select
                                                id="language-status"
                                                native
                                                {...getFieldProps('status')}
                                                error={Boolean(touched.status && errors.status)}
                                            >
                                                {STATUS_OPTIONS.map((status) => (
                                                    <option key={status} value={status} style={{ textTransform: 'capitalize' }}>
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
                            </Stack>
                        </Grid>
                        <Box sx={{ ml: 'auto' }}>
                            <Stack direction={'row'} gap={2}>
                                {languageLoading ? (
                                    <Skeleton variant="rounded" width="151px" height={56} sx={{ mt: 3 }} />
                                ) : (
                                    <Button variant="outlined" size="large" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                )}
                                {languageLoading ? (
                                    <Skeleton variant="rounded" width="151px" height={56} sx={{ mt: 3 }} />
                                ) : (
                                    <Button type="submit" variant="contained" size="large" loading={isLoading}>
                                        {currentLanguage ? 'Update Language' : 'Create Language'}
                                    </Button>
                                )}
                            </Stack>
                        </Box>
                    </Grid>
                </Form>
            </FormikProvider>
        </Box>
    );
}
LanguageForm.propTypes = { data: PropTypes.object, isLoading: PropTypes.bool };