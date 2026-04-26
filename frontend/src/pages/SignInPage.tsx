// src/pages/SignInPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { isDemoMode } from '../lib/api';
import './SignInPage.css';

export function SignInPage() {
    const [email, setEmail] = useState(isDemoMode ? 'admin@school.edu' : '');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { resolvedTheme, setTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const approved = query.get('approved') === 'true';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/app');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed. Try again.');
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
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h1 className="signin-title">Welcome back</h1>
                <p className="signin-sub">Sign in to StudentIQ</p>

                <div className="signin-card card">
                    {approved && (
                        <div className="demo-hint" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                            <span className="demo-hint-icon" style={{ color: '#10b981' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></span>
                            <div>
                                <div className="demo-hint-title" style={{ color: '#10b981' }}>Account Approved</div>
                                <div className="demo-hint-text" style={{ color: '#059669' }}>Your teacher account has been verified. You can now sign in.</div>
                            </div>
                        </div>
                    )}
                    {isDemoMode && (
                        <div className="demo-hint">
                            <span className="demo-hint-icon"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span>
                            <div>
                                <div className="demo-hint-title">Demo Mode</div>
                                <div className="demo-hint-text">
                                    Use any email and a password of 4+ characters to sign in.<br />
                                    Suggested: <strong>admin@school.edu / admin123</strong>
                                </div>
                            </div>
                        </div>
                    )}
                    {isDemoMode ? (
                        <div className="demo-hint">
                            <span className="demo-hint-icon"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10 2v7.31"></path><path d="M14 9.3V1.99"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><path d="M5.52 16h12.96"></path></svg></span>
                            <div>
                                <div className="demo-hint-title">Suggested Demo IDs</div>
                                <div className="demo-hint-text">
                                    Student: <strong>student.test@school.com / Test@12345</strong><br />
                                    Teacher: <strong>teacher.test@school.com / Test@12345</strong>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="demo-hint">
                            <span className="demo-hint-icon"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></span>
                            <div>
                                <div className="demo-hint-title">Live Mode</div>
                                <div className="demo-hint-text">
                                    Use a registered Supabase account, or create one from the
                                    {' '}
                                    <Link to="/register" style={{ color: 'var(--accent-purple-light)', fontWeight: 600 }}>
                                        registration page
                                    </Link>
                                    .
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="signin-form">
                        <div className="form-group">
                            <label className="form-label">Email address</label>
                            <div className="input-with-icon">
                                <input
                                    id="email"
                                    type="email"
                                    className="form-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@school.edu"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-with-icon">
                                <input
                                    id="password"
                                    type={showPass ? 'text' : 'password'}
                                    className="form-input"
                                    style={{ paddingRight: 40 }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
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
                            <div style={{ marginTop: 8, textAlign: 'right' }}>
                                <Link to="/forgot-password" style={{ color: 'var(--accent-purple-light)', fontSize: '0.82rem', fontWeight: 600 }}>
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        {error && <div className="signin-error">{error}</div>}

                        <button
                            type="submit"
                            className="btn btn-primary signin-btn"
                            disabled={isLoading}
                            id="sign-in-btn"
                        >
                            {isLoading ? <span className="pulse">Signing in…</span> : 'Sign In'}
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                            New here?{' '}
                            <Link to="/register" style={{ color: 'var(--accent-purple-light)', fontWeight: 600 }}>
                                Create an account
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
