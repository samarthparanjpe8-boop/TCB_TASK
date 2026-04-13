// src/lib/api.ts
import axios from 'axios';

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export const api = axios.create({
    baseURL: '/api/v1',
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
