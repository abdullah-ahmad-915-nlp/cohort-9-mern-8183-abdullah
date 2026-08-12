import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
});

let csrfToken = null;

async function fetchCsrfToken() {
    const response = await api.get('/csrf-token');
    csrfToken = response.data.csrfToken;
}

api.interceptors.request.use(async (config) => {
    const method = config.method?.toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        if (!csrfToken) {
        await fetchCsrfToken();
        }
        config.headers['x-csrf-token'] = csrfToken;
    }
    return config;
});

export { api, fetchCsrfToken };