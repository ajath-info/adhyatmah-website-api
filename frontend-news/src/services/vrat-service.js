import http from './http';

// Vrat & Upvas API calls — public listing/detail endpoints backed by the
// admin-managed Vrat collection. Kept in its own file so nothing in the
// large services/index.js has to be touched.

export const getVrats = async ({ month, year, type, purpose, search, page, limit } = {}) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    if (type && type !== 'all') params.type = type;
    if (purpose && purpose.length) params.purpose = purpose;
    if (search) params.search = search;
    if (page) params.page = page;
    if (limit) params.limit = limit;

    const { data } = await http.get('/vrats', { params });
    return data;
};

export const getVratBySlug = async (slug) => {
    const { data } = await http.get(`/vrats/${slug}`);
    return data;
};

export const getTodayVrat = async () => {
    const { data } = await http.get('/vrats/today');
    return data;
};