// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { isDemoMode } from '../lib/api';
import './SignInPage.css';

export function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState<'student' | 'teacher'>('student');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const { resolvedTheme, setTheme } = useTheme();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await register({ email, password, firstName, lastName, role });
            navigate('/app');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Registration failed. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signin-page">
            <div className="signin-top-bar">
                <Link to="/" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>
                    ← Back to home
                </Link>
                <button
                    type="button"
                    className="theme-toggle-btn"
                    onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                >
                    {resolvedTheme === 'dark' ? (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    ) : (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    )}
                </button>
            </div>

            <div className="signin-center">
                <div className="signin-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h1 className="signin-title">Create your account</h1>
                <p className="signin-sub">Create a secure ClassroomIQ account</p>

                <div className="signin-card card">
                    {isDemoMode && (
                        <div className="demo-hint">
                            <span className="demo-hint-icon"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span>
                            <div>
                                <div className="demo-hint-title">Demo Mode</div>
                                <div className="demo-hint-text">
                                    Your profile is stored locally. Use a password of 4+ characters.
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="signin-form">
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-first">First name</label>
                            <div className="input-with-icon">
                                <input
                                    id="reg-first"
                                    type="text"
                                    className="form-input"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Jane"
                                    required
                                    autoComplete="given-name"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-last">Last name</label>
                            <div className="input-with-icon">
                                <input
                                    id="reg-last"
                                    type="text"
                                    className="form-input"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Doe"
                                    required
                                    autoComplete="family-name"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-role">Account type</label>
                            <select
                                id="reg-role"
                                className="form-input"
                                value={role}
                                onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
                                required
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-email">Email address</label>
                            <div className="input-with-icon">
                                <input
                                    id="reg-email"
                                    type="email"
                                    className="form-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@school.edu"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-password">Password</label>
                            <div className="input-with-icon">
                                <input
                                    id="reg-password"
                                    type={showPass ? 'text' : 'password'}
                                    className="form-input"
                                    style={{ paddingRight: 40 }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Choose a password"
                                    required
                                    autoComplete="new-password"
                                    minLength={isDemoMode ? 4 : 6}
                                />
                                <button
                                    type="button"
                                    className="pass-toggle"
                                    onClick={() => setShowPass(!showPass)}
                                    tabIndex={-1}
                                >
                                    {showPass ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {error && <div className="signin-error">{error}</div>}

                        <button
                            type="submit"
                            className="btn btn-primary signin-btn"
                            disabled={isLoading}
                            id="register-btn"
                        >
                            {isLoading ? <span className="pulse">Creating account…</span> : 'Create account'}
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                            Teacher sign-up works only for emails configured by the admin.
                        </p>
                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Already have an account?{' '}
                            <Link to="/sign-in" style={{ color: 'var(--accent-purple-light)', fontWeight: 600 }}>
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
