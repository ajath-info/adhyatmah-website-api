// // /**
// //  * Prokerala Panchang API integration.
// //  *
// //  * Env vars required (add to .env, do NOT touch any existing key):
// //  *   PROKERALA_CLIENT_ID
// //  *   PROKERALA_CLIENT_SECRET
// //  *
// //  * Docs: https://api.prokerala.com/  (Astrology API -> Panchang endpoint)
// //  *
// //  * NOTE: Prokerala's exact JSON field names have changed across API versions
// //  * in the past, so `normalizePanchangResponse` is written defensively
// //  * (multiple fallback keys). Once real credentials are added, log one raw
// //  * response and adjust the fallback list below if any field comes back empty.
// //  */

// // const PROKERALA_TOKEN_URL = "https://api.prokerala.com/token";
// // const PROKERALA_PANCHANG_URL = "https://api.prokerala.com/v2/astrology/panchang";
// // // Rahu Kalam / Abhijit Muhurat are NOT part of the basic panchang response —
// // // Prokerala serves them from these two separate endpoints (same auth/params).
// // const PROKERALA_AUSPICIOUS_URL = "https://api.prokerala.com/v2/astrology/auspicious-period";
// // const PROKERALA_INAUSPICIOUS_URL = "https://api.prokerala.com/v2/astrology/inauspicious-period";

// // // in-memory token cache (per server process)
// // let cachedToken = null;
// // let cachedTokenExpiry = 0; // epoch ms

// // /**
// //  * Fetches (and caches) an OAuth2 access token using client_credentials grant.
// //  */
// // async function getProkeralaToken() {
// //     const now = Date.now();

// //     if (cachedToken && now < cachedTokenExpiry - 30 * 1000) {
// //         return cachedToken;
// //     }

// //     const clientId = process.env.PROKERALA_CLIENT_ID;
// //     const clientSecret = process.env.PROKERALA_CLIENT_SECRET;

// //     if (!clientId || !clientSecret) {
// //         throw new Error(
// //             "Prokerala API credentials missing. Set PROKERALA_CLIENT_ID and PROKERALA_CLIENT_SECRET in .env"
// //         );
// //     }

// //     const body = new URLSearchParams({
// //         grant_type: "client_credentials",
// //         client_id: clientId,
// //         client_secret: clientSecret,
// //     });

// //     const response = await fetch(PROKERALA_TOKEN_URL, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/x-www-form-urlencoded" },
// //         body,
// //     });

// //     const data = await response.json();

// //     if (!response.ok || !data.access_token) {
// //         throw new Error(
// //             `Prokerala auth failed: ${data.error_description || data.error || response.statusText}`
// //         );
// //     }

// //     cachedToken = data.access_token;
// //     cachedTokenExpiry = now + (data.expires_in ? data.expires_in * 1000 : 55 * 60 * 1000);

// //     return cachedToken;
// // }

// // /**
// //  * Picks the first defined value among several possible keys of an object.
// //  */
// // function pick(obj, keys) {
// //     if (!obj) return undefined;
// //     for (const key of keys) {
// //         if (obj[key] !== undefined && obj[key] !== null) return obj[key];
// //     }
// //     return undefined;
// // }

// // /**
// //  * Normalizes Prokerala's raw panchang response into our Panchang model shape.
// //  */
// // /**
// //  * Finds a named period (e.g. "Rahu Kalam", "Abhijit Muhurat") inside a
// //  * Prokerala auspicious/inauspicious-period response and returns {start, end}.
// //  * Written defensively since Prokerala nests this list under slightly
// //  * different keys across API versions.
// //  */
// // function findPeriod(periodResponse, names) {
// //     const data = periodResponse?.data || periodResponse || {};
// //     const list = data.muhurat || data.periods || data.period || [];

// //     if (!Array.isArray(list)) return undefined;

// //     const match = list.find((p) => names.some((n) => (p.name || "").toLowerCase().includes(n.toLowerCase())));
// //     if (!match) return undefined;

// //     // some responses nest the actual time range under a further "period" array
// //     const range = Array.isArray(match.period) ? match.period[0] : match;
// //     return {
// //         start: range?.start,
// //         end: range?.end,
// //     };
// // }

// // function normalizePanchangResponse(raw, rahuKalam, abhijitMuhurat) {
// //     const data = raw?.data || raw || {};

// //     const tithiEntry = Array.isArray(data.tithi) ? data.tithi[0] : data.tithi;
// //     const nakshatraEntry = Array.isArray(data.nakshatra) ? data.nakshatra[0] : data.nakshatra;
// //     const yogaEntry = Array.isArray(data.yoga) ? data.yoga[0] : data.yoga;
// //     const karanaEntry = Array.isArray(data.karana) ? data.karana[0] : data.karana;

// //     return {
// //         tithi: tithiEntry
// //             ? {
// //                 name: pick(tithiEntry, ["name"]),
// //                 paksha: pick(tithiEntry, ["paksha"]),
// //                 endTime: pick(tithiEntry, ["end", "end_time"]),
// //             }
// //             : undefined,
// //         nakshatra: nakshatraEntry
// //             ? {
// //                 name: pick(nakshatraEntry, ["name"]),
// //                 endTime: pick(nakshatraEntry, ["end", "end_time"]),
// //             }
// //             : undefined,
// //         yoga: yogaEntry
// //             ? {
// //                 name: pick(yogaEntry, ["name"]),
// //                 endTime: pick(yogaEntry, ["end", "end_time"]),
// //             }
// //             : undefined,
// //         karana: karanaEntry
// //             ? {
// //                 name: pick(karanaEntry, ["name"]),
// //                 endTime: pick(karanaEntry, ["end", "end_time"]),
// //             }
// //             : undefined,
// //         sunrise: pick(data, ["sunrise"]),
// //         sunset: pick(data, ["sunset"]),
// //         moonrise: pick(data, ["moonrise"]),
// //         moonset: pick(data, ["moonset"]),
// //         rahuKalam: rahuKalam,
// //         abhijitMuhurat: abhijitMuhurat,
// //         festivals: Array.isArray(data.vrat) || Array.isArray(data.festivals)
// //             ? (data.vrat || data.festivals).map((f) => (typeof f === "string" ? f : f?.name)).filter(Boolean)
// //             : [],
// //         raw: raw,
// //     };
// // }

// // /**
// //  * Fetches Panchang for a given date + coordinates from Prokerala.
// //  *
// //  * @param {Object} params
// //  * @param {number} params.lat
// //  * @param {number} params.lng
// //  * @param {string} params.datetime - ISO8601 datetime, e.g. 2026-09-02T06:00:00+05:30
// //  * @param {number} [params.ayanamsa=1] - 1 = Lahiri (most common default)
// //  */
// // async function fetchPanchang({ lat, lng, datetime, ayanamsa = 1 }) {
// //     if (lat === undefined || lng === undefined) {
// //         throw new Error("lat and lng are required to fetch panchang");
// //     }
// //     if (!datetime) {
// //         throw new Error("datetime is required to fetch panchang");
// //     }

// //     const token = await getProkeralaToken();

// //     const params = new URLSearchParams({
// //         ayanamsa: String(ayanamsa),
// //         coordinates: `${lat},${lng}`,
// //         datetime,
// //     });
// //     const query = params.toString();
// //     const headers = { Authorization: `Bearer ${token}` };

// //     const callProkerala = async (url) => {
// //         const response = await fetch(`${url}?${query}`, { headers });
// //         const json = await response.json();
// //         if (!response.ok || json.status === "error") {
// //             throw new Error(
// //                 `Prokerala request failed (${url}): ${json.errors?.[0]?.detail || json.message || response.statusText}`
// //             );
// //         }
// //         return json;
// //     };

// //     // basic panchang is required; auspicious/inauspicious periods are treated
// //     // as best-effort (e.g. show empty Rahu Kalam rather than fail the whole page)
// //     const [panchangJson, auspiciousJson, inauspiciousJson] = await Promise.all([
// //         callProkerala(PROKERALA_PANCHANG_URL),
// //         callProkerala(PROKERALA_AUSPICIOUS_URL).catch(() => null),
// //         callProkerala(PROKERALA_INAUSPICIOUS_URL).catch(() => null),
// //     ]);

// //     const abhijitMuhurat = auspiciousJson
// //         ? findPeriod(auspiciousJson, ["Abhijit"])
// //         : undefined;
// //     const rahuKalam = inauspiciousJson
// //         ? findPeriod(inauspiciousJson, ["Rahu Kalam", "Rahu Kaal"])
// //         : undefined;

// //     return normalizePanchangResponse(panchangJson, rahuKalam, abhijitMuhurat);
// // }

// // module.exports = {
// //     getProkeralaToken,
// //     fetchPanchang,
// //     normalizePanchangResponse,
// // };


// /**
//  * Prokerala Panchang API integration.
//  *
//  * Env vars required (add to .env, do NOT touch any existing key):
//  *   PROKERALA_CLIENT_ID
//  *   PROKERALA_CLIENT_SECRET
//  *
//  * Docs: https://api.prokerala.com/  (Astrology API -> Panchang endpoint)
//  *
//  * NOTE: Prokerala's exact JSON field names have changed across API versions
//  * in the past, so `normalizePanchangResponse` is written defensively
//  * (multiple fallback keys). Once real credentials are added, log one raw
//  * response and adjust the fallback list below if any field comes back empty.
//  */

// const PROKERALA_TOKEN_URL = "https://api.prokerala.com/token";
// const PROKERALA_PANCHANG_URL = "https://api.prokerala.com/v2/astrology/panchang";
// // Rahu Kalam / Abhijit Muhurat are NOT part of the basic panchang response —
// // Prokerala serves them from these two separate endpoints (same auth/params).
// const PROKERALA_AUSPICIOUS_URL = "https://api.prokerala.com/v2/astrology/auspicious-period";
// const PROKERALA_INAUSPICIOUS_URL = "https://api.prokerala.com/v2/astrology/inauspicious-period";
// // Planetary positions table (Ascendant + 9 planets: Rashi, Longitude, Nakshatra, Pada)
// const PROKERALA_PLANET_POSITION_URL = "https://api.prokerala.com/v2/astrology/planet-position";

// // in-memory token cache (per server process)
// let cachedToken = null;
// let cachedTokenExpiry = 0; // epoch ms

// /**
//  * Fetches (and caches) an OAuth2 access token using client_credentials grant.
//  */
// async function getProkeralaToken() {
//     const now = Date.now();

//     if (cachedToken && now < cachedTokenExpiry - 30 * 1000) {
//         return cachedToken;
//     }

//     const clientId = process.env.PROKERALA_CLIENT_ID;
//     const clientSecret = process.env.PROKERALA_CLIENT_SECRET;

//     if (!clientId || !clientSecret) {
//         throw new Error(
//             "Prokerala API credentials missing. Set PROKERALA_CLIENT_ID and PROKERALA_CLIENT_SECRET in .env"
//         );
//     }

//     const body = new URLSearchParams({
//         grant_type: "client_credentials",
//         client_id: clientId,
//         client_secret: clientSecret,
//     });

//     const response = await fetch(PROKERALA_TOKEN_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body,
//     });

//     const data = await response.json();

//     if (!response.ok || !data.access_token) {
//         throw new Error(
//             `Prokerala auth failed: ${data.error_description || data.error || response.statusText}`
//         );
//     }

//     cachedToken = data.access_token;
//     cachedTokenExpiry = now + (data.expires_in ? data.expires_in * 1000 : 55 * 60 * 1000);

//     return cachedToken;
// }

// /**
//  * Picks the first defined value among several possible keys of an object.
//  */
// function pick(obj, keys) {
//     if (!obj) return undefined;
//     for (const key of keys) {
//         if (obj[key] !== undefined && obj[key] !== null) return obj[key];
//     }
//     return undefined;
// }

// /**
//  * Normalizes Prokerala's raw panchang response into our Panchang model shape.
//  */
// /**
//  * Finds a named period (e.g. "Rahu Kalam", "Abhijit Muhurat") inside a
//  * Prokerala auspicious/inauspicious-period response and returns {start, end}.
//  * Written defensively since Prokerala nests this list under slightly
//  * different keys across API versions.
//  */
// function findPeriod(periodResponse, names) {
//     const data = periodResponse?.data || periodResponse || {};
//     const list = data.muhurat || data.periods || data.period || [];

//     if (!Array.isArray(list)) return undefined;

//     const match = list.find((p) => names.some((n) => (p.name || "").toLowerCase().includes(n.toLowerCase())));
//     if (!match) return undefined;

//     // some responses nest the actual time range under a further "period" array
//     const range = Array.isArray(match.period) ? match.period[0] : match;
//     return {
//         start: range?.start,
//         end: range?.end,
//     };
// }

// /**
//  * Same idea as findPeriod(), but returns the FULL list of named periods
//  * instead of a single match — used to build the "Inauspicious Timings"
//  * section (Rahu Kaal, Yamaganda, Gulika Kaal, Kaalvela/Ardhayaam,
//  * Kantaka/Mrityu, etc.) without any extra API calls, since Prokerala's
//  * inauspicious-period endpoint already returns all of these together.
//  */
// function findAllPeriods(periodResponse) {
//     const data = periodResponse?.data || periodResponse || {};
//     const list = data.muhurat || data.periods || data.period || [];

//     if (!Array.isArray(list)) return [];

//     const result = [];
//     for (const p of list) {
//         if (!p.name) continue;
//         // some muhurats (e.g. "Dur Muhurat") occur twice a day and come back
//         // with 2 entries in their `period` array — capture ALL of them,
//         // not just the first
//         const periods = Array.isArray(p.period) && p.period.length ? p.period : [p];
//         periods.forEach((range, idx) => {
//             if (!range?.start || !range?.end) return;
//             result.push({
//                 name: periods.length > 1 ? `${p.name} (${idx + 1})` : p.name,
//                 start: range.start,
//                 end: range.end,
//             });
//         });
//     }
//     return result;
// }

// // 27 Nakshatras in order, each spanning 13°20' (13.3333...°) starting from
// // 0° Aries — used to derive a planet's Nakshatra/Pada from its longitude,
// // since Prokerala's planet-position endpoint only returns Rashi + degree.
// const NAKSHATRA_NAMES = [
//     "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
//     "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
//     "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
//     "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
//     "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
// ];
// const NAKSHATRA_SPAN = 360 / 27; // 13.3333...
// const PADA_SPAN = NAKSHATRA_SPAN / 4; // 3.3333...

// function getNakshatraAndPada(fullLongitude) {
//     if (typeof fullLongitude !== "number" || Number.isNaN(fullLongitude)) return {};
//     const normalized = ((fullLongitude % 360) + 360) % 360;
//     const nakshatraIndex = Math.floor(normalized / NAKSHATRA_SPAN);
//     const withinNakshatra = normalized - nakshatraIndex * NAKSHATRA_SPAN;
//     const pada = Math.floor(withinNakshatra / PADA_SPAN) + 1;
//     return { nakshatra: NAKSHATRA_NAMES[nakshatraIndex], pada };
// }

// // Converts a decimal degree (e.g. 16.319086...) into "16°19′09″" for display
// function formatDegreeDMS(decimalDegrees) {
//     if (typeof decimalDegrees !== "number" || Number.isNaN(decimalDegrees)) return undefined;
//     const degrees = Math.floor(decimalDegrees);
//     const minutesFull = (decimalDegrees - degrees) * 60;
//     const minutes = Math.floor(minutesFull);
//     const seconds = Math.round((minutesFull - minutes) * 60);
//     return `${degrees}\u00B0${minutes}\u2032${seconds}\u2033`;
// }

// /**
//  * Normalizes Prokerala's planet-position response into a flat array of
//  * { planet, rashi, longitude, nakshatra, pada } — written defensively
//  * (multiple fallback key names) since exact field names aren't confirmed
//  * until we see a real response with live credentials. If the shape turns
//  * out different, only this one function needs adjusting.
//  */
// function normalizePlanetPositions(raw) {
//     const data = raw?.data || raw || {};
//     const list = data.planet_position || data.planets || data.position || [];

//     if (!Array.isArray(list)) return [];

//     return list
//         .map((p) => {
//             const rashi = p.rasi || p.rashi || p.sign || {};
//             // `longitude` from Prokerala is the full 0-360° position (used for
//             // nakshatra/pada math); `degree` is the smaller within-sign value
//             // (0-30°) that's actually shown to users, e.g. "16°19'09"".
//             const fullLongitude = typeof p.longitude === "number" ? p.longitude : parseFloat(p.longitude);
//             const withinSignDegree = typeof p.degree === "number" ? p.degree : parseFloat(p.degree);
//             const { nakshatra, pada } = getNakshatraAndPada(fullLongitude);

//             return {
//                 planet: pick(p, ["name", "planet"]),
//                 rashi: typeof rashi === "string" ? rashi : pick(rashi, ["name"]),
//                 longitude: formatDegreeDMS(withinSignDegree) || formatDegreeDMS(fullLongitude),
//                 nakshatra,
//                 pada,
//             };
//         })
//         .filter((p) => p.planet);
// }

// /**
//  * Fetches the Planetary Positions table (Ascendant + 9 planets) for a
//  * given date/coordinates. Best-effort: returns [] on failure so the rest
//  * of the Panchang page still renders (same pattern as Rahu Kalam/Abhijit).
//  */
// async function fetchPlanetPositions({ lat, lng, datetime, ayanamsa = 1 }) {
//     const token = await getProkeralaToken();
//     const params = new URLSearchParams({
//         ayanamsa: String(ayanamsa),
//         coordinates: `${lat},${lng}`,
//         datetime,
//     });

//     const response = await fetch(`${PROKERALA_PLANET_POSITION_URL}?${params.toString()}`, {
//         headers: { Authorization: `Bearer ${token}` },
//     });
//     const json = await response.json();

//     if (!response.ok || json.status === "error") {
//         throw new Error(
//             `Prokerala planet-position request failed: ${json.errors?.[0]?.detail || json.message || response.statusText}`
//         );
//     }

//     return normalizePlanetPositions(json);
// }

// /**
//  * Approximate Shaka Samvat, Vikram Samvat & Kali Samvat year numbers for a
//  * Gregorian date. This is a simple, widely-used year-offset approximation
//  * (not tithi-exact) — good enough for display purposes. The Hindu calendar
//  * year rolls over around Chaitra (~March/April), which is why the
//  * offset shifts depending on the month.
//  */
// function calculateSamvat(date) {
//     const year = date.getFullYear();
//     const month = date.getMonth() + 1; // 1-12

//     // Vikram Samvat and Shaka Samvat both begin in Chaitra (~March/April).
//     // Before that point in the Gregorian year, we're still in the previous cycle.
//     const afterNewYear = month > 3 || (month === 3 && date.getDate() >= 22);

//     return {
//         vikramSamvat: afterNewYear ? year + 57 : year + 56,
//         shakaSamvat: afterNewYear ? year - 78 : year - 79,
//         kaliSamvat: afterNewYear ? year + 3102 : year + 3101,
//     };
// }

// function normalizePanchangResponse(
//     raw,
//     rahuKalam,
//     abhijitMuhurat,
//     inauspiciousPeriods,
//     samvat,
//     planetPositions
// ) {
//     const data = raw?.data || raw || {};

//     const tithiEntry = Array.isArray(data.tithi) ? data.tithi[0] : data.tithi;
//     const nakshatraEntry = Array.isArray(data.nakshatra) ? data.nakshatra[0] : data.nakshatra;
//     const yogaEntry = Array.isArray(data.yoga) ? data.yoga[0] : data.yoga;
//     const karanaEntry = Array.isArray(data.karana) ? data.karana[0] : data.karana;
//     // Moon sign (current Rashi transit). Two sources, tried in order:
//     //  1. Prokerala's basic panchang response — exact key not confirmed
//     //     against a live response yet, so this tries common candidates.
//     //  2. Fallback: the "Moon" row of the already-working Planetary
//     //     Positions table (planetPositions) gives its Rashi directly — this
//     //     is confirmed reliable, so it guarantees the card always has data
//     //     even if (1) never matches. No end-time from this source, only name.
//     const moonSignSource = data.chandra_rasi || data.moon_rasi || data.moonsign || data.moon_sign || data.rasi;
//     const moonSignEntry = Array.isArray(moonSignSource) ? moonSignSource[0] : moonSignSource;
//     const moonPlanetRow = (planetPositions || []).find((p) => (p.planet || "").toLowerCase() === "moon");
//     const moonSign = moonSignEntry
//         ? { name: pick(moonSignEntry, ["name"]), endTime: pick(moonSignEntry, ["end", "end_time"]) }
//         : moonPlanetRow?.rashi
//             ? { name: moonPlanetRow.rashi, endTime: undefined }
//             : undefined;

//     // The extra AstroSage-style fields below all come from the SAME basic
//     // panchang response already being fetched — no additional API calls.
//     // Exact Prokerala key names aren't confirmed against a live response
//     // yet, so each tries several common candidates defensively (same
//     // pattern as moonSign above). If any comes back empty once real
//     // credentials are wired up, log `raw` once and adjust the key list.
//     const ritu = pick(data, ["ritu", "season"]);

//     const lunarMonthSource = data.lunar_month || data.masa || data.month;
//     const lunarMonth = Array.isArray(lunarMonthSource) ? lunarMonthSource[0] : lunarMonthSource;
//     const monthPurnimanta = pick(lunarMonth, ["purnimanta", "purnimanta_name"]) || (typeof lunarMonth === "string" ? lunarMonth : undefined);
//     const monthAmanta = pick(lunarMonth, ["amanta", "amanta_name"]);

//     const dayDuration = pick(data, ["day_duration", "dinamana"]);
//     const samvatsaraName = pick(data, ["samvatsara_name", "samvatsara", "year_name"]);

//     const dishaShoola = pick(data, ["disha_shool", "disha_shoola", "dishashool"]);

//     const taraBalaSource = pick(data, ["tara_bala", "tarabala"]);
//     const taraBala = Array.isArray(taraBalaSource)
//         ? taraBalaSource.map((t) => (typeof t === "string" ? t : t?.name)).filter(Boolean)
//         : typeof taraBalaSource === "string"
//             ? taraBalaSource.split(",").map((s) => s.trim()).filter(Boolean)
//             : [];

//     const chandraBalaSource = pick(data, ["chandra_bala", "chandrabala"]);
//     const chandraBala = Array.isArray(chandraBalaSource)
//         ? chandraBalaSource.map((c) => (typeof c === "string" ? c : c?.name)).filter(Boolean)
//         : typeof chandraBalaSource === "string"
//             ? chandraBalaSource.split(",").map((s) => s.trim()).filter(Boolean)
//             : [];

//     return {
//         tithi: tithiEntry
//             ? {
//                 name: pick(tithiEntry, ["name"]),
//                 paksha: pick(tithiEntry, ["paksha"]),
//                 endTime: pick(tithiEntry, ["end", "end_time"]),
//             }
//             : undefined,
//         nakshatra: nakshatraEntry
//             ? {
//                 name: pick(nakshatraEntry, ["name"]),
//                 endTime: pick(nakshatraEntry, ["end", "end_time"]),
//             }
//             : undefined,
//         yoga: yogaEntry
//             ? {
//                 name: pick(yogaEntry, ["name"]),
//                 endTime: pick(yogaEntry, ["end", "end_time"]),
//             }
//             : undefined,
//         karana: karanaEntry
//             ? {
//                 name: pick(karanaEntry, ["name"]),
//                 endTime: pick(karanaEntry, ["end", "end_time"]),
//             }
//             : undefined,
//         moonSign: moonSign,
//         ritu: ritu,
//         monthPurnimanta: monthPurnimanta,
//         monthAmanta: monthAmanta,
//         dayDuration: dayDuration,
//         samvatsaraName: samvatsaraName,
//         dishaShoola: dishaShoola,
//         taraBala: taraBala,
//         chandraBala: chandraBala,
//         kaliSamvat: samvat?.kaliSamvat,
//         sunrise: pick(data, ["sunrise"]),
//         sunset: pick(data, ["sunset"]),
//         moonrise: pick(data, ["moonrise"]),
//         moonset: pick(data, ["moonset"]),
//         rahuKalam: rahuKalam,
//         abhijitMuhurat: abhijitMuhurat,
//         weekday: pick(data, ["vaara", "weekday", "day"]),
//         shakaSamvat: samvat?.shakaSamvat,
//         vikramSamvat: samvat?.vikramSamvat,
//         inauspiciousPeriods: inauspiciousPeriods || [],
//         planetaryPositions: planetPositions || [],
//         festivals: Array.isArray(data.vrat) || Array.isArray(data.festivals)
//             ? (data.vrat || data.festivals).map((f) => (typeof f === "string" ? f : f?.name)).filter(Boolean)
//             : [],
//         raw: raw,
//     };
// }

// /**
//  * Fetches Panchang for a given date + coordinates from Prokerala.
//  *
//  * @param {Object} params
//  * @param {number} params.lat
//  * @param {number} params.lng
//  * @param {string} params.datetime - ISO8601 datetime, e.g. 2026-09-02T06:00:00+05:30
//  * @param {number} [params.ayanamsa=1] - 1 = Lahiri (most common default)
//  */
// async function fetchPanchang({ lat, lng, datetime, ayanamsa = 1 }) {
//     if (lat === undefined || lng === undefined) {
//         throw new Error("lat and lng are required to fetch panchang");
//     }
//     if (!datetime) {
//         throw new Error("datetime is required to fetch panchang");
//     }

//     const token = await getProkeralaToken();

//     const params = new URLSearchParams({
//         ayanamsa: String(ayanamsa),
//         coordinates: `${lat},${lng}`,
//         datetime,
//     });
//     const query = params.toString();
//     const headers = { Authorization: `Bearer ${token}` };

//     const callProkerala = async (url) => {
//         const response = await fetch(`${url}?${query}`, { headers });
//         const json = await response.json();
//         if (!response.ok || json.status === "error") {
//             throw new Error(
//                 `Prokerala request failed (${url}): ${json.errors?.[0]?.detail || json.message || response.statusText}`
//             );
//         }
//         return json;
//     };

//     // basic panchang is required; auspicious/inauspicious periods and planet
//     // positions are treated as best-effort (show empty section rather than
//     // fail the whole page if any one of them errors out)
//     const [panchangJson, auspiciousJson, inauspiciousJson, planetPositionJson] = await Promise.all([
//         callProkerala(PROKERALA_PANCHANG_URL),
//         callProkerala(PROKERALA_AUSPICIOUS_URL).catch(() => null),
//         callProkerala(PROKERALA_INAUSPICIOUS_URL).catch(() => null),
//         callProkerala(PROKERALA_PLANET_POSITION_URL).catch(() => null),
//     ]);

//     const abhijitMuhurat = auspiciousJson
//         ? findPeriod(auspiciousJson, ["Abhijit"])
//         : undefined;
//     const rahuKalam = inauspiciousJson
//         ? findPeriod(inauspiciousJson, ["Rahu Kalam", "Rahu Kaal", "Rahu"])
//         : undefined;
//     // Full inauspicious list (Rahu Kaal, Yamaganda, Gulika Kaal,
//     // Kaalvela/Ardhayaam, Kantaka/Mrityu, etc.) — same response, no extra call
//     const inauspiciousPeriods = inauspiciousJson ? findAllPeriods(inauspiciousJson) : [];
//     const planetPositions = planetPositionJson ? normalizePlanetPositions(planetPositionJson) : [];
//     const samvat = calculateSamvat(new Date(datetime));

//     return normalizePanchangResponse(
//         panchangJson,
//         rahuKalam,
//         abhijitMuhurat,
//         inauspiciousPeriods,
//         samvat,
//         planetPositions
//     );
// }

// module.exports = {
//     getProkeralaToken,
//     fetchPanchang,
//     normalizePanchangResponse,
//     findPeriod,
//     findAllPeriods,
//     calculateSamvat,
//     fetchPlanetPositions,
//     normalizePlanetPositions,
// };


// /**
//  * Prokerala Panchang API integration.
//  *
//  * Env vars required (add to .env, do NOT touch any existing key):
//  *   PROKERALA_CLIENT_ID
//  *   PROKERALA_CLIENT_SECRET
//  *
//  * Docs: https://api.prokerala.com/  (Astrology API -> Panchang endpoint)
//  *
//  * NOTE: Prokerala's exact JSON field names have changed across API versions
//  * in the past, so `normalizePanchangResponse` is written defensively
//  * (multiple fallback keys). Once real credentials are added, log one raw
//  * response and adjust the fallback list below if any field comes back empty.
//  */

// const PROKERALA_TOKEN_URL = "https://api.prokerala.com/token";
// const PROKERALA_PANCHANG_URL = "https://api.prokerala.com/v2/astrology/panchang";
// // Rahu Kalam / Abhijit Muhurat are NOT part of the basic panchang response —
// // Prokerala serves them from these two separate endpoints (same auth/params).
// const PROKERALA_AUSPICIOUS_URL = "https://api.prokerala.com/v2/astrology/auspicious-period";
// const PROKERALA_INAUSPICIOUS_URL = "https://api.prokerala.com/v2/astrology/inauspicious-period";

// // in-memory token cache (per server process)
// let cachedToken = null;
// let cachedTokenExpiry = 0; // epoch ms

// /**
//  * Fetches (and caches) an OAuth2 access token using client_credentials grant.
//  */
// async function getProkeralaToken() {
//     const now = Date.now();

//     if (cachedToken && now < cachedTokenExpiry - 30 * 1000) {
//         return cachedToken;
//     }

//     const clientId = process.env.PROKERALA_CLIENT_ID;
//     const clientSecret = process.env.PROKERALA_CLIENT_SECRET;

//     if (!clientId || !clientSecret) {
//         throw new Error(
//             "Prokerala API credentials missing. Set PROKERALA_CLIENT_ID and PROKERALA_CLIENT_SECRET in .env"
//         );
//     }

//     const body = new URLSearchParams({
//         grant_type: "client_credentials",
//         client_id: clientId,
//         client_secret: clientSecret,
//     });

//     const response = await fetch(PROKERALA_TOKEN_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body,
//     });

//     const data = await response.json();

//     if (!response.ok || !data.access_token) {
//         throw new Error(
//             `Prokerala auth failed: ${data.error_description || data.error || response.statusText}`
//         );
//     }

//     cachedToken = data.access_token;
//     cachedTokenExpiry = now + (data.expires_in ? data.expires_in * 1000 : 55 * 60 * 1000);

//     return cachedToken;
// }

// /**
//  * Picks the first defined value among several possible keys of an object.
//  */
// function pick(obj, keys) {
//     if (!obj) return undefined;
//     for (const key of keys) {
//         if (obj[key] !== undefined && obj[key] !== null) return obj[key];
//     }
//     return undefined;
// }

// /**
//  * Normalizes Prokerala's raw panchang response into our Panchang model shape.
//  */
// /**
//  * Finds a named period (e.g. "Rahu Kalam", "Abhijit Muhurat") inside a
//  * Prokerala auspicious/inauspicious-period response and returns {start, end}.
//  * Written defensively since Prokerala nests this list under slightly
//  * different keys across API versions.
//  */
// function findPeriod(periodResponse, names) {
//     const data = periodResponse?.data || periodResponse || {};
//     const list = data.muhurat || data.periods || data.period || [];

//     if (!Array.isArray(list)) return undefined;

//     const match = list.find((p) => names.some((n) => (p.name || "").toLowerCase().includes(n.toLowerCase())));
//     if (!match) return undefined;

//     // some responses nest the actual time range under a further "period" array
//     const range = Array.isArray(match.period) ? match.period[0] : match;
//     return {
//         start: range?.start,
//         end: range?.end,
//     };
// }

// function normalizePanchangResponse(raw, rahuKalam, abhijitMuhurat) {
//     const data = raw?.data || raw || {};

//     const tithiEntry = Array.isArray(data.tithi) ? data.tithi[0] : data.tithi;
//     const nakshatraEntry = Array.isArray(data.nakshatra) ? data.nakshatra[0] : data.nakshatra;
//     const yogaEntry = Array.isArray(data.yoga) ? data.yoga[0] : data.yoga;
//     const karanaEntry = Array.isArray(data.karana) ? data.karana[0] : data.karana;

//     return {
//         tithi: tithiEntry
//             ? {
//                 name: pick(tithiEntry, ["name"]),
//                 paksha: pick(tithiEntry, ["paksha"]),
//                 endTime: pick(tithiEntry, ["end", "end_time"]),
//             }
//             : undefined,
//         nakshatra: nakshatraEntry
//             ? {
//                 name: pick(nakshatraEntry, ["name"]),
//                 endTime: pick(nakshatraEntry, ["end", "end_time"]),
//             }
//             : undefined,
//         yoga: yogaEntry
//             ? {
//                 name: pick(yogaEntry, ["name"]),
//                 endTime: pick(yogaEntry, ["end", "end_time"]),
//             }
//             : undefined,
//         karana: karanaEntry
//             ? {
//                 name: pick(karanaEntry, ["name"]),
//                 endTime: pick(karanaEntry, ["end", "end_time"]),
//             }
//             : undefined,
//         sunrise: pick(data, ["sunrise"]),
//         sunset: pick(data, ["sunset"]),
//         moonrise: pick(data, ["moonrise"]),
//         moonset: pick(data, ["moonset"]),
//         rahuKalam: rahuKalam,
//         abhijitMuhurat: abhijitMuhurat,
//         festivals: Array.isArray(data.vrat) || Array.isArray(data.festivals)
//             ? (data.vrat || data.festivals).map((f) => (typeof f === "string" ? f : f?.name)).filter(Boolean)
//             : [],
//         raw: raw,
//     };
// }

// /**
//  * Fetches Panchang for a given date + coordinates from Prokerala.
//  *
//  * @param {Object} params
//  * @param {number} params.lat
//  * @param {number} params.lng
//  * @param {string} params.datetime - ISO8601 datetime, e.g. 2026-09-02T06:00:00+05:30
//  * @param {number} [params.ayanamsa=1] - 1 = Lahiri (most common default)
//  */
// async function fetchPanchang({ lat, lng, datetime, ayanamsa = 1 }) {
//     if (lat === undefined || lng === undefined) {
//         throw new Error("lat and lng are required to fetch panchang");
//     }
//     if (!datetime) {
//         throw new Error("datetime is required to fetch panchang");
//     }

//     const token = await getProkeralaToken();

//     const params = new URLSearchParams({
//         ayanamsa: String(ayanamsa),
//         coordinates: `${lat},${lng}`,
//         datetime,
//     });
//     const query = params.toString();
//     const headers = { Authorization: `Bearer ${token}` };

//     const callProkerala = async (url) => {
//         const response = await fetch(`${url}?${query}`, { headers });
//         const json = await response.json();
//         if (!response.ok || json.status === "error") {
//             throw new Error(
//                 `Prokerala request failed (${url}): ${json.errors?.[0]?.detail || json.message || response.statusText}`
//             );
//         }
//         return json;
//     };

//     // basic panchang is required; auspicious/inauspicious periods are treated
//     // as best-effort (e.g. show empty Rahu Kalam rather than fail the whole page)
//     const [panchangJson, auspiciousJson, inauspiciousJson] = await Promise.all([
//         callProkerala(PROKERALA_PANCHANG_URL),
//         callProkerala(PROKERALA_AUSPICIOUS_URL).catch(() => null),
//         callProkerala(PROKERALA_INAUSPICIOUS_URL).catch(() => null),
//     ]);

//     const abhijitMuhurat = auspiciousJson
//         ? findPeriod(auspiciousJson, ["Abhijit"])
//         : undefined;
//     const rahuKalam = inauspiciousJson
//         ? findPeriod(inauspiciousJson, ["Rahu Kalam", "Rahu Kaal"])
//         : undefined;

//     return normalizePanchangResponse(panchangJson, rahuKalam, abhijitMuhurat);
// }

// module.exports = {
//     getProkeralaToken,
//     fetchPanchang,
//     normalizePanchangResponse,
// };


/**
 * Prokerala Panchang API integration.
 *
 * Env vars required (add to .env, do NOT touch any existing key):
 *   PROKERALA_CLIENT_ID
 *   PROKERALA_CLIENT_SECRET
 *
 * Docs: https://api.prokerala.com/  (Astrology API -> Panchang endpoint)
 *
 * NOTE: Prokerala's exact JSON field names have changed across API versions
 * in the past, so `normalizePanchangResponse` is written defensively
 * (multiple fallback keys). Once real credentials are added, log one raw
 * response and adjust the fallback list below if any field comes back empty.
 */

const PROKERALA_TOKEN_URL = "https://api.prokerala.com/token";
const PROKERALA_PANCHANG_URL = "https://api.prokerala.com/v2/astrology/panchang";
// Rahu Kalam / Abhijit Muhurat are NOT part of the basic panchang response —
// Prokerala serves them from these two separate endpoints (same auth/params).
const PROKERALA_AUSPICIOUS_URL = "https://api.prokerala.com/v2/astrology/auspicious-period";
const PROKERALA_INAUSPICIOUS_URL = "https://api.prokerala.com/v2/astrology/inauspicious-period";
// Planetary positions table (Ascendant + 9 planets: Rashi, Longitude, Nakshatra, Pada)
const PROKERALA_PLANET_POSITION_URL = "https://api.prokerala.com/v2/astrology/planet-position";

// Astronomical fallback for the retrograde flag when Prokerala's response
// doesn't carry a usable field for a given planet — see
// normalizePlanetPositions() below.
const planetTransitUtil = require("./planetary-transit-util");

// in-memory token cache (per server process)
let cachedToken = null;
let cachedTokenExpiry = 0; // epoch ms

/**
 * Fetches (and caches) an OAuth2 access token using client_credentials grant.
 */
async function getProkeralaToken() {
    const now = Date.now();

    if (cachedToken && now < cachedTokenExpiry - 30 * 1000) {
        return cachedToken;
    }

    const clientId = process.env.PROKERALA_CLIENT_ID;
    const clientSecret = process.env.PROKERALA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error(
            "Prokerala API credentials missing. Set PROKERALA_CLIENT_ID and PROKERALA_CLIENT_SECRET in .env"
        );
    }

    const body = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
    });

    const response = await fetch(PROKERALA_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
        throw new Error(
            `Prokerala auth failed: ${data.error_description || data.error || response.statusText}`
        );
    }

    cachedToken = data.access_token;
    cachedTokenExpiry = now + (data.expires_in ? data.expires_in * 1000 : 55 * 60 * 1000);

    return cachedToken;
}

/**
 * Picks the first defined value among several possible keys of an object.
 */
function pick(obj, keys) {
    if (!obj) return undefined;
    for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null) return obj[key];
    }
    return undefined;
}

/**
 * Normalizes Prokerala's raw panchang response into our Panchang model shape.
 */
/**
 * Finds a named period (e.g. "Rahu Kalam", "Abhijit Muhurat") inside a
 * Prokerala auspicious/inauspicious-period response and returns {start, end}.
 * Written defensively since Prokerala nests this list under slightly
 * different keys across API versions.
 */
function findPeriod(periodResponse, names) {
    const data = periodResponse?.data || periodResponse || {};
    const list = data.muhurat || data.periods || data.period || [];

    if (!Array.isArray(list)) return undefined;

    const match = list.find((p) => names.some((n) => (p.name || "").toLowerCase().includes(n.toLowerCase())));
    if (!match) return undefined;

    // some responses nest the actual time range under a further "period" array
    const range = Array.isArray(match.period) ? match.period[0] : match;
    return {
        start: range?.start,
        end: range?.end,
    };
}

/**
 * Same idea as findPeriod(), but returns the FULL list of named periods
 * instead of a single match — used to build the "Inauspicious Timings"
 * section (Rahu Kaal, Yamaganda, Gulika Kaal, Kaalvela/Ardhayaam,
 * Kantaka/Mrityu, etc.) without any extra API calls, since Prokerala's
 * inauspicious-period endpoint already returns all of these together.
 */
function findAllPeriods(periodResponse) {
    const data = periodResponse?.data || periodResponse || {};
    const list = data.muhurat || data.periods || data.period || [];

    if (!Array.isArray(list)) return [];

    const result = [];
    for (const p of list) {
        if (!p.name) continue;
        // some muhurats (e.g. "Dur Muhurat") occur twice a day and come back
        // with 2 entries in their `period` array — capture ALL of them,
        // not just the first
        const periods = Array.isArray(p.period) && p.period.length ? p.period : [p];
        periods.forEach((range, idx) => {
            if (!range?.start || !range?.end) return;
            result.push({
                name: periods.length > 1 ? `${p.name} (${idx + 1})` : p.name,
                start: range.start,
                end: range.end,
            });
        });
    }
    return result;
}

// 27 Nakshatras in order, each spanning 13°20' (13.3333...°) starting from
// 0° Aries — used to derive a planet's Nakshatra/Pada from its longitude,
// since Prokerala's planet-position endpoint only returns Rashi + degree.
const NAKSHATRA_NAMES = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];
const NAKSHATRA_SPAN = 360 / 27; // 13.3333...
const PADA_SPAN = NAKSHATRA_SPAN / 4; // 3.3333...

function getNakshatraAndPada(fullLongitude) {
    if (typeof fullLongitude !== "number" || Number.isNaN(fullLongitude)) return {};
    const normalized = ((fullLongitude % 360) + 360) % 360;
    const nakshatraIndex = Math.floor(normalized / NAKSHATRA_SPAN);
    const withinNakshatra = normalized - nakshatraIndex * NAKSHATRA_SPAN;
    const pada = Math.floor(withinNakshatra / PADA_SPAN) + 1;
    return { nakshatra: NAKSHATRA_NAMES[nakshatraIndex], pada };
}

// Converts a decimal degree (e.g. 16.319086...) into "16°19′09″" for display
function formatDegreeDMS(decimalDegrees) {
    if (typeof decimalDegrees !== "number" || Number.isNaN(decimalDegrees)) return undefined;
    const degrees = Math.floor(decimalDegrees);
    const minutesFull = (decimalDegrees - degrees) * 60;
    const minutes = Math.floor(minutesFull);
    const seconds = Math.round((minutesFull - minutes) * 60);
    return `${degrees}\u00B0${minutes}\u2032${seconds}\u2033`;
}

/**
 * Normalizes Prokerala's planet-position response into a flat array of
 * { planet, rashi, longitude, nakshatra, pada } — written defensively
 * (multiple fallback key names) since exact field names aren't confirmed
 * until we see a real response with live credentials. If the shape turns
 * out different, only this one function needs adjusting.
 */
function normalizePlanetPositions(raw, datetime) {
    const data = raw?.data || raw || {};
    const list = data.planet_position || data.planets || data.position || [];

    if (!Array.isArray(list)) return [];

    // Reference instant for the astronomical retrograde fallback below —
    // same datetime this whole Panchang fetch was requested for. Falls
    // back to "now" only if datetime wasn't passed in (shouldn't happen
    // via fetchPanchang, kept defensive since this is also unit-testable
    // on its own).
    const referenceDate = datetime ? new Date(datetime) : new Date();

    return list
        .map((p) => {
            const rashi = p.rasi || p.rashi || p.sign || {};
            // `longitude` from Prokerala is the full 0-360° position (used for
            // nakshatra/pada math); `degree` is the smaller within-sign value
            // (0-30°) that's actually shown to users, e.g. "16°19'09"".
            const fullLongitude = typeof p.longitude === "number" ? p.longitude : parseFloat(p.longitude);
            const withinSignDegree = typeof p.degree === "number" ? p.degree : parseFloat(p.degree);
            const { nakshatra, pada } = getNakshatraAndPada(fullLongitude);
            const planetName = pick(p, ["name", "planet"]);

            // Retrograde: prefer whatever Prokerala actually sends (field name
            // isn't confirmed until a live response is inspected — see the
            // verification report — so several possible keys/shapes are
            // checked defensively). If none of them are present/usable, fall
            // back to the astronomical delta-longitude check, which never
            // needs an API field to begin with.
            const rawRetrograde = pick(p, ["is_retrograde", "retrograde"]);
            const motion = typeof p.motion === "string" ? p.motion.toLowerCase() : undefined;
            const speed = typeof p.speed === "number" ? p.speed : parseFloat(p.speed);
            let retrogradeFromApi;
            if (typeof rawRetrograde === "boolean") {
                retrogradeFromApi = rawRetrograde;
            } else if (typeof rawRetrograde === "string") {
                retrogradeFromApi = rawRetrograde.toLowerCase() === "true" || rawRetrograde.toLowerCase() === "r";
            } else if (motion) {
                retrogradeFromApi = motion.includes("retro");
            } else if (typeof speed === "number" && !Number.isNaN(speed)) {
                retrogradeFromApi = speed < 0;
            }

            let isRetrogradeFlag = retrogradeFromApi;
            if (isRetrogradeFlag === undefined && planetName && planetTransitUtil.ALL_PLANETS.includes(planetName)) {
                try {
                    isRetrogradeFlag = planetTransitUtil.isRetrograde(planetName, referenceDate);
                } catch (err) {
                    // best-effort — leave undefined rather than fail the whole
                    // Panchang fetch over a single planet's retrograde flag
                    isRetrogradeFlag = undefined;
                }
            }

            return {
                planet: planetName,
                rashi: typeof rashi === "string" ? rashi : pick(rashi, ["name"]),
                longitude: formatDegreeDMS(withinSignDegree) || formatDegreeDMS(fullLongitude),
                // Full 0-360° longitude kept as a plain number (not just the
                // display string above) so the rule engine can do real angular
                // maths on it — e.g. Guru/Shukra Asta (combustion) for Vivah,
                // which needs the actual angular separation from the Sun.
                longitudeDegrees: typeof fullLongitude === "number" && !Number.isNaN(fullLongitude) ? fullLongitude : undefined,
                nakshatra,
                pada,
                isRetrograde: isRetrogradeFlag,
            };
        })
        .filter((p) => p.planet);
}

/**
 * Fetches the Planetary Positions table (Ascendant + 9 planets) for a
 * given date/coordinates. Best-effort: returns [] on failure so the rest
 * of the Panchang page still renders (same pattern as Rahu Kalam/Abhijit).
 */
async function fetchPlanetPositions({ lat, lng, datetime, ayanamsa = 1 }) {
    const token = await getProkeralaToken();
    const params = new URLSearchParams({
        ayanamsa: String(ayanamsa),
        coordinates: `${lat},${lng}`,
        datetime,
    });

    const response = await fetch(`${PROKERALA_PLANET_POSITION_URL}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const json = await response.json();

    if (!response.ok || json.status === "error") {
        throw new Error(
            `Prokerala planet-position request failed: ${json.errors?.[0]?.detail || json.message || response.statusText}`
        );
    }

    return normalizePlanetPositions(json);
}

/**
 * Approximate Shaka Samvat, Vikram Samvat & Kali Samvat year numbers for a
 * Gregorian date. This is a simple, widely-used year-offset approximation
 * (not tithi-exact) — good enough for display purposes. The Hindu calendar
 * year rolls over around Chaitra (~March/April), which is why the
 * offset shifts depending on the month.
 */
function calculateSamvat(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-12

    // Vikram Samvat and Shaka Samvat both begin in Chaitra (~March/April).
    // Before that point in the Gregorian year, we're still in the previous cycle.
    const afterNewYear = month > 3 || (month === 3 && date.getDate() >= 22);

    return {
        vikramSamvat: afterNewYear ? year + 57 : year + 56,
        shakaSamvat: afterNewYear ? year - 78 : year - 79,
        kaliSamvat: afterNewYear ? year + 3102 : year + 3101,
    };
}

function normalizePanchangResponse(
    raw,
    rahuKalam,
    abhijitMuhurat,
    inauspiciousPeriods,
    samvat,
    planetPositions
) {
    const data = raw?.data || raw || {};

    const tithiEntry = Array.isArray(data.tithi) ? data.tithi[0] : data.tithi;
    const nakshatraEntry = Array.isArray(data.nakshatra) ? data.nakshatra[0] : data.nakshatra;
    const yogaEntry = Array.isArray(data.yoga) ? data.yoga[0] : data.yoga;
    const karanaEntry = Array.isArray(data.karana) ? data.karana[0] : data.karana;
    // Moon sign (current Rashi transit). Two sources, tried in order:
    //  1. Prokerala's basic panchang response — exact key not confirmed
    //     against a live response yet, so this tries common candidates.
    //  2. Fallback: the "Moon" row of the already-working Planetary
    //     Positions table (planetPositions) gives its Rashi directly — this
    //     is confirmed reliable, so it guarantees the card always has data
    //     even if (1) never matches. No end-time from this source, only name.
    const moonSignSource = data.chandra_rasi || data.moon_rasi || data.moonsign || data.moon_sign || data.rasi;
    const moonSignEntry = Array.isArray(moonSignSource) ? moonSignSource[0] : moonSignSource;
    const moonPlanetRow = (planetPositions || []).find((p) => (p.planet || "").toLowerCase() === "moon");
    const moonSign = moonSignEntry
        ? { name: pick(moonSignEntry, ["name"]), endTime: pick(moonSignEntry, ["end", "end_time"]) }
        : moonPlanetRow?.rashi
            ? { name: moonPlanetRow.rashi, endTime: undefined }
            : undefined;

    // The extra AstroSage-style fields below all come from the SAME basic
    // panchang response already being fetched — no additional API calls.
    // Exact Prokerala key names aren't confirmed against a live response
    // yet, so each tries several common candidates defensively (same
    // pattern as moonSign above). If any comes back empty once real
    // credentials are wired up, log `raw` once and adjust the key list.
    const ritu = pick(data, ["ritu", "season"]);

    const lunarMonthSource = data.lunar_month || data.masa || data.month;
    const lunarMonth = Array.isArray(lunarMonthSource) ? lunarMonthSource[0] : lunarMonthSource;
    const monthPurnimanta = pick(lunarMonth, ["purnimanta", "purnimanta_name"]) || (typeof lunarMonth === "string" ? lunarMonth : undefined);
    const monthAmanta = pick(lunarMonth, ["amanta", "amanta_name"]);

    const dayDuration = pick(data, ["day_duration", "dinamana"]);
    const samvatsaraName = pick(data, ["samvatsara_name", "samvatsara", "year_name"]);

    const dishaShoola = pick(data, ["disha_shool", "disha_shoola", "dishashool"]);

    const taraBalaSource = pick(data, ["tara_bala", "tarabala"]);
    const taraBala = Array.isArray(taraBalaSource)
        ? taraBalaSource.map((t) => (typeof t === "string" ? t : t?.name)).filter(Boolean)
        : typeof taraBalaSource === "string"
            ? taraBalaSource.split(",").map((s) => s.trim()).filter(Boolean)
            : [];

    const chandraBalaSource = pick(data, ["chandra_bala", "chandrabala"]);
    const chandraBala = Array.isArray(chandraBalaSource)
        ? chandraBalaSource.map((c) => (typeof c === "string" ? c : c?.name)).filter(Boolean)
        : typeof chandraBalaSource === "string"
            ? chandraBalaSource.split(",").map((s) => s.trim()).filter(Boolean)
            : [];

    return {
        tithi: tithiEntry
            ? {
                name: pick(tithiEntry, ["name"]),
                paksha: pick(tithiEntry, ["paksha"]),
                endTime: pick(tithiEntry, ["end", "end_time"]),
            }
            : undefined,
        nakshatra: nakshatraEntry
            ? {
                name: pick(nakshatraEntry, ["name"]),
                endTime: pick(nakshatraEntry, ["end", "end_time"]),
            }
            : undefined,
        yoga: yogaEntry
            ? {
                name: pick(yogaEntry, ["name"]),
                endTime: pick(yogaEntry, ["end", "end_time"]),
            }
            : undefined,
        karana: karanaEntry
            ? {
                name: pick(karanaEntry, ["name"]),
                endTime: pick(karanaEntry, ["end", "end_time"]),
            }
            : undefined,
        moonSign: moonSign,
        ritu: ritu,
        monthPurnimanta: monthPurnimanta,
        monthAmanta: monthAmanta,
        dayDuration: dayDuration,
        samvatsaraName: samvatsaraName,
        dishaShoola: dishaShoola,
        taraBala: taraBala,
        chandraBala: chandraBala,
        kaliSamvat: samvat?.kaliSamvat,
        sunrise: pick(data, ["sunrise"]),
        sunset: pick(data, ["sunset"]),
        moonrise: pick(data, ["moonrise"]),
        moonset: pick(data, ["moonset"]),
        rahuKalam: rahuKalam,
        abhijitMuhurat: abhijitMuhurat,
        weekday: pick(data, ["vaara", "weekday", "day"]),
        shakaSamvat: samvat?.shakaSamvat,
        vikramSamvat: samvat?.vikramSamvat,
        inauspiciousPeriods: inauspiciousPeriods || [],
        planetaryPositions: planetPositions || [],
        festivals: Array.isArray(data.vrat) || Array.isArray(data.festivals)
            ? (data.vrat || data.festivals).map((f) => (typeof f === "string" ? f : f?.name)).filter(Boolean)
            : [],
        raw: raw,
    };
}

/**
 * Fetches Panchang for a given date + coordinates from Prokerala.
 *
 * @param {Object} params
 * @param {number} params.lat
 * @param {number} params.lng
 * @param {string} params.datetime - ISO8601 datetime, e.g. 2026-09-02T06:00:00+05:30
 * @param {number} [params.ayanamsa=1] - 1 = Lahiri (most common default)
 */
async function fetchPanchang({ lat, lng, datetime, ayanamsa = 1 }) {
    if (lat === undefined || lng === undefined) {
        throw new Error("lat and lng are required to fetch panchang");
    }
    if (!datetime) {
        throw new Error("datetime is required to fetch panchang");
    }

    const token = await getProkeralaToken();

    const params = new URLSearchParams({
        ayanamsa: String(ayanamsa),
        coordinates: `${lat},${lng}`,
        datetime,
    });
    const query = params.toString();
    const headers = { Authorization: `Bearer ${token}` };

    const callProkerala = async (url) => {
        const response = await fetch(`${url}?${query}`, { headers });
        const json = await response.json();
        if (!response.ok || json.status === "error") {
            throw new Error(
                `Prokerala request failed (${url}): ${json.errors?.[0]?.detail || json.message || response.statusText}`
            );
        }
        return json;
    };

    // basic panchang is required; auspicious/inauspicious periods and planet
    // positions are treated as best-effort (show empty section rather than
    // fail the whole page if any one of them errors out)
    const [panchangJson, auspiciousJson, inauspiciousJson, planetPositionJson] = await Promise.all([
        callProkerala(PROKERALA_PANCHANG_URL),
        callProkerala(PROKERALA_AUSPICIOUS_URL).catch(() => null),
        callProkerala(PROKERALA_INAUSPICIOUS_URL).catch(() => null),
        callProkerala(PROKERALA_PLANET_POSITION_URL).catch(() => null),
    ]);

    // TEMP DEBUG — remove once Ritu/Disha Shoola/Tara Bala/Chandra Bala/
    // Hindu Month field-names are confirmed against a real response.
    console.log('RAW PANCHANG RESPONSE:', JSON.stringify(panchangJson, null, 2));

    const abhijitMuhurat = auspiciousJson
        ? findPeriod(auspiciousJson, ["Abhijit"])
        : undefined;
    const rahuKalam = inauspiciousJson
        ? findPeriod(inauspiciousJson, ["Rahu Kalam", "Rahu Kaal", "Rahu"])
        : undefined;
    // Full inauspicious list (Rahu Kaal, Yamaganda, Gulika Kaal,
    // Kaalvela/Ardhayaam, Kantaka/Mrityu, etc.) — same response, no extra call
    const inauspiciousPeriods = inauspiciousJson ? findAllPeriods(inauspiciousJson) : [];
    const planetPositions = planetPositionJson ? normalizePlanetPositions(planetPositionJson, datetime) : [];
    const samvat = calculateSamvat(new Date(datetime));

    return normalizePanchangResponse(
        panchangJson,
        rahuKalam,
        abhijitMuhurat,
        inauspiciousPeriods,
        samvat,
        planetPositions
    );
}

/**
 * Lightweight version of fetchPanchang() — calls ONLY the basic panchang
 * endpoint (skips auspicious-period, inauspicious-period and
 * planet-position, which fetchPanchang() also fetches). Used by the month
 * calendar grid, which only needs the Tithi/festival name per day, not the
 * full Muhurat breakdown — this keeps a 30-day month view to ~30 API
 * credits instead of ~120.
 */
async function fetchPanchangOnly({ lat, lng, datetime, ayanamsa = 1 }) {
    if (lat === undefined || lng === undefined) {
        throw new Error("lat and lng are required to fetch panchang");
    }
    if (!datetime) {
        throw new Error("datetime is required to fetch panchang");
    }

    const token = await getProkeralaToken();

    const params = new URLSearchParams({
        ayanamsa: String(ayanamsa),
        coordinates: `${lat},${lng}`,
        datetime,
    });

    const response = await fetch(`${PROKERALA_PANCHANG_URL}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const json = await response.json();

    if (!response.ok || json.status === "error") {
        throw new Error(
            `Prokerala request failed (${PROKERALA_PANCHANG_URL}): ${json.errors?.[0]?.detail || json.message || response.statusText}`
        );
    }

    const samvat = calculateSamvat(new Date(datetime));
    // rahuKalam/abhijitMuhurat/inauspiciousPeriods/planetPositions intentionally
    // left undefined — this is the cheap, grid-only variant
    return normalizePanchangResponse(json, undefined, undefined, undefined, samvat, undefined);
}

module.exports = {
    getProkeralaToken,
    fetchPanchang,
    fetchPanchangOnly,
    normalizePanchangResponse,
    findPeriod,
    findAllPeriods,
    calculateSamvat,
    fetchPlanetPositions,
    normalizePlanetPositions,
};