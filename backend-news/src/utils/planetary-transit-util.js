/**
 * Planetary Transit calculation util — pure astronomy, no network/DB calls.
 *
 * Two jobs:
 *   1. Best-effort RETROGRADE fallback for the "Current Positions" table
 *      (used only when Prokerala's planet-position response doesn't carry
 *      a usable retrograde/motion field for a given planet — see
 *      panchang-api-util.js:normalizePlanetPositions()).
 *   2. The full "Upcoming Transits" (rashi-ingress) computation, which is
 *      NOT sourced from Prokerala at all — Prokerala has no
 *      "next N ingresses" endpoint, and daily-polling it for this would
 *      cost far more API credits than the free tier allows. Instead this
 *      file computes ingress dates directly from ephemeris data.
 *
 * Library: astronomy-engine (npm, MIT, 0 dependencies). Add to
 * backend/package.json:  "astronomy-engine": "^2.1.19"
 *
 * IMPORTANT — geocentric, not heliocentric:
 * astronomy-engine's own `EclipticLongitude(body, date)` is HELIOCENTRIC
 * (Sun-centered) and throws for the Sun itself. Vedic astrology needs the
 * GEOCENTRIC ecliptic longitude, which is:
 *     Astronomy.Ecliptic(Astronomy.GeoVector(body, date, true)).elon
 * Every longitude in this file goes through that path.
 *
 * Ayanamsa: this uses a linear Lahiri (Chitrapaksha) approximation
 * (J2000 epoch value + IAU mean precession rate). It's accurate to within
 * roughly 1-2 arcminutes over multi-decade ranges, which is exactly the
 * lightweight-approximation trade-off flagged in the implementation plan.
 * That's more than enough for month/day-level ingress dates. Where it can
 * matter is the display degree for a planet sitting within ~2-3 arcmin of
 * a rashi boundary (rare, one specific day). If/when Prokerala credentials
 * are available, calibrate by diffing this function's output against a
 * live Prokerala longitudeDegrees for the same date/lat/lng and adjusting
 * LAHIRI_AYANAMSA_AT_J2000 below — the rest of the module doesn't change.
 */

const Astronomy = require("astronomy-engine");

// ---------------------------------------------------------------------------
// Ayanamsa
// ---------------------------------------------------------------------------

// Lahiri ayanamsa value at J2000.0 (2000-01-01 12:00 TT), in degrees —
// standard reference value used by most Vedic panchang software.
const LAHIRI_AYANAMSA_AT_J2000 = 23.85348;
// IAU mean precession in longitude, converted to degrees/Julian century.
const PRECESSION_DEG_PER_CENTURY = (50.2909 / 3600) * 100;

function lahiriAyanamsa(date) {
    const jd = date.getTime() / 86400000 + 2440587.5;
    const centuriesSinceJ2000 = (jd - 2451545.0) / 36525;
    return LAHIRI_AYANAMSA_AT_J2000 + PRECESSION_DEG_PER_CENTURY * centuriesSinceJ2000;
}

function normalizeDegrees(deg) {
    return ((deg % 360) + 360) % 360;
}

// ---------------------------------------------------------------------------
// Sidereal longitude
// ---------------------------------------------------------------------------

// The 7 classical grahas this module can position directly via
// astronomy-engine's Body enum (Rahu/Ketu are handled separately below,
// astronomy-engine has no lunar-node body).
const CLASSICAL_PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

function geocentricTropicalLongitude(bodyName, date) {
    const geoVector = Astronomy.GeoVector(Astronomy.Body[bodyName], date, true);
    const ecliptic = Astronomy.Ecliptic(geoVector);
    return ecliptic.elon;
}

/**
 * Mean Lunar Node tropical longitude (Meeus, "Astronomical Algorithms",
 * standard textbook formula — no extra library needed). This is the MEAN
 * node (always regressing), which is the conventional default for basic
 * Panchang/Rahu-Ketu placement. If a live Prokerala response later
 * confirms it uses the TRUE node instead, swap the formula here only.
 */
function meanNodeTropicalLongitude(date) {
    const jd = date.getTime() / 86400000 + 2440587.5;
    const T = (jd - 2451545.0) / 36525;
    const omega =
        125.0445479 -
        1934.1362891 * T +
        0.0020754 * T * T +
        (T * T * T) / 467441 -
        (T * T * T * T) / 60616000;
    return normalizeDegrees(omega);
}

/**
 * Sidereal longitude (0-360°) for any of the 9 grahas at a given date.
 * Ketu is always Rahu + 180° (diametrically opposite the Moon's node).
 */
function getSiderealLongitude(planetName, date) {
    const ayanamsa = lahiriAyanamsa(date);

    if (planetName === "Rahu") {
        return normalizeDegrees(meanNodeTropicalLongitude(date) - ayanamsa);
    }
    if (planetName === "Ketu") {
        return normalizeDegrees(getSiderealLongitude("Rahu", date) + 180);
    }
    if (!CLASSICAL_PLANETS.includes(planetName)) {
        throw new Error(`Unknown planet for sidereal longitude: ${planetName}`);
    }
    return normalizeDegrees(geocentricTropicalLongitude(planetName, date) - ayanamsa);
}

// ---------------------------------------------------------------------------
// Rashi (zodiac sign)
// ---------------------------------------------------------------------------

// 12 signs in order, Aries first — English + Sanskrit, matching the naming
// convention already used on the frontend's Rashi Wheel (RASHI_ORDER).
const RASHI_NAMES = [
    { en: "Aries", sa: "Mesha" },
    { en: "Taurus", sa: "Vrishabha" },
    { en: "Gemini", sa: "Mithuna" },
    { en: "Cancer", sa: "Karka" },
    { en: "Leo", sa: "Simha" },
    { en: "Virgo", sa: "Kanya" },
    { en: "Libra", sa: "Tula" },
    { en: "Scorpio", sa: "Vrishchika" },
    { en: "Sagittarius", sa: "Dhanu" },
    { en: "Capricorn", sa: "Makara" },
    { en: "Aquarius", sa: "Kumbha" },
    { en: "Pisces", sa: "Meena" },
];

function rashiIndexForLongitude(longitude) {
    return Math.floor(normalizeDegrees(longitude) / 30);
}

function getRashi(longitude) {
    const index = rashiIndexForLongitude(longitude);
    return { index, ...RASHI_NAMES[index] };
}

// ---------------------------------------------------------------------------
// Retrograde detection — direction-agnostic, works for every planet
// including Rahu/Ketu (which are always regressing under the mean-node
// convention). Uses a small symmetric time step around `date` rather than
// a full day so it stays accurate close to a station (direction change).
// ---------------------------------------------------------------------------

const RETROGRADE_DELTA_STEP_DAYS = 0.5;

function isRetrograde(planetName, date) {
    if (planetName === "Rahu" || planetName === "Ketu") {
        // Mean node regresses monotonically — always retrograde by definition
        // under this convention.
        return true;
    }
    const before = new Date(date.getTime() - RETROGRADE_DELTA_STEP_DAYS * 86400000);
    const after = new Date(date.getTime() + RETROGRADE_DELTA_STEP_DAYS * 86400000);
    const lonBefore = getSiderealLongitude(planetName, before);
    const lonAfter = getSiderealLongitude(planetName, after);
    let delta = lonAfter - lonBefore;
    // unwrap across the 360/0 boundary
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    return delta < 0;
}

// ---------------------------------------------------------------------------
// Current positions — all 9 grahas at a single instant. Used as the
// retrograde-fallback source by panchang-api-util.js, and independently
// reusable/testable.
// ---------------------------------------------------------------------------

const ALL_PLANETS = [...CLASSICAL_PLANETS, "Rahu", "Ketu"];

function getCurrentPositions(date) {
    return ALL_PLANETS.map((planet) => {
        const longitude = getSiderealLongitude(planet, date);
        const rashi = getRashi(longitude);
        return {
            planet,
            longitude,
            degreeInSign: longitude - rashi.index * 30,
            rashi,
            isRetrograde: isRetrograde(planet, date),
        };
    });
}

// ---------------------------------------------------------------------------
// Rashi-ingress search ("Upcoming Transits")
// ---------------------------------------------------------------------------

// Daily coarse-scan step for every planet. Kept uniform (not just
// speed-tuned) because retrograde stations can create extra brackets close
// together that a coarser step would skip — see the implementation plan's
// note on retrograde ingress/egress. Daily is cheap: astronomy-engine's
// GeoVector is a closed-form ephemeris call, not numerical integration.
const COARSE_SCAN_STEP_DAYS = 1;

// How far ahead to scan looking for the NEXT ingress of each planet, before
// giving up (keeps a stuck search bounded). Generous relative to each
// planet's sidereal period so at least one ingress is always found.
const MAX_SCAN_WINDOW_DAYS = {
    Moon: 40,
    Sun: 400,
    Mercury: 400,
    Venus: 400,
    Mars: 780,
    Jupiter: 420,
    Saturn: 950,
    Rahu: 2200, // mean node takes ~18.6 years for a full cycle, ~1.5yr/sign
    Ketu: 2200,
};

/**
 * Finds the next rashi ingress for `planetName` strictly after `fromDate`.
 * Returns { planet, fromRashi, toRashi, exactDateTime, isRetrograde }.
 * `isRetrograde` reflects the planet's motion state at the ingress instant
 * (so a retrograde re-entry into the previous sign is correctly labelled).
 *
 * Rahu/Ketu always move backwards through the zodiac (descending rashi
 * index), every other graha normally moves forward but can cross a
 * boundary in either direction while retrograde — the coarse scan below
 * doesn't assume a direction, it just looks for ANY index change day over
 * day and lets Astronomy.Search() pin down the exact instant.
 */
function findNextIngress(planetName, fromDate) {
    const maxWindowDays = MAX_SCAN_WINDOW_DAYS[planetName] || 400;
    const startLongitude = getSiderealLongitude(planetName, fromDate);
    let prevIndex = rashiIndexForLongitude(startLongitude);
    let prevTime = new Astronomy.AstroTime(fromDate);

    for (let dayOffset = COARSE_SCAN_STEP_DAYS; dayOffset <= maxWindowDays; dayOffset += COARSE_SCAN_STEP_DAYS) {
        const candidateDate = new Date(fromDate.getTime() + dayOffset * 86400000);
        const candidateTime = new Astronomy.AstroTime(candidateDate);
        const longitude = getSiderealLongitude(planetName, candidateDate);
        const index = rashiIndexForLongitude(longitude);

        if (index !== prevIndex) {
            // Which boundary was crossed? Ascending (prevIndex -> prevIndex+1)
            // or descending (prevIndex -> prevIndex-1) — determine from the
            // actual index delta (handles the 11->0 / 0->11 wraparound too).
            const forwardDelta = (index - prevIndex + 12) % 12; // 1 if ascending by one sign
            const crossingAscending = forwardDelta === 1;
            const boundaryRashiIndex = crossingAscending ? index : prevIndex;
            const boundaryLongitude = boundaryRashiIndex * 30;

            // Root-find function: signed angular distance from the boundary,
            // unwrapped to (-180, 180] so Search() sees a clean zero-crossing.
            const distanceFromBoundary = (t) => {
                let diff = getSiderealLongitude(planetName, t.date) - boundaryLongitude;
                diff = ((diff + 180) % 360 + 360) % 360 - 180;
                return diff;
            };

            const result = Astronomy.Search(distanceFromBoundary, prevTime, candidateTime, 0.01);
            const exactDateTime = result ? result.date : candidateDate;

            return {
                planet: planetName,
                fromRashi: RASHI_NAMES[prevIndex],
                toRashi: RASHI_NAMES[index],
                exactDateTime,
                isRetrograde: isRetrograde(planetName, exactDateTime),
            };
        }

        prevIndex = index;
        prevTime = candidateTime;
    }

    return null; // not found within the search window (shouldn't happen in practice)
}

/**
 * Computes upcoming ingress events for a set of planets within a future
 * window, sorted chronologically. Each planet can contribute more than one
 * event if several ingresses (including a retrograde-driven re-entry) fall
 * inside the window.
 *
 * @param {Object} opts
 * @param {Date} [opts.from=new Date()]
 * @param {number} [opts.months=12] - how far ahead to look
 * @param {string[]} [opts.planets] - defaults to the 7 classical grahas + Rahu/Ketu (no Moon — it changes rashi every ~2.25 days, too frequent for a "major transits" list)
 * @param {number} [opts.maxEventsPerPlanet=4] - safety cap per planet
 */
function computeUpcomingTransits({
    from = new Date(),
    months = 12,
    planets = ["Sun", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"],
    maxEventsPerPlanet = 4,
} = {}) {
    const windowEnd = new Date(from.getTime() + months * 30.44 * 86400000);
    const events = [];

    // Search.date's own tolerance (see findNextIngress) means cursoring
    // exactly onto the ingress instant can re-find the *same* crossing on
    // the very next scan (still numerically on the old side of the
    // boundary). Step a few hours past it before searching again.
    const POST_INGRESS_BUFFER_MS = 6 * 60 * 60 * 1000;

    for (const planet of planets) {
        let cursor = from;
        for (let i = 0; i < maxEventsPerPlanet; i++) {
            const ingress = findNextIngress(planet, cursor);
            if (!ingress || ingress.exactDateTime > windowEnd) break;
            events.push(ingress);
            cursor = new Date(ingress.exactDateTime.getTime() + POST_INGRESS_BUFFER_MS);
        }
    }

    events.sort((a, b) => a.exactDateTime - b.exactDateTime);
    return events;
}

module.exports = {
    RASHI_NAMES,
    CLASSICAL_PLANETS,
    ALL_PLANETS,
    lahiriAyanamsa,
    getSiderealLongitude,
    getRashi,
    isRetrograde,
    getCurrentPositions,
    findNextIngress,
    computeUpcomingTransits,
};