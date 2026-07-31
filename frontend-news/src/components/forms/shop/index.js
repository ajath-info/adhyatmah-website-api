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
  Skeleton,
  FormControl,
  Typography,
  Select,
  TextField,
  Box
} from '@mui/material';

import { Form, FormikProvider, useFormik } from 'formik';
import { useRouter } from '@bprogress/next';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import ShopDetailsForm from '@/components/forms/shop/shop-details';
import PanditDetailsForm from '@/components/forms/shop/pandit-details';
import { signIn, updateUserRole } from '@/redux/slices/user';
import * as api from 'src/services';
import IdentityVerificationForm from '@/components/forms/shop/identity-verification';
import FinancialDetailsForm from '@/components/forms/shop/financial-details';
import { useUploadSingleFile } from '@/hooks/use-upload-file';
import { setCookie } from '@/hooks/use-cookies';
import { panditProfileSchema, shopSettingsSchema } from '@/validations';

const STATUS_OPTIONS = ['pending', 'approved', 'in review', 'action required', 'cancel', 'closed'];
export default function ShopForm({ isShopLoading, shop, type }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.user);
  const isCreatingShop = type === 'create-shop';
  const isVendor = type === 'vendor';
  const isAdmin = type === 'admin';
  const isGuestCreatingPandit = isCreatingShop && !isAuthenticated;
  const [state, setstate] = useState({
    logoLoading: false,
    governmentIdLoading: false,
    proofOfAddressLoading: false,
    vendorAgreementLoading: false,
    name: '',
    search: '',
    open: false
  });

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: isAdmin
      ? api.updateShopByAdmin
      : isVendor
        ? api.updateShopByVendor
        : isGuestCreatingPandit
          ? api.createPanditProfileAsGuest
          : api.addShopByUser,
    retry: false,
    onSuccess: async (data) => {
      if (isCreatingShop) {
        if (isGuestCreatingPandit && data?.token && data?.user) {
          dispatch(signIn({ ...data.user, role: 'vendor', isVerified: true }));
          await setCookie('token', data.token);
        } else {
          dispatch(updateUserRole());
        }
        toast.success('Pandit profile created successfully!');
        router.push('/vendor/dashboard');
      } else if (isAdmin) {
        toast.success('Pandit profile updated!');
        router.push('/admin/shops');
      } else {
        router.push('/vendor/shops');
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || 'Something went wrong!');
    }
  });
  // ✅ use mutateAsync for delete
  const { mutateAsync: deleteMutate } = useMutation({
    mutationFn: api.singleDeleteFile,
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong!');
    }
  });

  const { mutate: uploadMutate } = useUploadSingleFile(
    async (data, variables) => {
      const { field } = variables; // ✅ comes from mutate({..., field})
      const split = field.split('.');

      // delete previous if exists (best-effort — guests may not have auth for delete)
      let prevId;
      if (split.length > 1) {
        prevId = values[split[0]]?.[split[1]]?._id;
      } else {
        prevId = values[field]?._id;
      }

      if (prevId) {
        try {
          await deleteMutate(prevId);
        } catch (err) {
          console.warn('Failed to delete previous image:', err);
        }
      }

      setFieldValue(field, { _id: data.public_id, url: data.secure_url });

      // ✅ functional update to avoid reset
      setstate((prev) => ({
        ...prev,
        [`${split.length > 1 ? split[1] : split[0]}Loading`]: false
      }));
    },
    (error, variables) => {
      console.error(error);
      const { field } = variables;
      const split = field.split('.');

      // Clear temporary local preview if Cloudinary upload failed
      if (field === 'logo' && values?.logo && !values.logo._id) {
        setFieldValue('logo', null);
      }

      setstate((prev) => ({
        ...prev,
        [`${split.length > 1 ? split[1] : split[0]}Loading`]: false
      }));
    }
  );
  const handleDrop = (acceptedFiles, field) => {
    const file = acceptedFiles[0];
    if (!file) return;

    Object.assign(file, { preview: URL.createObjectURL(file) });

    const split = field.split('.');
    const loadingKey = `${split.length > 1 ? split[1] : split[0]}Loading`;

    // Show local preview immediately while Cloudinary upload runs
    if (field === 'logo') {
      setFieldValue('logo', { _id: null, url: file.preview });
    }

    setstate((prev) => ({
      ...prev,
      [loadingKey]: 1
    }));

    uploadMutate({
      file,
      config: {
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percentage = Math.max(1, Math.floor((loaded * 100) / total));

          setstate((prev) => ({
            ...prev,
            [loadingKey]: percentage
          }));
        }
      },
      field
    });
  };

  const formik = useFormik({
    initialValues: {
      ...(isCreatingShop
        ? {
            logo: null,
            designation: [],
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            password: '',
            dateOfBirth: '',
            gender: '',
            gotra: '',
            pravar: '',
            veda: '',
            shakha: '',
            pankti: '',
            sutra: '',
            aadharNumber: '',
            services: [],
            language: [],
            experience: '',
            address: {
              streetAddress: '',
              country: 'India',
              state: '',
              city: ''
            },
            pincode: '',
            referralCode: ''
          }
        : {
            logo: shop?.logo,
            name: shop?.name ?? '',
            slug: shop?.slug ?? '',
            metaTitle: shop?.metaTitle ?? '',
            description: shop?.description ?? '',
            metaDescription: shop?.metaDescription ?? '',
            registrationNumber: shop?.registrationNumber ?? '',
            address: {
              country: shop?.address?.country ?? '',
              city: shop?.address?.city ?? '',
              state: shop?.address?.state ?? '',
              streetAddress: shop?.address?.streetAddress ?? ''
            },
            contactPerson: shop?.contactPerson ?? '',
            shopEmail: shop?.shopEmail ?? '',
            shopPhone: shop?.shopPhone ?? '',
            website: shop?.website ?? '',
            taxIdentificationNumber: shop?.taxIdentificationNumber ?? '',
            vatRegistrationNumber: shop?.vatRegistrationNumber ?? '',
            identityVerification: {
              governmentId: shop?.identityVerification?.governmentId ?? null,
              proofOfAddress: shop?.identityVerification?.proofOfAddress ?? null
            },

            // Pandit sign-up / personal details (editable by admin & vendor)
            designation: Array.isArray(shop?.designation)
              ? shop.designation
              : shop?.designation
                ? [shop.designation]
                : [],
            firstName: shop?.firstName ?? '',
            lastName: shop?.lastName ?? '',
            phone: shop?.phone ?? '',
            email: shop?.email ?? '',
            dateOfBirth: shop?.dateOfBirth ? String(shop.dateOfBirth).slice(0, 10) : '',
            gender: shop?.gender ?? '',
            gotra: shop?.gotra ?? '',
            pravar: shop?.pravar ?? '',
            veda: shop?.veda ?? '',
            shakha: shop?.shakha ?? '',
            pankti: shop?.pankti ?? '',
            sutra: shop?.sutra ?? '',
            aadharNumber: shop?.aadharNumber ?? '',
            services: shop?.services ?? [],
            language: shop?.language ?? [],
            experience: shop?.experience ?? '',
            pincode: shop?.pincode ?? '',
            referralCode: shop?.referralCode ?? ''
          }),
      financialDetails: isVendor
        ? {
            paymentMethod: shop?.financialDetails?.paymentMethod ?? 'paypal',
            paypal: {
              email: shop?.financialDetails?.paypal?.email ?? ''
            },
            bank: {
              accountNumber: shop?.financialDetails?.bank?.accountNumber ?? '',
              bankName: shop?.financialDetails?.bank?.bankName ?? '',
              holderName: shop?.financialDetails?.bank?.holderName ?? '',
              holderEmail: shop?.financialDetails?.bank?.holderEmail ?? '',
              address: shop?.financialDetails?.bank?.address ?? '',
              routingNumber: shop?.financialDetails?.bank?.routingNumber ?? '',
              swiftCode: shop?.financialDetails?.bank?.swiftCode ?? ''
            }
          }
        : undefined,

      ...(isAdmin && {
        status: shop ? shop.status : STATUS_OPTIONS[0], // Only include message if shop exists
        message:
          shop?.status === 'cancel' || shop?.status === 'closed' || shop?.status === 'action required'
            ? shop.message
            : ''
      })
    },
    enableReinitialize: true,
    validationSchema: isCreatingShop ? panditProfileSchema : shopSettingsSchema(isVendor),
    onSubmit: async (values) => {
      const { ...rest } = values;

      try {
        mutate({
          ...(!isCreatingShop && {
            currentSlug: shop?.slug
          }),
          ...rest
        });
      } catch (error) {
        console.error(error);
      }
    }
  });
  const { setFieldValue, handleSubmit, values, touched, errors, getFieldProps } = formik;

  const handleNameChange = (event) => {
    const title = event.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]+/g, '')
      .replace(/\s+/g, '-'); // convert to lowercase, remove special characters, and replace spaces with hyphens
    formik.setFieldValue('slug', slug); // set the value of slug in the formik state
    formik.handleChange(event); // handle the change in formik
  };
  React.useEffect(() => {
    if (values.status === 'approved' || values.status === 'pending' || values.status === 'in review') {
      setFieldValue('message', ''); // Set message to empty string
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.status]);

  if (isCreatingShop) {
    return (
      <FormikProvider value={formik}>
        <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <Card>
            <CardHeader
              title={<>{isShopLoading ? <Skeleton variant="text" height={28} width={240} /> : 'Pandit details'}</>}
            />
            <CardContent>
              <Stack gap={3}>
                <ShopDetailsForm
                  isLoading={isShopLoading}
                  handleDrop={handleDrop}
                  handleNameChange={handleNameChange}
                  state={state}
                  formik={formik}
                  photoOnly
                />
                <PanditDetailsForm isLoading={isShopLoading} formik={formik} />
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                  <Button type="submit" variant="contained" size="large" loading={isLoading} sx={{ minWidth: 280 }}>
                    Create Pandit Profile
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Form>
      </FormikProvider>
    );
  }

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid
            size={{
              md: 8
            }}
          >
            <Card>
              <CardHeader
                title={<>{isShopLoading ? <Skeleton variant="text" height={28} width={240} /> : 'Pandit details'}</>}
              />

              <CardContent>
                <Stack gap={3}>
                  <ShopDetailsForm
                    isLoading={isShopLoading}
                    handleDrop={handleDrop}
                    handleNameChange={handleNameChange}
                    state={state}
                    formik={formik}
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardHeader
                title={<>{isShopLoading ? <Skeleton variant="text" height={28} width={240} /> : 'Pandit Details'}</>}
              />
              <CardContent>
                <PanditDetailsForm isLoading={isShopLoading} formik={formik} showPassword={false} />
              </CardContent>
            </Card>
          </Grid>
          <Grid
            size={{
              md: 4
            }}
          >
            <Stack gap={2}>
              <Card>
                <CardHeader
                  title={
                    <>{isShopLoading ? <Skeleton variant="text" height={28} width={240} /> : 'Identity Verification'}</>
                  }
                />
                <CardContent>
                  <IdentityVerificationForm
                    isLoading={isShopLoading}
                    handleDrop={handleDrop}
                    handleNameChange={handleNameChange}
                    state={state}
                    formik={formik}
                  />
                </CardContent>
              </Card>
              {isVendor && (
                <Card>
                  <CardHeader
                    title={
                      <>{isShopLoading ? <Skeleton variant="text" height={28} width={240} /> : 'Financial Details'}</>
                    }
                  />
                  <CardContent>
                    <FinancialDetailsForm isLoading={isShopLoading} state={state} formik={formik} />
                  </CardContent>
                </Card>
              )}
              {isAdmin && (
                <Card>
                  <CardContent>
                    <Stack spacing={2}>
                      <FormControl fullWidth sx={{ select: { textTransform: 'capitalize' } }}>
                        <Stack gap={1}>
                          {isShopLoading ? (
                            <Skeleton variant="text" width={70} />
                          ) : (
                            <Typography variant="overline" component={'label'} htmlFor="status">
                              Status
                            </Typography>
                          )}
                          {isShopLoading ? (
                            <Skeleton variant="rectangular" width="100%" height={56} />
                          ) : (
                            <Select
                              id="status"
                              native
                              {...getFieldProps('status')}
                              error={Boolean(touched.status && errors.status)}
                            >
                              <option value="" style={{ display: 'none' }} />
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
                      {(values.status === 'cancel' ||
                        values.status === 'closed' ||
                        values.status === 'action required') && (
                        <Stack gap={1}>
                          {isShopLoading ? (
                            <Skeleton variant="text" width={150} />
                          ) : (
                            <Typography variant="overline" component={'label'} htmlFor="message">
                              Message
                            </Typography>
                          )}
                          {isShopLoading ? (
                            <Skeleton variant="rectangular" width="100%" height={240} />
                          ) : (
                            <TextField
                              id="message"
                              fullWidth
                              {...getFieldProps('message')}
                              error={Boolean(touched.message && errors.message)}
                              helperText={touched.message && errors.message}
                              rows={4}
                              multiline
                            />
                          )}
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}
              <Button type="submit" variant="contained" fullWidth size="large" loading={isLoading}>
                Update Pandit Profile
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Form>
    </FormikProvider>
  );
}