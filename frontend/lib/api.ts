import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const searchSchemes = async (query: string) => {
    const response = await api.post('/search', { query });
    return response.data;
};

export const verifyEligibility = async (schemeName: string, profile: any) => {
    const response = await api.post('/verify', {
        scheme_name: schemeName,
        user_profile: profile
    });
    return response.data;
};
