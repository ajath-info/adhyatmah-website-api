// /**
//  * Prokerala Kundali (birth chart) API integration.
//  *
//  * Uses the SAME Prokerala account/credentials as panchang-api-util.js
//  * (PROKERALA_CLIENT_ID / PROKERALA_CLIENT_SECRET — already set in .env,
//  * nothing new to add there). The OAuth token cache is shared by importing
//  * getProkeralaToken from panchang-api-util instead of duplicating it, so
//  * both modules stay on one token and don't double up on auth calls.
//  *
//  * Docs: https://api.prokerala.com/ (Astrology API)
//  *
//  * NOTE: exact JSON field names are written defensively (multiple fallback
//  * keys), same approach as panchang-api-util.js — once live credentials hit
//  * this, log one raw response and adjust the fallback list below if any
//  * field comes back empty.
//  */

// const { getProkeralaToken } = require("./panchang-api-util");

// const PROKERALA_KUNDLI_URL = "https://api.prokerala.com/v2/astrology/kundli";
// // Rasi + Navamsa chart images (SVG). style: north-indian | south-indian | east-indian
// const PROKERALA_CHART_URL = "https://api.prokerala.com/v2/astrology/chart";
// const PROKERALA_MANGAL_DOSHA_URL = "https://api.prokerala.com/v2/astrology/mangal-dosha";
// const PROKERALA_KAAL_SARP_DOSHA_URL = "https://api.prokerala.com/v2/astrology/kaal-sarp-dosha";

// function pick(obj, keys) {
//     if (!obj) return undefined;
//     for (const key of keys) {
//         if (obj[key] !== undefined && obj[key] !== null) return obj[key];
//     }
//     return undefined;
// }

// /**
//  * Normalizes Prokerala's raw kundli response into our Kundali model shape.
//  */
// function normalizeKundliResponse(raw) {
//     const data = raw?.data || raw || {};

//     const nakshatraDetails = data.nakshatra_details || data.nakshatra || {};
//     const nakshatra = nakshatraDetails.nakshatra || nakshatraDetails;
//     const chandraRasi = nakshatraDetails.chandra_rasi || nakshatraDetails.chandra_rashi || {};
//     const sooryaRasi = nakshatraDetails.soorya_rasi || nakshatraDetails.surya_rashi || {};
//     const zodiac = nakshatraDetails.zodiac || {};
//     const additionalInfo = data.additional_info || data.mangal_dosha || {};

//     return {
//         nakshatra: pick(nakshatra, ["name"]),
//         pada: pick(nakshatraDetails, ["pada"]),
//         chandraRasi: pick(chandraRasi, ["name"]),
//         sooryaRasi: pick(sooryaRasi, ["name"]),
//         zodiac: pick(zodiac, ["name"]),
//         lagna: pick(additionalInfo, ["ascendant", "lagna"]),
//         yoga: pick(additionalInfo, ["yoga_name", "yoga"]),
//         manglikStatus: additionalInfo.manglik !== undefined ? Boolean(additionalInfo.manglik) : undefined,
//         raw: raw,
//     };
// }

// /**
//  * Normalizes Prokerala's chart response (SVG image) — the API returns raw
//  * SVG markup directly (not JSON), so this is a thin passthrough kept for
//  * symmetry with the other normalize* helpers and a single place to change
//  * if the response shape ever moves to JSON+base64.
//  */
// function normalizeChartResponse(svgText) {
//     return typeof svgText === "string" ? svgText : undefined;
// }

// function normalizeDoshaResponse(raw) {
//     const data = raw?.data || raw || {};
//     return {
//         hasDosha: data.has_dosha !== undefined ? Boolean(data.has_dosha) : undefined,
//         description: pick(data, ["description"]),
//         raw,
//     };
// }

// /**
//  * Fetches the core Kundli (birth chart summary) for one person.
//  *
//  * @param {Object} params
//  * @param {number} params.lat
//  * @param {number} params.lng
//  * @param {string} params.datetime - ISO8601 datetime, e.g. 1996-05-14T08:15:00+05:30
//  * @param {number} [params.ayanamsa=1] - 1 = Lahiri (kept consistent with panchang-api-util)
//  */
// async function fetchKundli({ lat, lng, datetime, ayanamsa = 1 }) {
//     if (lat === undefined || lng === undefined) {
//         throw new Error("lat and lng are required to generate a kundali");
//     }
//     if (!datetime) {
//         throw new Error("datetime (date + time of birth) is required to generate a kundali");
//     }

//     const token = await getProkeralaToken();
//     const params = new URLSearchParams({
//         ayanamsa: String(ayanamsa),
//         coordinates: `${lat},${lng}`,
//         datetime,
//     });

//     const response = await fetch(`${PROKERALA_KUNDLI_URL}?${params.toString()}`, {
//         headers: { Authorization: `Bearer ${token}` },
//     });
//     const json = await response.json();

//     if (!response.ok || json.status === "error") {
//         throw new Error(
//             `Prokerala kundli request failed: ${json.errors?.[0]?.detail || json.message || response.statusText}`
//         );
//     }

//     return normalizeKundliResponse(json);
// }

// /**
//  * Fetches the Rasi (lagna) or Navamsa chart image (SVG) for a person.
//  * Best-effort — caller should treat failure as "no chart image" rather
//  * than fail the whole kundali generation (same pattern as Rahu Kalam in
//  * panchang-api-util.js).
//  *
//  * @param {Object} params
//  * @param {"rasi"|"navamsa"} [params.chartType="rasi"]
//  * @param {"north-indian"|"south-indian"|"east-indian"} [params.chartStyle="north-indian"]
//  */
// async function fetchChart({ lat, lng, datetime, ayanamsa = 1, chartType = "rasi", chartStyle = "north-indian" }) {
//     const token = await getProkeralaToken();
//     const params = new URLSearchParams({
//         ayanamsa: String(ayanamsa),
//         coordinates: `${lat},${lng}`,
//         datetime,
//         chart_type: chartType,
//         chart_style: chartStyle,
//         format: "svg",
//     });

//     const response = await fetch(`${PROKERALA_CHART_URL}?${params.toString()}`, {
//         headers: { Authorization: `Bearer ${token}` },
//     });

//     const contentType = response.headers.get("content-type") || "";
//     if (!response.ok) {
//         // error responses come back as JSON even though success is raw SVG
//         const errJson = contentType.includes("json") ? await response.json() : null;
//         throw new Error(`Prokerala chart request failed: ${errJson?.errors?.[0]?.detail || response.statusText}`);
//     }

//     const svgText = await response.text();
//     return normalizeChartResponse(svgText);
// }

// /**
//  * Fetches Mangal Dosha + Kaal Sarp Dosha for a person. Best-effort, same
//  * pattern as everything else — returns undefined on failure rather than
//  * blocking the rest of the kundali.
//  */
// async function fetchDoshas({ lat, lng, datetime, ayanamsa = 1 }) {
//     const token = await getProkeralaToken();
//     const params = new URLSearchParams({
//         ayanamsa: String(ayanamsa),
//         coordinates: `${lat},${lng}`,
//         datetime,
//     });
//     const headers = { Authorization: `Bearer ${token}` };

//     const callProkerala = async (url) => {
//         const response = await fetch(`${url}?${params.toString()}`, { headers });
//         const json = await response.json();
//         if (!response.ok || json.status === "error") {
//             throw new Error(`Prokerala dosha request failed (${url}): ${json.errors?.[0]?.detail || response.statusText}`);
//         }
//         return json;
//     };

//     const [mangalJson, kaalSarpJson] = await Promise.all([
//         callProkerala(PROKERALA_MANGAL_DOSHA_URL).catch(() => null),
//         callProkerala(PROKERALA_KAAL_SARP_DOSHA_URL).catch(() => null),
//     ]);

//     return {
//         mangalDosha: mangalJson ? normalizeDoshaResponse(mangalJson) : undefined,
//         kaalSarpDosha: kaalSarpJson ? normalizeDoshaResponse(kaalSarpJson) : undefined,
//     };
// }

// /**
//  * High-level helper: generates a full kundali (summary + rasi/navamsa
//  * charts + doshas) in one call for the controller to use. Core kundli
//  * summary is required; chart images and doshas are best-effort (page
//  * still works, just missing that one section) — same resilience pattern
//  * used throughout panchang-api-util.js.
//  */
// async function generateFullKundali({ lat, lng, datetime, ayanamsa = 1, chartStyle = "north-indian" }) {
//     const [summary, rasiChart, navamsaChart, doshas] = await Promise.all([
//         fetchKundli({ lat, lng, datetime, ayanamsa }),
//         fetchChart({ lat, lng, datetime, ayanamsa, chartType: "rasi", chartStyle }).catch(() => undefined),
//         fetchChart({ lat, lng, datetime, ayanamsa, chartType: "navamsa", chartStyle }).catch(() => undefined),
//         fetchDoshas({ lat, lng, datetime, ayanamsa }).catch(() => ({})),
//     ]);

//     return {
//         ...summary,
//         rasiChartSvg: rasiChart,
//         navamsaChartSvg: navamsaChart,
//         mangalDosha: doshas.mangalDosha,
//         kaalSarpDosha: doshas.kaalSarpDosha,
//         chartStyle,
//     };
// }

// module.exports = {
//     fetchKundli,
//     fetchChart,
//     fetchDoshas,
//     generateFullKundali,
//     normalizeKundliResponse,
// };


/**
 * Prokerala Kundali (birth chart) API integration.
 *
 * Uses the SAME Prokerala account/credentials as panchang-api-util.js
 * (PROKERALA_CLIENT_ID / PROKERALA_CLIENT_SECRET — already set in .env,
 * nothing new to add there). The OAuth token cache is shared by importing
 * getProkeralaToken from panchang-api-util instead of duplicating it, so
 * both modules stay on one token and don't double up on auth calls.
 *
 * Docs: https://api.prokerala.com/ (Astrology API)
 *
 * NOTE: exact JSON field names are written defensively (multiple fallback
 * keys), same approach as panchang-api-util.js — once live credentials hit
 * this, log one raw response and adjust the fallback list below if any
 * field comes back empty.
 */

const { getProkeralaToken, fetchPlanetPositions } = require("./panchang-api-util");

const PROKERALA_KUNDLI_URL = "https://api.prokerala.com/v2/astrology/kundli";
// Rasi + Navamsa chart images (SVG). style: north-indian | south-indian | east-indian
const PROKERALA_CHART_URL = "https://api.prokerala.com/v2/astrology/chart";
const PROKERALA_MANGAL_DOSHA_URL = "https://api.prokerala.com/v2/astrology/mangal-dosha";
const PROKERALA_KAAL_SARP_DOSHA_URL = "https://api.prokerala.com/v2/astrology/kaal-sarp-dosha";
// Vimshottari Mahadasha periods (the "Dasha System" section on report pages
// like astrotalk.com/freekundli)
const PROKERALA_DASHA_PERIODS_URL = "https://api.prokerala.com/v2/astrology/dasha-periods";

function pick(obj, keys) {
    if (!obj) return undefined;
    for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null) return obj[key];
    }
    return undefined;
}

/**
 * Normalizes Prokerala's raw kundli response into our Kundali model shape.
 * This single response already carries the "Avakhada Chakra" fields
 * (Varna, Vashya, Yoni/Gana, Nadi, Sign Lord, Nakshatra Lord, Tatva, Paya,
 * Name Alphabet etc.) under `additional_info` — same one report block that
 * sites like astrotalk.com/freekundli show as a table, so no extra API
 * call is needed for that section.
 */
function normalizeKundliResponse(raw) {
    const data = raw?.data || raw || {};

    const nakshatraDetails = data.nakshatra_details || data.nakshatra || {};
    const nakshatra = nakshatraDetails.nakshatra || nakshatraDetails;
    const chandraRasi = nakshatraDetails.chandra_rasi || nakshatraDetails.chandra_rashi || {};
    const sooryaRasi = nakshatraDetails.soorya_rasi || nakshatraDetails.surya_rashi || {};
    const zodiac = nakshatraDetails.zodiac || {};
    const additionalInfo = data.additional_info || data.mangal_dosha || {};

    return {
        nakshatra: pick(nakshatra, ["name"]),
        pada: pick(nakshatraDetails, ["pada"]),
        chandraRasi: pick(chandraRasi, ["name"]),
        sooryaRasi: pick(sooryaRasi, ["name"]),
        zodiac: pick(zodiac, ["name"]),
        lagna: pick(additionalInfo, ["ascendant", "lagna"]),
        yoga: pick(additionalInfo, ["yoga_name", "yoga"]),
        manglikStatus: additionalInfo.manglik !== undefined ? Boolean(additionalInfo.manglik) : undefined,
        // --- Avakhada Chakra ---
        avakhadaChakra: {
            varna: pick(additionalInfo, ["varna"]),
            vashya: pick(additionalInfo, ["vashya"]),
            yoni: pick(additionalInfo, ["yoni", "animal_sign"]),
            gana: pick(additionalInfo, ["gana", "ganam"]),
            nadi: pick(additionalInfo, ["nadi"]),
            signLord: pick(chandraRasi.lord || {}, ["name"]) || pick(additionalInfo, ["sign_lord"]),
            nakshatraLord: pick(nakshatra.lord || {}, ["name"]) || pick(additionalInfo, ["nakshatra_lord"]),
            tatva: pick(additionalInfo, ["tatva"]),
            paya: pick(additionalInfo, ["paya"]),
            nameAlphabet: pick(additionalInfo, ["name_alphabet"]),
            deity: pick(additionalInfo, ["deity"]),
            symbol: pick(additionalInfo, ["symbol"]),
            birthStone: pick(additionalInfo, ["birth_stone"]),
        },
        raw: raw,
    };
}

/**
 * Normalizes Prokerala's chart response (SVG image) — the API returns raw
 * SVG markup directly (not JSON), so this is a thin passthrough kept for
 * symmetry with the other normalize* helpers and a single place to change
 * if the response shape ever moves to JSON+base64.
 */
function normalizeChartResponse(svgText) {
    return typeof svgText === "string" ? svgText : undefined;
}

function normalizeDoshaResponse(raw) {
    const data = raw?.data || raw || {};
    return {
        hasDosha: data.has_dosha !== undefined ? Boolean(data.has_dosha) : undefined,
        description: pick(data, ["description"]),
        raw,
    };
}

/**
 * Fetches the core Kundli (birth chart summary) for one person.
 *
 * @param {Object} params
 * @param {number} params.lat
 * @param {number} params.lng
 * @param {string} params.datetime - ISO8601 datetime, e.g. 1996-05-14T08:15:00+05:30
 * @param {number} [params.ayanamsa=1] - 1 = Lahiri (kept consistent with panchang-api-util)
 */
async function fetchKundli({ lat, lng, datetime, ayanamsa = 1 }) {
    if (lat === undefined || lng === undefined) {
        throw new Error("lat and lng are required to generate a kundali");
    }
    if (!datetime) {
        throw new Error("datetime (date + time of birth) is required to generate a kundali");
    }

    const token = await getProkeralaToken();
    const params = new URLSearchParams({
        ayanamsa: String(ayanamsa),
        coordinates: `${lat},${lng}`,
        datetime,
    });

    const response = await fetch(`${PROKERALA_KUNDLI_URL}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const json = await response.json();

    if (!response.ok || json.status === "error") {
        throw new Error(
            `Prokerala kundli request failed: ${json.errors?.[0]?.detail || json.message || response.statusText}`
        );
    }

    return normalizeKundliResponse(json);
}

/**
 * Fetches the Rasi (lagna) or Navamsa chart image (SVG) for a person.
 * Best-effort — caller should treat failure as "no chart image" rather
 * than fail the whole kundali generation (same pattern as Rahu Kalam in
 * panchang-api-util.js).
 *
 * @param {Object} params
 * @param {"rasi"|"navamsa"} [params.chartType="rasi"]
 * @param {"north-indian"|"south-indian"|"east-indian"} [params.chartStyle="north-indian"]
 */
async function fetchChart({ lat, lng, datetime, ayanamsa = 1, chartType = "rasi", chartStyle = "north-indian" }) {
    const token = await getProkeralaToken();
    const params = new URLSearchParams({
        ayanamsa: String(ayanamsa),
        coordinates: `${lat},${lng}`,
        datetime,
        chart_type: chartType,
        chart_style: chartStyle,
        format: "svg",
    });

    const response = await fetch(`${PROKERALA_CHART_URL}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const contentType = response.headers.get("content-type") || "";
    if (!response.ok) {
        // error responses come back as JSON even though success is raw SVG
        const errJson = contentType.includes("json") ? await response.json() : null;
        throw new Error(`Prokerala chart request failed: ${errJson?.errors?.[0]?.detail || response.statusText}`);
    }

    const svgText = await response.text();
    return normalizeChartResponse(svgText);
}

/**
 * Fetches Mangal Dosha + Kaal Sarp Dosha for a person. Best-effort, same
 * pattern as everything else — returns undefined on failure rather than
 * blocking the rest of the kundali.
 */
async function fetchDoshas({ lat, lng, datetime, ayanamsa = 1 }) {
    const token = await getProkeralaToken();
    const params = new URLSearchParams({
        ayanamsa: String(ayanamsa),
        coordinates: `${lat},${lng}`,
        datetime,
    });
    const headers = { Authorization: `Bearer ${token}` };

    const callProkerala = async (url) => {
        const response = await fetch(`${url}?${params.toString()}`, { headers });
        const json = await response.json();
        if (!response.ok || json.status === "error") {
            throw new Error(`Prokerala dosha request failed (${url}): ${json.errors?.[0]?.detail || response.statusText}`);
        }
        return json;
    };

    const [mangalJson, kaalSarpJson] = await Promise.all([
        callProkerala(PROKERALA_MANGAL_DOSHA_URL).catch(() => null),
        callProkerala(PROKERALA_KAAL_SARP_DOSHA_URL).catch(() => null),
    ]);

    return {
        mangalDosha: mangalJson ? normalizeDoshaResponse(mangalJson) : undefined,
        kaalSarpDosha: kaalSarpJson ? normalizeDoshaResponse(kaalSarpJson) : undefined,
    };
}

/**
 * Normalizes Prokerala's dasha-periods response into a flat list of
 * Vimshottari Mahadasha periods, plus which one is "current" (today's
 * date falls between its start/end) — this is the "Dasha System" section
 * shown on report pages like astrotalk.com/freekundli.
 */
function normalizeDashaPeriods(raw) {
    const data = raw?.data || raw || {};
    const list = data.dasha_periods || data.periods || [];
    if (!Array.isArray(list)) return [];

    const now = Date.now();
    return list.map((p) => {
        const start = pick(p, ["start", "start_time"]);
        const end = pick(p, ["end", "end_time"]);
        const startMs = start ? new Date(start).getTime() : undefined;
        const endMs = end ? new Date(end).getTime() : undefined;
        const isCurrent =
            startMs !== undefined && endMs !== undefined && now >= startMs && now <= endMs;

        return {
            planet: pick(p, ["name", "planet"]),
            start,
            end,
            isCurrent,
        };
    });
}

/**
 * Fetches the Vimshottari Mahadasha period list for a person. Best-effort,
 * same pattern as everything else in this file — returns [] on failure so
 * the rest of the kundali still renders.
 */
async function fetchDashaPeriods({ lat, lng, datetime, ayanamsa = 1 }) {
    const token = await getProkeralaToken();
    const params = new URLSearchParams({
        ayanamsa: String(ayanamsa),
        coordinates: `${lat},${lng}`,
        datetime,
    });

    const response = await fetch(`${PROKERALA_DASHA_PERIODS_URL}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const json = await response.json();

    if (!response.ok || json.status === "error") {
        throw new Error(
            `Prokerala dasha-periods request failed: ${json.errors?.[0]?.detail || json.message || response.statusText}`
        );
    }

    return normalizeDashaPeriods(json);
}

/**
 * High-level helper: generates a full kundali (summary + rasi/navamsa
 * charts + doshas) in one call for the controller to use. Core kundli
 * summary is required; chart images and doshas are best-effort (page
 * still works, just missing that one section) — same resilience pattern
 * used throughout panchang-api-util.js.
 */
async function generateFullKundali({ lat, lng, datetime, ayanamsa = 1, chartStyle = "north-indian" }) {
    const [summary, rasiChart, navamsaChart, doshas, planetPositions, dashaPeriods] = await Promise.all([
        fetchKundli({ lat, lng, datetime, ayanamsa }),
        fetchChart({ lat, lng, datetime, ayanamsa, chartType: "rasi", chartStyle }).catch(() => undefined),
        fetchChart({ lat, lng, datetime, ayanamsa, chartType: "navamsa", chartStyle }).catch(() => undefined),
        fetchDoshas({ lat, lng, datetime, ayanamsa }).catch(() => ({})),
        // reuses the SAME planet-position fetch/normalize built for Panchang
        // (Ascendant + 9 planets: Rashi, Longitude, Nakshatra, Pada)
        fetchPlanetPositions({ lat, lng, datetime, ayanamsa }).catch(() => []),
        fetchDashaPeriods({ lat, lng, datetime, ayanamsa }).catch(() => []),
    ]);

    return {
        ...summary,
        rasiChartSvg: rasiChart,
        navamsaChartSvg: navamsaChart,
        mangalDosha: doshas.mangalDosha,
        kaalSarpDosha: doshas.kaalSarpDosha,
        planetaryPositions: planetPositions,
        dashaPeriods,
        chartStyle,
    };
}

module.exports = {
    fetchKundli,
    fetchChart,
    fetchDoshas,
    fetchDashaPeriods,
    generateFullKundali,
    normalizeKundliResponse,
    normalizeDashaPeriods,
};