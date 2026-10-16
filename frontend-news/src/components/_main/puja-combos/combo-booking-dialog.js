'use client';
import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    MenuItem,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import * as api from 'src/services';
import { getPujaComboPandits, bookPujaCombo } from 'src/services/puja-combo-booking';

const ORANGE = '#fb8b05';
const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const TIME_SLOTS = (() => {
    const slots = [];
    for (let hour = 6; hour <= 18; hour++) {
        ['00', '30'].forEach((min) => {
            if (hour === 18 && min === '30') return;
            const h12 = hour > 12 ? hour - 12 : hour;
            slots.push({ value: `${String(hour).padStart(2, '0')}:${min}`, label: `${String(h12).padStart(2, '0')}:${min} ${hour < 12 ? 'AM' : 'PM'}` });
        });
    }
    return slots;
})();

export default function ComboBookingDialog({ open, onClose, combo }) {
    const tomorrow = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    }, []);

    const [pandits, setPandits] = useState([]);
    const [loadingPandits, setLoadingPandits] = useState(false);
    const [vendorId, setVendorId] = useState('');
    const [date, setDate] = useState(tomorrow);
    const [time, setTime] = useState('10:00');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('India');
    const [zip, setZip] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open || !combo?.slug) return;
        let alive = true;
        setLoadingPandits(true);
        setError('');
        getPujaComboPandits(combo.slug)
            .then((res) => {
                if (!alive) return;
                const list = res?.payload?.pandits || [];
                setPandits(list);
                if (list.length === 1) setVendorId(list[0].id);
            })
            .catch(() => alive && setError('Could not load Pandit Ji list. Please try again.'))
            .finally(() => alive && setLoadingPandits(false));
        return () => {
            alive = false;
        };
    }, [open, combo?.slug]);

    const handlePay = async () => {
        setError('');
        if (!vendorId) return setError('Please select a Pandit Ji');
        if (!date || !time) return setError('Please select date and time');
        if (!street.trim() || !city.trim() || !state.trim() || !country.trim()) return setError('Please fill the complete address');
        const when = new Date(`${date}T${time}`);
        if (when <= new Date()) return setError('Please select a future date and time');

        setProcessing(true);
        try {
            const res = await bookPujaCombo(combo.slug, {
                vendorId,
                dateTime: when.toISOString(),
                address: { streetAddress: street.trim(), city: city.trim(), state: state.trim(), country: country.trim(), zip: zip.trim() }
            });
            if (res?.error !== false) throw new Error(res?.message || 'Failed to create booking');

            // Same payment call the normal booking dialog uses
            const pay = await api.createBookingPayment({ bookingId: res.payload.booking.id, currency: 'INR', provider: 'razorpay' });
            if (pay?.error !== false) throw new Error(pay?.message || 'Failed to initialize payment');
            const url = pay.payload?.razorpay?.payment_link?.short_url || pay.payload?.payment_link?.short_url;
            if (!url) throw new Error('Payment URL not found');
            window.location.href = url;
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.');
            setProcessing(false);
        }
    };

    const handleClose = () => {
        if (!processing) onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth disableEscapeKeyDown={processing}>
            <DialogTitle>
                Book Combo
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {combo?.name}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}

                    {loadingPandits ? (
                        <Stack alignItems="center" sx={{ py: 2 }}>
                            <CircularProgress size={24} />
                        </Stack>
                    ) : (
                        <TextField select fullWidth size="small" label="Select Pandit Ji" value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
                            {pandits.map((p) => (
                                <MenuItem key={p.id} value={p.id}>
                                    {p.name}
                                    {p.experience ? ` • ${p.experience} experience` : ''}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField fullWidth size="small" type="date" label="Date" value={date} onChange={(e) => setDate(e.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: tomorrow } }} />
                        <TextField select fullWidth size="small" label="Time" value={time} onChange={(e) => setTime(e.target.value)}>
                            {TIME_SLOTS.map((s) => (
                                <MenuItem key={s.value} value={s.value}>
                                    {s.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>

                    <TextField fullWidth size="small" label="Street address" value={street} onChange={(e) => setStreet(e.target.value)} />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField fullWidth size="small" label="City" value={city} onChange={(e) => setCity(e.target.value)} />
                        <TextField fullWidth size="small" label="State" value={state} onChange={(e) => setState(e.target.value)} />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField fullWidth size="small" label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
                        <TextField fullWidth size="small" label="Pincode" value={zip} onChange={(e) => setZip(e.target.value)} />
                    </Stack>

                    <Divider />
                    <Box sx={{ background: '#fff7ed', border: '1px solid #f5dcc0', borderRadius: '12px', p: 2 }}>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2">Puja + Kit ({combo?.puja?.name})</Typography>
                            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: '#999' }}>
                                {combo?.originalPrice > combo?.comboPrice ? inr(combo.originalPrice) : ''}
                            </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                            <Typography fontWeight={700}>Total to pay</Typography>
                            <Typography fontWeight={800} sx={{ color: ORANGE }}>
                                {inr(combo?.comboPrice)}
                            </Typography>
                        </Stack>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} disabled={processing} sx={{ textTransform: 'none' }}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handlePay}
                    disabled={processing || loadingPandits || !pandits.length}
                    startIcon={processing ? <CircularProgress size={18} color="inherit" /> : null}
                    sx={{ borderRadius: '50px', textTransform: 'none', fontWeight: 700, px: 4, boxShadow: 'none', background: ORANGE, '&:hover': { background: '#e07b00' } }}
                >
                    {processing ? 'Processing...' : `Pay ${inr(combo?.comboPrice)}`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

ComboBookingDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    combo: PropTypes.object
};