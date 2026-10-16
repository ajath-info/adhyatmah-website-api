/**
 * Static, classical "Key Transit Insights" text — one line per
 * (planet, rashi) combination, for the 4 grahas the reference design
 * calls out (Jupiter, Saturn, Rahu, Ketu — the "special"/slow-moving
 * transits people track). No date/time anywhere in here: the live
 * planet+rashi lookup happens on every request via getTransitInsight(),
 * so this table itself never goes stale.
 */

const TRANSIT_INSIGHT_RULES = {
    Jupiter: {
        Aries: "Favors new initiatives, courage and career growth through bold action.",
        Taurus: "Supports financial growth, family harmony and material comforts.",
        Gemini: "Favors learning, communication and new opportunities.",
        Cancer: "Brings emotional growth, family blessings and domestic happiness.",
        Leo: "Boosts confidence, leadership and recognition in public life.",
        Virgo: "Encourages practical wisdom, service and improved health routines.",
        Libra: "Favors partnerships, marriage prospects and diplomatic success.",
        Scorpio: "Brings transformation, deeper insight and financial gains through others.",
        Sagittarius: "Strengthens wisdom, higher learning and spiritual pursuits (own sign).",
        Capricorn: "Calls for disciplined, patient effort before career gains show up.",
        Aquarius: "Favors humanitarian work, networking and unconventional gains.",
        Pisces: "Deepens intuition, compassion and spiritual growth (own sign).",
    },
    Saturn: {
        Aries: "Tests patience and independence; slow but durable gains through discipline.",
        Taurus: "Brings steady, hard-won growth in finances and material security.",
        Gemini: "Demands focus and structure in communication, study and short trips.",
        Cancer: "Challenges emotional security; rewards those who build stable routines.",
        Leo: "Humbles ego and asks for quiet, consistent effort over showmanship.",
        Virgo: "Rewards meticulous work, health discipline and service-oriented effort.",
        Libra: "Strengthens commitments and long-term partnerships through steady effort (own sign of exaltation).",
        Scorpio: "Deepens resolve; favors research, investigation and quiet transformation.",
        Sagittarius: "Tests belief systems and long-term goals; disciplined study pays off.",
        Capricorn: "Favors career structure, authority and long-term ambition (own sign).",
        Aquarius: "Focus on discipline, long-term goals and inner growth (own sign).",
        Pisces: "Asks for grounded routines around intuition, art and spiritual practice.",
    },
    Rahu: {
        Aries: "Fuels ambition and impulsiveness; channel restless energy carefully.",
        Taurus: "Heightens desire for material comfort and status; avoid overreach in spending.",
        Gemini: "Sharpens curiosity and communication skills, sometimes toward restlessness.",
        Cancer: "Stirs emotional intensity around home and family matters.",
        Leo: "Amplifies desire for recognition; watch for ego-driven decisions.",
        Virgo: "Brings obsessive focus on work and health routines; avoid overanalysis.",
        Libra: "Intensifies pursuit of relationships and partnerships, sometimes unconventionally.",
        Scorpio: "Deepens fascination with the hidden, occult or transformative; stay grounded.",
        Sagittarius: "Pulls toward unconventional beliefs and foreign connections.",
        Capricorn: "Fuels ambition in career and status; avoid shortcuts under pressure.",
        Aquarius: "Brings spiritual inclination, imagination and karmic shifts.",
        Pisces: "Heightens imagination and idealism; stay anchored in practical reality.",
    },
    Ketu: {
        Aries: "Brings detachment from personal ambition; encourages introspection.",
        Taurus: "Reduces attachment to material comforts; favors simplicity.",
        Gemini: "Encourages detachment and analytical thinking.",
        Cancer: "Detaches from emotional dependency; supports inner reflection on family ties.",
        Leo: "Reduces need for external validation; favors quiet inner confidence.",
        Virgo: "Encourages detachment and analytical thinking.",
        Libra: "Brings detachment from relationship expectations; favors inner balance.",
        Scorpio: "Deepens spiritual insight and detachment from material transformation (own sign of exaltation).",
        Sagittarius: "Encourages questioning of dogma; favors independent spiritual seeking.",
        Capricorn: "Detaches from status-seeking; favors humble, purposeful work.",
        Aquarius: "Encourages detachment from group identity; favors independent thinking.",
        Pisces: "Deepens surrender and spiritual detachment (own sign).",
    },
};

/**
 * @param {string} planet - "Jupiter" | "Saturn" | "Rahu" | "Ketu"
 * @param {string} rashi - English rashi name, e.g. "Gemini"
 * @param {boolean} [isRetrograde]
 * @returns {string|undefined}
 */
function getTransitInsight(planet, rashi, isRetrograde) {
    const text = TRANSIT_INSIGHT_RULES[planet]?.[rashi];
    if (!text) return undefined;
    return isRetrograde ? `${text} (Retrograde — effects turn inward.)` : text;
}

module.exports = {
    TRANSIT_INSIGHT_RULES,
    getTransitInsight,
};