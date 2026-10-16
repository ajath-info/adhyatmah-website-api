import http from './http';

// Festivals API calls — public listing/detail endpoints backed by the
// admin-managed Festival collection (replaces the old static
// src/data/festivals-2026.js file). Kept in its own file, same pattern as
// vrat-service.js, so nothing in the large services/index.js has to change.

export const getFestivals = async ({ month, year, category, search, page, limit } = {}) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    if (category && category !== 'all') params.category = category;
    if (search) params.search = search;
    if (page) params.page = page;
    if (limit) params.limit = limit;

    const { data } = await http.get('/festivals', { params });
    return data;
};

export const getFestivalBySlug = async (slug) => {
    const { data } = await http.get(`/festivals/${slug}`);
    return data;
};

export const getFeaturedFestival = async () => {
    const { data } = await http.get('/festivals/featured');
    return data;
};

export const getUpcomingFestivals = async (limit) => {
    const { data } = await http.get('/festivals/upcoming', { params: limit ? { limit } : {} });
    return data;
};