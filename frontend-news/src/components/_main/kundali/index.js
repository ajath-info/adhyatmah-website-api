// 'use client';
// import React, { useState } from 'react';

// // mui
// import {
//     Box,
//     Card,
//     Grid,
//     Stack,
//     Chip,
//     Button,
//     MenuItem,
//     TextField,
//     ToggleButton,
//     ToggleButtonGroup,
//     Typography,
//     Alert,
//     CircularProgress,
//     Divider
// } from '@mui/material';

// // icons
// import { HiOutlineLocationMarker, HiOutlineUser } from 'react-icons/hi';
// import { BsCalendarEvent, BsClock } from 'react-icons/bs';
// import { TbSparkles } from 'react-icons/tb';

// // services
// import { generateKundali } from '@/services/kundali-service';

// // Same known-city list the Panchang module offers, so users get a quick
// // picker without needing a separate geocoding service. Kept local to this
// // component (not imported from panchang) so the two modules stay decoupled
// // and neither can break the other if one changes later.
// const BIRTH_PLACE_OPTIONS = [
//     { city: 'New Delhi', lat: 28.6139, lng: 77.209 },
//     { city: 'Mumbai', lat: 19.076, lng: 72.8777 },
//     { city: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
//     { city: 'Kolkata', lat: 22.5726, lng: 88.3639 },
//     { city: 'Chennai', lat: 13.0827, lng: 80.2707 },
//     { city: 'Hyderabad', lat: 17.385, lng: 78.4867 },
//     { city: 'Pune', lat: 18.5204, lng: 73.8567 },
//     { city: 'Jaipur', lat: 26.9124, lng: 75.7873 },
//     { city: 'Lucknow', lat: 26.8467, lng: 80.9462 },
//     { city: 'Varanasi', lat: 25.3176, lng: 82.9739 }
// ];

// const EMPTY_FORM = {
//     name: '',
//     gender: 'male',
//     dob: '',
//     tob: '',
//     birthPlace: '',
//     lat: '',
//     lng: '',
//     chartStyle: 'north-indian'
// };

// function DetailRow({ label, value }) {
//     if (!value && value !== 0) return null;
//     return (
//         <Stack direction="row" justifyContent="space-between" sx={{ py: 1 }}>
//             <Typography variant="body2" sx={{ color: 'text.secondary' }}>
//                 {label}
//             </Typography>
//             <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                 {value}
//             </Typography>
//         </Stack>
//     );
// }

// function ChartCard({ title, svg }) {
//     return (
//         <Card
//             sx={{
//                 p: 2,
//                 height: '100%',
//                 borderRadius: 2,
//                 border: (theme) => `1px solid ${theme.palette.divider}`
//             }}
//         >
//             <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
//                 {title}
//             </Typography>
//             {svg ? (
//                 <Box
//                     sx={{ width: '100%', '& svg': { width: '100%', height: 'auto' } }}
//                     dangerouslySetInnerHTML={{ __html: svg }}
//                 />
//             ) : (
//                 <Alert severity="info" variant="outlined">
//                     Chart image unavailable right now.
//                 </Alert>
//             )}
//         </Card>
//     );
// }

// function DoshaChip({ label, dosha }) {
//     if (!dosha || dosha.hasDosha === undefined) return null;
//     return (
//         <Chip
//             label={`${label}: ${dosha.hasDosha ? 'Present' : 'Not Present'}`}
//             color={dosha.hasDosha ? 'warning' : 'success'}
//             variant="outlined"
//             sx={{ fontWeight: 600 }}
//         />
//     );
// }

// export default function KundaliGeneration() {
//     const [form, setForm] = useState(EMPTY_FORM);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [result, setResult] = useState(null);

//     const handleChange = (field) => (event) => {
//         setForm((prev) => ({ ...prev, [field]: event.target.value }));
//     };

//     const handlePlaceSelect = (event) => {
//         const selected = BIRTH_PLACE_OPTIONS.find((c) => c.city === event.target.value);
//         if (selected) {
//             setForm((prev) => ({
//                 ...prev,
//                 birthPlace: selected.city,
//                 lat: selected.lat,
//                 lng: selected.lng
//             }));
//         }
//     };

//     const handleChartStyle = (event, value) => {
//         if (value) setForm((prev) => ({ ...prev, chartStyle: value }));
//     };

//     const isValid =
//         form.name.trim() &&
//         form.dob &&
//         form.tob &&
//         form.birthPlace &&
//         form.lat !== '' &&
//         form.lng !== '';

//     const handleSubmit = async (event) => {
//         event.preventDefault();
//         if (!isValid) return;

//         setLoading(true);
//         setError('');
//         setResult(null);

//         try {
//             const response = await generateKundali(form);
//             if (response.success) {
//                 setResult(response.data);
//             } else {
//                 setError(response.message || 'Could not generate Kundali. Please try again.');
//             }
//         } catch (err) {
//             setError(
//                 err?.response?.data?.message ||
//                 'Kundali generation is temporarily unavailable. Please try again in a moment.'
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <Grid container spacing={3}>
//             {/* --- Birth Details Form --- */}
//             <Grid item xs={12} md={result ? 4 : 12} lg={result ? 4 : 8} sx={{ mx: result ? 0 : 'auto' }}>
//                 <Card
//                     component="form"
//                     onSubmit={handleSubmit}
//                     sx={{ p: 3, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}
//                 >
//                     <Typography variant="h6" sx={{ mb: 2 }}>
//                         Enter Birth Details
//                     </Typography>

//                     <Stack spacing={2.5}>
//                         <TextField
//                             label="Full Name"
//                             value={form.name}
//                             onChange={handleChange('name')}
//                             required
//                             fullWidth
//                             InputProps={{ startAdornment: <HiOutlineUser style={{ marginRight: 8 }} /> }}
//                         />

//                         <TextField
//                             select
//                             label="Gender"
//                             value={form.gender}
//                             onChange={handleChange('gender')}
//                             fullWidth
//                         >
//                             <MenuItem value="male">Male</MenuItem>
//                             <MenuItem value="female">Female</MenuItem>
//                             <MenuItem value="other">Other</MenuItem>
//                         </TextField>

//                         <TextField
//                             label="Date of Birth"
//                             type="date"
//                             value={form.dob}
//                             onChange={handleChange('dob')}
//                             required
//                             fullWidth
//                             InputLabelProps={{ shrink: true }}
//                             InputProps={{ startAdornment: <BsCalendarEvent style={{ marginRight: 8 }} /> }}
//                         />

//                         <TextField
//                             label="Time of Birth"
//                             type="time"
//                             value={form.tob}
//                             onChange={handleChange('tob')}
//                             required
//                             fullWidth
//                             InputLabelProps={{ shrink: true }}
//                             InputProps={{ startAdornment: <BsClock style={{ marginRight: 8 }} /> }}
//                         />

//                         <TextField
//                             select
//                             label="Birth Place"
//                             value={form.birthPlace}
//                             onChange={handlePlaceSelect}
//                             required
//                             fullWidth
//                             InputProps={{ startAdornment: <HiOutlineLocationMarker style={{ marginRight: 8 }} /> }}
//                             helperText="Don't see your city? Enter latitude/longitude manually below."
//                         >
//                             {BIRTH_PLACE_OPTIONS.map((c) => (
//                                 <MenuItem key={c.city} value={c.city}>
//                                     {c.city}
//                                 </MenuItem>
//                             ))}
//                         </TextField>

//                         <Stack direction="row" spacing={2}>
//                             <TextField
//                                 label="Latitude"
//                                 type="number"
//                                 value={form.lat}
//                                 onChange={handleChange('lat')}
//                                 fullWidth
//                             />
//                             <TextField
//                                 label="Longitude"
//                                 type="number"
//                                 value={form.lng}
//                                 onChange={handleChange('lng')}
//                                 fullWidth
//                             />
//                         </Stack>

//                         <Box>
//                             <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
//                                 Chart Style
//                             </Typography>
//                             <ToggleButtonGroup
//                                 value={form.chartStyle}
//                                 exclusive
//                                 onChange={handleChartStyle}
//                                 size="small"
//                                 fullWidth
//                             >
//                                 <ToggleButton value="north-indian">North Indian</ToggleButton>
//                                 <ToggleButton value="south-indian">South Indian</ToggleButton>
//                                 <ToggleButton value="east-indian">East Indian</ToggleButton>
//                             </ToggleButtonGroup>
//                         </Box>

//                         {error && <Alert severity="error">{error}</Alert>}

//                         <Button
//                             type="submit"
//                             variant="contained"
//                             size="large"
//                             disabled={!isValid || loading}
//                             startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <TbSparkles />}
//                         >
//                             {loading ? 'Generating Kundali...' : 'Generate Kundali'}
//                         </Button>
//                     </Stack>
//                 </Card>
//             </Grid>

//             {/* --- Result --- */}
//             {result && (
//                 <Grid item xs={12} md={8} lg={8}>
//                     <Stack spacing={3}>
//                         <Card sx={{ p: 3, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
//                             <Typography variant="h6" sx={{ mb: 1 }}>
//                                 {result.name}&apos;s Kundali
//                             </Typography>
//                             <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
//                                 {result.birthPlace} • {result.dob} • {result.tob}
//                             </Typography>

//                             <Divider sx={{ mb: 1 }} />
//                             <DetailRow label="Nakshatra" value={result.nakshatra} />
//                             <DetailRow label="Pada" value={result.pada} />
//                             <DetailRow label="Moon Sign (Chandra Rashi)" value={result.chandraRasi} />
//                             <DetailRow label="Sun Sign (Soorya Rashi)" value={result.sooryaRasi} />
//                             <DetailRow label="Zodiac Sign" value={result.zodiac} />
//                             <DetailRow label="Ascendant (Lagna)" value={result.lagna} />
//                             <DetailRow label="Yoga" value={result.yoga} />

//                             <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mt: 2, rowGap: 1 }}>
//                                 {result.manglikStatus !== undefined && (
//                                     <Chip
//                                         label={`Manglik: ${result.manglikStatus ? 'Yes' : 'No'}`}
//                                         color={result.manglikStatus ? 'warning' : 'success'}
//                                         variant="outlined"
//                                         sx={{ fontWeight: 600 }}
//                                     />
//                                 )}
//                                 <DoshaChip label="Mangal Dosha" dosha={result.mangalDosha} />
//                                 <DoshaChip label="Kaal Sarp Dosha" dosha={result.kaalSarpDosha} />
//                             </Stack>
//                         </Card>

//                         <Grid container spacing={3}>
//                             <Grid item xs={12} sm={6}>
//                                 <ChartCard title="Rasi Chart" svg={result.rasiChartSvg} />
//                             </Grid>
//                             <Grid item xs={12} sm={6}>
//                                 <ChartCard title="Navamsa Chart" svg={result.navamsaChartSvg} />
//                             </Grid>
//                         </Grid>
//                     </Stack>
//                 </Grid>
//             )}
//         </Grid>
//     );
// }



'use client';
import React, { useState } from 'react';

// mui
import {
    Box,
    Card,
    Grid,
    Stack,
    Chip,
    Button,
    MenuItem,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    Alert,
    CircularProgress,
    Divider
} from '@mui/material';

// icons
import { HiOutlineLocationMarker, HiOutlineUser } from 'react-icons/hi';
import { BsCalendarEvent, BsClock } from 'react-icons/bs';
import { TbSparkles } from 'react-icons/tb';

// services
import { generateKundali } from '@/services/kundali-service';

// Same known-city list the Panchang module offers, so users get a quick
// picker without needing a separate geocoding service. Kept local to this
// component (not imported from panchang) so the two modules stay decoupled
// and neither can break the other if one changes later.
const BIRTH_PLACE_OPTIONS = [
    { city: 'New Delhi', lat: 28.6139, lng: 77.209 },
    { city: 'Mumbai', lat: 19.076, lng: 72.8777 },
    { city: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
    { city: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { city: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { city: 'Hyderabad', lat: 17.385, lng: 78.4867 },
    { city: 'Pune', lat: 18.5204, lng: 73.8567 },
    { city: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    { city: 'Lucknow', lat: 26.8467, lng: 80.9462 },
    { city: 'Varanasi', lat: 25.3176, lng: 82.9739 }
];

const EMPTY_FORM = {
    name: '',
    gender: 'male',
    dob: '',
    tob: '',
    birthPlace: '',
    lat: '',
    lng: '',
    chartStyle: 'north-indian'
};

function DetailRow({ label, value }) {
    if (!value && value !== 0) return null;
    return (
        <Stack direction="row" justifyContent="space-between" sx={{ py: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {value}
            </Typography>
        </Stack>
    );
}

// Native <input type="time"> renders in 24h or 12h format based on the
// OS/browser locale, not anything we control from the page (the earlier
// lang="en-US" attempt doesn't reliably force AM/PM in Chrome). This is a
// custom Hour / Minute / AM-PM picker instead, so AM/PM is always shown
// and selectable no matter the visitor's system settings. Internally it
// still stores/emits a 24-hour "HH:mm" string, so the rest of the form
// (and the backend, which expects 24h HH:mm) doesn't need to change.
const HOUR_12_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

function parseTo12Hour(value) {
    if (!value) return { hour: '', minute: '', period: 'AM' };
    const [hStr, mStr] = value.split(':');
    const h = parseInt(hStr, 10);
    const period = h >= 12 ? 'PM' : 'AM';
    let hour12 = h % 12;
    if (hour12 === 0) hour12 = 12;
    return { hour: String(hour12).padStart(2, '0'), minute: mStr, period };
}

function to24Hour(hour, minute, period) {
    if (!hour || !minute || !period) return '';
    let h = parseInt(hour, 10) % 12;
    if (period === 'PM') h += 12;
    return `${String(h).padStart(2, '0')}:${minute}`;
}

function TimeOfBirthPicker({ value, onChange, label = 'Time of Birth' }) {
    const { hour, minute, period } = parseTo12Hour(value);

    const handleHour = (event) => onChange(to24Hour(event.target.value, minute || '00', period));
    const handleMinute = (event) => onChange(to24Hour(hour || '12', event.target.value, period));
    const handlePeriod = (event) => onChange(to24Hour(hour || '12', minute || '00', event.target.value));

    return (
        <Box>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                {label} *
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
                <BsClock style={{ flexShrink: 0 }} />
                <TextField select label="Hour" value={hour} onChange={handleHour} required sx={{ width: 90 }}>
                    {HOUR_12_OPTIONS.map((h) => (
                        <MenuItem key={h} value={h}>
                            {h}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField select label="Minute" value={minute} onChange={handleMinute} required sx={{ width: 90 }}>
                    {MINUTE_OPTIONS.map((m) => (
                        <MenuItem key={m} value={m}>
                            {m}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField select label="AM/PM" value={period} onChange={handlePeriod} required sx={{ width: 100 }}>
                    <MenuItem value="AM">AM</MenuItem>
                    <MenuItem value="PM">PM</MenuItem>
                </TextField>
            </Stack>
        </Box>
    );
}

function ChartCard({ title, svg }) {
    return (
        <Card
            sx={{
                p: 2,
                height: '100%',
                borderRadius: 2,
                border: (theme) => `1px solid ${theme.palette.divider}`
            }}
        >
            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                {title}
            </Typography>
            {svg ? (
                <Box
                    sx={{ width: '100%', '& svg': { width: '100%', height: 'auto' } }}
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            ) : (
                <Alert severity="info" variant="outlined">
                    Chart image unavailable right now.
                </Alert>
            )}
        </Card>
    );
}

function AvakhadaChakraCard({ chakra }) {
    if (!chakra) return null;
    const rows = [
        ['Varna', chakra.varna],
        ['Vashya', chakra.vashya],
        ['Yoni', chakra.yoni],
        ['Gana', chakra.gana],
        ['Nadi', chakra.nadi],
        ['Sign Lord', chakra.signLord],
        ['Nakshatra Lord', chakra.nakshatraLord],
        ['Tatva', chakra.tatva],
        ['Paya', chakra.paya],
        ['Name Alphabet', chakra.nameAlphabet],
        ['Deity', chakra.deity],
        ['Symbol', chakra.symbol],
        ['Birth Stone', chakra.birthStone]
    ].filter(([, value]) => value);

    if (!rows.length) return null;

    return (
        <Card sx={{ p: 3, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
                Avakhada Chakra
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Grid container>
                {rows.map(([label, value]) => (
                    <Grid item xs={12} sm={6} key={label}>
                        <DetailRow label={label} value={value} />
                    </Grid>
                ))}
            </Grid>
        </Card>
    );
}

function PlanetaryPositionsCard({ positions }) {
    if (!positions || !positions.length) return null;
    return (
        <Card sx={{ p: 3, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
                Planetary Positions
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                    <Box component="thead">
                        <Box component="tr">
                            {['Planet', 'Rashi', 'Longitude', 'Nakshatra', 'Pada'].map((h) => (
                                <Box
                                    component="th"
                                    key={h}
                                    sx={{
                                        textAlign: 'left',
                                        py: 1,
                                        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                                        color: 'text.secondary',
                                        fontSize: 13
                                    }}
                                >
                                    {h}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                    <Box component="tbody">
                        {positions.map((p, idx) => (
                            <Box component="tr" key={`${p.planet}-${idx}`}>
                                <Box component="td" sx={{ py: 1, fontWeight: 600 }}>
                                    {p.planet}
                                </Box>
                                <Box component="td" sx={{ py: 1 }}>
                                    {p.rashi || '—'}
                                </Box>
                                <Box component="td" sx={{ py: 1 }}>
                                    {p.longitude || '—'}
                                </Box>
                                <Box component="td" sx={{ py: 1 }}>
                                    {p.nakshatra || '—'}
                                </Box>
                                <Box component="td" sx={{ py: 1 }}>
                                    {p.pada || '—'}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Card>
    );
}

// Prokerala returns full ISO datetimes for dasha start/end — display just
// the date, e.g. "14 May 2010".
function formatDate(isoString) {
    if (!isoString) return '—';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function DashaPeriodsCard({ periods }) {
    if (!periods || !periods.length) return null;
    return (
        <Card sx={{ p: 3, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
                Vimshottari Mahadasha
            </Typography>
            <Stack spacing={1}>
                {periods.map((p, idx) => (
                    <Stack
                        key={`${p.planet}-${idx}`}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                            py: 1,
                            px: 1.5,
                            borderRadius: 1,
                            bgcolor: p.isCurrent ? 'primary.lighter' : 'transparent',
                            border: (theme) => `1px solid ${p.isCurrent ? theme.palette.primary.main : theme.palette.divider}`
                        }}
                    >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {p.planet} {p.isCurrent && <Chip label="Current" size="small" color="primary" sx={{ ml: 1 }} />}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {formatDate(p.start)} – {formatDate(p.end)}
                        </Typography>
                    </Stack>
                ))}
            </Stack>
        </Card>
    );
}

function DoshaChip({ label, dosha }) {
    if (!dosha || dosha.hasDosha === undefined) return null;
    return (
        <Chip
            label={`${label}: ${dosha.hasDosha ? 'Present' : 'Not Present'}`}
            color={dosha.hasDosha ? 'warning' : 'success'}
            variant="outlined"
            sx={{ fontWeight: 600 }}
        />
    );
}

export default function KundaliGeneration() {
    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const handleChange = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handlePlaceSelect = (event) => {
        const selected = BIRTH_PLACE_OPTIONS.find((c) => c.city === event.target.value);
        if (selected) {
            setForm((prev) => ({
                ...prev,
                birthPlace: selected.city,
                lat: selected.lat,
                lng: selected.lng
            }));
        }
    };

    const handleChartStyle = (event, value) => {
        if (value) setForm((prev) => ({ ...prev, chartStyle: value }));
    };

    const isValid =
        form.name.trim() &&
        form.dob &&
        form.tob &&
        form.birthPlace &&
        form.lat !== '' &&
        form.lng !== '';

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!isValid) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await generateKundali(form);
            if (response.success) {
                setResult(response.data);
            } else {
                setError(response.message || 'Could not generate Kundali. Please try again.');
            }
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                'Kundali generation is temporarily unavailable. Please try again in a moment.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid container spacing={3}>
            {/* --- Birth Details Form --- */}
            <Grid item xs={12} md={result ? 4 : 12} lg={result ? 4 : 8} sx={{ mx: result ? 0 : 'auto' }}>
                <Card
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ p: 3, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Enter Birth Details
                    </Typography>

                    <Stack spacing={2.5}>
                        <TextField
                            label="Full Name"
                            value={form.name}
                            onChange={handleChange('name')}
                            required
                            fullWidth
                            InputProps={{ startAdornment: <HiOutlineUser style={{ marginRight: 8 }} /> }}
                        />

                        <TextField
                            select
                            label="Gender"
                            value={form.gender}
                            onChange={handleChange('gender')}
                            fullWidth
                        >
                            <MenuItem value="male">Male</MenuItem>
                            <MenuItem value="female">Female</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </TextField>

                        <TextField
                            label="Date of Birth"
                            type="date"
                            value={form.dob}
                            onChange={handleChange('dob')}
                            required
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            InputProps={{ startAdornment: <BsCalendarEvent style={{ marginRight: 8 }} /> }}
                        />

                        <TimeOfBirthPicker
                            value={form.tob}
                            onChange={(val) => setForm((prev) => ({ ...prev, tob: val }))}
                        />

                        <TextField
                            select
                            label="Birth Place"
                            value={form.birthPlace}
                            onChange={handlePlaceSelect}
                            required
                            fullWidth
                            InputProps={{ startAdornment: <HiOutlineLocationMarker style={{ marginRight: 8 }} /> }}
                            helperText="Don't see your city? Enter latitude/longitude manually below."
                        >
                            {BIRTH_PLACE_OPTIONS.map((c) => (
                                <MenuItem key={c.city} value={c.city}>
                                    {c.city}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Latitude"
                                type="number"
                                value={form.lat}
                                onChange={handleChange('lat')}
                                fullWidth
                            />
                            <TextField
                                label="Longitude"
                                type="number"
                                value={form.lng}
                                onChange={handleChange('lng')}
                                fullWidth
                            />
                        </Stack>

                        <Box>
                            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                                Chart Style
                            </Typography>
                            <ToggleButtonGroup
                                value={form.chartStyle}
                                exclusive
                                onChange={handleChartStyle}
                                size="small"
                                fullWidth
                            >
                                <ToggleButton value="north-indian">North Indian</ToggleButton>
                                <ToggleButton value="south-indian">South Indian</ToggleButton>
                                <ToggleButton value="east-indian">East Indian</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        {error && <Alert severity="error">{error}</Alert>}

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={!isValid || loading}
                            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <TbSparkles />}
                        >
                            {loading ? 'Generating Kundali...' : 'Generate Kundali'}
                        </Button>
                    </Stack>
                </Card>
            </Grid>

            {/* --- Result --- */}
            {result && (
                <Grid item xs={12} md={8} lg={8}>
                    <Stack spacing={3}>
                        <Card sx={{ p: 3, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                {result.name}&apos;s Kundali
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                                {result.birthPlace} • {result.dob} • {result.tob}
                            </Typography>

                            <Divider sx={{ mb: 1 }} />
                            <DetailRow label="Nakshatra" value={result.nakshatra} />
                            <DetailRow label="Pada" value={result.pada} />
                            <DetailRow label="Moon Sign (Chandra Rashi)" value={result.chandraRasi} />
                            <DetailRow label="Sun Sign (Soorya Rashi)" value={result.sooryaRasi} />
                            <DetailRow label="Zodiac Sign" value={result.zodiac} />
                            <DetailRow label="Ascendant (Lagna)" value={result.lagna} />
                            <DetailRow label="Yoga" value={result.yoga} />

                            <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mt: 2, rowGap: 1 }}>
                                {result.manglikStatus !== undefined && (
                                    <Chip
                                        label={`Manglik: ${result.manglikStatus ? 'Yes' : 'No'}`}
                                        color={result.manglikStatus ? 'warning' : 'success'}
                                        variant="outlined"
                                        sx={{ fontWeight: 600 }}
                                    />
                                )}
                                <DoshaChip label="Mangal Dosha" dosha={result.mangalDosha} />
                                <DoshaChip label="Kaal Sarp Dosha" dosha={result.kaalSarpDosha} />
                            </Stack>
                        </Card>

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <ChartCard title="Rasi Chart" svg={result.rasiChartSvg} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <ChartCard title="Navamsa Chart" svg={result.navamsaChartSvg} />
                            </Grid>
                        </Grid>

                        <AvakhadaChakraCard chakra={result.avakhadaChakra} />
                        <PlanetaryPositionsCard positions={result.planetaryPositions} />
                        <DashaPeriodsCard periods={result.dashaPeriods} />
                    </Stack>
                </Grid>
            )}
        </Grid>
    );
}