'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Skeleton,
  Dialog,
  DialogContent,
  List,
  ListItemButton,
  Radio,
  Button,
  InputAdornment,
  Checkbox,
  Chip,
  IconButton
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { MdLock, MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md';

import PhoneInputField from 'src/components/phone-input-field';
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

const FALLBACK_LANGUAGE_OPTIONS = [
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

function DesignationSelect({ id, value, onChange, error, helperText }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(Array.isArray(value) ? value : value ? [value] : []);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setSelected(Array.isArray(value) ? value : value ? [value] : []);
  }, [value, open]);

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return DESIGNATION_OPTIONS;
    return DESIGNATION_OPTIONS.filter((option) => option.toLowerCase().includes(query));
  }, [search]);

  const toggleOption = (option) => {
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const handleConfirm = () => {
    onChange(selected);
    setOpen(false);
    setSearch('');
  };

  const handleClose = () => {
    setOpen(false);
    setSearch('');
  };

  const displayValue = Array.isArray(value) ? value.join(', ') : value || '';

  return (
    <>
      <TextField
        id={id}
        fullWidth
        value={displayValue}
        placeholder="Select Your Designation"
        onClick={() => setOpen(true)}
        error={error}
        helperText={helperText}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <Box
                component="svg"
                viewBox="0 0 24 24"
                sx={{ width: 22, height: 22, fill: 'none', stroke: 'currentColor', color: 'text.secondary' }}
              >
                <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Box>
            </InputAdornment>
          )
        }}
        sx={{
          cursor: 'pointer',
          '& .MuiInputBase-input': { cursor: 'pointer' }
        }}
      />

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6" align="center">
              Designation <Typography component="span" color="error">*</Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Select Your Designation
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Search designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <List
              sx={{
                maxHeight: 360,
                overflowY: 'auto',
                p: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5
              }}
            >
              {filteredOptions.length ? (
                filteredOptions.map((option) => (
                  <ListItemButton
                    key={option}
                    onClick={() => toggleOption(option)}
                    sx={{
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      px: 2,
                      py: 1.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Typography>{option}</Typography>
                    <Checkbox
                      checked={selected.includes(option)}
                      sx={{ color: 'success.main', '&.Mui-checked': { color: 'success.main' } }}
                    />
                  </ListItemButton>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                  No designations found
                </Typography>
              )}
            </List>
            <Button
              fullWidth
              variant="contained"
              disabled={!selected.length}
              onClick={handleConfirm}
              sx={{
                bgcolor: '#fb8b05',
                py: 1.5,
                borderRadius: 1,
                '&:hover': { bgcolor: '#d06a1a' }
              }}
            >
              Select
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function PanditDetailsForm({ formik, isLoading, showPassword: showPasswordField = true }) {
  const { values, errors, touched, getFieldProps, setFieldValue } = formik;
  const [serviceOpen, setServiceOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['pooja-services-all'],
    queryFn: () => api.getHomepagePoojaServicesAll('page=1&limit=100')
  });

  const { data: languagesData, isLoading: languagesLoading } = useQuery({
    queryKey: ['all-languages'],
    queryFn: api.getAllLanguages
  });

  const serviceOptions = useMemo(
    () => (servicesData?.data || []).map((service) => service.name).filter(Boolean),
    [servicesData]
  );

  const languageOptions = languagesData?.payload?.languages || FALLBACK_LANGUAGE_OPTIONS;

  const renderLabel = (label, required = false) =>
    isLoading ? (
      <Skeleton width={100} height={30} />
    ) : (
      <Typography variant="overline" component="label">
        {label} {required && <Typography component="span" color="error">*</Typography>}
      </Typography>
    );

  const renderTextField = (id, props = {}) =>
    isLoading ? (
      <Skeleton variant="rounded" height={56} width="100%" />
    ) : (
      <TextField id={id} fullWidth {...props} />
    );

  const fieldsLoading = isLoading || servicesLoading || languagesLoading;

  return (
    <Box>
      <Stack spacing={3}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('Designation', true)}
              {fieldsLoading ? (
                <Skeleton variant="rounded" height={56} width="100%" />
              ) : (
                <DesignationSelect
                  id="designation"
                  value={values.designation}
                  onChange={(val) => setFieldValue('designation', val)}
                  error={Boolean(touched?.designation && errors?.designation)}
                  helperText={touched?.designation && errors?.designation}
                />
              )}
            </Stack>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('First Name', true)}
              {renderTextField('firstName', {
                ...getFieldProps('firstName'),
                error: Boolean(touched?.firstName && errors?.firstName),
                helperText: touched?.firstName && errors?.firstName
              })}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('Last Name', true)}
              {renderTextField('lastName', {
                ...getFieldProps('lastName'),
                error: Boolean(touched?.lastName && errors?.lastName),
                helperText: touched?.lastName && errors?.lastName
              })}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('Phone Number', true)}
              {fieldsLoading ? (
                <Skeleton variant="rounded" height={56} width="100%" />
              ) : (
                <PhoneInputField
                  error={touched?.phone && errors?.phone}
                  onChange={(val) => setFieldValue('phone', val)}
                  value={values.phone}
                />
              )}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('Email', true)}
              {renderTextField('email', {
                ...getFieldProps('email'),
                error: Boolean(touched?.email && errors?.email),
                helperText: touched?.email && errors?.email
              })}
            </Stack>
          </Grid>

          {showPasswordField && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack gap={1}>
                {renderLabel('Password', true)}
                {fieldsLoading ? (
                  <Skeleton variant="rounded" height={56} width="100%" />
                ) : (
                  <TextField
                    id="password"
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
                )}
              </Stack>
            </Grid>
          )}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('DOB')}
              {renderTextField('dateOfBirth', {
                type: 'date',
                InputLabelProps: { shrink: true },
                ...getFieldProps('dateOfBirth'),
                error: Boolean(touched?.dateOfBirth && errors?.dateOfBirth),
                helperText: touched?.dateOfBirth && errors?.dateOfBirth
              })}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('Gender', true)}
              {fieldsLoading ? (
                <Skeleton variant="rounded" height={56} width="100%" />
              ) : (
                <TextField
                  id="gender"
                  select
                  fullWidth
                  {...getFieldProps('gender')}
                  error={Boolean(touched?.gender && errors?.gender)}
                  helperText={touched?.gender && errors?.gender}
                >
                  <MenuItem value="">Select Gender</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              )}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('Gotra')}
              {renderTextField('gotra', { ...getFieldProps('gotra') })}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('Prawar')}
              {renderTextField('pravar', { ...getFieldProps('pravar') })}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('Veda')}
              {renderTextField('veda', { ...getFieldProps('veda') })}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('Shakha')}
              {renderTextField('shakha', { ...getFieldProps('shakha') })}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('Pankti')}
              {renderTextField('pankti', { ...getFieldProps('pankti') })}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('Sutra')}
              {renderTextField('sutra', { ...getFieldProps('sutra') })}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('Aadhaar Number')}
              {renderTextField('aadharNumber', {
                ...getFieldProps('aadharNumber'),
                error: Boolean(touched?.aadharNumber && errors?.aadharNumber),
                helperText: touched?.aadharNumber && errors?.aadharNumber
              })}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('Select Service')}
              {fieldsLoading ? (
                <Skeleton variant="rounded" height={56} width="100%" />
              ) : (
                <TextField
                  id="services"
                  select
                  fullWidth
                  SelectProps={{
                    multiple: true,
                    displayEmpty: true,
                    open: serviceOpen,
                    onOpen: () => setServiceOpen(true),
                    onClose: () => setServiceOpen(false),
                    value: values.services || [],
                    onChange: (e) => {
                      // Keep menu open so multiple services can be selected
                      const next = typeof e.target.value === 'string'
                        ? e.target.value.split(',')
                        : e.target.value;
                      setFieldValue('services', next);
                    },
                    renderValue: (selected) =>
                      selected.length ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((val) => (
                            <Chip key={val} label={val} size="small" />
                          ))}
                        </Box>
                      ) : (
                        <Typography color="text.disabled">Select Service</Typography>
                      )
                  }}
                  value={values.services || []}
                >
                  {serviceOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      <Checkbox checked={(values.services || []).indexOf(option) > -1} size="small" />
                      <Typography>{option}</Typography>
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('Select Language')}
              {fieldsLoading ? (
                <Skeleton variant="rounded" height={56} width="100%" />
              ) : (
                <TextField
                  id="language"
                  select
                  fullWidth
                  SelectProps={{
                    multiple: true,
                    open: languageOpen,
                    onOpen: () => setLanguageOpen(true),
                    onClose: () => setLanguageOpen(false),
                    value: values.language || [],
                    onChange: (e) => {
                      setFieldValue('language', e.target.value);
                      setLanguageOpen(false);
                    },
                    renderValue: (selected) =>
                      selected.length ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((val) => (
                            <Chip key={val} label={val} size="small" sx={{ textTransform: 'capitalize' }} />
                          ))}
                        </Box>
                      ) : (
                        <Typography color="text.disabled">Select Language(s)</Typography>
                      )
                  }}
                  value={values.language || []}
                >
                  {languageOptions.map((option) => (
                    <MenuItem key={option} value={option} sx={{ textTransform: 'capitalize' }}>
                      <Checkbox checked={(values.language || []).indexOf(option) > -1} size="small" />
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('Total Experience')}
              {renderTextField('experience', { ...getFieldProps('experience') })}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('Address & Landmark')}
              {renderTextField('address.streetAddress', { ...getFieldProps('address.streetAddress') })}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('Country')}
              {fieldsLoading ? (
                <Skeleton variant="rounded" height={56} width="100%" />
              ) : (
                <TextField id="country" fullWidth value="India" disabled />
              )}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('State')}
              {renderTextField('address.state', { ...getFieldProps('address.state') })}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('City')}
              {renderTextField('address.city', { ...getFieldProps('address.city') })}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('Pincode')}
              {renderTextField('pincode', { ...getFieldProps('pincode') })}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack gap={1}>
              {renderLabel('Referral Code')}
              {renderTextField('referralCode', { ...getFieldProps('referralCode') })}
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}