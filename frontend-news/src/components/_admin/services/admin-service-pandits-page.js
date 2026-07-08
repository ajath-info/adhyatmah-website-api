'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import * as api from 'src/services';

// mui
import {
    Box,
    Card,
    Stack,
    Avatar,
    Typography,
    TextField,
    InputAdornment,
    Skeleton,
    Chip
} from '@mui/material';

// icons
import { IoSearch } from 'react-icons/io5';
import { MdEmail, MdPhone } from 'react-icons/md';

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function PanditCardSkeleton() {
    return (
        <Card sx={{ p: 2.5, borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
                <Skeleton variant="circular" width={56} height={56} />
                <Box flex={1}>
                    <Skeleton variant="text" width="40%" height={20} />
                    <Skeleton variant="text" width="60%" height={16} sx={{ mt: 0.5 }} />
                    <Skeleton variant="text" width="30%" height={16} sx={{ mt: 0.5 }} />
                </Box>
                <Skeleton variant="rounded" width={80} height={24} />
            </Stack>
        </Card>
    );
}

// ─── Pandit Card ──────────────────────────────────────────────────────────────
function PanditCard({ pandit }) {
    const fullName = [pandit?.firstName || '', pandit?.lastName || ''].join(' ').trim() || pandit?.name || 'Pandit Ji';
    const email = pandit?.email || '—';
    const phone = pandit?.phone || pandit?.phoneNumber || '—';
    const avatar = pandit?.image?.url || pandit?.avatar || pandit?.profileImage || null;

    return (
        <Card
            sx={{
                p: 2.5,
                borderRadius: 2,
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: 4 }
            }}
        >
            <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                    src={avatar}
                    alt={fullName}
                    sx={{
                        width: 56,
                        height: 56,
                        bgcolor: 'primary.lighter',
                        color: 'primary.main',
                        fontWeight: 700,
                        fontSize: 20,
                        border: '2px solid',
                        borderColor: 'primary.light'
                    }}
                >
                    {fullName.charAt(0).toUpperCase()}
                </Avatar>

                <Box flex={1} minWidth={0}>
                    <Typography variant="subtitle2" noWrap>
                        {fullName}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                        <MdEmail size={13} color="#9e9e9e" />
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {email}
                        </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5} mt={0.3}>
                        <MdPhone size={13} color="#9e9e9e" />
                        <Typography variant="caption" color="text.secondary">
                            {phone}
                        </Typography>
                    </Stack>
                </Box>

                <Chip label="Available" color="success" size="small" sx={{ fontWeight: 600 }} />
            </Stack>
        </Card>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminServicePanditsPage() {
    const params = useParams();
    const serviceId = params?.id;

    const [service, setService] = useState(null);
    const [pandits, setPandits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (serviceId) fetchData();
    }, [serviceId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Step 1: Service detail lo — poojaType chahiye match ke liye
            const serviceRes = await api.getServiceByAdmin(serviceId);
            const serviceData = serviceRes?.payload || serviceRes?.data || serviceRes;
            setService(serviceData);

            // poojaType nikalo — yahi se match karega
            const poojaType = serviceData?.poojaType || serviceData?.name || serviceData?.title || '';

            // Step 2: Saare pandits lo ek hi call mein
            const panditsRes = await api.getAllPandit();
            const allPandits = panditsRes?.payload?.vendors || panditsRes?.vendors || panditsRes?.data || [];

            if (!poojaType || allPandits.length === 0) {
                setPandits([]);
                return;
            }

            // Step 3: Har pandit ke liye unki services check karo
            const results = await Promise.allSettled(
                allPandits.map(async (pandit) => {
                    try {
                        const res = await api.getPanditServices(pandit?.id || pandit?._id);
                        const services = res?.payload?.services || res?.services || res?.data || [];

                        // poojaType se match karo (case-insensitive)
                        const provides = Array.isArray(services) && services.some(
                            (s) =>
                                (s?.poojaType || s?.name || s?.title || '')
                                    .toLowerCase()
                                    .trim() === poojaType.toLowerCase().trim()
                        );

                        return provides ? pandit : null;
                    } catch {
                        return null;
                    }
                })
            );

            const matched = results
                .filter((r) => r.status === 'fulfilled' && r.value !== null)
                .map((r) => r.value);

            setPandits(matched);
        } catch (err) {
            console.error(err);
            setError('Data load nahi hua. Dobara try karein.');
        } finally {
            setLoading(false);
        }
    };

    // Search filter
    const filtered = pandits.filter((p) => {
        const name = [p?.firstName || '', p?.lastName || '', p?.name || ''].join(' ').toLowerCase();
        const email = (p?.email || '').toLowerCase();
        return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
    });

    const serviceName = service?.poojaType || service?.name || service?.title || 'Service';

    return (
        <Box>
            {/* Service Info Card */}
            {!loading && service && (
                <Card
                    sx={{
                        p: 2.5,
                        mb: 3,
                        borderRadius: 2,
                        bgcolor: 'primary.lighter',
                        border: '1px solid',
                        borderColor: 'primary.light'
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 2,
                                bgcolor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 22,
                                color: '#fff'
                            }}
                        >
                            ॐ
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={700}>
                                {serviceName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {pandits.length} pandit{pandits.length !== 1 ? 's' : ''} ye service provide karte hain
                            </Typography>
                        </Box>
                    </Stack>
                </Card>
            )}

            {/* Search Bar */}
            <TextField
                fullWidth
                size="small"
                placeholder="Pandit ka naam ya email se dhundein..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <IoSearch size={18} color="#9e9e9e" />
                        </InputAdornment>
                    )
                }}
            />

            {/* Error */}
            {error && (
                <Card sx={{ p: 2, mb: 3, bgcolor: 'error.lighter', borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography color="error.main" variant="body2">{error}</Typography>
                        <Typography
                            variant="body2"
                            color="error.dark"
                            sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={fetchData}
                        >
                            Retry
                        </Typography>
                    </Stack>
                </Card>
            )}

            {/* Loading */}
            {loading && (
                <Stack spacing={2}>
                    {[...Array(4)].map((_, i) => <PanditCardSkeleton key={i} />)}
                </Stack>
            )}

            {/* Empty State */}
            {!loading && !error && filtered.length === 0 && (
                <Box textAlign="center" py={8}>
                    <Typography fontSize={48}>🙏</Typography>
                    <Typography variant="h6" color="text.secondary" mt={1}>
                        {search ? 'Koi pandit nahi mila' : 'Is service ke liye koi pandit registered nahi hai'}
                    </Typography>
                    {search && (
                        <Typography
                            variant="body2"
                            color="primary.main"
                            sx={{ cursor: 'pointer', mt: 1, textDecoration: 'underline' }}
                            onClick={() => setSearch('')}
                        >
                            Search clear karein
                        </Typography>
                    )}
                </Box>
            )}

            {/* Pandit Cards */}
            {!loading && filtered.length > 0 && (
                <>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        {filtered.length} pandit mile
                    </Typography>
                    <Stack spacing={2}>
                        {filtered.map((pandit, idx) => (
                            <PanditCard key={pandit._id || pandit.id || idx} pandit={pandit} />
                        ))}
                    </Stack>
                </>
            )}
        </Box>
    );
}