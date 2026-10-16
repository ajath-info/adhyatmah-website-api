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
//     Typography,
//     Alert,
//     CircularProgress,
//     Divider,
//     LinearProgress,
//     Table,
//     TableHead,
//     TableBody,
//     TableRow,
//     TableCell
// } from '@mui/material';

// // icons
// import { HiOutlineLocationMarker, HiOutlineUser } from 'react-icons/hi';
// import { BsCalendarEvent, BsClock } from 'react-icons/bs';
// import { TbHeartHandshake } from 'react-icons/tb';

// // services
// import { generateKundaliMatch } from '@/services/kundali-matching-service';

// // Same known-city list the Kundali/Panchang modules offer, so users get a
// // quick picker without needing a separate geocoding service. Kept local to
// // this component (not imported from elsewhere) so all three modules stay
// // decoupled and neither can break the others if one changes later.
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

// const EMPTY_PERSON = {
//     name: '',
//     dob: '',
//     tob: '',
//     birthPlace: '',
//     lat: '',
//     lng: ''
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

// // Native <input type="time"> renders in 24h or 12h format based on the
// // OS/browser locale, not anything we control from the page (the earlier
// // lang="en-US" attempt doesn't reliably force AM/PM in Chrome). This is a
// // custom Hour / Minute / AM-PM picker instead, so AM/PM is always shown
// // and selectable no matter the visitor's system settings. Internally it
// // still stores/emits a 24-hour "HH:mm" string, so the rest of the form
// // (and the backend, which expects 24h HH:mm) doesn't need to change.
// const HOUR_12_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
// const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

// function parseTo12Hour(value) {
//     if (!value) return { hour: '', minute: '', period: 'AM' };
//     const [hStr, mStr] = value.split(':');
//     const h = parseInt(hStr, 10);
//     const period = h >= 12 ? 'PM' : 'AM';
//     let hour12 = h % 12;
//     if (hour12 === 0) hour12 = 12;
//     return { hour: String(hour12).padStart(2, '0'), minute: mStr, period };
// }

// function to24Hour(hour, minute, period) {
//     if (!hour || !minute || !period) return '';
//     let h = parseInt(hour, 10) % 12;
//     if (period === 'PM') h += 12;
//     return `${String(h).padStart(2, '0')}:${minute}`;
// }

// function TimeOfBirthPicker({ value, onChange, label = 'Time of Birth' }) {
//     const { hour, minute, period } = parseTo12Hour(value);

//     const handleHour = (event) => onChange(to24Hour(event.target.value, minute || '00', period));
//     const handleMinute = (event) => onChange(to24Hour(hour || '12', event.target.value, period));
//     const handlePeriod = (event) => onChange(to24Hour(hour || '12', minute || '00', event.target.value));

//     return (
//         <Box>
//             <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
//                 {label} *
//             </Typography>
//             <Stack direction="row" spacing={1.5} alignItems="center">
//                 <BsClock style={{ flexShrink: 0 }} />
//                 <TextField select label="Hour" value={hour} onChange={handleHour} required sx={{ width: 90 }}>
//                     {HOUR_12_OPTIONS.map((h) => (
//                         <MenuItem key={h} value={h}>
//                             {h}
//                         </MenuItem>
//                     ))}
//                 </TextField>
//                 <TextField select label="Minute" value={minute} onChange={handleMinute} required sx={{ width: 90 }}>
//                     {MINUTE_OPTIONS.map((m) => (
//                         <MenuItem key={m} value={m}>
//                             {m}
//                         </MenuItem>
//                     ))}
//                 </TextField>
//                 <TextField select label="AM/PM" value={period} onChange={handlePeriod} required sx={{ width: 100 }}>
//                     <MenuItem value="AM">AM</MenuItem>
//                     <MenuItem value="PM">PM</MenuItem>
//                 </TextField>
//             </Stack>
//         </Box>
//     );
// }

// // One half of the two-column birth-details form (Boy / Girl) — kept as a
// // standalone component so the form section stays readable, same spirit as
// // the field layout already used in the Kundali Generation form.
// function PersonFormCard({ title, person, onChange, onPlaceSelect }) {
//     return (
//         <Card sx={{ p: 3, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}`, height: '100%' }}>
//             <Typography variant="h6" sx={{ mb: 2 }}>
//                 {title}
//             </Typography>

//             <Stack spacing={2.5}>
//                 <TextField
//                     label="Full Name"
//                     value={person.name}
//                     onChange={onChange('name')}
//                     required
//                     fullWidth
//                     InputProps={{ startAdornment: <HiOutlineUser style={{ marginRight: 8 }} /> }}
//                 />

//                 <TextField
//                     label="Date of Birth"
//                     type="date"
//                     value={person.dob}
//                     onChange={onChange('dob')}
//                     required
//                     fullWidth
//                     InputLabelProps={{ shrink: true }}
//                     InputProps={{ startAdornment: <BsCalendarEvent style={{ marginRight: 8 }} /> }}
//                 />

//                 <TimeOfBirthPicker
//                     value={person.tob}
//                     onChange={(val) => onChange('tob')({ target: { value: val } })}
//                 />

//                 <TextField
//                     select
//                     label="Birth Place"
//                     value={person.birthPlace}
//                     onChange={onPlaceSelect}
//                     required
//                     fullWidth
//                     InputProps={{ startAdornment: <HiOutlineLocationMarker style={{ marginRight: 8 }} /> }}
//                     helperText="Don't see the city? Enter latitude/longitude manually below."
//                     SelectProps={{ native: true }}
//                 >
//                     <option value="" />
//                     {BIRTH_PLACE_OPTIONS.map((c) => (
//                         <option key={c.city} value={c.city}>
//                             {c.city}
//                         </option>
//                     ))}
//                 </TextField>

//                 <Stack direction="row" spacing={2}>
//                     <TextField label="Latitude" type="number" value={person.lat} onChange={onChange('lat')} fullWidth />
//                     <TextField label="Longitude" type="number" value={person.lng} onChange={onChange('lng')} fullWidth />
//                 </Stack>
//             </Stack>
//         </Card>
//     );
// }

// // Big circular-style score summary — the "X / 36" headline that anchors
// // matchmaking report pages like astrotalk.com/matchmaking.
// function ScoreSummaryCard({ result }) {
//     const total = result.totalPoints ?? 0;
//     const max = result.maxPoints || 36;
//     const percent = Math.min(100, Math.round((total / max) * 100));

//     let verdict = 'Average Match';
//     let color = 'warning';
//     if (percent >= 70) {
//         verdict = 'Excellent Match';
//         color = 'success';
//     } else if (percent >= 50) {
//         verdict = 'Good Match';
//         color = 'info';
//     } else if (percent < 30) {
//         verdict = 'Not Recommended';
//         color = 'error';
//     }

//     return (
//         <Card sx={{ p: 3, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
//             <Typography variant="overline" sx={{ color: 'text.secondary' }}>
//                 Ashtakoot Guna Milan
//             </Typography>
//             <Typography variant="h2" sx={{ fontWeight: 700, my: 1 }}>
//                 {total}
//                 <Typography component="span" variant="h5" sx={{ color: 'text.secondary' }}>
//                     {' '}/ {max}
//                 </Typography>
//             </Typography>
//             <Chip label={verdict} color={color} sx={{ fontWeight: 600, mb: 2 }} />
//             <LinearProgress
//                 variant="determinate"
//                 value={percent}
//                 color={color}
//                 sx={{ height: 10, borderRadius: 5 }}
//             />

//             <Stack direction="row" spacing={1.5} flexWrap="wrap" justifyContent="center" sx={{ mt: 2.5, rowGap: 1 }}>
//                 {result.maleManglik !== undefined && (
//                     <Chip
//                         label={`Boy Manglik: ${result.maleManglik ? 'Yes' : 'No'}`}
//                         color={result.maleManglik ? 'warning' : 'success'}
//                         variant="outlined"
//                         sx={{ fontWeight: 600 }}
//                     />
//                 )}
//                 {result.femaleManglik !== undefined && (
//                     <Chip
//                         label={`Girl Manglik: ${result.femaleManglik ? 'Yes' : 'No'}`}
//                         color={result.femaleManglik ? 'warning' : 'success'}
//                         variant="outlined"
//                         sx={{ fontWeight: 600 }}
//                     />
//                 )}
//                 {result.nadiDosha !== undefined && (
//                     <Chip
//                         label={`Nadi Dosha: ${result.nadiDosha ? 'Present' : 'Not Present'}`}
//                         color={result.nadiDosha ? 'error' : 'success'}
//                         variant="outlined"
//                         sx={{ fontWeight: 600 }}
//                     />
//                 )}
//                 {result.bhakootDosha !== undefined && (
//                     <Chip
//                         label={`Bhakoot Dosha: ${result.bhakootDosha ? 'Present' : 'Not Present'}`}
//                         color={result.bhakootDosha ? 'error' : 'success'}
//                         variant="outlined"
//                         sx={{ fontWeight: 600 }}
//                     />
//                 )}
//                 {result.doshaCancelled && (
//                     <Chip label="Dosha Cancelled" color="info" variant="outlined" sx={{ fontWeight: 600 }} />
//                 )}
//             </Stack>

//             {result.conclusion && (
//                 <Typography variant="body2" sx={{ mt: 2.5, color: 'text.secondary', textAlign: 'left' }}>
//                     {result.conclusion}
//                 </Typography>
//             )}
//         </Card>
//     );
// }

// // The 8-koot Ashtakoot breakdown table (Varna, Vashya, Tara, Yoni, Graha
// // Maitri, Gana, Bhakoot, Nadi) — the core "Guna Milan" table shown on
// // matchmaking report pages like astrotalk.com/matchmaking.
// function KootTable({ koots }) {
//     if (!koots || !koots.length) return null;
//     const hasPersonValues = koots.some((k) => k.boyValue || k.girlValue);

//     return (
//         <Card sx={{ borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
//             <Box sx={{ p: 3, pb: hasPersonValues ? 0 : 3 }}>
//                 <Typography variant="h6" sx={{ mb: hasPersonValues ? 0 : 1 }}>
//                     Ashtakoot Guna Milan
//                 </Typography>
//             </Box>

//             {hasPersonValues && (
//                 <Box sx={{ overflowX: 'auto' }}>
//                     <Table size="small" sx={{ minWidth: 560 }}>
//                         <TableHead>
//                             <TableRow>
//                                 <TableCell sx={{ fontWeight: 700 }}>Guna</TableCell>
//                                 <TableCell sx={{ fontWeight: 700 }}>Boy</TableCell>
//                                 <TableCell sx={{ fontWeight: 700 }}>Girl</TableCell>
//                                 <TableCell sx={{ fontWeight: 700 }} align="center">
//                                     Points
//                                 </TableCell>
//                                 <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {koots.map((koot) => (
//                                 <TableRow key={koot.key}>
//                                     <TableCell>
//                                         <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                                             {koot.label}
//                                         </Typography>
//                                         {koot.subtitle && (
//                                             <Typography variant="caption" sx={{ color: 'text.secondary' }}>
//                                                 {koot.subtitle}
//                                             </Typography>
//                                         )}
//                                     </TableCell>
//                                     <TableCell>{koot.boyValue || '—'}</TableCell>
//                                     <TableCell>{koot.girlValue || '—'}</TableCell>
//                                     <TableCell align="center">
//                                         <Chip
//                                             size="small"
//                                             label={
//                                                 koot.receivedPoints === undefined || koot.receivedPoints === null
//                                                     ? `— / ${koot.maxPoints}`
//                                                     : `${koot.receivedPoints} / ${koot.maxPoints}`
//                                             }
//                                             color={
//                                                 koot.receivedPoints === undefined || koot.receivedPoints === null
//                                                     ? 'default'
//                                                     : koot.receivedPoints >= koot.maxPoints
//                                                         ? 'success'
//                                                         : koot.receivedPoints > 0
//                                                             ? 'warning'
//                                                             : 'error'
//                                             }
//                                             variant="outlined"
//                                             sx={{ fontWeight: 600, minWidth: 64 }}
//                                         />
//                                     </TableCell>
//                                     <TableCell sx={{ color: 'text.secondary', minWidth: 180 }}>
//                                         {koot.description || '—'}
//                                     </TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 </Box>
//             )}

//             {!hasPersonValues && (
//                 <Box sx={{ px: 3, pb: 3 }}>
//                     <Divider sx={{ mb: 1 }} />
//                     {koots.map((koot) => (
//                         <Box key={koot.key}>
//                             <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.25 }}>
//                                 <Box sx={{ flex: 1 }}>
//                                     <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                                         {koot.label}
//                                     </Typography>
//                                     {koot.description && (
//                                         <Typography variant="caption" sx={{ color: 'text.secondary' }}>
//                                             {koot.description}
//                                         </Typography>
//                                     )}
//                                 </Box>
//                                 <Chip
//                                     size="small"
//                                     label={
//                                         koot.receivedPoints === undefined || koot.receivedPoints === null
//                                             ? `— / ${koot.maxPoints}`
//                                             : `${koot.receivedPoints} / ${koot.maxPoints}`
//                                     }
//                                     color={
//                                         koot.receivedPoints === undefined || koot.receivedPoints === null
//                                             ? 'default'
//                                             : koot.receivedPoints >= koot.maxPoints
//                                                 ? 'success'
//                                                 : koot.receivedPoints > 0
//                                                     ? 'warning'
//                                                     : 'error'
//                                     }
//                                     variant="outlined"
//                                     sx={{ fontWeight: 600, minWidth: 64 }}
//                                 />
//                             </Stack>
//                             <Divider />
//                         </Box>
//                     ))}
//                 </Box>
//             )}
//         </Card>
//     );
// }

// // Per-person Manglik Dosha card — mirrors the "YOUR DETAILS" / "PARTNER'S
// // DETAILS" Manglik Dosha section on matchmaking report pages.
// function ManglikDoshaCard({ boyName, boyManglik, boyDescription, girlName, girlManglik, girlDescription }) {
//     if (boyManglik === undefined && girlManglik === undefined) return null;

//     return (
//         <Card sx={{ p: 3, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
//             <Typography variant="h6" sx={{ mb: 2 }}>
//                 Manglik Dosha
//             </Typography>
//             <Grid container spacing={2}>
//                 <Grid item xs={12} sm={6}>
//                     <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
//                         {boyName || 'Boy'}
//                     </Typography>
//                     {boyManglik !== undefined && (
//                         <Chip
//                             size="small"
//                             label={boyManglik ? 'Manglik' : 'Non-Manglik'}
//                             color={boyManglik ? 'warning' : 'success'}
//                             variant="outlined"
//                             sx={{ fontWeight: 600 }}
//                         />
//                     )}
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                     <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
//                         {girlName || 'Girl'}
//                     </Typography>
//                     {girlManglik !== undefined && (
//                         <Chip
//                             size="small"
//                             label={girlManglik ? 'Manglik' : 'Non-Manglik'}
//                             color={girlManglik ? 'warning' : 'success'}
//                             variant="outlined"
//                             sx={{ fontWeight: 600 }}
//                         />
//                     )}
//                 </Grid>
//             </Grid>

//             {(boyDescription || girlDescription) && (
//                 <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
//                     {boyDescription || girlDescription}
//                 </Typography>
//             )}
//         </Card>
//     );
// }

// export default function KundaliMatching() {
//     const [boy, setBoy] = useState(EMPTY_PERSON);
//     const [girl, setGirl] = useState(EMPTY_PERSON);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [result, setResult] = useState(null);

//     const handleChange = (setter) => (field) => (event) => {
//         setter((prev) => ({ ...prev, [field]: event.target.value }));
//     };

//     const handlePlaceSelect = (setter) => (event) => {
//         const selected = BIRTH_PLACE_OPTIONS.find((c) => c.city === event.target.value);
//         if (selected) {
//             setter((prev) => ({ ...prev, birthPlace: selected.city, lat: selected.lat, lng: selected.lng }));
//         } else {
//             setter((prev) => ({ ...prev, birthPlace: event.target.value }));
//         }
//     };

//     const isPersonValid = (p) => p.name.trim() && p.dob && p.tob && p.birthPlace && p.lat !== '' && p.lng !== '';
//     const isValid = isPersonValid(boy) && isPersonValid(girl);

//     const handleSubmit = async (event) => {
//         event.preventDefault();
//         if (!isValid) return;

//         setLoading(true);
//         setError('');
//         setResult(null);

//         try {
//             const response = await generateKundaliMatch({ boy, girl });
//             if (response.success) {
//                 setResult(response.data);
//             } else {
//                 setError(response.message || 'Could not generate the match. Please try again.');
//             }
//         } catch (err) {
//             setError(
//                 err?.response?.data?.message ||
//                 'Kundali matching is temporarily unavailable. Please try again in a moment.'
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <Stack spacing={3} component="form" onSubmit={handleSubmit}>
//             <Grid container spacing={3}>
//                 <Grid item xs={12} md={6}>
//                     <PersonFormCard
//                         title="Boy's Birth Details"
//                         person={boy}
//                         onChange={handleChange(setBoy)}
//                         onPlaceSelect={handlePlaceSelect(setBoy)}
//                     />
//                 </Grid>
//                 <Grid item xs={12} md={6}>
//                     <PersonFormCard
//                         title="Girl's Birth Details"
//                         person={girl}
//                         onChange={handleChange(setGirl)}
//                         onPlaceSelect={handlePlaceSelect(setGirl)}
//                     />
//                 </Grid>
//             </Grid>

//             {error && <Alert severity="error">{error}</Alert>}

//             <Box sx={{ textAlign: 'center' }}>
//                 <Button
//                     type="submit"
//                     variant="contained"
//                     size="large"
//                     disabled={!isValid || loading}
//                     startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <TbHeartHandshake />}
//                     sx={{ px: 5 }}
//                 >
//                     {loading ? 'Matching Kundalis...' : 'Match Kundali'}
//                 </Button>
//             </Box>

//             {result && (
//                 <Stack spacing={3}>
//                     <Card sx={{ p: 3, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
//                         <Grid container spacing={2}>
//                             <Grid item xs={12} sm={6}>
//                                 <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                                     {result.boy?.name}
//                                 </Typography>
//                                 <DetailRow label="Birth Place" value={result.boy?.birthPlace} />
//                                 <DetailRow label="Date & Time" value={`${result.boy?.dob} • ${result.boy?.tob}`} />
//                                 <DetailRow label="Janam Rashi" value={result.boyRashi} />
//                                 <DetailRow label="Nakshatra" value={result.boyNakshatra} />
//                             </Grid>
//                             <Grid item xs={12} sm={6}>
//                                 <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
//                                     {result.girl?.name}
//                                 </Typography>
//                                 <DetailRow label="Birth Place" value={result.girl?.birthPlace} />
//                                 <DetailRow label="Date & Time" value={`${result.girl?.dob} • ${result.girl?.tob}`} />
//                                 <DetailRow label="Janam Rashi" value={result.girlRashi} />
//                                 <DetailRow label="Nakshatra" value={result.girlNakshatra} />
//                             </Grid>
//                         </Grid>
//                     </Card>

//                     <Grid container spacing={3}>
//                         <Grid item xs={12} md={5}>
//                             <ScoreSummaryCard result={result} />
//                         </Grid>
//                         <Grid item xs={12} md={7}>
//                             <KootTable koots={result.koots} />
//                         </Grid>
//                     </Grid>

//                     <ManglikDoshaCard
//                         boyName={result.boy?.name}
//                         boyManglik={result.maleManglik}
//                         boyDescription={result.maleManglikDescription}
//                         girlName={result.girl?.name}
//                         girlManglik={result.femaleManglik}
//                         girlDescription={result.femaleManglikDescription}
//                     />

//                     {result.conclusion && (
//                         <Card sx={{ p: 3, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
//                             <Typography variant="h6" sx={{ mb: 1.5 }}>
//                                 Conclusion
//                             </Typography>
//                             <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-line' }}>
//                                 {result.conclusion}
//                             </Typography>
//                         </Card>
//                     )}
//                 </Stack>
//             )}
//         </Stack>
//     );
// }



// Replace this file at: src/components/_main/kundali-matching/index.js
// All data-fetching/validation logic (generateKundaliMatch, form state,
// handleSubmit etc.) is UNCHANGED from the previous version — only the
// layout and visuals were redesigned, to match the Panchang & Muhurat
// module's design language and the "How Compatible Are You?" / Ashtakoot
// report layout used on matchmaking report pages like
// astrotalk.com/matchmaking. page.js does not need any changes.

'use client';
import React, { useState, useEffect } from 'react';

// mui
import {
    Box,
    Card,
    Grid,
    Stack,
    Chip,
    Button,
    Avatar,
    MenuItem,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    Collapse,
    Divider,
    LinearProgress,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';

// icons
import { HiOutlineLocationMarker, HiOutlineUser } from 'react-icons/hi';
import { BsCalendarEvent, BsClock, BsStarFill, BsStarHalf, BsStar } from 'react-icons/bs';
import {
    TbHeartHandshake,
    TbSparkles,
    TbChevronDown,
    TbChevronUp,
    TbMoonStars,
    TbShieldCheck,
    TbCircleCheck,
    TbArrowDown,
    TbChartBar,
    TbUsers,
    TbAlertTriangle,
    TbHelpCircle
} from 'react-icons/tb';

// services
import { generateKundaliMatch } from '@/services/kundali-matching-service';

// ----------------------------------------------------------------------
// Module-scoped colour theme — warm gold + rose, matching the "Decode
// Your Destiny / Find Your Perfect Match" reference design's compatibility
// widget (gold progress ring, warm cream background). Only this Kundali
// Matching module uses these tokens.
// ----------------------------------------------------------------------
const MATCH_THEME = {
    ink: '#3A2416',
    inkSoft: '#7A5C3E',
    // Guru / Brihaspati (बृहस्पति) — Jupiter's colour in Vedic astrology.
    // Jupiter governs wisdom, dharma and spiritual knowledge, which is why
    // this exact shade is used as the Kundali Generation & Matching
    // module's brand colour (credibility + trust in the analysis).
    gold: '#F4C430',
    goldDark: '#C9971A',
    rose: '#C2185B',
    roseSoft: '#E091B4',
    bgGradient: 'linear-gradient(180deg, #FBF3E4 0%, #FDF7EC 45%, #FFFFFF 100%)',
    heroGradient: 'linear-gradient(135deg, #FBEAD6 0%, #F6E0DA 50%, #FCE9E9 100%)',
    // Deep "night sky" navy used only behind the Premium Insights banner —
    // echoes the Guru/Jupiter gold glowing against a dark background, same
    // treatment as the dark CTA band on the reference homepage design.
    nightBg: 'linear-gradient(135deg, #171A2E 0%, #1B2242 55%, #241B3D 100%)',
    panelBorder: '#F0E1C4',
    trackBg: '#F1E4C7',
    muted: '#8A7454',
    shadow: '0 6px 24px rgba(58, 36, 22, 0.06)',
    shadowLg: '0 16px 44px rgba(58, 36, 22, 0.12)',
    // elegant serif for headlines — matches the "JyotiSutra" reference
    // design's display type (system-safe stack, no external font load)
    headingFont: '"Playfair Display", Georgia, "Times New Roman", serif'
};

// "What you get" checklist shown in the hero — mirrors the bullet list next
// to the "How Compatible Are You?" widget on the reference homepage design.
const HERO_CHECKLIST = ['36 Gunas Matching', 'Detailed Compatibility Report', 'Manglik & Nadi Dosha Check'];

// Hero banner photos — same pattern as the Panchang & Muhurat hero: real
// images behind the text instead of a CSS-drawn graphic, auto-rotating,
// faded on the left with a gradient overlay so the headline stays readable.
const HERO_BANNERS = ['/images/kundali-matching-hero-banner.png', '/images/kundali-matching-hero-banner-2.png'];
const HERO_BANNER_INTERVAL_MS = 5000;

// ----------------------------------------------------------------------
// Static, always-visible educational content — makes this page feel like
// a complete standalone destination (same spirit as the rich, always-on
// sections of the Panchang & Muhurat module) rather than just a bare
// input form. None of this depends on the match result.
// ----------------------------------------------------------------------
const KOOTA_GUIDE = [
    { key: 'varna', label: 'Varna Koota', points: 1, meaning: 'Spiritual temperament and ego compatibility between partners.' },
    { key: 'vashya', label: 'Vashya Koota', points: 2, meaning: 'Mutual attraction and the balance of control in the relationship.' },
    { key: 'tara', label: 'Tara Koota', points: 3, meaning: 'Overall health, luck and general well-being of the couple.' },
    { key: 'yoni', label: 'Yoni Koota', points: 4, meaning: 'Physical and intimate compatibility between the two charts.' },
    { key: 'grahaMaitri', label: 'Graha Maitri', points: 5, meaning: 'Mental, emotional and intellectual compatibility.' },
    { key: 'gana', label: 'Gana Koota', points: 6, meaning: 'Compatibility of temperament and inherent nature.' },
    { key: 'bhakoot', label: 'Bhakoot Koota', points: 7, meaning: 'Financial harmony and long-term emotional bonding.' },
    { key: 'nadi', label: 'Nadi Koota', points: 8, meaning: 'Health, genetic compatibility and prospects for childbirth.' }
];

const SCORE_BANDS = [
    { range: 'Below 18', label: 'Weak Match', color: '#B3463B', bg: '#F7E9E7', note: 'May need extra effort in emotional and practical alignment; other factors should also be reviewed.' },
    { range: '18 – 24', label: 'Average Match', color: '#B9812A', bg: '#FBF3E2', note: 'A workable match — Dasha periods and Navamsa compatibility become more important here.' },
    { range: '24 – 32', label: 'Good Match', color: '#3E7A9E', bg: '#E7F1F7', note: 'Supports attraction, emotional understanding and long-term stability.' },
    { range: '32 – 36', label: 'Excellent Match', color: '#3E8E5A', bg: '#E7F3EA', note: 'Traditionally considered ideal — strong mental and emotional alignment.' }
];

const WHY_IT_MATTERS = [
    { icon: TbHeartHandshake, title: 'Emotional Compatibility', text: 'Gana and Graha Maitri koots indicate whether both partners meet each other\u2019s emotional expectations.' },
    { icon: TbSparkles, title: 'Financial Stability', text: 'Strong Bhakoot and Graha Maitri alignment is linked to shared goals and better financial decisions together.' },
    { icon: TbShieldCheck, title: 'Health & Longevity', text: 'Nadi matching reflects genetic and hereditary compatibility, and the general well-being of the couple.' },
    { icon: TbUsers, title: 'Progeny & Family Growth', text: 'Nadi compatibility and Jupiter\u2019s placement are considered when assessing family growth and domestic stability.' }
];

const MANGLIK_REMEDIES = [
    'Recite the Hanuman Chalisa regularly',
    'Observe a fast on Tuesdays',
    'Perform a Mangal Graha Shanti Puja',
    'Kumbh Vivah, in specific cases suggested by an astrologer'
];

const FAQ_ITEMS = [
    { q: 'What is the minimum Guna Milan score for marriage?', a: 'Most astrologers treat 18 out of 36 as an acceptable starting point, though the full picture includes Manglik status, Dashas and Navamsa compatibility as well.' },
    { q: 'Can a Manglik marry a Non-Manglik?', a: 'Yes — this is possible, especially when cancellation combinations are present in the charts or suitable remedies are followed.' },
    { q: 'Is Kundali Matching only for arranged marriages?', a: 'No. Couples in love marriages also use it to understand long-term emotional harmony and potential challenges before marriage.' },
    { q: 'What if our score is below 18?', a: 'A low score does not rule out a good marriage. Astrologers usually look at Dasha periods, Navamsa strength and 7th-house compatibility before forming a final view.' },
    { q: 'What is Nadi Dosha?', a: 'It occurs when both partners share the same Nadi, and is traditionally associated with health, genetics and progeny-related concerns.' }
];

// Same known-city list the Kundali/Panchang modules offer, so users get a
// quick picker without needing a separate geocoding service. Kept local to
// this component (not imported from elsewhere) so all three modules stay
// decoupled and neither can break the others if one changes later.
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

const EMPTY_PERSON = {
    name: '',
    dob: '',
    tob: '',
    birthPlace: '',
    lat: '',
    lng: ''
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

// Reusable section heading — small icon chip + title (+ optional subtitle),
// same visual pattern used throughout the Panchang & Muhurat module so the
// two modules feel like one product.
function SectionHeading({ icon: Icon = TbSparkles, children, subtitle }) {
    return (
        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2.5 }}>
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #FBEAD6 0%, #F6DFC2 100%)',
                    border: `1px solid rgba(201,151,26,0.25)`,
                    color: MATCH_THEME.goldDark,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 14px rgba(201,151,26,0.18)'
                }}
            >
                <Icon size={19} />
            </Box>
            <Box>
                <Typography
                    variant="h6"
                    sx={{ fontFamily: MATCH_THEME.headingFont, fontWeight: 700, color: MATCH_THEME.ink, lineHeight: 1.3 }}
                >
                    {children}
                </Typography>
                <Box
                    sx={{
                        width: 42,
                        height: 3,
                        borderRadius: 2,
                        my: 0.75,
                        background: `linear-gradient(90deg, ${MATCH_THEME.gold} 0%, ${MATCH_THEME.rose} 100%)`
                    }}
                />
                {subtitle && (
                    <Typography variant="body2" sx={{ color: MATCH_THEME.muted }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </Stack>
    );
}

// ----------------------------------------------------------------------
// Hero banner — dark "night sky" band with a subtle star field and a
// zodiac-wheel ring motif (pure CSS/SVG, no external photo asset),
// matching the reference design's cosmic hero while keeping all copy,
// props and the onScrollToForm behaviour unchanged.
// ----------------------------------------------------------------------
function ZodiacRing({ size = 260 }) {
    const glyphs = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
    const r = size / 2;
    return (
        <Box
            sx={{
                position: 'relative',
                width: size,
                height: size,
                filter: 'drop-shadow(0 0 22px rgba(244,196,48,0.18))'
            }}
        >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0 }}>
                <circle cx={r} cy={r} r={r - 2} fill="none" stroke="rgba(244,196,48,0.4)" strokeWidth="1.25" />
                <circle cx={r} cy={r} r={r - 20} fill="none" stroke="rgba(244,196,48,0.22)" strokeWidth="1" strokeDasharray="2 6" />
                <circle cx={r} cy={r} r={r - 34} fill="none" stroke="rgba(194,24,91,0.2)" strokeWidth="1" strokeDasharray="1 4" />
                {glyphs.map((g, i) => {
                    const angle = (i / glyphs.length) * 2 * Math.PI - Math.PI / 2;
                    const x = r + (r - 11) * Math.cos(angle);
                    const y = r + (r - 11) * Math.sin(angle);
                    return (
                        <text
                            key={g}
                            x={x}
                            y={y}
                            fill="rgba(244,196,48,0.55)"
                            fontSize="11"
                            textAnchor="middle"
                            dominantBaseline="middle"
                        >
                            {g}
                        </text>
                    );
                })}
            </svg>
        </Box>
    );
}

function HeroBanner({ onScrollToForm }) {
    // hero banner carousel — auto-advances every few seconds, loops back to
    // the start; purely visual, no data dependency. Same pattern as the
    // Panchang & Muhurat hero.
    const [bannerIndex, setBannerIndex] = useState(0);
    const [brokenSlides, setBrokenSlides] = useState(() => new Set());
    useEffect(() => {
        if (HERO_BANNERS.length <= 1) return undefined;
        const slideTimer = setInterval(() => {
            setBannerIndex((i) => {
                // step forward, skipping any slide whose image failed to load
                // so a missing/broken file never gets "stuck" showing blank
                let next = i;
                for (let step = 0; step < HERO_BANNERS.length; step += 1) {
                    next = (next + 1) % HERO_BANNERS.length;
                    if (!brokenSlides.has(next)) break;
                }
                return next;
            });
        }, HERO_BANNER_INTERVAL_MS);
        return () => clearInterval(slideTimer);
    }, [brokenSlides]);

    return (
        <Box
            sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: { xs: 4, md: 5 },
                border: `1px solid rgba(244,196,48,0.25)`,
                background: MATCH_THEME.nightBg,
                boxShadow: '0 24px 60px rgba(23,26,46,0.35)',
                p: { xs: 3, sm: 4, md: 5 },
                mb: { xs: 3, md: 4 },
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    padding: '1px',
                    background: `linear-gradient(120deg, rgba(244,196,48,0.5), rgba(244,196,48,0) 35%, rgba(194,24,91,0.35) 70%, rgba(244,196,48,0.3))`,
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    pointerEvents: 'none'
                }
            }}
        >
            {/* background photo slider — same technique as the Panchang hero:
                every slide renders as a real <img> (so a missing/broken file
                can be detected via onError and auto-skipped in rotation
                instead of showing a blank frame) and crossfades between
                them, clipped to the rounded corners, with a fixed gradient
                overlay on top so the headline on the left stays readable. */}
            <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit' }}>
                {HERO_BANNERS.map((src, i) => (
                    <Box
                        key={src}
                        component="img"
                        src={src}
                        alt=""
                        onError={() =>
                            setBrokenSlides((prev) => (prev.has(i) ? prev : new Set(prev).add(i)))
                        }
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                            opacity: i === bannerIndex ? 1 : 0,
                            transition: 'opacity 1.2s ease-in-out'
                        }}
                    />
                ))}

                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage:
                            'linear-gradient(90deg, rgba(23,26,46,0.96) 0%, rgba(27,34,66,0.88) 30%, rgba(27,34,66,0.45) 58%, rgba(27,34,66,0.1) 78%)'
                    }}
                />

                {HERO_BANNERS.length > 1 && (
                    <Stack
                        direction="row"
                        spacing={0.75}
                        sx={{ position: 'absolute', left: '50%', bottom: 14, transform: 'translateX(-50%)', zIndex: 1 }}
                    >
                        {HERO_BANNERS.map((src, i) => (
                            <Box
                                key={`dot-${src}`}
                                component="button"
                                onClick={() => setBannerIndex(i)}
                                aria-label={`Show banner ${i + 1}`}
                                sx={{
                                    width: i === bannerIndex ? 20 : 7,
                                    height: 7,
                                    borderRadius: 10,
                                    border: 'none',
                                    cursor: 'pointer',
                                    p: 0,
                                    bgcolor: i === bannerIndex ? MATCH_THEME.gold : 'rgba(255,255,255,0.3)',
                                    transition: 'width 0.3s ease, background-color 0.3s ease'
                                }}
                            />
                        ))}
                    </Stack>
                )}
            </Box>

            <Grid container spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid item xs={12} md={7}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5, rowGap: 1 }}>
                        <Chip
                            label="Advanced Matching"
                            size="small"
                            sx={{
                                bgcolor: 'rgba(244,196,48,0.16)',
                                border: '1px solid rgba(244,196,48,0.4)',
                                color: MATCH_THEME.gold,
                                fontWeight: 700,
                                letterSpacing: 0.3
                            }}
                        />
                        <Chip
                            icon={<BsStarFill size={12} color={MATCH_THEME.gold} />}
                            label="Trusted by 50,000+ Seekers"
                            size="small"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.18)',
                                color: '#fff',
                                fontWeight: 700,
                                letterSpacing: 0.3
                            }}
                        />
                    </Stack>

                    <Typography
                        sx={{
                            fontFamily: MATCH_THEME.headingFont,
                            fontWeight: 700,
                            fontSize: { xs: '1.9rem', sm: '2.4rem', md: '2.7rem' },
                            lineHeight: 1.15,
                            color: '#fff',
                            mb: 1.5
                        }}
                    >
                        Decode Your Compatibility.
                        <Box component="span" sx={{ display: 'block', color: MATCH_THEME.gold }}>
                            Find Your Perfect Match.
                        </Box>
                    </Typography>

                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.72)', maxWidth: 520, mb: 2.5 }}>
                        Check marriage compatibility with the 36-point Ashtakoot Guna Milan system — instant
                        score, Manglik &amp; Nadi Dosha check, and a detailed compatibility report.
                    </Typography>

                    <Stack spacing={1} sx={{ mb: 3 }}>
                        {HERO_CHECKLIST.map((item) => (
                            <Stack key={item} direction="row" spacing={1} alignItems="center">
                                <TbCircleCheck size={18} color={MATCH_THEME.gold} />
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                                    {item}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>

                    <Button
                        variant="contained"
                        onClick={onScrollToForm}
                        endIcon={<TbArrowDown />}
                        sx={{
                            borderRadius: 50,
                            px: 3.5,
                            py: 1.1,
                            fontWeight: 700,
                            background: `linear-gradient(90deg, ${MATCH_THEME.gold} 0%, #F0B429 100%)`,
                            color: MATCH_THEME.ink,
                            boxShadow: '0 10px 26px rgba(244,196,48,0.35)',
                            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                            '&:hover': {
                                background: `linear-gradient(90deg, ${MATCH_THEME.goldDark} 0%, ${MATCH_THEME.gold} 100%)`,
                                transform: 'translateY(-2px)',
                                boxShadow: '0 14px 32px rgba(244,196,48,0.45)'
                            }
                        }}
                    >
                        Check Compatibility
                    </Button>
                </Grid>

                {/* right column intentionally left empty — the banner photo
                    slider (couple + zodiac wheel over a sunrise) shows
                    through here; see HERO_BANNERS background layer above */}
                <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }} />
            </Grid>
        </Box>
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
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'nowrap' }}>
                <BsClock style={{ flexShrink: 0, color: MATCH_THEME.goldDark }} />
                <TextField select label="Hour" value={hour} onChange={handleHour} required sx={{ flex: '1 1 0', minWidth: 0 }}>
                    {HOUR_12_OPTIONS.map((h) => (
                        <MenuItem key={h} value={h}>
                            {h}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField select label="Minute" value={minute} onChange={handleMinute} required sx={{ flex: '1 1 0', minWidth: 0 }}>
                    {MINUTE_OPTIONS.map((m) => (
                        <MenuItem key={m} value={m}>
                            {m}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField select label="AM/PM" value={period} onChange={handlePeriod} required sx={{ flex: '1 1 0', minWidth: 0 }}>
                    <MenuItem value="AM">AM</MenuItem>
                    <MenuItem value="PM">PM</MenuItem>
                </TextField>
            </Stack>
        </Box>
    );
}

// One half of the two-column birth-details form (Boy / Girl) — restyled
// with a gender-tinted avatar + accent border, same field set/logic as
// before, same spirit as the field layout already used in the Kundali
// Generation form.
function PersonFormCard({ title, symbol, accent, person, onChange, onPlaceSelect }) {
    return (
        <Card
            sx={{
                position: 'relative',
                overflow: 'hidden',
                p: 3,
                borderRadius: 4,
                border: `1px solid ${MATCH_THEME.panelBorder}`,
                borderTop: `3px solid ${accent}`,
                boxShadow: MATCH_THEME.shadow,
                height: '100%',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                    boxShadow: MATCH_THEME.shadowLg,
                    transform: { md: 'translateY(-4px)' }
                }
            }}
        >
            {/* faded watermark glyph — purely decorative, echoes the astrology theme */}
            <Box
                component="span"
                sx={{
                    position: 'absolute',
                    top: -18,
                    right: -6,
                    fontSize: 110,
                    lineHeight: 1,
                    color: accent,
                    opacity: 0.06,
                    fontWeight: 700,
                    userSelect: 'none',
                    pointerEvents: 'none'
                }}
            >
                {symbol}
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5, position: 'relative' }}>
                <Avatar
                    sx={{
                        bgcolor: accent,
                        fontWeight: 700,
                        border: '3px solid #fff',
                        boxShadow: `0 4px 14px ${accent}55`
                    }}
                >
                    {symbol}
                </Avatar>
                <Typography
                    variant="h6"
                    sx={{ fontFamily: MATCH_THEME.headingFont, fontWeight: 700, color: MATCH_THEME.ink }}
                >
                    {title}
                </Typography>
            </Stack>

            <Stack
                spacing={2.5}
                sx={{
                    position: 'relative',
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        transition: 'box-shadow 0.2s ease',
                        '&.Mui-focused': { boxShadow: `0 0 0 3px ${accent}22` }
                    }
                }}
            >
                <TextField
                    label="Full Name"
                    value={person.name}
                    onChange={onChange('name')}
                    required
                    fullWidth
                    InputProps={{ startAdornment: <HiOutlineUser style={{ marginRight: 8 }} /> }}
                />

                <TextField
                    label="Date of Birth"
                    type="date"
                    value={person.dob}
                    onChange={onChange('dob')}
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ startAdornment: <BsCalendarEvent style={{ marginRight: 8 }} /> }}
                />

                <TimeOfBirthPicker
                    value={person.tob}
                    onChange={(val) => onChange('tob')({ target: { value: val } })}
                />

                <TextField
                    select
                    label="Birth Place"
                    value={person.birthPlace}
                    onChange={onPlaceSelect}
                    required
                    fullWidth
                    InputProps={{ startAdornment: <HiOutlineLocationMarker style={{ marginRight: 8 }} /> }}
                    helperText="Don't see the city? Enter latitude/longitude manually below."
                    SelectProps={{ native: true }}
                >
                    <option value="" />
                    {BIRTH_PLACE_OPTIONS.map((c) => (
                        <option key={c.city} value={c.city}>
                            {c.city}
                        </option>
                    ))}
                </TextField>

                <Stack direction="row" spacing={2}>
                    <TextField label="Latitude" type="number" value={person.lat} onChange={onChange('lat')} fullWidth />
                    <TextField label="Longitude" type="number" value={person.lng} onChange={onChange('lng')} fullWidth />
                </Stack>
            </Stack>
        </Card>
    );
}

// Star rating strip under the compatibility ring — purely presentational,
// derived from the match percentage (5 stars = 100%), same "4.5/5"-style
// flourish shown under the ring on the reference homepage design.
function StarRow({ percent }) {
    const starsOutOf5 = Math.round((percent / 100) * 5 * 2) / 2; // nearest 0.5
    const stars = [];
    for (let i = 1; i <= 5; i += 1) {
        if (starsOutOf5 >= i) stars.push('full');
        else if (starsOutOf5 >= i - 0.5) stars.push('half');
        else stars.push('empty');
    }
    return (
        <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ color: MATCH_THEME.gold }}>
            {stars.map((s, i) => {
                if (s === 'full') return <BsStarFill key={i} size={16} />;
                if (s === 'half') return <BsStarHalf key={i} size={16} />;
                return <BsStar key={i} size={16} />;
            })}
        </Stack>
    );
}

// Circular "82% / Excellent Match" compatibility ring — built with a CSS
// conic-gradient (no chart library needed), matching the gold progress
// ring on the "How Compatible Are You?" section of the reference homepage
// design.
function CompatibilityRing({ result }) {
    const total = result.totalPoints ?? 0;
    const max = result.maxPoints || 36;
    const percent = Math.min(100, Math.round((total / max) * 100));

    let verdict = 'Average Match';
    let color = MATCH_THEME.gold;
    let chipColor = 'warning';
    if (percent >= 85) {
        verdict = 'Excellent Match';
        color = '#3E8E5A';
        chipColor = 'success';
    } else if (percent >= 65) {
        verdict = 'Good Match';
        color = MATCH_THEME.goldDark;
        chipColor = 'warning';
    } else if (percent < 40) {
        verdict = 'Not Recommended';
        color = '#B3463B';
        chipColor = 'error';
    }

    return (
        <Stack alignItems="center" spacing={2}>
            <Typography
                variant="overline"
                sx={{ color: MATCH_THEME.muted, letterSpacing: 1.5, fontWeight: 700 }}
            >
                Ashtakoot Guna Milan
            </Typography>
            <Box
                sx={{
                    position: 'relative',
                    width: 212,
                    height: 212,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {/* soft outer glow */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: -8,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`
                    }}
                />
                <Box
                    sx={{
                        position: 'relative',
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: `conic-gradient(${color} ${percent}%, ${MATCH_THEME.trackBg} ${percent}% 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 12px 30px ${color}30`,
                        p: '15px'
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            bgcolor: 'background.paper',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'inset 0 2px 10px rgba(58,36,22,0.06)'
                        }}
                    >
                        <Typography variant="h3" sx={{ fontWeight: 800, color: MATCH_THEME.ink, lineHeight: 1 }}>
                            {percent}
                            <Typography component="span" variant="h6" sx={{ color: MATCH_THEME.muted }}>
                                %
                            </Typography>
                        </Typography>
                        <Typography variant="caption" sx={{ color: MATCH_THEME.muted, mt: 0.5 }}>
                            {total} / {max} Gunas
                        </Typography>
                    </Box>
                </Box>
            </Box>
            <Chip
                label={verdict}
                color={chipColor}
                sx={{ fontWeight: 700, px: 1.5, borderRadius: 50, boxShadow: MATCH_THEME.shadow }}
            />
            <StarRow percent={percent} />
        </Stack>
    );
}

// Compact bar-list view of the 8 koots — name / progress bar / points —
// matching the "Ashtakoot Scores" list on the reference homepage design.
function AshtakootScoreList({ koots }) {
    if (!koots || !koots.length) return null;
    return (
        <Stack spacing={2}>
            {koots.map((koot) => {
                const hasPoints = koot.receivedPoints !== undefined && koot.receivedPoints !== null;
                const pct = hasPoints ? Math.min(100, Math.round((koot.receivedPoints / koot.maxPoints) * 100)) : 0;
                return (
                    <Stack key={koot.key} direction="row" spacing={2} alignItems="center">
                        <Typography variant="body2" sx={{ width: 118, flexShrink: 0, fontWeight: 600, color: MATCH_THEME.ink }}>
                            {koot.label}
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={hasPoints ? pct : 0}
                            sx={{
                                flex: 1,
                                height: 9,
                                borderRadius: 5,
                                bgcolor: MATCH_THEME.trackBg,
                                boxShadow: 'inset 0 1px 3px rgba(58,36,22,0.08)',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 5,
                                    background: `linear-gradient(90deg, ${MATCH_THEME.gold} 0%, ${MATCH_THEME.rose} 130%)`
                                }
                            }}
                        />
                        <Typography
                            variant="body2"
                            sx={{ width: 54, flexShrink: 0, textAlign: 'right', color: MATCH_THEME.muted, fontWeight: 700 }}
                        >
                            {hasPoints ? `${koot.receivedPoints} / ${koot.maxPoints}` : `— / ${koot.maxPoints}`}
                        </Typography>
                    </Stack>
                );
            })}
        </Stack>
    );
}

// Full Ashtakoot table (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana,
// Bhakoot, Nadi) with per-person values + description — shown behind a
// "View Full Report" toggle, same detail level as matchmaking report pages
// like astrotalk.com/matchmaking.
function KootDetailTable({ koots }) {
    if (!koots || !koots.length) return null;
    const hasPersonValues = koots.some((k) => k.boyValue || k.girlValue);

    if (!hasPersonValues) {
        return (
            <Stack spacing={1.25}>
                {koots.map((koot) => (
                    <Stack
                        key={koot.key}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                            p: 1.5,
                            borderRadius: 2.5,
                            bgcolor: '#FBF7EF',
                            border: `1px solid ${MATCH_THEME.panelBorder}`
                        }}
                    >
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: MATCH_THEME.ink }}>
                                {koot.label}
                            </Typography>
                            {koot.description && (
                                <Typography variant="caption" sx={{ color: MATCH_THEME.muted }}>
                                    {koot.description}
                                </Typography>
                            )}
                        </Box>
                        <Chip
                            size="small"
                            label={
                                koot.receivedPoints === undefined || koot.receivedPoints === null
                                    ? `— / ${koot.maxPoints}`
                                    : `${koot.receivedPoints} / ${koot.maxPoints}`
                            }
                            sx={{ fontWeight: 700, minWidth: 64, bgcolor: '#fff', border: `1px solid ${MATCH_THEME.panelBorder}` }}
                        />
                    </Stack>
                ))}
            </Stack>
        );
    }

    return (
        <Box sx={{ overflowX: 'auto', borderRadius: 2.5, border: `1px solid ${MATCH_THEME.panelBorder}` }}>
            <Table size="small" sx={{ minWidth: 560 }}>
                <TableHead>
                    <TableRow sx={{ bgcolor: '#FBF3E4' }}>
                        <TableCell sx={{ fontWeight: 700, color: MATCH_THEME.ink }}>Guna</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: MATCH_THEME.ink }}>Boy</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: MATCH_THEME.ink }}>Girl</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: MATCH_THEME.ink }} align="center">
                            Points
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: MATCH_THEME.ink }}>Description</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {koots.map((koot) => (
                        <TableRow key={koot.key} sx={{ '&:hover': { bgcolor: '#FBF7EF' } }}>
                            <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {koot.label}
                                </Typography>
                                {koot.subtitle && (
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {koot.subtitle}
                                    </Typography>
                                )}
                            </TableCell>
                            <TableCell>{koot.boyValue || '—'}</TableCell>
                            <TableCell>{koot.girlValue || '—'}</TableCell>
                            <TableCell align="center">
                                <Chip
                                    size="small"
                                    label={
                                        koot.receivedPoints === undefined || koot.receivedPoints === null
                                            ? `— / ${koot.maxPoints}`
                                            : `${koot.receivedPoints} / ${koot.maxPoints}`
                                    }
                                    sx={{ fontWeight: 700, minWidth: 64, bgcolor: '#fff', border: `1px solid ${MATCH_THEME.panelBorder}` }}
                                />
                            </TableCell>
                            <TableCell sx={{ color: 'text.secondary', minWidth: 180 }}>
                                {koot.description || '—'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
}

// Per-person Manglik Dosha card — mirrors the "YOUR DETAILS" / "PARTNER'S
// DETAILS" Manglik Dosha section on matchmaking report pages.
function ManglikDoshaCard({ boyName, boyManglik, boyDescription, girlName, girlManglik, girlDescription }) {
    if (boyManglik === undefined && girlManglik === undefined) return null;

    const renderPerson = (name, manglik, fallback) => {
        if (manglik === undefined) return null;
        const tint = manglik ? '#FCEEF2' : '#EAF5EE';
        const accent = manglik ? MATCH_THEME.rose : '#3E8E5A';
        return (
            <Box sx={{ p: 2, height: '100%', borderRadius: 3, bgcolor: tint, border: `1px solid ${accent}33` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: MATCH_THEME.ink, mb: 0.75 }}>
                    {name || fallback}
                </Typography>
                <Chip
                    size="small"
                    icon={<TbAlertTriangle size={14} color={accent} />}
                    label={manglik ? 'Manglik' : 'Non-Manglik'}
                    sx={{ fontWeight: 700, color: accent, bgcolor: '#fff', border: `1px solid ${accent}55` }}
                />
            </Box>
        );
    };

    return (
        <Card sx={{ p: 3, borderRadius: 4, border: `1px solid ${MATCH_THEME.panelBorder}`, boxShadow: MATCH_THEME.shadow }}>
            <SectionHeading icon={TbShieldCheck}>Manglik Dosha</SectionHeading>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    {renderPerson(boyName, boyManglik, 'Boy')}
                </Grid>
                <Grid item xs={12} sm={6}>
                    {renderPerson(girlName, girlManglik, 'Girl')}
                </Grid>
            </Grid>

            {(boyDescription || girlDescription) && (
                <Typography variant="body2" sx={{ mt: 2, color: MATCH_THEME.muted }}>
                    {boyDescription || girlDescription}
                </Typography>
            )}
        </Card>
    );
}

// "The 8 Kootas in Guna Milan" — always-visible reference grid explaining
// every koota and its point value, same content depth as the koota-by-koota
// breakdown on matchmaking report pages like astrotalk.com/matchmaking.
function KootaGuideSection() {
    return (
        <Card sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: `1px solid ${MATCH_THEME.panelBorder}`, boxShadow: MATCH_THEME.shadow }}>
            <SectionHeading icon={TbChartBar} subtitle="8 compatibility factors, scored out of 36 gunas in total">
                The 8 Kootas in Guna Milan
            </SectionHeading>
            <Grid container spacing={2}>
                {KOOTA_GUIDE.map((k) => (
                    <Grid item xs={12} sm={6} md={3} key={k.key}>
                        <Box
                            sx={{
                                p: 2.25,
                                height: '100%',
                                borderRadius: 3,
                                bgcolor: '#FBF7EF',
                                border: `1px solid ${MATCH_THEME.panelBorder}`,
                                transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: MATCH_THEME.shadow,
                                    borderColor: MATCH_THEME.gold
                                }
                            }}
                        >
                            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
                                <Box
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${MATCH_THEME.gold} 0%, ${MATCH_THEME.goldDark} 100%)`,
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        fontSize: 13,
                                        flexShrink: 0,
                                        boxShadow: '0 3px 10px rgba(201,151,26,0.35)'
                                    }}
                                >
                                    {k.points}
                                </Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: MATCH_THEME.ink }}>
                                    {k.label}
                                </Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ color: MATCH_THEME.muted }}>
                                {k.meaning}
                            </Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Card>
    );
}

// "How to Interpret Your Score" — colour-coded score bands, same ranges
// used on matchmaking report pages like astrotalk.com/matchmaking.
function ScoreInterpretationSection() {
    return (
        <Card sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: `1px solid ${MATCH_THEME.panelBorder}`, boxShadow: MATCH_THEME.shadow }}>
            <SectionHeading icon={TbSparkles} subtitle="A general guide — always read alongside Manglik status and other chart factors">
                How to Interpret Your Score
            </SectionHeading>
            <Grid container spacing={2}>
                {SCORE_BANDS.map((band) => (
                    <Grid item xs={12} sm={6} md={3} key={band.range}>
                        <Box
                            sx={{
                                p: 2.25,
                                height: '100%',
                                borderRadius: 3,
                                bgcolor: band.bg,
                                border: `1px solid ${band.color}33`,
                                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                                '&:hover': { transform: 'translateY(-3px)', boxShadow: MATCH_THEME.shadow }
                            }}
                        >
                            <Typography variant="caption" sx={{ color: band.color, fontWeight: 700, letterSpacing: 0.3 }}>
                                {band.range} / 36
                            </Typography>
                            <Typography
                                variant="subtitle1"
                                sx={{ fontFamily: MATCH_THEME.headingFont, fontWeight: 700, color: band.color, mb: 0.75 }}
                            >
                                {band.label}
                            </Typography>
                            <Typography variant="body2" sx={{ color: MATCH_THEME.muted }}>
                                {band.note}
                            </Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Card>
    );
}

// "Why Kundali Matching Matters" — four benefit cards, same themes covered
// on matchmaking report pages like astrotalk.com/matchmaking.
function WhyItMattersSection() {
    return (
        <Card sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: `1px solid ${MATCH_THEME.panelBorder}`, boxShadow: MATCH_THEME.shadow }}>
            <SectionHeading icon={TbUsers} subtitle="What the Guna Milan score actually helps a couple understand">
                Why Kundali Matching Matters
            </SectionHeading>
            <Grid container spacing={2.5}>
                {WHY_IT_MATTERS.map((item) => (
                    <Grid item xs={12} sm={6} md={3} key={item.title}>
                        <Stack
                            spacing={1.25}
                            alignItems="flex-start"
                            sx={{
                                p: 2,
                                height: '100%',
                                borderRadius: 3,
                                transition: 'transform 0.25s ease, background-color 0.25s ease',
                                '&:hover': { transform: 'translateY(-3px)', bgcolor: '#FBF7EF' }
                            }}
                        >
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #FBEAD6 0%, #F6DFC2 100%)',
                                    color: MATCH_THEME.goldDark,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(201,151,26,0.18)'
                                }}
                            >
                                <item.icon size={21} />
                            </Box>
                            <Typography
                                variant="subtitle1"
                                sx={{ fontFamily: MATCH_THEME.headingFont, fontWeight: 700, color: MATCH_THEME.ink }}
                            >
                                {item.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: MATCH_THEME.muted }}>
                                {item.text}
                            </Typography>
                        </Stack>
                    </Grid>
                ))}
            </Grid>
        </Card>
    );
}

// "Mangal Dosha in Kundli Matching" — what it is, how it can be offset, and
// commonly suggested remedies, same coverage as matchmaking report pages
// like astrotalk.com/matchmaking.
function MangalDoshaInfoSection() {
    return (
        <Card sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: `1px solid ${MATCH_THEME.panelBorder}`, boxShadow: MATCH_THEME.shadow }}>
            <SectionHeading icon={TbAlertTriangle} subtitle="Formed when Mars sits in the 1st, 2nd, 4th, 7th, 8th or 12th house of a chart">
                Mangal Dosha in Kundli Matching
            </SectionHeading>
            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <Typography variant="body2" sx={{ color: MATCH_THEME.muted, mb: 1.5 }}>
                        Mangal Dosha (also called Manglik Dosha) is checked separately for both partners because
                        it can point to temperament imbalance or delays in marriage. Its real impact depends on
                        house ownership, planetary aspects and the overall strength of the chart — a Manglik
                        placement is not automatically a dealbreaker.
                    </Typography>
                    <Typography variant="body2" sx={{ color: MATCH_THEME.muted }}>
                        Common cancellation cases include a strong aspect from Jupiter, Mars placed in its own
                        sign or exaltation, or both partners being Manglik — which is generally considered to
                        neutralise the effect.
                    </Typography>
                </Grid>
                <Grid item xs={12} md={5}>
                    <Box
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            bgcolor: '#FCEEF2',
                            border: `1px solid ${MATCH_THEME.rose}22`,
                            boxShadow: MATCH_THEME.shadow
                        }}
                    >
                        <Typography
                            variant="subtitle2"
                            sx={{ fontFamily: MATCH_THEME.headingFont, fontWeight: 700, color: MATCH_THEME.ink, mb: 1.25 }}
                        >
                            Commonly Suggested Remedies
                        </Typography>
                        <Stack spacing={1.25}>
                            {MANGLIK_REMEDIES.map((r) => (
                                <Stack key={r} direction="row" spacing={1.25} alignItems="flex-start">
                                    <Box
                                        sx={{
                                            width: 22,
                                            height: 22,
                                            borderRadius: '50%',
                                            bgcolor: '#fff',
                                            color: MATCH_THEME.rose,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            mt: 0.1,
                                            boxShadow: `0 2px 6px ${MATCH_THEME.rose}33`
                                        }}
                                    >
                                        <TbCircleCheck size={14} />
                                    </Box>
                                    <Typography variant="body2" sx={{ color: MATCH_THEME.inkSoft }}>
                                        {r}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1.75, color: MATCH_THEME.muted, fontStyle: 'italic' }}>
                            For personalised guidance, it&apos;s best to consult an experienced astrologer.
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Card>
    );
}

// ----------------------------------------------------------------------
// "Get Deeper Insights with Premium Reports" — dark CTA band, mirroring
// the reference homepage design's premium-upsell section. Purely
// presentational: no API call, no navigation logic wired up yet (button
// is inert for now, same as the "Soon" tags used elsewhere in the module
// until a premium-reports page/flow exists).
// ----------------------------------------------------------------------
const PREMIUM_INSIGHTS = [
    { icon: TbSparkles, label: 'Life Predictions' },
    { icon: TbChartBar, label: 'Career & Finance' },
    { icon: TbShieldCheck, label: 'Health & Wellness' },
    { icon: TbHeartHandshake, label: 'Love & Marriage' },
    { icon: TbMoonStars, label: 'Remedies & Pooja' }
];

function PremiumInsightsBanner() {
    return (
        <Card
            sx={{
                position: 'relative',
                overflow: 'hidden',
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                background: MATCH_THEME.nightBg,
                color: '#fff',
                boxShadow: '0 20px 50px rgba(23,26,46,0.3)',
                border: `1px solid rgba(244,196,48,0.2)`
            }}
        >
            {/* decorative glow orbs — echoes the hero banner's night-sky styling */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -70,
                    left: -50,
                    width: 260,
                    height: 260,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(244,196,48,0.16) 0%, rgba(244,196,48,0) 70%)',
                    pointerEvents: 'none'
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -80,
                    right: -60,
                    width: 260,
                    height: 260,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(194,24,91,0.16) 0%, rgba(194,24,91,0) 70%)',
                    pointerEvents: 'none'
                }}
            />

            <Grid container spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid item xs={12} md={5}>
                    <Typography
                        sx={{ fontFamily: MATCH_THEME.headingFont, fontWeight: 700, fontSize: { xs: '1.4rem', md: '1.7rem' }, mb: 1 }}
                    >
                        Get Deeper Insights with{' '}
                        <Box component="span" sx={{ color: MATCH_THEME.gold }}>
                            Premium Reports
                        </Box>
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)', mb: 2.5 }}>
                        Unlock detailed predictions, remedies and personalised guidance beyond the free
                        Ashtakoot report.
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{
                            borderRadius: 50,
                            px: 3.5,
                            py: 1,
                            fontWeight: 700,
                            background: `linear-gradient(90deg, ${MATCH_THEME.gold} 0%, #F0B429 100%)`,
                            color: MATCH_THEME.ink,
                            boxShadow: '0 10px 24px rgba(244,196,48,0.3)',
                            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                            '&:hover': {
                                background: `linear-gradient(90deg, ${MATCH_THEME.goldDark} 0%, ${MATCH_THEME.gold} 100%)`,
                                transform: 'translateY(-2px)',
                                boxShadow: '0 14px 30px rgba(244,196,48,0.4)'
                            }
                        }}
                    >
                        Explore Premium
                    </Button>
                </Grid>
                <Grid item xs={12} md={7}>
                    <Grid container spacing={2}>
                        {PREMIUM_INSIGHTS.map(({ icon: Icon, label }) => (
                            <Grid item xs={6} sm={4} key={label}>
                                <Stack
                                    alignItems="center"
                                    spacing={1}
                                    sx={{
                                        textAlign: 'center',
                                        p: 1,
                                        borderRadius: 3,
                                        transition: 'background-color 0.25s ease, transform 0.25s ease',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', transform: 'translateY(-3px)' }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: 'rgba(244,196,48,0.12)',
                                            border: `1px solid rgba(244,196,48,0.3)`,
                                            color: MATCH_THEME.gold
                                        }}
                                    >
                                        <Icon size={22} />
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {label}
                                    </Typography>
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </Card>
    );
}

// FAQ accordion — quick answers to the questions people most often ask
// alongside a matchmaking report.
function FaqSection() {
    return (
        <Card sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: `1px solid ${MATCH_THEME.panelBorder}`, boxShadow: MATCH_THEME.shadow }}>
            <SectionHeading icon={TbHelpCircle} subtitle="Quick answers to the questions people ask most often">
                Frequently Asked Questions
            </SectionHeading>
            <Stack spacing={1.25}>
                {FAQ_ITEMS.map((item) => (
                    <Accordion
                        key={item.q}
                        disableGutters
                        elevation={0}
                        sx={{
                            border: `1px solid ${MATCH_THEME.panelBorder}`,
                            borderRadius: '14px !important',
                            '&:before': { display: 'none' },
                            overflow: 'hidden',
                            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                            '&:hover': { borderColor: MATCH_THEME.gold },
                            '&.Mui-expanded': { boxShadow: MATCH_THEME.shadow, borderColor: MATCH_THEME.gold }
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<TbChevronDown />}
                            sx={{
                                '& .MuiAccordionSummary-content': { my: 1.25 },
                                '&.Mui-expanded': { bgcolor: '#FBF7EF' }
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: MATCH_THEME.ink }}>
                                {item.q}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ borderTop: `1px dashed ${MATCH_THEME.panelBorder}`, pt: 1.5 }}>
                            <Typography variant="body2" sx={{ color: MATCH_THEME.muted }}>
                                {item.a}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Stack>
        </Card>
    );
}

export default function KundaliMatching() {
    const [boy, setBoy] = useState(EMPTY_PERSON);
    const [girl, setGirl] = useState(EMPTY_PERSON);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    const [showFullReport, setShowFullReport] = useState(true);
    const formSectionRef = React.useRef(null);

    const scrollToForm = () => {
        formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleChange = (setter) => (field) => (event) => {
        setter((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handlePlaceSelect = (setter) => (event) => {
        const selected = BIRTH_PLACE_OPTIONS.find((c) => c.city === event.target.value);
        if (selected) {
            setter((prev) => ({ ...prev, birthPlace: selected.city, lat: selected.lat, lng: selected.lng }));
        } else {
            setter((prev) => ({ ...prev, birthPlace: event.target.value }));
        }
    };

    const isPersonValid = (p) => p.name.trim() && p.dob && p.tob && p.birthPlace && p.lat !== '' && p.lng !== '';
    const isValid = isPersonValid(boy) && isPersonValid(girl);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!isValid) return;

        setLoading(true);
        setError('');
        setResult(null);
        setShowFullReport(true);

        try {
            const response = await generateKundaliMatch({ boy, girl });
            if (response.success) {
                setResult(response.data);
            } else {
                setError(response.message || 'Could not generate the match. Please try again.');
            }
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                'Kundali matching is temporarily unavailable. Please try again in a moment.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ pb: { xs: 4, md: 6 }, overflowX: 'hidden' }}>
            <HeroBanner onScrollToForm={scrollToForm} />

            <Stack spacing={3} component="form" onSubmit={handleSubmit}>
                <Box ref={formSectionRef} sx={{ scrollMarginTop: 88 }}>
                    <SectionHeading icon={TbSparkles} subtitle="We need both birth details to calculate the Ashtakoot Guna Milan score">
                        Enter Birth Details
                    </SectionHeading>
                </Box>
                <Box sx={{ position: 'relative' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <PersonFormCard
                                title="Boy's Birth Details"
                                symbol="♂"
                                accent="#4C6FD6"
                                person={boy}
                                onChange={handleChange(setBoy)}
                                onPlaceSelect={handlePlaceSelect(setBoy)}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <PersonFormCard
                                title="Girl's Birth Details"
                                symbol="♀"
                                accent={MATCH_THEME.rose}
                                person={girl}
                                onChange={handleChange(setGirl)}
                                onPlaceSelect={handlePlaceSelect(setGirl)}
                            />
                        </Grid>
                    </Grid>

                    {/* decorative connector — desktop only, purely visual */}
                    <Box
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 46,
                            height: 46,
                            borderRadius: '50%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: '#fff',
                            border: `1px solid ${MATCH_THEME.panelBorder}`,
                            boxShadow: MATCH_THEME.shadowLg,
                            color: MATCH_THEME.rose,
                            zIndex: 2
                        }}
                    >
                        <TbHeartHandshake size={22} />
                    </Box>
                </Box>

                {error && <Alert severity="error">{error}</Alert>}

                <Box sx={{ textAlign: 'center' }}>
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={!isValid || loading}
                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <TbHeartHandshake />}
                        sx={{
                            px: 5,
                            py: 1.25,
                            borderRadius: 2.5,
                            fontWeight: 700,
                            background: `linear-gradient(90deg, ${MATCH_THEME.gold} 0%, ${MATCH_THEME.rose} 100%)`,
                            boxShadow: MATCH_THEME.shadowLg,
                            '&:hover': {
                                background: `linear-gradient(90deg, ${MATCH_THEME.goldDark} 0%, ${MATCH_THEME.rose} 100%)`
                            }
                        }}
                    >
                        {loading ? 'Matching Kundalis...' : 'Match Kundali'}
                    </Button>
                </Box>

                {result && (
                    <Stack spacing={3}>
                        {/* --- Boy / Girl summary --- */}
                        <Card sx={{ p: 3, borderRadius: 4, border: `1px solid ${MATCH_THEME.panelBorder}`, boxShadow: MATCH_THEME.shadow }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6} sx={{ borderRight: { sm: `1px dashed ${MATCH_THEME.panelBorder}` } }}>
                                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                                        <Avatar sx={{ bgcolor: '#4C6FD6', fontWeight: 700, border: '3px solid #fff', boxShadow: '0 4px 14px rgba(76,111,214,0.35)' }}>♂</Avatar>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ fontFamily: MATCH_THEME.headingFont, fontWeight: 700, color: MATCH_THEME.ink }}
                                        >
                                            {result.boy?.name}
                                        </Typography>
                                    </Stack>
                                    <DetailRow label="Birth Place" value={result.boy?.birthPlace} />
                                    <DetailRow label="Date & Time" value={`${result.boy?.dob} • ${result.boy?.tob}`} />
                                    <DetailRow label="Janam Rashi" value={result.boyRashi} />
                                    <DetailRow label="Nakshatra" value={result.boyNakshatra} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                                        <Avatar sx={{ bgcolor: MATCH_THEME.rose, fontWeight: 700, border: '3px solid #fff', boxShadow: `0 4px 14px ${MATCH_THEME.rose}55` }}>♀</Avatar>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ fontFamily: MATCH_THEME.headingFont, fontWeight: 700, color: MATCH_THEME.ink }}
                                        >
                                            {result.girl?.name}
                                        </Typography>
                                    </Stack>
                                    <DetailRow label="Birth Place" value={result.girl?.birthPlace} />
                                    <DetailRow label="Date & Time" value={`${result.girl?.dob} • ${result.girl?.tob}`} />
                                    <DetailRow label="Janam Rashi" value={result.girlRashi} />
                                    <DetailRow label="Nakshatra" value={result.girlNakshatra} />
                                </Grid>
                            </Grid>
                        </Card>

                        {/* --- "How Compatible Are You?" — ring + Ashtakoot bar list --- */}
                        <Card sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: `1px solid ${MATCH_THEME.panelBorder}`, boxShadow: MATCH_THEME.shadow }}>
                            <Grid container spacing={4} alignItems="center">
                                <Grid item xs={12} md={5}>
                                    <CompatibilityRing result={result} />

                                    <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" sx={{ mt: 3, rowGap: 1 }}>
                                        {result.maleManglik !== undefined && (
                                            <Chip
                                                label={`Boy Manglik: ${result.maleManglik ? 'Yes' : 'No'}`}
                                                color={result.maleManglik ? 'warning' : 'success'}
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        )}
                                        {result.femaleManglik !== undefined && (
                                            <Chip
                                                label={`Girl Manglik: ${result.femaleManglik ? 'Yes' : 'No'}`}
                                                color={result.femaleManglik ? 'warning' : 'success'}
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        )}
                                        {result.nadiDosha !== undefined && (
                                            <Chip
                                                label={`Nadi Dosha: ${result.nadiDosha ? 'Present' : 'Not Present'}`}
                                                color={result.nadiDosha ? 'error' : 'success'}
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        )}
                                        {result.bhakootDosha !== undefined && (
                                            <Chip
                                                label={`Bhakoot Dosha: ${result.bhakootDosha ? 'Present' : 'Not Present'}`}
                                                color={result.bhakootDosha ? 'error' : 'success'}
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        )}
                                        {result.doshaCancelled && (
                                            <Chip label="Dosha Cancelled" color="info" variant="outlined" size="small" sx={{ fontWeight: 600 }} />
                                        )}
                                    </Stack>
                                </Grid>

                                <Grid item xs={12} md={7}>
                                    <Typography variant="overline" sx={{ color: MATCH_THEME.muted, letterSpacing: 1.5, fontWeight: 700 }}>
                                        Ashtakoot Scores
                                    </Typography>
                                    <Box sx={{ mt: 1.5 }}>
                                        <AshtakootScoreList koots={result.koots} />
                                    </Box>

                                    <Button
                                        onClick={() => setShowFullReport((v) => !v)}
                                        endIcon={showFullReport ? <TbChevronUp /> : <TbChevronDown />}
                                        sx={{
                                            mt: 2.5,
                                            fontWeight: 700,
                                            color: MATCH_THEME.rose,
                                            borderRadius: 50,
                                            px: 2,
                                            '&:hover': { bgcolor: `${MATCH_THEME.rose}11` }
                                        }}
                                    >
                                        {showFullReport ? 'Hide Full Report' : 'View Full Report'}
                                    </Button>

                                    <Collapse in={showFullReport}>
                                        <Divider sx={{ my: 2 }} />
                                        <KootDetailTable koots={result.koots} />
                                    </Collapse>
                                </Grid>
                            </Grid>
                        </Card>

                        <ManglikDoshaCard
                            boyName={result.boy?.name}
                            boyManglik={result.maleManglik}
                            boyDescription={result.maleManglikDescription}
                            girlName={result.girl?.name}
                            girlManglik={result.femaleManglik}
                            girlDescription={result.femaleManglikDescription}
                        />

                        {result.conclusion && (
                            <Card sx={{ p: 3, borderRadius: 4, border: `1px solid ${MATCH_THEME.panelBorder}`, boxShadow: MATCH_THEME.shadow }}>
                                <SectionHeading icon={TbMoonStars}>Conclusion</SectionHeading>
                                <Typography variant="body2" sx={{ color: MATCH_THEME.muted, whiteSpace: 'pre-line' }}>
                                    {result.conclusion}
                                </Typography>
                            </Card>
                        )}
                    </Stack>
                )}
            </Stack>

            {/* ---------------------------------------------------------------- */}
            {/* Always-visible reference content — makes this a complete page,   */}
            {/* not just a bare form, same spirit as the Panchang module.        */}
            {/* ---------------------------------------------------------------- */}
            <Stack spacing={3} sx={{ mt: { xs: 4, md: 5 } }}>
                <KootaGuideSection />
                <ScoreInterpretationSection />
                <WhyItMattersSection />
                <PremiumInsightsBanner />
                <MangalDoshaInfoSection />
                <FaqSection />
            </Stack>
        </Box>
    );
}