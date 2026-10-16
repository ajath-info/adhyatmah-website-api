// import http from './http';

// // Panchang API calls — kept in their own file so nothing in the large
// // services/index.js has to be touched.

// export const getPanchangCities = async () => {
//     const { data } = await http.get('/panchang/cities');
//     return data;
// };

// export const getPanchangMonth = async ({ lat, lng, city, year, month } = {}) => {
//     const params = { year, month };
//     if (lat !== undefined && lng !== undefined) {
//         params.lat = lat;
//         params.lng = lng;
//     }
//     if (city) params.city = city;

//     const { data } = await http.get('/panchang/month', { params });
//     return data;
// };

// export const getPanchang = async ({ lat, lng, city, date } = {}) => {
//     const params = {};
//     if (lat !== undefined && lng !== undefined) {
//         params.lat = lat;
//         params.lng = lng;
//     }
//     if (city) params.city = city;
//     if (date) params.date = date;

//     const { data } = await http.get('/panchang', { params });
//     return data;
// };



import http from './http';

// Panchang API calls — kept in their own file so nothing in the large
// services/index.js has to be touched.

export const getPanchangCities = async () => {
    const { data } = await http.get('/panchang/cities');
    return data;
};

export const getPanchangMonth = async ({ lat, lng, city, year, month } = {}) => {
    const params = { year, month };
    if (lat !== undefined && lng !== undefined) {
        params.lat = lat;
        params.lng = lng;
    }
    if (city) params.city = city;

    const { data } = await http.get('/panchang/month', { params });
    return data;
};

export const getPanchang = async ({ lat, lng, city, date } = {}) => {
    const params = {};
    if (lat !== undefined && lng !== undefined) {
        params.lat = lat;
        params.lng = lng;
    }
    if (city) params.city = city;
    if (date) params.date = date;

    const { data } = await http.get('/panchang', { params });
    return data;
};

// Real, calculated Muhurat table (Griha Pravesh, Vivah, Vehicle Purchase,
// etc.) for a date + location — see muhurat-rules-util.js on the backend.
export const getMuhurat = async ({ lat, lng, city, date } = {}) => {
    const params = {};
    if (lat !== undefined && lng !== undefined) {
        params.lat = lat;
        params.lng = lng;
    }
    if (city) params.city = city;
    if (date) params.date = date;

    const { data } = await http.get('/panchang/muhurat', { params });
    return data;
};

// Real, calculated LIST of auspicious dates (+ exact time intervals) for a
// category across a whole month — e.g. every good Vivah date in October
// 2026 — from the new /panchang/muhurat/month endpoint. `month` is 1-12.
export const getMuhuratMonth = async ({ lat, lng, city, year, month, category, strict } = {}) => {
    const params = { year, month, category };
    if (lat !== undefined && lng !== undefined) {
        params.lat = lat;
        params.lng = lng;
    }
    if (city) params.city = city;
    if (strict) params.strict = true;

    const { data } = await http.get('/panchang/muhurat/month', { params });
    return data;
};

// Live "Current Planetary Positions" for a date + location — reuses the
// same Panchang cache/Prokerala call as getPanchang()/getMuhurat() on the
// backend, so calling this alongside them doesn't cost any extra API
// credits. Returns { date, city, positions[], keyInsights[] }.
export const getPlanetaryTransit = async ({ lat, lng, city, date } = {}) => {
    const params = {};
    if (lat !== undefined && lng !== undefined) {
        params.lat = lat;
        params.lng = lng;
    }
    if (city) params.city = city;
    if (date) params.date = date;

    const { data } = await http.get('/panchang/planetary-transit', { params });
    return data;
};

// Upcoming rashi-ingress ("Upcoming Major Transits") events, computed
// astronomically (NOT from Prokerala — see planetary-transit-util.js on the
// backend) and cached. `months` is how far ahead to look (default 12),
// `limit` caps the number of rows returned (default 10).
export const getUpcomingTransits = async ({ months, limit } = {}) => {
    const params = {};
    if (months !== undefined) params.months = months;
    if (limit !== undefined) params.limit = limit;

    const { data } = await http.get('/panchang/planetary-transit/upcoming', { params });
    return data;
};