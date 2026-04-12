// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api, isDemoMode } from '../lib/api';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo JWT (unsigned, for frontend-only mode)
function createDemoToken(email: string): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const now = Math.floor(Date.now() / 1000);
    const payload = btoa(
        JSON.stringify({
            sub: 'demo-user-001',
            email,
            role: 'teacher',
            iat: now,
            exp: now + 86400,
            user_metadata: { full_name: 'Demo Teacher' },
        })
    );
    return `${header}.${payload}.demo_signature`;
}

function createDemoUser(email: string): User {
    return {
        id: 'demo-user-001',
        authId: 'demo-user-001',
        email,
        displayName: 'Demo Teacher',
        role: 'teacher',
        archivedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('classroomiq_token');
        const storedUser = localStorage.getItem('classroomiq_user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        if (isDemoMode) {
            if (!email.trim() || password.length < 4) {
                throw new Error('Use any email and a password of at least 4 characters');
            }
            const demoToken = createDemoToken(email);
            const demoUser = createDemoUser(email);
            localStorage.setItem('classroomiq_token', demoToken);
            localStorage.setItem('classroomiq_user', JSON.stringify(demoUser));
            setToken(demoToken);
            setUser(demoUser);
            return;
        }
        // Real mode: you would call your Supabase auth endpoint here
        // Then store the JWT and fetch /api/v1/me
        const { data: authData } = await api.post('/auth/sign-in', { email, password });
        const newToken = authData.access_token;
        localStorage.setItem('classroomiq_token', newToken);
        const { data: me } = await api.get('/me');
        localStorage.setItem('classroomiq_user', JSON.stringify(me));
        setToken(newToken);
        setUser(me);
    };

    const logout = () => {
        localStorage.removeItem('classroomiq_token');
        localStorage.removeItem('classroomiq_user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
