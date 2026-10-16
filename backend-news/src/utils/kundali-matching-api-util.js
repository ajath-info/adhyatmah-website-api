// /**
//  * Prokerala Kundli Matching (Ashtakoot Guna Milan) API integration.
//  *
//  * Uses the SAME Prokerala account/credentials as panchang-api-util.js /
//  * kundali-api-util.js (PROKERALA_CLIENT_ID / PROKERALA_CLIENT_SECRET —
//  * already set in .env, nothing new to add there). Reuses the shared token
//  * cache via getProkeralaToken from panchang-api-util instead of duplicating
//  * it, so all three modules stay on one token.
//  *
//  * Docs: https://api.prokerala.com/ (Astrology API -> Kundli Matching)
//  *
//  * Field mapping below is based on Prokerala's official PHP SDK response
//  * shape (girl_info/boy_info with koot+nakshatra+rasi, guna_milan.guna[],
//  * message, girl_mangal_dosha_details/boy_mangal_dosha_details) — see
//  * https://github.com/prokerala/astrology-sdk/blob/master/kundli-matching.php
//  * — written defensively (multiple fallback keys) same as the rest of this
//  * codebase, since the raw REST JSON key casing can differ slightly from
//  * the SDK's getter names. Once live credentials hit this, log one raw
//  * response and adjust the fallback list below if any field comes back
//  * empty.
//  */

// const { getProkeralaToken } = require("./panchang-api-util");

// const PROKERALA_KUNDLI_MATCHING_URL = "https://api.prokerala.com/v2/astrology/kundli-matching";

// function pick(obj, keys) {
//     if (!obj) return undefined;
//     for (const key of keys) {
//         if (obj[key] !== undefined && obj[key] !== null) return obj[key];
//     }
//     return undefined;
// }

// // The 8 Ashtakoot factors (36 points total), in the standard display order
// // used on report pages like astrotalk.com/matchmaking. `altKeys` covers
// // the different spellings Prokerala's per-person koot map might use for
// // the same factor (e.g. "grahaMaitri" vs "graha_maitri" vs "maitri").
// const KOOT_KEYS = [
//     { key: "varna", label: "Varna", subtitle: "Work", maxPoints: 1, altKeys: ["varna"] },
//     { key: "vashya", label: "Vashya", subtitle: "Dominance", maxPoints: 2, altKeys: ["vashya", "vasya"] },
//     { key: "tara", label: "Tara", subtitle: "Destiny", maxPoints: 3, altKeys: ["tara"] },
//     { key: "yoni", label: "Yoni", subtitle: "Mentality", maxPoints: 4, altKeys: ["yoni"] },
//     {
//         key: "graha_maitri",
//         label: "Graha Maitri",
//         subtitle: "Mental Compatibility",
//         maxPoints: 5,
//         altKeys: ["graha_maitri", "grahaMaitri", "maitri"],
//     },
//     { key: "gana", label: "Gana", subtitle: "Temperament", maxPoints: 6, altKeys: ["gana", "gan"] },
//     { key: "bhakoot", label: "Bhakoot", subtitle: "Love", maxPoints: 7, altKeys: ["bhakoot", "bhakut"] },
//     { key: "nadi", label: "Nadi", subtitle: "Health", maxPoints: 8, altKeys: ["nadi"] },
// ];

// function normalizeNameKey(name) {
//     return String(name || "").toLowerCase().replace(/[^a-z]/g, "");
// }

// /**
//  * Finds the KOOT_KEYS meta entry a raw guna-list item belongs to, by
//  * matching its name/id against our key + altKeys list.
//  */
// function matchKootMeta(item) {
//     const rawName = normalizeNameKey(pick(item, ["name", "koot_name", "id"]));
//     return KOOT_KEYS.find((meta) => meta.altKeys.some((alt) => normalizeNameKey(alt) === rawName));
// }

// /**
//  * Normalizes one koot (out of the 8 Ashtakoot factors) — combines the
//  * shared guna_milan.guna[] entry (points/description) with each person's
//  * individual koot value (e.g. Varna: boy="Shudra", girl="Kshatriya").
//  */
// function normalizeKoot(meta, gunaItem, boyKootMap, girlKootMap) {
//     const boyValue = boyKootMap ? pick(boyKootMap, meta.altKeys) : undefined;
//     const girlValue = girlKootMap ? pick(girlKootMap, meta.altKeys) : undefined;

//     // Prokerala's basic kundli-matching plan only returns the overall
//     // total_points/maximum_points (guna_milan.guna[] is absent) — it does
//     // NOT give a per-koot obtained/points breakdown in that case. Leaving
//     // receivedPoints as `undefined` (instead of defaulting to 0) lets the
//     // frontend show "—" for those rows rather than a fake "0/8", and keeps
//     // this table honest about what Prokerala actually told us per-koot.
//     const receivedPoints = pick(gunaItem, ["obtained_points", "points_obtained", "received_points", "points"]);

//     return {
//         key: meta.key,
//         label: pick(gunaItem, ["koot_name", "name"]) || meta.label,
//         subtitle: meta.subtitle,
//         receivedPoints: receivedPoints === undefined ? undefined : Number(receivedPoints),
//         maxPoints: pick(gunaItem, ["maximum_points", "max_points", "total_points"]) ?? meta.maxPoints,
//         description: pick(gunaItem, ["description"]),
//         boyValue,
//         girlValue,
//     };
// }

// function normalizePersonInfo(info) {
//     if (!info) return {};
//     const nakshatra = info.nakshatra || {};
//     const rasi = info.rasi || info.rashi || {};
//     return {
//         nakshatra: pick(nakshatra, ["name"]),
//         pada: pick(nakshatra, ["pada"]),
//         rashi: pick(rasi, ["name"]),
//         koot: info.koot || {},
//     };
// }

// // Zodiac (Rashi) order, needed to work out the Bhakoot-dosha "6/8 or 2/12"
// // house relationship between the boy's and girl's Moon sign below.
// const RASHI_ORDER = [
//     "mesha", "vrishabha", "mithuna", "karka", "simha", "kanya",
//     "tula", "vrischika", "dhanu", "makara", "kumbha", "meena",
// ];

// function rashiIndex(name) {
//     const idx = RASHI_ORDER.indexOf(normalizeNameKey(name));
//     return idx === -1 ? undefined : idx;
// }

// /**
//  * Bhakoot Dosha: present when the boy's and girl's Rashi (Moon sign) are in
//  * a 6th/8th or 2nd/12th house relationship from each other (Shadashtak /
//  * Dwidwadash). Counting the houses from boy->girl (inclusive, 1-12) and
//  * girl->boy always sum to 14 for two different signs, so checking one
//  * direction is enough — a count of 2, 6, 8 or 12 means dosha is present.
//  */
// function computeBhakootDosha(boyRashi, girlRashi) {
//     const boyIdx = rashiIndex(boyRashi);
//     const girlIdx = rashiIndex(girlRashi);
//     if (boyIdx === undefined || girlIdx === undefined) return undefined;
//     const houseCount = ((girlIdx - boyIdx + 12) % 12) + 1;
//     return [2, 6, 8, 12].includes(houseCount);
// }

// function normalizeManglikDetails(details) {
//     if (!details) return undefined;
//     const hasDosha = pick(details, ["has_mangal_dosha", "hasMangalDosha", "manglik", "has_dosh"]);
//     return {
//         hasDosha: hasDosha !== undefined ? Boolean(hasDosha) : undefined,
//         hasException: (() => {
//             const val = pick(details, ["has_exception", "hasException"]);
//             return val !== undefined ? Boolean(val) : undefined;
//         })(),
//         doshaType: pick(details, ["mangal_dosha_type", "manglik_dosha_type", "dosha_type"]),
//         description: pick(details, ["description"]),
//     };
// }

// /**
//  * Normalizes Prokerala's raw kundli-matching response into our
//  * KundaliMatch model shape — the "Ashtakoot Guna Milan" table (8 koots +
//  * per-person values + total /36), Janam Rashi/Nakshatra for each person,
//  * per-person Manglik Dosha detail, and the overall conclusion — the full
//  * set of sections shown on matchmaking report pages like
//  * astrotalk.com/matchmaking/match-making-details.
//  */
// function normalizeKundliMatchingResponse(raw) {
//     const data = raw?.data || raw || {};

//     const gunaMilan = data.guna_milan || data.gunaMilan || {};
//     const gunaList = gunaMilan.guna || gunaMilan.koot_details || gunaMilan.details || [];

//     const boyInfo = normalizePersonInfo(data.boy_info || data.boyInfo);
//     const girlInfo = normalizePersonInfo(data.girl_info || data.girlInfo);

//     const koots = Array.isArray(gunaList) && gunaList.length
//         ? gunaList
//             .map((item) => {
//                 const meta = matchKootMeta(item);
//                 if (!meta) return null;
//                 return normalizeKoot(meta, item, boyInfo.koot, girlInfo.koot);
//             })
//             .filter(Boolean)
//         : KOOT_KEYS.map((meta) => normalizeKoot(meta, gunaMilan[meta.key], boyInfo.koot, girlInfo.koot));

//     const totalPoints = pick(gunaMilan, ["total_points", "totalPoints", "received_points"]) ??
//         koots.reduce((sum, k) => sum + (Number(k.receivedPoints) || 0), 0);
//     const maxPoints = pick(gunaMilan, ["maximum_points", "max_points", "maxPoints"]) ?? 36;

//     // Nadi/Bhakoot dosha. NOTE: these must NOT be derived from receivedPoints
//     // — on Prokerala's basic plan there's no per-koot breakdown, so every
//     // koot's receivedPoints is undefined and "points <= 0" would (wrongly)
//     // flag every match as having both doshas. Instead derive them from the
//     // actual koot values, same as a human would read the table:
//     //   - Nadi dosha: boy and girl have the SAME Nadi (Adi/Madhya/Antya).
//     //   - Bhakoot dosha: boy/girl Rashi are 6/8 or 2/12 houses apart.
//     const nadiKoot = koots.find((k) => k.key === "nadi");
//     const bhakootKoot = koots.find((k) => k.key === "bhakoot");

//     const nadiDosha =
//         nadiKoot?.boyValue && nadiKoot?.girlValue
//             ? normalizeNameKey(nadiKoot.boyValue) === normalizeNameKey(nadiKoot.girlValue)
//             : undefined;
//     const bhakootDosha = computeBhakootDosha(
//         boyInfo.rashi || bhakootKoot?.boyValue,
//         girlInfo.rashi || bhakootKoot?.girlValue
//     );

//     const message = data.message || {};
//     const exceptions = data.exceptions || [];

//     const boyManglik = normalizeManglikDetails(data.boy_mangal_dosha_details || data.boyMangalDoshaDetails);
//     const girlManglik = normalizeManglikDetails(data.girl_mangal_dosha_details || data.girlMangalDoshaDetails);

//     return {
//         totalPoints: Number(totalPoints) || 0,
//         maxPoints: Number(maxPoints) || 36,
//         koots,
//         nadiDosha,
//         bhakootDosha,
//         doshaCancelled: Array.isArray(exceptions) ? exceptions.length > 0 : undefined,
//         conclusion: pick(message, ["description"]),
//         conclusionType: pick(message, ["type"]),
//         boyRashi: boyInfo.rashi,
//         boyNakshatra: boyInfo.nakshatra,
//         boyPada: boyInfo.pada,
//         girlRashi: girlInfo.rashi,
//         girlNakshatra: girlInfo.nakshatra,
//         girlPada: girlInfo.pada,
//         maleManglik: boyManglik?.hasDosha,
//         maleManglikDescription: boyManglik?.description,
//         femaleManglik: girlManglik?.hasDosha,
//         femaleManglikDescription: girlManglik?.description,
//         raw,
//     };
// }

// /**
//  * Fetches the Ashtakoot Guna Milan (kundli matching) result for a pair of
//  * birth details.
//  *
//  * @param {Object} params
//  * @param {Object} params.boy - { lat, lng, datetime }
//  * @param {Object} params.girl - { lat, lng, datetime }
//  * @param {number} [params.ayanamsa=1] - 1 = Lahiri (kept consistent with panchang/kundali)
//  */
// async function fetchKundliMatching({ boy, girl, ayanamsa = 1 }) {
//     if (!boy || boy.lat === undefined || boy.lng === undefined || !boy.datetime) {
//         throw new Error("Boy's lat, lng and datetime are required for kundali matching.");
//     }
//     if (!girl || girl.lat === undefined || girl.lng === undefined || !girl.datetime) {
//         throw new Error("Girl's lat, lng and datetime are required for kundali matching.");
//     }

//     const token = await getProkeralaToken();
//     const params = new URLSearchParams({
//         ayanamsa: String(ayanamsa),
//         girl_coordinates: `${girl.lat},${girl.lng}`,
//         girl_dob: girl.datetime,
//         boy_coordinates: `${boy.lat},${boy.lng}`,
//         boy_dob: boy.datetime,
//     });

//     const response = await fetch(`${PROKERALA_KUNDLI_MATCHING_URL}?${params.toString()}`, {
//         headers: { Authorization: `Bearer ${token}` },
//     });
//     const json = await response.json();

//     if (!response.ok || json.status === "error") {
//         throw new Error(
//             `Prokerala kundli-matching request failed: ${json.errors?.[0]?.detail || json.message || response.statusText}`
//         );
//     }

//     return normalizeKundliMatchingResponse(json);
// }

// module.exports = {
//     fetchKundliMatching,
//     normalizeKundliMatchingResponse,
//     KOOT_KEYS,
// };


/**
 * Prokerala Kundli Matching (Ashtakoot Guna Milan) API integration.
 *
 * Uses the SAME Prokerala account/credentials as panchang-api-util.js /
 * kundali-api-util.js (PROKERALA_CLIENT_ID / PROKERALA_CLIENT_SECRET —
 * already set in .env, nothing new to add there). Reuses the shared token
 * cache via getProkeralaToken from panchang-api-util instead of duplicating
 * it, so all three modules stay on one token.
 *
 * Docs: https://api.prokerala.com/ (Astrology API -> Kundli Matching)
 *
 * Field mapping below is based on Prokerala's official PHP SDK response
 * shape (girl_info/boy_info with koot+nakshatra+rasi, guna_milan.guna[],
 * message, girl_mangal_dosha_details/boy_mangal_dosha_details) — see
 * https://github.com/prokerala/astrology-sdk/blob/master/kundli-matching.php
 * — written defensively (multiple fallback keys) same as the rest of this
 * codebase, since the raw REST JSON key casing can differ slightly from
 * the SDK's getter names. Once live credentials hit this, log one raw
 * response and adjust the fallback list below if any field comes back
 * empty.
 */

const { getProkeralaToken } = require("./panchang-api-util");

// IMPORTANT: the plain `/kundli-matching` endpoint only returns the overall
// total_points/maximum_points — no per-koot breakdown (guna_milan.guna[] is
// simply absent from that response, which is why every row was showing a
// fake "0/8"). The `/kundli-matching/advanced` endpoint is the one that
// actually returns guna_milan.guna[] with each koot's obtained_points,
// boy_koot/girl_koot values and description — switching to it is what
// makes real per-koot points show up instead of "—".
const PROKERALA_KUNDLI_MATCHING_URL = "https://api.prokerala.com/v2/astrology/kundli-matching/advanced";

function pick(obj, keys) {
    if (!obj) return undefined;
    for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null) return obj[key];
    }
    return undefined;
}

// The 8 Ashtakoot factors (36 points total), in the standard display order
// used on report pages like astrotalk.com/matchmaking. `altKeys` covers
// the different spellings Prokerala's per-person koot map might use for
// the same factor (e.g. "grahaMaitri" vs "graha_maitri" vs "maitri").
const KOOT_KEYS = [
    { key: "varna", label: "Varna", subtitle: "Work", maxPoints: 1, altKeys: ["varna"] },
    { key: "vashya", label: "Vashya", subtitle: "Dominance", maxPoints: 2, altKeys: ["vashya", "vasya"] },
    { key: "tara", label: "Tara", subtitle: "Destiny", maxPoints: 3, altKeys: ["tara"] },
    { key: "yoni", label: "Yoni", subtitle: "Mentality", maxPoints: 4, altKeys: ["yoni"] },
    {
        key: "graha_maitri",
        label: "Graha Maitri",
        subtitle: "Mental Compatibility",
        maxPoints: 5,
        altKeys: ["graha_maitri", "grahaMaitri", "maitri"],
    },
    { key: "gana", label: "Gana", subtitle: "Temperament", maxPoints: 6, altKeys: ["gana", "gan"] },
    { key: "bhakoot", label: "Bhakoot", subtitle: "Love", maxPoints: 7, altKeys: ["bhakoot", "bhakut"] },
    { key: "nadi", label: "Nadi", subtitle: "Health", maxPoints: 8, altKeys: ["nadi"] },
];

function normalizeNameKey(name) {
    return String(name || "").toLowerCase().replace(/[^a-z]/g, "");
}

/**
 * Finds the KOOT_KEYS meta entry a raw guna-list item belongs to, by
 * matching its name/id against our key + altKeys list.
 */
function matchKootMeta(item) {
    const rawName = normalizeNameKey(pick(item, ["name", "koot_name", "id"]));
    return KOOT_KEYS.find((meta) => meta.altKeys.some((alt) => normalizeNameKey(alt) === rawName));
}

/**
 * Normalizes one koot (out of the 8 Ashtakoot factors) — combines the
 * shared guna_milan.guna[] entry (points/description) with each person's
 * individual koot value (e.g. Varna: boy="Shudra", girl="Kshatriya").
 */
function normalizeKoot(meta, gunaItem, boyKootMap, girlKootMap) {
    // Prefer the per-person koot map (girl_info.koot / boy_info.koot) but
    // fall back to the guna_milan.guna[] item itself — the `/advanced`
    // endpoint puts each side's koot value directly on the guna entry as
    // boy_koot/girl_koot (sometimes p1_koot/p2_koot), so cover both shapes.
    const boyValue =
        (boyKootMap ? pick(boyKootMap, meta.altKeys) : undefined) ??
        pick(gunaItem, ["boy_koot", "boy_value", "p1_koot", "p1"]);
    const girlValue =
        (girlKootMap ? pick(girlKootMap, meta.altKeys) : undefined) ??
        pick(gunaItem, ["girl_koot", "girl_value", "p2_koot", "p2"]);

    // On the plain (non-advanced) kundli-matching endpoint, Prokerala only
    // returns the overall total_points/maximum_points — guna_milan.guna[]
    // is absent there, so there's no per-koot breakdown at all. We now
    // always call the `/advanced` endpoint (see PROKERALA_KUNDLI_MATCHING_URL
    // above), which does return this per-koot data. Leaving receivedPoints
    // as `undefined` when it's genuinely missing (instead of defaulting to
    // 0) still lets the frontend show "—" rather than a fake "0/8".
    const receivedPoints = pick(gunaItem, ["obtained_points", "points_obtained", "received_points", "points"]);

    return {
        key: meta.key,
        label: pick(gunaItem, ["koot_name", "name"]) || meta.label,
        subtitle: meta.subtitle,
        receivedPoints: receivedPoints === undefined ? undefined : Number(receivedPoints),
        maxPoints: pick(gunaItem, ["maximum_points", "max_points", "total_points"]) ?? meta.maxPoints,
        description: pick(gunaItem, ["description"]),
        boyValue,
        girlValue,
    };
}

function normalizePersonInfo(info) {
    if (!info) return {};
    const nakshatra = info.nakshatra || {};
    const rasi = info.rasi || info.rashi || {};
    return {
        nakshatra: pick(nakshatra, ["name"]),
        pada: pick(nakshatra, ["pada"]),
        rashi: pick(rasi, ["name"]),
        koot: info.koot || {},
    };
}

// Zodiac (Rashi) order, needed to work out the Bhakoot-dosha "6/8 or 2/12"
// house relationship between the boy's and girl's Moon sign below.
const RASHI_ORDER = [
    "mesha", "vrishabha", "mithuna", "karka", "simha", "kanya",
    "tula", "vrischika", "dhanu", "makara", "kumbha", "meena",
];

function rashiIndex(name) {
    const idx = RASHI_ORDER.indexOf(normalizeNameKey(name));
    return idx === -1 ? undefined : idx;
}

/**
 * Bhakoot Dosha: present when the boy's and girl's Rashi (Moon sign) are in
 * a 6th/8th or 2nd/12th house relationship from each other (Shadashtak /
 * Dwidwadash). Counting the houses from boy->girl (inclusive, 1-12) and
 * girl->boy always sum to 14 for two different signs, so checking one
 * direction is enough — a count of 2, 6, 8 or 12 means dosha is present.
 */
function computeBhakootDosha(boyRashi, girlRashi) {
    const boyIdx = rashiIndex(boyRashi);
    const girlIdx = rashiIndex(girlRashi);
    if (boyIdx === undefined || girlIdx === undefined) return undefined;
    const houseCount = ((girlIdx - boyIdx + 12) % 12) + 1;
    return [2, 6, 8, 12].includes(houseCount);
}

function normalizeManglikDetails(details) {
    if (!details) return undefined;
    const hasDosha = pick(details, ["has_mangal_dosha", "hasMangalDosha", "manglik", "has_dosh"]);
    return {
        hasDosha: hasDosha !== undefined ? Boolean(hasDosha) : undefined,
        hasException: (() => {
            const val = pick(details, ["has_exception", "hasException"]);
            return val !== undefined ? Boolean(val) : undefined;
        })(),
        doshaType: pick(details, ["mangal_dosha_type", "manglik_dosha_type", "dosha_type"]),
        description: pick(details, ["description"]),
    };
}

/**
 * Normalizes Prokerala's raw kundli-matching response into our
 * KundaliMatch model shape — the "Ashtakoot Guna Milan" table (8 koots +
 * per-person values + total /36), Janam Rashi/Nakshatra for each person,
 * per-person Manglik Dosha detail, and the overall conclusion — the full
 * set of sections shown on matchmaking report pages like
 * astrotalk.com/matchmaking/match-making-details.
 */
function normalizeKundliMatchingResponse(raw) {
    const data = raw?.data || raw || {};

    const gunaMilan = data.guna_milan || data.gunaMilan || {};
    const gunaList = gunaMilan.guna || gunaMilan.koot_details || gunaMilan.details || [];

    const boyInfo = normalizePersonInfo(data.boy_info || data.boyInfo);
    const girlInfo = normalizePersonInfo(data.girl_info || data.girlInfo);

    const koots = Array.isArray(gunaList) && gunaList.length
        ? gunaList
            .map((item) => {
                const meta = matchKootMeta(item);
                if (!meta) return null;
                return normalizeKoot(meta, item, boyInfo.koot, girlInfo.koot);
            })
            .filter(Boolean)
        : KOOT_KEYS.map((meta) => normalizeKoot(meta, gunaMilan[meta.key], boyInfo.koot, girlInfo.koot));

    const totalPoints = pick(gunaMilan, ["total_points", "totalPoints", "received_points"]) ??
        koots.reduce((sum, k) => sum + (Number(k.receivedPoints) || 0), 0);
    const maxPoints = pick(gunaMilan, ["maximum_points", "max_points", "maxPoints"]) ?? 36;

    // Nadi/Bhakoot dosha. NOTE: these must NOT be derived from receivedPoints
    // — on Prokerala's basic plan there's no per-koot breakdown, so every
    // koot's receivedPoints is undefined and "points <= 0" would (wrongly)
    // flag every match as having both doshas. Instead derive them from the
    // actual koot values, same as a human would read the table:
    //   - Nadi dosha: boy and girl have the SAME Nadi (Adi/Madhya/Antya).
    //   - Bhakoot dosha: boy/girl Rashi are 6/8 or 2/12 houses apart.
    const nadiKoot = koots.find((k) => k.key === "nadi");
    const bhakootKoot = koots.find((k) => k.key === "bhakoot");

    const nadiDosha =
        nadiKoot?.boyValue && nadiKoot?.girlValue
            ? normalizeNameKey(nadiKoot.boyValue) === normalizeNameKey(nadiKoot.girlValue)
            : undefined;
    const bhakootDosha = computeBhakootDosha(
        boyInfo.rashi || bhakootKoot?.boyValue,
        girlInfo.rashi || bhakootKoot?.girlValue
    );

    const message = data.message || {};
    const exceptions = data.exceptions || [];

    const boyManglik = normalizeManglikDetails(data.boy_mangal_dosha_details || data.boyMangalDoshaDetails);
    const girlManglik = normalizeManglikDetails(data.girl_mangal_dosha_details || data.girlMangalDoshaDetails);

    return {
        totalPoints: Number(totalPoints) || 0,
        maxPoints: Number(maxPoints) || 36,
        koots,
        nadiDosha,
        bhakootDosha,
        doshaCancelled: Array.isArray(exceptions) ? exceptions.length > 0 : undefined,
        conclusion: pick(message, ["description"]),
        conclusionType: pick(message, ["type"]),
        boyRashi: boyInfo.rashi,
        boyNakshatra: boyInfo.nakshatra,
        boyPada: boyInfo.pada,
        girlRashi: girlInfo.rashi,
        girlNakshatra: girlInfo.nakshatra,
        girlPada: girlInfo.pada,
        maleManglik: boyManglik?.hasDosha,
        maleManglikDescription: boyManglik?.description,
        femaleManglik: girlManglik?.hasDosha,
        femaleManglikDescription: girlManglik?.description,
        raw,
    };
}

/**
 * Fetches the Ashtakoot Guna Milan (kundli matching) result for a pair of
 * birth details.
 *
 * @param {Object} params
 * @param {Object} params.boy - { lat, lng, datetime }
 * @param {Object} params.girl - { lat, lng, datetime }
 * @param {number} [params.ayanamsa=1] - 1 = Lahiri (kept consistent with panchang/kundali)
 */
async function fetchKundliMatching({ boy, girl, ayanamsa = 1 }) {
    if (!boy || boy.lat === undefined || boy.lng === undefined || !boy.datetime) {
        throw new Error("Boy's lat, lng and datetime are required for kundali matching.");
    }
    if (!girl || girl.lat === undefined || girl.lng === undefined || !girl.datetime) {
        throw new Error("Girl's lat, lng and datetime are required for kundali matching.");
    }

    const token = await getProkeralaToken();
    const params = new URLSearchParams({
        ayanamsa: String(ayanamsa),
        girl_coordinates: `${girl.lat},${girl.lng}`,
        girl_dob: girl.datetime,
        boy_coordinates: `${boy.lat},${boy.lng}`,
        boy_dob: boy.datetime,
    });

    const response = await fetch(`${PROKERALA_KUNDLI_MATCHING_URL}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const json = await response.json();

    if (!response.ok || json.status === "error") {
        throw new Error(
            `Prokerala kundli-matching request failed: ${json.errors?.[0]?.detail || json.message || response.statusText}`
        );
    }

    return normalizeKundliMatchingResponse(json);
}

module.exports = {
    fetchKundliMatching,
    normalizeKundliMatchingResponse,
    KOOT_KEYS,
};