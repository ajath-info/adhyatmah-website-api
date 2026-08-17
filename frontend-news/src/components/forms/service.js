'use client';
import React from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useRouter } from '@bprogress/next';

import { Form, FormikProvider, useFormik } from 'formik';

import {
  Card,
  Stack,
  CardHeader,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Skeleton
} from '@mui/material';
// api
import * as api from 'src/services';
import { useMutation, useQuery } from '@tanstack/react-query';

// Pooja types now come from the Master Service catalog (Admin -> Master
// Services) instead of a hardcoded list, so poojaType + price always stay
// in sync with the single source of truth. Only ACTIVE master services are
// selectable. Reuses the existing public getHomepagePoojaServicesAll API
// (already filtered to active-only) instead of adding a new endpoint.

const DURATION_OPTIONS = [
  "1-2 Hour",
  "2-3 Hours",
  "3-4 Hours",
  "4-5 Hours",
  "4-6 Hours",
  "Custom"
];

export default function ServiceForm({
  currentService,
  isLoading,
  isVendor
}) {
  const router = useRouter();

  // Fetch vendors for admin
  const { data: vendorsData } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => api.getVendorsByAdmin(),
    enabled: !isVendor
  });

  const vendors = vendorsData?.data || [];

  // Fetch ACTIVE master services for the poojaType dropdown - this is now
  // the single source of truth for which poojas can be offered and at
  // what price. Reuses the existing public homepage services API.
  const { data: masterServicesData } = useQuery({
    queryKey: ['active-master-services-for-service-form'],
    queryFn: () => api.getHomepagePoojaServicesAll('page=1&limit=200')
  });

  const masterServices = masterServicesData?.data || [];

  // If editing a service whose poojaType is no longer an active master
  // service (e.g. it was deactivated after this service was created),
  // still show it in the dropdown so the form doesn't render a blank
  // Select - it just won't be selectable as a "new" choice with a price.
  const poojaTypeOptions = React.useMemo(() => {
    const options = [...masterServices];
    if (
      currentService?.poojaType &&
      !options.some((ms) => ms.name === currentService.poojaType)
    ) {
      options.unshift({ name: currentService.poojaType, price: currentService.price, inactive: true });
    }
    return options;
  }, [masterServices, currentService]);

  const { mutate: createService, isPending: isCreating } = useMutation({
    mutationFn: isVendor ? api.createServiceByVendor : api.createServiceByAdmin,
    onSuccess: () => {
      toast.success('Pooja service created successfully!');
      router.push(isVendor ? '/vendor/services' : '/admin/services');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create service');
    }
  });

  const { mutate: updateService, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, ...data }) => isVendor
      ? api.updateServiceByVendor({ id, ...data })
      : api.updateServiceByAdmin({ id, ...data }),
    onSuccess: () => {
      toast.success('Pooja service updated successfully!');
      router.push(isVendor ? '/vendor/services' : '/admin/services');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update service');
    }
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      poojaType: currentService?.poojaType || '',
      description: currentService?.description || '',
      duration: currentService?.duration || '',
      price: currentService?.price || '',
      vendor: currentService?.vendor?._id || currentService?.vendor || ''
    },
    onSubmit: async (values) => {
      try {
        const payload = {
          ...values,
          price: parseFloat(values.price)
        };

        if (currentService) {
          updateService({ id: currentService._id, ...payload });
        } else {
          createService(payload);
        }
      } catch (error) {
        console.error(error);
      }
    }
  });

  const { handleSubmit, values, errors, touched, setFieldValue, getFieldProps } = formik;

  // Handle Pooja Type change and auto-populate price from the matching
  // active Master Service. Price itself stays read-only in the UI below -
  // the backend also independently derives it server-side.
  const handlePoojaTypeChange = (event) => {
    const selectedPoojaType = event.target.value;

    setFieldValue('poojaType', selectedPoojaType);

    const matchedMasterService = masterServices.find(
      (ms) => ms.name === selectedPoojaType
    );

    if (matchedMasterService) {
      setFieldValue('price', matchedMasterService.price);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader title={<Skeleton variant="text" width={200} />} />
        <CardContent>
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="rectangular" height={100} />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Card>
          <CardHeader title={currentService ? 'Edit Pandit Ji Service' : 'Add Pandit Ji Service'} />
          <CardContent>
            <Stack spacing={3}>
              {!isVendor && (
                <FormControl fullWidth error={Boolean(touched.vendor && errors.vendor)}>
                  <InputLabel>Vendor</InputLabel>
                  <Select
                    {...getFieldProps('vendor')}
                    label="Vendor"
                  >
                    {vendors.map((vendor) => (
                      <MenuItem key={vendor._id} value={vendor._id}>
                        {vendor.firstName} {vendor.lastName} ({vendor.email})
                      </MenuItem>
                    ))}
                  </Select>
                  {touched.vendor && errors.vendor && (
                    <FormHelperText>{errors.vendor}</FormHelperText>
                  )}
                </FormControl>
              )}

              <FormControl fullWidth error={Boolean(touched.poojaType && errors.poojaType)}>
                <InputLabel>Pooja Type</InputLabel>
                <Select
                  {...getFieldProps('poojaType')}
                  label="Pooja Type"
                  onChange={handlePoojaTypeChange}
                >
                  {poojaTypeOptions.map((ms) => (
                    <MenuItem key={ms.name} value={ms.name} disabled={ms.inactive}>
                      {ms.name}{ms.inactive ? ' (inactive master service)' : ''}
                    </MenuItem>
                  ))}
                </Select>
                {touched.poojaType && errors.poojaType && (
                  <FormHelperText>{errors.poojaType}</FormHelperText>
                )}
                {!touched.poojaType && (
                  <FormHelperText>
                    Only active Master Services can be selected. Manage the catalog under Admin → Master Services.
                  </FormHelperText>
                )}
              </FormControl>

              <TextField
                {...getFieldProps('price')}
                fullWidth
                label="Price (₹)"
                type="number"
                error={Boolean(touched.price && errors.price)}
                helperText={
                  (touched.price && errors.price) ||
                  'Auto-filled from the Master Service price. Not editable here.'
                }
                placeholder="Select a pooja type to auto-fill the price"
                disabled
                slotProps={{ input: { readOnly: true } }}
              />

              <FormControl fullWidth error={Boolean(touched.duration && errors.duration)}>
                <InputLabel>Duration</InputLabel>
                <Select
                  {...getFieldProps('duration')}
                  label="Duration"
                >
                  {DURATION_OPTIONS.map((duration) => (
                    <MenuItem key={duration} value={duration}>
                      {duration}
                    </MenuItem>
                  ))}
                </Select>
                {touched.duration && errors.duration && (
                  <FormHelperText>{errors.duration}</FormHelperText>
                )}
              </FormControl>

              <TextField
                {...getFieldProps('description')}
                fullWidth
                multiline
                rows={4}
                label="Description"
                error={Boolean(touched.description && errors.description)}
                helperText={touched.description && errors.description}
                placeholder="Enter service description"
              />

              <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/vendor/services')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isCreating || isUpdating}
                >
                  {isCreating || isUpdating ? 'Processing...' : (currentService ? 'Update Service' : 'Create Service')}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Form>
    </FormikProvider>
  );
}

ServiceForm.propTypes = {
  currentService: PropTypes.object,
  isLoading: PropTypes.bool,
  isVendor: PropTypes.bool
};