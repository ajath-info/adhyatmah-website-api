'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';

// mui
import {
    Box,
    Card,
    Grid,
    Stack,
    Chip,
    Button,
    MenuItem,
    Select,
    Skeleton,
    Typography,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Divider,
    InputAdornment
} from '@mui/material';

// icons
import { WiSunrise, WiSunset, WiMoonrise, WiMoonset } from 'react-icons/wi';
import { GiMoonOrbit, GiSunrise } from 'react-icons/gi';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { BsCalendarEvent } from 'react-icons/bs';
import {
    TbClockExclamation,
    TbSparkles,
    TbChevronLeft,
    TbChevronRight,
    TbCalendar,
    TbSun,
    TbHeartHandshake,
    TbWand,
    TbGift,
    TbChartBar,
    TbDiamond,
    TbMoonStars,
    TbSend,
    TbMail,
    TbCalendarEvent,
    TbFlower,
    TbCircleCheck,
    TbArrowRight,
    TbShare2,
    TbCompass,
    TbBriefcase,
    TbCar,
    TbHome,
    TbUserPlus,
} from 'react-icons/tb';

// services
import { getPanchang, getPanchangCities } from '@/services/panchang-service';

// ----------------------------------------------------------------------
// Module-scoped colour theme — soft indigo/lavender + moonlit gradient,
// matching the "modern spiritual astrology" reference design. Only this
// Panchang & Muhurat module uses these tokens.
// ----------------------------------------------------------------------
// Hero banner slides — auto-rotating, like the old site's moving banner.
// Add more image paths here any time (drop the file in /public/images and
// add its path) — the carousel below adapts automatically.
const HERO_BANNERS = ['/images/panchang-hero-banner.png', '/images/panchang-hero-banner-2.png', '/images/panchang-hero-banner-3.png'];
const HERO_BANNER_INTERVAL_MS = 6000;

const PANCHANG_THEME = {
    // 🌙 Chandra (चंद्र) theme. Every value is a CSS variable defined in
    // src/theme/panchang-vars.js, so the same code renders correctly in both
    // light and dark mode (previously these were light-only hex colours).
    navy: 'var(--pm-navy)',
    navySoft: 'var(--pm-navy-soft)',
    accent: 'var(--pm-accent)',
    bgGradient: 'var(--pm-page-grad)',
    heroGradient: 'var(--pm-hero-grad)',
    panelBorder: 'var(--pm-border)',
    iconBg: 'var(--pm-icon-bg)',
    muted: 'var(--pm-muted)',
    auspiciousMain: 'var(--pm-aus)',
    auspiciousBg: 'var(--pm-aus-bg)',
    inauspiciousMain: 'var(--pm-inaus)',
    inauspiciousBg: 'var(--pm-inaus-bg)',
    shadow: 'var(--pm-shadow)',
    shadowLg: 'var(--pm-shadow-lg)',
    neutralMain: 'var(--pm-neutral)',
    neutralBg: 'var(--pm-neutral-bg)',
    bestMain: 'var(--pm-best)',
    bestBg: 'var(--pm-best-bg)'
};

// ----------------------------------------------------------------------
// Choghadiya — the day (sunrise→sunset) and night (sunset→next sunrise)
// are each split into 8 equal muhurats, cycling through 7 named periods
// in a fixed order that depends only on the weekday. This is the
// standard classical sequence used across Panchang references, so it is
// computed client-side from sunrise/sunset (no extra API call needed).
// Night's end (next sunrise) isn't returned by the API, so it is
// approximated as sunrise + 24h, same as most Panchang sites do.
// ----------------------------------------------------------------------
const CHOGHADIYA_DAY_SEQUENCE = {
    0: ['Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'], // Sunday
    1: ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Chal', 'Labh', 'Amrit'], // Monday
    2: ['Rog', 'Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'], // Tuesday
    3: ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Chal', 'Labh'], // Wednesday
    4: ['Shubh', 'Rog', 'Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal', 'Shubh'], // Thursday
    5: ['Chal', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Chal'], // Friday
    6: ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal'] // Saturday
};
const CHOGHADIYA_NIGHT_SEQUENCE = {
    0: ['Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'],
    1: ['Chal', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Chal'],
    2: ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal'],
    3: ['Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal', 'Labh', 'Udveg'],
    4: ['Amrit', 'Chal', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit'],
    5: ['Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog'],
    6: ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal', 'Labh']
};
// tone + friendly meaning shown per period
const CHOGHADIYA_META = {
    Amrit: { tone: 'best', meaning: 'Best — auspicious for all work' },
    Shubh: { tone: 'good', meaning: 'Good — favourable, safe to begin work' },
    Labh: { tone: 'good', meaning: 'Gain — good for financial & business work' },
    Chal: { tone: 'neutral', meaning: 'Neutral — okay for travel, routine work' },
    Kaal: { tone: 'bad', meaning: 'Avoid — inauspicious, delays likely' },
    Rog: { tone: 'bad', meaning: 'Avoid — obstacles, ill health risk' },
    Udveg: { tone: 'bad', meaning: 'Avoid — anxiety, disputes likely' }
};

function computeChoghadiya(sunriseIso, sunsetIso, weekdayIdx) {
    if (!sunriseIso || !sunsetIso || weekdayIdx === undefined || weekdayIdx === null) return null;
    const sunrise = new Date(sunriseIso).getTime();
    const sunset = new Date(sunsetIso).getTime();
    if (Number.isNaN(sunrise) || Number.isNaN(sunset) || sunset <= sunrise) return null;

    const nextSunrise = sunrise + 24 * 60 * 60 * 1000; // approximation — API doesn't return next day's sunrise
    const daySeq = CHOGHADIYA_DAY_SEQUENCE[weekdayIdx];
    const nightSeq = CHOGHADIYA_NIGHT_SEQUENCE[weekdayIdx];
    const dayStep = (sunset - sunrise) / 8;
    const nightStep = (nextSunrise - sunset) / 8;

    const day = daySeq.map((name, i) => ({
        name,
        ...CHOGHADIYA_META[name],
        start: new Date(sunrise + i * dayStep).toISOString(),
        end: new Date(sunrise + (i + 1) * dayStep).toISOString()
    }));
    const night = nightSeq.map((name, i) => ({
        name,
        ...CHOGHADIYA_META[name],
        start: new Date(sunset + i * nightStep).toISOString(),
        end: new Date(sunset + (i + 1) * nightStep).toISOString()
    }));
    return { day, night };
}

// Prokerala returns full ISO datetimes (e.g. "2026-09-03T06:03:04+05:30") —
// display just the local time, e.g. "6:03 AM".
function formatTime(isoString) {
    if (!isoString) return undefined;
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// "Upto 6:03 AM" — used under Tithi/Nakshatra/Yoga/Karana/Moon Sign to show
// when the current one ends and the next begins (matches how most Panchang
// sites, e.g. AstroSage, display these).
function formatUpto(isoString) {
    const t = formatTime(isoString);
    return t ? `Upto ${t}` : undefined;
}

// "YYYY-MM-DD" for a given Date (or today), in the browser's local calendar.
function toDateInputValue(d = new Date()) {
    return d.toLocaleDateString('en-CA');
}

function shiftDateString(dateStr, days) {
    const d = new Date(`${dateStr}T00:00:00`);
    d.setDate(d.getDate() + days);
    return toDateInputValue(d);
}

function formatDateLabel(dateStr) {
    const d = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

// Time-of-day greeting shown above the hero headline — small personal
// touch, purely presentational.
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 5) return 'Namaste 🙏';
    if (hour < 12) return 'Good Morning 🙏';
    if (hour < 17) return 'Good Afternoon 🙏';
    if (hour < 21) return 'Good Evening 🙏';
    return 'Namaste 🙏';
}

// Live status for the Abhijit Muhurat window ("Starts in 45m" / "Active
// now" / "Ended for today") — re-evaluated against the `now` tick so the
// hero and highlight cards feel alive instead of a static time range.
function getMuhuratStatus(startIso, endIso, now) {
    if (!startIso || !endIso || !now) return null;
    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();
    const current = now.getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) return null;

    if (current < start) {
        const diffMin = Math.max(1, Math.round((start - current) / 60000));
        const label = diffMin < 60 ? `Starts in ${diffMin}m` : `Starts in ${Math.floor(diffMin / 60)}h ${diffMin % 60}m`;
        return { label, tone: 'upcoming' };
    }
    if (current <= end) {
        return { label: 'Active now', tone: 'active' };
    }
    return { label: 'Ended for today', tone: 'ended' };
}

// Small pulsing-dot status pill used next to the Abhijit Muhurat time —
// green/pulsing when active, neutral otherwise.
// Picks a desktop column count that fills every row evenly (no lonely orphan
// card at the end). Falls back to the first candidate when nothing divides.
function pickColumns(count, candidates) {
    return candidates.find((c) => count % c === 0) || candidates[0];
}

function MuhuratStatusPill({ status }) {
    if (!status) return null;
    const isActive = status.tone === 'active';
    return (
        <Stack
            direction="row"
            spacing={0.6}
            alignItems="center"
            sx={{
                px: 1,
                py: 0.35,
                borderRadius: 10,
                bgcolor: isActive ? PANCHANG_THEME.bestBg : PANCHANG_THEME.iconBg,
                width: 'fit-content'
            }}
        >
            <Box
                sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: isActive ? PANCHANG_THEME.bestMain : PANCHANG_THEME.muted,
                    animation: isActive ? 'panchangPulse 1.4s ease-in-out infinite' : 'none'
                }}
            />
            <Typography variant="caption" sx={{ color: isActive ? PANCHANG_THEME.bestMain : PANCHANG_THEME.muted, fontWeight: 700, fontSize: 11 }}>
                {status.label}
            </Typography>
        </Stack>
    );
}

// Plain-text summary used for the Web Share API / clipboard fallback —
// intentionally simple so it reads well as a WhatsApp message.
function buildPanchangShareText(panchang, dateLabel) {
    if (!panchang) return '';
    const lines = [
        `📿 Panchang for ${dateLabel}`,
        panchang.tithi?.name && `Tithi: ${panchang.tithi.name}${panchang.tithi.paksha ? ` (${panchang.tithi.paksha})` : ''}`,
        panchang.nakshatra?.name && `Nakshatra: ${panchang.nakshatra.name}`,
        panchang.sunrise && `Sunrise: ${formatTime(panchang.sunrise)}`,
        panchang.sunset && `Sunset: ${formatTime(panchang.sunset)}`,
        panchang.abhijitMuhurat?.start &&
        `Abhijit Muhurat: ${formatTime(panchang.abhijitMuhurat.start)} – ${formatTime(panchang.abhijitMuhurat.end)}`,
        '',
        'Via Adhyatmah — adhyatmah.com/panchang-muhurat'
    ].filter(Boolean);
    return lines.join('\n');
}

function SectionHeading({ icon: Icon = TbSparkles, children, subtitle, action }) {
    return (
        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: subtitle ? 2 : 1.75 }}>
            <Box
                sx={{
                    width: 34,
                    height: 34,
                    flexShrink: 0,
                    borderRadius: 2,
                    bgcolor: PANCHANG_THEME.iconBg,
                    color: PANCHANG_THEME.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: 0.25
                }}
            >
                <Icon size={17} />
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ color: PANCHANG_THEME.navy, fontWeight: 700, letterSpacing: 0.1, lineHeight: 1.3 }}>
                    {children}
                </Typography>
                {subtitle && (
                    <Typography variant="body2" sx={{ color: PANCHANG_THEME.muted, mt: 0.1 }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
            {action}
        </Stack>
    );
}

// ----------------------------------------------------------------------
// Shloka of the Day — a new verse for every date. The chip shows the weekday
// and the graha that rules it, the verse itself rotates through the list below.
const VARA_GRAHA = ['Surya (Sun)', 'Chandra (Moon)', 'Mangala (Mars)', 'Budha (Mercury)', 'Guru (Jupiter)', 'Shukra (Venus)', 'Shani (Saturn)'];
const VARA_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// 27 verses, one per day. The index is the number of days since 1970, so
// every date gets the next verse and nothing repeats for 27 days.
const DAILY_SHLOKAS = [
    { source: 'Bhagavad Gita 2.47', sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥', meaning: 'You have the right to your work alone, never to its fruits. Do not act for the reward, and do not cling to inaction.', moral: 'Give your best effort and let go of anxiety about the result.' },
    { source: 'Bhagavad Gita 2.22', sanskrit: 'वासांसि जीर्णानि यथा विहाय नवानि गृह्णाति नरोऽपराणि ।\nतथा शरीराणि विहाय जीर्णान्यन्यानि संयाति नवानि देही ॥', meaning: 'As a person discards worn-out clothes and puts on new ones, the soul discards worn-out bodies and takes new ones.', moral: 'Change is natural. Face endings with calm.' },
    { source: 'Bhagavad Gita 2.23', sanskrit: 'नैनं छिन्दन्ति शस्त्राणि नैनं दहति पावकः ।\nन चैनं क्लेदयन्त्यापो न शोषयति मारुतः ॥', meaning: 'Weapons cannot cut the soul, fire cannot burn it, water cannot wet it, and wind cannot dry it.', moral: 'Your inner self is stronger than any outer trouble.' },
    { source: 'Bhagavad Gita 2.38', sanskrit: 'सुखदुःखे समे कृत्वा लाभालाभौ जयाजयौ ।\nततो युद्धाय युज्यस्व नैवं पापमवाप्स्यसि ॥', meaning: 'Treat pleasure and pain, gain and loss, victory and defeat alike, and then do your duty.', moral: 'Stay steady in both good and bad days.' },
    { source: 'Bhagavad Gita 2.48', sanskrit: 'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय ।\nसिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते ॥', meaning: 'Be steadfast in yoga, act without attachment, and stay even-minded in success and failure. Such balance is called yoga.', moral: 'Balance of mind is the real skill in life.' },
    { source: 'Bhagavad Gita 3.35', sanskrit: 'श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात् ।\nस्वधर्मे निधनं श्रेयः परधर्मो भयावहः ॥', meaning: 'Doing your own duty imperfectly is better than doing another\'s perfectly.', moral: 'Be true to your own path instead of copying others.' },
    { source: 'Bhagavad Gita 4.7', sanskrit: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत ।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम् ॥', meaning: 'Whenever righteousness declines and unrighteousness rises, I manifest myself.', moral: 'Hope is never lost. Dharma returns when it is needed most.' },
    { source: 'Bhagavad Gita 4.8', sanskrit: 'परित्राणाय साधूनां विनाशाय च दुष्कृताम् ।\nधर्मसंस्थापनार्थाय सम्भवामि युगे युगे ॥', meaning: 'To protect the good, to destroy evil, and to re-establish dharma, I appear in every age.', moral: 'Stand with what is right, even when it is hard.' },
    { source: 'Bhagavad Gita 5.18', sanskrit: 'विद्याविनयसम्पन्ने ब्राह्मणे गवि हस्तिनि ।\nशुनि चैव श्वपाके च पण्डिताः समदर्शिनः ॥', meaning: 'The wise see all beings with an equal eye, whether a learned person, a cow, an elephant, a dog or an outcast.', moral: 'Treat every person and every creature with respect.' },
    { source: 'Bhagavad Gita 6.5', sanskrit: 'उद्धरेदात्मनात्मानं नात्मानमवसादयेत् ।\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः ॥', meaning: 'Lift yourself by your own mind and never let yourself down. The mind is your best friend, and also your worst enemy.', moral: 'Speak to yourself with encouragement, not doubt.' },
    { source: 'Bhagavad Gita 6.17', sanskrit: 'युक्ताहारविहारस्य युक्तचेष्टस्य कर्मसु ।\nयुक्तस्वप्नावबोधस्य योगो भवति दुःखहा ॥', meaning: 'For one who is moderate in food, recreation, work, sleep and wakefulness, yoga destroys sorrow.', moral: 'A balanced routine is the base of a peaceful life.' },
    { source: 'Bhagavad Gita 9.22', sanskrit: 'अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते ।\nतेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम् ॥', meaning: 'To those who worship me with undivided devotion, I carry what they lack and protect what they have.', moral: 'Steady faith brings steady support.' },
    { source: 'Bhagavad Gita 9.26', sanskrit: 'पत्रं पुष्पं फलं तोयं यो मे भक्त्या प्रयच्छति ।\nतदहं भक्त्युपहृतमश्नामि प्रयतात्मनः ॥', meaning: 'Whoever offers me a leaf, a flower, a fruit or water with devotion, I accept that loving offering.', moral: 'Sincerity matters more than the size of the offering.' },
    { source: 'Bhagavad Gita 18.66', sanskrit: 'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज ।\nअहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः ॥', meaning: 'Surrender to me alone. I will free you from all sins, so do not grieve.', moral: 'Let go of worry and trust the higher path.' },
    { source: 'Bhagavad Gita 18.78', sanskrit: 'यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः ।\nतत्र श्रीर्विजयो भूतिर्ध्रुवा नीतिर्मतिर्मम ॥', meaning: 'Where there is Krishna, the lord of yoga, and Arjuna, the archer, there are prosperity, victory and sound judgment.', moral: 'Wisdom joined with effort leads to success.' },
    { source: 'Mahamrityunjaya Mantra', sanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् ।\nउर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात् ॥', meaning: 'We worship the three-eyed Shiva, who nourishes all. May he free us from fear and death, like a ripe fruit from its stem.', moral: 'Pray for health and freedom from fear.' },
    { source: 'Brihadaranyaka Upanishad 1.3.28', sanskrit: 'असतो मा सद्गमय ।\nतमसो मा ज्योतिर्गमय ।\nमृत्योर्मा अमृतं गमय ॥', meaning: 'Lead me from untruth to truth, from darkness to light, from death to immortality.', moral: 'Choose truth and light in each small decision today.' },
    { source: 'Shanti Mantra', sanskrit: 'सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ।\nसर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत् ॥', meaning: 'May all be happy, may all be free from illness, may all see good, and may no one suffer.', moral: 'Wish well for everyone, not only for yourself.' },
    { source: 'Isha Upanishad Shanti Mantra', sanskrit: 'ॐ पूर्णमदः पूर्णमिदं पूर्णात्पूर्णमुदच्यते ।\nपूर्णस्य पूर्णमादाय पूर्णमेवावशिष्यते ॥', meaning: 'That is whole, this is whole. From the whole arises the whole, and when the whole is taken from the whole, the whole remains.', moral: 'You already have more than you think.' },
    { source: 'Ganesha Prarthana', sanskrit: 'वक्रतुण्ड महाकाय सूर्यकोटिसमप्रभ ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥', meaning: 'O Ganesha of the curved trunk and mighty form, shining like a million suns, remove all obstacles from my work.', moral: 'Begin every task with a clear and humble mind.' },
    { source: 'Guru Stotra', sanskrit: 'गुरुर्ब्रह्मा गुरुर्विष्णुर्गुरुर्देवो महेश्वरः ।\nगुरुः साक्षात् परं ब्रह्म तस्मै श्रीगुरवे नमः ॥', meaning: 'The guru is Brahma, Vishnu and Maheshwara. The guru is the Supreme itself. Salutations to that guru.', moral: 'Honour the people who taught you.' },
    { source: 'Subhashita', sanskrit: 'विद्या ददाति विनयं विनयाद्याति पात्रताम् ।\nपात्रत्वाद्धनमाप्नोति धनाद्धर्मं ततः सुखम् ॥', meaning: 'Knowledge gives humility, humility gives worthiness, worthiness brings wealth, wealth supports dharma, and dharma brings happiness.', moral: 'Learn with humility and the rest follows.' },
    { source: 'Hitopadesha', sanskrit: 'उद्यमेन हि सिध्यन्ति कार्याणि न मनोरथैः ।\nन हि सुप्तस्य सिंहस्य प्रविशन्ति मुखे मृगाः ॥', meaning: 'Work is accomplished by effort, not by wishes. Deer do not walk into the mouth of a sleeping lion.', moral: 'Dreams need action. Start today.' },
    { source: 'Manusmriti 4.138', sanskrit: 'सत्यं ब्रूयात्प्रियं ब्रूयान्न ब्रूयात्सत्यमप्रियम् ।\nप्रियं च नानृतं ब्रूयादेष धर्मः सनातनः ॥', meaning: 'Speak the truth, speak what is pleasant, and do not speak a harsh truth or a pleasant lie. This is the eternal dharma.', moral: 'Be honest, and say it kindly.' },
    { source: 'Hitopadesha / Maha Upanishad', sanskrit: 'अयं निजः परो वेति गणना लघुचेतसाम् ।\nउदारचरितानां तु वसुधैव कुटुम्बकम् ॥', meaning: 'Calling one person "mine" and another a stranger is the thinking of small minds. For the generous, the whole world is family.', moral: 'Widen your circle of care.' },
    { source: 'Gayatri Mantra', sanskrit: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं\nभर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ॥', meaning: 'We meditate on the radiant light of the divine Savitr. May it inspire our minds.', moral: 'Ask for clear thinking before anything else.' },
    { source: 'Bhagavad Gita 4.38', sanskrit: 'न हि ज्ञानेन सदृशं पवित्रमिह विद्यते ।\nतत्स्वयं योगसंसिद्धः कालेनात्मनि विन्दति ॥', meaning: 'Nothing in this world purifies like knowledge. In time, the one perfected in yoga finds it within.', moral: 'Keep learning. Knowledge cleans the mind.' }
];

function ShlokaOfTheDay({ dateStr }) {
    const d = new Date(`${dateStr}T00:00:00`);
    const valid = !Number.isNaN(d.getTime());
    const day = valid ? d.getDay() : new Date().getDay();
    const dayNumber = valid ? Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000) : 0;
    const item = DAILY_SHLOKAS[dayNumber % DAILY_SHLOKAS.length];
    const GOLD = '#D6A84F';

    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <SectionHeading icon={TbSparkles} subtitle="A verse for the graha who rules today.">
                Shloka of the Day
            </SectionHeading>
            <Card
                elevation={0}
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    textAlign: 'center',
                    px: { xs: 2.5, md: 3.5 },
                    py: { xs: 2.5, md: 2.5 },
                    minHeight: 0,
                    borderRadius: 3,
                    color: '#FFFFFF',
                    border: '1px solid rgba(214, 168, 79, 0.40)',
                    background: `radial-gradient(circle at 50% -10%, rgba(221,230,245,0.28) 0%, rgba(221,230,245,0) 55%), linear-gradient(165deg, #0F2A4D 0%, #173B67 60%, #245A94 100%)`,
                    boxShadow: PANCHANG_THEME.shadowLg
                }}
            >
                {/* soft Om watermark, kept behind the text and away from the verse */}
                <Typography
                    aria-hidden
                    sx={{
                        position: 'absolute',
                        left: '50%',
                        bottom: -40,
                        transform: 'translateX(-50%)',
                        fontSize: 220,
                        lineHeight: 1,
                        color: 'rgba(255,255,255,0.05)',
                        pointerEvents: 'none',
                        userSelect: 'none'
                    }}
                >
                    ॐ
                </Typography>

                <Box sx={{ position: 'relative' }}>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 1.75,
                            py: 0.6,
                            borderRadius: 10,
                            bgcolor: 'rgba(255,255,255,0.10)',
                            border: '1px solid rgba(214, 168, 79, 0.50)'
                        }}
                    >
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: GOLD }} />
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: GOLD }}>
                            {VARA_NAMES[day]} · {VARA_GRAHA[day]}
                        </Typography>
                    </Box>

                    <Typography
                        sx={{
                            mt: 2,
                            fontSize: { xs: 20, md: 22 },
                            fontWeight: 700,
                            lineHeight: 1.7,
                            letterSpacing: 0,
                            whiteSpace: 'pre-line',
                            color: '#FFFFFF',
                            textShadow: '0 2px 14px rgba(0,0,0,0.25)'
                        }}
                    >
                        {item.sanskrit}
                    </Typography>

                    {/* ornamental divider */}
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5} sx={{ my: 2 }}>
                        <Box sx={{ height: '1px', width: 56, background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
                        <Typography aria-hidden sx={{ color: GOLD, fontSize: 14, lineHeight: 1 }}>
                            ✦
                        </Typography>
                        <Box sx={{ height: '1px', width: 56, background: `linear-gradient(270deg, transparent, ${GOLD})` }} />
                    </Stack>

                    <Typography
                        sx={{ maxWidth: 460, mx: 'auto', fontSize: 14, fontStyle: 'italic', lineHeight: 1.6, letterSpacing: 0, color: 'rgba(255,255,255,0.88)' }}
                    >
                        {item.meaning}
                    </Typography>

                    <Box
                        sx={{
                            mt: 2,
                            mx: 'auto',
                            maxWidth: 460,
                            px: 2,
                            py: 1.1,
                            borderRadius: 2.5,
                            bgcolor: 'rgba(255,255,255,0.10)',
                            border: '1px solid rgba(255,255,255,0.16)'
                        }}
                    >
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: GOLD, mb: 0.4 }}>Today&apos;s takeaway</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.55, letterSpacing: 0, color: '#FFFFFF' }}>{item.moral}</Typography>
                    </Box>

                    <Typography sx={{ mt: 1.5, fontSize: 12, letterSpacing: 0.3, color: 'rgba(255,255,255,0.55)' }}>— {item.source}</Typography>
                </Box>
            </Card>
        </Box>
    );
}

function InfoCard({ icon: Icon, label, value, sub, tone = 'default' }) {
    const toneColors =
        tone === 'auspicious'
            ? { icon: PANCHANG_THEME.auspiciousMain, bg: PANCHANG_THEME.auspiciousBg }
            : tone === 'inauspicious'
                ? { icon: PANCHANG_THEME.inauspiciousMain, bg: PANCHANG_THEME.inauspiciousBg }
                : { icon: PANCHANG_THEME.navy, bg: PANCHANG_THEME.iconBg };

    return (
        <Card
            elevation={0}
            sx={{
                p: 2.5,
                height: '100%',
                borderRadius: 3,
                border: `1px solid ${PANCHANG_THEME.panelBorder}`,
                boxShadow: PANCHANG_THEME.shadow,
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: PANCHANG_THEME.shadowLg }
            }}
        >
            <Stack direction="row" spacing={1.75} alignItems="flex-start">
                {Icon && (
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            flexShrink: 0,
                            borderRadius: '50%',
                            bgcolor: toneColors.bg,
                            color: toneColors.icon,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Icon size={22} />
                    </Box>
                )}
                <Box>
                    <Typography variant="caption" sx={{ color: PANCHANG_THEME.muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                        {label}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 0.25, color: PANCHANG_THEME.navy, fontWeight: 700 }}>
                        {value || '—'}
                    </Typography>
                    {sub && (
                        <Typography variant="body2" sx={{ color: PANCHANG_THEME.muted }}>
                            {sub}
                        </Typography>
                    )}
                </Box>
            </Stack>
        </Card>
    );
}

// Compact card for the 8-up "Today's Panchang" glance row — same data,
// smaller footprint than InfoCard so eight can sit comfortably in one row.
function GlanceCard({ icon: Icon, label, value, sub }) {
    return (
        <Card
            elevation={0}
            sx={{
                px: 1.5,
                py: 1.25,
                height: '100%',
                borderRadius: 2.5,
                border: `1px solid ${PANCHANG_THEME.panelBorder}`,
                boxShadow: PANCHANG_THEME.shadow,
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                '&:hover': { transform: 'translateY(-1px)', boxShadow: PANCHANG_THEME.shadowLg }
            }}
        >
            <Stack direction="row" spacing={1.25} alignItems="center">
                {Icon && (
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            flexShrink: 0,
                            borderRadius: '50%',
                            bgcolor: PANCHANG_THEME.iconBg,
                            color: PANCHANG_THEME.navy,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Icon size={16} />
                    </Box>
                )}
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography variant="caption" sx={{ color: PANCHANG_THEME.muted, fontWeight: 600, lineHeight: 1.2, display: 'block' }}>
                        {label}
                    </Typography>
                    <Typography sx={{ color: PANCHANG_THEME.navy, fontWeight: 700, fontSize: 14.5, lineHeight: 1.25 }} noWrap title={value || ''}>
                        {value || '—'}
                    </Typography>
                    {sub && (
                        <Typography
                            variant="caption"
                            sx={{ color: PANCHANG_THEME.muted, lineHeight: 1.2, fontSize: 11.5 }}
                            noWrap
                            component="div"
                            title={sub}
                        >
                            {sub}
                        </Typography>
                    )}
                </Box>
            </Stack>
        </Card>
    );
}

// Decorative "moon" graphic used in the hero — pure CSS/SVG, no image
// assets required, so it always renders regardless of CDN config.
function HeroMoonGraphic() {
    const floatingBadges = [
        { icon: GiMoonOrbit, top: '4%', left: '2%' },
        { icon: WiSunrise, top: '68%', left: '0%' },
        { icon: BsCalendarEvent, top: '2%', left: '72%' },
        { icon: TbSparkles, top: '72%', left: '78%' }
    ];

    return (
        <Box
            sx={{
                position: 'relative',
                width: { xs: 190, md: 240 },
                height: { xs: 190, md: 240 },
                mx: 'auto'
            }}
        >
            {/* orbit ring */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: `1px dashed color-mix(in srgb, ${PANCHANG_THEME.accent} 33%, transparent)`
                }}
            />
            {/* glowing moon disc */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: { xs: 24, md: 32 },
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #DDE6F5 55%, #B7C7E6 100%)',
                    boxShadow: `0 0 0 10px #FFFFFF66, 0 20px 50px rgba(23, 59, 103, 0.35)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Typography
                    sx={{
                        fontSize: { xs: 34, md: 44 },
                        fontWeight: 700,
                        color: '#173B67',
                        opacity: 0.75,
                        lineHeight: 1
                    }}
                >
                    ॐ
                </Typography>
            </Box>
            {/* floating icon badges around the moon */}
            {floatingBadges.map(({ icon: Icon, top, left }, idx) => (
                <Box
                    key={idx}
                    sx={{
                        position: 'absolute',
                        top,
                        left,
                        width: { xs: 34, md: 42 },
                        height: { xs: 34, md: 42 },
                        borderRadius: '50%',
                        bgcolor: 'var(--pm-surface)',
                        color: PANCHANG_THEME.accent,
                        display: { xs: idx > 1 ? 'none' : 'flex', md: 'flex' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: PANCHANG_THEME.shadow
                    }}
                >
                    <Icon size={18} />
                </Box>
            ))}
        </Box>
    );
}

// Horizontal sunrise-to-sunset timeline — plots inauspicious periods and
// the Abhijit Muhurat as coloured segments along the day, with a live
// "Now" marker (today only). Purely derived from data already fetched
// for the glance cards / inauspicious-timings block above, no extra call.
function DailyTimeline({ panchang, now, isToday }) {
    const sunrise = panchang?.sunrise;
    const sunset = panchang?.sunset;
    if (!sunrise || !sunset) return null;

    const toPct = (iso) => {
        const t = new Date(iso).getTime();
        const start = new Date(sunrise).getTime();
        const end = new Date(sunset).getTime();
        if (Number.isNaN(t) || Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;
        return Math.min(100, Math.max(0, ((t - start) / (end - start)) * 100));
    };

    const segments = [];
    (panchang.inauspiciousPeriods || []).forEach((p) => {
        if (!p.start || !p.end) return;
        const left = toPct(p.start);
        const right = toPct(p.end);
        if (left === null || right === null) return;
        segments.push({
            name: p.name,
            start: p.start,
            end: p.end,
            left,
            width: Math.max(0.6, right - left),
            color: PANCHANG_THEME.inauspiciousMain
        });
    });
    if (panchang.abhijitMuhurat?.start && panchang.abhijitMuhurat?.end) {
        const left = toPct(panchang.abhijitMuhurat.start);
        const right = toPct(panchang.abhijitMuhurat.end);
        if (left !== null && right !== null) {
            segments.push({
                name: 'Abhijit Muhurat',
                start: panchang.abhijitMuhurat.start,
                end: panchang.abhijitMuhurat.end,
                left,
                width: Math.max(0.6, right - left),
                color: PANCHANG_THEME.bestMain
            });
        }
    }

    const nowPct = isToday ? toPct(now.toISOString()) : null;

    return (
        <Box sx={{ mt: 3 }}>
            <SectionHeading icon={TbClockExclamation} subtitle="Complete day view of auspicious & inauspicious timings">
                Daily Panchang Timeline
            </SectionHeading>
            <Card
                elevation={0}
                sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: `1px solid ${PANCHANG_THEME.panelBorder}`, boxShadow: PANCHANG_THEME.shadow }}
            >
                <Stack direction="row" spacing={{ xs: 1.5, md: 2.5 }} alignItems="center">
                    <Stack alignItems="center" spacing={0.15} sx={{ flexShrink: 0 }}>
                        <WiSunrise size={24} color={PANCHANG_THEME.auspiciousMain} />
                        <Typography variant="caption" sx={{ color: PANCHANG_THEME.muted, fontSize: 10.5 }}>Sunrise</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: PANCHANG_THEME.navy, whiteSpace: 'nowrap' }}>
                            {formatTime(sunrise)}
                        </Typography>
                    </Stack>

                    <Box sx={{ position: 'relative', flexGrow: 1, height: 10, borderRadius: 10, bgcolor: PANCHANG_THEME.iconBg, mt: nowPct !== null ? 3.5 : 0 }}>
                        {segments.map((s) => (
                            <Box
                                key={`${s.name}-${s.start}`}
                                sx={{
                                    position: 'absolute',
                                    left: `${s.left}%`,
                                    width: `${s.width}%`,
                                    top: 0,
                                    bottom: 0,
                                    bgcolor: s.color,
                                    borderRadius: 10,
                                    opacity: 0.9
                                }}
                            />
                        ))}
                        {nowPct !== null && (
                            <Box sx={{ position: 'absolute', left: `${nowPct}%`, top: -28, transform: 'translateX(-50%)', textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ color: PANCHANG_THEME.accent, fontWeight: 700, fontSize: 10.5, whiteSpace: 'nowrap' }}>
                                    Now
                                </Typography>
                                <Box sx={{ width: 2, height: 18, bgcolor: PANCHANG_THEME.accent, mx: 'auto', borderRadius: 1 }} />
                            </Box>
                        )}
                    </Box>

                    <Stack alignItems="center" spacing={0.15} sx={{ flexShrink: 0 }}>
                        <WiSunset size={24} color={PANCHANG_THEME.inauspiciousMain} />
                        <Typography variant="caption" sx={{ color: PANCHANG_THEME.muted, fontSize: 10.5 }}>Sunset</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: PANCHANG_THEME.navy, whiteSpace: 'nowrap' }}>
                            {formatTime(sunset)}
                        </Typography>
                    </Stack>
                </Stack>

                {segments.length > 0 && (
                    <Stack direction="row" spacing={3} rowGap={1} flexWrap="wrap" useFlexGap sx={{ mt: 2.5, pl: { md: 5 } }}>
                        {segments.map((s) => (
                            <Stack key={`legend-${s.name}-${s.start}`} spacing={0.1}>
                                <Stack direction="row" spacing={0.75} alignItems="center">
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color, flexShrink: 0 }} />
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: s.color }}>
                                        {s.name}
                                    </Typography>
                                </Stack>
                                <Typography variant="caption" sx={{ color: PANCHANG_THEME.muted, pl: 1.75 }}>
                                    {formatTime(s.start)} – {formatTime(s.end)}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                )}
            </Card>
        </Box>
    );
}

// Choghadiya grid — 8 day + 8 night muhurats, toggled with a small
// Day/Night switch. `weekdayIdx` is JS's Date.getDay() (0 = Sunday).
function ChoghadiyaSection({ panchang, weekdayIdx }) {
    const [mode, setMode] = useState('day');
    const choghadiya = computeChoghadiya(panchang?.sunrise, panchang?.sunset, weekdayIdx);
    if (!choghadiya) return null;

    const toneColors = {
        best: { main: PANCHANG_THEME.bestMain, bg: PANCHANG_THEME.bestBg },
        good: { main: PANCHANG_THEME.auspiciousMain, bg: PANCHANG_THEME.auspiciousBg },
        neutral: { main: PANCHANG_THEME.neutralMain, bg: PANCHANG_THEME.neutralBg },
        bad: { main: PANCHANG_THEME.inauspiciousMain, bg: PANCHANG_THEME.inauspiciousBg }
    };

    const periods = mode === 'day' ? choghadiya.day : choghadiya.night;

    return (
        <Box sx={{ mt: 3 }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" rowGap={1.5} sx={{ mb: 2 }}>
                <SectionHeading icon={TbClockExclamation} subtitle="8 time blocks each for day & night — pick the right moment to start work.">
                    Choghadiya
                </SectionHeading>
                <Stack direction="row" spacing={0.5} sx={{ p: 0.5, borderRadius: 10, bgcolor: PANCHANG_THEME.iconBg, flexShrink: 0 }}>
                    {['day', 'night'].map((m) => (
                        <Button
                            key={m}
                            onClick={() => setMode(m)}
                            size="small"
                            sx={{
                                borderRadius: 10,
                                px: 2,
                                minWidth: 72,
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: 12.5,
                                color: mode === m ? '#FFFFFF' : PANCHANG_THEME.navy,
                                bgcolor: mode === m ? 'var(--pm-accent-solid)' : 'transparent',
                                '&:hover': { bgcolor: mode === m ? 'var(--pm-accent-hover)' : PANCHANG_THEME.panelBorder }
                            }}
                        >
                            {m === 'day' ? 'Day' : 'Night'}
                        </Button>
                    ))}
                </Stack>
            </Stack>

            <Box
                sx={{
                    display: 'grid',
                    gap: 1.25,
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }
                }}
            >
                {periods.map((p, idx) => {
                    const colors = toneColors[p.tone] || toneColors.neutral;
                    return (
                        <Card
                            key={`${mode}-${p.name}-${idx}`}
                            elevation={0}
                            sx={{
                                p: 1.5,
                                borderRadius: 2.5,
                                bgcolor: colors.bg,
                                border: `1px solid color-mix(in srgb, ${colors.main} 14%, transparent)`
                            }}
                        >
                            <Typography variant="caption" sx={{ color: colors.main, fontWeight: 800, display: 'block' }}>
                                {p.name}
                            </Typography>
                            <Typography sx={{ color: PANCHANG_THEME.navy, fontWeight: 700, fontSize: 13, mt: 0.25 }}>
                                {formatTime(p.start)} – {formatTime(p.end)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: PANCHANG_THEME.muted, display: 'block', mt: 0.25, lineHeight: 1.3 }}>
                                {p.meaning}
                            </Typography>
                        </Card>
                    );
                })}
            </Box>
        </Box>
    );
}

// ----------------------------------------------------------------------
// Shubh Muhurat Finder — surfaces "good time windows" for today by
// combining the best Choghadiya blocks (Amrit/Shubh/Labh) with the
// Abhijit Muhurat, and dropping anything that overlaps an inauspicious
// period (Rahu Kaal etc). This is a general-purpose good-time finder,
// not a substitute for personalised Vivah/Griha Pravesh muhurat
// matching (which needs birth-chart data we don't have) — the UI says
// so explicitly.
// ----------------------------------------------------------------------
const MUHURAT_ACTIVITIES = [
    { id: 'general', label: 'General / Any Auspicious Work', icon: TbSparkles },
    { id: 'griha-pravesh', label: 'Griha Pravesh', icon: TbHome },
    { id: 'vivah', label: 'Vivah Related Work', icon: TbHeartHandshake },
    { id: 'vehicle', label: 'Vehicle Purchase', icon: TbCar },
    { id: 'naamkaran', label: 'Naamkaran', icon: TbUserPlus },
    { id: 'business', label: 'New Business / Shop Opening', icon: TbBriefcase },
    { id: 'travel', label: 'Travel / Journey', icon: TbCompass }
];

const MUHURAT_ACTIVITY_TIPS = {
    general: 'Any Amrit, Shubh or Labh Choghadiya, or the Abhijit Muhurat, works well for routine auspicious tasks.',
    'griha-pravesh': 'Morning Choghadiya or the Abhijit Muhurat are traditionally preferred for entering a new home.',
    vivah: 'This shows generally good windows only — wedding dates are usually fixed using detailed Vivah Panchang matching with a priest.',
    vehicle: 'Labh or Amrit Choghadiya are considered favourable for purchase and registration.',
    naamkaran: 'Shubh or Amrit Choghadiya in the morning are commonly chosen for naming ceremonies.',
    business: 'Labh Choghadiya (gain) or Abhijit Muhurat are favoured for inaugurations and shop openings.',
    travel: 'Chal Choghadiya is literally meant for movement/travel, alongside Amrit or Shubh.'
};

function doesOverlap(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd;
}

function getGoodMuhuratWindows(panchang, weekdayIdx) {
    if (!panchang?.sunrise || !panchang?.sunset) return [];
    const choghadiya = computeChoghadiya(panchang.sunrise, panchang.sunset, weekdayIdx);
    if (!choghadiya) return [];

    const inauspicious = (panchang.inauspiciousPeriods || [])
        .filter((p) => p.start && p.end)
        .map((p) => ({ start: new Date(p.start).getTime(), end: new Date(p.end).getTime() }))
        .sort((a, b) => a.start - b.start);

    // Returns the leftover free sub-intervals of [s, e] after cutting out every
    // overlapping inauspicious interval — e.g. a Choghadiya block that's only
    // partly inside Rahu Kaal still keeps its clear portion, instead of the
    // whole block being thrown away for a small overlap.
    const MIN_WINDOW_MS = 10 * 60 * 1000; // ignore slivers under 10 minutes
    const subtractBusy = (s, e) => {
        let free = [{ start: s, end: e }];
        inauspicious.forEach((ip) => {
            const next = [];
            free.forEach((f) => {
                if (!doesOverlap(f.start, f.end, ip.start, ip.end)) {
                    next.push(f);
                    return;
                }
                if (ip.start > f.start) next.push({ start: f.start, end: Math.min(f.end, ip.start) });
                if (ip.end < f.end) next.push({ start: Math.max(f.start, ip.end), end: f.end });
            });
            free = next;
        });
        return free.filter((f) => f.end - f.start >= MIN_WINDOW_MS);
    };

    const windows = [];

    // Abhijit Muhurat is traditionally considered auspicious enough to
    // override most other doshas, so it's always shown — never filtered
    // against inauspicious periods.
    if (panchang.abhijitMuhurat?.start && panchang.abhijitMuhurat?.end) {
        windows.push({
            label: 'Abhijit Muhurat',
            start: panchang.abhijitMuhurat.start,
            end: panchang.abhijitMuhurat.end,
            tone: 'best'
        });
    }

    choghadiya.day
        .filter((p) => p.tone === 'best' || p.tone === 'good')
        .forEach((p) => {
            const s = new Date(p.start).getTime();
            const e = new Date(p.end).getTime();
            subtractBusy(s, e).forEach((f) => {
                windows.push({
                    label: `${p.name} Choghadiya`,
                    start: new Date(f.start).toISOString(),
                    end: new Date(f.end).toISOString(),
                    tone: p.tone
                });
            });
        });

    windows.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    return windows;
}

function MuhuratFinder({ panchang, weekdayIdx }) {
    const [activity, setActivity] = useState('general');
    const windows = getGoodMuhuratWindows(panchang, weekdayIdx);
    if (windows.length === 0) return null;

    const toneColors = {
        best: { main: PANCHANG_THEME.bestMain, bg: PANCHANG_THEME.bestBg },
        good: { main: PANCHANG_THEME.auspiciousMain, bg: PANCHANG_THEME.auspiciousBg }
    };

    return (
        <Box sx={{ mt: 3 }}>
            <SectionHeading icon={TbSun} subtitle="Good time windows for today, based on Choghadiya & Abhijit Muhurat.">
                Shubh Muhurat Finder
            </SectionHeading>
            <Card
                elevation={0}
                sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: `1px solid ${PANCHANG_THEME.panelBorder}`, boxShadow: PANCHANG_THEME.shadow }}
            >
                <Typography variant="caption" sx={{ color: PANCHANG_THEME.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, display: 'block' }}>
                    What is it for?
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
                    {MUHURAT_ACTIVITIES.map(({ id, label, icon: Icon }) => (
                        <Chip
                            key={id}
                            clickable
                            onClick={() => setActivity(id)}
                            icon={<Icon size={14} color={activity === id ? '#FFFFFF' : PANCHANG_THEME.accent} />}
                            label={label}
                            sx={{
                                bgcolor: activity === id ? 'var(--pm-accent-solid)' : PANCHANG_THEME.iconBg,
                                color: activity === id ? '#FFFFFF' : PANCHANG_THEME.navy,
                                fontWeight: 600,
                                '& .MuiChip-icon': { ml: '6px' }
                            }}
                        />
                    ))}
                </Stack>

                <Divider sx={{ borderColor: PANCHANG_THEME.panelBorder, mb: 2 }} />

                <Stack spacing={1.25}>
                    {windows.map((w, idx) => {
                        const colors = toneColors[w.tone] || toneColors.good;
                        return (
                            <Stack
                                key={`${w.label}-${idx}`}
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                                sx={{ p: 1.5, borderRadius: 2.5, bgcolor: colors.bg }}
                            >
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        flexShrink: 0,
                                        borderRadius: '50%',
                                        bgcolor: 'var(--pm-surface)',
                                        color: colors.main,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <TbSun size={18} />
                                </Box>
                                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                    <Typography sx={{ color: PANCHANG_THEME.navy, fontWeight: 700, fontSize: 14 }}>
                                        {w.label}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: colors.main, fontWeight: 700, fontSize: 13 }}>
                                        {formatTime(w.start)} – {formatTime(w.end)}
                                    </Typography>
                                </Box>
                            </Stack>
                        );
                    })}
                </Stack>

                <Typography variant="caption" sx={{ color: PANCHANG_THEME.muted, display: 'block', mt: 2 }}>
                    💡 {MUHURAT_ACTIVITY_TIPS[activity]}
                </Typography>
            </Card>
        </Box>
    );
}

export default function PanchangMuhurat() {
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('New Delhi');
    const [coords, setCoords] = useState(null); // { lat, lng } when using geolocation
    const [selectedDate, setSelectedDate] = useState(() => toDateInputValue());
    const [panchang, setPanchang] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const isToday = selectedDate === toDateInputValue();
    const dateInputRef = useRef(null);

    // ticks every 30s so the Abhijit Muhurat status pill ("Active now" /
    // "Starts in Xm") stays live without a full data refetch
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);
    const muhuratStatus = isToday ? getMuhuratStatus(panchang?.abhijitMuhurat?.start, panchang?.abhijitMuhurat?.end, now) : null;
    const glanceCount =
        6 + (panchang?.moonrise ? 1 : 0) + (panchang?.moonset ? 1 : 0) + (panchang?.ritu ? 1 : 0) +
        (panchang?.dayDuration ? 1 : 0) + (panchang?.moonSign?.name ? 1 : 0);

    // hero banner carousel — auto-advances every few seconds, loops back to
    // the start; purely visual, no data dependency
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
    const [shareFeedback, setShareFeedback] = useState('');

    const handleSharePanchang = async () => {
        const text = buildPanchangShareText(panchang, formatDateLabel(selectedDate));
        if (!text) return;
        try {
            if (typeof navigator !== 'undefined' && navigator.share) {
                await navigator.share({ title: "Today's Panchang — Adhyatmah", text });
                return;
            }
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                setShareFeedback('Copied to clipboard!');
                setTimeout(() => setShareFeedback(''), 2500);
            }
        } catch (err) {
            // user cancelled the native share sheet — nothing to do
        }
    };

    const openDatePicker = () => {
        const el = dateInputRef.current;
        if (!el) return;
        if (typeof el.showPicker === 'function') {
            el.showPicker();
        } else {
            el.click();
        }
    };

    // load city list once
    useEffect(() => {
        getPanchangCities()
            .then((res) => setCities(res?.data || []))
            .catch(() => {
                /* non-critical — city dropdown just stays with the default option */
            });
    }, []);

    const fetchPanchang = useCallback(async ({ lat, lng, city, date } = {}) => {
        setLoading(true);
        setError('');
        try {
            const res = await getPanchang(
                lat !== undefined && lng !== undefined ? { lat, lng, date } : { city, date }
            );
            setPanchang(res?.data || null);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                "Panchang data is temporarily unavailable. Please try again in a moment."
            );
            setPanchang(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // initial load: default city, today's date
    useEffect(() => {
        fetchPanchang({ city: selectedCity, date: selectedDate });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCityChange = (event) => {
        const city = event.target.value;
        setSelectedCity(city);
        setCoords(null);
        fetchPanchang({ city, date: selectedDate });
    };

    const handleUseMyLocation = () => {
        if (typeof window === 'undefined' || !navigator.geolocation) {
            setError('Location access is not available on this device/browser.');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ lat: latitude, lng: longitude });
                setSelectedCity('Your Location');
                fetchPanchang({ lat: latitude, lng: longitude, date: selectedDate });
            },
            () => {
                setError('Could not access your location. Please pick a city instead.');
            }
        );
    };

    const fetchForDate = (date) => {
        if (coords) {
            fetchPanchang({ lat: coords.lat, lng: coords.lng, date });
        } else {
            fetchPanchang({ city: selectedCity, date });
        }
    };

    const handleDateChange = (event) => {
        const date = event.target.value;
        if (!date) return;
        setSelectedDate(date);
        fetchForDate(date);
    };

    const handlePrevDay = () => {
        const date = shiftDateString(selectedDate, -1);
        setSelectedDate(date);
        fetchForDate(date);
    };

    const handleNextDay = () => {
        const date = shiftDateString(selectedDate, 1);
        setSelectedDate(date);
        fetchForDate(date);
    };

    const handleToday = () => {
        const date = toDateInputValue();
        setSelectedDate(date);
        fetchForDate(date);
    };

    return (
        <Box
            sx={{
                pb: { xs: 4, md: 6 },
                '@keyframes panchangPulse': {
                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                    '50%': { opacity: 0.4, transform: 'scale(1.4)' }
                },
                '@keyframes panchangFadeUp': {
                    from: { opacity: 0, transform: 'translateY(10px)' },
                    to: { opacity: 1, transform: 'translateY(0)' }
                }
            }}
        >
            {/* ---------------------------------------------------------------- */}
            {/* HERO BANNER                                                      */}
            {/* ---------------------------------------------------------------- */}
            <Box
                sx={{
                    position: 'relative',
                    // no overflow-hidden here — the floating "Abhijit Muhurat" card
                    // below intentionally overlaps this box's bottom edge and must
                    // not get clipped. The background image + rounded corners are
                    // handled by the absolutely-positioned layer just below instead.
                    borderRadius: 4,
                    border: `1px solid ${PANCHANG_THEME.panelBorder}`,
                    p: { xs: 3, sm: 4, md: 5 },
                    pb: { xs: 3, sm: 4, md: panchang?.abhijitMuhurat?.start ? 7 : 5 },
                    minHeight: { md: 380 },
                    mb: { xs: 3, md: 4 }
                }}
            >
                {/* background layer — clipped to the rounded corners; kept separate
                    from the outer Box so the floating card (outside this layer)
                    can overlap the edge without being cut off.
                    Renders every HERO_BANNERS slide as a real <img> (so a
                    missing/broken file can be detected via onError and is
                    auto-skipped in rotation instead of showing a blank
                    frame) and crossfades between them. */}
                <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 4, zIndex: 0 }}>
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
                                objectPosition: { xs: '70% center', md: 'center' },
                                opacity: i === bannerIndex ? 1 : 0,
                                transition: 'opacity 1.2s ease-in-out'
                            }}
                        />
                    ))}

                    {/* fixed gradient overlay so hero text stays readable over any slide */}
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage:
                                'linear-gradient(90deg, rgba(var(--pm-hero-rgb),0.96) 0%, rgba(var(--pm-hero-rgb),0.86) 32%, rgba(var(--pm-hero-rgb),0.35) 58%, rgba(var(--pm-hero-rgb),0) 76%)'
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
                                        bgcolor: i === bannerIndex ? 'var(--pm-solid-navy)' : 'color-mix(in srgb, var(--pm-navy) 30%, transparent)',
                                        transition: 'width 0.3s ease, background-color 0.3s ease'
                                    }}
                                />
                            ))}
                        </Stack>
                    )}
                </Box>

                <Grid container spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid item xs={12} md={7}>
                        <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap alignItems="center" sx={{ mb: 2 }}>
                            <Chip
                                size="small"
                                icon={<TbSparkles size={14} color={PANCHANG_THEME.accent} />}
                                label="Panchang & Muhurat"
                                sx={{
                                    bgcolor: 'var(--pm-surface)',
                                    border: `1px solid ${PANCHANG_THEME.panelBorder}`,
                                    color: PANCHANG_THEME.accent,
                                    fontWeight: 700
                                }}
                            />
                            <Typography variant="body2" sx={{ color: PANCHANG_THEME.muted, fontStyle: 'italic' }}>
                                Ancient Wisdom, Modern Life.
                            </Typography>
                        </Stack>
                        <Typography
                            variant="h3"
                            sx={{
                                color: PANCHANG_THEME.navy,
                                fontWeight: 800,
                                letterSpacing: -0.5,
                                fontSize: { xs: 28, sm: 34, md: 40 },
                                mb: 1.5
                            }}
                        >
                            Aligned with the Sky, Today.
                        </Typography>
                        <Typography sx={{ color: PANCHANG_THEME.muted, maxWidth: 480, mb: 3 }}>
                            Know your daily Panchang, auspicious timings and planetary positions.
                            Plan your day in harmony with the cosmic energies.
                        </Typography>

                        {/* location controls */}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 2 }}>
                            <Stack direction="row" spacing={1.25} alignItems="center">
                                <Box sx={{ color: PANCHANG_THEME.navy, display: 'flex' }}>
                                    <HiOutlineLocationMarker size={20} />
                                </Box>
                                <Select
                                    size="small"
                                    value={coords ? 'Your Location' : selectedCity}
                                    onChange={handleCityChange}
                                    sx={{
                                        minWidth: 200,
                                        borderRadius: 2.5,
                                        bgcolor: 'var(--pm-surface)',
                                        color: PANCHANG_THEME.navy,
                                        fontWeight: 600,
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: PANCHANG_THEME.panelBorder },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: PANCHANG_THEME.navy }
                                    }}
                                >
                                    {coords && <MenuItem value="Your Location">Your Location</MenuItem>}
                                    {(cities.length
                                        ? cities
                                        : [{ city: 'New Delhi' }, { city: 'Mumbai' }, { city: 'Bengaluru' }]
                                    ).map((c) => (
                                        <MenuItem key={c.city} value={c.city}>
                                            {c.city}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Stack>

                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<HiOutlineLocationMarker />}
                                onClick={handleUseMyLocation}
                                sx={{
                                    borderRadius: 10,
                                    px: 2,
                                    bgcolor: 'var(--pm-surface)',
                                    color: PANCHANG_THEME.navy,
                                    borderColor: PANCHANG_THEME.panelBorder,
                                    fontWeight: 600,
                                    '&:hover': { borderColor: PANCHANG_THEME.navy, bgcolor: PANCHANG_THEME.iconBg }
                                }}
                            >
                                Use My Location
                            </Button>
                        </Stack>
                        <Typography variant="caption" sx={{ color: PANCHANG_THEME.muted, display: 'block', mb: 1.5 }}>
                            Panchang calculated for your location
                        </Typography>

                        {/* date navigator */}
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{
                                p: 1,
                                borderRadius: 10,
                                bgcolor: 'var(--pm-surface)',
                                border: `1px solid ${PANCHANG_THEME.panelBorder}`,
                                boxShadow: PANCHANG_THEME.shadow,
                                maxWidth: 460
                            }}
                        >
                            <Button
                                onClick={handlePrevDay}
                                sx={{ minWidth: 36, width: 36, height: 36, borderRadius: '50%', color: PANCHANG_THEME.navy, p: 0 }}
                                aria-label="Previous day"
                            >
                                <TbChevronLeft size={20} />
                            </Button>

                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                justifyContent="center"
                                onClick={openDatePicker}
                                sx={{ flexGrow: 1, cursor: 'pointer', position: 'relative' }}
                            >
                                <Box sx={{ color: PANCHANG_THEME.auspiciousMain, display: 'flex' }}>
                                    <TbCalendar size={18} />
                                </Box>
                                <Typography sx={{ color: PANCHANG_THEME.navy, fontWeight: 700, minWidth: { xs: 'auto', sm: 170 }, textAlign: 'center' }}>
                                    {formatDateLabel(selectedDate)}
                                </Typography>
                                <Box
                                    component="input"
                                    ref={dateInputRef}
                                    type="date"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    aria-label="Pick a date"
                                    sx={{ position: 'absolute', width: 1, height: 1, opacity: 0, border: 'none', pointerEvents: 'none' }}
                                />
                            </Stack>

                            <Button
                                onClick={handleNextDay}
                                sx={{ minWidth: 36, width: 36, height: 36, borderRadius: '50%', color: PANCHANG_THEME.navy, p: 0 }}
                                aria-label="Next day"
                            >
                                <TbChevronRight size={20} />
                            </Button>

                            {!isToday && (
                                <Button
                                    onClick={handleToday}
                                    size="small"
                                    startIcon={<TbCalendar size={14} />}
                                    aria-label="Jump back to today's date"
                                    sx={{
                                        borderRadius: 10,
                                        ml: 0.5,
                                        px: 1.5,
                                        color: PANCHANG_THEME.navy,
                                        bgcolor: 'transparent',
                                        border: `1px dashed ${PANCHANG_THEME.navy}`,
                                        fontWeight: 600,
                                        fontSize: 12,
                                        textTransform: 'none',
                                        whiteSpace: 'nowrap',
                                        '&:hover': { bgcolor: PANCHANG_THEME.iconBg }
                                    }}
                                >
                                    Go to Today
                                </Button>
                            )}
                        </Stack>
                    </Grid>

                    {/* right column intentionally left empty — the banner photo
                        (moon, om, orbit icons, meditating figure) shows through
                        here; see backgroundImage on the hero Box above */}
                    <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }} />
                </Grid>

                {/* floating "most auspicious time" card — overlaps the bottom-right
                    corner of the hero on desktop, stacks under it on mobile */}
                {panchang?.abhijitMuhurat?.start && panchang?.abhijitMuhurat?.end && (
                    <Card
                        elevation={0}
                        sx={{
                            mt: { xs: 3, md: 0 },
                            position: { xs: 'static', md: 'absolute' },
                            right: { md: 28 },
                            bottom: { md: -26 },
                            zIndex: 2,
                            width: { xs: '100%', md: 260 },
                            p: 2.25,
                            borderRadius: 3,
                            border: `1px solid ${PANCHANG_THEME.panelBorder}`,
                            boxShadow: PANCHANG_THEME.shadowLg,
                            bgcolor: 'var(--pm-surface)'
                        }}
                    >
                        <Chip
                            size="small"
                            icon={<TbCalendar size={14} color={PANCHANG_THEME.auspiciousMain} />}
                            label="Next Auspicious Time"
                            sx={{
                                mb: 1,
                                bgcolor: PANCHANG_THEME.auspiciousBg,
                                color: PANCHANG_THEME.auspiciousMain,
                                fontWeight: 700,
                                fontSize: 11
                            }}
                        />
                        <Typography sx={{ color: PANCHANG_THEME.navy, fontWeight: 700, fontSize: 15 }}>
                            Abhijit Muhurat
                        </Typography>
                        <Typography sx={{ color: PANCHANG_THEME.accent, fontWeight: 800, fontSize: 20, mt: 0.25, mb: 1 }}>
                            {formatTime(panchang.abhijitMuhurat.start)} – {formatTime(panchang.abhijitMuhurat.end)}
                        </Typography>
                        <MuhuratStatusPill status={muhuratStatus} />
                        <Typography variant="caption" sx={{ color: PANCHANG_THEME.muted, display: 'block', mt: 1 }}>
                            Ideal for new ventures, important decisions and religious activities.
                        </Typography>
                    </Card>
                )}
            </Box>

            {error && (
                <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* CONTENT                                                          */}
            {/* ---------------------------------------------------------------- */}
            {loading ? (
                <Grid container spacing={2}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Grid item xs={6} sm={3} md={1.5} key={i}>
                            <Skeleton variant="rounded" height={110} sx={{ borderRadius: 3 }} />
                        </Grid>
                    ))}
                </Grid>
            ) : panchang ? (
                <>
                    {/* -------------------------------------------------------- */}
                    {/* Today's Panchang — compact 8-up glance row               */}
                    {/* -------------------------------------------------------- */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" rowGap={1} sx={{ mb: 2 }}>
                        <SectionHeading icon={TbFlower}>Today&apos;s Panchang</SectionHeading>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: PANCHANG_THEME.muted, whiteSpace: 'nowrap' }}>
                                <TbCalendar size={15} />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {formatDateLabel(selectedDate)}
                                </Typography>
                            </Stack>
                            <Button
                                onClick={handleSharePanchang}
                                size="small"
                                startIcon={<TbShare2 size={15} />}
                                sx={{
                                    borderRadius: 10,
                                    px: 1.5,
                                    color: PANCHANG_THEME.navy,
                                    bgcolor: PANCHANG_THEME.iconBg,
                                    fontWeight: 600,
                                    fontSize: 12.5,
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: PANCHANG_THEME.panelBorder }
                                }}
                            >
                                {shareFeedback || 'Share'}
                            </Button>
                        </Stack>
                    </Stack>

                    <Box
                        sx={{
                            display: 'grid',
                            gap: 2.5,
                            gridTemplateColumns: '1fr'
                        }}
                    >
                        <Box
                            sx={{
                                display: 'grid',
                                gap: 1.5,
                                gridTemplateColumns: {
                                    xs: 'repeat(2, 1fr)',
                                    sm: 'repeat(3, 1fr)',
                                    md: `repeat(${pickColumns(glanceCount, [4, 3, 5])}, 1fr)`
                                },
                                '& > *': { animation: 'panchangFadeUp 0.45s ease both' },
                                '& > *:nth-of-type(1)': { animationDelay: '0.02s' },
                                '& > *:nth-of-type(2)': { animationDelay: '0.05s' },
                                '& > *:nth-of-type(3)': { animationDelay: '0.08s' },
                                '& > *:nth-of-type(4)': { animationDelay: '0.11s' },
                                '& > *:nth-of-type(5)': { animationDelay: '0.14s' },
                                '& > *:nth-of-type(6)': { animationDelay: '0.17s' },
                                '& > *:nth-of-type(7)': { animationDelay: '0.20s' },
                                '& > *:nth-of-type(8)': { animationDelay: '0.23s' },
                                '& > *:nth-of-type(9)': { animationDelay: '0.26s' },
                                '& > *:nth-of-type(10)': { animationDelay: '0.29s' },
                                '& > *:nth-of-type(11)': { animationDelay: '0.32s' }
                            }}
                        >
                            <GlanceCard
                                icon={GiMoonOrbit}
                                label="Tithi"
                                value={panchang.tithi?.name}
                                sub={[panchang.tithi?.paksha, formatUpto(panchang.tithi?.endTime)].filter(Boolean).join(' · ')}
                            />
                            <GlanceCard
                                icon={TbSparkles}
                                label="Nakshatra"
                                value={panchang.nakshatra?.name}
                                sub={formatUpto(panchang.nakshatra?.endTime)}
                            />
                            <GlanceCard
                                icon={GiSunrise}
                                label="Yoga"
                                value={panchang.yoga?.name}
                                sub={formatUpto(panchang.yoga?.endTime)}
                            />
                            <GlanceCard
                                icon={TbClockExclamation}
                                label="Karana"
                                value={panchang.karana?.name}
                                sub={formatUpto(panchang.karana?.endTime)}
                            />
                            <GlanceCard icon={WiSunrise} label="Sunrise" value={formatTime(panchang.sunrise)} />
                            <GlanceCard icon={WiSunset} label="Sunset" value={formatTime(panchang.sunset)} />
                            {panchang.moonrise && <GlanceCard icon={WiMoonrise} label="Moonrise" value={formatTime(panchang.moonrise)} />}
                            {panchang.moonset && <GlanceCard icon={WiMoonset} label="Moonset" value={formatTime(panchang.moonset)} />}
                            {panchang.ritu && <GlanceCard icon={GiSunrise} label="Ritu" value={panchang.ritu} />}
                            {panchang.dayDuration && <GlanceCard icon={TbClockExclamation} label="Day Duration" value={panchang.dayDuration} />}
                            {panchang.moonSign?.name && (
                                <GlanceCard
                                    icon={WiMoonrise}
                                    label="Moon Sign"
                                    value={panchang.moonSign.name}
                                    sub={formatUpto(panchang.moonSign.endTime)}
                                />
                            )}
                        </Box>
                    </Box>

                    {/* -------------------------------------------------------- */}
                    {/* Inauspicious Timings                                     */}
                    {/* -------------------------------------------------------- */}
                    {panchang.inauspiciousPeriods?.length > 0 && (
                        <Box
                            sx={{
                                display: 'grid',
                                gap: 2.5,
                                mt: 3,
                                gridTemplateColumns: '1fr'
                            }}
                        >
                            {panchang.inauspiciousPeriods?.length > 0 && (
                                <Box>
                                    <Card
                                        elevation={0}
                                        sx={{
                                            p: { xs: 2.5, md: 3 },
                                            height: '100%',
                                            borderRadius: 3,
                                            border: `1px solid ${PANCHANG_THEME.panelBorder}`,
                                            boxShadow: PANCHANG_THEME.shadow
                                        }}
                                    >
                                        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2.25 }}>
                                            <Box
                                                sx={{
                                                    width: 34,
                                                    height: 34,
                                                    flexShrink: 0,
                                                    borderRadius: 2,
                                                    bgcolor: PANCHANG_THEME.iconBg,
                                                    color: PANCHANG_THEME.accent,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <TbClockExclamation size={17} />
                                            </Box>
                                            <Box>
                                                <Typography sx={{ color: PANCHANG_THEME.navy, fontWeight: 700, fontSize: 17 }}>
                                                    Inauspicious Timings
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: PANCHANG_THEME.muted, mt: 0.1 }}>
                                                    Avoid these time periods for important work and new beginnings.
                                                </Typography>
                                            </Box>
                                        </Stack>
                                        <Box
                                            sx={{
                                                display: 'grid',
                                                gap: 1.25,
                                                gridTemplateColumns: {
                                                    xs: 'repeat(2, 1fr)',
                                                    sm: 'repeat(3, 1fr)',
                                                    md: `repeat(${pickColumns(panchang.inauspiciousPeriods.length, [3, 4, 2])}, 1fr)`
                                                }
                                            }}
                                        >
                                            {panchang.inauspiciousPeriods.map((p, idx) => (
                                                <Box
                                                    key={`${p.name}-${idx}`}
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 2.5,
                                                        bgcolor: PANCHANG_THEME.inauspiciousBg,
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: 1
                                                    }}
                                                >
                                                    <Box sx={{ color: PANCHANG_THEME.inauspiciousMain, display: 'flex', mt: '2px' }}>
                                                        <TbClockExclamation size={16} />
                                                    </Box>
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography variant="caption" sx={{ color: PANCHANG_THEME.inauspiciousMain, fontWeight: 700, display: 'block' }}>
                                                            {p.name}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: PANCHANG_THEME.navySoft, fontWeight: 600, fontSize: 12.5 }}>
                                                            {p.start && p.end ? `${formatTime(p.start)} – ${formatTime(p.end)}` : '—'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Card>
                                </Box>
                            )}
                        </Box>
                    )}

                    <DailyTimeline panchang={panchang} now={now} isToday={isToday} />

                    <ChoghadiyaSection panchang={panchang} weekdayIdx={new Date(`${selectedDate}T00:00:00`).getDay()} />

                    <MuhuratFinder panchang={panchang} weekdayIdx={new Date(`${selectedDate}T00:00:00`).getDay()} />

                    {/* -------------------------------------------------------- */}
                    {/* Today's Cosmic Guidance — static, design only            */}
                    {/* -------------------------------------------------------- */}
                    <Box sx={{ mt: 3 }}>
                        <SectionHeading icon={TbMoonStars} subtitle="Let the stars guide your journey">
                            Today&apos;s Cosmic Guidance
                        </SectionHeading>
                        <Box
                            sx={{
                                display: 'grid',
                                gap: 2,
                                gridTemplateColumns: { xs: '1fr', sm: '1.3fr 1fr 1fr 1fr' }
                            }}
                        >
                            <Card
                                elevation={0}
                                sx={{
                                    p: 2.5,
                                    borderRadius: 3,
                                    border: `1px solid ${PANCHANG_THEME.panelBorder}`,
                                    boxShadow: PANCHANG_THEME.shadow,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        flexShrink: 0,
                                        borderRadius: '50%',
                                        bgcolor: PANCHANG_THEME.iconBg,
                                        color: PANCHANG_THEME.accent,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <WiMoonrise size={26} />
                                </Box>
                                <Box>
                                    <Typography sx={{ color: PANCHANG_THEME.navy, fontWeight: 700, fontSize: 15 }}>
                                        Moon in {panchang.moonSign?.name || panchang.moon?.rashi || '—'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: PANCHANG_THEME.muted, mt: 0.25 }}>
                                        Encourages balance, harmony and thoughtful decisions today.
                                    </Typography>
                                </Box>
                            </Card>

                            {[
                                { icon: TbBriefcase, label: 'Career', text: 'Good for planning & discussions', color: PANCHANG_THEME.accent },
                                { icon: TbHeartHandshake, label: 'Relationships', text: 'Focus on harmony and understanding', color: PANCHANG_THEME.inauspiciousMain },
                                { icon: TbFlower, label: 'Spiritual', text: 'Ideal for meditation & worship', color: PANCHANG_THEME.bestMain }
                            ].map(({ icon: Icon, label, text, color }) => (
                                <Card
                                    key={label}
                                    elevation={0}
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 3,
                                        border: `1px solid ${PANCHANG_THEME.panelBorder}`,
                                        boxShadow: PANCHANG_THEME.shadow
                                    }}
                                >
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                                        <Box sx={{ color, display: 'flex' }}>
                                            <Icon size={18} />
                                        </Box>
                                        <Typography sx={{ color: PANCHANG_THEME.navy, fontWeight: 700, fontSize: 14 }}>
                                            {label}
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body2" sx={{ color: PANCHANG_THEME.muted }}>
                                        {text}
                                    </Typography>
                                </Card>
                            ))}
                        </Box>
                    </Box>

                    {/* -------------------------------------------------------- */}
                    {/* Disha Shoola  +  Chandrabalam & Tarabalam                 */}
                    {/* -------------------------------------------------------- */}
                    {(panchang.dishaShoola || panchang.taraBala?.length > 0 || panchang.chandraBala?.length > 0) && (
                        <Box sx={{ mt: 3 }}>
                            <SectionHeading icon={TbCompass} subtitle="Favourable directions, nakshatras and moon signs for today">
                                Disha Shoola &amp; Balam
                            </SectionHeading>
                            <Grid container spacing={2}>
                                {panchang.dishaShoola && (
                                    <Grid item xs={12} md={panchang.taraBala?.length || panchang.chandraBala?.length ? 4 : 12}>
                                        <Card
                                            elevation={0}
                                            sx={{
                                                p: 2.5,
                                                height: '100%',
                                                borderRadius: 3,
                                                border: `1px solid ${PANCHANG_THEME.inauspiciousBg}`,
                                                bgcolor: PANCHANG_THEME.inauspiciousBg,
                                                boxShadow: PANCHANG_THEME.shadow
                                            }}
                                        >
                                            <Typography variant="caption" sx={{ color: PANCHANG_THEME.inauspiciousMain, fontWeight: 700 }}>
                                                Disha Shoola — Avoid Travelling Towards
                                            </Typography>
                                            <Typography sx={{ color: PANCHANG_THEME.navy, fontWeight: 800, fontSize: 20, mt: 0.5 }}>
                                                {panchang.dishaShoola}
                                            </Typography>
                                        </Card>
                                    </Grid>
                                )}
                                {(panchang.taraBala?.length > 0 || panchang.chandraBala?.length > 0) && (
                                    <Grid item xs={12} md={panchang.dishaShoola ? 8 : 12}>
                                        <Card
                                            elevation={0}
                                            sx={{
                                                p: 2.5,
                                                height: '100%',
                                                borderRadius: 3,
                                                border: `1px solid ${PANCHANG_THEME.panelBorder}`,
                                                boxShadow: PANCHANG_THEME.shadow
                                            }}
                                        >
                                            <Stack spacing={2}>
                                                {panchang.taraBala?.length > 0 && (
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: PANCHANG_THEME.muted, fontWeight: 700 }}>
                                                            Tara Bala — Favourable Nakshatras
                                                        </Typography>
                                                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
                                                            {panchang.taraBala.map((n) => (
                                                                <Chip
                                                                    key={n}
                                                                    size="small"
                                                                    label={n}
                                                                    sx={{ bgcolor: PANCHANG_THEME.iconBg, color: PANCHANG_THEME.navy, fontWeight: 600 }}
                                                                />
                                                            ))}
                                                        </Stack>
                                                    </Box>
                                                )}
                                                {panchang.chandraBala?.length > 0 && (
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: PANCHANG_THEME.muted, fontWeight: 700 }}>
                                                            Chandra Bala — Favourable Moon Signs
                                                        </Typography>
                                                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
                                                            {panchang.chandraBala.map((n) => (
                                                                <Chip
                                                                    key={n}
                                                                    size="small"
                                                                    label={n}
                                                                    sx={{ bgcolor: PANCHANG_THEME.auspiciousBg, color: PANCHANG_THEME.auspiciousMain, fontWeight: 600 }}
                                                                />
                                                            ))}
                                                        </Stack>
                                                    </Box>
                                                )}
                                            </Stack>
                                        </Card>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}

                    {/* -------------------------------------------------------- */}
                    {/* Planetary Positions  +  Today's Festivals & Events       */}
                    {/* -------------------------------------------------------- */}
                    {(panchang.planetaryPositions?.length > 0 || panchang.festivals?.length > 0) && (
                        <Box
                            sx={{
                                display: 'grid',
                                gap: 2.5,
                                mt: 3,
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    md: panchang.planetaryPositions?.length > 0 ? '7fr 5fr' : '1fr'
                                }
                            }}
                        >
                            {panchang.planetaryPositions?.length > 0 && (
                                <Box>
                                    <SectionHeading
                                        icon={GiMoonOrbit}
                                        subtitle="Current planetary positions for today, calculated for your city."
                                        action={
                                            <Button
                                                size="small"
                                                endIcon={<TbArrowRight size={14} />}
                                                sx={{
                                                    borderRadius: 10,
                                                    color: PANCHANG_THEME.accent,
                                                    fontWeight: 700,
                                                    fontSize: 12.5,
                                                    textTransform: 'none',
                                                    flexShrink: 0,
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                View Full Details
                                            </Button>
                                        }
                                    >
                                        Planetary Positions
                                    </SectionHeading>
                                    <TableContainer
                                        component={Paper}
                                        elevation={0}
                                        sx={{ borderRadius: 3, border: `1px solid ${PANCHANG_THEME.panelBorder}`, boxShadow: PANCHANG_THEME.shadow }}
                                    >
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: PANCHANG_THEME.iconBg }}>
                                                    <TableCell sx={{ color: PANCHANG_THEME.navy, fontWeight: 700 }}>Planet</TableCell>
                                                    <TableCell sx={{ color: PANCHANG_THEME.navy, fontWeight: 700 }}>Rashi</TableCell>
                                                    <TableCell sx={{ color: PANCHANG_THEME.navy, fontWeight: 700 }}>Longitude</TableCell>
                                                    <TableCell sx={{ color: PANCHANG_THEME.navy, fontWeight: 700 }}>Nakshatra</TableCell>
                                                    <TableCell sx={{ color: PANCHANG_THEME.navy, fontWeight: 700 }}>Pada</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {panchang.planetaryPositions.map((p, idx) => (
                                                    <TableRow
                                                        key={`${p.planet}-${idx}`}
                                                        sx={{ '&:nth-of-type(even)': { bgcolor: 'var(--pm-surface-alt)' }, '&:last-child td': { borderBottom: 0 } }}
                                                    >
                                                        <TableCell>
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Box
                                                                    sx={{
                                                                        width: 24,
                                                                        height: 24,
                                                                        borderRadius: '50%',
                                                                        bgcolor: PANCHANG_THEME.iconBg,
                                                                        color: PANCHANG_THEME.accent,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontSize: 11,
                                                                        fontWeight: 800,
                                                                        flexShrink: 0
                                                                    }}
                                                                >
                                                                    {p.planet ? p.planet.charAt(0) : '—'}
                                                                </Box>
                                                                <Typography sx={{ fontWeight: 600, color: PANCHANG_THEME.navySoft, fontSize: 13.5 }}>
                                                                    {p.planet || '—'}
                                                                </Typography>
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell>{p.rashi || '—'}</TableCell>
                                                        <TableCell>{p.longitude || '—'}</TableCell>
                                                        <TableCell>{p.nakshatra || '—'}</TableCell>
                                                        <TableCell>{p.pada ?? '—'}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                                {panchang.festivals?.length > 0 && (
                                    <Box>
                                        <SectionHeading icon={TbCalendarEvent} subtitle="Observances and celebrations for today.">
                                            Today&apos;s Festivals &amp; Events
                                        </SectionHeading>
                                        <Card
                                            elevation={0}
                                            sx={{
                                                p: { xs: 1.5, md: 2 },
                                                borderRadius: 3,
                                                border: `1px solid ${PANCHANG_THEME.panelBorder}`,
                                                boxShadow: PANCHANG_THEME.shadow
                                            }}
                                        >
                                            <Stack divider={<Divider sx={{ borderColor: PANCHANG_THEME.panelBorder }} />}>
                                                {panchang.festivals.map((f, idx) => (
                                                    <Stack key={f} direction="row" spacing={1.5} alignItems="center" sx={{ py: 1.25, px: 0.5 }}>
                                                        <Box
                                                            sx={{
                                                                width: 40,
                                                                height: 40,
                                                                flexShrink: 0,
                                                                borderRadius: 2,
                                                                bgcolor: PANCHANG_THEME.auspiciousBg,
                                                                color: PANCHANG_THEME.auspiciousMain,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            <TbCalendarEvent size={20} />
                                                        </Box>
                                                        <Box sx={{ minWidth: 0 }}>
                                                            <Typography sx={{ color: PANCHANG_THEME.navy, fontWeight: 700, fontSize: 14.5 }}>
                                                                {f}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: PANCHANG_THEME.muted }}>
                                                                Today · {formatDateLabel(selectedDate)}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                ))}
                                            </Stack>
                                        </Card>
                                    </Box>
                                )}
                                <ShlokaOfTheDay dateStr={selectedDate} />
                            </Box>
                        </Box>
                    )}

                    {/* -------------------------------------------------------- */}
                    {/* Tools for Your Spiritual Journey — static, design only   */}
                    {/* -------------------------------------------------------- */}
                    <Box sx={{ mt: 4 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" rowGap={1} sx={{ mb: 2 }}>
                            <SectionHeading icon={TbSparkles} subtitle="Powerful tools to guide your path and bring balance to your life.">
                                Tools for Your Spiritual Journey
                            </SectionHeading>
                            <Button
                                size="small"
                                endIcon={<TbArrowRight size={14} />}
                                sx={{ color: PANCHANG_THEME.accent, fontWeight: 700, fontSize: 12.5, textTransform: 'none', whiteSpace: 'nowrap' }}
                            >
                                Explore all tools
                            </Button>
                        </Stack>
                        <Box
                            sx={{
                                display: 'grid',
                                gap: 1.5,
                                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' }
                            }}
                        >
                            {[
                                { icon: TbSun, label: 'Muhurat Finder', sub: 'Get the best time for your work' },
                                { icon: TbHeartHandshake, label: 'Kundli Matching', sub: 'Check compatibility with your partner' },
                                { icon: TbGift, label: 'Puja Booking', sub: 'Book verified pandits for your puja' },
                                { icon: TbWand, label: 'Remedies', sub: 'Find solutions for your problems' },
                                { icon: TbCalendarEvent, label: 'Vrat & Festivals', sub: 'Know upcoming fasts & festivals' },
                                { icon: TbChartBar, label: 'Daily Insights', sub: 'Personalized guidance for your day' }
                            ].map(({ icon: Icon, label, sub }) => (
                                <Card
                                    key={label}
                                    elevation={0}
                                    sx={{
                                        p: 2.25,
                                        borderRadius: 3,
                                        border: `1px solid ${PANCHANG_THEME.panelBorder}`,
                                        boxShadow: PANCHANG_THEME.shadow,
                                        textAlign: 'center',
                                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                        '&:hover': { transform: 'translateY(-2px)', boxShadow: PANCHANG_THEME.shadowLg }
                                    }}
                                >
                                    <Stack alignItems="center" spacing={1}>
                                        <Box
                                            sx={{
                                                width: 38,
                                                height: 38,
                                                borderRadius: '50%',
                                                bgcolor: PANCHANG_THEME.iconBg,
                                                color: PANCHANG_THEME.accent,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Icon size={18} />
                                        </Box>
                                        <Typography sx={{ color: PANCHANG_THEME.navy, fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>
                                            {label}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: PANCHANG_THEME.muted, lineHeight: 1.3 }}>
                                            {sub}
                                        </Typography>
                                    </Stack>
                                </Card>
                            ))}
                        </Box>
                    </Box>

                    {/* -------------------------------------------------------- */}
                    {/* Newsletter — static UI, design only                      */}
                    {/* -------------------------------------------------------- */}
                    <Grid
                        container
                        spacing={2}
                        alignItems="center"
                        sx={{
                            mt: 4,
                            p: { xs: 2.5, md: 3 },
                            borderRadius: 4,
                            border: `1px solid ${PANCHANG_THEME.panelBorder}`,
                            backgroundImage: 'linear-gradient(var(--pm-img-tint), var(--pm-img-tint)), url(/images/newsletter-bg.png)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <Grid item xs={12} md={5} sx={{ position: 'relative', zIndex: 1 }}>
                            <Typography sx={{ color: PANCHANG_THEME.navy, fontWeight: 700, fontSize: { xs: 16, md: 18 }, mb: 0.5 }}>
                                Stay Updated with Cosmic Insights
                            </Typography>
                            <Typography variant="body2" sx={{ color: PANCHANG_THEME.muted }}>
                                Subscribe and never miss important updates, festivals and exclusive offers.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ position: 'relative', zIndex: 1 }}>
                            <Stack direction="row" spacing={1}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="Enter your email address"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <TbMail size={16} color={PANCHANG_THEME.muted} />
                                            </InputAdornment>
                                        ),
                                        sx: { bgcolor: 'var(--pm-surface)', borderRadius: 2.5 }
                                    }}
                                    sx={{ minWidth: 0, flex: 1 }}
                                />
                                <Button
                                    variant="contained"
                                    endIcon={<TbArrowRight size={16} />}
                                    sx={{
                                        borderRadius: 2.5,
                                        px: 2.5,
                                        bgcolor: 'var(--pm-solid-navy)',
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                        boxShadow: 'none',
                                        '&:hover': { bgcolor: 'var(--pm-solid-hover)', boxShadow: 'none' }
                                    }}
                                >
                                    Subscribe Now
                                </Button>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={3} sx={{ position: 'relative', zIndex: 1 }}>
                            <Stack spacing={0.75}>
                                {['Weekly Horoscope', 'Festival Alerts', 'Special Offers'].map((item) => (
                                    <Stack key={item} direction="row" spacing={1} alignItems="center">
                                        <Box sx={{ color: PANCHANG_THEME.accent, display: 'flex' }}>
                                            <TbCircleCheck size={16} />
                                        </Box>
                                        <Typography variant="body2" sx={{ color: PANCHANG_THEME.navySoft }}>
                                            {item}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Grid>
                    </Grid>
                </>
            ) : (
                !error && (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        No Panchang data found for this location right now.
                    </Alert>
                )
            )}
        </Box>
    );
}