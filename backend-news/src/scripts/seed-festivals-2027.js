/**
 * One-time seed script.
 *
 * Populates the `Festival` collection with 2027 Hindu festivals / vrats,
 * sourced from Drik Panchang's 2027 Hindu Calendar (major festivals,
 * Ekadashis, Purnima/Amavasya, Sankranti and key Vrat days). Same pattern
 * as seed-festivals-from-static.js (the 2026 seed).
 *
 * NOTE: Dates are for the standard Indian (IST) almanac as listed on
 * Drik Panchang. This list covers the major festivals + recurring
 * Ekadashi/Purnima/Amavasya/Sankranti days for 2027, but — unlike the
 * hand-curated 2026 dataset — it does NOT include every monthly recurring
 * minor Vrat (e.g. every Pradosh Vrat, Masik Shivaratri, Sankashti
 * Chaturthi). Those can be appended the same way if needed.
 *
 * SAFE / IDEMPOTENT:
 * - Skips any entry whose slug already exists in the Festival collection,
 *   so it is safe to re-run.
 * - Does not touch/delete any existing Festival document.
 *
 * Usage (run once from the backend project root):
 *   node src/scripts/seed-festivals-2027.js
 */

"use strict";

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const Festival = require("../models/Festival");

const FESTIVAL_SEED_DATA_2027 = [
    {
        "name": "Saphala Ekadashi",
        "slug": "saphala-ekadashi-2027-01-02",
        "date": "2027-01-02",
        "category": "Ekadashi",
        "blurb": "Saphala Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Saphala Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Makar Sankranti",
        "slug": "makar-sankranti-2027-01-14",
        "date": "2027-01-14",
        "category": "Shubh Din",
        "blurb": "Sun enters Capricorn — kite flying, til-gud, harvest thanksgiving.",
        "description": "Sun enters Capricorn — kite flying, til-gud, harvest thanksgiving."
    },
    {
        "name": "Pongal",
        "slug": "pongal-2027-01-14",
        "date": "2027-01-14",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Pongal celebrations.",
        "description": "A Hindu festival day observed as part of the Pongal celebrations."
    },
    {
        "name": "Pausha Putrada Ekadashi",
        "slug": "pausha-putrada-ekadashi-2027-01-18",
        "date": "2027-01-18",
        "category": "Ekadashi",
        "blurb": "Pausha Putrada Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Pausha Putrada Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Pausha Purnima",
        "slug": "pausha-purnima-2027-01-21",
        "date": "2027-01-21",
        "category": "Purnima",
        "blurb": "Pausha Purnima — full moon day, considered auspicious for worship and charity.",
        "description": "Pausha Purnima — full moon day, considered auspicious for worship and charity."
    },
    {
        "name": "Sakat Chauth",
        "slug": "sakat-chauth-2027-01-24",
        "date": "2027-01-24",
        "category": "Vrat",
        "blurb": "Sakat Chauth — a traditional fast/vrat observed on this tithi.",
        "description": "Sakat Chauth — a traditional fast/vrat observed on this tithi."
    },
    {
        "name": "Shattila Ekadashi",
        "slug": "shattila-ekadashi-2027-02-01",
        "date": "2027-02-01",
        "category": "Ekadashi",
        "blurb": "Shattila Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Shattila Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Mauni Amavasya",
        "slug": "mauni-amavasya-2027-02-06",
        "date": "2027-02-06",
        "category": "Amavasya",
        "blurb": "Mauni Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
        "description": "Mauni Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
    },
    {
        "name": "Surya Grahan (Solar Eclipse)",
        "slug": "surya-grahan-solar-eclipse-2027-02-06",
        "date": "2027-02-06",
        "category": "Shubh Din",
        "blurb": "Solar eclipse occurring during Amavasya.",
        "description": "Solar eclipse occurring during Amavasya."
    },
    {
        "name": "Vasant Panchami",
        "slug": "vasant-panchami-2027-02-11",
        "date": "2027-02-11",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Vasant Panchami celebrations.",
        "description": "A Hindu festival day observed as part of the Vasant Panchami celebrations."
    },
    {
        "name": "Kumbha Sankranti",
        "slug": "kumbha-sankranti-2027-02-12",
        "date": "2027-02-12",
        "category": "Shubh Din",
        "blurb": "Kumbha Sankranti — an auspicious day in the Hindu calendar for this occasion.",
        "description": "Kumbha Sankranti — an auspicious day in the Hindu calendar for this occasion."
    },
    {
        "name": "Ratha Saptami",
        "slug": "ratha-saptami-2027-02-13",
        "date": "2027-02-13",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Ratha Saptami celebrations.",
        "description": "A Hindu festival day observed as part of the Ratha Saptami celebrations."
    },
    {
        "name": "Bhishma Ashtami",
        "slug": "bhishma-ashtami-2027-02-14",
        "date": "2027-02-14",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Bhishma Ashtami celebrations.",
        "description": "A Hindu festival day observed as part of the Bhishma Ashtami celebrations."
    },
    {
        "name": "Jaya Ekadashi",
        "slug": "jaya-ekadashi-2027-02-16",
        "date": "2027-02-16",
        "category": "Ekadashi",
        "blurb": "Jaya Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Jaya Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Gauna Jaya Ekadashi",
        "slug": "gauna-jaya-ekadashi-2027-02-17",
        "date": "2027-02-17",
        "category": "Ekadashi",
        "blurb": "Gauna Jaya Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Gauna Jaya Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Chandra Grahan (Lunar Eclipse)",
        "slug": "chandra-grahan-lunar-eclipse-2027-02-20",
        "date": "2027-02-20",
        "category": "Shubh Din",
        "blurb": "Lunar eclipse occurring during Purnima.",
        "description": "Lunar eclipse occurring during Purnima."
    },
    {
        "name": "Magha Purnima",
        "slug": "magha-purnima-2027-02-20",
        "date": "2027-02-20",
        "category": "Purnima",
        "blurb": "Magha Purnima — full moon day, considered auspicious for worship and charity.",
        "description": "Magha Purnima — full moon day, considered auspicious for worship and charity."
    },
    {
        "name": "Vijaya Ekadashi",
        "slug": "vijaya-ekadashi-2027-03-03",
        "date": "2027-03-03",
        "category": "Ekadashi",
        "blurb": "Vijaya Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Vijaya Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Maha Shivaratri",
        "slug": "maha-shivaratri-2027-03-06",
        "date": "2027-03-06",
        "category": "Festival",
        "blurb": "Great night of Lord Shiva — observed with fasting and night-long worship.",
        "description": "Great night of Lord Shiva — observed with fasting and night-long worship."
    },
    {
        "name": "Meena Sankranti",
        "slug": "meena-sankranti-2027-03-14",
        "date": "2027-03-14",
        "category": "Shubh Din",
        "blurb": "Meena Sankranti — an auspicious day in the Hindu calendar for this occasion.",
        "description": "Meena Sankranti — an auspicious day in the Hindu calendar for this occasion."
    },
    {
        "name": "Amalaki Ekadashi",
        "slug": "amalaki-ekadashi-2027-03-18",
        "date": "2027-03-18",
        "category": "Ekadashi",
        "blurb": "Amalaki Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Amalaki Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Holika Dahan / Chhoti Holi",
        "slug": "holika-dahan-chhoti-holi-2027-03-21",
        "date": "2027-03-21",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Holika Dahan / Chhoti Holi celebrations.",
        "description": "A Hindu festival day observed as part of the Holika Dahan / Chhoti Holi celebrations."
    },
    {
        "name": "Phalguna Purnima",
        "slug": "phalguna-purnima-2027-03-21",
        "date": "2027-03-21",
        "category": "Purnima",
        "blurb": "Phalguna Purnima — full moon day, considered auspicious for worship and charity.",
        "description": "Phalguna Purnima — full moon day, considered auspicious for worship and charity."
    },
    {
        "name": "Holi",
        "slug": "holi-2027-03-22",
        "date": "2027-03-22",
        "category": "Festival",
        "blurb": "Festival of colours celebrating the arrival of spring and victory of good over evil.",
        "description": "Festival of colours celebrating the arrival of spring and victory of good over evil."
    },
    {
        "name": "Sheetala Ashtami / Basoda",
        "slug": "sheetala-ashtami-basoda-2027-03-29",
        "date": "2027-03-29",
        "category": "Vrat",
        "blurb": "Sheetala Ashtami / Basoda — a traditional fast/vrat observed on this tithi.",
        "description": "Sheetala Ashtami / Basoda — a traditional fast/vrat observed on this tithi."
    },
    {
        "name": "Papamochani Ekadashi",
        "slug": "papamochani-ekadashi-2027-04-02",
        "date": "2027-04-02",
        "category": "Ekadashi",
        "blurb": "Papamochani Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Papamochani Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Nutan Varsh Prarambha / Ugadi / Gudi Padwa",
        "slug": "nutan-varsh-prarambha-ugadi-gudi-padwa-2027-04-07",
        "date": "2027-04-07",
        "category": "Festival",
        "blurb": "Hindu New Year — first day of Chaitra Shukla Paksha, also marks Chaitra Navratri begins.",
        "description": "Hindu New Year — first day of Chaitra Shukla Paksha, also marks Chaitra Navratri begins."
    },
    {
        "name": "Gauri Puja / Gangaur",
        "slug": "gauri-puja-gangaur-2027-04-09",
        "date": "2027-04-09",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Gauri Puja / Gangaur celebrations.",
        "description": "A Hindu festival day observed as part of the Gauri Puja / Gangaur celebrations."
    },
    {
        "name": "Yamuna Chhath",
        "slug": "yamuna-chhath-2027-04-12",
        "date": "2027-04-12",
        "category": "Vrat",
        "blurb": "Yamuna Chhath — a traditional fast/vrat observed on this tithi.",
        "description": "Yamuna Chhath — a traditional fast/vrat observed on this tithi."
    },
    {
        "name": "Rama Navami",
        "slug": "rama-navami-2027-04-14",
        "date": "2027-04-14",
        "category": "Festival",
        "blurb": "Birth anniversary of Lord Rama.",
        "description": "Birth anniversary of Lord Rama."
    },
    {
        "name": "Mesha Sankranti / Solar New Year",
        "slug": "mesha-sankranti-solar-new-year-2027-04-14",
        "date": "2027-04-14",
        "category": "Shubh Din",
        "blurb": "Mesha Sankranti / Solar New Year — an auspicious day in the Hindu calendar for this occasion.",
        "description": "Mesha Sankranti / Solar New Year — an auspicious day in the Hindu calendar for this occasion."
    },
    {
        "name": "Kamada Ekadashi",
        "slug": "kamada-ekadashi-2027-04-16",
        "date": "2027-04-16",
        "category": "Ekadashi",
        "blurb": "Kamada Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Kamada Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Hanuman Jayanti",
        "slug": "hanuman-jayanti-2027-04-20",
        "date": "2027-04-20",
        "category": "Festival",
        "blurb": "Birth anniversary of Lord Hanuman.",
        "description": "Birth anniversary of Lord Hanuman."
    },
    {
        "name": "Chaitra Purnima",
        "slug": "chaitra-purnima-2027-04-20",
        "date": "2027-04-20",
        "category": "Purnima",
        "blurb": "Chaitra Purnima — full moon day, considered auspicious for worship and charity.",
        "description": "Chaitra Purnima — full moon day, considered auspicious for worship and charity."
    },
    {
        "name": "Varuthini Ekadashi",
        "slug": "varuthini-ekadashi-2027-05-02",
        "date": "2027-05-02",
        "category": "Ekadashi",
        "blurb": "Varuthini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Varuthini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Akshaya Tritiya",
        "slug": "akshaya-tritiya-2027-05-08",
        "date": "2027-05-08",
        "category": "Festival",
        "blurb": "Highly auspicious day for new beginnings, gold purchase and charity; also Parashurama Jayanti.",
        "description": "Highly auspicious day for new beginnings, gold purchase and charity; also Parashurama Jayanti."
    },
    {
        "name": "Ganga Saptami",
        "slug": "ganga-saptami-2027-05-12",
        "date": "2027-05-12",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Ganga Saptami celebrations.",
        "description": "A Hindu festival day observed as part of the Ganga Saptami celebrations."
    },
    {
        "name": "Sita Navami",
        "slug": "sita-navami-2027-05-13",
        "date": "2027-05-13",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Sita Navami celebrations.",
        "description": "A Hindu festival day observed as part of the Sita Navami celebrations."
    },
    {
        "name": "Vrishabha Sankranti",
        "slug": "vrishabha-sankranti-2027-05-15",
        "date": "2027-05-15",
        "category": "Shubh Din",
        "blurb": "Vrishabha Sankranti — an auspicious day in the Hindu calendar for this occasion.",
        "description": "Vrishabha Sankranti — an auspicious day in the Hindu calendar for this occasion."
    },
    {
        "name": "Mohini Ekadashi",
        "slug": "mohini-ekadashi-2027-05-15",
        "date": "2027-05-15",
        "category": "Ekadashi",
        "blurb": "Mohini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Mohini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Gauna Mohini Ekadashi",
        "slug": "gauna-mohini-ekadashi-2027-05-16",
        "date": "2027-05-16",
        "category": "Ekadashi",
        "blurb": "Gauna Mohini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Gauna Mohini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Narasimha Jayanti",
        "slug": "narasimha-jayanti-2027-05-18",
        "date": "2027-05-18",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Narasimha Jayanti celebrations.",
        "description": "A Hindu festival day observed as part of the Narasimha Jayanti celebrations."
    },
    {
        "name": "Buddha Purnima / Vaishakha Purnima",
        "slug": "buddha-purnima-vaishakha-purnima-2027-05-19",
        "date": "2027-05-19",
        "category": "Purnima",
        "blurb": "Buddha Purnima / Vaishakha Purnima — full moon day, considered auspicious for worship and charity.",
        "description": "Buddha Purnima / Vaishakha Purnima — full moon day, considered auspicious for worship and charity."
    },
    {
        "name": "Narada Jayanti",
        "slug": "narada-jayanti-2027-05-20",
        "date": "2027-05-20",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Narada Jayanti celebrations.",
        "description": "A Hindu festival day observed as part of the Narada Jayanti celebrations."
    },
    {
        "name": "Apara Ekadashi",
        "slug": "apara-ekadashi-2027-05-31",
        "date": "2027-05-31",
        "category": "Ekadashi",
        "blurb": "Apara Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Apara Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Vat Savitri Vrat",
        "slug": "vat-savitri-vrat-2027-06-04",
        "date": "2027-06-04",
        "category": "Vrat",
        "blurb": "Vat Savitri Vrat — a traditional fast/vrat observed on this tithi.",
        "description": "Vat Savitri Vrat — a traditional fast/vrat observed on this tithi."
    },
    {
        "name": "Shani Jayanti",
        "slug": "shani-jayanti-2027-06-04",
        "date": "2027-06-04",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Shani Jayanti celebrations.",
        "description": "A Hindu festival day observed as part of the Shani Jayanti celebrations."
    },
    {
        "name": "Ganga Dussehra",
        "slug": "ganga-dussehra-2027-06-13",
        "date": "2027-06-13",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Ganga Dussehra celebrations.",
        "description": "A Hindu festival day observed as part of the Ganga Dussehra celebrations."
    },
    {
        "name": "Nirjala Ekadashi",
        "slug": "nirjala-ekadashi-2027-06-14",
        "date": "2027-06-14",
        "category": "Ekadashi",
        "blurb": "Nirjala Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Nirjala Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Mithuna Sankranti",
        "slug": "mithuna-sankranti-2027-06-15",
        "date": "2027-06-15",
        "category": "Shubh Din",
        "blurb": "Mithuna Sankranti — an auspicious day in the Hindu calendar for this occasion.",
        "description": "Mithuna Sankranti — an auspicious day in the Hindu calendar for this occasion."
    },
    {
        "name": "Vat Purnima Vrat",
        "slug": "vat-purnima-vrat-2027-06-17",
        "date": "2027-06-17",
        "category": "Vrat",
        "blurb": "Vat Purnima Vrat — a traditional fast/vrat observed on this tithi.",
        "description": "Vat Purnima Vrat — a traditional fast/vrat observed on this tithi."
    },
    {
        "name": "Jyeshtha Purnima",
        "slug": "jyeshtha-purnima-2027-06-18",
        "date": "2027-06-18",
        "category": "Purnima",
        "blurb": "Jyeshtha Purnima — full moon day, considered auspicious for worship and charity.",
        "description": "Jyeshtha Purnima — full moon day, considered auspicious for worship and charity."
    },
    {
        "name": "Yogini Ekadashi",
        "slug": "yogini-ekadashi-2027-06-30",
        "date": "2027-06-30",
        "category": "Ekadashi",
        "blurb": "Yogini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Yogini Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Jagannath Rathyatra",
        "slug": "jagannath-rathyatra-2027-07-05",
        "date": "2027-07-05",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Jagannath Rathyatra celebrations.",
        "description": "A Hindu festival day observed as part of the Jagannath Rathyatra celebrations."
    },
    {
        "name": "Devshayani Ekadashi",
        "slug": "devshayani-ekadashi-2027-07-13",
        "date": "2027-07-13",
        "category": "Ekadashi",
        "blurb": "Devshayani Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Devshayani Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Karka Sankranti",
        "slug": "karka-sankranti-2027-07-16",
        "date": "2027-07-16",
        "category": "Shubh Din",
        "blurb": "Karka Sankranti — an auspicious day in the Hindu calendar for this occasion.",
        "description": "Karka Sankranti — an auspicious day in the Hindu calendar for this occasion."
    },
    {
        "name": "Guru Purnima",
        "slug": "guru-purnima-2027-07-18",
        "date": "2027-07-18",
        "category": "Festival",
        "blurb": "Day to honour teachers and spiritual gurus.",
        "description": "Day to honour teachers and spiritual gurus."
    },
    {
        "name": "Ashadha Purnima",
        "slug": "ashadha-purnima-2027-07-18",
        "date": "2027-07-18",
        "category": "Purnima",
        "blurb": "Ashadha Purnima — full moon day, considered auspicious for worship and charity.",
        "description": "Ashadha Purnima — full moon day, considered auspicious for worship and charity."
    },
    {
        "name": "Kamika Ekadashi",
        "slug": "kamika-ekadashi-2027-07-29",
        "date": "2027-07-29",
        "category": "Ekadashi",
        "blurb": "Kamika Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Kamika Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Surya Grahan (Solar Eclipse)",
        "slug": "surya-grahan-solar-eclipse-2027-08-02",
        "date": "2027-08-02",
        "category": "Shubh Din",
        "blurb": "Solar eclipse occurring during Amavasya.",
        "description": "Solar eclipse occurring during Amavasya."
    },
    {
        "name": "Hariyali Teej",
        "slug": "hariyali-teej-2027-08-04",
        "date": "2027-08-04",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Hariyali Teej celebrations.",
        "description": "A Hindu festival day observed as part of the Hariyali Teej celebrations."
    },
    {
        "name": "Nag Panchami",
        "slug": "nag-panchami-2027-08-06",
        "date": "2027-08-06",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Nag Panchami celebrations.",
        "description": "A Hindu festival day observed as part of the Nag Panchami celebrations."
    },
    {
        "name": "Shravana Putrada Ekadashi",
        "slug": "shravana-putrada-ekadashi-2027-08-12",
        "date": "2027-08-12",
        "category": "Ekadashi",
        "blurb": "Shravana Putrada Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Shravana Putrada Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Varalakshmi Vrat",
        "slug": "varalakshmi-vrat-2027-08-13",
        "date": "2027-08-13",
        "category": "Vrat",
        "blurb": "Varalakshmi Vrat — a traditional fast/vrat observed on this tithi.",
        "description": "Varalakshmi Vrat — a traditional fast/vrat observed on this tithi."
    },
    {
        "name": "Raksha Bandhan",
        "slug": "raksha-bandhan-2027-08-16",
        "date": "2027-08-16",
        "category": "Festival",
        "blurb": "Celebrates the bond between brothers and sisters.",
        "description": "Celebrates the bond between brothers and sisters."
    },
    {
        "name": "Gayatri Jayanti",
        "slug": "gayatri-jayanti-2027-08-16",
        "date": "2027-08-16",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Gayatri Jayanti celebrations.",
        "description": "A Hindu festival day observed as part of the Gayatri Jayanti celebrations."
    },
    {
        "name": "Shravana Purnima",
        "slug": "shravana-purnima-2027-08-16",
        "date": "2027-08-16",
        "category": "Purnima",
        "blurb": "Shravana Purnima — full moon day, considered auspicious for worship and charity.",
        "description": "Shravana Purnima — full moon day, considered auspicious for worship and charity."
    },
    {
        "name": "Simha Sankranti",
        "slug": "simha-sankranti-2027-08-17",
        "date": "2027-08-17",
        "category": "Shubh Din",
        "blurb": "Simha Sankranti — an auspicious day in the Hindu calendar for this occasion.",
        "description": "Simha Sankranti — an auspicious day in the Hindu calendar for this occasion."
    },
    {
        "name": "Chandra Grahan (Lunar Eclipse)",
        "slug": "chandra-grahan-lunar-eclipse-2027-08-17",
        "date": "2027-08-17",
        "category": "Shubh Din",
        "blurb": "Lunar eclipse occurring during Purnima.",
        "description": "Lunar eclipse occurring during Purnima."
    },
    {
        "name": "Kajari Teej",
        "slug": "kajari-teej-2027-08-19",
        "date": "2027-08-19",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Kajari Teej celebrations.",
        "description": "A Hindu festival day observed as part of the Kajari Teej celebrations."
    },
    {
        "name": "Krishna Janmashtami",
        "slug": "krishna-janmashtami-2027-08-25",
        "date": "2027-08-25",
        "category": "Festival",
        "blurb": "Birth anniversary of Lord Krishna.",
        "description": "Birth anniversary of Lord Krishna."
    },
    {
        "name": "Aja Ekadashi",
        "slug": "aja-ekadashi-2027-08-27",
        "date": "2027-08-27",
        "category": "Ekadashi",
        "blurb": "Aja Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Aja Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Hartalika Teej",
        "slug": "hartalika-teej-2027-09-02",
        "date": "2027-09-02",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Hartalika Teej celebrations.",
        "description": "A Hindu festival day observed as part of the Hartalika Teej celebrations."
    },
    {
        "name": "Ganesh Chaturthi",
        "slug": "ganesh-chaturthi-2027-09-03",
        "date": "2027-09-03",
        "category": "Festival",
        "blurb": "Birth anniversary of Lord Ganesha, celebrated over ten days.",
        "description": "Birth anniversary of Lord Ganesha, celebrated over ten days."
    },
    {
        "name": "Rishi Panchami",
        "slug": "rishi-panchami-2027-09-04",
        "date": "2027-09-04",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Rishi Panchami celebrations.",
        "description": "A Hindu festival day observed as part of the Rishi Panchami celebrations."
    },
    {
        "name": "Radha Ashtami",
        "slug": "radha-ashtami-2027-09-07",
        "date": "2027-09-07",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Radha Ashtami celebrations.",
        "description": "A Hindu festival day observed as part of the Radha Ashtami celebrations."
    },
    {
        "name": "Parsva Ekadashi",
        "slug": "parsva-ekadashi-2027-09-11",
        "date": "2027-09-11",
        "category": "Ekadashi",
        "blurb": "Parsva Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Parsva Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Onam",
        "slug": "onam-2027-09-12",
        "date": "2027-09-12",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Onam celebrations.",
        "description": "A Hindu festival day observed as part of the Onam celebrations."
    },
    {
        "name": "Ganesh Visarjan / Anant Chaturdashi",
        "slug": "ganesh-visarjan-anant-chaturdashi-2027-09-14",
        "date": "2027-09-14",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Ganesh Visarjan / Anant Chaturdashi celebrations.",
        "description": "A Hindu festival day observed as part of the Ganesh Visarjan / Anant Chaturdashi celebrations."
    },
    {
        "name": "Bhadrapada Purnima",
        "slug": "bhadrapada-purnima-2027-09-15",
        "date": "2027-09-15",
        "category": "Purnima",
        "blurb": "Bhadrapada Purnima — full moon day, considered auspicious for worship and charity.",
        "description": "Bhadrapada Purnima — full moon day, considered auspicious for worship and charity."
    },
    {
        "name": "Pitru Paksha Begins",
        "slug": "pitru-paksha-begins-2027-09-16",
        "date": "2027-09-16",
        "category": "Shubh Din",
        "blurb": "Pitru Paksha Begins — an auspicious day in the Hindu calendar for this occasion.",
        "description": "Pitru Paksha Begins — an auspicious day in the Hindu calendar for this occasion."
    },
    {
        "name": "Vishwakarma Puja",
        "slug": "vishwakarma-puja-2027-09-17",
        "date": "2027-09-17",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Vishwakarma Puja celebrations.",
        "description": "A Hindu festival day observed as part of the Vishwakarma Puja celebrations."
    },
    {
        "name": "Kanya Sankranti",
        "slug": "kanya-sankranti-2027-09-17",
        "date": "2027-09-17",
        "category": "Shubh Din",
        "blurb": "Kanya Sankranti — an auspicious day in the Hindu calendar for this occasion.",
        "description": "Kanya Sankranti — an auspicious day in the Hindu calendar for this occasion."
    },
    {
        "name": "Indira Ekadashi",
        "slug": "indira-ekadashi-2027-09-25",
        "date": "2027-09-25",
        "category": "Ekadashi",
        "blurb": "Indira Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Indira Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Gauna Indira Ekadashi",
        "slug": "gauna-indira-ekadashi-2027-09-26",
        "date": "2027-09-26",
        "category": "Ekadashi",
        "blurb": "Gauna Indira Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Gauna Indira Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Sarva Pitru Amavasya",
        "slug": "sarva-pitru-amavasya-2027-09-29",
        "date": "2027-09-29",
        "category": "Amavasya",
        "blurb": "Sarva Pitru Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
        "description": "Sarva Pitru Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
    },
    {
        "name": "Navratri Begins (Sharadiya)",
        "slug": "navratri-begins-sharadiya-2027-09-30",
        "date": "2027-09-30",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Navratri Begins (Sharadiya) celebrations.",
        "description": "A Hindu festival day observed as part of the Navratri Begins (Sharadiya) celebrations."
    },
    {
        "name": "Saraswati Avahan",
        "slug": "saraswati-avahan-2027-10-05",
        "date": "2027-10-05",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Saraswati Avahan celebrations.",
        "description": "A Hindu festival day observed as part of the Saraswati Avahan celebrations."
    },
    {
        "name": "Saraswati Puja / Durga Ashtami",
        "slug": "saraswati-puja-durga-ashtami-2027-10-07",
        "date": "2027-10-07",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Saraswati Puja / Durga Ashtami celebrations.",
        "description": "A Hindu festival day observed as part of the Saraswati Puja / Durga Ashtami celebrations."
    },
    {
        "name": "Maha Navami",
        "slug": "maha-navami-2027-10-08",
        "date": "2027-10-08",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Maha Navami celebrations.",
        "description": "A Hindu festival day observed as part of the Maha Navami celebrations."
    },
    {
        "name": "Vijayadashami / Dussehra",
        "slug": "vijayadashami-dussehra-2027-10-09",
        "date": "2027-10-09",
        "category": "Festival",
        "blurb": "Celebrates the victory of Lord Rama over Ravana, marks the end of Navratri.",
        "description": "Celebrates the victory of Lord Rama over Ravana, marks the end of Navratri."
    },
    {
        "name": "Papankusha Ekadashi",
        "slug": "papankusha-ekadashi-2027-10-10",
        "date": "2027-10-10",
        "category": "Ekadashi",
        "blurb": "Papankusha Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Papankusha Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Kojagara Puja / Sharad Purnima",
        "slug": "kojagara-puja-sharad-purnima-2027-10-14",
        "date": "2027-10-14",
        "category": "Purnima",
        "blurb": "Kojagara Puja / Sharad Purnima — full moon day, considered auspicious for worship and charity.",
        "description": "Kojagara Puja / Sharad Purnima — full moon day, considered auspicious for worship and charity."
    },
    {
        "name": "Ashwina Purnima",
        "slug": "ashwina-purnima-2027-10-15",
        "date": "2027-10-15",
        "category": "Purnima",
        "blurb": "Ashwina Purnima — full moon day, considered auspicious for worship and charity.",
        "description": "Ashwina Purnima — full moon day, considered auspicious for worship and charity."
    },
    {
        "name": "Tula Sankranti",
        "slug": "tula-sankranti-2027-10-17",
        "date": "2027-10-17",
        "category": "Shubh Din",
        "blurb": "Tula Sankranti — an auspicious day in the Hindu calendar for this occasion.",
        "description": "Tula Sankranti — an auspicious day in the Hindu calendar for this occasion."
    },
    {
        "name": "Karwa Chauth",
        "slug": "karwa-chauth-2027-10-18",
        "date": "2027-10-18",
        "category": "Vrat",
        "blurb": "Married women fast for the long life of their husbands.",
        "description": "Married women fast for the long life of their husbands."
    },
    {
        "name": "Ahoi Ashtami",
        "slug": "ahoi-ashtami-2027-10-22",
        "date": "2027-10-22",
        "category": "Vrat",
        "blurb": "Ahoi Ashtami — a traditional fast/vrat observed on this tithi.",
        "description": "Ahoi Ashtami — a traditional fast/vrat observed on this tithi."
    },
    {
        "name": "Govatsa Dwadashi",
        "slug": "govatsa-dwadashi-2027-10-25",
        "date": "2027-10-25",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Govatsa Dwadashi celebrations.",
        "description": "A Hindu festival day observed as part of the Govatsa Dwadashi celebrations."
    },
    {
        "name": "Rama Ekadashi",
        "slug": "rama-ekadashi-2027-10-25",
        "date": "2027-10-25",
        "category": "Ekadashi",
        "blurb": "Rama Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Rama Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Dhanteras",
        "slug": "dhanteras-2027-10-26",
        "date": "2027-10-26",
        "category": "Festival",
        "blurb": "Marks the start of Diwali celebrations; auspicious for buying gold and utensils.",
        "description": "Marks the start of Diwali celebrations; auspicious for buying gold and utensils."
    },
    {
        "name": "Kali Chaudas",
        "slug": "kali-chaudas-2027-10-27",
        "date": "2027-10-27",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Kali Chaudas celebrations.",
        "description": "A Hindu festival day observed as part of the Kali Chaudas celebrations."
    },
    {
        "name": "Diwali / Lakshmi Puja",
        "slug": "diwali-lakshmi-puja-2027-10-28",
        "date": "2027-10-28",
        "category": "Festival",
        "blurb": "Festival of lights, worship of Goddess Lakshmi for prosperity.",
        "description": "Festival of lights, worship of Goddess Lakshmi for prosperity."
    },
    {
        "name": "Narak Chaturdashi",
        "slug": "narak-chaturdashi-2027-10-28",
        "date": "2027-10-28",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Narak Chaturdashi celebrations.",
        "description": "A Hindu festival day observed as part of the Narak Chaturdashi celebrations."
    },
    {
        "name": "Govardhan Puja",
        "slug": "govardhan-puja-2027-10-29",
        "date": "2027-10-29",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Govardhan Puja celebrations.",
        "description": "A Hindu festival day observed as part of the Govardhan Puja celebrations."
    },
    {
        "name": "Bhaiya Dooj",
        "slug": "bhaiya-dooj-2027-10-30",
        "date": "2027-10-30",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Bhaiya Dooj celebrations.",
        "description": "A Hindu festival day observed as part of the Bhaiya Dooj celebrations."
    },
    {
        "name": "Chhath Puja",
        "slug": "chhath-puja-2027-11-04",
        "date": "2027-11-04",
        "category": "Festival",
        "blurb": "Worship of the Sun God, prominently observed in Bihar and eastern India.",
        "description": "Worship of the Sun God, prominently observed in Bihar and eastern India."
    },
    {
        "name": "Kansa Vadh",
        "slug": "kansa-vadh-2027-11-08",
        "date": "2027-11-08",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Kansa Vadh celebrations.",
        "description": "A Hindu festival day observed as part of the Kansa Vadh celebrations."
    },
    {
        "name": "Devutthana Ekadashi",
        "slug": "devutthana-ekadashi-2027-11-09",
        "date": "2027-11-09",
        "category": "Ekadashi",
        "blurb": "Also called Prabodhini Ekadashi — Lord Vishnu wakes from cosmic sleep; marriage season begins.",
        "description": "Also called Prabodhini Ekadashi — Lord Vishnu wakes from cosmic sleep; marriage season begins."
    },
    {
        "name": "Tulasi Vivah",
        "slug": "tulasi-vivah-2027-11-10",
        "date": "2027-11-10",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Tulasi Vivah celebrations.",
        "description": "A Hindu festival day observed as part of the Tulasi Vivah celebrations."
    },
    {
        "name": "Kartika Purnima",
        "slug": "kartika-purnima-2027-11-13",
        "date": "2027-11-13",
        "category": "Purnima",
        "blurb": "Kartika Purnima — full moon day, considered auspicious for worship and charity.",
        "description": "Kartika Purnima — full moon day, considered auspicious for worship and charity."
    },
    {
        "name": "Vrishchika Sankranti",
        "slug": "vrishchika-sankranti-2027-11-16",
        "date": "2027-11-16",
        "category": "Shubh Din",
        "blurb": "Vrishchika Sankranti — an auspicious day in the Hindu calendar for this occasion.",
        "description": "Vrishchika Sankranti — an auspicious day in the Hindu calendar for this occasion."
    },
    {
        "name": "Kalabhairav Jayanti",
        "slug": "kalabhairav-jayanti-2027-11-20",
        "date": "2027-11-20",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Kalabhairav Jayanti celebrations.",
        "description": "A Hindu festival day observed as part of the Kalabhairav Jayanti celebrations."
    },
    {
        "name": "Utpanna Ekadashi",
        "slug": "utpanna-ekadashi-2027-11-23",
        "date": "2027-11-23",
        "category": "Ekadashi",
        "blurb": "Utpanna Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Utpanna Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Vivah Panchami",
        "slug": "vivah-panchami-2027-12-02",
        "date": "2027-12-02",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Vivah Panchami celebrations.",
        "description": "A Hindu festival day observed as part of the Vivah Panchami celebrations."
    },
    {
        "name": "Gita Jayanti",
        "slug": "gita-jayanti-2027-12-09",
        "date": "2027-12-09",
        "category": "Festival",
        "blurb": "Anniversary of the day Lord Krishna narrated the Bhagavad Gita.",
        "description": "Anniversary of the day Lord Krishna narrated the Bhagavad Gita."
    },
    {
        "name": "Mokshada Ekadashi",
        "slug": "mokshada-ekadashi-2027-12-09",
        "date": "2027-12-09",
        "category": "Ekadashi",
        "blurb": "Mokshada Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Mokshada Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Dattatreya Jayanti",
        "slug": "dattatreya-jayanti-2027-12-12",
        "date": "2027-12-12",
        "category": "Festival",
        "blurb": "A Hindu festival day observed as part of the Dattatreya Jayanti celebrations.",
        "description": "A Hindu festival day observed as part of the Dattatreya Jayanti celebrations."
    },
    {
        "name": "Margashirsha Purnima",
        "slug": "margashirsha-purnima-2027-12-13",
        "date": "2027-12-13",
        "category": "Purnima",
        "blurb": "Margashirsha Purnima — full moon day, considered auspicious for worship and charity.",
        "description": "Margashirsha Purnima — full moon day, considered auspicious for worship and charity."
    },
    {
        "name": "Dhanu Sankranti",
        "slug": "dhanu-sankranti-2027-12-16",
        "date": "2027-12-16",
        "category": "Shubh Din",
        "blurb": "Dhanu Sankranti — an auspicious day in the Hindu calendar for this occasion.",
        "description": "Dhanu Sankranti — an auspicious day in the Hindu calendar for this occasion."
    },
    {
        "name": "Saphala Ekadashi",
        "slug": "saphala-ekadashi-2027-12-23",
        "date": "2027-12-23",
        "category": "Ekadashi",
        "blurb": "Saphala Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu.",
        "description": "Saphala Ekadashi — the 11th lunar day fast dedicated to Lord Vishnu."
    },
    {
        "name": "Somavati Amavasya",
        "slug": "somavati-amavasya-2027-12-27",
        "date": "2027-12-27",
        "category": "Amavasya",
        "blurb": "Somavati Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies.",
        "description": "Somavati Amavasya — new moon day, observed for ancestor worship (Tarpan) and remedies."
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
    console.log("Connected to MongoDB for 2027 Festival seed.");

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const item of FESTIVAL_SEED_DATA_2027) {
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

    console.log("\n===== Seed Summary (2027) =====");
    console.log(`Total in dataset : ${FESTIVAL_SEED_DATA_2027.length}`);
    console.log(`Created          : ${created}`);
    console.log(`Skipped (exist)  : ${skipped}`);
    console.log(`Failed           : ${failed}`);
    console.log("================================\n");

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