'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Box,
    Card,
    CardHeader,
    CardContent,
    Grid,
    Typography,
    Skeleton,
    Chip,
    Stack,
    Button,
    TextField
} from '@mui/material';
import { MdEdit, MdClose } from 'react-icons/md';
import { fDate } from '@/utils/format-time';
import * as api from 'src/services';

// Only the fields the "Sell Products" (seller) shop form actually collects —
// see components/forms/seller-shop/index.js. Deliberately does NOT include
// any Pandit-only fields (designation, gotra, veda, aadhaar, etc.) or the
// Pooja Services / Booking History / SEO Content tabs, since a seller shop
// has none of that.
const EDITABLE_SELLER_FIELDS = [
    { key: 'name', label: 'Shop Name' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'streetAddress', label: 'Address' },
    { key: 'country', label: 'Country' },
    { key: 'state', label: 'State' },
    { key: 'city', label: 'City' },
    { key: 'pincode', label: 'Pincode' }
];

const Field = ({ label, value, isLoading }) => (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Typography variant="overline" color="text.secondary">
            {label}
        </Typography>
        {isLoading ? <Skeleton variant="text" width="80%" /> : <Typography variant="body1">{value || '—'}</Typography>}
    </Grid>
);

Field.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.any, isLoading: PropTypes.bool };

export default function SellerShopDetails({ shop, isLoading, slug, embedded = false }) {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [formValues, setFormValues] = useState({});

    const { mutate, isPending: isSaving } = useMutation({
        mutationFn: api.updateShopByAdmin,
        onSuccess: (res) => {
            toast.success(res?.message || 'Shop details updated.');
            queryClient.invalidateQueries({ queryKey: ['shop-by-admin', slug] });
            setIsEditing(false);
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Something went wrong!');
        }
    });

    const handleEditStart = () => {
        setFormValues({
            name: shop?.name ?? '',
            firstName: shop?.firstName ?? '',
            lastName: shop?.lastName ?? '',
            email: shop?.shopEmail || shop?.email || '',
            phone: shop?.shopPhone || shop?.phone || '',
            streetAddress: shop?.address?.streetAddress ?? '',
            country: shop?.address?.country ?? '',
            state: shop?.address?.state ?? '',
            city: shop?.address?.city ?? '',
            pincode: shop?.pincode ?? ''
        });
        setIsEditing(true);
    };

    const handleFieldChange = (key, value) => {
        setFormValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleCancel = () => setIsEditing(false);

    const handleSave = () => {
        const { streetAddress, country, state, city, email, phone, ...rest } = formValues;
        mutate({
            currentSlug: slug,
            ...rest,
            email,
            phone,
            shopEmail: email,
            shopPhone: phone,
            address: { streetAddress, country, state, city }
        });
    };

    const statusChipColor =
        shop?.status === 'approved' ? 'success' : shop?.status === 'rejected' || shop?.status === 'blocked' ? 'error' : 'default';

    const displayFields = [
        { label: 'Shop Name', value: shop?.name },
        { label: 'First Name', value: shop?.firstName },
        { label: 'Last Name', value: shop?.lastName },
        { label: 'Email', value: shop?.shopEmail || shop?.email },
        { label: 'Phone', value: shop?.shopPhone || shop?.phone },
        { label: 'Address', value: shop?.address?.streetAddress },
        { label: 'Country', value: shop?.address?.country },
        { label: 'State', value: shop?.address?.state },
        { label: 'City', value: shop?.address?.city },
        { label: 'Pincode', value: shop?.pincode },
        { label: 'Registered On', value: shop?.createdAt ? fDate(shop.createdAt) : '' }
    ];

    const editToggle = !isLoading && shop ? (
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

    const statusChip =
        !isLoading && shop?.status ? (
            <Chip size="small" sx={{ mt: 0.5, textTransform: 'capitalize' }} label={shop.status} color={statusChipColor} />
        ) : null;

    const detailsContent = (
        <>
            {embedded && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
                    {statusChip}
                    {editToggle}
                </Stack>
            )}
            {isEditing ? (
                <Grid container spacing={2}>
                    {EDITABLE_SELLER_FIELDS.map((field) => (
                        <Grid key={field.key} size={{ xs: 12, sm: 6, md: 4 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label={field.label}
                                value={formValues[field.key] ?? ''}
                                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Grid container spacing={2}>
                    {displayFields.map((field) => (
                        <Field key={field.label} {...field} isLoading={isLoading} />
                    ))}
                </Grid>
            )}
        </>
    );

    if (embedded) {
        return <Box>{detailsContent}</Box>;
    }

    return (
        <Card sx={{ mb: 3 }}>
            <CardHeader title="Shop Details" subheader={statusChip} action={editToggle} />
            <CardContent>{detailsContent}</CardContent>
        </Card>
    );
}

SellerShopDetails.propTypes = {
    shop: PropTypes.object,
    isLoading: PropTypes.bool,
    slug: PropTypes.string,
    embedded: PropTypes.bool
};