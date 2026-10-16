/**
 * One-time seed script.
 *
 * Populates the `Festival` collection (used by /api/festivals and the
 * "Festivals" page) from the same hand-curated 2026 dataset that used to
 * live directly in frontend/src/data/festivals-2026.js.
 *
 * Unlike seed-vrat-from-festivals.js (which only pulls the fasting-related
 * categories), this script seeds EVERY category from that file — Festival,
 * Ekadashi, Pradosh Vrat, Vrat, Purnima, Amavasya, Shubh Din — because the
 * /festivals page displays the full combined list, exactly like the old
 * static FESTIVALS_2026 array did.
 *
 * SAFE / IDEMPOTENT:
 * - Skips any entry whose slug already exists in the Festival collection,
 *   so it is safe to re-run.
 * - Does not touch/delete any existing Festival document.
 *
 * Usage (run once from the backend project root):
 *   node src/scripts/seed-festivals-from-static.js
 */

"use strict";

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const Festival = require("../models/Festival");

// Ported as-is from frontend/src/data/festivals-2026.js (FESTIVALS_2026).
const FESTIVAL_SEED_DATA =
    [
        {
            "name": "Pradosh Vrat (Guru)",
            "slug": "pradosh-vrat-guru-2026-01-01",
            "date": "2026-01-01",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Shakambhari Purnima",
            "slug": "shakambhari-purnima-2026-01-03",
            "date": "2026-01-03",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Shakambhari Purnima celebrations.",
            "description": "A Hindu festival day observed as part of the Shakambhari Purnima celebrations."
        },
        {
            "name": "Paush Purnima",
            "slug": "paush-purnima-2026-01-03",
            "date": "2026-01-03",
            "category": "Purnima",
            "blurb": "Paush Purnima — full moon day, considered auspicious for worship and charity.",
            "description": "Paush Purnima — full moon day, considered auspicious for worship and charity."
        },
        {
            "name": "Guru Gobind Singh Jayanti (Nanakshahi date)",
            "slug": "guru-gobind-singh-jayanti-nanakshahi-date-2026-01-05",
            "date": "2026-01-05",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Guru Gobind Singh Jayanti (Nanakshahi date) celebrations.",
            "description": "A Hindu festival day observed as part of the Guru Gobind Singh Jayanti (Nanakshahi date) celebrations."
        },
        {
            "name": "Lambodara Sankashti / Sakat Chauth",
            "slug": "lambodara-sankashti-sakat-chauth-2026-01-06",
            "date": "2026-01-06",
            "category": "Vrat",
            "blurb": "Lambodara Sankashti / Sakat Chauth — a traditional fast/vrat observed on this tithi.",
            "description": "Lambodara Sankashti / Sakat Chauth — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Kalashtami",
            "slug": "kalashtami-2026-01-10",
            "date": "2026-01-10",
            "category": "Vrat",
            "blurb": "Kalashtami — a traditional fast/vrat observed on this tithi.",
            "description": "Kalashtami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Bhogi Pandigai",
            "slug": "bhogi-pandigai-2026-01-13",
            "date": "2026-01-13",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Bhogi Pandigai celebrations.",
            "description": "A Hindu festival day observed as part of the Bhogi Pandigai celebrations."
        },
        {
            "name": "Lohri",
            "slug": "lohri-2026-01-13",
            "date": "2026-01-13",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Lohri celebrations.",
            "description": "A Hindu festival day observed as part of the Lohri celebrations."
        },
        {
            "name": "Makar Sankranti",
            "slug": "makar-sankranti-2026-01-14",
            "date": "2026-01-14",
            "category": "Festival",
            "blurb": "Sun enters Capricorn — kite flying, til-gud, harvest thanksgiving.",
            "description": "Sun enters Capricorn — kite flying, til-gud, harvest thanksgiving."
        },
        {
            "name": "Pongal / Thai Pongal",
            "slug": "pongal-thai-pongal-2026-01-14",
            "date": "2026-01-14",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Pongal / Thai Pongal celebrations.",
            "description": "A Hindu festival day observed as part of the Pongal / Thai Pongal celebrations."
        },
        {
            "name": "Shattila Ekadashi",
            "slug": "shattila-ekadashi-2026-01-14",
            "date": "2026-01-14",
            "category": "Ekadashi",
            "blurb": "Shattila Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Shattila Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Mattu Pongal / Magh Bihu",
            "slug": "mattu-pongal-magh-bihu-2026-01-15",
            "date": "2026-01-15",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Mattu Pongal / Magh Bihu celebrations.",
            "description": "A Hindu festival day observed as part of the Mattu Pongal / Magh Bihu celebrations."
        },
        {
            "name": "Masik Shivaratri",
            "slug": "masik-shivaratri-2026-01-16",
            "date": "2026-01-16",
            "category": "Vrat",
            "blurb": "Masik Shivaratri — a traditional fast/vrat observed on this tithi.",
            "description": "Masik Shivaratri — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Pradosh Vrat (Shukra)",
            "slug": "pradosh-vrat-shukra-2026-01-16",
            "date": "2026-01-16",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Mauni Amavasya",
            "slug": "mauni-amavasya-2026-01-18",
            "date": "2026-01-18",
            "category": "Amavasya",
            "blurb": "Mauni Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
            "description": "Mauni Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
        },
        {
            "name": "Magh Gupt Navratri Begins",
            "slug": "magh-gupt-navratri-begins-2026-01-19",
            "date": "2026-01-19",
            "category": "Shubh Din",
            "blurb": "Magh Gupt Navratri Begins — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Magh Gupt Navratri Begins — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Chandra Darshana",
            "slug": "chandra-darshana-2026-01-20",
            "date": "2026-01-20",
            "category": "Shubh Din",
            "blurb": "Chandra Darshana — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Chandra Darshana — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Ganesha Jayanti / Gauriganesha Chaturthi",
            "slug": "ganesha-jayanti-gauriganesha-chaturthi-2026-01-22",
            "date": "2026-01-22",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Ganesha Jayanti / Gauriganesha Chaturthi celebrations.",
            "description": "A Hindu festival day observed as part of the Ganesha Jayanti / Gauriganesha Chaturthi celebrations."
        },
        {
            "name": "Vasant Panchami",
            "slug": "vasant-panchami-2026-01-23",
            "date": "2026-01-23",
            "category": "Festival",
            "blurb": "Worship of Goddess Saraswati; onset of spring.",
            "description": "Worship of Goddess Saraswati; onset of spring."
        },
        {
            "name": "Ratha Saptami",
            "slug": "ratha-saptami-2026-01-25",
            "date": "2026-01-25",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Ratha Saptami celebrations.",
            "description": "A Hindu festival day observed as part of the Ratha Saptami celebrations."
        },
        {
            "name": "Masik Durgashtami / Bhishma Ashtami",
            "slug": "masik-durgashtami-bhishma-ashtami-2026-01-26",
            "date": "2026-01-26",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Masik Durgashtami / Bhishma Ashtami celebrations.",
            "description": "A Hindu festival day observed as part of the Masik Durgashtami / Bhishma Ashtami celebrations."
        },
        {
            "name": "Masik Karthigai",
            "slug": "masik-karthigai-2026-01-27",
            "date": "2026-01-27",
            "category": "Shubh Din",
            "blurb": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Jaya Ekadashi",
            "slug": "jaya-ekadashi-2026-01-29",
            "date": "2026-01-29",
            "category": "Ekadashi",
            "blurb": "Jaya Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Jaya Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Pradosh Vrat (Shukra)",
            "slug": "pradosh-vrat-shukra-2026-01-30",
            "date": "2026-01-30",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Magha Purnima",
            "slug": "magha-purnima-2026-02-01",
            "date": "2026-02-01",
            "category": "Purnima",
            "blurb": "Magha Purnima — full moon day, considered auspicious for worship and charity.",
            "description": "Magha Purnima — full moon day, considered auspicious for worship and charity."
        },
        {
            "name": "Dwijapriya Sankashti",
            "slug": "dwijapriya-sankashti-2026-02-05",
            "date": "2026-02-05",
            "category": "Vrat",
            "blurb": "Dwijapriya Sankashti — a traditional fast/vrat observed on this tithi.",
            "description": "Dwijapriya Sankashti — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Kalashtami",
            "slug": "kalashtami-2026-02-09",
            "date": "2026-02-09",
            "category": "Vrat",
            "blurb": "Kalashtami — a traditional fast/vrat observed on this tithi.",
            "description": "Kalashtami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Vijaya Ekadashi",
            "slug": "vijaya-ekadashi-2026-02-13",
            "date": "2026-02-13",
            "category": "Ekadashi",
            "blurb": "Vijaya Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Vijaya Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Kumbha Sankranti",
            "slug": "kumbha-sankranti-2026-02-13",
            "date": "2026-02-13",
            "category": "Shubh Din",
            "blurb": "Kumbha Sankranti — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Kumbha Sankranti — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Pradosh Vrat (Shani)",
            "slug": "pradosh-vrat-shani-2026-02-14",
            "date": "2026-02-14",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Maha Shivratri",
            "slug": "maha-shivratri-2026-02-15",
            "date": "2026-02-15",
            "category": "Festival",
            "blurb": "Night of Lord Shiva — fasting and jagran.",
            "description": "Night of Lord Shiva — fasting and jagran."
        },
        {
            "name": "Phalguna Amavasya",
            "slug": "phalguna-amavasya-2026-02-17",
            "date": "2026-02-17",
            "category": "Amavasya",
            "blurb": "Phalguna Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
            "description": "Phalguna Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
        },
        {
            "name": "Dhundhiraja Chaturthi",
            "slug": "dhundhiraja-chaturthi-2026-02-21",
            "date": "2026-02-21",
            "category": "Vrat",
            "blurb": "Dhundhiraja Chaturthi — a traditional fast/vrat observed on this tithi.",
            "description": "Dhundhiraja Chaturthi — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Masik Karthigai",
            "slug": "masik-karthigai-2026-02-23",
            "date": "2026-02-23",
            "category": "Shubh Din",
            "blurb": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Masik Durgashtami",
            "slug": "masik-durgashtami-2026-02-24",
            "date": "2026-02-24",
            "category": "Vrat",
            "blurb": "Masik Durgashtami — a traditional fast/vrat observed on this tithi.",
            "description": "Masik Durgashtami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Amalaki Ekadashi",
            "slug": "amalaki-ekadashi-2026-02-27",
            "date": "2026-02-27",
            "category": "Ekadashi",
            "blurb": "Amalaki Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Amalaki Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Pradosh Vrat (Ravi)",
            "slug": "pradosh-vrat-ravi-2026-03-01",
            "date": "2026-03-01",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Holika Dahan",
            "slug": "holika-dahan-2026-03-03",
            "date": "2026-03-03",
            "category": "Festival",
            "blurb": "Bonfire night before Holi, marking good over evil.",
            "description": "Bonfire night before Holi, marking good over evil."
        },
        {
            "name": "Holi (Dhulandi)",
            "slug": "holi-dhulandi-2026-03-04",
            "date": "2026-03-04",
            "category": "Festival",
            "blurb": "Festival of colours celebrating spring and love.",
            "description": "Festival of colours celebrating spring and love."
        },
        {
            "name": "Bhalachandra Sankashti",
            "slug": "bhalachandra-sankashti-2026-03-06",
            "date": "2026-03-06",
            "category": "Vrat",
            "blurb": "Bhalachandra Sankashti — a traditional fast/vrat observed on this tithi.",
            "description": "Bhalachandra Sankashti — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Rang Panchami",
            "slug": "rang-panchami-2026-03-08",
            "date": "2026-03-08",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Rang Panchami celebrations.",
            "description": "A Hindu festival day observed as part of the Rang Panchami celebrations."
        },
        {
            "name": "Sheetala Saptami",
            "slug": "sheetala-saptami-2026-03-10",
            "date": "2026-03-10",
            "category": "Vrat",
            "blurb": "Sheetala Saptami — a traditional fast/vrat observed on this tithi.",
            "description": "Sheetala Saptami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Sheetala Ashtami / Basoda",
            "slug": "sheetala-ashtami-basoda-2026-03-11",
            "date": "2026-03-11",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Sheetala Ashtami / Basoda celebrations.",
            "description": "A Hindu festival day observed as part of the Sheetala Ashtami / Basoda celebrations."
        },
        {
            "name": "Kalashtami",
            "slug": "kalashtami-2026-03-11",
            "date": "2026-03-11",
            "category": "Vrat",
            "blurb": "Kalashtami — a traditional fast/vrat observed on this tithi.",
            "description": "Kalashtami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Papmochani Ekadashi",
            "slug": "papmochani-ekadashi-2026-03-15",
            "date": "2026-03-15",
            "category": "Ekadashi",
            "blurb": "Papmochani Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Papmochani Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Meena Sankranti",
            "slug": "meena-sankranti-2026-03-15",
            "date": "2026-03-15",
            "category": "Shubh Din",
            "blurb": "Meena Sankranti — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Meena Sankranti — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Pradosh Vrat (Soma)",
            "slug": "pradosh-vrat-soma-2026-03-16",
            "date": "2026-03-16",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Masik Shivaratri",
            "slug": "masik-shivaratri-2026-03-17",
            "date": "2026-03-17",
            "category": "Vrat",
            "blurb": "Masik Shivaratri — a traditional fast/vrat observed on this tithi.",
            "description": "Masik Shivaratri — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Chaitra Amavasya",
            "slug": "chaitra-amavasya-2026-03-18",
            "date": "2026-03-18",
            "category": "Amavasya",
            "blurb": "Chaitra Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
            "description": "Chaitra Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
        },
        {
            "name": "Chaitra Navratri / Gudi Padwa",
            "slug": "chaitra-navratri-gudi-padwa-2026-03-19",
            "date": "2026-03-19",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Chaitra Navratri / Gudi Padwa celebrations.",
            "description": "A Hindu festival day observed as part of the Chaitra Navratri / Gudi Padwa celebrations."
        },
        {
            "name": "Gangaur",
            "slug": "gangaur-2026-03-21",
            "date": "2026-03-21",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Gangaur celebrations.",
            "description": "A Hindu festival day observed as part of the Gangaur celebrations."
        },
        {
            "name": "Vasudeva Chaturthi",
            "slug": "vasudeva-chaturthi-2026-03-22",
            "date": "2026-03-22",
            "category": "Vrat",
            "blurb": "Vasudeva Chaturthi — a traditional fast/vrat observed on this tithi.",
            "description": "Vasudeva Chaturthi — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Masik Karthigai",
            "slug": "masik-karthigai-2026-03-23",
            "date": "2026-03-23",
            "category": "Shubh Din",
            "blurb": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Yamuna Chhath",
            "slug": "yamuna-chhath-2026-03-24",
            "date": "2026-03-24",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Yamuna Chhath celebrations.",
            "description": "A Hindu festival day observed as part of the Yamuna Chhath celebrations."
        },
        {
            "name": "Ram Navami",
            "slug": "ram-navami-2026-03-26",
            "date": "2026-03-26",
            "category": "Festival",
            "blurb": "Birth anniversary of Lord Rama.",
            "description": "Birth anniversary of Lord Rama."
        },
        {
            "name": "Masik Durgashtami / Ashoka Ashtami",
            "slug": "masik-durgashtami-ashoka-ashtami-2026-03-26",
            "date": "2026-03-26",
            "category": "Vrat",
            "blurb": "Masik Durgashtami / Ashoka Ashtami — a traditional fast/vrat observed on this tithi.",
            "description": "Masik Durgashtami / Ashoka Ashtami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Kamada Ekadashi",
            "slug": "kamada-ekadashi-2026-03-29",
            "date": "2026-03-29",
            "category": "Ekadashi",
            "blurb": "Kamada Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Kamada Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Pradosh Vrat (Soma)",
            "slug": "pradosh-vrat-soma-2026-03-30",
            "date": "2026-03-30",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Hanuman Jayanti",
            "slug": "hanuman-jayanti-2026-04-02",
            "date": "2026-04-02",
            "category": "Festival",
            "blurb": "Birth celebration of Lord Hanuman.",
            "description": "Birth celebration of Lord Hanuman."
        },
        {
            "name": "Vikata Sankashti",
            "slug": "vikata-sankashti-2026-04-05",
            "date": "2026-04-05",
            "category": "Vrat",
            "blurb": "Vikata Sankashti — a traditional fast/vrat observed on this tithi.",
            "description": "Vikata Sankashti — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Kalashtami",
            "slug": "kalashtami-2026-04-10",
            "date": "2026-04-10",
            "category": "Vrat",
            "blurb": "Kalashtami — a traditional fast/vrat observed on this tithi.",
            "description": "Kalashtami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Varuthini Ekadashi",
            "slug": "varuthini-ekadashi-2026-04-13",
            "date": "2026-04-13",
            "category": "Ekadashi",
            "blurb": "Varuthini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Varuthini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Mesha Sankranti / Baisakhi",
            "slug": "mesha-sankranti-baisakhi-2026-04-14",
            "date": "2026-04-14",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Mesha Sankranti / Baisakhi celebrations.",
            "description": "A Hindu festival day observed as part of the Mesha Sankranti / Baisakhi celebrations."
        },
        {
            "name": "Masik Shivaratri",
            "slug": "masik-shivaratri-2026-04-15",
            "date": "2026-04-15",
            "category": "Vrat",
            "blurb": "Masik Shivaratri — a traditional fast/vrat observed on this tithi.",
            "description": "Masik Shivaratri — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Pradosh Vrat (Budha)",
            "slug": "pradosh-vrat-budha-2026-04-15",
            "date": "2026-04-15",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Vaishakha Amavasya",
            "slug": "vaishakha-amavasya-2026-04-17",
            "date": "2026-04-17",
            "category": "Amavasya",
            "blurb": "Vaishakha Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
            "description": "Vaishakha Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
        },
        {
            "name": "Parashurama Jayanti",
            "slug": "parashurama-jayanti-2026-04-19",
            "date": "2026-04-19",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Parashurama Jayanti celebrations.",
            "description": "A Hindu festival day observed as part of the Parashurama Jayanti celebrations."
        },
        {
            "name": "Akshaya Tritiya",
            "slug": "akshaya-tritiya-2026-04-19",
            "date": "2026-04-19",
            "category": "Shubh Din",
            "blurb": "Auspicious day for new beginnings and gold purchase.",
            "description": "Auspicious day for new beginnings and gold purchase."
        },
        {
            "name": "Masik Karthigai",
            "slug": "masik-karthigai-2026-04-19",
            "date": "2026-04-19",
            "category": "Shubh Din",
            "blurb": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Sankarshana Chaturthi",
            "slug": "sankarshana-chaturthi-2026-04-20",
            "date": "2026-04-20",
            "category": "Vrat",
            "blurb": "Sankarshana Chaturthi — a traditional fast/vrat observed on this tithi.",
            "description": "Sankarshana Chaturthi — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Ganga Saptami",
            "slug": "ganga-saptami-2026-04-23",
            "date": "2026-04-23",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Ganga Saptami celebrations.",
            "description": "A Hindu festival day observed as part of the Ganga Saptami celebrations."
        },
        {
            "name": "Masik Durgashtami",
            "slug": "masik-durgashtami-2026-04-24",
            "date": "2026-04-24",
            "category": "Vrat",
            "blurb": "Masik Durgashtami — a traditional fast/vrat observed on this tithi.",
            "description": "Masik Durgashtami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Sita Navami",
            "slug": "sita-navami-2026-04-25",
            "date": "2026-04-25",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Sita Navami celebrations.",
            "description": "A Hindu festival day observed as part of the Sita Navami celebrations."
        },
        {
            "name": "Mohini Ekadashi",
            "slug": "mohini-ekadashi-2026-04-27",
            "date": "2026-04-27",
            "category": "Ekadashi",
            "blurb": "Mohini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Mohini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Pradosh Vrat (Bhauma)",
            "slug": "pradosh-vrat-bhauma-2026-04-28",
            "date": "2026-04-28",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Narasimha Jayanti",
            "slug": "narasimha-jayanti-2026-04-30",
            "date": "2026-04-30",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Narasimha Jayanti celebrations.",
            "description": "A Hindu festival day observed as part of the Narasimha Jayanti celebrations."
        },
        {
            "name": "Buddha Purnima",
            "slug": "buddha-purnima-2026-05-01",
            "date": "2026-05-01",
            "category": "Purnima",
            "blurb": "Birth, enlightenment and nirvana of Gautam Buddha.",
            "description": "Birth, enlightenment and nirvana of Gautam Buddha."
        },
        {
            "name": "Narada Jayanti",
            "slug": "narada-jayanti-2026-05-02",
            "date": "2026-05-02",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Narada Jayanti celebrations.",
            "description": "A Hindu festival day observed as part of the Narada Jayanti celebrations."
        },
        {
            "name": "Ekadanta Sankashti",
            "slug": "ekadanta-sankashti-2026-05-05",
            "date": "2026-05-05",
            "category": "Vrat",
            "blurb": "Ekadanta Sankashti — a traditional fast/vrat observed on this tithi.",
            "description": "Ekadanta Sankashti — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Kalashtami",
            "slug": "kalashtami-2026-05-09",
            "date": "2026-05-09",
            "category": "Vrat",
            "blurb": "Kalashtami — a traditional fast/vrat observed on this tithi.",
            "description": "Kalashtami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Apara Ekadashi",
            "slug": "apara-ekadashi-2026-05-13",
            "date": "2026-05-13",
            "category": "Ekadashi",
            "blurb": "Apara Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Apara Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Pradosh Vrat (Guru)",
            "slug": "pradosh-vrat-guru-2026-05-14",
            "date": "2026-05-14",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Masik Shivaratri",
            "slug": "masik-shivaratri-2026-05-15",
            "date": "2026-05-15",
            "category": "Vrat",
            "blurb": "Masik Shivaratri — a traditional fast/vrat observed on this tithi.",
            "description": "Masik Shivaratri — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Vrishabha Sankranti",
            "slug": "vrishabha-sankranti-2026-05-15",
            "date": "2026-05-15",
            "category": "Shubh Din",
            "blurb": "Vrishabha Sankranti — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Vrishabha Sankranti — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Shani Jayanti",
            "slug": "shani-jayanti-2026-05-16",
            "date": "2026-05-16",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Shani Jayanti celebrations.",
            "description": "A Hindu festival day observed as part of the Shani Jayanti celebrations."
        },
        {
            "name": "Vat Savitri Vrat",
            "slug": "vat-savitri-vrat-2026-05-16",
            "date": "2026-05-16",
            "category": "Vrat",
            "blurb": "Vat Savitri Vrat — a traditional fast/vrat observed on this tithi.",
            "description": "Vat Savitri Vrat — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Jyeshtha Amavasya",
            "slug": "jyeshtha-amavasya-2026-05-16",
            "date": "2026-05-16",
            "category": "Amavasya",
            "blurb": "Jyeshtha Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
            "description": "Jyeshtha Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
        },
        {
            "name": "Masik Karthigai",
            "slug": "masik-karthigai-2026-05-16",
            "date": "2026-05-16",
            "category": "Shubh Din",
            "blurb": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Adhik Maas Aarambh",
            "slug": "adhik-maas-aarambh-2026-05-17",
            "date": "2026-05-17",
            "category": "Shubh Din",
            "blurb": "Adhik Maas Aarambh — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Adhik Maas Aarambh — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Varada Chaturthi",
            "slug": "varada-chaturthi-2026-05-20",
            "date": "2026-05-20",
            "category": "Vrat",
            "blurb": "Varada Chaturthi — a traditional fast/vrat observed on this tithi.",
            "description": "Varada Chaturthi — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Adhika Masik Durgashtami",
            "slug": "adhika-masik-durgashtami-2026-05-23",
            "date": "2026-05-23",
            "category": "Vrat",
            "blurb": "Adhika Masik Durgashtami — a traditional fast/vrat observed on this tithi.",
            "description": "Adhika Masik Durgashtami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Ganga Dussehra",
            "slug": "ganga-dussehra-2026-05-25",
            "date": "2026-05-25",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Ganga Dussehra celebrations.",
            "description": "A Hindu festival day observed as part of the Ganga Dussehra celebrations."
        },
        {
            "name": "Padmini Ekadashi (Adhik)",
            "slug": "padmini-ekadashi-adhik-2026-05-27",
            "date": "2026-05-27",
            "category": "Ekadashi",
            "blurb": "Padmini Ekadashi (Adhik) — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Padmini Ekadashi (Adhik) — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Pradosh Vrat (Adhik Maas)",
            "slug": "pradosh-vrat-adhik-maas-2026-05-28",
            "date": "2026-05-28",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Adhik Jyeshtha Purnima",
            "slug": "adhik-jyeshtha-purnima-2026-05-31",
            "date": "2026-05-31",
            "category": "Purnima",
            "blurb": "Adhik Jyeshtha Purnima — full moon day, considered auspicious for worship and charity.",
            "description": "Adhik Jyeshtha Purnima — full moon day, considered auspicious for worship and charity."
        },
        {
            "name": "Vibhuvana Sankashti",
            "slug": "vibhuvana-sankashti-2026-06-03",
            "date": "2026-06-03",
            "category": "Vrat",
            "blurb": "Vibhuvana Sankashti — a traditional fast/vrat observed on this tithi.",
            "description": "Vibhuvana Sankashti — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Adhika Kalashtami",
            "slug": "adhika-kalashtami-2026-06-08",
            "date": "2026-06-08",
            "category": "Vrat",
            "blurb": "Adhika Kalashtami — a traditional fast/vrat observed on this tithi.",
            "description": "Adhika Kalashtami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Parama Ekadashi (Adhik)",
            "slug": "parama-ekadashi-adhik-2026-06-11",
            "date": "2026-06-11",
            "category": "Ekadashi",
            "blurb": "Parama Ekadashi (Adhik) — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Parama Ekadashi (Adhik) — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Pradosh Vrat (Adhik Maas)",
            "slug": "pradosh-vrat-adhik-maas-2026-06-12",
            "date": "2026-06-12",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Adhika Masik Shivaratri",
            "slug": "adhika-masik-shivaratri-2026-06-13",
            "date": "2026-06-13",
            "category": "Vrat",
            "blurb": "Adhika Masik Shivaratri — a traditional fast/vrat observed on this tithi.",
            "description": "Adhika Masik Shivaratri — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Masik Karthigai",
            "slug": "masik-karthigai-2026-06-13",
            "date": "2026-06-13",
            "category": "Shubh Din",
            "blurb": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Adhik Maas Samapti",
            "slug": "adhik-maas-samapti-2026-06-15",
            "date": "2026-06-15",
            "category": "Amavasya",
            "blurb": "Adhik Maas Samapti — new moon day, observed for ancestor worship (Tarpan) and remedies.",
            "description": "Adhik Maas Samapti — new moon day, observed for ancestor worship (Tarpan) and remedies."
        },
        {
            "name": "Mithuna Sankranti",
            "slug": "mithuna-sankranti-2026-06-15",
            "date": "2026-06-15",
            "category": "Shubh Din",
            "blurb": "Mithuna Sankranti — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Mithuna Sankranti — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Pradyumna Chaturthi",
            "slug": "pradyumna-chaturthi-2026-06-18",
            "date": "2026-06-18",
            "category": "Vrat",
            "blurb": "Pradyumna Chaturthi — a traditional fast/vrat observed on this tithi.",
            "description": "Pradyumna Chaturthi — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Masik Durgashtami",
            "slug": "masik-durgashtami-2026-06-22",
            "date": "2026-06-22",
            "category": "Vrat",
            "blurb": "Masik Durgashtami — a traditional fast/vrat observed on this tithi.",
            "description": "Masik Durgashtami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Gayatri Jayanti",
            "slug": "gayatri-jayanti-2026-06-25",
            "date": "2026-06-25",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Gayatri Jayanti celebrations.",
            "description": "A Hindu festival day observed as part of the Gayatri Jayanti celebrations."
        },
        {
            "name": "Nirjala Ekadashi",
            "slug": "nirjala-ekadashi-2026-06-25",
            "date": "2026-06-25",
            "category": "Ekadashi",
            "blurb": "Nirjala Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Nirjala Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Pradosh Vrat (Shani)",
            "slug": "pradosh-vrat-shani-2026-06-27",
            "date": "2026-06-27",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Vat Purnima Vrat",
            "slug": "vat-purnima-vrat-2026-06-29",
            "date": "2026-06-29",
            "category": "Purnima",
            "blurb": "Vat Purnima Vrat — full moon day, considered auspicious for worship and charity.",
            "description": "Vat Purnima Vrat — full moon day, considered auspicious for worship and charity."
        },
        {
            "name": "Krishnapingala Sankashti",
            "slug": "krishnapingala-sankashti-2026-07-03",
            "date": "2026-07-03",
            "category": "Vrat",
            "blurb": "Krishnapingala Sankashti — a traditional fast/vrat observed on this tithi.",
            "description": "Krishnapingala Sankashti — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Kalashtami",
            "slug": "kalashtami-2026-07-07",
            "date": "2026-07-07",
            "category": "Vrat",
            "blurb": "Kalashtami — a traditional fast/vrat observed on this tithi.",
            "description": "Kalashtami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Yogini Ekadashi",
            "slug": "yogini-ekadashi-2026-07-10",
            "date": "2026-07-10",
            "category": "Ekadashi",
            "blurb": "Yogini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Yogini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Masik Karthigai",
            "slug": "masik-karthigai-2026-07-10",
            "date": "2026-07-10",
            "category": "Shubh Din",
            "blurb": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Masik Shivaratri",
            "slug": "masik-shivaratri-2026-07-12",
            "date": "2026-07-12",
            "category": "Vrat",
            "blurb": "Masik Shivaratri — a traditional fast/vrat observed on this tithi.",
            "description": "Masik Shivaratri — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Pradosh Vrat (Ravi)",
            "slug": "pradosh-vrat-ravi-2026-07-12",
            "date": "2026-07-12",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Ashadha Amavasya",
            "slug": "ashadha-amavasya-2026-07-14",
            "date": "2026-07-14",
            "category": "Amavasya",
            "blurb": "Ashadha Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
            "description": "Ashadha Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
        },
        {
            "name": "Jagannath Rath Yatra",
            "slug": "jagannath-rath-yatra-2026-07-16",
            "date": "2026-07-16",
            "category": "Festival",
            "blurb": "Chariot festival of Lord Jagannath, Puri.",
            "description": "Chariot festival of Lord Jagannath, Puri."
        },
        {
            "name": "Karka Sankranti",
            "slug": "karka-sankranti-2026-07-16",
            "date": "2026-07-16",
            "category": "Shubh Din",
            "blurb": "Karka Sankranti — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Karka Sankranti — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Aniruddha Chaturthi",
            "slug": "aniruddha-chaturthi-2026-07-17",
            "date": "2026-07-17",
            "category": "Vrat",
            "blurb": "Aniruddha Chaturthi — a traditional fast/vrat observed on this tithi.",
            "description": "Aniruddha Chaturthi — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Masik Durgashtami",
            "slug": "masik-durgashtami-2026-07-21",
            "date": "2026-07-21",
            "category": "Vrat",
            "blurb": "Masik Durgashtami — a traditional fast/vrat observed on this tithi.",
            "description": "Masik Durgashtami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Devshayani Ekadashi",
            "slug": "devshayani-ekadashi-2026-07-25",
            "date": "2026-07-25",
            "category": "Ekadashi",
            "blurb": "Devshayani Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Devshayani Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Pradosh Vrat (Ravi)",
            "slug": "pradosh-vrat-ravi-2026-07-26",
            "date": "2026-07-26",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Kokila Vrat",
            "slug": "kokila-vrat-2026-07-28",
            "date": "2026-07-28",
            "category": "Vrat",
            "blurb": "Kokila Vrat — a traditional fast/vrat observed on this tithi.",
            "description": "Kokila Vrat — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Guru Purnima",
            "slug": "guru-purnima-2026-07-29",
            "date": "2026-07-29",
            "category": "Purnima",
            "blurb": "Day to honour teachers and spiritual guides.",
            "description": "Day to honour teachers and spiritual guides."
        },
        {
            "name": "Shravan Maas Aarambh",
            "slug": "shravan-maas-aarambh-2026-07-30",
            "date": "2026-07-30",
            "category": "Shubh Din",
            "blurb": "Shravan Maas Aarambh — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Shravan Maas Aarambh — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Gajanana Sankashti",
            "slug": "gajanana-sankashti-2026-08-02",
            "date": "2026-08-02",
            "category": "Vrat",
            "blurb": "Gajanana Sankashti — a traditional fast/vrat observed on this tithi.",
            "description": "Gajanana Sankashti — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Sawan Somwar Vrat 1 (North India)",
            "slug": "sawan-somwar-vrat-1-north-india-2026-08-03",
            "date": "2026-08-03",
            "category": "Vrat",
            "blurb": "Sawan Somwar Vrat 1 (North India) — a traditional fast/vrat observed on this tithi.",
            "description": "Sawan Somwar Vrat 1 (North India) — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Mangla Gauri Vrat 1",
            "slug": "mangla-gauri-vrat-1-2026-08-04",
            "date": "2026-08-04",
            "category": "Vrat",
            "blurb": "Mangla Gauri Vrat 1 — a traditional fast/vrat observed on this tithi.",
            "description": "Mangla Gauri Vrat 1 — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Kalashtami",
            "slug": "kalashtami-2026-08-05",
            "date": "2026-08-05",
            "category": "Vrat",
            "blurb": "Kalashtami — a traditional fast/vrat observed on this tithi.",
            "description": "Kalashtami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Masik Karthigai",
            "slug": "masik-karthigai-2026-08-07",
            "date": "2026-08-07",
            "category": "Shubh Din",
            "blurb": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Kamika Ekadashi",
            "slug": "kamika-ekadashi-2026-08-09",
            "date": "2026-08-09",
            "category": "Ekadashi",
            "blurb": "Kamika Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Kamika Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Sawan Somwar Vrat 2 (North India)",
            "slug": "sawan-somwar-vrat-2-north-india-2026-08-10",
            "date": "2026-08-10",
            "category": "Vrat",
            "blurb": "Sawan Somwar Vrat 2 (North India) — a traditional fast/vrat observed on this tithi.",
            "description": "Sawan Somwar Vrat 2 (North India) — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Pradosh Vrat (Soma)",
            "slug": "pradosh-vrat-soma-2026-08-10",
            "date": "2026-08-10",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Mangla Gauri Vrat 2",
            "slug": "mangla-gauri-vrat-2-2026-08-11",
            "date": "2026-08-11",
            "category": "Vrat",
            "blurb": "Mangla Gauri Vrat 2 — a traditional fast/vrat observed on this tithi.",
            "description": "Mangla Gauri Vrat 2 — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Sawan Shivaratri / Masik Shivaratri",
            "slug": "sawan-shivaratri-masik-shivaratri-2026-08-11",
            "date": "2026-08-11",
            "category": "Vrat",
            "blurb": "Sawan Shivaratri / Masik Shivaratri — a traditional fast/vrat observed on this tithi.",
            "description": "Sawan Shivaratri / Masik Shivaratri — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Hariyali Amavasya",
            "slug": "hariyali-amavasya-2026-08-12",
            "date": "2026-08-12",
            "category": "Amavasya",
            "blurb": "Hariyali Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
            "description": "Hariyali Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
        },
        {
            "name": "Shravan Aarambh (South/West India)",
            "slug": "shravan-aarambh-south-west-india-2026-08-13",
            "date": "2026-08-13",
            "category": "Shubh Din",
            "blurb": "Shravan Aarambh (South/West India) — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Shravan Aarambh (South/West India) — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Hariyali Teej",
            "slug": "hariyali-teej-2026-08-15",
            "date": "2026-08-15",
            "category": "Vrat",
            "blurb": "Hariyali Teej — a traditional fast/vrat observed on this tithi.",
            "description": "Hariyali Teej — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Durva Ganapati Chaturthi",
            "slug": "durva-ganapati-chaturthi-2026-08-16",
            "date": "2026-08-16",
            "category": "Vrat",
            "blurb": "Durva Ganapati Chaturthi — a traditional fast/vrat observed on this tithi.",
            "description": "Durva Ganapati Chaturthi — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Nag Panchami",
            "slug": "nag-panchami-2026-08-17",
            "date": "2026-08-17",
            "category": "Festival",
            "blurb": "Worship of serpent deities.",
            "description": "Worship of serpent deities."
        },
        {
            "name": "Sawan Somwar Vrat 3 (North India)",
            "slug": "sawan-somwar-vrat-3-north-india-2026-08-17",
            "date": "2026-08-17",
            "category": "Vrat",
            "blurb": "Sawan Somwar Vrat 3 (North India) — a traditional fast/vrat observed on this tithi.",
            "description": "Sawan Somwar Vrat 3 (North India) — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Simha Sankranti",
            "slug": "simha-sankranti-2026-08-17",
            "date": "2026-08-17",
            "category": "Shubh Din",
            "blurb": "Simha Sankranti — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Simha Sankranti — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Mangla Gauri Vrat 3",
            "slug": "mangla-gauri-vrat-3-2026-08-18",
            "date": "2026-08-18",
            "category": "Vrat",
            "blurb": "Mangla Gauri Vrat 3 — a traditional fast/vrat observed on this tithi.",
            "description": "Mangla Gauri Vrat 3 — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Masik Durgashtami",
            "slug": "masik-durgashtami-2026-08-20",
            "date": "2026-08-20",
            "category": "Vrat",
            "blurb": "Masik Durgashtami — a traditional fast/vrat observed on this tithi.",
            "description": "Masik Durgashtami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Putrada Ekadashi",
            "slug": "putrada-ekadashi-2026-08-23",
            "date": "2026-08-23",
            "category": "Ekadashi",
            "blurb": "Putrada Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Putrada Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Sawan Somwar Vrat 4 (North India)",
            "slug": "sawan-somwar-vrat-4-north-india-2026-08-24",
            "date": "2026-08-24",
            "category": "Vrat",
            "blurb": "Sawan Somwar Vrat 4 (North India) — a traditional fast/vrat observed on this tithi.",
            "description": "Sawan Somwar Vrat 4 (North India) — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Mangla Gauri Vrat 4",
            "slug": "mangla-gauri-vrat-4-2026-08-25",
            "date": "2026-08-25",
            "category": "Vrat",
            "blurb": "Mangla Gauri Vrat 4 — a traditional fast/vrat observed on this tithi.",
            "description": "Mangla Gauri Vrat 4 — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Pradosh Vrat (Bhauma)",
            "slug": "pradosh-vrat-bhauma-2026-08-25",
            "date": "2026-08-25",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Onam / Thiruvonam",
            "slug": "onam-thiruvonam-2026-08-26",
            "date": "2026-08-26",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Onam / Thiruvonam celebrations.",
            "description": "A Hindu festival day observed as part of the Onam / Thiruvonam celebrations."
        },
        {
            "name": "Gayatri Jayanti (Shravana tradition)",
            "slug": "gayatri-jayanti-shravana-tradition-2026-08-28",
            "date": "2026-08-28",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Gayatri Jayanti (Shravana tradition) celebrations.",
            "description": "A Hindu festival day observed as part of the Gayatri Jayanti (Shravana tradition) celebrations."
        },
        {
            "name": "Raksha Bandhan",
            "slug": "raksha-bandhan-2026-08-28",
            "date": "2026-08-28",
            "category": "Festival",
            "blurb": "Celebration of the bond between siblings.",
            "description": "Celebration of the bond between siblings."
        },
        {
            "name": "Varalakshmi Vrat",
            "slug": "varalakshmi-vrat-2026-08-28",
            "date": "2026-08-28",
            "category": "Vrat",
            "blurb": "Varalakshmi Vrat — a traditional fast/vrat observed on this tithi.",
            "description": "Varalakshmi Vrat — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Heramba Sankashti / Bahula Chaturthi",
            "slug": "heramba-sankashti-bahula-chaturthi-2026-08-31",
            "date": "2026-08-31",
            "category": "Vrat",
            "blurb": "Heramba Sankashti / Bahula Chaturthi — a traditional fast/vrat observed on this tithi.",
            "description": "Heramba Sankashti / Bahula Chaturthi — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Kajari Teej",
            "slug": "kajari-teej-2026-08-31",
            "date": "2026-08-31",
            "category": "Vrat",
            "blurb": "Kajari Teej — a traditional fast/vrat observed on this tithi.",
            "description": "Kajari Teej — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Masik Karthigai",
            "slug": "masik-karthigai-2026-09-03",
            "date": "2026-09-03",
            "category": "Shubh Din",
            "blurb": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Janmashtami",
            "slug": "janmashtami-2026-09-04",
            "date": "2026-09-04",
            "category": "Festival",
            "blurb": "Birth anniversary of Lord Krishna.",
            "description": "Birth anniversary of Lord Krishna."
        },
        {
            "name": "Kalashtami",
            "slug": "kalashtami-2026-09-04",
            "date": "2026-09-04",
            "category": "Vrat",
            "blurb": "Kalashtami — a traditional fast/vrat observed on this tithi.",
            "description": "Kalashtami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Dahi Handi",
            "slug": "dahi-handi-2026-09-05",
            "date": "2026-09-05",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Dahi Handi celebrations.",
            "description": "A Hindu festival day observed as part of the Dahi Handi celebrations."
        },
        {
            "name": "Aja Ekadashi",
            "slug": "aja-ekadashi-2026-09-07",
            "date": "2026-09-07",
            "category": "Ekadashi",
            "blurb": "Aja Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Aja Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Pradosh Vrat (Bhauma)",
            "slug": "pradosh-vrat-bhauma-2026-09-08",
            "date": "2026-09-08",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Masik Shivaratri",
            "slug": "masik-shivaratri-2026-09-09",
            "date": "2026-09-09",
            "category": "Vrat",
            "blurb": "Masik Shivaratri — a traditional fast/vrat observed on this tithi.",
            "description": "Masik Shivaratri — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Bhadrapada Amavasya",
            "slug": "bhadrapada-amavasya-2026-09-11",
            "date": "2026-09-11",
            "category": "Amavasya",
            "blurb": "Bhadrapada Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
            "description": "Bhadrapada Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
        },
        {
            "name": "Ganesh Chaturthi / Siddhivinayaka Chaturthi",
            "slug": "ganesh-chaturthi-siddhivinayaka-chaturthi-2026-09-14",
            "date": "2026-09-14",
            "category": "Festival",
            "blurb": "Ten-day celebration of Lord Ganesha.",
            "description": "Ten-day celebration of Lord Ganesha."
        },
        {
            "name": "Hartalika Teej",
            "slug": "hartalika-teej-2026-09-14",
            "date": "2026-09-14",
            "category": "Vrat",
            "blurb": "Hartalika Teej — a traditional fast/vrat observed on this tithi.",
            "description": "Hartalika Teej — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Rishi Panchami",
            "slug": "rishi-panchami-2026-09-15",
            "date": "2026-09-15",
            "category": "Vrat",
            "blurb": "Rishi Panchami — a traditional fast/vrat observed on this tithi.",
            "description": "Rishi Panchami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Balarama Jayanti",
            "slug": "balarama-jayanti-2026-09-16",
            "date": "2026-09-16",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Balarama Jayanti celebrations.",
            "description": "A Hindu festival day observed as part of the Balarama Jayanti celebrations."
        },
        {
            "name": "Vishwakarma Puja",
            "slug": "vishwakarma-puja-2026-09-17",
            "date": "2026-09-17",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Vishwakarma Puja celebrations.",
            "description": "A Hindu festival day observed as part of the Vishwakarma Puja celebrations."
        },
        {
            "name": "Kanya Sankranti",
            "slug": "kanya-sankranti-2026-09-17",
            "date": "2026-09-17",
            "category": "Shubh Din",
            "blurb": "Kanya Sankranti — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Kanya Sankranti — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Masik Durgashtami / Radha Ashtami",
            "slug": "masik-durgashtami-radha-ashtami-2026-09-19",
            "date": "2026-09-19",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Masik Durgashtami / Radha Ashtami celebrations.",
            "description": "A Hindu festival day observed as part of the Masik Durgashtami / Radha Ashtami celebrations."
        },
        {
            "name": "Parivartini Ekadashi",
            "slug": "parivartini-ekadashi-2026-09-22",
            "date": "2026-09-22",
            "category": "Ekadashi",
            "blurb": "Parivartini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Parivartini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Pradosh Vrat (Guru)",
            "slug": "pradosh-vrat-guru-2026-09-24",
            "date": "2026-09-24",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Ganesh Visarjan",
            "slug": "ganesh-visarjan-2026-09-25",
            "date": "2026-09-25",
            "category": "Festival",
            "blurb": "Immersion of Ganesh idols, end of Ganeshotsav.",
            "description": "Immersion of Ganesh idols, end of Ganeshotsav."
        },
        {
            "name": "Anant Chaturdashi",
            "slug": "anant-chaturdashi-2026-09-25",
            "date": "2026-09-25",
            "category": "Vrat",
            "blurb": "Anant Chaturdashi — a traditional fast/vrat observed on this tithi.",
            "description": "Anant Chaturdashi — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Bhadrapada Purnima",
            "slug": "bhadrapada-purnima-2026-09-26",
            "date": "2026-09-26",
            "category": "Purnima",
            "blurb": "Bhadrapada Purnima — full moon day, considered auspicious for worship and charity.",
            "description": "Bhadrapada Purnima — full moon day, considered auspicious for worship and charity."
        },
        {
            "name": "Pitru Paksha Aarambh",
            "slug": "pitru-paksha-aarambh-2026-09-27",
            "date": "2026-09-27",
            "category": "Shubh Din",
            "blurb": "Pitru Paksha Aarambh — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Pitru Paksha Aarambh — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Vighnaraja Sankashti",
            "slug": "vighnaraja-sankashti-2026-09-29",
            "date": "2026-09-29",
            "category": "Vrat",
            "blurb": "Vighnaraja Sankashti — a traditional fast/vrat observed on this tithi.",
            "description": "Vighnaraja Sankashti — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Masik Karthigai",
            "slug": "masik-karthigai-2026-09-30",
            "date": "2026-09-30",
            "category": "Shubh Din",
            "blurb": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Kalashtami",
            "slug": "kalashtami-2026-10-03",
            "date": "2026-10-03",
            "category": "Vrat",
            "blurb": "Kalashtami — a traditional fast/vrat observed on this tithi.",
            "description": "Kalashtami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Indira Ekadashi",
            "slug": "indira-ekadashi-2026-10-06",
            "date": "2026-10-06",
            "category": "Ekadashi",
            "blurb": "Indira Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Indira Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Masik Shivaratri",
            "slug": "masik-shivaratri-2026-10-08",
            "date": "2026-10-08",
            "category": "Vrat",
            "blurb": "Masik Shivaratri — a traditional fast/vrat observed on this tithi.",
            "description": "Masik Shivaratri — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Pradosh Vrat (Guru)",
            "slug": "pradosh-vrat-guru-2026-10-08",
            "date": "2026-10-08",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Mahalaya Amavasya",
            "slug": "mahalaya-amavasya-2026-10-10",
            "date": "2026-10-10",
            "category": "Amavasya",
            "blurb": "Mahalaya Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
            "description": "Mahalaya Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
        },
        {
            "name": "Sharad Navratri (Ghatasthapana)",
            "slug": "sharad-navratri-ghatasthapana-2026-10-11",
            "date": "2026-10-11",
            "category": "Festival",
            "blurb": "Nine nights leading up to Dussehra.",
            "description": "Nine nights leading up to Dussehra."
        },
        {
            "name": "Kapardisha Chaturthi",
            "slug": "kapardisha-chaturthi-2026-10-14",
            "date": "2026-10-14",
            "category": "Vrat",
            "blurb": "Kapardisha Chaturthi — a traditional fast/vrat observed on this tithi.",
            "description": "Kapardisha Chaturthi — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Navpatrika Puja / Maha Saptami",
            "slug": "navpatrika-puja-maha-saptami-2026-10-17",
            "date": "2026-10-17",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Navpatrika Puja / Maha Saptami celebrations.",
            "description": "A Hindu festival day observed as part of the Navpatrika Puja / Maha Saptami celebrations."
        },
        {
            "name": "Saraswati Puja (Navratri)",
            "slug": "saraswati-puja-navratri-2026-10-17",
            "date": "2026-10-17",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Saraswati Puja (Navratri) celebrations.",
            "description": "A Hindu festival day observed as part of the Saraswati Puja (Navratri) celebrations."
        },
        {
            "name": "Tula Sankranti",
            "slug": "tula-sankranti-2026-10-17",
            "date": "2026-10-17",
            "category": "Shubh Din",
            "blurb": "Tula Sankranti — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Tula Sankranti — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Durga Ashtami / Masik Durgashtami",
            "slug": "durga-ashtami-masik-durgashtami-2026-10-19",
            "date": "2026-10-19",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Durga Ashtami / Masik Durgashtami celebrations.",
            "description": "A Hindu festival day observed as part of the Durga Ashtami / Masik Durgashtami celebrations."
        },
        {
            "name": "Maha Navami",
            "slug": "maha-navami-2026-10-19",
            "date": "2026-10-19",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Maha Navami celebrations.",
            "description": "A Hindu festival day observed as part of the Maha Navami celebrations."
        },
        {
            "name": "Dussehra / Vijayadashami",
            "slug": "dussehra-vijayadashami-2026-10-20",
            "date": "2026-10-20",
            "category": "Festival",
            "blurb": "Victory of good over evil; Ravana Dahan.",
            "description": "Victory of good over evil; Ravana Dahan."
        },
        {
            "name": "Papankusha Ekadashi",
            "slug": "papankusha-ekadashi-2026-10-22",
            "date": "2026-10-22",
            "category": "Ekadashi",
            "blurb": "Papankusha Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Papankusha Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Pradosh Vrat (Shukra)",
            "slug": "pradosh-vrat-shukra-2026-10-23",
            "date": "2026-10-23",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Kojagara Lakshmi Puja",
            "slug": "kojagara-lakshmi-puja-2026-10-25",
            "date": "2026-10-25",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Kojagara Lakshmi Puja celebrations.",
            "description": "A Hindu festival day observed as part of the Kojagara Lakshmi Puja celebrations."
        },
        {
            "name": "Sharad Purnima",
            "slug": "sharad-purnima-2026-10-25",
            "date": "2026-10-25",
            "category": "Purnima",
            "blurb": "Sharad Purnima — full moon day, considered auspicious for worship and charity.",
            "description": "Sharad Purnima — full moon day, considered auspicious for worship and charity."
        },
        {
            "name": "Valmiki Jayanti",
            "slug": "valmiki-jayanti-2026-10-26",
            "date": "2026-10-26",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Valmiki Jayanti celebrations.",
            "description": "A Hindu festival day observed as part of the Valmiki Jayanti celebrations."
        },
        {
            "name": "Masik Karthigai",
            "slug": "masik-karthigai-2026-10-27",
            "date": "2026-10-27",
            "category": "Shubh Din",
            "blurb": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Karwa Chauth",
            "slug": "karwa-chauth-2026-10-29",
            "date": "2026-10-29",
            "category": "Vrat",
            "blurb": "Married women fast for their husbands' wellbeing.",
            "description": "Married women fast for their husbands' wellbeing."
        },
        {
            "name": "Vakratunda Sankashti",
            "slug": "vakratunda-sankashti-2026-10-29",
            "date": "2026-10-29",
            "category": "Vrat",
            "blurb": "Vakratunda Sankashti — a traditional fast/vrat observed on this tithi.",
            "description": "Vakratunda Sankashti — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Ahoi Ashtami",
            "slug": "ahoi-ashtami-2026-11-01",
            "date": "2026-11-01",
            "category": "Vrat",
            "blurb": "Ahoi Ashtami — a traditional fast/vrat observed on this tithi.",
            "description": "Ahoi Ashtami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Kalashtami",
            "slug": "kalashtami-2026-11-01",
            "date": "2026-11-01",
            "category": "Vrat",
            "blurb": "Kalashtami — a traditional fast/vrat observed on this tithi.",
            "description": "Kalashtami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Govatsa Dwadashi",
            "slug": "govatsa-dwadashi-2026-11-05",
            "date": "2026-11-05",
            "category": "Vrat",
            "blurb": "Govatsa Dwadashi — a traditional fast/vrat observed on this tithi.",
            "description": "Govatsa Dwadashi — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Rama Ekadashi",
            "slug": "rama-ekadashi-2026-11-05",
            "date": "2026-11-05",
            "category": "Ekadashi",
            "blurb": "Rama Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Rama Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Dhanteras",
            "slug": "dhanteras-2026-11-06",
            "date": "2026-11-06",
            "category": "Festival",
            "blurb": "Worship of wealth and prosperity, start of Diwali.",
            "description": "Worship of wealth and prosperity, start of Diwali."
        },
        {
            "name": "Pradosh Vrat (Shukra)",
            "slug": "pradosh-vrat-shukra-2026-11-06",
            "date": "2026-11-06",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Masik Shivaratri",
            "slug": "masik-shivaratri-2026-11-07",
            "date": "2026-11-07",
            "category": "Vrat",
            "blurb": "Masik Shivaratri — a traditional fast/vrat observed on this tithi.",
            "description": "Masik Shivaratri — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Diwali / Deepavali",
            "slug": "diwali-deepavali-2026-11-08",
            "date": "2026-11-08",
            "category": "Festival",
            "blurb": "Festival of lights — worship of Goddess Lakshmi.",
            "description": "Festival of lights — worship of Goddess Lakshmi."
        },
        {
            "name": "Naraka Chaturdashi / Choti Diwali",
            "slug": "naraka-chaturdashi-choti-diwali-2026-11-08",
            "date": "2026-11-08",
            "category": "Festival",
            "blurb": "Second day of Diwali festivities.",
            "description": "Second day of Diwali festivities."
        },
        {
            "name": "Kartik Amavasya",
            "slug": "kartik-amavasya-2026-11-09",
            "date": "2026-11-09",
            "category": "Amavasya",
            "blurb": "Kartik Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
            "description": "Kartik Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
        },
        {
            "name": "Govardhan Puja",
            "slug": "govardhan-puja-2026-11-10",
            "date": "2026-11-10",
            "category": "Festival",
            "blurb": "Worship of Govardhan Hill, honouring Lord Krishna.",
            "description": "Worship of Govardhan Hill, honouring Lord Krishna."
        },
        {
            "name": "Bhai Dooj",
            "slug": "bhai-dooj-2026-11-11",
            "date": "2026-11-11",
            "category": "Festival",
            "blurb": "Celebration of the brother-sister bond.",
            "description": "Celebration of the brother-sister bond."
        },
        {
            "name": "Labh Chaturthi",
            "slug": "labh-chaturthi-2026-11-13",
            "date": "2026-11-13",
            "category": "Vrat",
            "blurb": "Labh Chaturthi — a traditional fast/vrat observed on this tithi.",
            "description": "Labh Chaturthi — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Chhath Puja",
            "slug": "chhath-puja-2026-11-15",
            "date": "2026-11-15",
            "category": "Festival",
            "blurb": "Worship of the Sun God, major in Bihar/UP.",
            "description": "Worship of the Sun God, major in Bihar/UP."
        },
        {
            "name": "Vrishchika Sankranti",
            "slug": "vrishchika-sankranti-2026-11-16",
            "date": "2026-11-16",
            "category": "Shubh Din",
            "blurb": "Vrishchika Sankranti — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Vrishchika Sankranti — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Masik Durgashtami",
            "slug": "masik-durgashtami-2026-11-17",
            "date": "2026-11-17",
            "category": "Vrat",
            "blurb": "Masik Durgashtami — a traditional fast/vrat observed on this tithi.",
            "description": "Masik Durgashtami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Devuthani Ekadashi",
            "slug": "devuthani-ekadashi-2026-11-20",
            "date": "2026-11-20",
            "category": "Ekadashi",
            "blurb": "Devuthani Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Devuthani Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Tulsi Vivah",
            "slug": "tulsi-vivah-2026-11-21",
            "date": "2026-11-21",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Tulsi Vivah celebrations.",
            "description": "A Hindu festival day observed as part of the Tulsi Vivah celebrations."
        },
        {
            "name": "Pradosh Vrat (Ravi)",
            "slug": "pradosh-vrat-ravi-2026-11-22",
            "date": "2026-11-22",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Vaikuntha Chaturdashi",
            "slug": "vaikuntha-chaturdashi-2026-11-23",
            "date": "2026-11-23",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Vaikuntha Chaturdashi celebrations.",
            "description": "A Hindu festival day observed as part of the Vaikuntha Chaturdashi celebrations."
        },
        {
            "name": "Dev Deepawali",
            "slug": "dev-deepawali-2026-11-24",
            "date": "2026-11-24",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Dev Deepawali celebrations.",
            "description": "A Hindu festival day observed as part of the Dev Deepawali celebrations."
        },
        {
            "name": "Guru Nanak Jayanti",
            "slug": "guru-nanak-jayanti-2026-11-24",
            "date": "2026-11-24",
            "category": "Festival",
            "blurb": "Birth anniversary of Guru Nanak Dev Ji.",
            "description": "Birth anniversary of Guru Nanak Dev Ji."
        },
        {
            "name": "Kartik Purnima",
            "slug": "kartik-purnima-2026-11-24",
            "date": "2026-11-24",
            "category": "Purnima",
            "blurb": "Full moon of Kartik month, sacred bathing day.",
            "description": "Full moon of Kartik month, sacred bathing day."
        },
        {
            "name": "Karthigai Deepam",
            "slug": "karthigai-deepam-2026-11-24",
            "date": "2026-11-24",
            "category": "Shubh Din",
            "blurb": "Karthigai Deepam — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Karthigai Deepam — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Ganadhipa Sankashti",
            "slug": "ganadhipa-sankashti-2026-11-27",
            "date": "2026-11-27",
            "category": "Vrat",
            "blurb": "Ganadhipa Sankashti — a traditional fast/vrat observed on this tithi.",
            "description": "Ganadhipa Sankashti — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Kalabhairav Jayanti / Kalashtami",
            "slug": "kalabhairav-jayanti-kalashtami-2026-12-01",
            "date": "2026-12-01",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Kalabhairav Jayanti / Kalashtami celebrations.",
            "description": "A Hindu festival day observed as part of the Kalabhairav Jayanti / Kalashtami celebrations."
        },
        {
            "name": "Utpanna Ekadashi",
            "slug": "utpanna-ekadashi-2026-12-04",
            "date": "2026-12-04",
            "category": "Ekadashi",
            "blurb": "Utpanna Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Utpanna Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Pradosh Vrat (Soma)",
            "slug": "pradosh-vrat-soma-2026-12-06",
            "date": "2026-12-06",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Masik Shivaratri",
            "slug": "masik-shivaratri-2026-12-07",
            "date": "2026-12-07",
            "category": "Vrat",
            "blurb": "Masik Shivaratri — a traditional fast/vrat observed on this tithi.",
            "description": "Masik Shivaratri — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Margashirsh Amavasya",
            "slug": "margashirsh-amavasya-2026-12-08",
            "date": "2026-12-08",
            "category": "Amavasya",
            "blurb": "Margashirsh Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
            "description": "Margashirsh Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
        },
        {
            "name": "Krichchhra Chaturthi",
            "slug": "krichchhra-chaturthi-2026-12-13",
            "date": "2026-12-13",
            "category": "Vrat",
            "blurb": "Krichchhra Chaturthi — a traditional fast/vrat observed on this tithi.",
            "description": "Krichchhra Chaturthi — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Vivah Panchami",
            "slug": "vivah-panchami-2026-12-14",
            "date": "2026-12-14",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Vivah Panchami celebrations.",
            "description": "A Hindu festival day observed as part of the Vivah Panchami celebrations."
        },
        {
            "name": "Dhanu Sankranti",
            "slug": "dhanu-sankranti-2026-12-16",
            "date": "2026-12-16",
            "category": "Shubh Din",
            "blurb": "Dhanu Sankranti — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Dhanu Sankranti — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Masik Durgashtami",
            "slug": "masik-durgashtami-2026-12-17",
            "date": "2026-12-17",
            "category": "Vrat",
            "blurb": "Masik Durgashtami — a traditional fast/vrat observed on this tithi.",
            "description": "Masik Durgashtami — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Gita Jayanti",
            "slug": "gita-jayanti-2026-12-20",
            "date": "2026-12-20",
            "category": "Festival",
            "blurb": "Anniversary of the day Lord Krishna narrated the Bhagavad Gita.",
            "description": "Anniversary of the day Lord Krishna narrated the Bhagavad Gita."
        },
        {
            "name": "Mokshada Ekadashi",
            "slug": "mokshada-ekadashi-2026-12-20",
            "date": "2026-12-20",
            "category": "Ekadashi",
            "blurb": "Mokshada Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
            "description": "Mokshada Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
        },
        {
            "name": "Pradosh Vrat (Bhauma)",
            "slug": "pradosh-vrat-bhauma-2026-12-21",
            "date": "2026-12-21",
            "category": "Pradosh Vrat",
            "blurb": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi.",
            "description": "Evening fast dedicated to Lord Shiva, observed on Trayodashi tithi."
        },
        {
            "name": "Masik Karthigai",
            "slug": "masik-karthigai-2026-12-21",
            "date": "2026-12-21",
            "category": "Shubh Din",
            "blurb": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Masik Karthigai — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Dattatreya Jayanti",
            "slug": "dattatreya-jayanti-2026-12-23",
            "date": "2026-12-23",
            "category": "Festival",
            "blurb": "A Hindu festival day observed as part of the Dattatreya Jayanti celebrations.",
            "description": "A Hindu festival day observed as part of the Dattatreya Jayanti celebrations."
        },
        {
            "name": "Margashirsha Purnima Vrat",
            "slug": "margashirsha-purnima-vrat-2026-12-23",
            "date": "2026-12-23",
            "category": "Purnima",
            "blurb": "Margashirsha Purnima Vrat — full moon day, considered auspicious for worship and charity.",
            "description": "Margashirsha Purnima Vrat — full moon day, considered auspicious for worship and charity."
        },
        {
            "name": "Pausha Maas Begins (North)",
            "slug": "pausha-maas-begins-north-2026-12-25",
            "date": "2026-12-25",
            "category": "Shubh Din",
            "blurb": "Pausha Maas Begins (North) — an auspicious day in the Hindu calendar for this occasion.",
            "description": "Pausha Maas Begins (North) — an auspicious day in the Hindu calendar for this occasion."
        },
        {
            "name": "Akhuratha Sankashti",
            "slug": "akhuratha-sankashti-2026-12-26",
            "date": "2026-12-26",
            "category": "Vrat",
            "blurb": "Akhuratha Sankashti — a traditional fast/vrat observed on this tithi.",
            "description": "Akhuratha Sankashti — a traditional fast/vrat observed on this tithi."
        },
        {
            "name": "Kalashtami",
            "slug": "kalashtami-2026-12-30",
            "date": "2026-12-30",
            "category": "Vrat",
            "blurb": "Kalashtami — a traditional fast/vrat observed on this tithi.",
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
    console.log("Connected to MongoDB for Festival seed.");

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const item of FESTIVAL_SEED_DATA) {
        try {
            const existing = await Festival.findOne({ slug: item.slug });

            if (existing) {
                skipped += 1;
                console.log(`SKIP (already exists): ${item.name} (${item.date})`);
                continue;
            }

            await Festival.create({
                name: item.name,
                slug: item.slug,
                date: item.date,
                category: item.category,
                blurb: item.blurb,
                description: item.description,
                status: true,
            });

            created += 1;
            console.log(`CREATED: ${item.name} (${item.date}) -> ${item.category}`);
        } catch (error) {
            failed += 1;
            console.error(`FAILED: ${item.name} (${item.date}) -> ${error.message}`);
        }
    }

    console.log("\n===== Seed Summary =====");
    console.log(`Total in dataset : ${FESTIVAL_SEED_DATA.length}`);
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