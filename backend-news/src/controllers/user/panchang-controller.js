const Panchang = require("../../models/Panchang");
const { fetchPanchang, fetchPanchangOnly } = require("../../utils/panchang-api-util");
const { buildMuhuratSchedule, OCCASION_IDS } = require("../../utils/muhurat-rules-util");
const PlanetaryTransitCache = require("../../models/PlanetaryTransitCache");
const { computeUpcomingTransits, getRashi, RASHI_NAMES } = require("../../utils/planetary-transit-util");
const { getTransitInsight } = require("../../utils/transit-insight-rules");

// default location used when neither lat/lng nor a known city is passed
const DEFAULT_CITY = { city: "New Delhi", lat: 28.6139, lng: 77.209, timezone: "Asia/Kolkata" };

// small built-in city list so the frontend can offer a quick picker without
// needing a separate geocoding service; add more cities here anytime
const KNOWN_CITIES = {
  "new delhi": DEFAULT_CITY,
  mumbai: { city: "Mumbai", lat: 19.076, lng: 72.8777, timezone: "Asia/Kolkata" },
  bengaluru: { city: "Bengaluru", lat: 12.9716, lng: 77.5946, timezone: "Asia/Kolkata" },
  kolkata: { city: "Kolkata", lat: 22.5726, lng: 88.3639, timezone: "Asia/Kolkata" },
  chennai: { city: "Chennai", lat: 13.0827, lng: 80.2707, timezone: "Asia/Kolkata" },
  hyderabad: { city: "Hyderabad", lat: 17.385, lng: 78.4867, timezone: "Asia/Kolkata" },
  pune: { city: "Pune", lat: 18.5204, lng: 73.8567, timezone: "Asia/Kolkata" },
  jaipur: { city: "Jaipur", lat: 26.9124, lng: 75.7873, timezone: "Asia/Kolkata" },
  lucknow: { city: "Lucknow", lat: 26.8467, lng: 80.9462, timezone: "Asia/Kolkata" },
  varanasi: { city: "Varanasi", lat: 25.3176, lng: 82.9739, timezone: "Asia/Kolkata" },
};

function resolveLocation(query) {
  const { lat, lng, city } = query;

  if (lat !== undefined && lng !== undefined) {
    // Round GPS coordinates to 2 decimals (~1.1km grid) before using them as
    // the cache key. Raw browser GPS coordinates are precise to many decimal
    // places and almost never repeat exactly, so every "current location"
    // request was missing the cache and forcing a brand-new live Prokerala
    // call every single time — this is also what was surfacing transient
    // Prokerala failures only for GPS users and not for the picked-city flow,
    // which always reuses the same fixed, already-cached coordinates.
    return {
      city: city || "Selected Location",
      lat: Math.round(parseFloat(lat) * 100) / 100,
      lng: Math.round(parseFloat(lng) * 100) / 100,
      timezone: "Asia/Kolkata",
    };
  }

  if (city && KNOWN_CITIES[city.toLowerCase()]) {
    return KNOWN_CITIES[city.toLowerCase()];
  }

  return DEFAULT_CITY;
}

function todayDateString() {
  // YYYY-MM-DD in Asia/Kolkata, since that's the panchang's operative timezone
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

// In-flight request de-dupe: Prokerala's free-tier limit is only 5
// requests/60s (see the catch blocks below), so two requests landing for
// the SAME date+location at almost the same moment — e.g. the Panchang
// card and the Muhurat table both loading on page mount, or React dev-mode
// firing an effect twice, or two browser tabs open at once — must not
// each trigger their own live Prokerala call. Every caller for the same
// key instead awaits the one fetch already in progress.
const inFlightPanchangFetches = new Map();

function panchangCacheKey(date, location) {
  return `${date}_${location.lat}_${location.lng}`;
}

/* Cache-first, de-duped Panchang lookup shared by getTodayPanchang,
   getMuhurat, and getPlanetaryTransit, so whichever one runs first "wins"
   the live API call and the others reuse its result instead of firing a
   second Prokerala request.

   `requireNonEmptyPlanetaryPositions` (opt-in, default false): some early
   cached docs were saved with an empty planetaryPositions array (Prokerala
   response shape mismatch at the time). getTodayPanchang/getMuhurat don't
   care about that field, so their cache behavior is untouched. Only
   getPlanetaryTransit passes this flag, so a doc whose planetaryPositions
   is empty is treated as a cache miss for it (and only it) — triggering a
   fresh Prokerala fetch that then overwrites the stale doc, self-healing
   the cache for everyone. */
async function getOrFetchPanchang(location, date, { requireNonEmptyPlanetaryPositions = false, requireMuhuratData = false } = {}) {
  const baseQuery = { date, lat: location.lat, lng: location.lng };
  const findQuery = { ...baseQuery };
  if (requireNonEmptyPlanetaryPositions) {
    findQuery["planetaryPositions.0"] = { $exists: true };
  }
  if (requireMuhuratData) {
    // a doc saved by the calendar grid's fetchPanchangOnly() has no
    // abhijitMuhurat — treat that as a cache miss so the full Prokerala
    // fetch runs and self-heals the doc for everyone
    findQuery["abhijitMuhurat.start"] = { $exists: true };
  }

  let panchang = await Panchang.findOne(findQuery);
  if (panchang) return { panchang, cached: true };

  const key = panchangCacheKey(date, location);
  if (inFlightPanchangFetches.has(key)) {
    return { panchang: await inFlightPanchangFetches.get(key), cached: true };
  }

  const fetchPromise = (async () => {
    const datetime = `${date}T06:00:00+05:30`; // fixed morning reference time, consistent with how panchang is usually quoted
    const normalized = await fetchPanchang({ lat: location.lat, lng: location.lng, datetime });
    return Panchang.findOneAndUpdate(
      { date, lat: location.lat, lng: location.lng },
      {
        date,
        city: location.city,
        lat: location.lat,
        lng: location.lng,
        timezone: location.timezone,
        ...normalized,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  })();

  inFlightPanchangFetches.set(key, fetchPromise);
  try {
    panchang = await fetchPromise;
    return { panchang, cached: false };
  } finally {
    inFlightPanchangFetches.delete(key);
  }
}

/* Get list of known cities (for the city selector dropdown) */
const getPanchangCities = async (req, res) => {
  try {
    const cities = Object.values(KNOWN_CITIES).map(({ city, lat, lng }) => ({
      city,
      lat,
      lng,
    }));
    res.status(200).json({ success: true, data: cities });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* Get Today's (or a given date's) Panchang for a location — cache first, API fallback */
const getTodayPanchang = async (req, res) => {
  try {
    const location = resolveLocation(req.query);
    const date = req.query.date || todayDateString();

    const { panchang, cached } = await getOrFetchPanchang(location, date, {
      requireMuhuratData: true,
    });

    res.status(200).json({ success: true, data: panchang, cached });
  } catch (error) {
    // log the REAL underlying error server-side (Prokerala auth/rate-limit/
    // network issues etc.) — the JSON response to the client stays generic
    // so the UI doesn't show raw API errors to end users
    console.error("[getTodayPanchang] failed:", error?.response?.data || error.message);
    res.status(503).json({
      success: false,
      message:
        "Panchang data is temporarily unavailable. Please try again in a moment.",
      error: error.message,
    });
  }
};

// classifies a Tithi name so the calendar grid can show a coloured dot —
// same 3-tone convention as the legend (Auspicious / Moderate / Not
// Auspicious) used elsewhere on the site
function classifyTithiTone(tithiName) {
  if (!tithiName) return "auspicious";
  const name = tithiName.toLowerCase();
  if (name.includes("amavasya") || name.includes("chaturdashi")) return "inauspicious";
  if (name.includes("purnima") || name.includes("ekadashi") || name.includes("panchami")) return "moderate";
  return "auspicious";
}

// Runs async jobs with a max concurrency limit — keeps a 31-day month from
// firing 31 simultaneous requests at Prokerala at once (rate-limit safety).
async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function next() {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await worker(items[i], i);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, next);
  await Promise.all(workers);
  return results;
}

/* Get a whole month's Panchang (Tithi + festivals only) for the calendar grid —
   cache-first per day, same Panchang cache collection as getTodayPanchang, so a
   day already viewed individually (or via a previous month view) isn't re-fetched. */
const getMonthPanchang = async (req, res) => {
  try {
    const location = resolveLocation(req.query);
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1; // 1-12

    const daysInMonth = new Date(year, month, 0).getDate();
    const dateStrings = Array.from({ length: daysInMonth }, (_, i) => {
      const day = String(i + 1).padStart(2, "0");
      return `${year}-${String(month).padStart(2, "0")}-${day}`;
    });

    // 1. bulk cache lookup — one query for the whole month instead of N
    const cachedDocs = await Panchang.find({
      date: { $in: dateStrings },
      lat: location.lat,
      lng: location.lng,
    });
    const cacheByDate = new Map(cachedDocs.map((d) => [d.date, d]));

    const missingDates = dateStrings.filter((d) => !cacheByDate.has(d));

    // 2. fetch only the missing days, 5 at a time, and cache each as it lands
    if (missingDates.length) {
      await runWithConcurrency(missingDates, 5, async (date) => {
        try {
          const datetime = `${date}T06:00:00+05:30`;
          const normalized = await fetchPanchangOnly({
            lat: location.lat,
            lng: location.lng,
            datetime,
          });
          const doc = await Panchang.findOneAndUpdate(
            { date, lat: location.lat, lng: location.lng },
            {
              date,
              city: location.city,
              lat: location.lat,
              lng: location.lng,
              timezone: location.timezone,
              ...normalized,
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
          );
          cacheByDate.set(date, doc);
        } catch (err) {
          // best-effort per day — a single failed day shouldn't blank the whole
          // month grid; that cell just comes back with no tithi below
          cacheByDate.set(date, null);
        }
      });
    }

    const days = dateStrings.map((date) => {
      const doc = cacheByDate.get(date);
      return {
        date,
        tithi: doc?.tithi?.name || null,
        paksha: doc?.tithi?.paksha || null,
        tone: doc?.tithi?.name ? classifyTithiTone(doc.tithi.name) : null,
        festivals: doc?.festivals || [],
      };
    });

    res.status(200).json({ success: true, data: { year, month, city: location.city, days } });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Panchang calendar data is temporarily unavailable. Please try again in a moment.",
      error: error.message,
    });
  }
};

/* Get the real, calculated Muhurat table (Griha Pravesh, Vivah, Vehicle
   Purchase, etc.) for a given date + location. Reuses the same
   cache-first Panchang lookup as getTodayPanchang (so a date already
   viewed on /panchang-muhurat isn't re-fetched from Prokerala here),
   then runs it through the rule engine in muhurat-rules-util.js. */
const getMuhurat = async (req, res) => {
  try {
    const location = resolveLocation(req.query);
    const date = req.query.date || todayDateString();

    const { panchang } = await getOrFetchPanchang(location, date, {
      requireMuhuratData: true,
    });

    const muhurats = buildMuhuratSchedule(panchang);

    res.status(200).json({
      success: true,
      data: {
        date,
        city: location.city,
        sunrise: panchang.sunrise,
        sunset: panchang.sunset,
        tithi: panchang.tithi,
        nakshatra: panchang.nakshatra,
        yoga: panchang.yoga,
        karana: panchang.karana,
        muhurats,
      },
    });
  } catch (error) {
    console.error("[getMuhurat] failed:", error?.response?.data || error.message);
    res.status(503).json({
      success: false,
      message: "Muhurat data is temporarily unavailable. Please try again in a moment.",
      error: error.message,
    });
  }
};

/* Get every REAL, calculated auspicious date + exact Muhurat interval for a
   given category across a whole month (the actual DrikPanchang-style
   "muhurat dates" listing, e.g. "Griha Pravesh dates in October 2026") —
   instead of the single-date table getMuhurat returns.

   Every day in the month is computed dynamically (same rule engine as
   getMuhurat, muhurat-rules-util.js) — nothing here is a hardcoded date or
   time. Cache-first, same Panchang collection + same bulk-lookup /
   bounded-concurrency fetch pattern as getMonthPanchang, so:
     - a day already viewed on /muhurat or /panchang-muhurat (full fetch,
       with Rahu Kalam / Abhijit / planetary positions) is reused as-is and
       gets the FULL rule set (including Guru/Shukra Asta for Vivah).
     - a day never fetched before is filled in with the same lightweight
       fetchPanchangOnly() the month calendar already uses (1 Prokerala
       call, not 4) — keeps a 31-day sweep well inside the 5 req/min
       Prokerala limit. It still gets a real, dynamically calculated
       Choghadiya + Tithi/Nakshatra/Weekday score; only the extra
       best-effort refinements (Rahu Kalam slot-exclusion, Guru/Shukra
       Asta) are skipped for that day since their source data wasn't
       fetched, rather than guessed. */
const getMonthlyMuhurat = async (req, res) => {
  try {
    const location = resolveLocation(req.query);
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1; // 1-12
    const category = String(req.query.category || "").toLowerCase();
    // "strict" narrows results to only "Highly Auspicious" (score >= 80)
    // days instead of the default "Auspicious or better" (score >= 60).
    const strict = String(req.query.strict || "").toLowerCase() === "true";

    if (!OCCASION_IDS.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid or missing "category". Valid values: ${OCCASION_IDS.join(", ")}`,
      });
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const dateStrings = Array.from({ length: daysInMonth }, (_, i) => {
      const day = String(i + 1).padStart(2, "0");
      return `${year}-${String(month).padStart(2, "0")}-${day}`;
    });

    // 1. bulk cache lookup — reuses whatever's already cached for this
    //    location, whether it came from a full fetch (single-date pages) or
    //    a lightweight one (month calendar grid).
    const cachedDocs = await Panchang.find({
      date: { $in: dateStrings },
      lat: location.lat,
      lng: location.lng,
    });
    const cacheByDate = new Map(cachedDocs.map((d) => [d.date, d]));
    const missingDates = dateStrings.filter((d) => !cacheByDate.has(d));

    // 2. fetch only the missing days, 5 at a time (same rate-limit-safe
    //    pattern as getMonthPanchang), using the cheap panchang-only call.
    if (missingDates.length) {
      await runWithConcurrency(missingDates, 5, async (date) => {
        try {
          const datetime = `${date}T06:00:00+05:30`;
          const normalized = await fetchPanchangOnly({
            lat: location.lat,
            lng: location.lng,
            datetime,
          });
          const doc = await Panchang.findOneAndUpdate(
            { date, lat: location.lat, lng: location.lng },
            {
              date,
              city: location.city,
              lat: location.lat,
              lng: location.lng,
              timezone: location.timezone,
              ...normalized,
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
          );
          cacheByDate.set(date, doc);
        } catch (err) {
          // best-effort per day — one failed day shouldn't fail the whole month
          cacheByDate.set(date, null);
        }
      });
    }

    // 3. run every day through the SAME rule engine as the single-date
    //    /panchang/muhurat endpoint, and keep only the requested category's
    //    row where it comes back auspicious — with its real, calculated
    //    time interval for that day.
    const dates = [];
    for (const date of dateStrings) {
      const doc = cacheByDate.get(date);
      if (!doc || !doc.sunrise || !doc.sunset) continue;

      const schedule = buildMuhuratSchedule(doc);
      const row = schedule.find((r) => r.id === category);
      if (!row) continue;

      // strict = only "Highly Auspicious" days; default = "Auspicious" or
      // better (tone is already derived from the 0-100 score in
      // scoreDayForOccasion — see muhurat-rules-util.js).
      const isAuspiciousEnough = strict ? row.label === "Highly Auspicious" : row.tone === "auspicious";
      if (!isAuspiciousEnough) continue;

      dates.push({
        date,
        weekday: doc.weekday,
        tithi: doc.tithi?.name || null,
        nakshatra: doc.nakshatra?.name || null,
        start: row.start,
        end: row.end,
        label: row.label,
        stars: row.stars,
        details: row.details,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        year,
        month,
        city: location.city,
        category,
        strict,
        count: dates.length,
        dates,
      },
    });
  } catch (error) {
    console.error("[getMonthlyMuhurat] failed:", error?.response?.data || error.message);
    res.status(503).json({
      success: false,
      message: "Monthly Muhurat data is temporarily unavailable. Please try again in a moment.",
      error: error.message,
    });
  }
};

/* Best-effort English rashi name for a planetaryPositions row — prefers the
   astronomically-computed sign from longitudeDegrees (format-independent,
   always matches RASHI_NAMES' English keys) since Prokerala's own `rashi`
   string format (English? Sanskrit? "Mesha" vs "Aries"?) isn't confirmed
   yet. Falls back to matching Prokerala's raw string against the known
   English/Sanskrit names, so this still degrades gracefully if
   longitudeDegrees itself is missing for some reason. */
function resolveEnglishRashi(position) {
  if (typeof position.longitudeDegrees === "number" && !Number.isNaN(position.longitudeDegrees)) {
    return getRashi(position.longitudeDegrees).en;
  }
  const raw = (position.rashi || "").toLowerCase();
  const match = RASHI_NAMES.find((r) => r.en.toLowerCase() === raw || r.sa.toLowerCase() === raw);
  return match?.en;
}

/* Get today's (or a given date's) Planetary Positions for a location —
   reuses the SAME cache-first, de-duped Panchang lookup as getTodayPanchang
   and getMuhurat (getOrFetchPanchang), so this endpoint triggers ZERO extra
   Prokerala calls: planet-position is already one of the 4 endpoints that
   call fetches together on a cache miss. */
const getPlanetaryTransit = async (req, res) => {
  try {
    const location = resolveLocation(req.query);
    const date = req.query.date || todayDateString();

    const { panchang, cached } = await getOrFetchPanchang(location, date, {
      requireNonEmptyPlanetaryPositions: true,
    });
    const rawPositions = panchang.planetaryPositions || [];

    const positions = rawPositions.map((p) => ({
      planet: p.planet,
      rashi: p.rashi,
      rashiEn: resolveEnglishRashi(p),
      degree: p.longitude,
      longitudeDegrees: p.longitudeDegrees,
      nakshatra: p.nakshatra,
      pada: p.pada,
      isRetrograde: !!p.isRetrograde,
    }));

    // "Key Transit Insights" card only calls out these 4 slow-moving
    // grahas — static text keyed by (planet, live rashi), see
    // transit-insight-rules.js.
    const keyInsights = positions
      .filter((p) => ["Jupiter", "Saturn", "Rahu", "Ketu"].includes(p.planet) && p.rashiEn)
      .map((p) => ({
        planet: p.planet,
        rashi: p.rashiEn,
        isRetrograde: p.isRetrograde,
        text: getTransitInsight(p.planet, p.rashiEn, p.isRetrograde),
      }))
      .filter((entry) => entry.text);

    res.status(200).json({
      success: true,
      cached,
      data: {
        date,
        city: location.city,
        positions,
        keyInsights,
      },
    });
  } catch (error) {
    console.error("[getPlanetaryTransit] failed:", error?.response?.data || error.message);
    res.status(503).json({
      success: false,
      message: "Planetary transit data is temporarily unavailable. Please try again in a moment.",
      error: error.message,
    });
  }
};

/* Get upcoming rashi-ingress events ("Upcoming Major Transits") for the next
   N months. NOT sourced from Prokerala at all — computed directly from
   ephemeris data (astronomy-engine, see planetary-transit-util.js) since
   Prokerala has no "next N ingresses" endpoint and daily-polling it for this
   would blow through the free-tier rate limit for no reason: every ingress
   date is a deterministic astronomical fact, not something that needs to be
   re-fetched.

   Cache-first (PlanetaryTransitCache): if enough future events are already
   cached for the requested window, served straight from Mongo with zero
   calculation. Otherwise this request itself computes and upserts them
   (lazy-fill) — a background pre-warm job is a nice-to-have, not a
   dependency; see backend/src/scripts/computeUpcomingTransits.js. */
const getUpcomingTransits = async (req, res) => {
  try {
    const months = Math.min(Math.max(parseInt(req.query.months, 10) || 12, 1), 24);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const now = new Date();
    const windowEnd = new Date(now.getTime() + months * 30.44 * 86400000);

    let cachedEvents = await PlanetaryTransitCache.find({
      exactDateTime: { $gte: now, $lte: windowEnd },
    })
      .sort({ exactDateTime: 1 })
      .limit(limit)
      .lean();

    let source = "cache";

    // Not enough cached coverage for this window/limit yet — compute fresh
    // and upsert (findOneAndUpdate + the {planet, exactDateTime} unique
    // index means a re-run, or an overlapping pre-warm job, never creates
    // duplicates — it just updates the existing row in place).
    if (cachedEvents.length < limit) {
      const computed = computeUpcomingTransits({ from: now, months });

      await Promise.all(
        computed.map((event) =>
          PlanetaryTransitCache.findOneAndUpdate(
            { planet: event.planet, exactDateTime: event.exactDateTime },
            {
              planet: event.planet,
              fromRashi: event.fromRashi.en,
              toRashi: event.toRashi.en,
              exactDateTime: event.exactDateTime,
              isRetrograde: event.isRetrograde,
              computedAt: new Date(),
            },
            { upsert: true, setDefaultsOnInsert: true }
          )
        )
      );

      cachedEvents = await PlanetaryTransitCache.find({
        exactDateTime: { $gte: now, $lte: windowEnd },
      })
        .sort({ exactDateTime: 1 })
        .limit(limit)
        .lean();
      source = "computed";
    }

    const data = cachedEvents.map((e) => ({
      date: e.exactDateTime,
      planet: e.planet,
      fromRashi: e.fromRashi,
      toRashi: e.toRashi,
      transit: `Enters ${e.toRashi}${e.isRetrograde ? " (Retrograde)" : ""}`,
      isRetrograde: e.isRetrograde,
      impact: getTransitInsight(e.planet, e.toRashi, e.isRetrograde) || undefined,
    }));

    res.status(200).json({ success: true, source, data });
  } catch (error) {
    console.error("[getUpcomingTransits] failed:", error.message);
    res.status(503).json({
      success: false,
      message: "Upcoming transit data is temporarily unavailable. Please try again in a moment.",
      error: error.message,
    });
  }
};

module.exports = {
  getPanchangCities,
  getTodayPanchang,
  getMonthPanchang,
  getMuhurat,
  getMonthlyMuhurat,
  getPlanetaryTransit,
  getUpcomingTransits,
};