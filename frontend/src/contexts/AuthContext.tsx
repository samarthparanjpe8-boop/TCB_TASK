// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';
import { api, isDemoMode } from '../lib/api';
import type { User } from '../types';

export type RegisterInput = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'teacher' | 'student';
};

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (input: RegisterInput) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getApiErrorMessage(err: unknown, fallback: string): string {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as { error?: string; message?: string } | undefined;
        if (data?.error) return data.error;
        if (typeof data?.message === 'string') return data.message;
    }
    if (err instanceof Error) return err.message;
    return fallback;
}

// Demo JWT (unsigned, for frontend-only mode)
function createDemoToken(email: string, displayName: string, meta: Record<string, unknown>): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const now = Math.floor(Date.now() / 1000);
    const payload = btoa(
        JSON.stringify({
            sub: 'demo-user-001',
            email,
            role: 'teacher',
            iat: now,
            exp: now + 86400,
            user_metadata: { full_name: displayName, ...meta },
        })
    );
    return `${header}.${payload}.demo_signature`;
}

function createDemoUser(input: {
    email: string;
    firstName: string;
    lastName: string;
    role: 'teacher' | 'student';
}): User {
    const displayName = `${input.firstName} ${input.lastName}`.trim() || input.email.split('@')[0] || 'User';
    return {
        id: 'demo-user-001',
        authId: 'demo-user-001',
        email: input.email,
        displayName,
        firstName: input.firstName,
        lastName: input.lastName,
        registrationMarks: null,
        role: input.role,
        archivedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

async function persistAccessToken(accessToken: string): Promise<User> {
    localStorage.setItem('studentiq_token', accessToken);
    const { data: me } = await api.get<User>('/me');
    localStorage.setItem('studentiq_user', JSON.stringify(me));
    return me;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('studentiq_token');
        const storedUser = localStorage.getItem('studentiq_user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser) as User);
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        if (isDemoMode) {
            if (!email.trim() || password.length < 4) {
                throw new Error('Use any email and a password of at least 4 characters');
            }
            const displayName = 'Demo Teacher';
            const demoToken = createDemoToken(email.trim(), displayName, {
                first_name: 'Demo',
                last_name: 'Teacher',
            });
            const demoUser = createDemoUser({
                email: email.trim(),
                firstName: 'Demo',
                lastName: 'Teacher',
                role: 'teacher',
            });
            localStorage.setItem('studentiq_token', demoToken);
            localStorage.setItem('studentiq_user', JSON.stringify(demoUser));
            setToken(demoToken);
            setUser(demoUser);
            return;
        }
        try {
            const { data: authData } = await api.post<{ access_token?: string }>('/auth/sign-in', {
                email: email.trim(),
                password,
            });
            if (!authData.access_token) {
                throw new Error('No access token returned');
            }
            const me = await persistAccessToken(authData.access_token);
            setToken(authData.access_token);
            setUser(me);
        } catch (err: unknown) {
            throw new Error(getApiErrorMessage(err, 'Login failed. Try again.'));
        }
    };

    const register = async (input: RegisterInput) => {
        const email = input.email.trim();
        const firstName = input.firstName.trim();
        const lastName = input.lastName.trim();
        if (!email || !input.password) {
            throw new Error('Email and password are required');
        }
        if (!firstName || !lastName) {
            throw new Error('First and last name are required');
        }

        if (isDemoMode) {
            if (input.password.length < 4) {
                throw new Error('Use a password of at least 4 characters');
            }
            const displayName = `${firstName} ${lastName}`.trim();
            const demoToken = createDemoToken(email, displayName, {
                first_name: firstName,
                last_name: lastName,
                role: input.role,
            });
            const demoUser = createDemoUser({ email, firstName, lastName, role: input.role });
            localStorage.setItem('studentiq_token', demoToken);
            localStorage.setItem('studentiq_user', JSON.stringify(demoUser));
            setToken(demoToken);
            setUser(demoUser);
            return;
        }

        try {
            const { data } = await api.post<{ access_token?: string }>('/auth/register', {
                email,
                password: input.password,
                firstName,
                lastName,
                role: input.role,
            });
            if (!data.access_token) {
                throw new Error('No access token returned');
            }
            const me = await persistAccessToken(data.access_token);
            setToken(data.access_token);
            setUser(me);
        } catch (err: unknown) {
            throw new Error(getApiErrorMessage(err, 'Registration failed. Try again.'));
        }
    };

    const logout = () => {
        localStorage.removeItem('studentiq_token');
        localStorage.removeItem('studentiq_user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
