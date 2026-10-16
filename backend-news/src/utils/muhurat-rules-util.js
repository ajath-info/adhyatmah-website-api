/**
 * Muhurat Rule Engine
 * ===================
 * Turns the already-fetched Panchang data (tithi, nakshatra, weekday,
 * sunrise/sunset, Rahu Kalam, other inauspicious periods) into REAL
 * per-occasion Muhurat rows — replacing the old frontend logic that just
 * split the daylight window into 11 equal, meaningless slots.
 *
 * No extra API calls. Two classical, widely-published Vedic techniques
 * are combined:
 *
 *  1. CHOGHADIYA — divides daylight (and night) into 8 named periods per
 *     day, in a fixed sequence that depends only on the weekday. Each
 *     period has a known quality (Amrit/Shubh/Labh = auspicious,
 *     Chal = neutral, Udveg/Rog/Kaal = inauspicious). This gives the
 *     INTRA-DAY time windows.
 *
 *  2. TITHI / NAKSHATRA / WEEKDAY SUITABILITY — each occasion (Griha
 *     Pravesh, Vivah, Vehicle Purchase, etc.) has a traditional list of
 *     favourable/unfavourable tithis, nakshatras and weekdays. This gives
 *     the DAY-LEVEL score/label (Highly Auspicious / Auspicious /
 *     Moderate / Avoid).
 *
 * NOTE: These are commonly published general-purpose rules (the same
 * kind printed in any Panchang book), not a substitute for personalised
 * matching against someone's birth chart (Kundali) — keep that
 * expectation in the UI copy. Rule tables are intentionally kept in one
 * place (OCCASION_RULES below) so they're easy to tune later.
 */

// ---------------------------------------------------------------------
// Tithi helpers
// ---------------------------------------------------------------------

// The 15 tithi names shared by both Paksha (only the 15th differs: Purnima
// in Shukla, Amavasya in Krishna). Index 0 = Pratipada ... 14 = Purnima/Amavasya.
const TITHI_NAMES = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
];

// Rikta (4th, 9th, 14th) tithis are avoided for ANY new/auspicious
// beginning across almost all classical Muhurta texts.
const RIKTA_TITHI_INDEXES = [3, 8, 13]; // Chaturthi, Navami, Chaturdashi

/**
 * Returns a 1-based tithi number (1-15) from a Prokerala tithi name like
 * "Shukla Paksha, Ekadashi" or just "Ekadashi". Returns null if it can't
 * be matched (keeps the caller's scoring neutral instead of guessing).
 */
function getTithiNumber(tithiName) {
    if (!tithiName) return null;
    const name = tithiName.toLowerCase();
    if (name.includes("amavasya")) return 15;
    if (name.includes("purnima")) return 15;
    for (let i = 0; i < TITHI_NAMES.length - 1; i++) {
        if (name.includes(TITHI_NAMES[i].toLowerCase())) return i + 1;
    }
    return null;
}

function isAmavasya(tithiName) {
    return !!tithiName && tithiName.toLowerCase().includes("amavasya");
}

// ---------------------------------------------------------------------
// Pitru Paksha — the ~16-day dark-fortnight period (Krishna Paksha) before
// Sarvapitri Amavasya, universally treated as inauspicious for starting
// ANY new/auspicious work (Griha Pravesh, Vivah, Vehicle/Property
// purchase, Business, Namkaran, Annaprashan, Vidyarambh) regardless of
// how good the day's individual Tithi/Nakshatra look — this is exactly
// why DrikPanchang shows "No Auspicious Muhurat" for these dates instead
// of a scored row. Detected from REAL data already fetched every time
// (Paksha + Purnimanta/Amanta month name), never a fixed date range, so
// it lands correctly every year without any hardcoding:
//   - North Indian (Purnimanta) naming: Krishna Paksha of Ashwin
//   - South Indian (Amanta) naming, same fortnight: Krishna Paksha of Bhadrapada
function isPitruPaksha(panchang) {
    const paksha = (panchang?.tithi?.paksha || "").toLowerCase();
    if (!paksha.includes("krishna")) return false;
    const purnimanta = (panchang?.monthPurnimanta || "").toLowerCase();
    const amanta = (panchang?.monthAmanta || "").toLowerCase();
    return (
        purnimanta.includes("ashwin") ||
        purnimanta.includes("ashvin") ||
        amanta.includes("bhadrapada") ||
        amanta.includes("bhadra")
    );
}

// ---------------------------------------------------------------------
// Choghadiya — 8 named daylight periods, sequence fixed by weekday.
// Standard published order (same one every Panchang app/book uses).
// ---------------------------------------------------------------------

const CHOGHADIYA_QUALITY = {
    Amrit: "auspicious",
    Shubh: "auspicious",
    Labh: "auspicious",
    Chal: "moderate",
    Udveg: "inauspicious",
    Rog: "inauspicious",
    Kaal: "inauspicious",
};

// Meaning shown to the user for the "details" column
const CHOGHADIYA_MEANING = {
    Amrit: "Best — highly favourable for any important work.",
    Shubh: "Good — favourable for auspicious work.",
    Labh: "Favourable, especially for gain/profit-related work.",
    Chal: "Neutral — acceptable, better for travel than for new beginnings.",
    Udveg: "Inauspicious — avoid starting new work.",
    Rog: "Inauspicious — avoid, associated with obstacles.",
    Kaal: "Inauspicious — avoid, considered a loss period.",
};

const DAY_CHOGHADIYA_SEQUENCE = {
    Sunday: ["Udveg", "Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg"],
    Monday: ["Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Chal", "Labh", "Amrit"],
    Tuesday: ["Rog", "Udveg", "Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog"],
    Wednesday: ["Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Chal", "Labh"],
    Thursday: ["Shubh", "Rog", "Udveg", "Chal", "Labh", "Amrit", "Kaal", "Shubh"],
    Friday: ["Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Chal"],
    Saturday: ["Kaal", "Shubh", "Rog", "Udveg", "Chal", "Labh", "Amrit", "Kaal"],
};

function addMinutes(date, mins) {
    return new Date(date.getTime() + mins * 60000);
}

/**
 * Builds the 8 daytime Choghadiya slots for the given sunrise/sunset and
 * weekday name (e.g. "Thursday" — matches Panchang.weekday / Prokerala's
 * `vaara`). Falls back to deriving the weekday from `sunrise` if the name
 * isn't recognised.
 */
function buildDayChoghadiya(sunriseISO, sunsetISO, weekdayName) {
    if (!sunriseISO || !sunsetISO) return [];
    const sunrise = new Date(sunriseISO);
    const sunset = new Date(sunsetISO);
    const daylightMins = (sunset.getTime() - sunrise.getTime()) / 60000;
    if (!(daylightMins > 0)) return [];

    const weekday = DAY_CHOGHADIYA_SEQUENCE[weekdayName]
        ? weekdayName
        : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][sunrise.getDay()];

    const sequence = DAY_CHOGHADIYA_SEQUENCE[weekday];
    const slotMins = daylightMins / 8;

    return sequence.map((name, i) => ({
        name,
        tone: CHOGHADIYA_QUALITY[name],
        start: addMinutes(sunrise, slotMins * i),
        end: addMinutes(sunrise, slotMins * (i + 1)),
    }));
}

function overlaps(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd;
}

/**
 * Filters out Choghadiya slots that clash with Rahu Kalam or any other
 * stored inauspicious period (Yamaganda, Gulika Kaal, etc.) — these are
 * avoided for new beginnings regardless of how good the Choghadiya itself is.
 */
function excludeInauspiciousOverlaps(slots, rahuKalam, inauspiciousPeriods) {
    const blocks = [];
    if (rahuKalam?.start && rahuKalam?.end) {
        blocks.push({ start: new Date(rahuKalam.start), end: new Date(rahuKalam.end) });
    }
    (inauspiciousPeriods || []).forEach((p) => {
        if (p?.start && p?.end) blocks.push({ start: new Date(p.start), end: new Date(p.end) });
    });
    if (!blocks.length) return slots;

    return slots.filter(
        (slot) => !blocks.some((b) => overlaps(slot.start, slot.end, b.start, b.end))
    );
}

// ---------------------------------------------------------------------
// Occasion rule tables
// ---------------------------------------------------------------------
// goodTithi / badTithi: 1-15 tithi numbers (see TITHI_NAMES above)
// goodNakshatra / badNakshatra: nakshatra name substrings (case-insensitive)
// goodWeekday / badWeekday: full weekday names
// choghadiyaPreference: order in which Choghadiya qualities are tried when
//   picking the actual time window for that occasion
//
// GANDA_MOOLA: the 6 nakshatras traditionally treated with caution for
// birth-related ceremonies (Namkaran/Annaprashan) unless a shanti/puja is
// first performed. Kept as a shared constant since it's reused twice.
const GANDA_MOOLA_NAKSHATRAS = ["Ashwini", "Ashlesha", "Magha", "Jyeshtha", "Mula", "Revati"];

// Pada-level refinement for Ganda Moola: classical Muhurta texts treat one
// "junction" pada of each of these six nakshatras (the pada nearest the
// boundary with the adjoining sign) as the most severe, with the other
// three padas being a milder caution rather than a hard avoid. This is a
// commonly published simplification (same kind of nuance printed in
// Panchang books), not a personalised chart reading — kept alongside the
// existing disclaimer. Used only when the day's Nakshatra Pada is actually
// known (from the Moon's entry in planetaryPositions); if pada data isn't
// available (best-effort planet-position fetch failed) callers fall back
// to the flat whole-nakshatra caution, same as before.
const SEVERE_GANDA_MOOLA_PADA = {
    Ashwini: 1,
    Magha: 1,
    Mula: 1,
    Ashlesha: 4,
    Jyeshtha: 4,
    Revati: 4,
};

// Classical combustion (Asta) thresholds — angular separation from the Sun
// below which a planet is considered "combust"/set and traditionally
// avoided for starting a Vivah Muhurat. Figures widely published across
// Muhurta Shastra references (approximate, direct-motion values).
const GURU_ASTA_DEGREES = 11;
const SHUKRA_ASTA_DEGREES = 10;

function findPlanet(planetaryPositions, nameIncludes) {
    if (!Array.isArray(planetaryPositions)) return undefined;
    return planetaryPositions.find(
        (p) => p?.planet && nameIncludes.some((n) => p.planet.toLowerCase().includes(n))
    );
}

// Shortest angular distance between two 0-360° longitudes.
function angularSeparation(a, b) {
    const diff = Math.abs(a - b) % 360;
    return diff > 180 ? 360 - diff : diff;
}

/**
 * Checks whether Jupiter (Guru) or Venus (Shukra) is combust (Asta) today,
 * using the already-fetched planetaryPositions (Prokerala planet-position
 * endpoint — no extra API call). Returns null when the data isn't
 * available, so the caller can skip the check entirely rather than guess.
 */
function checkGuruShukraAsta(planetaryPositions) {
    const sun = findPlanet(planetaryPositions, ["sun", "surya"]);
    const guru = findPlanet(planetaryPositions, ["jupiter", "guru"]);
    const shukra = findPlanet(planetaryPositions, ["venus", "shukra"]);
    if (!sun || typeof sun.longitudeDegrees !== "number") return null;

    const result = { guruCombust: false, shukraCombust: false };
    if (guru && typeof guru.longitudeDegrees === "number") {
        result.guruCombust = angularSeparation(sun.longitudeDegrees, guru.longitudeDegrees) < GURU_ASTA_DEGREES;
    }
    if (shukra && typeof shukra.longitudeDegrees === "number") {
        result.shukraCombust = angularSeparation(sun.longitudeDegrees, shukra.longitudeDegrees) < SHUKRA_ASTA_DEGREES;
    }
    return result;
}

const OCCASION_RULES = {
    "griha-pravesh": {
        name: "Griha Pravesh Muhurat",
        purpose: "Housewarming",
        goodTithi: [2, 3, 5, 7, 10, 11, 12, 13],
        badTithi: [4, 9, 14, 15],
        goodNakshatra: ["Rohini", "Mrigashira", "Uttara Phalguni", "Uttara Ashadha", "Uttara Bhadrapada", "Hasta", "Chitra", "Swati", "Anuradha", "Shravana", "Dhanishta", "Revati"],
        badNakshatra: ["Bharani", "Krittika", "Ashlesha", "Jyeshtha", "Mula"],
        goodWeekday: ["Monday", "Wednesday", "Thursday", "Friday"],
        badWeekday: ["Tuesday", "Saturday"],
        hardBadWeekday: true,
        avoidPitruPaksha: true,
        choghadiyaPreference: ["Amrit", "Shubh", "Labh"],
    },
    namkaran: {
        name: "Namkaran Muhurat",
        purpose: "Naming Ceremony",
        goodTithi: [2, 3, 5, 7, 10, 11, 12, 13],
        badTithi: [4, 9, 14, 15],
        goodNakshatra: [], // broadly permissive — main filter is badNakshatra (Ganda Moola)
        badNakshatra: GANDA_MOOLA_NAKSHATRAS,
        gandaMoolaPadaAware: true,
        goodWeekday: [],
        badWeekday: [],
        avoidPitruPaksha: true,
        choghadiyaPreference: ["Amrit", "Shubh", "Labh", "Chal"],
    },
    annaprashan: {
        name: "Annaprashan Muhurat",
        purpose: "First Food Ceremony",
        goodTithi: [2, 3, 5, 7, 10, 11, 12, 13],
        badTithi: [4, 9, 14, 15],
        goodNakshatra: [],
        badNakshatra: GANDA_MOOLA_NAKSHATRAS,
        gandaMoolaPadaAware: true,
        goodWeekday: ["Monday", "Wednesday", "Thursday", "Friday"],
        badWeekday: ["Tuesday", "Saturday"],
        hardBadWeekday: true,
        avoidPitruPaksha: true,
        choghadiyaPreference: ["Amrit", "Shubh", "Labh", "Chal"],
    },
    vivah: {
        name: "Vivah Muhurat",
        purpose: "Marriage",
        goodTithi: [2, 3, 5, 7, 10, 11, 12, 13],
        badTithi: [4, 6, 8, 9, 12, 14, 15],
        goodNakshatra: ["Uttara Phalguni", "Hasta", "Swati", "Anuradha", "Mula", "Uttara Ashadha", "Uttara Bhadrapada", "Revati", "Magha", "Mrigashira", "Rohini"],
        badNakshatra: ["Bharani", "Krittika", "Ashlesha", "Jyeshtha", "Ardra"],
        goodWeekday: ["Monday", "Wednesday", "Thursday", "Friday"],
        badWeekday: ["Tuesday", "Saturday", "Sunday"],
        hardBadWeekday: true,
        checkGuruShukraAsta: true,
        avoidPitruPaksha: true,
        choghadiyaPreference: ["Amrit", "Shubh", "Labh"],
    },
    vehicle: {
        name: "Vehicle Purchase Muhurat",
        purpose: "New Vehicle",
        goodTithi: [2, 3, 5, 7, 10, 11, 12, 13],
        badTithi: [4, 9, 14, 15],
        goodNakshatra: ["Ashwini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Chitra", "Swati", "Anuradha", "Shravana", "Dhanishta", "Revati"],
        badNakshatra: ["Bharani", "Krittika", "Ashlesha"],
        goodWeekday: ["Wednesday", "Thursday", "Friday"],
        badWeekday: ["Saturday", "Tuesday"],
        hardBadWeekday: true,
        avoidPitruPaksha: true,
        choghadiyaPreference: ["Amrit", "Shubh", "Labh", "Chal"],
    },
    property: {
        name: "Property Purchase Muhurat",
        purpose: "Property/Land Purchase",
        goodTithi: [2, 3, 5, 7, 10, 11, 12, 13],
        badTithi: [4, 9, 14, 15],
        goodNakshatra: ["Rohini", "Mrigashira", "Uttara Phalguni", "Uttara Ashadha", "Uttara Bhadrapada", "Hasta", "Chitra", "Swati", "Anuradha", "Shravana", "Dhanishta", "Revati"],
        badNakshatra: ["Bharani", "Krittika", "Ashlesha", "Jyeshtha", "Mula"],
        // DrikPanchang treats ONLY Thursday & Friday as valid weekdays for
        // Property Purchase ("Thursdays and Fridays are considered the most
        // auspicious weekdays to purchase the property" — every other
        // weekday is flagged "Prohibited Weekday for Property Purchase" on
        // their site, a hard block, not a soft penalty). Every other day
        // is therefore listed as bad here, and hardBadWeekday (below) makes
        // that an outright exclusion the same way Pitru Paksha is.
        goodWeekday: ["Thursday", "Friday"],
        badWeekday: ["Sunday", "Monday", "Tuesday", "Wednesday", "Saturday"],
        hardBadWeekday: true,
        avoidPitruPaksha: true,
        choghadiyaPreference: ["Amrit", "Shubh", "Labh"],
    },
    business: {
        name: "Business Start Muhurat",
        purpose: "New Business",
        goodTithi: [2, 3, 5, 7, 10, 11, 12, 13],
        badTithi: [4, 9, 14, 15],
        goodNakshatra: ["Ashwini", "Pushya", "Hasta", "Chitra", "Swati", "Anuradha", "Shravana", "Dhanishta", "Revati"],
        badNakshatra: ["Bharani", "Krittika", "Ashlesha"],
        goodWeekday: ["Wednesday", "Thursday", "Friday"],
        badWeekday: ["Tuesday", "Saturday"],
        hardBadWeekday: true,
        avoidPitruPaksha: true,
        choghadiyaPreference: ["Amrit", "Shubh", "Labh"],
    },
    education: {
        name: "Vidyarambh Muhurat",
        purpose: "Starting Education",
        goodTithi: [2, 3, 5, 7, 10, 11, 12, 13],
        badTithi: [4, 9, 14, 15],
        goodNakshatra: ["Pushya", "Hasta", "Swati", "Ashwini", "Chitra", "Anuradha", "Shravana", "Dhanishta", "Revati", "Mrigashira"],
        badNakshatra: ["Bharani", "Krittika", "Ashlesha"],
        goodWeekday: ["Wednesday", "Thursday", "Friday"],
        badWeekday: ["Tuesday", "Sunday"],
        hardBadWeekday: true,
        avoidPitruPaksha: true,
        choghadiyaPreference: ["Amrit", "Shubh", "Labh"],
    },
    travel: {
        name: "Yatra Muhurat",
        purpose: "Travel",
        goodTithi: [2, 3, 5, 7, 10, 11, 12, 13],
        badTithi: [9, 14, 15],
        goodNakshatra: ["Ashwini", "Pushya", "Hasta", "Revati", "Shravana", "Punarvasu"],
        badNakshatra: ["Bharani", "Krittika"],
        goodWeekday: ["Monday", "Wednesday", "Thursday", "Friday"],
        badWeekday: [],
        // Chal ("moving") Choghadiya is traditionally preferred for travel
        // specifically, ahead of Labh — kept as its own order for this occasion.
        choghadiyaPreference: ["Amrit", "Shubh", "Chal", "Labh"],
    },
};

// ---------------------------------------------------------------------
// Day-level scoring
// ---------------------------------------------------------------------

function nameMatchesAny(name, list) {
    if (!name || !list?.length) return false;
    const n = name.toLowerCase();
    return list.some((entry) => n.includes(entry.toLowerCase()));
}

/**
 * Scores how favourable the day's Tithi/Nakshatra/Weekday combination is
 * for a given occasion. Returns { score (0-100), label, tone, reasons[] }.
 * Reasons are short strings surfaced in the "details" popup so the rating
 * isn't a black box.
 */
function scoreDayForOccasion(panchang, rules) {
    // Pitru Paksha overrides everything else for these occasions — a day in
    // this window isn't "scored down", it's simply not offered as a
    // Muhurat at all in classical practice (same as DrikPanchang), no
    // matter how good the Tithi/Nakshatra otherwise look.
    if (rules.avoidPitruPaksha && isPitruPaksha(panchang)) {
        return {
            score: 5,
            label: "Not Recommended",
            tone: "inauspicious",
            stars: 1,
            reasons: ["Pitru Paksha is currently in effect — traditionally avoided for starting new/auspicious work."],
        };
    }

    // Weekday (Vaar) Shuddhi — for occasions where DrikPanchang and classical
    // Muhurta texts treat the weekday as a hard pass/fail gate rather than a
    // scoring nudge (e.g. "Thursdays and Fridays are considered the most
    // auspicious weekdays to purchase the property"; every other day is
    // published outright as "Prohibited Weekday for Property Purchase",
    // regardless of how favourable that day's Tithi/Nakshatra are). Without
    // this, a good Tithi + good Nakshatra can outscore a bad weekday and the
    // day wrongly ends up "Auspicious" even though DrikPanchang excludes it
    // entirely. Only applied when hardBadWeekday is set on the occasion, so
    // occasions that don't publish a strict weekday rule are unaffected.
    const weekdayNow = panchang?.weekday;
    if (rules.hardBadWeekday && weekdayNow && rules.badWeekday?.includes(weekdayNow)) {
        return {
            score: 15,
            label: "Not Recommended",
            tone: "inauspicious",
            stars: 1,
            reasons: [`${weekdayNow} is a prohibited weekday for this occasion — traditionally avoided regardless of Tithi/Nakshatra.`],
        };
    }

    let score = 50;
    const reasons = [];

    const tithiNumber = getTithiNumber(panchang?.tithi?.name);
    if (tithiNumber && rules.badTithi?.includes(tithiNumber)) {
        score -= 30;
        reasons.push(`${panchang.tithi.name} is traditionally avoided for this occasion.`);
    } else if (tithiNumber && rules.goodTithi?.includes(tithiNumber)) {
        score += 20;
        reasons.push(`${panchang.tithi.name} is a favourable tithi for this occasion.`);
    }

    const nakName = panchang?.nakshatra?.name;
    const isBadNakshatra = nameMatchesAny(nakName, rules.badNakshatra);
    if (isBadNakshatra && rules.gandaMoolaPadaAware) {
        // Pada-level refinement: look up the Moon's pada (the day's Nakshatra
        // IS the Moon's nakshatra) from the already-fetched planetaryPositions.
        // If it isn't available, fall back to the flat whole-nakshatra caution.
        const moon = findPlanet(panchang?.planetaryPositions, ["moon", "chandra"]);
        const matchedName = GANDA_MOOLA_NAKSHATRAS.find((n) => nakName.toLowerCase().includes(n.toLowerCase()));
        if (moon?.pada && matchedName) {
            const severePada = SEVERE_GANDA_MOOLA_PADA[matchedName];
            if (moon.pada === severePada) {
                score -= 35;
                reasons.push(`${nakName} Pada ${moon.pada} is a severe Ganda Moola junction — strongly avoided for this occasion.`);
            } else {
                score -= 15;
                reasons.push(`${nakName} Pada ${moon.pada} carries mild Ganda Moola caution — a Ganda Moola Shanti is traditionally suggested first.`);
            }
        } else {
            score -= 25;
            reasons.push(`${nakName} nakshatra is generally avoided for this occasion (Ganda Moola).`);
        }
    } else if (isBadNakshatra) {
        score -= 25;
        reasons.push(`${nakName} nakshatra is generally avoided for this occasion.`);
    } else if (nameMatchesAny(nakName, rules.goodNakshatra)) {
        score += 20;
        reasons.push(`${nakName} nakshatra is favourable for this occasion.`);
    }

    const weekday = panchang?.weekday;
    if (weekday && rules.badWeekday?.includes(weekday)) {
        score -= 15;
        reasons.push(`${weekday} is usually avoided for this occasion.`);
    } else if (weekday && rules.goodWeekday?.includes(weekday)) {
        score += 10;
        reasons.push(`${weekday} is generally favourable for this occasion.`);
    }

    // Guru/Shukra Asta (combustion) — Vivah only. Real angular check against
    // the already-fetched planetaryPositions; silently skipped (no penalty)
    // if that best-effort data isn't available for this day, rather than
    // guessing.
    if (rules.checkGuruShukraAsta) {
        const asta = checkGuruShukraAsta(panchang?.planetaryPositions);
        if (asta?.guruCombust) {
            score -= 20;
            reasons.push("Guru (Jupiter) is combust (Asta) today — traditionally avoided for Vivah.");
        }
        if (asta?.shukraCombust) {
            score -= 20;
            reasons.push("Shukra (Venus) is combust (Asta) today — traditionally avoided for Vivah.");
        }
    }

    score = Math.max(0, Math.min(100, score));

    let label, tone, stars;
    if (score >= 80) {
        label = "Highly Auspicious"; tone = "auspicious"; stars = 5;
    } else if (score >= 60) {
        label = "Auspicious"; tone = "auspicious"; stars = 4;
    } else if (score >= 40) {
        label = "Moderate"; tone = "moderate"; stars = 3;
    } else {
        label = "Not Recommended"; tone = "inauspicious"; stars = 2;
    }

    return { score, label, tone, stars, reasons };
}

/**
 * Picks the best available Choghadiya slot for an occasion, trying each
 * quality in `choghadiyaPreference` order, skipping slots that overlap
 * Rahu Kalam / other inauspicious periods. Falls back to the first
 * remaining slot of the day if none of the preferred qualities survive
 * the overlap filter (keeps the row populated rather than empty).
 */
function pickSlot(daySlots, choghadiyaPreference) {
    for (const quality of choghadiyaPreference) {
        const match = daySlots.find((s) => s.name === quality);
        if (match) return match;
    }
    return daySlots[0] || null;
}

// ---------------------------------------------------------------------
// Public entrypoint
// ---------------------------------------------------------------------

/**
 * Builds the full Muhurat table for a day from Panchang data already
 * fetched from Prokerala (Brahma & Abhijit Muhurat are computed the same
 * way as before — Abhijit uses the real Prokerala value when available).
 *
 * @param {Object} panchang - normalized Panchang doc (see Panchang model)
 * @returns {Array} rows shaped for direct use by the frontend table
 */
function buildMuhuratSchedule(panchang) {
    if (!panchang?.sunrise || !panchang?.sunset) return [];

    const sunrise = new Date(panchang.sunrise);
    const daySlots = buildDayChoghadiya(panchang.sunrise, panchang.sunset, panchang.weekday);
    const usableSlots = excludeInauspiciousOverlaps(daySlots, panchang.rahuKalam, panchang.inauspiciousPeriods);

    const rows = [];

    // Brahma Muhurat: fixed classical definition — the 48-minute window
    // ending 96 minutes before sunrise (i.e. 96 to 48 mins before sunrise).
    rows.push({
        id: "brahma",
        category: "others",
        name: "Brahma Muhurat",
        purpose: "Spiritual Practice, Meditation",
        start: addMinutes(sunrise, -96),
        end: addMinutes(sunrise, -48),
        stars: 5,
        label: "Highly Auspicious",
        tone: "auspicious",
        details: "Best for meditation, prayers and self-growth.",
    });

    // Abhijit Muhurat: real value from Prokerala when available, else the
    // classical fallback definition (the 8th of 15 muhurats of the day,
    // roughly 24 mins either side of local noon).
    const abhijitStart = panchang?.abhijitMuhurat?.start
        ? new Date(panchang.abhijitMuhurat.start)
        : addMinutes(sunrise, (new Date(panchang.sunset) - sunrise) / 60000 / 2 - 24);
    const abhijitEnd = panchang?.abhijitMuhurat?.end
        ? new Date(panchang.abhijitMuhurat.end)
        : addMinutes(sunrise, (new Date(panchang.sunset) - sunrise) / 60000 / 2 + 24);
    rows.push({
        id: "abhijit",
        category: "others",
        name: "Abhijit Muhurat",
        purpose: "General, All Auspicious Works",
        start: abhijitStart,
        end: abhijitEnd,
        stars: 4.5,
        label: "Very Auspicious",
        tone: "auspicious",
        details: "Favourable for important new beginnings.",
    });

    // Every occasion-specific row, real-calculated
    Object.entries(OCCASION_RULES).forEach(([id, rules]) => {
        const dayScore = scoreDayForOccasion(panchang, rules);
        const slot = pickSlot(usableSlots.length ? usableSlots : daySlots, rules.choghadiyaPreference);
        if (!slot) return; // no daylight data — skip rather than fabricate a time

        // Disha Shoola — the direction traditionally avoided for travel on
        // this weekday (real Prokerala field, already fetched). This is
        // informational only: it names a direction to be cautious of, since
        // the actual travel direction isn't known to the system — it isn't
        // used to change the score/label.
        const dishaShoolaNote =
            id === "travel" && panchang?.dishaShoola
                ? ` Disha Shoola: travel towards ${panchang.dishaShoola} is traditionally avoided today.`
                : "";

        rows.push({
            id,
            category: id,
            name: rules.name,
            purpose: rules.purpose,
            start: slot.start,
            end: slot.end,
            stars: dayScore.stars,
            label: dayScore.label,
            tone: dayScore.tone,
            details:
                (dayScore.reasons.join(" ") || "Based on today's Panchang.") +
                ` Time window: ${slot.name} Choghadiya (${CHOGHADIYA_MEANING[slot.name]})` +
                dishaShoolaNote,
        });
    });

    return rows.sort((a, b) => a.start - b.start);
}

module.exports = {
    buildMuhuratSchedule,
    buildDayChoghadiya,
    scoreDayForOccasion,
    getTithiNumber,
    checkGuruShukraAsta,
    isPitruPaksha,
    OCCASION_RULES,
    // Occasion ids valid for the month/date-range Muhurat finder endpoint
    // (excludes "brahma"/"abhijit", which aren't occasion-scored — they're
    // fixed daily windows, not something you'd search a date range for).
    OCCASION_IDS: Object.keys(OCCASION_RULES),
};