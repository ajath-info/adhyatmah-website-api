'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { keyframes } from '@mui/system';
import { Alert, Box, Breadcrumbs, Button, CircularProgress, Container, Dialog, Grid, IconButton, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { MdClose, MdDeliveryDining, MdCreditCard, MdShoppingBag, MdReceipt, MdReceiptLong, MdLocalOffer, MdAccountBalanceWallet, MdInfoOutline } from 'react-icons/md';
import { MdAccessTime, MdCheckCircle, MdChevronLeft, MdChevronRight, MdHome, MdBusiness, MdLocationOn, MdLock, MdEvent, MdWbTwilight, MdWbSunny, MdNightlightRound, MdVerified, MdOutlineRadioButtonUnchecked, MdInventory2, MdTouchApp, MdArrowForward, MdArrowBack } from 'react-icons/md';
import { FaUserTie } from 'react-icons/fa';
import Image from '@/components/blur-image';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import * as api from 'src/services';
import { getPujaComboSlots, getPujaComboPandits, bookPujaCombo } from 'src/services/puja-combo-booking';

const ORANGE = '#fb8b05';
const SOFT = 'rgb(255, 247, 237)';
const BORDER = '#f5dcc0';
const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const capLang = (l) => { const x = String(l || '').trim(); return x.charAt(0).toUpperCase() + x.slice(1).toLowerCase(); };
const STEPS = ['Date & Time', 'Address', 'Pandit Ji', 'Review & Pay'];
const TITLES = [
    ['Select Date & Time', 'Choose your preferred date and time for the puja.'],
    ['Service Location', 'Where do you want the puja to be performed?'],
    ['Choose Your Pandit Ji', 'Select a pandit ji for your puja, or let us assign the best available.'],
    ['Review Your Booking', 'Please check all details before proceeding to payment.']
];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MAX_DAYS = 120;

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};
const label12 = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return `${pad(h % 12 === 0 ? 12 : h % 12)}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`;
};
const prettyDate = (s) => {
    if (!s) return '';
    const [y, m, d] = s.split('-').map(Number);
    return `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
};

const EMPTY_ADDRESS = { type: 'Home', street: '', landmark: '', city: '', state: '', zip: '', country: 'India', save: true };

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(251,139,5,0.45); }
  70% { box-shadow: 0 0 0 10px rgba(251,139,5,0); }
  100% { box-shadow: 0 0 0 0 rgba(251,139,5,0); }
`;
const popIn = keyframes`
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
`;
const cardSx = { background: SOFT, border: `1px solid ${BORDER}`, borderRadius: '20px', p: { xs: 2, md: 3 }, boxShadow: '0 8px 30px rgba(251,139,5,0.07)' };

const orangeBtn = { borderRadius: '50px', textTransform: 'none', fontWeight: 700, fontSize: 15, px: 4, py: 1.2, boxShadow: '0 6px 18px rgba(251,139,5,0.35)', background: 'linear-gradient(135deg, #ffa43a, #fb8b05)', color: '#fff', transition: 'all .2s ease', '&:hover': { background: 'linear-gradient(135deg, #fb8b05, #e07b00)', boxShadow: '0 10px 24px rgba(251,139,5,0.45)', transform: 'translateY(-2px)' }, '&.Mui-disabled': { background: ORANGE, color: '#fff', opacity: 0.5 } };
const outBtn = { borderRadius: '50px', textTransform: 'none', fontWeight: 600, px: 3, py: 1.2, border: `1.5px solid ${BORDER}`, color: '#6b4a1f', '&:hover': { border: `1.5px solid ${ORANGE}`, background: 'rgba(251,139,5,0.06)' }, background: '#fff' };
const fieldSx = { '& .MuiOutlinedInput-root': { background: '#fffdf9', borderRadius: '10px' } };

/* ---------------- Stepper ---------------- */
const STEP_ICONS = [MdEvent, MdLocationOn, FaUserTie, MdLock];

function Stepper({ step, onStep }) {
    return (
        <Stack direction="row" alignItems="flex-start" justifyContent="center" sx={{ mb: 4 }}>
            {STEPS.map((label, i) => {
                const done = i < step;
                const current = i === step;
                const Icon = STEP_ICONS[i];
                return (
                    <React.Fragment key={label}>
                        <Stack
                            alignItems="center"
                            spacing={0.8}
                            onClick={() => done && onStep(i)}
                            sx={{ minWidth: { xs: 60, sm: 110 }, cursor: done ? 'pointer' : 'default', '&:hover .dot': done ? { transform: 'scale(1.1)' } : {} }}
                        >
                            <Stack
                                className="dot"
                                alignItems="center"
                                justifyContent="center"
                                sx={{
                                    width: { xs: 36, sm: 42 },
                                    height: { xs: 36, sm: 42 },
                                    borderRadius: '50%',
                                    fontWeight: 700,
                                    border: `2px solid ${ORANGE}`,
                                    background: current || done ? ORANGE : '#fff',
                                    color: current || done ? '#fff' : ORANGE,
                                    transition: 'all .3s ease',
                                    animation: current ? `${pulse} 1.8s infinite` : 'none'
                                }}
                            >
                                {done ? <MdCheckCircle size={22} /> : <Icon size={18} />}
                            </Stack>
                            <Typography sx={{ fontSize: { xs: 11, sm: 13 }, fontWeight: current ? 700 : 500, color: current ? '#2d1a06' : done ? '#b86000' : 'text.secondary', textAlign: 'center' }}>{label}</Typography>
                        </Stack>
                        {i < STEPS.length - 1 && (
                            <Box sx={{ flex: 1, maxWidth: 120, height: 3, mt: { xs: '17px', sm: '20px' }, borderRadius: 2, background: BORDER, overflow: 'hidden' }}>
                                <Box sx={{ height: '100%', width: i < step ? '100%' : '0%', background: ORANGE, transition: 'width .5s ease' }} />
                            </Box>
                        )}
                    </React.Fragment>
                );
            })}
        </Stack>
    );
}

/* ---------------- Booking summary (sidebar) ---------------- */
function SummaryRow({ icon: Icon, label, value, done }) {
    return (
        <Stack direction="row" spacing={1.2} alignItems="flex-start" sx={{ py: 1.1 }}>
            <Box sx={{ mt: '2px', color: done ? '#2e7d32' : '#cdb89c', display: 'flex', transition: 'color .3s' }}>
                {done ? <MdCheckCircle size={20} /> : <MdOutlineRadioButtonUnchecked size={20} />}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: 11.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
                <Typography key={value} sx={{ fontSize: 13.5, fontWeight: done ? 700 : 500, color: done ? '#2d1a06' : '#a39380', wordBreak: 'break-word', animation: done ? `${popIn} .3s ease` : 'none' }}>{value}</Typography>
            </Box>
        </Stack>
    );
}

function SummaryCard({ combo, date, time, address, mode, panditId, panditName, step }) {
    const img = combo.image?.url;
    const saving = combo.originalPrice > combo.comboPrice ? combo.originalPrice - combo.comboPrice : 0;
    const addrDone = !!(address.street.trim() && address.city.trim());
    const addrText = addrDone ? [address.street.trim(), address.city.trim()].join(', ') : 'Not added yet';
    const panditDone = step >= 2 && (mode === 'any' || !!panditId);
    const panditText = panditDone ? (mode === 'any' ? 'Any Available Pandit (Verified)' : panditName) : 'To be selected';
    return (
        <Box sx={{ ...cardSx, p: 0, overflow: 'hidden', position: { md: 'sticky' }, top: { md: 100 } }}>
            <Box sx={{ position: 'relative', height: 130, background: '#f0e0d0' }}>
                {img ? <Image alt={combo.name} src={img} fill style={{ objectFit: 'cover' }} /> : <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', fontSize: 44 }}>🪔</Stack>}
                {saving > 0 && <Box sx={{ position: 'absolute', top: 10, right: 10, background: '#e8380d', color: '#fff', fontSize: 11, fontWeight: 700, px: 1.2, py: 0.5, borderRadius: '20px', border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 3px 8px rgba(232,56,13,0.35)' }}>{(() => { const percent = combo.discountPercent > 0 ? combo.discountPercent : Math.round((saving / combo.originalPrice) * 100); return percent > 0 ? `${percent}% OFF` : `SAVE ${inr(saving)}`; })()}</Box>}
            </Box>
            <Box sx={{ p: 2.2 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#2d1a06', lineHeight: 1.3 }}>{combo.name}</Typography>
                <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.4 }}>{[combo.duration, (combo.languages || []).filter(Boolean).map(capLang).join(' • ')].filter(Boolean).join('  |  ')}</Typography>

                <Box sx={{ mt: 1.5, pt: 0.5, borderTop: `1px dashed ${BORDER}` }}>
                    <SummaryRow icon={MdEvent} label="Date & Time" done={!!(date && time)} value={date && time ? `${prettyDate(date)}, ${label12(time)}` : date ? `${prettyDate(date)} · pick a time` : 'Select date & time'} />
                    <SummaryRow icon={MdLocationOn} label="Location" done={addrDone} value={addrText} />
                    <SummaryRow icon={FaUserTie} label="Pandit Ji" done={panditDone} value={panditText} />
                </Box>

                <Box sx={{ mt: 1, pt: 1.5, borderTop: `1px dashed ${BORDER}` }}>
                    <Stack direction="row" alignItems="baseline" justifyContent="space-between">
                        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Total Amount</Typography>
                        <Stack direction="row" alignItems="baseline" spacing={1}>
                            {saving > 0 && <Typography sx={{ fontSize: 13, color: '#aaa', textDecoration: 'line-through' }}>{inr(combo.originalPrice)}</Typography>}
                            <Typography sx={{ fontSize: 24, fontWeight: 800, color: ORANGE }}>{inr(combo.comboPrice)}</Typography>
                        </Stack>
                    </Stack>
                    {saving > 0 && <Typography sx={{ fontSize: 12.5, color: '#2e7d32', fontWeight: 700, textAlign: 'right' }}>You save {inr(saving)} with this combo</Typography>}
                </Box>

                <Stack spacing={0.9} sx={{ mt: 2, p: 1.5, borderRadius: '12px', background: '#fff' }}>
                    {[
                        [FaUserTie, 'Verified & experienced Pandit Ji'],
                        [MdInventory2, 'Complete puja samagri kit included'],
                        [MdLock, 'Secure online payment']
                    ].map(([Icon, text]) => (
                        <Stack key={text} direction="row" spacing={1} alignItems="center">
                            <Icon size={14} color={ORANGE} />
                            <Typography sx={{ fontSize: 12.5, color: '#4a3a2a' }}>{text}</Typography>
                        </Stack>
                    ))}
                </Stack>
            </Box>
        </Box>
    );
}

/* ---------------- Step 1: date & time ---------------- */
const PERIODS = [
    { key: 'morning', label: 'Morning', icon: MdWbTwilight, test: (h) => h < 12 },
    { key: 'afternoon', label: 'Afternoon', icon: MdWbSunny, test: (h) => h >= 12 && h < 16 },
    { key: 'evening', label: 'Evening', icon: MdNightlightRound, test: (h) => h >= 16 }
];
const weekdayLong = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function DateTimeStep({ date, setDate, time, setTime, slots, slotsLoading }) {
    const today = startOfToday();
    const maxDate = new Date(today.getTime() + MAX_DAYS * 86400000);
    const base = date ? new Date(`${date}T00:00:00`) : today;
    const [view, setView] = React.useState({ y: base.getFullYear(), m: base.getMonth() });
    const [showAll, setShowAll] = React.useState(false);

    const first = new Date(view.y, view.m, 1);
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const cells = [...Array(first.getDay()).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    const canPrev = new Date(view.y, view.m, 1) > new Date(today.getFullYear(), today.getMonth(), 1);
    const canNext = new Date(view.y, view.m + 1, 1) <= maxDate;
    const move = (delta) => {
        const d = new Date(view.y, view.m + delta, 1);
        setView({ y: d.getFullYear(), m: d.getMonth() });
    };

    const pickDate = (d) => {
        setDate(ymd(d));
        setTime('');
        setShowAll(false);
        setView({ y: d.getFullYear(), m: d.getMonth() });
    };

    const addDays = (n) => new Date(today.getTime() + n * 86400000);
    const nextSaturday = (() => {
        const d = new Date(today);
        d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
        return d;
    })();
    const quick = [
        { label: 'Today', d: addDays(0) },
        { label: 'Tomorrow', d: addDays(1) },
        { label: 'This Weekend', d: nextSaturday }
    ].filter((q) => q.d <= maxDate);

    const list = showAll ? slots : slots.slice(0, 12);
    const dateObj = date ? new Date(`${date}T00:00:00`) : null;
    const hasAvailable = slots.some((s) => s.available);

    return (
        <Grid container spacing={3}>
            <Grid size={{ md: 7, xs: 12 }}>
                <Box sx={{ ...cardSx, height: '100%' }}>
                    <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
                        {quick.map((q) => {
                            const on = date === ymd(q.d);
                            return (
                                <Box
                                    key={q.label}
                                    onClick={() => pickDate(q.d)}
                                    sx={{ px: 1.8, py: 0.7, borderRadius: '20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${on ? ORANGE : BORDER}`, background: on ? '#fff3e0' : '#fff', color: on ? '#b86000' : '#6b4a1f', transition: 'all .2s', '&:hover': { borderColor: ORANGE, transform: 'translateY(-2px)' } }}
                                >
                                    {q.label}
                                </Box>
                            );
                        })}
                    </Stack>

                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                        <Button onClick={() => move(-1)} disabled={!canPrev} sx={{ minWidth: 40, height: 40, borderRadius: '50%', color: ORANGE, background: '#fff', border: `1px solid ${BORDER}`, '&:hover': { background: '#fdeadb' } }}><MdChevronLeft size={24} /></Button>
                        <Typography key={`${view.y}-${view.m}`} sx={{ fontWeight: 800, fontSize: 17, color: '#2d1a06', animation: `${popIn} .25s ease` }}>{MONTHS[view.m]} {view.y}</Typography>
                        <Button onClick={() => move(1)} disabled={!canNext} sx={{ minWidth: 40, height: 40, borderRadius: '50%', color: ORANGE, background: '#fff', border: `1px solid ${BORDER}`, '&:hover': { background: '#fdeadb' } }}><MdChevronRight size={24} /></Button>
                    </Stack>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: { xs: '4px', sm: '8px' }, textAlign: 'center' }}>
                        {DOW.map((d) => (
                            <Typography key={d} sx={{ fontSize: 12, color: '#b86000', fontWeight: 700, pb: 0.5 }}>{d}</Typography>
                        ))}
                        {cells.map((day, i) => {
                            if (!day) return <Box key={`e${i}`} />;
                            const d = new Date(view.y, view.m, day);
                            const disabled = d < today || d > maxDate;
                            const selected = date === ymd(d);
                            const isToday = ymd(d) === ymd(today);
                            return (
                                <Box
                                    key={day}
                                    onClick={() => !disabled && pickDate(d)}
                                    sx={{
                                        width: '100%',
                                        maxWidth: 52,
                                        justifySelf: 'center',
                                        aspectRatio: '1 / 1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        fontSize: 14.5,
                                        fontWeight: selected ? 800 : 600,
                                        cursor: disabled ? 'not-allowed' : 'pointer',
                                        color: selected ? '#fff' : disabled ? '#cfc5b8' : '#2d1a06',
                                        background: selected ? 'linear-gradient(135deg, #ffa43a, #fb8b05)' : '#fff',
                                        border: `1.5px solid ${selected ? ORANGE : isToday ? ORANGE : disabled ? 'transparent' : '#f3e6d3'}`,
                                        boxShadow: selected ? '0 6px 16px rgba(251,139,5,0.45)' : 'none',
                                        transform: selected ? 'scale(1.08)' : 'none',
                                        transition: 'all .18s ease',
                                        '&:hover': disabled || selected ? {} : { background: '#fdeadb', borderColor: ORANGE, transform: 'scale(1.1)' }
                                    }}
                                >
                                    {day}
                                </Box>
                            );
                        })}
                    </Box>

                    <Stack direction="row" spacing={2} sx={{ mt: 2 }} alignItems="center">
                        <Stack direction="row" spacing={0.7} alignItems="center"><Box sx={{ width: 12, height: 12, borderRadius: '50%', background: ORANGE }} /><Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Selected</Typography></Stack>
                        <Stack direction="row" spacing={0.7} alignItems="center"><Box sx={{ width: 12, height: 12, borderRadius: '50%', border: `1.5px solid ${ORANGE}`, background: '#fff' }} /><Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Today</Typography></Stack>
                        <Stack direction="row" spacing={0.7} alignItems="center"><Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#eee6da' }} /><Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Unavailable</Typography></Stack>
                    </Stack>
                </Box>
            </Grid>

            <Grid size={{ md: 5, xs: 12 }}>
                <Box sx={{ ...cardSx, height: '100%' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#2d1a06' }}>Available Time Slots</Typography>
                    <Typography sx={{ fontSize: 13, color: '#b86000', fontWeight: 600, mb: 2 }}>{dateObj ? `${weekdayLong[dateObj.getDay()]}, ${prettyDate(date)}` : 'Select a date first'}</Typography>

                    {!date ? (
                        <Stack alignItems="center" spacing={1} sx={{ py: 5, textAlign: 'center', border: `1.5px dashed ${BORDER}`, borderRadius: '14px', background: '#fffdf9' }}>
                            <MdTouchApp size={34} color={ORANGE} />
                            <Typography sx={{ fontSize: 14, color: 'text.secondary', px: 2 }}>Pick a date from the calendar to see the available time slots.</Typography>
                        </Stack>
                    ) : slotsLoading ? (
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2 }}>
                            {[...Array(8)].map((_, i) => <Skeleton key={i} variant="rounded" height={42} sx={{ borderRadius: '12px' }} />)}
                        </Box>
                    ) : !hasAvailable ? (
                        <Stack alignItems="center" spacing={1} sx={{ py: 4, textAlign: 'center', border: `1.5px dashed ${BORDER}`, borderRadius: '14px', background: '#fffdf9' }}>
                            <MdEvent size={32} color="#cdb89c" />
                            <Typography sx={{ fontSize: 14, color: 'text.secondary', px: 2 }}>No slots available on this date. Please choose another date.</Typography>
                        </Stack>
                    ) : (
                        <>
                            <Stack spacing={2}>
                                {PERIODS.map(({ key, label, icon: PIcon, test }) => {
                                    const group = list.filter((s) => test(parseInt(s.time, 10)));
                                    if (!group.length) return null;
                                    return (
                                        <Box key={key}>
                                            <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mb: 1 }}>
                                                <PIcon size={17} color={ORANGE} />
                                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#6b4a1f' }}>{label}</Typography>
                                            </Stack>
                                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2 }}>
                                                {group.map((s) => {
                                                    const on = time === s.time;
                                                    return (
                                                        <Box
                                                            key={s.time}
                                                            onClick={() => s.available && setTime(s.time)}
                                                            sx={{
                                                                position: 'relative',
                                                                textAlign: 'center',
                                                                py: 1.1,
                                                                borderRadius: '12px',
                                                                fontSize: 13.5,
                                                                fontWeight: 700,
                                                                cursor: s.available ? 'pointer' : 'not-allowed',
                                                                border: `1.5px solid ${on ? ORANGE : BORDER}`,
                                                                background: on ? 'linear-gradient(135deg, #ffa43a, #fb8b05)' : s.available ? '#fff' : '#f3efe9',
                                                                color: on ? '#fff' : s.available ? '#2d1a06' : '#b9afa2',
                                                                textDecoration: s.available ? 'none' : 'line-through',
                                                                boxShadow: on ? '0 6px 16px rgba(251,139,5,0.4)' : 'none',
                                                                transition: 'all .18s ease',
                                                                '&:hover': s.available && !on ? { borderColor: ORANGE, background: '#fff3e0', transform: 'translateY(-2px)' } : {}
                                                            }}
                                                        >
                                                            {s.label}
                                                            {on && <Box component="span" sx={{ position: 'absolute', top: -7, right: -7, display: 'flex', background: '#fff', borderRadius: '50%', color: '#2e7d32', animation: `${popIn} .25s ease` }}><MdCheckCircle size={20} /></Box>}
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Stack>
                            {slots.length > 12 && (
                                <Button onClick={() => setShowAll((v) => !v)} sx={{ mt: 1.5, textTransform: 'none', color: ORANGE, fontWeight: 700 }}>
                                    {showAll ? 'Show Fewer Slots' : `Show More Slots (${slots.length - 12})`}
                                </Button>
                            )}
                        </>
                    )}
                </Box>
            </Grid>
        </Grid>
    );
}

/* ---------------- Step 2: address ---------------- */
function AddressStep({ address, setAddress, errors }) {
    const set = (k) => (e) => setAddress((a) => ({ ...a, [k]: e.target.value }));
    const types = [
        { key: 'Home', icon: MdHome },
        { key: 'Office', icon: MdBusiness },
        { key: 'Other', icon: MdLocationOn }
    ];
    return (
        <Stack spacing={2} sx={{ ...cardSx }}>
            <Stack direction="row" spacing={1.2}>
                {types.map(({ key, icon: Icon }) => {
                    const on = address.type === key;
                    return (
                        <Button key={key} onClick={() => setAddress((a) => ({ ...a, type: key }))} startIcon={<Icon size={18} />} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 2.5, py: 1, border: `1.5px solid ${on ? ORANGE : BORDER}`, background: on ? '#fff3e0' : '#fff', color: on ? '#b86000' : '#6b4a1f', boxShadow: on ? '0 4px 12px rgba(251,139,5,0.2)' : 'none', transition: 'all .2s', '&:hover': { borderColor: ORANGE, background: '#fff3e0' } }}>
                            {key}
                        </Button>
                    );
                })}
            </Stack>
            <TextField label="Full Address" required fullWidth size="small" sx={fieldSx} value={address.street} onChange={set('street')} error={!!errors.street} helperText={errors.street} placeholder="House / flat no., street, area" />
            <TextField label="Landmark (Optional)" fullWidth size="small" sx={fieldSx} value={address.landmark} onChange={set('landmark')} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="City" required fullWidth size="small" sx={fieldSx} value={address.city} onChange={set('city')} error={!!errors.city} helperText={errors.city} />
                <TextField label="State" required fullWidth size="small" sx={fieldSx} value={address.state} onChange={set('state')} error={!!errors.state} helperText={errors.state} />
            </Stack>
            <TextField label="Pincode" required size="small" sx={{ ...fieldSx, maxWidth: 260 }} value={address.zip} onChange={(e) => setAddress((a) => ({ ...a, zip: e.target.value.replace(/\D/g, '').slice(0, 6) }))} error={!!errors.zip} helperText={errors.zip} />
            <Stack direction="row" alignItems="center" spacing={1} onClick={() => setAddress((a) => ({ ...a, save: !a.save }))} sx={{ cursor: 'pointer', width: 'fit-content' }}>
                <Box sx={{ width: 20, height: 20, borderRadius: '5px', border: `2px solid ${ORANGE}`, background: address.save ? ORANGE : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, lineHeight: 1 }}>{address.save ? '✓' : ''}</Box>
                <Typography sx={{ fontSize: 14 }}>Save this address for future bookings</Typography>
            </Stack>
        </Stack>
    );
}

/* ---------------- Step 3: pandit ---------------- */
function PanditStep({ mode, setMode, panditId, setPanditId, pandits, loading, availableCount }) {
    const [profileId, setProfileId] = React.useState('');
    const profile = pandits.find((x) => x.id === profileId) || null;
    const optionSx = (on) => ({ flex: 1, p: 2.2, borderRadius: '16px', cursor: 'pointer', border: `1.5px solid ${on ? ORANGE : BORDER}`, background: on ? '#fff3e0' : '#fff', boxShadow: on ? '0 8px 22px rgba(251,139,5,0.18)' : 'none', transition: 'all .2s ease', '&:hover': { borderColor: ORANGE, transform: 'translateY(-3px)' } });
    const radio = (on) => (
        <Box sx={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${ORANGE}`, background: on ? ORANGE : '#fff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{on ? '✓' : ''}</Box>
    );
    return (
        <Stack spacing={3}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Box onClick={() => setMode('choose')} sx={optionSx(mode === 'choose')}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        {radio(mode === 'choose')}
                        <Box>
                            <Typography sx={{ fontWeight: 700 }}>Choose Pandit Ji</Typography>
                            <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.4 }}>Select from our available pandits.</Typography>
                        </Box>
                    </Stack>
                </Box>
                <Box onClick={() => setMode('any')} sx={optionSx(mode === 'any')}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        {radio(mode === 'any')}
                        <Box>
                            <Typography sx={{ fontWeight: 700 }}>Any Available Pandit</Typography>
                            <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.4 }}>We will assign a verified and experienced pandit ji for your puja.</Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#2e7d32', mt: 0.8 }}>{inr(0)} extra (Recommended)</Typography>
                        </Box>
                    </Stack>
                </Box>
            </Stack>

            {loading ? (
                <Stack alignItems="center" sx={{ py: 3 }}><CircularProgress size={26} /></Stack>
            ) : availableCount === 0 ? (
                <Alert severity="warning">No Pandit Ji is available at the selected time. Please go back and choose another date or time slot.</Alert>
            ) : (
                mode === 'choose' && (
                    <Box>
                        <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Available Pandit Ji</Typography>
                        <Grid container spacing={2}>
                            {pandits.map((p) => {
                                const on = panditId === p.id;
                                return (
                                    <Grid size={{ lg: 3, md: 4, sm: 6, xs: 12 }} key={p.id}>
                                        <Box onClick={() => p.available && setPanditId(p.id)} sx={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', cursor: p.available ? 'pointer' : 'not-allowed', opacity: p.available ? 1 : 0.55, border: `1.5px solid ${on ? '#2e7d32' : BORDER}`, background: '#fff', boxShadow: on ? '0 10px 26px rgba(46,125,50,0.25)' : 'none', transition: 'all .2s ease', '&:hover': p.available ? { transform: 'translateY(-4px)', borderColor: on ? '#2e7d32' : ORANGE } : {} }}>
                                            <Box sx={{ position: 'relative', height: 150, background: '#f0e0d0' }}>
                                                {p.image ? <Image alt={p.name} src={p.image} fill style={{ objectFit: 'cover' }} /> : <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}><FaUserTie size={44} color={ORANGE} /></Stack>}
                                                <Box sx={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%', border: `2px solid ${on ? '#2e7d32' : ORANGE}`, background: on ? '#2e7d32' : '#fff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{on ? '✓' : ''}</Box>
                                            </Box>
                                            <Box sx={{ p: 1.5 }}>
                                                <Typography onClick={(e) => { e.stopPropagation(); setProfileId(p.id); }} sx={{ fontWeight: 700, fontSize: 14.5, cursor: 'pointer', display: 'inline-block', '&:hover': { color: ORANGE, textDecoration: 'underline' } }}>{p.name || 'Pandit Ji'}</Typography>
                                                {p.experience && <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{p.experience} Experience</Typography>}
                                                {p.language?.length > 0 && (
                                                    <Stack direction="row" gap={0.6} flexWrap="wrap" sx={{ mt: 0.8 }}>
                                                        {p.language.slice(0, 3).map((l) => (
                                                            <Box key={l} sx={{ fontSize: 11, fontWeight: 600, color: '#b86000', background: '#fff3e0', border: '1px solid #fbc97a', borderRadius: '12px', px: 1, py: 0.2, textTransform: 'capitalize' }}>{l}</Box>
                                                        ))}
                                                    </Stack>
                                                )}
                                                {!p.available && <Typography sx={{ fontSize: 12, color: '#c62828', mt: 0.8 }}>Not available at this time</Typography>}
                                            </Box>
                                        </Box>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>
                )
            )}

            <Dialog open={!!profile} onClose={() => setProfileId('')} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '18px', overflow: 'hidden' } }}>
                {profile && (
                    <Box>
                        <Box sx={{ position: 'relative', height: 280, background: '#fdf1e3' }}>
                            {profile.image ? <Image alt={profile.name} src={profile.image} fill style={{ objectFit: 'contain' }} /> : <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}><FaUserTie size={56} color={ORANGE} /></Stack>}
                            <IconButton onClick={() => setProfileId('')} size="small" sx={{ position: 'absolute', top: 8, right: 8, background: '#fff', '&:hover': { background: '#fff3e0' } }}><MdClose size={18} /></IconButton>
                        </Box>
                        <Box sx={{ p: 2.5 }}>
                            <Stack direction="row" alignItems="center" spacing={0.8}>
                                <Typography sx={{ fontWeight: 800, fontSize: 19 }}>{profile.name || 'Pandit Ji'}</Typography>
                                <MdVerified size={18} color="#2e7d32" />
                            </Stack>
                            {profile.experience && <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mt: 0.3 }}>{profile.experience} Experience</Typography>}
                            {profile.city && (
                                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.6 }}>
                                    <MdLocationOn size={16} color={ORANGE} />
                                    <Typography sx={{ fontSize: 13.5, color: 'text.secondary' }}>{profile.city}</Typography>
                                </Stack>
                            )}
                            {profile.language?.length > 0 && (
                                <Stack direction="row" gap={0.6} flexWrap="wrap" sx={{ mt: 1.2 }}>
                                    {profile.language.slice(0, 4).map((l) => (
                                        <Box key={l} sx={{ fontSize: 11.5, fontWeight: 600, color: '#b86000', background: '#fff3e0', border: '1px solid #fbc97a', borderRadius: '12px', px: 1, py: 0.2, textTransform: 'capitalize' }}>{l}</Box>
                                    ))}
                                </Stack>
                            )}
                            {profile.about && (
                                <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{profile.about}</Typography>
                            )}
                            <Typography sx={{ fontSize: 12.5, fontWeight: 700, mt: 1.5, color: profile.available ? '#2e7d32' : '#c62828' }}>
                                {profile.available ? 'Available at your selected time' : 'Not available at this time'}
                            </Typography>
                            <Stack direction="row" spacing={1.2} sx={{ mt: 2.2 }}>
                                {profile.available && (
                                    <Button fullWidth onClick={() => { setPanditId(profile.id); setProfileId(''); }} sx={{ borderRadius: '50px', textTransform: 'none', fontWeight: 700, border: `1.5px solid ${ORANGE}`, color: ORANGE }}>Select Pandit</Button>
                                )}
                                <Button fullWidth component={Link} href={`/vendors/${profile.id}`} variant="contained" sx={{ borderRadius: '50px', textTransform: 'none', fontWeight: 700, boxShadow: 'none', background: ORANGE, color: '#fff', '&:hover': { background: '#e07b00', boxShadow: 'none' } }}>See Full Profile</Button>
                            </Stack>
                        </Box>
                    </Box>
                )}
            </Dialog>
        </Stack>
    );
}

/* ---------------- Step 4: review ---------------- */
function ReviewRow({ icon: Icon, label, value, onEdit }) {
    return (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 1.4, borderBottom: `1px solid ${BORDER}` }}>
            <Stack alignItems="center" justifyContent="center" sx={{ width: 34, height: 34, borderRadius: '50%', background: '#fdeadb', flexShrink: 0 }}><Icon size={16} color={ORANGE} /></Stack>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{label}</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 600, wordBreak: 'break-word' }}>{value}</Typography>
            </Box>
            <Button size="small" onClick={onEdit} sx={{ textTransform: 'none', color: ORANGE, fontWeight: 700 }}>Edit</Button>
        </Stack>
    );
}

function SumRow({ icon: Icon, color, label, value, valueColor, labelColor }) {
    return (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.75 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <Icon size={16} color={color} />
                <Typography sx={{ fontSize: 14, color: labelColor || '#555' }}>{label}</Typography>
            </Stack>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: valueColor || '#1a1a1a' }}>{value}</Typography>
        </Stack>
    );
}

function FreeLine({ icon: Icon, color, label }) {
    return (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.75 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <Icon size={16} color={color} />
                <Typography sx={{ fontSize: 14, color: '#555' }}>{label}</Typography>
            </Stack>
            <Box sx={{ height: 20, display: 'flex', alignItems: 'center', fontSize: 10, fontWeight: 700, px: 1, borderRadius: '10px', bgcolor: '#dcfce7', color: '#16a34a', border: '1px solid #86efac' }}>FREE</Box>
        </Stack>
    );
}

function PriceLine({ label, value, bold, green }) {
    return (
        <Stack direction="row" justifyContent="space-between" sx={{ py: 0.6 }}>
            <Typography sx={{ fontSize: 14, fontWeight: bold ? 800 : 500, color: green ? '#2e7d32' : 'inherit' }}>{label}</Typography>
            <Typography sx={{ fontSize: bold ? 18 : 14, fontWeight: bold ? 800 : 600, color: green ? '#2e7d32' : bold ? ORANGE : 'inherit' }}>{value}</Typography>
        </Stack>
    );
}

function ReviewStep({ combo, date, time, address, mode, panditName, goTo }) {
    const b = combo.priceBreakup || {};
    const hasBreakup = Number.isFinite(b.pujaPrice) && Number.isFinite(b.kitPrice) && b.pujaPrice + b.kitPrice > 0;
    const addrLine = [address.street, address.landmark && `Near ${address.landmark}`, address.city, address.state, address.zip].filter(Boolean).join(', ');
    const img = combo.image?.url;
    return (
        <Grid container spacing={3}>
            <Grid size={{ md: 7, xs: 12 }}>
                <Box sx={cardSx}>
                    <Stack direction="row" spacing={2} sx={{ pb: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                        <Box sx={{ position: 'relative', width: 90, height: 72, borderRadius: '10px', overflow: 'hidden', background: '#f0e0d0', flexShrink: 0 }}>
                            {img && <Image alt={combo.name} src={img} fill style={{ objectFit: 'cover' }} />}
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 700 }}>{combo.name}</Typography>
                            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{[combo.duration, (combo.languages || []).filter(Boolean).map(capLang).join(' • ')].filter(Boolean).join('  |  ')}</Typography>
                        </Box>
                    </Stack>
                    <ReviewRow icon={MdAccessTime} label="Date & Time" value={`${prettyDate(date)}, ${label12(time)}`} onEdit={() => goTo(0)} />
                    <ReviewRow icon={MdLocationOn} label={`Service Location (${address.type})`} value={addrLine} onEdit={() => goTo(1)} />
                    <ReviewRow icon={FaUserTie} label="Pandit Ji" value={mode === 'any' ? 'Any Available Pandit (Verified)' : panditName} onEdit={() => goTo(2)} />
                </Box>
            </Grid>
            <Grid size={{ md: 5, xs: 12 }}>
                <Box sx={{ ...cardSx, position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #f97316, #fb923c, #fdba74)' } }}>
                    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <MdReceipt size={17} color="#f97316" />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a', lineHeight: 1.2 }}>Price Details</Typography>
                            <Typography sx={{ fontSize: 12, color: '#888' }}>Breakdown of your order</Typography>
                        </Box>
                    </Stack>

                    <Stack spacing={0.25}>
                        {hasBreakup ? (
                            <>
                                <SumRow icon={MdShoppingBag} color="#f97316" label={`Puja Service (${combo.puja?.name || ''})`} value={inr(b.pujaPrice)} />
                                <SumRow icon={MdInventory2} color="#f97316" label="Puja Samagri Kit" value={inr(b.kitPrice)} />
                            </>
                        ) : (
                            <SumRow icon={MdShoppingBag} color="#f97316" label="Combo (Pandit Ji + Puja + Kit)" value={inr(combo.comboPrice)} />
                        )}
                        <FreeLine icon={MdDeliveryDining} color="#6366f1" label="Delivery charge" />
                        <FreeLine icon={MdInventory2} color="#0ea5e9" label="Handling charge" />
                        <FreeLine icon={MdCreditCard} color="#22c55e" label="Platform fee" />
                        {hasBreakup && <SumRow icon={MdReceiptLong} color="#a78bfa" label="Individual Total" value={inr(combo.originalPrice)} />}
                        {hasBreakup && combo.discountAmount > 0 && <SumRow icon={MdLocalOffer} color="#2e7d32" label="Combo Discount" value={`−${inr(combo.discountAmount)}`} valueColor="#2e7d32" labelColor="#2e7d32" />}
                    </Stack>

                    <Box sx={{ borderTop: '1px dashed rgba(249,115,22,0.3)', my: 1.5 }} />

                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <MdAccountBalanceWallet size={18} color="#f97316" />
                            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>Total Amount</Typography>
                        </Stack>
                        <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#f97316' }}>{inr(combo.comboPrice)}</Typography>
                    </Stack>

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, p: 1.25, bgcolor: 'rgba(249,115,22,0.07)', borderRadius: '12px', border: '1px dashed rgba(249,115,22,0.4)' }}>
                        <MdInfoOutline size={15} color="#f97316" style={{ marginTop: 1, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>
                            <strong style={{ color: '#92400e' }}>GST inclusive:</strong> All prices displayed are inclusive of applicable GST.
                        </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 1.5 }}>
                        Pay securely online via UPI, Credit/Debit Card, Net Banking or Wallet. You will choose the payment method on the next secure page.
                    </Typography>
                </Box>
            </Grid>
        </Grid>
    );
}

/* ---------------- Wizard ---------------- */
export default function ComboBookingWizard({ slug }) {
    const router = useRouter();
    const { isAuthenticated } = useSelector(({ user }) => user);
    const storeKey = `combo-booking:${slug}`;

    const [combo, setCombo] = React.useState(undefined);
    const [step, setStep] = React.useState(0);
    const [date, setDate] = React.useState('');
    const [time, setTime] = React.useState('');
    const [slots, setSlots] = React.useState([]);
    const [slotsLoading, setSlotsLoading] = React.useState(false);
    const [address, setAddress] = React.useState(EMPTY_ADDRESS);
    const [addrErrors, setAddrErrors] = React.useState({});
    const [mode, setMode] = React.useState('choose');
    const [panditId, setPanditId] = React.useState('');
    const [pandits, setPandits] = React.useState([]);
    const [panditsLoading, setPanditsLoading] = React.useState(false);
    const [availableCount, setAvailableCount] = React.useState(null);
    const [processing, setProcessing] = React.useState(false);
    const [error, setError] = React.useState('');
    const [restored, setRestored] = React.useState(false);

    // load combo
    React.useEffect(() => {
        let alive = true;
        api
            .getPujaComboBySlug(slug)
            .then((res) => alive && setCombo(res?.data || null))
            .catch(() => alive && setCombo(null));
        return () => {
            alive = false;
        };
    }, [slug]);

    // restore progress (survives the login redirect) + last saved address
    React.useEffect(() => {
        try {
            const raw = sessionStorage.getItem(storeKey);
            const saved = localStorage.getItem('combo-saved-address');
            if (raw) {
                const s = JSON.parse(raw);
                const validDate = !!s.date && new Date(`${s.date}T00:00:00`) >= startOfToday();
                if (validDate) {
                    setDate(s.date);
                    setTime(s.time || '');
                }
                if (s.address) setAddress({ ...EMPTY_ADDRESS, ...s.address });
                if (s.mode) setMode(s.mode);
                if (s.panditId) setPanditId(s.panditId);
                if (validDate && s.time && Number.isInteger(s.step)) setStep(s.step);
            } else if (saved) {
                setAddress({ ...EMPTY_ADDRESS, ...JSON.parse(saved) });
            }
        } catch (e) {
            /* ignore bad storage */
        }
        setRestored(true);
    }, [storeKey]);

    React.useEffect(() => {
        if (!restored) return;
        try {
            sessionStorage.setItem(storeKey, JSON.stringify({ step, date, time, address, mode, panditId }));
        } catch (e) {
            /* storage unavailable */
        }
    }, [restored, storeKey, step, date, time, address, mode, panditId]);

    // browser Back/Forward moves between wizard steps instead of leaving the page
    const histReady = React.useRef(false);
    React.useEffect(() => {
        if (!restored || histReady.current) return;
        histReady.current = true;
        try {
            const st = window.history.state || {};
            if (Number.isInteger(st.comboStep)) return;
            window.history.replaceState({ ...st, comboStep: 0 }, '');
            for (let i = 1; i <= step; i += 1) window.history.pushState({ ...(window.history.state || {}), comboStep: i }, '');
        } catch (e) {
            /* history unavailable */
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restored]);

    React.useEffect(() => {
        if (!restored || !histReady.current) return;
        try {
            const cur = window.history.state?.comboStep;
            if (cur === step) return;
            window.history.pushState({ ...(window.history.state || {}), comboStep: step }, '');
        } catch (e) {
            /* history unavailable */
        }
    }, [step, restored]);

    React.useEffect(() => {
        const onPop = (e) => {
            const st = e.state?.comboStep;
            if (Number.isInteger(st)) {
                setError('');
                setStep(st);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, []);

    // slots for selected date
    React.useEffect(() => {
        if (!date) return;
        let alive = true;
        setSlotsLoading(true);
        getPujaComboSlots(slug, date)
            .then((res) => {
                if (!alive) return;
                const list = res?.payload?.slots || [];
                setSlots(list);
                setTime((t) => (t && list.some((s) => s.time === t && s.available) ? t : ''));
            })
            .catch(() => alive && setSlots([]))
            .finally(() => alive && setSlotsLoading(false));
        return () => {
            alive = false;
        };
    }, [slug, date]);

    const whenISO = date && time ? new Date(`${date}T${time}:00`).toISOString() : '';

    // pandits (with availability for the chosen time) when entering step 3 / review
    React.useEffect(() => {
        if (step < 2 || !whenISO) return;
        let alive = true;
        setPanditsLoading(true);
        getPujaComboPandits(slug, whenISO)
            .then((res) => {
                if (!alive) return;
                const list = res?.payload?.pandits || [];
                setPandits(list);
                setAvailableCount(res?.payload?.availableCount ?? list.length);
                setPanditId((id) => (list.some((p) => p.id === id && p.available) ? id : ''));
            })
            .catch(() => alive && setError('Could not load Pandit Ji list. Please try again.'))
            .finally(() => alive && setPanditsLoading(false));
        return () => {
            alive = false;
        };
    }, [slug, whenISO, step]);

    const validateAddress = () => {
        const e = {};
        if (!address.street.trim()) e.street = 'Full address is required';
        if (!address.city.trim()) e.city = 'City is required';
        if (!address.state.trim()) e.state = 'State is required';
        if (!/^\d{6}$/.test(address.zip)) e.zip = 'Enter a valid 6-digit pincode';
        setAddrErrors(e);
        return Object.keys(e).length === 0;
    };

    const next = () => {
        setError('');
        if (step === 0 && (!date || !time)) return setError('Please select a date and a time slot');
        if (step === 1 && !validateAddress()) return;
        if (step === 2) {
            if (availableCount === 0) return setError('No Pandit Ji is available at this time. Please choose another slot.');
            if (mode === 'choose' && !panditId) return setError('Please select a Pandit Ji or choose "Any Available Pandit"');
        }
        setStep((s) => Math.min(3, s + 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const back = () => {
        setError('');
        setStep((s) => Math.max(0, s - 1));
    };
    const goTo = (i) => {
        setError('');
        setStep(i);
    };

    const pay = async () => {
        setError('');
        if (!isAuthenticated) {
            toast.error('Please login to continue');
            router.push(`/auth/sign-in?redirect=${encodeURIComponent(`/puja-combos/${slug}/book`)}`);
            return;
        }
        setProcessing(true);
        try {
            const res = await bookPujaCombo(slug, {
                vendorId: mode === 'any' ? 'any' : panditId,
                dateTime: whenISO,
                address: { streetAddress: address.street.trim(), landmark: address.landmark.trim(), type: address.type, city: address.city.trim(), state: address.state.trim(), country: address.country, zip: address.zip }
            });
            if (res?.error !== false) throw new Error(res?.message || 'Failed to create booking');

            const pay = await api.createBookingPayment({ bookingId: res.payload.booking.id, currency: 'INR', provider: 'razorpay' });
            if (pay?.error !== false) throw new Error(pay?.message || 'Failed to initialize payment');
            const url = pay.payload?.razorpay?.payment_link?.short_url || pay.payload?.payment_link?.short_url;
            if (!url) throw new Error('Payment URL not found');

            try {
                if (address.save) localStorage.setItem('combo-saved-address', JSON.stringify({ ...address, save: true }));
                sessionStorage.removeItem(storeKey);
            } catch (e) {
                /* ignore */
            }
            window.location.href = url;
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.';
            setError(msg);
            if (err?.response?.status === 409) setStep(mode === 'any' ? 0 : 2); // slot / pandit just got taken
            setProcessing(false);
        }
    };

    if (combo === undefined)
        return (
            <Container sx={{ py: 8 }}>
                <Stack alignItems="center"><CircularProgress /></Stack>
            </Container>
        );
    if (!combo)
        return (
            <Container sx={{ py: 8 }}>
                <Stack alignItems="center" spacing={2}>
                    <Typography variant="h5" fontWeight={700}>This combo is not available</Typography>
                    <Button component={Link} href="/puja-combos" variant="outlined" sx={{ borderRadius: '50px', textTransform: 'none', borderColor: ORANGE, color: ORANGE }}>View All Combos</Button>
                </Stack>
            </Container>
        );
    if (combo.kit?.inStock === false)
        return (
            <Container sx={{ py: 8 }}>
                <Stack alignItems="center" spacing={2}>
                    <Typography variant="h5" fontWeight={700}>This combo is currently out of stock</Typography>
                    <Button component={Link} href="/puja-combos" variant="outlined" sx={{ borderRadius: '50px', textTransform: 'none', borderColor: ORANGE, color: ORANGE }}>View Other Combos</Button>
                </Stack>
            </Container>
        );

    const panditName = pandits.find((p) => p.id === panditId)?.name || 'Pandit Ji';
    const [title, subtitle] = TITLES[step];
    const showSummary = step < 3;
    const hint =
        step === 0 && !date ? 'Select a date to continue' : step === 0 && !time ? 'Now pick a time slot' : step === 2 && mode === 'choose' && !panditId ? 'Select a Pandit Ji to continue' : '';

    return (
        <Container maxWidth="xl" sx={{ pb: { xs: 2, md: 4 } }}>
            <HeaderBreadcrumbs
                heading={combo.name}
                links={[{ name: 'Home', href: '/' }, { name: 'Puja Combos', href: '/puja-combos' }, { name: combo.name, href: `/puja-combos/${slug}` }, { name: 'Book' }]}
                sx={{ mb: 3 }}
            />

            <Stepper step={step} onStep={goTo} />

            <Box key={`head-${step}`} sx={{ animation: `${fadeUp} .45s ease both`, mb: 2.5 }}>
                <Typography component="h1" sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 800, color: '#2d1a06' }}>{title}</Typography>
                <Typography sx={{ color: 'text.secondary' }}>{subtitle}</Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ md: showSummary ? 8.5 : 12, xs: 12 }}>
                    {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>}

                    <Box key={step} sx={{ animation: `${fadeUp} .45s ease both` }}>
                        {step === 0 && <DateTimeStep date={date} setDate={setDate} time={time} setTime={setTime} slots={slots} slotsLoading={slotsLoading} />}
                        {step === 1 && <AddressStep address={address} setAddress={setAddress} errors={addrErrors} />}
                        {step === 2 && <PanditStep mode={mode} setMode={setMode} panditId={panditId} setPanditId={setPanditId} pandits={pandits} loading={panditsLoading} availableCount={availableCount} />}
                        {step === 3 && <ReviewStep combo={combo} date={date} time={time} address={address} mode={mode} panditName={panditName} goTo={goTo} />}
                    </Box>

                    {/* action bar - lines up with the content column */}
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                        sx={{ position: { xs: 'sticky', md: 'static' }, bottom: 0, zIndex: 20, mt: 3, mx: { xs: -2, md: 0 }, px: { xs: 2, md: 0 }, py: { xs: 1.3, md: 0 }, background: { xs: '#fff', md: 'transparent' }, borderTop: { xs: `1px solid ${BORDER}`, md: 'none' }, boxShadow: { xs: '0 -6px 20px rgba(0,0,0,0.08)', md: 'none' } }}
                    >
                        {step === 0 ? (
                            <Button component={Link} href={`/puja-combos/${slug}`} startIcon={<MdArrowBack />} sx={outBtn}>Back</Button>
                        ) : (
                            <Button onClick={back} disabled={processing} startIcon={<MdArrowBack />} sx={outBtn}>Back</Button>
                        )}

                        <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 0 }}>
                            {hint && <Typography sx={{ fontSize: 13, color: '#b86000', fontWeight: 600, display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>{hint}</Typography>}
                            {step < 3 ? (
                                <Button onClick={next} endIcon={<MdArrowForward />} sx={{ ...orangeBtn, flexShrink: 0 }}>
                                    {step === 0 ? 'Next: Address' : step === 1 ? 'Next: Choose Pandit Ji' : 'Next: Review & Pay'}
                                </Button>
                            ) : (
                                <Button onClick={pay} disabled={processing} startIcon={processing ? <CircularProgress size={18} color="inherit" /> : <MdLock size={18} />} sx={{ ...orangeBtn, flexShrink: 0 }}>
                                    {processing ? 'Processing...' : `Pay ${inr(combo.comboPrice)} Securely`}
                                </Button>
                            )}
                        </Stack>
                    </Stack>
                </Grid>

                {showSummary && (
                    <Grid size={{ md: 3.5, xs: 12 }}>
                        <SummaryCard combo={combo} date={date} time={time} address={address} mode={mode} panditId={panditId} panditName={panditName} step={step} />
                    </Grid>
                )}
            </Grid>
        </Container>
    );
}