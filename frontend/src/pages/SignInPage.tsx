// src/pages/SignInPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { isDemoMode } from '../lib/api';
import './SignInPage.css';

export function SignInPage() {
    const [email, setEmail] = useState('admin@school.edu');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { resolvedTheme, setTheme } = useTheme();
    const navigate = useNavigate();

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
                    {resolvedTheme === 'dark' ? '☀' : '🌙'}
                </button>
            </div>

            <div className="signin-center">
                <div className="signin-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h1 className="signin-title">Welcome back</h1>
                <p className="signin-sub">Sign in to ClassroomIQ</p>

                <div className="signin-card card">
                    {isDemoMode && (
                        <div className="demo-hint">
                            <span className="demo-hint-icon">ℹ</span>
                            <div>
                                <div className="demo-hint-title">Demo Mode</div>
                                <div className="demo-hint-text">
                                    Use any email and a password of 4+ characters to sign in.<br />
                                    Suggested: <strong>admin@school.edu / admin123</strong>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="signin-form">
                        <div className="form-group">
                            <label className="form-label">Email address</label>
                            <div className="input-with-icon">
                                <span className="input-icon">✉</span>
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
                                <span className="input-icon">🔒</span>
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
                                    {showPass ? '🙈' : '👁'}
                                </button>
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
                    </form>
                </div>
            </div>
        </div>
    );
}
