'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputAdornment,
  Popover,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography
} from '@mui/material';

import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import BookingPaymentDialog from '@/components/booking/booking-payment-dialog.js';
import * as api from 'src/services';
import { EMPTY_KIT_DATA, buildPujaSamagriPayload, fetchServiceKits } from 'src/utils/puja-kit-product';
import {
  MdAccessTime,
  MdExpandMore,
  MdShoppingBag,
  MdFlashOn,
  MdCheckCircle,
  MdAdd,
  MdRemove,
  MdDeliveryDining,
  MdInventory2,
  MdShoppingCart,
  MdCreditCard,
  MdAccountBalanceWallet,
  MdInfoOutline,
  MdReceipt,
  MdClose
} from 'react-icons/md';

const MAX_KIT_LIMIT = 5;

const createVendorSlug = (vendor) => {
  const fullName = [vendor?.firstName || '', vendor?.lastName || ''].join(' ');
  let slug = fullName
    .toLowerCase()
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\./g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (!slug) slug = `pandit-${vendor?.id}`;
  return slug;
};

export default function VendorServiceBookingPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useSelector(({ user }) => user);

  const slug = params.slug;
  const serviceId = params.serviceId;

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [zip, setZip] = useState('');
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState('');
  const [paymentMode, setPaymentMode] = useState('full');
  const [formError, setFormError] = useState('');
  const [timeAnchorEl, setTimeAnchorEl] = useState(null);

  // ── Pooja Kit state ──
  const [poojaKitCount, setPoojaKitCount] = useState(0);
  const [poojaKitSkipped, setPoojaKitSkipped] = useState(false);
  const [kitImageBroken, setKitImageBroken] = useState(false);

  // ── Instant Kit state ──
  const [instantKitCount, setInstantKitCount] = useState(0);
  const [instantKitSkipped, setInstantKitSkipped] = useState(false);
  const [instantKitImageBroken, setInstantKitImageBroken] = useState(false);

  // ── Charges config ──
  const DELIVERY_CHARGE = 0;
  const HANDLING_CHARGE = 0;

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 18; hour++) {
      ['00', '30'].forEach((min) => {
        if (hour === 18 && min === '30') return;
        const h24 = String(hour).padStart(2, '0');
        const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour < 12 ? 'AM' : 'PM';
        const label = `${String(h12).padStart(2, '0')}:${min} ${ampm}`;
        slots.push({ value: `${h24}:${min}`, label });
      });
    }
    return slots;
  }, []);

  // ── Data fetching — slug-based ──
  const {
    data: vendorData,
    isPending: vendorLoading,
    error: vendorError
  } = useQuery({
    queryKey: ['vendor-profile', slug],
    queryFn: async () => {
      const response = await api.getAllPandit();
      const vendors = response?.payload?.vendors || [];
      const matchedVendor = vendors.find((vendor) => createVendorSlug(vendor) === slug);
      return { payload: { vendor: matchedVendor } };
    },
    enabled: !!slug
  });

  const vendor = vendorData?.payload?.vendor;
  const vendorId = vendor?.id;

  const {
    data: servicesData,
    isPending: servicesLoading,
    error: servicesError
  } = useQuery({
    queryKey: ['vendor-services', vendorId],
    queryFn: () => api.getPanditServices(vendorId),
    enabled: !!vendorId
  });

  const services = servicesData?.payload?.services || [];
  const service = useMemo(
    () => services.find((item) => item.id === serviceId || item._id === serviceId),
    [services, serviceId]
  );

  const poojaType = service?.poojaType || service?.title || service?.name || '';
  const resolvedServiceId = service?.id || service?._id || serviceId;

  const { data: serviceKits = { pujaKit: EMPTY_KIT_DATA, instantKit: EMPTY_KIT_DATA } } = useQuery({
    queryKey: ['service-kits', resolvedServiceId, poojaType],
    enabled: Boolean(resolvedServiceId && poojaType.trim()),
    queryFn: () => fetchServiceKits(resolvedServiceId, poojaType)
  });

  const poojaKit = serviceKits.pujaKit;
  const instantKit = serviceKits.instantKit;
  const kitImageUrl = poojaKit.imageUrl;
  const instantKitImageUrl = instantKit.imageUrl;

  useEffect(() => {
    setKitImageBroken(false);
  }, [kitImageUrl]);

  useEffect(() => {
    setInstantKitImageBroken(false);
  }, [instantKitImageUrl]);

  useEffect(() => {
    if (!selectedDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow.toISOString().split('T')[0]);
    }
    if (!selectedTime) setSelectedTime('10:00');
  }, [selectedDate, selectedTime]);

  // ── autofillAddressFromPincode ──
  const autofillAddressFromPincode = async (pin) => {
    if (!/^\d{6}$/.test(pin)) return;
    setZipLoading(true);
    setZipError('');

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${pin}&country=India&format=json&addressdetails=1&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data?.[0]?.address;
        if (addr) {
          setDistrict(addr.county || addr.state_district || addr.district || '');
          setState(addr.state || '');
          setCountry('India');
          if (!city) {
            setCity(addr.city || addr.town || addr.village || addr.suburb || '');
          }
          setZipLoading(false);
          return;
        }
      }
    } catch (_) {
      // silently fall through
    }

    setZipError('Could not fetch pincode details. Please fill manually.');
    setZipLoading(false);
  };

  const handleProceedToPayment = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed with payment');
      const redirectUrl = `/${slug}/services/${serviceId}`;
      router.push(`/auth/sign-in?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }
    setFormError('');
    if (!selectedDate) return setFormError('Please select a date');
    if (!selectedTime) return setFormError('Please select a time');
    if (!streetAddress.trim()) return setFormError('Please enter the street address');
    if (!city.trim()) return setFormError('Please enter the city');
    if (!district.trim()) return setFormError('Please enter the district');
    if (!state.trim()) return setFormError('Please enter the state');
    if (!country.trim()) return setFormError('Please enter the country');
    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    if (selectedDateTime <= new Date()) return setFormError('Please select a future date and time');
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = (booking) => {
    setPaymentDialogOpen(false);
    toast.success(`Booking created successfully! Booking ID: ${booking.bookingID}`);
    router.push('/profile/bookings');
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
  };

  if (vendorLoading || servicesLoading) {
    return (
      <Container maxWidth="xl">
        <Stack gap={3}>
          <HeaderBreadcrumbs
            heading="Loading..."
            links={[
              { name: 'Home', href: '/' },
              { name: 'Pandits', href: '/shops' }
            ]}
          />
          <Typography>Loading service details...</Typography>
        </Stack>
      </Container>
    );
  }

  if (vendorError || servicesError || !vendor || !service) {
    return (
      <Container maxWidth="xl">
        <Stack gap={3}>
          <HeaderBreadcrumbs
            heading="Service Not Found"
            links={[
              { name: 'Home', href: '/' },
              { name: 'Pandits', href: '/shops' }
            ]}
          />
          <Alert severity="error">Service details not found. Please go back and try again.</Alert>
        </Stack>
      </Container>
    );
  }

  const minAdvance = Math.round(service.price * 0.3);
  const payableAmount = paymentMode === 'full' ? service.price : minAdvance;
  const remainingAmount = service.price - payableAmount;

  const poojaKitTotal = !poojaKitSkipped && poojaKit.price != null ? poojaKit.price * poojaKitCount : 0;
  const instantKitTotal = !instantKitSkipped && instantKit.price != null ? instantKit.price * instantKitCount : 0;
  const grandTotal = payableAmount + DELIVERY_CHARGE + HANDLING_CHARGE + poojaKitTotal + instantKitTotal;

  // ── Reusable qty counter UI ──
  const KitQtyControls = ({ count, onDecrement, onIncrement, accentColor, borderColor }) => (
    <Stack
      direction="row"
      alignItems="center"
      sx={{ border: `1.5px solid ${borderColor}`, borderRadius: 2, overflow: 'hidden' }}
    >
      <Box
        onClick={onDecrement}
        sx={{
          px: 1.25,
          py: 0.5,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          color: accentColor,
          '&:hover': { bgcolor: `${accentColor}18` }
        }}
      >
        <MdRemove size={16} />
      </Box>
      <Typography
        variant="body2"
        fontWeight={700}
        sx={{ px: 1.5, color: '#1a1a1a', minWidth: 24, textAlign: 'center' }}
      >
        {count}
      </Typography>
      <Box
        onClick={onIncrement}
        sx={{
          px: 1.25,
          py: 0.5,
          cursor: count >= MAX_KIT_LIMIT ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          color: count >= MAX_KIT_LIMIT ? '#ccc' : accentColor,
          '&:hover': { bgcolor: count >= MAX_KIT_LIMIT ? 'transparent' : `${accentColor}18` }
        }}
      >
        <MdAdd size={16} />
      </Box>
    </Stack>
  );

  return (
    <Container maxWidth="xl">
      <Stack gap={3}>
        <HeaderBreadcrumbs
          heading={service.poojaType}
          links={[
            { name: 'Home', href: '/' },
            { name: 'Pandits', href: '/shops' },
            { name: `${vendor.firstName} ${vendor.lastName}`, href: `/${slug}` },
            { name: service.poojaType }
          ]}
        />

        <Grid container spacing={3}>
          {/* ── LEFT COLUMN ── */}
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Service Details Card */}
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Service Details
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  by {vendor.firstName} {vendor.lastName}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {service.poojaType} / {service.description || service.poojaType}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip
                    icon={<MdAccessTime size={16} />}
                    label={service.duration}
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                  <Chip label={`₹${service.price}`} size="small" color="success" variant="outlined" />
                </Stack>
                <Typography variant="subtitle2" color="text.secondary">
                  Base Price
                </Typography>
                <Typography variant="h5" color="primary">
                  ₹{service.price}
                </Typography>
              </CardContent>
            </Card>

            {/* ── POOJA KIT CARD ── */}
            {kitImageUrl && !kitImageBroken && (
              <>
                {poojaKitSkipped ? (
                  /* Skipped state — small undo bar */
                  <Box
                    sx={{
                      mt: 2,
                      borderRadius: '14px',
                      border: '1px dashed rgba(249,115,22,0.4)',
                      bgcolor: 'rgba(249,115,22,0.04)',
                      px: 2.5,
                      py: 1.25,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <MdClose size={15} color="#f97316" />
                      <Typography sx={{ fontSize: 13, color: '#f97316', fontWeight: 500 }}>
                        Puja Kit removed
                      </Typography>
                    </Stack>
                    <Button
                      onClick={() => setPoojaKitSkipped(false)}
                      size="small"
                      sx={{
                        borderRadius: '50px',
                        px: '14px',
                        py: '5px',
                        bgcolor: '#E87D2B',
                        color: '#fff',
                        textTransform: 'none',
                        fontSize: 12,
                        '&:hover': { bgcolor: '#d06b20' }
                      }}
                    >
                      Undo
                    </Button>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      mt: 2,
                      borderRadius: '20px',
                      border: '0.5px solid rgba(249,115,22,0.25)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      minHeight: 180,
                      bgcolor: 'background.paper',
                      px: 3,
                      py: 2.5,
                      gap: 2.5,
                      transition: 'transform .2s, box-shadow .2s',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 24px rgba(249,115,22,0.12)' },
                      position: 'relative'
                    }}
                  >
                    {/* LEFT: Circle image */}
                    <Box
                      sx={{
                        flexShrink: 0,
                        width: { xs: 110, md: 140 },
                        height: { xs: 110, md: 140 },
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '3px solid rgba(249,115,22,0.35)',
                        boxShadow: '0 4px 20px rgba(249,115,22,0.2)'
                      }}
                    >
                      <Box
                        component="img"
                        src={poojaKit?.imageUrl}
                        alt={poojaKit?.name}
                        onError={() => setKitImageBroken(true)}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'transform .35s ease',
                          '&:hover': { transform: 'scale(1.08)' }
                        }}
                      />
                    </Box>

                    {/* RIGHT: Text content */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          px: '10px',
                          py: '4px',
                          bgcolor: '#FEF3E2',
                          color: '#A05A00',
                          border: '0.5px solid #F0B840',
                          borderRadius: '6px',
                          width: 'fit-content'
                        }}
                      >
                        <MdShoppingBag size={11} /> Puja Kit
                      </Box>

                      <Typography sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>
                        {poojaKit?.name}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                        Selected samagri kit for this puja
                      </Typography>

                      <Stack direction="row" alignItems="center" flexWrap="wrap" gap="10px" sx={{ mt: 0.5 }}>
                        <Typography sx={{ fontSize: 17, fontWeight: 700 }}>
                          ₹{poojaKit?.price}
                          <Box component="span" sx={{ fontSize: 11, fontWeight: 400, color: 'text.secondary', ml: '3px' }}>
                            / Kit
                          </Box>
                        </Typography>

                        {poojaKitCount === 0 ? (
                          <Button
                            onClick={() => { setPoojaKitCount(1); setPoojaKitSkipped(false); }}
                            size="small"
                            sx={{
                              borderRadius: '50px',
                              px: '14px',
                              py: '6px',
                              bgcolor: '#E87D2B',
                              color: '#fff',
                              textTransform: 'none',
                              fontSize: 13,
                              '&:hover': { bgcolor: '#d06b20' }
                            }}
                            startIcon={<MdAdd size={14} />}
                          >
                            Add
                          </Button>
                        ) : (
                          <KitQtyControls
                            count={poojaKitCount}
                            onDecrement={() => setPoojaKitCount((c) => Math.max(0, c - 1))}
                            onIncrement={() => setPoojaKitCount((c) => Math.min(MAX_KIT_LIMIT, c + 1))}
                            accentColor="#f97316"
                            borderColor="rgba(249,115,22,0.4)"
                          />
                        )}

                        {/* Skip button */}
                        <Button
                          onClick={() => { setPoojaKitSkipped(true); setPoojaKitCount(0); }}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderRadius: '50px',
                            px: '12px',
                            py: '5px',
                            borderColor: 'rgba(0,0,0,0.2)',
                            color: 'text.secondary',
                            textTransform: 'none',
                            fontSize: 12,
                            '&:hover': { borderColor: '#f97316', color: '#f97316', bgcolor: 'transparent' }
                          }}
                          startIcon={<MdClose size={13} />}
                        >
                          Skip
                        </Button>
                      </Stack>

                      {poojaKitCount >= MAX_KIT_LIMIT && (
                        <Typography variant="caption" sx={{ color: '#888' }}>
                          Maximum {MAX_KIT_LIMIT} kits allowed.
                        </Typography>
                      )}

                      {poojaKitCount > 0 && (
                        <Box sx={{ mt: 0.5, p: 1.25, bgcolor: 'rgba(34,197,94,0.07)', borderRadius: 2 }}>
                          <Typography variant="caption">
                            {poojaKitCount} Puja Kit{poojaKitCount > 1 ? 's' : ''} added · ₹{poojaKitTotal}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </>
            )}

            {/* ── INSTANT KIT CARD ── */}
            {instantKitImageUrl && !instantKitImageBroken && (
              <>
                {instantKitSkipped ? (
                  /* Skipped state — small undo bar */
                  <Box
                    sx={{
                      mt: 2,
                      borderRadius: '14px',
                      border: '1px dashed rgba(58,158,40,0.4)',
                      bgcolor: 'rgba(58,158,40,0.04)',
                      px: 2.5,
                      py: 1.25,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <MdClose size={15} color="#3A9E28" />
                      <Typography sx={{ fontSize: 13, color: '#3A9E28', fontWeight: 500 }}>
                        Instant Kit removed
                      </Typography>
                    </Stack>
                    <Button
                      onClick={() => setInstantKitSkipped(false)}
                      size="small"
                      sx={{
                        borderRadius: '50px',
                        px: '14px',
                        py: '5px',
                        bgcolor: '#3A9E28',
                        color: '#fff',
                        textTransform: 'none',
                        fontSize: 12,
                        '&:hover': { bgcolor: '#2F7F20' }
                      }}
                    >
                      Undo
                    </Button>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      mt: 2,
                      borderRadius: '20px',
                      border: '0.5px solid rgba(58,158,40,0.25)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      minHeight: 180,
                      bgcolor: 'background.paper',
                      px: 3,
                      py: 2.5,
                      gap: 2.5,
                      transition: 'transform .2s, box-shadow .2s',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 24px rgba(58,158,40,0.12)' },
                      position: 'relative'
                    }}
                  >
                    {/* LEFT: Circle image */}
                    <Box
                      sx={{
                        flexShrink: 0,
                        width: { xs: 110, md: 140 },
                        height: { xs: 110, md: 140 },
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '3px solid rgba(58,158,40,0.35)',
                        boxShadow: '0 4px 20px rgba(58,158,40,0.2)'
                      }}
                    >
                      <Box
                        component="img"
                        src={instantKit?.imageUrl}
                        alt={instantKit?.name}
                        onError={() => setInstantKitImageBroken(true)}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'transform .35s ease',
                          '&:hover': { transform: 'scale(1.08)' }
                        }}
                      />
                    </Box>

                    {/* RIGHT: Text content */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          px: '10px',
                          py: '4px',
                          bgcolor: '#E8F5E4',
                          color: '#2D6A1A',
                          border: '0.5px solid #6DB95A',
                          borderRadius: '6px',
                          width: 'fit-content'
                        }}
                      >
                        <MdFlashOn size={11} /> Instant Kit
                      </Box>

                      <Typography sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>
                        {instantKit?.name}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                        Add-on items for quick delivery
                      </Typography>

                      <Stack direction="row" alignItems="center" flexWrap="wrap" gap="10px" sx={{ mt: 0.5 }}>
                        <Typography sx={{ fontSize: 17, fontWeight: 700 }}>
                          ₹{instantKit?.price}
                          <Box component="span" sx={{ fontSize: 11, fontWeight: 400, color: 'text.secondary', ml: '3px' }}>
                            / Kit
                          </Box>
                        </Typography>

                        {instantKitCount === 0 ? (
                          <Button
                            onClick={() => { setInstantKitCount(1); setInstantKitSkipped(false); }}
                            size="small"
                            sx={{
                              borderRadius: '50px',
                              px: '14px',
                              py: '6px',
                              bgcolor: '#3A9E28',
                              color: '#fff',
                              textTransform: 'none',
                              fontSize: 13,
                              '&:hover': { bgcolor: '#2F7F20' }
                            }}
                            startIcon={<MdAdd size={14} />}
                          >
                            Add
                          </Button>
                        ) : (
                          <KitQtyControls
                            count={instantKitCount}
                            onDecrement={() => setInstantKitCount((c) => Math.max(0, c - 1))}
                            onIncrement={() => setInstantKitCount((c) => Math.min(MAX_KIT_LIMIT, c + 1))}
                            accentColor="#3A9E28"
                            borderColor="rgba(58,158,40,0.4)"
                          />
                        )}

                        {/* Skip button */}
                        <Button
                          onClick={() => { setInstantKitSkipped(true); setInstantKitCount(0); }}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderRadius: '50px',
                            px: '12px',
                            py: '5px',
                            borderColor: 'rgba(0,0,0,0.2)',
                            color: 'text.secondary',
                            textTransform: 'none',
                            fontSize: 12,
                            '&:hover': { borderColor: '#3A9E28', color: '#3A9E28', bgcolor: 'transparent' }
                          }}
                          startIcon={<MdClose size={13} />}
                        >
                          Skip
                        </Button>
                      </Stack>

                      {instantKitCount >= MAX_KIT_LIMIT && (
                        <Typography variant="caption" sx={{ color: '#888' }}>
                          Maximum {MAX_KIT_LIMIT} kits allowed.
                        </Typography>
                      )}

                      {instantKitCount > 0 && (
                        <Box sx={{ mt: 0.5, p: 1.25, bgcolor: 'rgba(58,158,40,0.07)', borderRadius: 2 }}>
                          <Typography variant="caption">
                            {instantKitCount} Instant Kit{instantKitCount > 1 ? 's' : ''} added · ₹{instantKitTotal}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </>
            )}
          </Grid>

          {/* ── RIGHT COLUMN — Book Service ── */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Book Service
                </Typography>

                <TextField
                  fullWidth
                  label="Select Date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                />

                {/* Time Slot Dropdown */}
                <TextField
                  fullWidth
                  label="Select Time"
                  value={selectedTime ? timeSlots.find((s) => s.value === selectedTime)?.label || selectedTime : ''}
                  onClick={(e) => setTimeAnchorEl(e.currentTarget)}
                  inputProps={{ readOnly: true, style: { cursor: 'pointer' } }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <MdExpandMore
                          size={20}
                          style={{
                            color: '#888',
                            transform: timeAnchorEl ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                            cursor: 'pointer'
                          }}
                        />
                      </InputAdornment>
                    )
                  }}
                  sx={{ mb: 2, cursor: 'pointer' }}
                />
                <Popover
                  open={Boolean(timeAnchorEl)}
                  anchorEl={timeAnchorEl}
                  onClose={() => setTimeAnchorEl(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  PaperProps={{
                    sx: {
                      width: timeAnchorEl?.offsetWidth || 300,
                      p: 1.5,
                      mt: 0.5,
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {timeSlots.map((slot) => {
                      const isSelected = selectedTime === slot.value;
                      return (
                        <Box
                          key={slot.value}
                          onClick={() => {
                            setSelectedTime(slot.value);
                            setTimeAnchorEl(null);
                          }}
                          sx={{
                            px: 1.5,
                            py: 0.75,
                            borderRadius: 1.5,
                            border: '1.5px solid',
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            bgcolor: isSelected ? 'primary.main' : 'background.paper',
                            color: isSelected ? '#fff' : 'text.primary',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: isSelected ? 600 : 400,
                            userSelect: 'none',
                            transition: 'all 0.15s ease',
                            whiteSpace: 'nowrap',
                            '&:hover': {
                              borderColor: 'primary.main',
                              bgcolor: isSelected ? 'primary.dark' : 'primary.50',
                              color: isSelected ? '#fff' : 'primary.main'
                            }
                          }}
                        >
                          {slot.label}
                        </Box>
                      );
                    })}
                  </Box>
                </Popover>

                <TextField
                  fullWidth
                  label="Street Address"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Enter street address"
                  sx={{ mb: 2 }}
                />

                {/* Zip + Country */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Zip Code"
                      value={zip}
                      onChange={(e) => {
                        const cleanZip = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setZip(cleanZip);
                        if (zipError) setZipError('');
                        if (cleanZip.length === 6) autofillAddressFromPincode(cleanZip);
                      }}
                      placeholder="Enter 6-digit pincode"
                      error={Boolean(zipError)}
                      helperText={zipError || (zipLoading ? 'Fetching address details...' : '')}
                      inputProps={{ maxLength: 6 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Enter country"
                    />
                  </Grid>
                </Grid>

                {/* City + District */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter city"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="District"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Enter district"
                    />
                  </Grid>
                </Grid>

                {/* State */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Enter state"
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Landmark (Optional)"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Enter nearby landmark (optional)"
                  sx={{ mb: 2 }}
                />

                <FormControl sx={{ mb: 2 }} fullWidth>
                  <FormLabel id="payment-mode-label">Payment Option</FormLabel>
                  <RadioGroup
                    aria-labelledby="payment-mode-label"
                    name="payment-mode"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    <FormControlLabel
                      value="full"
                      control={<Radio />}
                      label={`Pay Full Service Price (₹${service.price})`}
                    />
                    <FormControlLabel
                      value="advance"
                      control={<Radio />}
                      label={`Pay 30% Advance Payment (₹${minAdvance})`}
                    />
                  </RadioGroup>
                </FormControl>

                {formError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {formError}
                  </Alert>
                )}

                {/* ── Payment Summary Box ── */}
                <Box
                  sx={{
                    p: 2.5,
                    bgcolor: 'rgb(255, 247, 237)',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'rgba(249,115,22,0.35)',
                    mb: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, #f97316, #fb923c, #fdba74)',
                      borderRadius: '2px 2px 0 0'
                    }
                  }}
                >
                  {/* Header */}
                  <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: '#fff3e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <MdReceipt size={17} color="#f97316" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1a1a1a', lineHeight: 1.2 }}>
                        Payment Summary
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#888' }}>
                        Breakdown of your order
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack spacing={0.25}>
                    {/* Service price */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.75 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <MdShoppingBag size={16} color="#f97316" />
                        <Typography variant="body2" sx={{ color: '#555' }}>
                          Service price
                        </Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight={500} sx={{ color: '#1a1a1a' }}>
                        ₹{service.price}
                      </Typography>
                    </Stack>

                    {/* Pooja Kit — only if count > 0 and not skipped */}
                    {poojaKitCount > 0 && !poojaKitSkipped && (
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.75 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <MdCheckCircle size={16} color="#22c55e" />
                          <Typography variant="body2" sx={{ color: '#555' }}>
                            Puja Kit{' '}
                            <Typography component="span" variant="caption" sx={{ color: '#f97316' }}>
                              (×{poojaKitCount})
                            </Typography>
                          </Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight={500} sx={{ color: '#1a1a1a' }}>
                          ₹{poojaKitTotal}
                        </Typography>
                      </Stack>
                    )}

                    {/* Instant Kit — only if count > 0 and not skipped */}
                    {instantKitCount > 0 && !instantKitSkipped && (
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.75 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <MdFlashOn size={16} color="#6366f1" />
                          <Typography variant="body2" sx={{ color: '#555' }}>
                            Instant Kit{' '}
                            <Typography component="span" variant="caption" sx={{ color: '#6366f1' }}>
                              (×{instantKitCount})
                            </Typography>
                          </Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight={500} sx={{ color: '#1a1a1a' }}>
                          ₹{instantKitTotal}
                        </Typography>
                      </Stack>
                    )}

                    {/* Delivery charge */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.75 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <MdDeliveryDining size={16} color="#6366f1" />
                        <Typography variant="body2" sx={{ color: '#555' }}>
                          Delivery charge
                        </Typography>
                      </Stack>
                      <Chip
                        label="FREE"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 10,
                          fontWeight: 'bold',
                          bgcolor: '#dcfce7',
                          color: '#16a34a',
                          border: '1px solid #86efac',
                          '& .MuiChip-label': { px: 1 }
                        }}
                      />
                    </Stack>

                    {/* Handling charge */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.75 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <MdInventory2 size={16} color="#0ea5e9" />
                        <Typography variant="body2" sx={{ color: '#555' }}>
                          Handling charge
                        </Typography>
                      </Stack>
                      <Chip
                        label="FREE"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 10,
                          fontWeight: 'bold',
                          bgcolor: '#dcfce7',
                          color: '#16a34a',
                          border: '1px solid #86efac',
                          '& .MuiChip-label': { px: 1 }
                        }}
                      />
                    </Stack>

                    {/* Platform fee */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.75 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <MdCreditCard size={16} color="#22c55e" />
                        <Typography variant="body2" sx={{ color: '#555' }}>
                          Platform fee
                        </Typography>
                      </Stack>
                      <Chip
                        label="FREE"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 10,
                          fontWeight: 'bold',
                          bgcolor: '#dcfce7',
                          color: '#16a34a',
                          border: '1px solid #86efac',
                          '& .MuiChip-label': { px: 1 }
                        }}
                      />
                    </Stack>

                    {/* Remaining on completion */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.75 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <MdAccessTime size={16} color="#a78bfa" />
                        <Typography variant="body2" sx={{ color: '#555' }}>
                          Remaining (on completion)
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ color: '#888' }}>
                        ₹{remainingAmount}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Divider sx={{ borderStyle: 'dashed', borderColor: 'rgba(249,115,22,0.3)', my: 1.5 }} />

                  {/* Paying now */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <MdAccountBalanceWallet size={18} color="#f97316" />
                      <Typography variant="body2" fontWeight={600} sx={{ color: '#1a1a1a' }}>
                        Paying now
                      </Typography>
                    </Stack>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#f97316' }}>
                      ₹{grandTotal}
                    </Typography>
                  </Stack>

                  {/* GST note */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 0.75,
                      p: 1.25,
                      bgcolor: 'rgba(249,115,22,0.07)',
                      borderRadius: 1.5,
                      border: '1px dashed rgba(249,115,22,0.4)'
                    }}
                  >
                    <MdInfoOutline size={15} color="#f97316" style={{ marginTop: 1, flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ color: '#555' }} lineHeight={1.5}>
                      <strong style={{ color: '#92400e' }}>GST Inclusive:</strong> All prices displayed are inclusive of
                      applicable GST.
                    </Typography>
                  </Box>
                </Box>
                {/* ── End Payment Summary Box ── */}

                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                  <Button onClick={() => router.push(`/${slug}`)}>Back</Button>
                  <Button
                    variant="contained"
                    onClick={handleProceedToPayment}
                    disabled={
                      !selectedDate || !selectedTime || !streetAddress || !city || !district || !state || !country
                    }
                  >
                    Proceed to Payment
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>

      {paymentDialogOpen && selectedDate && selectedTime && streetAddress && city && district && state && country && (
        <BookingPaymentDialog
          open={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          bookingData={{
            vendorId: vendor.id,
            serviceId: service.id,
            poojaType: service.poojaType,
            package: service.poojaType,
            dateTime: new Date(`${selectedDate}T${selectedTime}`).toISOString(),
            duration: service.duration,
            address: { streetAddress, landmark, city, district, state, country, zip },
            pujaSamagri: buildPujaSamagriPayload({
              pujaKit: poojaKit,
              pujaQty: poojaKitCount,
              pujaSkipped: poojaKitSkipped,
              instantKit,
              instantQty: instantKitCount,
              instantSkipped: instantKitSkipped
            }),
            paymentAmount: grandTotal,
            totalAmount: service.price,
            addons: {
              poojaKit:
                poojaKitCount > 0 && !poojaKitSkipped && poojaKit.id
                  ? {
                    productId: poojaKit.id,
                    name: poojaKit.name,
                    price: poojaKit.price,
                    quantity: poojaKitCount
                  }
                  : null,
              instantKit:
                instantKitCount > 0 && !instantKitSkipped && instantKit.id
                  ? {
                    productId: instantKit.id,
                    name: instantKit.name,
                    price: instantKit.price,
                    quantity: instantKitCount
                  }
                  : null
            }
          }}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}
    </Container>
  );
}