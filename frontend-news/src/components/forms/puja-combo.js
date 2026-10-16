'use client';
import React, { useState, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from '@bprogress/next';
import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
import toast from 'react-hot-toast';

import { Card, Stack, TextField, Typography, Box, Select, Button, Grid, Skeleton, Autocomplete, Switch, FormControlLabel, RadioGroup, Radio, Chip, IconButton, Alert, Divider } from '@mui/material';
import { IoClose } from 'react-icons/io5';

import * as api from 'src/services';
import BlurImage from '@/components/blur-image';
import ComboCard from '@/components/cards/combo';

PujaComboForm.propTypes = { data: PropTypes.object, isLoading: PropTypes.bool };

const toLines = (arr) => (Array.isArray(arr) ? arr.join('\n') : '');
const fromLines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);
const slugify = (t) => String(t).toLowerCase().trim().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const idOf = (v) => (v && typeof v === 'object' ? v._id : v) || '';

const schema = Yup.object().shape({
    name: Yup.string().trim().required('Combo name is required'),
    slug: Yup.string().trim().required('Slug is required'),
    masterService: Yup.string().required('Select a Puja Service'),
    kits: Yup.array().of(Yup.string()).min(1, 'Select at least one Puja Kit'),
    comboPrice: Yup.number().typeError('Enter a valid price').positive('Price must be greater than 0').required('Combo price is required')
});

function Label({ children }) {
    return <Typography variant="overline" color="text.primary" component="label">{children}</Typography>;
}

export default function PujaComboForm({ data: current, isLoading: dataLoading }) {
    const router = useRouter();
    const fileRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [slugTouched, setSlugTouched] = useState(false);
    const [newlyUploaded, setNewlyUploaded] = useState([]); // ids uploaded in this session

    const { mutate, isPending: saving } = useMutation({
        mutationFn: current ? api.updatePujaComboByAdmin : api.createPujaComboByAdmin,
        retry: false,
        onSuccess: (d) => {
            toast.success(d.message);
            router.push('/admin/puja-combos');
        },
        onError: (e) => toast.error(e?.response?.data?.message || 'Something went wrong!')
    });

    const formik = useFormik({
        initialValues: {
            name: current?.name || '',
            slug: current?.slug || '',
            shortDescription: current?.shortDescription || '',
            description: current?.description || '',
            benefits: toLines(current?.benefits),
            images: current?.images || [],
            masterService: idOf(current?.masterService),
            anyEligiblePandit: current ? current.anyEligiblePandit !== false : true,
            pandits: (current?.pandits || []).map(idOf),
            kits: (current?.kits?.length ? current.kits : current?.kit ? [current.kit] : []).map(idOf),
            comboPrice: current?.comboPrice ?? '',
            duration: current?.duration || '',
            languages: current?.languages || [],
            inclusions: toLines(current?.inclusions),
            exclusions: toLines(current?.exclusions),
            instructions: current?.instructions || '',
            displayOrder: current?.displayOrder ?? 0,
            isFeatured: !!current?.isFeatured,
            status: current?.status === 'active' ? 'active' : 'inactive'
        },
        enableReinitialize: true,
        validationSchema: schema,
        onSubmit: (v) => {
            mutate({
                ...v,
                kit: v.kits[0],
                benefits: fromLines(v.benefits),
                inclusions: fromLines(v.inclusions),
                exclusions: fromLines(v.exclusions),
                comboPrice: Number(v.comboPrice),
                displayOrder: Number(v.displayOrder) || 0,
                ...(current && { newSlug: v.slug, slug: current.slug })
            });
        }
    });
    const { values, errors, touched, handleSubmit, setFieldValue, getFieldProps } = formik;

    // Puja list + (for the chosen Puja) eligible Pandits and kits - all from the database
    const { data: optionsRes, isFetching: optionsLoading } = useQuery({
        queryKey: ['puja-combo-options', values.masterService],
        queryFn: () => api.getPujaComboOptionsByAdmin(values.masterService),
        gcTime: 0
    });
    const masters = optionsRes?.data?.masterServices || [];
    const pandits = optionsRes?.data?.pandits || [];
    const kits = optionsRes?.data?.kits || [];

    const master = masters.find((m) => m._id === values.masterService);
    const selectedKits = values.kits.map((id) => kits.find((k) => k._id === id)).filter(Boolean);
    // Original Total shown = same price breakup the website shows (Puja cut price + Kit cut prices)
    const originalPrice =
        master && selectedKits.length
            ? (master.pujaMrp || Math.max(master.originalPrice || 0, master.price || 0)) +
            selectedKits.reduce((t, k) => t + (k.effectiveMrp || k.effectivePrice || 0), 0)
            : 0;
    const price = Number(values.comboPrice) || 0;
    const discountAmount = originalPrice > price && price > 0 ? originalPrice - price : 0;
    const discountPercent = discountAmount ? Math.round((discountAmount / originalPrice) * 100) : 0;
    const overOriginal = originalPrice > 0 && price > originalPrice;

    const languageOptions = useMemo(() => [...new Set(pandits.flatMap((p) => p.language || []))], [pandits]);

    const handleName = (e) => {
        setFieldValue('name', e.target.value);
        if (!current && !slugTouched) setFieldValue('slug', slugify(e.target.value));
    };

    const handleMasterChange = (e) => {
        const id = e.target.value;
        setFieldValue('masterService', id);
        // kit and specific pandits depend on the Puja: reset them
        setFieldValue('kits', []);
        setFieldValue('pandits', []);
        const m = masters.find((x) => x._id === id);
        if (m && !values.duration) setFieldValue('duration', m.duration || '');
    };

    const handleFiles = async (e) => {
        const files = Array.from(e.target.files || []);
        e.target.value = '';
        if (!files.length) return;
        setUploading(true);
        try {
            const results = await Promise.all(files.map((f) => api.uploadImageToServer(f)));
            const added = results.map((r) => ({ _id: r.public_id, url: r.secure_url }));
            setNewlyUploaded((p) => [...p, ...added.map((a) => a._id)]);
            setFieldValue('images', [...values.images, ...added]);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Image upload failed');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = async (img) => {
        setFieldValue('images', values.images.filter((i) => i._id !== img._id));
        // only delete from storage if it was uploaded during this editing session
        if (newlyUploaded.includes(img._id)) {
            try { await api.singleDeleteFile(img._id); } catch (_) { }
        }
    };

    const preview = {
        slug: values.slug || 'preview',
        name: values.name || 'Combo name',
        image: values.images[0] || (master?.image?.url ? { url: master.image.url } : null),
        duration: values.duration,
        languages: values.languages,
        comboPrice: price || undefined,
        originalPrice: originalPrice || undefined,
        puja: master ? { name: master.name } : undefined,
        kit: selectedKits[0] ? { name: selectedKits[0].name } : undefined,
        kits: selectedKits.map((k) => ({ name: k.name }))
    };

    const err = (f) => Boolean(touched[f] && errors[f]);
    const help = (f) => touched[f] && errors[f];
    const sk = (h = 56) => <Skeleton variant="rounded" width="100%" height={h} />;

    return (
        <Box position="relative">
            <FormikProvider value={formik}>
                <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid size={{ md: 8, xs: 12 }}>
                            <Stack spacing={2}>
                                {/* Basic details */}
                                <Card sx={{ p: 3 }}>
                                    <Stack spacing={3}>
                                        <Typography variant="h6">Basic Details</Typography>
                                        <Stack gap={1}>
                                            <Label>Combo Name</Label>
                                            {dataLoading ? sk() : (
                                                <TextField fullWidth {...getFieldProps('name')} onChange={handleName} error={err('name')} helperText={help('name')} placeholder="e.g. Rudrabhishek Complete Combo" />
                                            )}
                                        </Stack>
                                        <Stack gap={1}>
                                            <Label>Slug</Label>
                                            {dataLoading ? sk() : (
                                                <TextField fullWidth {...getFieldProps('slug')} onChange={(e) => { setSlugTouched(true); setFieldValue('slug', slugify(e.target.value)); }} error={err('slug')} helperText={help('slug') || 'Used in the link: /puja-combos/<slug>'} />
                                            )}
                                        </Stack>
                                        <Stack gap={1}>
                                            <Label>Short Description</Label>
                                            {dataLoading ? sk() : <TextField fullWidth {...getFieldProps('shortDescription')} />}
                                        </Stack>
                                        <Stack gap={1}>
                                            <Label>Detailed Description</Label>
                                            {dataLoading ? sk(140) : <TextField fullWidth multiline rows={5} {...getFieldProps('description')} />}
                                        </Stack>
                                        <Stack gap={1}>
                                            <Label>Puja Benefits (one per line)</Label>
                                            {dataLoading ? sk(100) : <TextField fullWidth multiline rows={3} {...getFieldProps('benefits')} />}
                                        </Stack>
                                        <Stack gap={1}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Label>Combo Images</Label>
                                                <Button size="small" variant="outlined" loading={uploading} onClick={() => fileRef.current?.click()}>Upload</Button>
                                                <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />
                                            </Stack>
                                            <Stack direction="row" gap={1.5} flexWrap="wrap">
                                                {values.images.map((img, i) => (
                                                    <Box key={img._id} sx={{ position: 'relative', width: 96, height: 72, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                                                        <BlurImage fill objectFit="cover" alt={`Combo image ${i + 1}`} src={img.url} />
                                                        <IconButton size="small" onClick={() => removeImage(img)} sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'background.paper', p: 0.3 }}><IoClose size={14} /></IconButton>
                                                        {i === 0 && <Chip size="small" label="Main" sx={{ position: 'absolute', bottom: 2, left: 2, height: 18, fontSize: 10 }} />}
                                                    </Box>
                                                ))}
                                            </Stack>
                                            <Typography variant="caption" color="text.secondary">First image is the card image. If none is uploaded, the Puja Service image is used.</Typography>
                                        </Stack>
                                    </Stack>
                                </Card>

                                {/* Puja service */}
                                <Card sx={{ p: 3 }}>
                                    <Stack spacing={3}>
                                        <Typography variant="h6">Puja Service</Typography>
                                        <Stack gap={1}>
                                            <Label>Select Puja Service</Label>
                                            {dataLoading ? sk() : (
                                                <Select native fullWidth value={values.masterService} onChange={handleMasterChange} error={err('masterService')}>
                                                    <option value="">Select...</option>
                                                    {masters.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                                                </Select>
                                            )}
                                            {help('masterService') && <Typography variant="caption" color="error">{help('masterService')}</Typography>}
                                        </Stack>
                                        {master && (
                                            <Typography variant="body2" color="text.secondary">
                                                {master.name}: ₹{master.price} • {master.duration}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Card>

                                {/* Pandit */}
                                <Card sx={{ p: 3 }}>
                                    <Stack spacing={2}>
                                        <Typography variant="h6">Pandit Ji</Typography>
                                        {!values.masterService ? (
                                            <Typography variant="body2" color="text.secondary">Select a Puja Service first.</Typography>
                                        ) : optionsLoading ? sk(80) : pandits.length === 0 ? (
                                            <Alert severity="warning">No active Pandit currently offers this Puja. The combo cannot be saved.</Alert>
                                        ) : (
                                            <>
                                                <RadioGroup value={values.anyEligiblePandit ? 'any' : 'specific'} onChange={(e) => setFieldValue('anyEligiblePandit', e.target.value === 'any')}>
                                                    <FormControlLabel value="any" control={<Radio />} label={`Any eligible Pandit (${pandits.length} available)`} />
                                                    <FormControlLabel value="specific" control={<Radio />} label="Choose specific Pandits" />
                                                </RadioGroup>
                                                {!values.anyEligiblePandit && (
                                                    <Autocomplete
                                                        multiple
                                                        options={pandits}
                                                        getOptionLabel={(p) => `${p.firstName} ${p.lastName}`.trim()}
                                                        isOptionEqualToValue={(a, b) => a._id === b._id}
                                                        value={pandits.filter((p) => values.pandits.includes(p._id))}
                                                        onChange={(_, v) => setFieldValue('pandits', v.map((p) => p._id))}
                                                        renderInput={(p) => <TextField {...p} placeholder="Select Pandits" />}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </Stack>
                                </Card>

                                {/* Kit */}
                                <Card sx={{ p: 3 }}>
                                    <Stack spacing={2}>
                                        <Typography variant="h6">Puja Samagri Kits</Typography>
                                        {!values.masterService ? (
                                            <Typography variant="body2" color="text.secondary">Select a Puja Service first.</Typography>
                                        ) : optionsLoading ? sk() : kits.length === 0 ? (
                                            <Alert severity="warning">No published Puja Kit is tagged with this Puja name. Create/tag the kit product first.</Alert>
                                        ) : (
                                            <Autocomplete
                                                multiple
                                                disableCloseOnSelect
                                                options={kits}
                                                getOptionLabel={(k) => `${k.name} — ₹${k.effectivePrice}`}
                                                isOptionEqualToValue={(a, b) => a._id === b._id}
                                                value={selectedKits}
                                                onChange={(_, v) => setFieldValue('kits', v.map((k) => k._id))}
                                                renderInput={(p) => <TextField {...p} placeholder="Select one or more kits" error={err('kits')} />}
                                            />
                                        )}
                                        {help('kits') && <Typography variant="caption" color="error">{help('kits')}</Typography>}
                                        {values.masterService && !optionsLoading && kits.length > 0 && (
                                            <Typography variant="caption" color="text.secondary">
                                                Select every kit included in this combo (for example Puja Kit + Instant Kit). All selected kits are delivered with the booking.
                                            </Typography>
                                        )}
                                        {selectedKits.map((kit) => (
                                            <Stack key={kit._id} direction="row" spacing={2} alignItems="center">
                                                {kit.images?.[0]?.url && (
                                                    <Box sx={{ position: 'relative', width: 64, height: 64, borderRadius: 1, overflow: 'hidden' }}>
                                                        <BlurImage fill objectFit="cover" alt={kit.name} src={kit.images[0].url} />
                                                    </Box>
                                                )}
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="subtitle2">{kit.name}</Typography>
                                                    <Typography variant="body2" color="text.secondary">₹{kit.effectivePrice} • Stock: {kit.stockQuantity > 0 ? kit.stockQuantity : 'Out of stock'}</Typography>
                                                </Box>
                                                <IconButton size="small" onClick={() => setFieldValue('kits', values.kits.filter((id) => id !== kit._id))}><IoClose size={16} /></IconButton>
                                            </Stack>
                                        ))}
                                        {selectedKits.some((k) => !(k.stockQuantity > 0)) && <Alert severity="warning">A selected kit is out of stock. The combo will show as unavailable until it is restocked.</Alert>}
                                    </Stack>
                                </Card>

                                {/* Pricing */}
                                <Card sx={{ p: 3 }}>
                                    <Stack spacing={3}>
                                        <Typography variant="h6">Pricing</Typography>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 3 }}>
                                                <Stack gap={1}>
                                                    <Label>Original Total (₹)</Label>
                                                    <TextField value={originalPrice || ''} disabled helperText="Puja price + selected kits" />
                                                </Stack>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 3 }}>
                                                <Stack gap={1}>
                                                    <Label>Combo Price (₹)</Label>
                                                    <TextField type="number" {...getFieldProps('comboPrice')} error={err('comboPrice') || overOriginal} helperText={help('comboPrice') || (overOriginal ? 'Cannot exceed original total' : '')} />
                                                </Stack>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 3 }}>
                                                <Stack gap={1}>
                                                    <Label>Discount (₹)</Label>
                                                    <TextField value={discountAmount || ''} disabled />
                                                </Stack>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 3 }}>
                                                <Stack gap={1}>
                                                    <Label>Discount (%)</Label>
                                                    <TextField value={discountPercent || ''} disabled />
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </Stack>
                                </Card>

                                {/* Additional */}
                                <Card sx={{ p: 3 }}>
                                    <Stack spacing={3}>
                                        <Typography variant="h6">Additional Details</Typography>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <Stack gap={1}>
                                                    <Label>Duration</Label>
                                                    <TextField {...getFieldProps('duration')} placeholder="e.g. 2-3 Hrs" />
                                                </Stack>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <Stack gap={1}>
                                                    <Label>Languages</Label>
                                                    <Autocomplete multiple freeSolo options={languageOptions} value={values.languages} onChange={(_, v) => setFieldValue('languages', v)} renderInput={(p) => <TextField {...p} placeholder="Type and press Enter" />} />
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                        <Stack gap={1}>
                                            <Label>What&apos;s Included (one per line)</Label>
                                            <TextField multiline rows={4} {...getFieldProps('inclusions')} />
                                        </Stack>
                                        <Stack gap={1}>
                                            <Label>What&apos;s Not Included (one per line)</Label>
                                            <TextField multiline rows={3} {...getFieldProps('exclusions')} />
                                        </Stack>
                                        <Stack gap={1}>
                                            <Label>Instructions</Label>
                                            <TextField multiline rows={3} {...getFieldProps('instructions')} />
                                        </Stack>
                                    </Stack>
                                </Card>
                            </Stack>
                        </Grid>

                        <Grid size={{ md: 4, xs: 12 }}>
                            <div style={{ position: 'sticky', top: 0 }}>
                                <Stack spacing={2}>
                                    <Card sx={{ p: 3 }}>
                                        <Stack spacing={2.5}>
                                            <Stack gap={1}>
                                                <Label>Status</Label>
                                                <Select native {...getFieldProps('status')} sx={{ textTransform: 'capitalize' }}>
                                                    <option value="active">active</option>
                                                    <option value="inactive">inactive</option>
                                                </Select>
                                            </Stack>
                                            <FormControlLabel control={<Switch checked={values.isFeatured} onChange={(e) => setFieldValue('isFeatured', e.target.checked)} />} label="Featured on Homepage" />
                                            <Stack gap={1}>
                                                <Label>Display Order</Label>
                                                <TextField type="number" {...getFieldProps('displayOrder')} helperText="Lower number shows first" />
                                            </Stack>
                                            <Typography variant="caption" color="text.secondary">
                                                A combo shows on the website only when it is Active, its Puja is active, its kit is published, and at least one eligible Pandit exists.
                                            </Typography>
                                        </Stack>
                                    </Card>

                                    <Card sx={{ p: 2 }}>
                                        <Typography variant="overline" color="text.secondary">Live Preview (as on website)</Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <ComboCard combo={preview} />
                                    </Card>

                                    <Button type="submit" variant="contained" size="large" loading={saving} disabled={dataLoading || overOriginal}>
                                        {current ? 'Update' : 'Create'}
                                    </Button>
                                </Stack>
                            </div>
                        </Grid>
                    </Grid>
                </Form>
            </FormikProvider>
        </Box>
    );
}