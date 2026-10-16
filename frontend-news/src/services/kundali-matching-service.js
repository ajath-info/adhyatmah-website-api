import http from './http';

// Kundali Matching (Ashtakoot Guna Milan) API calls — kept in their own
// file so nothing in the large services/index.js has to be touched.
// Mirrors kundali-service.js.

export const generateKundaliMatch = async ({ boy, girl }) => {
    const { data } = await http.post('/kundali-matching/generate', { boy, girl });
    return data;
};

export const getMyKundaliMatches = async () => {
    const { data } = await http.get('/kundali-matching/mine');
    return data;
};

export const getKundaliMatchById = async (id) => {
    const { data } = await http.get(`/kundali-matching/${id}`);
    return data;
};

export const deleteKundaliMatch = async (id) => {
    const { data } = await http.delete(`/kundali-matching/${id}`);
    return data;
};