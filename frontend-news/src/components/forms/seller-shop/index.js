'use client';

import * as React from 'react';
import { useState } from 'react';

import {
    Grid,
    Card,
    CardHeader,
    CardContent,
    Stack,
    Button,
    FormHelperText,
    TextField,
    Typography,
    InputAdornment,
    IconButton,
    Box
} from '@mui/material';

import { Form, FormikProvider, useFormik } from 'formik';
import { useRouter } from '@bprogress/next';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MdLock, MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md';

import UploadAvatar from '@/components/upload/upload-avatar';
import PhoneInputField from 'src/components/phone-input-field';
import countries from 'src/data/countries.json';
import { signIn, updateUserRole } from '@/redux/slices/user';
import * as api from 'src/services';
import { useUploadSingleFile } from '@/hooks/use-upload-file';
import { setCookie } from '@/hooks/use-cookies';
import { sellerShopSchema } from '@/validations';

// Lightweight "Sell Products" shop creation form.
// Deliberately independent from ShopForm (the Become a Pandit flow) so that
// flow remains completely untouched. Collects only the basics a normal
// product seller needs: name, contact details, shop name/logo, address.
export default function SellerShopForm() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state) => state.user);
    const isGuest = !isAuthenticated;
    const [showPassword, setShowPassword] = useState(false);
    const [logoLoading, setLogoLoading] = useState(false);

    const { mutate, isPending: isLoading } = useMutation({
        mutationFn: isGuest ? api.createSellerShopAsGuest : api.addShopByUser,
        retry: false,
        onSuccess: async (data) => {
            if (isGuest && data?.token && data?.user) {
                dispatch(signIn({ ...data.user, role: 'vendor', isVerified: true }));
                await setCookie('token', data.token);
            } else {
                dispatch(updateUserRole());
            }
            toast.success('Shop created successfully!');
            router.push('/vendor/dashboard');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || error?.message || 'Something went wrong!');
        }
    });

    const { mutateAsync: deleteMutate } = useMutation({
        mutationFn: api.singleDeleteFile,
        onError: () => { }
    });

    const { mutate: uploadMutate } = useUploadSingleFile(
        async (data) => {
            const prevId = formik.values?.logo?._id;
            if (prevId) {
                try {
                    await deleteMutate(prevId);
                } catch (err) {
                    console.warn('Failed to delete previous image:', err);
                }
            }
            formik.setFieldValue('logo', { _id: data.public_id, url: data.secure_url });
            setLogoLoading(false);
        },
        () => {
            if (formik.values?.logo && !formik.values.logo._id) {
                formik.setFieldValue('logo', null);
            }
            setLogoLoading(false);
        }
    );

    const handleLogoDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;
        Object.assign(file, { preview: URL.createObjectURL(file) });
        formik.setFieldValue('logo', { _id: null, url: file.preview });
        setLogoLoading(true);
        uploadMutate({ file });
    };

    const formik = useFormik({
        initialValues: {
            logo: null,
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            password: '',
            name: '',
            address: {
                streetAddress: '',
                country: 'India',
                state: '',
                city: ''
            },
            pincode: ''
        },
        validationSchema: sellerShopSchema,
        onSubmit: (values) => {
            const { logo, ...rest } = values;
            mutate({
                ...rest,
                logo: logo?.url ? logo : undefined,
                // Give the shop sensible defaults derived from the shop name
                // instead of the Pandit-flow fallback text, without needing any
                // backend changes (createShopByUser already accepts these fields).
                metaTitle: values.name,
                description: `${values.name} — Online Store`,
                metaDescription: `${values.name} — Online Store`,
                shopEmail: values.email,
                shopPhone: values.phone,
                // Marks this as a product-selling shop (not a Pandit shop) so the
                // vendor sidebar and admin panel can tell the two apart.
                shopType: 'seller'
            });
        }
    });

    const { values, errors, touched, getFieldProps, setFieldValue, handleSubmit } = formik;

    const renderLabel = (label, required = false) => (
        <Typography variant="overline" component="label">
            {label} {required && <Typography component="span" color="error">*</Typography>}
        </Typography>
    );

    return (
        <FormikProvider value={formik}>
            <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                <Card>
                    <CardHeader title="Shop details" />
                    <CardContent>
                        <Stack gap={3}>
                            <Stack spacing={1}>
                                <UploadAvatar
                                    title="Upload shop logo"
                                    accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] }}
                                    file={values?.logo?.url}
                                    loading={logoLoading}
                                    maxSize={3145728}
                                    onDrop={handleLogoDrop}
                                />
                            </Stack>

                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Stack gap={1}>
                                        {renderLabel('First Name', true)}
                                        <TextField
                                            fullWidth
                                            {...getFieldProps('firstName')}
                                            error={Boolean(touched?.firstName && errors?.firstName)}
                                            helperText={touched?.firstName && errors?.firstName}
                                        />
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Stack gap={1}>
                                        {renderLabel('Last Name', true)}
                                        <TextField
                                            fullWidth
                                            {...getFieldProps('lastName')}
                                            error={Boolean(touched?.lastName && errors?.lastName)}
                                            helperText={touched?.lastName && errors?.lastName}
                                        />
                                    </Stack>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Stack gap={1}>
                                        {renderLabel('Phone Number', true)}
                                        <PhoneInputField
                                            error={touched?.phone && errors?.phone}
                                            onChange={(val) => setFieldValue('phone', val)}
                                            value={values.phone}
                                        />
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Stack gap={1}>
                                        {renderLabel('Email', true)}
                                        <TextField
                                            fullWidth
                                            {...getFieldProps('email')}
                                            error={Boolean(touched?.email && errors?.email)}
                                            helperText={touched?.email && errors?.email}
                                        />
                                    </Stack>
                                </Grid>

                                {isGuest && (
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Stack gap={1}>
                                            {renderLabel('Password', true)}
                                            <TextField
                                                fullWidth
                                                type={showPassword ? 'text' : 'password'}
                                                {...getFieldProps('password')}
                                                error={Boolean(touched?.password && errors?.password)}
                                                helperText={touched?.password && errors?.password}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <MdLock />
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                                                                {showPassword ? <MdOutlineVisibilityOff /> : <MdOutlineVisibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Stack>
                                    </Grid>
                                )}

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Stack gap={1}>
                                        {renderLabel('Shop Name', true)}
                                        <TextField
                                            fullWidth
                                            {...getFieldProps('name')}
                                            error={Boolean(touched?.name && errors?.name)}
                                            helperText={touched?.name && errors?.name}
                                        />
                                    </Stack>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Stack gap={1}>
                                        {renderLabel('Address')}
                                        <TextField fullWidth {...getFieldProps('address.streetAddress')} />
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Stack gap={1}>
                                        {renderLabel('Country')}
                                        <TextField
                                            select
                                            fullWidth
                                            SelectProps={{ native: true }}
                                            {...getFieldProps('address.country')}
                                        >
                                            <option value="">Select Country</option>
                                            {countries.map((option) => (
                                                <option key={option.code} value={option.label}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </TextField>
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Stack gap={1}>
                                        {renderLabel('State')}
                                        <TextField fullWidth {...getFieldProps('address.state')} />
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Stack gap={1}>
                                        {renderLabel('City')}
                                        <TextField fullWidth {...getFieldProps('address.city')} />
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Stack gap={1}>
                                        {renderLabel('Pincode')}
                                        <TextField fullWidth {...getFieldProps('pincode')} />
                                    </Stack>
                                </Grid>
                            </Grid>

                            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                                <Button type="submit" variant="contained" size="large" loading={isLoading} sx={{ minWidth: 280 }}>
                                    Create Shop
                                </Button>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Form>
        </FormikProvider>
    );
}