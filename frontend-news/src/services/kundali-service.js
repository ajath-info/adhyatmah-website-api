import http from './http';

// Kundali (birth chart) API calls — kept in their own file so nothing in
// the large services/index.js has to be touched. Mirrors panchang-service.js.

export const generateKundali = async ({ name, gender, dob, tob, birthPlace, lat, lng, chartStyle }) => {
    const { data } = await http.post('/kundali/generate', {
        name,
        gender,
        dob,
        tob,
        birthPlace,
        lat,
        lng,
        chartStyle
    });
    return data;
};

export const getMyKundalis = async () => {
    const { data } = await http.get('/kundali/mine');
    return data;
};

export const getKundaliById = async (id) => {
    const { data } = await http.get(`/kundali/${id}`);
    return data;
};

export const deleteKundali = async (id) => {
    const { data } = await http.delete(`/kundali/${id}`);
    return data;
};