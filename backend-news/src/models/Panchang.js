const mongoose = require("mongoose");

const PanchangSchema = new mongoose.Schema(
  {
    date: {
      type: String, // stored as YYYY-MM-DD (local date for the queried city)
      required: [true, "Date is required."],
      index: true,
    },
    city: {
      type: String,
      index: true,
    },
    lat: {
      type: Number,
      required: [true, "Latitude is required."],
    },
    lng: {
      type: Number,
      required: [true, "Longitude is required."],
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },
    tithi: {
      name: String,
      paksha: String,
      endTime: String,
    },
    nakshatra: {
      name: String,
      endTime: String,
    },
    yoga: {
      name: String,
      endTime: String,
    },
    karana: {
      name: String,
      endTime: String,
    },
    moonSign: {
      name: String,
      endTime: String,
    },
    ritu: {
      type: String,
    },
    monthPurnimanta: {
      type: String,
    },
    monthAmanta: {
      type: String,
    },
    dayDuration: {
      type: String,
    },
    samvatsaraName: {
      type: String,
    },
    dishaShoola: {
      type: String,
    },
    taraBala: {
      type: [String],
      default: [],
    },
    chandraBala: {
      type: [String],
      default: [],
    },
    kaliSamvat: {
      type: Number,
    },
    sunrise: {
      type: String,
    },
    sunset: {
      type: String,
    },
    moonrise: {
      type: String,
    },
    moonset: {
      type: String,
    },
    rahuKalam: {
      start: String,
      end: String,
    },
    abhijitMuhurat: {
      start: String,
      end: String,
    },
    // Weekday name (e.g. "Thursday") - comes straight from Prokerala's `vaara` field
    weekday: {
      type: String,
    },
    // Hindu calendar year numbers shown alongside the Gregorian date
    shakaSamvat: {
      type: Number,
    },
    vikramSamvat: {
      type: Number,
    },
    // Full list of inauspicious muhurats for the day (Rahu Kaal, Yamaganda,
    // Gulika Kaal, Kaalvela/Ardhayaam, Kantaka/Mrityu, etc.) — kept as a
    // generic named list so we don't need a schema change every time a new
    // period type shows up in Prokerala's response.
    inauspiciousPeriods: [
      {
        name: String,
        start: String,
        end: String,
      },
    ],
    // Planetary Positions table (Ascendant + 9 planets) — Rashi, Longitude,
    // Nakshatra, Pada for each. Best-effort field: may be empty if the
    // planet-position API call failed, rest of the Panchang still works.
    planetaryPositions: [
      {
        planet: String,
        rashi: String,
        longitude: String,
        // Full 0-360° numeric longitude (separate from the display-formatted
        // `longitude` string above) — needed by the Muhurat rule engine to
        // compute real angular separation from the Sun (Guru/Shukra Asta
        // check for Vivah). Optional/best-effort, same as the rest of this
        // sub-document.
        longitudeDegrees: Number,
        nakshatra: String,
        pada: Number,
        // Whether the planet is retrograde. Taken straight from Prokerala's
        // response when it includes a usable retrograde/motion field;
        // otherwise falls back to an astronomical delta-longitude check
        // (see planetary-transit-util.js:isRetrograde) so this is never a
        // guess either way. Optional/best-effort, same as the rest of this
        // sub-document — undefined only if longitude itself couldn't be
        // determined.
        isRetrograde: Boolean,
      },
    ],
    festivals: {
      type: [String],
      default: [],
    },
    raw: {
      type: mongoose.Schema.Types.Mixed, // full normalized API response, kept for debugging/admin override reference
    },
    source: {
      type: String,
      enum: ["prokerala", "manual"],
      default: "prokerala",
    },
  },
  {
    timestamps: true,
  }
);

// one cached document per date + lat/lng combination
PanchangSchema.index({ date: 1, lat: 1, lng: 1 }, { unique: true });

const Panchang =
  mongoose.models.Panchang || mongoose.model("Panchang", PanchangSchema);
module.exports = Panchang;