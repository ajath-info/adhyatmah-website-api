import http from './http';

// Combo booking APIs (separate file so services/index.js stays untouched)
export const getPujaComboSlots = async (slug, date) => {
    const tz = new Date().getTimezoneOffset();
    const { data } = await http.get(`/puja-combos/${encodeURIComponent(slug)}/slots?date=${date}&tz=${tz}`);
    return data;
};

export const getPujaComboPandits = async (slug, dateTimeISO = '') => {
    const q = dateTimeISO ? `?dateTime=${encodeURIComponent(dateTimeISO)}` : '';
    const { data } = await http.get(`/puja-combos/${encodeURIComponent(slug)}/pandits${q}`);
    return data;
};

export const bookPujaCombo = async (slug, body) => {
    const { data } = await http.post(`/puja-combos/${encodeURIComponent(slug)}/book`, body);
    return data;
};