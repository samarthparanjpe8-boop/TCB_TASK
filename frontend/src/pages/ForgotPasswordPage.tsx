import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, isDemoMode } from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';
import './SignInPage.css';

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { resolvedTheme, setTheme } = useTheme();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (isDemoMode) {
            setSuccess('Demo mode: reset email flow is disabled.');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/forgot-password', {
                email: email.trim(),
                redirectTo: `${window.location.origin}/reset-password`,
            });
            setSuccess('If your account exists, a password reset email has been sent.');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signin-page">
            <div className="signin-top-bar">
                <Link to="/sign-in" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>
                    ← Back to sign in
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
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h1 className="signin-title">Reset your password</h1>
                <p className="signin-sub">Enter your email and we will send a reset link.</p>

                <div className="signin-card card">
                    <form onSubmit={handleSubmit} className="signin-form">
                        <div className="form-group">
                            <label className="form-label">Email address</label>
                            <div className="input-with-icon">
                                <input
                                    type="email"
                                    className="form-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {error && <div className="signin-error">{error}</div>}
                        {success && <div className="demo-hint" style={{ marginBottom: 0 }}>{success}</div>}

                        <button type="submit" className="btn btn-primary signin-btn" disabled={isLoading}>
                            {isLoading ? <span className="pulse">Sending reset link…</span> : 'Send reset email'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
