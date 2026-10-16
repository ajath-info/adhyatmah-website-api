/**
 * One-time seed script.
 *
 * Populates the `Vrat` collection (used by /api/vrats and the
 * "Vrat & Upvas" page) from the same 2026 Panchang dataset that was
 * hand-curated for frontend/src/data/festivals-2026.js.
 *
 * Only the fasting/vrat-relevant categories from that file are used
 * (Ekadashi, Pradosh Vrat, Purnima, Amavasya, Vrat) — plain "Festival"
 * and "Shubh Din" entries are intentionally left out, since those
 * belong to the /festivals page, not /vrat-upvas.
 *
 * The generic "Vrat" category entries (Kalashtami, Sankashti variants,
 * Sawan Somwar, Mangla Gauri, Masik Shivaratri, etc.) are mapped to a
 * specific VRAT_TYPES value based on the entry name:
 *   - name has "Sankashti"          -> "Sankashti Chaturthi"
 *   - name has "Somwar"/"Somvar"    -> "Somvar Vrat"
 *   - name has "Mangla Gauri"       -> "Mangalvar Vrat"
 *   - name has "Navratri"           -> "Navratri Vrat"
 *   - everything else               -> "Other Vrat"
 * `purpose` and `deity` are filled with a simple default per type so
 * the cards/filters don't look empty — edit any entry later from the
 * DB or a future admin UI, this script only needs to run once.
 *
 * SAFE / IDEMPOTENT:
 * - Skips any entry whose slug already exists in the Vrat collection,
 *   so it is safe to re-run (e.g. after adding more entries below).
 * - Does not touch/delete any existing Vrat document.
 *
 * Usage (run once from the backend project root):
 *   node src/scripts/seed-vrat-from-festivals.js
 */

"use strict";

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const Vrat = require("../models/Vrat");

// Pre-filtered + pre-mapped from frontend/src/data/festivals-2026.js
// (category: Ekadashi / Pradosh Vrat / Purnima / Amavasya / Vrat only).
const VRAT_SEED_DATA = [
    {
        "title": "Pradosh Vrat (Guru)",
        "slug": "pradosh-vrat-guru-2026-01-01",
        "date": "2026-01-01",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Paush Purnima",
        "slug": "paush-purnima-2026-01-03",
        "date": "2026-01-03",
        "type": "Purnima Vrat",
        "purpose": [
            "Prosperity & Wealth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Paush Purnima — full moon day, considered auspicious for worship and charity.",
        "description": "Paush Purnima — full moon day, considered auspicious for worship and charity."
    },
    {
        "title": "Lambodara Sankashti / Sakat Chauth",
        "slug": "lambodara-sankashti-sakat-chauth-2026-01-06",
        "date": "2026-01-06",
        "type": "Sankashti Chaturthi",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Ganesha",
        "shortDescription": "Lambodara Sankashti / Sakat Chauth — a traditional fast/vrat observed on this tithi.",
        "description": "Lambodara Sankashti / Sakat Chauth — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Kalashtami",
        "slug": "kalashtami-2026-01-10",
        "date": "2026-01-10",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Kalashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Kalashtami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Shattila Ekadashi",
        "slug": "shattila-ekadashi-2026-01-14",
        "date": "2026-01-14",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Shattila Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Shattila Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Masik Shivaratri",
        "slug": "masik-shivaratri-2026-01-16",
        "date": "2026-01-16",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Masik Shivaratri — a traditional fast/vrat observed on this tithi.",
        "description": "Masik Shivaratri — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Pradosh Vrat (Shukra)",
        "slug": "pradosh-vrat-shukra-2026-01-16",
        "date": "2026-01-16",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Mauni Amavasya",
        "slug": "mauni-amavasya-2026-01-18",
        "date": "2026-01-18",
        "type": "Amavasya Vrat",
        "purpose": [
            "Peace & Happiness"
        ],
        "deity": "Pitru Devta (Ancestors)",
        "shortDescription": "Mauni Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
        "description": "Mauni Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
    },
    {
        "title": "Jaya Ekadashi",
        "slug": "jaya-ekadashi-2026-01-29",
        "date": "2026-01-29",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Jaya Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Jaya Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Pradosh Vrat (Shukra)",
        "slug": "pradosh-vrat-shukra-2026-01-30",
        "date": "2026-01-30",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Magha Purnima",
        "slug": "magha-purnima-2026-02-01",
        "date": "2026-02-01",
        "type": "Purnima Vrat",
        "purpose": [
            "Prosperity & Wealth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Magha Purnima — full moon day, considered auspicious for worship and charity.",
        "description": "Magha Purnima — full moon day, considered auspicious for worship and charity."
    },
    {
        "title": "Dwijapriya Sankashti",
        "slug": "dwijapriya-sankashti-2026-02-05",
        "date": "2026-02-05",
        "type": "Sankashti Chaturthi",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Ganesha",
        "shortDescription": "Dwijapriya Sankashti — a traditional fast/vrat observed on this tithi.",
        "description": "Dwijapriya Sankashti — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Kalashtami",
        "slug": "kalashtami-2026-02-09",
        "date": "2026-02-09",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Kalashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Kalashtami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Vijaya Ekadashi",
        "slug": "vijaya-ekadashi-2026-02-13",
        "date": "2026-02-13",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Vijaya Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Vijaya Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Pradosh Vrat (Shani)",
        "slug": "pradosh-vrat-shani-2026-02-14",
        "date": "2026-02-14",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Phalguna Amavasya",
        "slug": "phalguna-amavasya-2026-02-17",
        "date": "2026-02-17",
        "type": "Amavasya Vrat",
        "purpose": [
            "Peace & Happiness"
        ],
        "deity": "Pitru Devta (Ancestors)",
        "shortDescription": "Phalguna Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
        "description": "Phalguna Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
    },
    {
        "title": "Dhundhiraja Chaturthi",
        "slug": "dhundhiraja-chaturthi-2026-02-21",
        "date": "2026-02-21",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Dhundhiraja Chaturthi — a traditional fast/vrat observed on this tithi.",
        "description": "Dhundhiraja Chaturthi — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Masik Durgashtami",
        "slug": "masik-durgashtami-2026-02-24",
        "date": "2026-02-24",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Goddess Durga",
        "shortDescription": "Masik Durgashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Masik Durgashtami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Amalaki Ekadashi",
        "slug": "amalaki-ekadashi-2026-02-27",
        "date": "2026-02-27",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Amalaki Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Amalaki Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Pradosh Vrat (Ravi)",
        "slug": "pradosh-vrat-ravi-2026-03-01",
        "date": "2026-03-01",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Bhalachandra Sankashti",
        "slug": "bhalachandra-sankashti-2026-03-06",
        "date": "2026-03-06",
        "type": "Sankashti Chaturthi",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Ganesha",
        "shortDescription": "Bhalachandra Sankashti — a traditional fast/vrat observed on this tithi.",
        "description": "Bhalachandra Sankashti — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Sheetala Saptami",
        "slug": "sheetala-saptami-2026-03-10",
        "date": "2026-03-10",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Sheetala Saptami — a traditional fast/vrat observed on this tithi.",
        "description": "Sheetala Saptami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Kalashtami",
        "slug": "kalashtami-2026-03-11",
        "date": "2026-03-11",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Kalashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Kalashtami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Papmochani Ekadashi",
        "slug": "papmochani-ekadashi-2026-03-15",
        "date": "2026-03-15",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Papmochani Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Papmochani Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Pradosh Vrat (Soma)",
        "slug": "pradosh-vrat-soma-2026-03-16",
        "date": "2026-03-16",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Masik Shivaratri",
        "slug": "masik-shivaratri-2026-03-17",
        "date": "2026-03-17",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Masik Shivaratri — a traditional fast/vrat observed on this tithi.",
        "description": "Masik Shivaratri — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Chaitra Amavasya",
        "slug": "chaitra-amavasya-2026-03-18",
        "date": "2026-03-18",
        "type": "Amavasya Vrat",
        "purpose": [
            "Peace & Happiness"
        ],
        "deity": "Pitru Devta (Ancestors)",
        "shortDescription": "Chaitra Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
        "description": "Chaitra Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
    },
    {
        "title": "Vasudeva Chaturthi",
        "slug": "vasudeva-chaturthi-2026-03-22",
        "date": "2026-03-22",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Vasudeva Chaturthi — a traditional fast/vrat observed on this tithi.",
        "description": "Vasudeva Chaturthi — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Masik Durgashtami / Ashoka Ashtami",
        "slug": "masik-durgashtami-ashoka-ashtami-2026-03-26",
        "date": "2026-03-26",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Goddess Durga",
        "shortDescription": "Masik Durgashtami / Ashoka Ashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Masik Durgashtami / Ashoka Ashtami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Kamada Ekadashi",
        "slug": "kamada-ekadashi-2026-03-29",
        "date": "2026-03-29",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Kamada Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Kamada Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Pradosh Vrat (Soma)",
        "slug": "pradosh-vrat-soma-2026-03-30",
        "date": "2026-03-30",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Vikata Sankashti",
        "slug": "vikata-sankashti-2026-04-05",
        "date": "2026-04-05",
        "type": "Sankashti Chaturthi",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Ganesha",
        "shortDescription": "Vikata Sankashti — a traditional fast/vrat observed on this tithi.",
        "description": "Vikata Sankashti — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Kalashtami",
        "slug": "kalashtami-2026-04-10",
        "date": "2026-04-10",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Kalashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Kalashtami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Varuthini Ekadashi",
        "slug": "varuthini-ekadashi-2026-04-13",
        "date": "2026-04-13",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Varuthini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Varuthini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Masik Shivaratri",
        "slug": "masik-shivaratri-2026-04-15",
        "date": "2026-04-15",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Masik Shivaratri — a traditional fast/vrat observed on this tithi.",
        "description": "Masik Shivaratri — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Pradosh Vrat (Budha)",
        "slug": "pradosh-vrat-budha-2026-04-15",
        "date": "2026-04-15",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Vaishakha Amavasya",
        "slug": "vaishakha-amavasya-2026-04-17",
        "date": "2026-04-17",
        "type": "Amavasya Vrat",
        "purpose": [
            "Peace & Happiness"
        ],
        "deity": "Pitru Devta (Ancestors)",
        "shortDescription": "Vaishakha Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
        "description": "Vaishakha Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
    },
    {
        "title": "Sankarshana Chaturthi",
        "slug": "sankarshana-chaturthi-2026-04-20",
        "date": "2026-04-20",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Sankarshana Chaturthi — a traditional fast/vrat observed on this tithi.",
        "description": "Sankarshana Chaturthi — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Masik Durgashtami",
        "slug": "masik-durgashtami-2026-04-24",
        "date": "2026-04-24",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Goddess Durga",
        "shortDescription": "Masik Durgashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Masik Durgashtami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Mohini Ekadashi",
        "slug": "mohini-ekadashi-2026-04-27",
        "date": "2026-04-27",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Mohini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Mohini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Pradosh Vrat (Bhauma)",
        "slug": "pradosh-vrat-bhauma-2026-04-28",
        "date": "2026-04-28",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Buddha Purnima",
        "slug": "buddha-purnima-2026-05-01",
        "date": "2026-05-01",
        "type": "Purnima Vrat",
        "purpose": [
            "Prosperity & Wealth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Birth, enlightenment and nirvana of Gautam Buddha.",
        "description": "Birth, enlightenment and nirvana of Gautam Buddha."
    },
    {
        "title": "Ekadanta Sankashti",
        "slug": "ekadanta-sankashti-2026-05-05",
        "date": "2026-05-05",
        "type": "Sankashti Chaturthi",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Ganesha",
        "shortDescription": "Ekadanta Sankashti — a traditional fast/vrat observed on this tithi.",
        "description": "Ekadanta Sankashti — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Kalashtami",
        "slug": "kalashtami-2026-05-09",
        "date": "2026-05-09",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Kalashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Kalashtami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Apara Ekadashi",
        "slug": "apara-ekadashi-2026-05-13",
        "date": "2026-05-13",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Apara Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Apara Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Pradosh Vrat (Guru)",
        "slug": "pradosh-vrat-guru-2026-05-14",
        "date": "2026-05-14",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Masik Shivaratri",
        "slug": "masik-shivaratri-2026-05-15",
        "date": "2026-05-15",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Masik Shivaratri — a traditional fast/vrat observed on this tithi.",
        "description": "Masik Shivaratri — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Vat Savitri Vrat",
        "slug": "vat-savitri-vrat-2026-05-16",
        "date": "2026-05-16",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Vat Savitri Vrat — a traditional fast/vrat observed on this tithi.",
        "description": "Vat Savitri Vrat — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Jyeshtha Amavasya",
        "slug": "jyeshtha-amavasya-2026-05-16",
        "date": "2026-05-16",
        "type": "Amavasya Vrat",
        "purpose": [
            "Peace & Happiness"
        ],
        "deity": "Pitru Devta (Ancestors)",
        "shortDescription": "Jyeshtha Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
        "description": "Jyeshtha Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
    },
    {
        "title": "Varada Chaturthi",
        "slug": "varada-chaturthi-2026-05-20",
        "date": "2026-05-20",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Varada Chaturthi — a traditional fast/vrat observed on this tithi.",
        "description": "Varada Chaturthi — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Adhika Masik Durgashtami",
        "slug": "adhika-masik-durgashtami-2026-05-23",
        "date": "2026-05-23",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Goddess Durga",
        "shortDescription": "Adhika Masik Durgashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Adhika Masik Durgashtami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Padmini Ekadashi (Adhik)",
        "slug": "padmini-ekadashi-adhik-2026-05-27",
        "date": "2026-05-27",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Padmini Ekadashi (Adhik) — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Padmini Ekadashi (Adhik) — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Pradosh Vrat (Adhik Maas)",
        "slug": "pradosh-vrat-adhik-maas-2026-05-28",
        "date": "2026-05-28",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Adhik Jyeshtha Purnima",
        "slug": "adhik-jyeshtha-purnima-2026-05-31",
        "date": "2026-05-31",
        "type": "Purnima Vrat",
        "purpose": [
            "Prosperity & Wealth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Adhik Jyeshtha Purnima — full moon day, considered auspicious for worship and charity.",
        "description": "Adhik Jyeshtha Purnima — full moon day, considered auspicious for worship and charity."
    },
    {
        "title": "Vibhuvana Sankashti",
        "slug": "vibhuvana-sankashti-2026-06-03",
        "date": "2026-06-03",
        "type": "Sankashti Chaturthi",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Ganesha",
        "shortDescription": "Vibhuvana Sankashti — a traditional fast/vrat observed on this tithi.",
        "description": "Vibhuvana Sankashti — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Adhika Kalashtami",
        "slug": "adhika-kalashtami-2026-06-08",
        "date": "2026-06-08",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Adhika Kalashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Adhika Kalashtami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Parama Ekadashi (Adhik)",
        "slug": "parama-ekadashi-adhik-2026-06-11",
        "date": "2026-06-11",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Parama Ekadashi (Adhik) — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Parama Ekadashi (Adhik) — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Pradosh Vrat (Adhik Maas)",
        "slug": "pradosh-vrat-adhik-maas-2026-06-12",
        "date": "2026-06-12",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Adhika Masik Shivaratri",
        "slug": "adhika-masik-shivaratri-2026-06-13",
        "date": "2026-06-13",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Adhika Masik Shivaratri — a traditional fast/vrat observed on this tithi.",
        "description": "Adhika Masik Shivaratri — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Adhik Maas Samapti",
        "slug": "adhik-maas-samapti-2026-06-15",
        "date": "2026-06-15",
        "type": "Amavasya Vrat",
        "purpose": [
            "Peace & Happiness"
        ],
        "deity": "Pitru Devta (Ancestors)",
        "shortDescription": "Adhik Maas Samapti — new moon day, observed for ancestor worship (Tarpan) and remedies.",
        "description": "Adhik Maas Samapti — new moon day, observed for ancestor worship (Tarpan) and remedies."
    },
    {
        "title": "Pradyumna Chaturthi",
        "slug": "pradyumna-chaturthi-2026-06-18",
        "date": "2026-06-18",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Pradyumna Chaturthi — a traditional fast/vrat observed on this tithi.",
        "description": "Pradyumna Chaturthi — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Masik Durgashtami",
        "slug": "masik-durgashtami-2026-06-22",
        "date": "2026-06-22",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Goddess Durga",
        "shortDescription": "Masik Durgashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Masik Durgashtami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Nirjala Ekadashi",
        "slug": "nirjala-ekadashi-2026-06-25",
        "date": "2026-06-25",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Nirjala Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Nirjala Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Pradosh Vrat (Shani)",
        "slug": "pradosh-vrat-shani-2026-06-27",
        "date": "2026-06-27",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Vat Purnima Vrat",
        "slug": "vat-purnima-vrat-2026-06-29",
        "date": "2026-06-29",
        "type": "Purnima Vrat",
        "purpose": [
            "Prosperity & Wealth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Vat Purnima Vrat — full moon day, considered auspicious for worship and charity.",
        "description": "Vat Purnima Vrat — full moon day, considered auspicious for worship and charity."
    },
    {
        "title": "Krishnapingala Sankashti",
        "slug": "krishnapingala-sankashti-2026-07-03",
        "date": "2026-07-03",
        "type": "Sankashti Chaturthi",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Ganesha",
        "shortDescription": "Krishnapingala Sankashti — a traditional fast/vrat observed on this tithi.",
        "description": "Krishnapingala Sankashti — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Kalashtami",
        "slug": "kalashtami-2026-07-07",
        "date": "2026-07-07",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Kalashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Kalashtami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Yogini Ekadashi",
        "slug": "yogini-ekadashi-2026-07-10",
        "date": "2026-07-10",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Yogini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Yogini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Masik Shivaratri",
        "slug": "masik-shivaratri-2026-07-12",
        "date": "2026-07-12",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Masik Shivaratri — a traditional fast/vrat observed on this tithi.",
        "description": "Masik Shivaratri — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Pradosh Vrat (Ravi)",
        "slug": "pradosh-vrat-ravi-2026-07-12",
        "date": "2026-07-12",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Ashadha Amavasya",
        "slug": "ashadha-amavasya-2026-07-14",
        "date": "2026-07-14",
        "type": "Amavasya Vrat",
        "purpose": [
            "Peace & Happiness"
        ],
        "deity": "Pitru Devta (Ancestors)",
        "shortDescription": "Ashadha Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
        "description": "Ashadha Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
    },
    {
        "title": "Aniruddha Chaturthi",
        "slug": "aniruddha-chaturthi-2026-07-17",
        "date": "2026-07-17",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Aniruddha Chaturthi — a traditional fast/vrat observed on this tithi.",
        "description": "Aniruddha Chaturthi — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Masik Durgashtami",
        "slug": "masik-durgashtami-2026-07-21",
        "date": "2026-07-21",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Goddess Durga",
        "shortDescription": "Masik Durgashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Masik Durgashtami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Devshayani Ekadashi",
        "slug": "devshayani-ekadashi-2026-07-25",
        "date": "2026-07-25",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Devshayani Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Devshayani Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Pradosh Vrat (Ravi)",
        "slug": "pradosh-vrat-ravi-2026-07-26",
        "date": "2026-07-26",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Kokila Vrat",
        "slug": "kokila-vrat-2026-07-28",
        "date": "2026-07-28",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Kokila Vrat — a traditional fast/vrat observed on this tithi.",
        "description": "Kokila Vrat — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Guru Purnima",
        "slug": "guru-purnima-2026-07-29",
        "date": "2026-07-29",
        "type": "Purnima Vrat",
        "purpose": [
            "Prosperity & Wealth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Day to honour teachers and spiritual guides.",
        "description": "Day to honour teachers and spiritual guides."
    },
    {
        "title": "Gajanana Sankashti",
        "slug": "gajanana-sankashti-2026-08-02",
        "date": "2026-08-02",
        "type": "Sankashti Chaturthi",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Ganesha",
        "shortDescription": "Gajanana Sankashti — a traditional fast/vrat observed on this tithi.",
        "description": "Gajanana Sankashti — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Sawan Somwar Vrat 1 (North India)",
        "slug": "sawan-somwar-vrat-1-north-india-2026-08-03",
        "date": "2026-08-03",
        "type": "Somvar Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Sawan Somwar Vrat 1 (North India) — a traditional fast/vrat observed on this tithi.",
        "description": "Sawan Somwar Vrat 1 (North India) — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Mangla Gauri Vrat 1",
        "slug": "mangla-gauri-vrat-1-2026-08-04",
        "date": "2026-08-04",
        "type": "Mangalvar Vrat",
        "purpose": [
            "Marriage & Relationships"
        ],
        "deity": "Goddess Parvati",
        "shortDescription": "Mangla Gauri Vrat 1 — a traditional fast/vrat observed on this tithi.",
        "description": "Mangla Gauri Vrat 1 — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Kalashtami",
        "slug": "kalashtami-2026-08-05",
        "date": "2026-08-05",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Kalashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Kalashtami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Kamika Ekadashi",
        "slug": "kamika-ekadashi-2026-08-09",
        "date": "2026-08-09",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Kamika Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Kamika Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Sawan Somwar Vrat 2 (North India)",
        "slug": "sawan-somwar-vrat-2-north-india-2026-08-10",
        "date": "2026-08-10",
        "type": "Somvar Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Sawan Somwar Vrat 2 (North India) — a traditional fast/vrat observed on this tithi.",
        "description": "Sawan Somwar Vrat 2 (North India) — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Pradosh Vrat (Soma)",
        "slug": "pradosh-vrat-soma-2026-08-10",
        "date": "2026-08-10",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Mangla Gauri Vrat 2",
        "slug": "mangla-gauri-vrat-2-2026-08-11",
        "date": "2026-08-11",
        "type": "Mangalvar Vrat",
        "purpose": [
            "Marriage & Relationships"
        ],
        "deity": "Goddess Parvati",
        "shortDescription": "Mangla Gauri Vrat 2 — a traditional fast/vrat observed on this tithi.",
        "description": "Mangla Gauri Vrat 2 — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Sawan Shivaratri / Masik Shivaratri",
        "slug": "sawan-shivaratri-masik-shivaratri-2026-08-11",
        "date": "2026-08-11",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Sawan Shivaratri / Masik Shivaratri — a traditional fast/vrat observed on this tithi.",
        "description": "Sawan Shivaratri / Masik Shivaratri — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Hariyali Amavasya",
        "slug": "hariyali-amavasya-2026-08-12",
        "date": "2026-08-12",
        "type": "Amavasya Vrat",
        "purpose": [
            "Peace & Happiness"
        ],
        "deity": "Pitru Devta (Ancestors)",
        "shortDescription": "Hariyali Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
        "description": "Hariyali Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
    },
    {
        "title": "Hariyali Teej",
        "slug": "hariyali-teej-2026-08-15",
        "date": "2026-08-15",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Hariyali Teej — a traditional fast/vrat observed on this tithi.",
        "description": "Hariyali Teej — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Durva Ganapati Chaturthi",
        "slug": "durva-ganapati-chaturthi-2026-08-16",
        "date": "2026-08-16",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Durva Ganapati Chaturthi — a traditional fast/vrat observed on this tithi.",
        "description": "Durva Ganapati Chaturthi — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Sawan Somwar Vrat 3 (North India)",
        "slug": "sawan-somwar-vrat-3-north-india-2026-08-17",
        "date": "2026-08-17",
        "type": "Somvar Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Sawan Somwar Vrat 3 (North India) — a traditional fast/vrat observed on this tithi.",
        "description": "Sawan Somwar Vrat 3 (North India) — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Mangla Gauri Vrat 3",
        "slug": "mangla-gauri-vrat-3-2026-08-18",
        "date": "2026-08-18",
        "type": "Mangalvar Vrat",
        "purpose": [
            "Marriage & Relationships"
        ],
        "deity": "Goddess Parvati",
        "shortDescription": "Mangla Gauri Vrat 3 — a traditional fast/vrat observed on this tithi.",
        "description": "Mangla Gauri Vrat 3 — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Masik Durgashtami",
        "slug": "masik-durgashtami-2026-08-20",
        "date": "2026-08-20",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Goddess Durga",
        "shortDescription": "Masik Durgashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Masik Durgashtami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Putrada Ekadashi",
        "slug": "putrada-ekadashi-2026-08-23",
        "date": "2026-08-23",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Putrada Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Putrada Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Sawan Somwar Vrat 4 (North India)",
        "slug": "sawan-somwar-vrat-4-north-india-2026-08-24",
        "date": "2026-08-24",
        "type": "Somvar Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Sawan Somwar Vrat 4 (North India) — a traditional fast/vrat observed on this tithi.",
        "description": "Sawan Somwar Vrat 4 (North India) — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Mangla Gauri Vrat 4",
        "slug": "mangla-gauri-vrat-4-2026-08-25",
        "date": "2026-08-25",
        "type": "Mangalvar Vrat",
        "purpose": [
            "Marriage & Relationships"
        ],
        "deity": "Goddess Parvati",
        "shortDescription": "Mangla Gauri Vrat 4 — a traditional fast/vrat observed on this tithi.",
        "description": "Mangla Gauri Vrat 4 — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Pradosh Vrat (Bhauma)",
        "slug": "pradosh-vrat-bhauma-2026-08-25",
        "date": "2026-08-25",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Varalakshmi Vrat",
        "slug": "varalakshmi-vrat-2026-08-28",
        "date": "2026-08-28",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Varalakshmi Vrat — a traditional fast/vrat observed on this tithi.",
        "description": "Varalakshmi Vrat — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Heramba Sankashti / Bahula Chaturthi",
        "slug": "heramba-sankashti-bahula-chaturthi-2026-08-31",
        "date": "2026-08-31",
        "type": "Sankashti Chaturthi",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Ganesha",
        "shortDescription": "Heramba Sankashti / Bahula Chaturthi — a traditional fast/vrat observed on this tithi.",
        "description": "Heramba Sankashti / Bahula Chaturthi — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Kajari Teej",
        "slug": "kajari-teej-2026-08-31",
        "date": "2026-08-31",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Kajari Teej — a traditional fast/vrat observed on this tithi.",
        "description": "Kajari Teej — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Kalashtami",
        "slug": "kalashtami-2026-09-04",
        "date": "2026-09-04",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Kalashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Kalashtami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Aja Ekadashi",
        "slug": "aja-ekadashi-2026-09-07",
        "date": "2026-09-07",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Aja Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Aja Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Pradosh Vrat (Bhauma)",
        "slug": "pradosh-vrat-bhauma-2026-09-08",
        "date": "2026-09-08",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Masik Shivaratri",
        "slug": "masik-shivaratri-2026-09-09",
        "date": "2026-09-09",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Masik Shivaratri — a traditional fast/vrat observed on this tithi.",
        "description": "Masik Shivaratri — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Bhadrapada Amavasya",
        "slug": "bhadrapada-amavasya-2026-09-11",
        "date": "2026-09-11",
        "type": "Amavasya Vrat",
        "purpose": [
            "Peace & Happiness"
        ],
        "deity": "Pitru Devta (Ancestors)",
        "shortDescription": "Bhadrapada Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
        "description": "Bhadrapada Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
    },
    {
        "title": "Hartalika Teej",
        "slug": "hartalika-teej-2026-09-14",
        "date": "2026-09-14",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Hartalika Teej — a traditional fast/vrat observed on this tithi.",
        "description": "Hartalika Teej — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Rishi Panchami",
        "slug": "rishi-panchami-2026-09-15",
        "date": "2026-09-15",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Rishi Panchami — a traditional fast/vrat observed on this tithi.",
        "description": "Rishi Panchami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Parivartini Ekadashi",
        "slug": "parivartini-ekadashi-2026-09-22",
        "date": "2026-09-22",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Parivartini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Parivartini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Pradosh Vrat (Guru)",
        "slug": "pradosh-vrat-guru-2026-09-24",
        "date": "2026-09-24",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Anant Chaturdashi",
        "slug": "anant-chaturdashi-2026-09-25",
        "date": "2026-09-25",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Anant Chaturdashi — a traditional fast/vrat observed on this tithi.",
        "description": "Anant Chaturdashi — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Bhadrapada Purnima",
        "slug": "bhadrapada-purnima-2026-09-26",
        "date": "2026-09-26",
        "type": "Purnima Vrat",
        "purpose": [
            "Prosperity & Wealth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Bhadrapada Purnima — full moon day, considered auspicious for worship and charity.",
        "description": "Bhadrapada Purnima — full moon day, considered auspicious for worship and charity."
    },
    {
        "title": "Vighnaraja Sankashti",
        "slug": "vighnaraja-sankashti-2026-09-29",
        "date": "2026-09-29",
        "type": "Sankashti Chaturthi",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Ganesha",
        "shortDescription": "Vighnaraja Sankashti — a traditional fast/vrat observed on this tithi.",
        "description": "Vighnaraja Sankashti — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Kalashtami",
        "slug": "kalashtami-2026-10-03",
        "date": "2026-10-03",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Kalashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Kalashtami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Indira Ekadashi",
        "slug": "indira-ekadashi-2026-10-06",
        "date": "2026-10-06",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Indira Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Indira Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Masik Shivaratri",
        "slug": "masik-shivaratri-2026-10-08",
        "date": "2026-10-08",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Masik Shivaratri — a traditional fast/vrat observed on this tithi.",
        "description": "Masik Shivaratri — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Pradosh Vrat (Guru)",
        "slug": "pradosh-vrat-guru-2026-10-08",
        "date": "2026-10-08",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Mahalaya Amavasya",
        "slug": "mahalaya-amavasya-2026-10-10",
        "date": "2026-10-10",
        "type": "Amavasya Vrat",
        "purpose": [
            "Peace & Happiness"
        ],
        "deity": "Pitru Devta (Ancestors)",
        "shortDescription": "Mahalaya Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
        "description": "Mahalaya Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
    },
    {
        "title": "Kapardisha Chaturthi",
        "slug": "kapardisha-chaturthi-2026-10-14",
        "date": "2026-10-14",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Kapardisha Chaturthi — a traditional fast/vrat observed on this tithi.",
        "description": "Kapardisha Chaturthi — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Papankusha Ekadashi",
        "slug": "papankusha-ekadashi-2026-10-22",
        "date": "2026-10-22",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Papankusha Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Papankusha Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Pradosh Vrat (Shukra)",
        "slug": "pradosh-vrat-shukra-2026-10-23",
        "date": "2026-10-23",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Sharad Purnima",
        "slug": "sharad-purnima-2026-10-25",
        "date": "2026-10-25",
        "type": "Purnima Vrat",
        "purpose": [
            "Prosperity & Wealth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Sharad Purnima — full moon day, considered auspicious for worship and charity.",
        "description": "Sharad Purnima — full moon day, considered auspicious for worship and charity."
    },
    {
        "title": "Karwa Chauth",
        "slug": "karwa-chauth-2026-10-29",
        "date": "2026-10-29",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Married women fast for their husbands' wellbeing.",
        "description": "Married women fast for their husbands' wellbeing."
    },
    {
        "title": "Vakratunda Sankashti",
        "slug": "vakratunda-sankashti-2026-10-29",
        "date": "2026-10-29",
        "type": "Sankashti Chaturthi",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Ganesha",
        "shortDescription": "Vakratunda Sankashti — a traditional fast/vrat observed on this tithi.",
        "description": "Vakratunda Sankashti — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Ahoi Ashtami",
        "slug": "ahoi-ashtami-2026-11-01",
        "date": "2026-11-01",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Ahoi Ashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Ahoi Ashtami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Kalashtami",
        "slug": "kalashtami-2026-11-01",
        "date": "2026-11-01",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Kalashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Kalashtami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Govatsa Dwadashi",
        "slug": "govatsa-dwadashi-2026-11-05",
        "date": "2026-11-05",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Govatsa Dwadashi — a traditional fast/vrat observed on this tithi.",
        "description": "Govatsa Dwadashi — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Rama Ekadashi",
        "slug": "rama-ekadashi-2026-11-05",
        "date": "2026-11-05",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Rama Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Rama Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Pradosh Vrat (Shukra)",
        "slug": "pradosh-vrat-shukra-2026-11-06",
        "date": "2026-11-06",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Masik Shivaratri",
        "slug": "masik-shivaratri-2026-11-07",
        "date": "2026-11-07",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Masik Shivaratri — a traditional fast/vrat observed on this tithi.",
        "description": "Masik Shivaratri — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Kartik Amavasya",
        "slug": "kartik-amavasya-2026-11-09",
        "date": "2026-11-09",
        "type": "Amavasya Vrat",
        "purpose": [
            "Peace & Happiness"
        ],
        "deity": "Pitru Devta (Ancestors)",
        "shortDescription": "Kartik Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
        "description": "Kartik Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
    },
    {
        "title": "Labh Chaturthi",
        "slug": "labh-chaturthi-2026-11-13",
        "date": "2026-11-13",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Labh Chaturthi — a traditional fast/vrat observed on this tithi.",
        "description": "Labh Chaturthi — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Masik Durgashtami",
        "slug": "masik-durgashtami-2026-11-17",
        "date": "2026-11-17",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Goddess Durga",
        "shortDescription": "Masik Durgashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Masik Durgashtami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Devuthani Ekadashi",
        "slug": "devuthani-ekadashi-2026-11-20",
        "date": "2026-11-20",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Devuthani Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Devuthani Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Pradosh Vrat (Ravi)",
        "slug": "pradosh-vrat-ravi-2026-11-22",
        "date": "2026-11-22",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Kartik Purnima",
        "slug": "kartik-purnima-2026-11-24",
        "date": "2026-11-24",
        "type": "Purnima Vrat",
        "purpose": [
            "Prosperity & Wealth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Full moon of Kartik month, sacred bathing day.",
        "description": "Full moon of Kartik month, sacred bathing day."
    },
    {
        "title": "Ganadhipa Sankashti",
        "slug": "ganadhipa-sankashti-2026-11-27",
        "date": "2026-11-27",
        "type": "Sankashti Chaturthi",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Ganesha",
        "shortDescription": "Ganadhipa Sankashti — a traditional fast/vrat observed on this tithi.",
        "description": "Ganadhipa Sankashti — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Utpanna Ekadashi",
        "slug": "utpanna-ekadashi-2026-12-04",
        "date": "2026-12-04",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Utpanna Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Utpanna Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Pradosh Vrat (Soma)",
        "slug": "pradosh-vrat-soma-2026-12-06",
        "date": "2026-12-06",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Masik Shivaratri",
        "slug": "masik-shivaratri-2026-12-07",
        "date": "2026-12-07",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Masik Shivaratri — a traditional fast/vrat observed on this tithi.",
        "description": "Masik Shivaratri — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Margashirsh Amavasya",
        "slug": "margashirsh-amavasya-2026-12-08",
        "date": "2026-12-08",
        "type": "Amavasya Vrat",
        "purpose": [
            "Peace & Happiness"
        ],
        "deity": "Pitru Devta (Ancestors)",
        "shortDescription": "Margashirsh Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
        "description": "Margashirsh Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
    },
    {
        "title": "Krichchhra Chaturthi",
        "slug": "krichchhra-chaturthi-2026-12-13",
        "date": "2026-12-13",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Krichchhra Chaturthi — a traditional fast/vrat observed on this tithi.",
        "description": "Krichchhra Chaturthi — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Masik Durgashtami",
        "slug": "masik-durgashtami-2026-12-17",
        "date": "2026-12-17",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Goddess Durga",
        "shortDescription": "Masik Durgashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Masik Durgashtami — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Mokshada Ekadashi",
        "slug": "mokshada-ekadashi-2026-12-20",
        "date": "2026-12-20",
        "type": "Ekadashi",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Mokshada Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Mokshada Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "title": "Pradosh Vrat (Bhauma)",
        "slug": "pradosh-vrat-bhauma-2026-12-21",
        "date": "2026-12-21",
        "type": "Pradosh",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Shiva",
        "shortDescription": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
        "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
    },
    {
        "title": "Margashirsha Purnima Vrat",
        "slug": "margashirsha-purnima-vrat-2026-12-23",
        "date": "2026-12-23",
        "type": "Purnima Vrat",
        "purpose": [
            "Prosperity & Wealth"
        ],
        "deity": "Lord Vishnu",
        "shortDescription": "Margashirsha Purnima Vrat — full moon day, considered auspicious for worship and charity.",
        "description": "Margashirsha Purnima Vrat — full moon day, considered auspicious for worship and charity."
    },
    {
        "title": "Akhuratha Sankashti",
        "slug": "akhuratha-sankashti-2026-12-26",
        "date": "2026-12-26",
        "type": "Sankashti Chaturthi",
        "purpose": [
            "Removal of Obstacles"
        ],
        "deity": "Lord Ganesha",
        "shortDescription": "Akhuratha Sankashti — a traditional fast/vrat observed on this tithi.",
        "description": "Akhuratha Sankashti — a traditional fast/vrat observed on this tithi."
    },
    {
        "title": "Kalashtami",
        "slug": "kalashtami-2026-12-30",
        "date": "2026-12-30",
        "type": "Other Vrat",
        "purpose": [
            "Spiritual Growth"
        ],
        "deity": "",
        "shortDescription": "Kalashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Kalashtami — a traditional fast/vrat observed on this tithi."
    }
];

const run = async () => {
    if (!process.env.MONGODB_URI) {
        console.error(
            "MONGODB_URI is not set in the environment. Aborting seed."
        );
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for Vrat seed.");

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const item of VRAT_SEED_DATA) {
        try {
            const existing = await Vrat.findOne({ slug: item.slug });

            if (existing) {
                skipped += 1;
                console.log(`SKIP (already exists): ${item.title} (${item.date})`);
                continue;
            }

            await Vrat.create({
                title: item.title,
                slug: item.slug,
                date: item.date,
                type: item.type,
                purpose: item.purpose,
                deity: item.deity,
                shortDescription: item.shortDescription,
                description: item.description,
                status: true,
            });

            created += 1;
            console.log(`CREATED: ${item.title} (${item.date}) -> ${item.type}`);
        } catch (error) {
            failed += 1;
            console.error(`FAILED: ${item.title} (${item.date}) -> ${error.message}`);
        }
    }

    console.log("\n===== Seed Summary =====");
    console.log(`Total in dataset : ${VRAT_SEED_DATA.length}`);
    console.log(`Created          : ${created}`);
    console.log(`Skipped (exist)  : ${skipped}`);
    console.log(`Failed           : ${failed}`);
    console.log("=========================\n");

    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
};

run().catch(async (error) => {
    console.error("Seed script crashed:", error);
    try {
        await mongoose.disconnect();
    } catch (_) {
        // ignore
    }
    process.exit(1);
});