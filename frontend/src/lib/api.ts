// src/lib/api.ts
import axios from 'axios';

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
let apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Automatically append /api/v1 if only the domain was provided in Environment Variables
if (apiBaseUrl.startsWith('http') && !apiBaseUrl.endsWith('/api/v1')) {
    apiBaseUrl = apiBaseUrl.replace(/\/$/, '') + '/api/v1';
}

export const api = axios.create({
    baseURL: apiBaseUrl,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('classroomiq_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            const url = String(err.config?.url ?? '');
            const isAuthAttempt =
                url.includes('auth/sign-in') || url.includes('auth/register');
            if (!isAuthAttempt) {
                localStorage.removeItem('classroomiq_token');
                localStorage.removeItem('classroomiq_user');
                window.location.href = '/sign-in';
            }
        }
        return Promise.reject(err);
    }
);

export { isDemoMode };
