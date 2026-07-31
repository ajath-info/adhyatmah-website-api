'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Skeleton,
  Chip,
  Stack,
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput
} from '@mui/material';
import { MdEdit, MdClose } from 'react-icons/md';
import { fDate } from '@/utils/format-time';
import * as api from 'src/services';

const DESIGNATION_OPTIONS = [
  'आचार्य',
  'पंडित',
  'पुरोहित',
  'पुजारी',
  'शास्त्री',
  'ज्योतिषाचार्य',
  'वेदाचार्य',
  'कथा वाचक',
  'यज्ञाचार्य',
  'धर्माचार्य'
];

const LANGUAGE_OPTIONS = [
  'hindi',
  'english',
  'marathi',
  'sanskrit',
  'bangali',
  'gujarati',
  'odia',
  'tamil',
  'telugu',
  'kannada',
  'malayalam',
  'others'
];

const GENDER_OPTIONS = ['male', 'female', 'other'];

// Fields on the User document that admin is allowed to edit here.
// `key` must match the User schema field name.
const EDITABLE_USER_FIELDS = [
  { key: 'firstName', label: 'First Name', type: 'text' },
  { key: 'lastName', label: 'Last Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'phone', label: 'Phone', type: 'text' },
  { key: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS },
  { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
  { key: 'about', label: 'Designation', type: 'multiselect', options: DESIGNATION_OPTIONS },
  { key: 'experience', label: 'Experience', type: 'text' },
  { key: 'language', label: 'Languages', type: 'multiselect', options: LANGUAGE_OPTIONS },
  { key: 'gotra', label: 'Gotra', type: 'text' },
  { key: 'pravar', label: 'Prawar', type: 'text' },
  { key: 'veda', label: 'Veda', type: 'text' },
  { key: 'shakha', label: 'Shakha', type: 'text' },
  { key: 'pankti', label: 'Pankti', type: 'text' },
  { key: 'sutra', label: 'Sutra', type: 'text' },
  { key: 'aadhar', label: 'Aadhaar', type: 'text' },
  { key: 'address', label: 'Address', type: 'text' },
  { key: 'city', label: 'City', type: 'text' },
  { key: 'state', label: 'State', type: 'text' },
  { key: 'country', label: 'Country', type: 'text' },
  { key: 'zip', label: 'Pincode', type: 'text' }
];

const toDateInputValue = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    if (value.url) return value.url;
    const nested = Object.entries(value)
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`);
    return nested.length ? nested.join(' | ') : '—';
  }
  if (value instanceof Date || (typeof value === 'string' && !Number.isNaN(Date.parse(value)) && value.includes('-'))) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime()) && String(value).length >= 8) {
      return fDate(value);
    }
  }
  return String(value);
};

const Field = ({ label, value, isLoading }) => (
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <Typography variant="overline" color="text.secondary">
      {label}
    </Typography>
    {isLoading ? (
      <Skeleton variant="text" width="80%" />
    ) : (
      <Typography variant="body1">{formatValue(value)}</Typography>
    )}
  </Grid>
);

Field.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  isLoading: PropTypes.bool
};

const EditableField = ({ field, value, onChange }) => {
  if (field.type === 'select') {
    return (
      <FormControl fullWidth size="small">
        <InputLabel id={`${field.key}-label`}>{field.label}</InputLabel>
        <Select
          labelId={`${field.key}-label`}
          label={field.label}
          value={value || ''}
          onChange={(e) => onChange(field.key, e.target.value)}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {field.options.map((option) => (
            <MenuItem key={option} value={option} sx={{ textTransform: 'capitalize' }}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  if (field.type === 'multiselect') {
    const selected = Array.isArray(value) ? value : [];
    return (
      <FormControl fullWidth size="small">
        <InputLabel id={`${field.key}-label`}>{field.label}</InputLabel>
        <Select
          labelId={`${field.key}-label`}
          label={field.label}
          multiple
          value={selected}
          onChange={(e) => {
            const val = e.target.value;
            onChange(field.key, typeof val === 'string' ? val.split(',') : val);
          }}
          input={<OutlinedInput label={field.label} />}
          renderValue={(vals) => vals.join(', ')}
        >
          {field.options.map((option) => (
            <MenuItem key={option} value={option} sx={{ textTransform: 'capitalize' }}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  if (field.type === 'date') {
    return (
      <TextField
        fullWidth
        size="small"
        type="date"
        label={field.label}
        value={toDateInputValue(value)}
        onChange={(e) => onChange(field.key, e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
    );
  }

  return (
    <TextField
      fullWidth
      size="small"
      label={field.label}
      value={value ?? ''}
      onChange={(e) => onChange(field.key, e.target.value)}
    />
  );
};

EditableField.propTypes = {
  field: PropTypes.object.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired
};

export default function VendorProfileDetails({ user, isLoading, embedded = false }) {
  const shop = user?.shop;
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({});

  const { mutate, isPending: isSaving } = useMutation({
    mutationFn: api.updateUserDetailsByAdmin,
    onSuccess: (res) => {
      toast.success(res?.message || 'Vendor details updated.');
      queryClient.invalidateQueries({ queryKey: ['user-details', user?._id] });
      setIsEditing(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Something went wrong!');
    }
  });

  const handleEditStart = () => {
    const initial = {};
    EDITABLE_USER_FIELDS.forEach(({ key }) => {
      if (key === 'about') {
        initial[key] = user?.about
          ? user.about.split(',').map((item) => item.trim()).filter(Boolean)
          : [];
        return;
      }
      initial[key] = user?.[key] ?? (key === 'language' ? [] : '');
    });
    setFormValues(initial);
    setIsEditing(true);
  };

  const handleFieldChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    const payload = { ...formValues };
    if (Array.isArray(payload.about)) {
      payload.about = payload.about.join(', ');
    }
    mutate({ id: user._id, ...payload });
  };

  const userFields = [
    { label: 'First Name', value: user?.firstName },
    { label: 'Last Name', value: user?.lastName },
    { label: 'Email', value: user?.email },
    { label: 'Phone', value: user?.phone },
    { label: 'Role', value: user?.role },
    { label: 'Status', value: user?.status },
    { label: 'Gender', value: user?.gender },
    { label: 'Date of Birth', value: user?.dateOfBirth },
    { label: 'Designation', value: shop?.designation || user?.about },
    { label: 'Experience', value: user?.experience },
    { label: 'Languages', value: user?.language },
    { label: 'Gotra', value: user?.gotra },
    { label: 'Prawar', value: user?.pravar },
    { label: 'Veda', value: user?.veda },
    { label: 'Shakha', value: user?.shakha },
    { label: 'Pankti', value: user?.pankti },
    { label: 'Sutra', value: user?.sutra },
    { label: 'Aadhaar', value: user?.aadhar },
    { label: 'Address', value: user?.address },
    { label: 'City', value: user?.city },
    { label: 'State', value: user?.state },
    { label: 'Country', value: user?.country },
    { label: 'Pincode', value: user?.zip },
    { label: 'Referral Code', value: user?.referral_code },
    { label: 'Device Type', value: user?.deviceType },
    { label: 'Registered On', value: user?.createdAt },
    { label: 'Last Updated', value: user?.updatedAt }
  ];

  const shopFields = shop
    ? [
        { label: 'Shop Name', value: shop?.name },
        { label: 'First Name', value: shop?.firstName },
        { label: 'Last Name', value: shop?.lastName },
        { label: 'Designation', value: shop?.designation },
        { label: 'Shop Email', value: shop?.shopEmail || shop?.email },
        { label: 'Shop Phone', value: shop?.shopPhone || shop?.phone },
        { label: 'Gender', value: shop?.gender },
        { label: 'Date of Birth', value: shop?.dateOfBirth },
        { label: 'Shop Status', value: shop?.status },
        { label: 'Experience', value: shop?.experience },
        { label: 'Languages', value: shop?.language },
        { label: 'Services', value: shop?.services },
        { label: 'Gotra', value: shop?.gotra },
        { label: 'Prawar', value: shop?.pravar },
        { label: 'Veda', value: shop?.veda },
        { label: 'Shakha', value: shop?.shakha },
        { label: 'Pankti', value: shop?.pankti },
        { label: 'Sutra', value: shop?.sutra },
        { label: 'Aadhaar', value: shop?.aadharNumber },
        { label: 'Address', value: shop?.address?.streetAddress },
        { label: 'City', value: shop?.address?.city },
        { label: 'State', value: shop?.address?.state },
        { label: 'Country', value: shop?.address?.country },
        { label: 'Pincode', value: shop?.pincode },
        { label: 'Contact Person', value: shop?.contactPerson },
        { label: 'Website', value: shop?.website },
        { label: 'Description', value: shop?.description },
        { label: 'Registration Number', value: shop?.registrationNumber },
        { label: 'Referral Code', value: shop?.referralCode },
        { label: 'Tax ID', value: shop?.taxIdentificationNumber },
        { label: 'VAT Registration', value: shop?.vatRegistrationNumber },
        { label: 'Payment Method', value: shop?.financialDetails?.paymentMethod },
        { label: 'PayPal Email', value: shop?.financialDetails?.paypal?.email },
        { label: 'Bank Name', value: shop?.financialDetails?.bank?.bankName },
        { label: 'Account Holder', value: shop?.financialDetails?.bank?.holderName },
        { label: 'Account Number', value: shop?.financialDetails?.bank?.accountNumber },
        { label: 'Government ID', value: shop?.identityVerification?.governmentId },
        { label: 'Proof of Address', value: shop?.identityVerification?.proofOfAddress },
        { label: 'Rating', value: shop?.rating },
        { label: 'Rating Count', value: shop?.ratingCount },
        { label: 'Created On', value: shop?.createdAt },
        { label: 'Last Updated', value: shop?.updatedAt }
      ]
    : [];

  const roleChips =
    !isLoading && user?.role ? (
      <Stack direction="row" spacing={1} sx={{ mb: embedded ? 2 : 0.5, mt: embedded ? 0 : 0.5 }}>
        <Chip size="small" label={user.role} color="primary" variant="outlined" />
        {user?.status && <Chip size="small" label={user.status} variant="outlined" />}
      </Stack>
    ) : null;

  const editToggle =
    !isLoading && user ? (
      isEditing ? (
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<MdClose />} onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="small" variant="contained" onClick={handleSave} loading={isSaving}>
            Save Changes
          </Button>
        </Stack>
      ) : (
        <Button size="small" variant="outlined" startIcon={<MdEdit />} onClick={handleEditStart}>
          Edit Details
        </Button>
      )
    ) : null;

  const detailsContent = (
    <>
      {embedded && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ sm: 'center' }}>
          {roleChips}
          {editToggle}
        </Stack>
      )}

      {isEditing ? (
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {EDITABLE_USER_FIELDS.map((field) => (
            <Grid key={field.key} size={{ xs: 12, sm: 6, md: 4 }}>
              <EditableField field={field} value={formValues[field.key]} onChange={handleFieldChange} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {userFields.map((field) => (
            <Field key={`user-${field.label}`} {...field} isLoading={isLoading} />
          ))}
        </Grid>
      )}

      {shopFields.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Pandit Profile (Shop)
          </Typography>
          <Grid container spacing={2}>
            {shopFields.map((field) => (
              <Field key={`shop-${field.label}`} {...field} isLoading={isLoading} />
            ))}
          </Grid>
        </>
      )}
    </>
  );

  if (embedded) {
    return <Box>{detailsContent}</Box>;
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader title="Vendor Details" subheader={roleChips} action={editToggle} />
      <CardContent>{detailsContent}</CardContent>
    </Card>
  );
}

VendorProfileDetails.propTypes = {
  user: PropTypes.object,
  isLoading: PropTypes.bool,
  embedded: PropTypes.bool
};