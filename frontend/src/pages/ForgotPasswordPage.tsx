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
                    {resolvedTheme === 'dark' ? '☀' : '🌙'}
                </button>
            </div>

            <div className="signin-center">
                <div className="signin-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h1 className="signin-title">Reset your password</h1>
                <p className="signin-sub">Enter your email and we will send a reset link.</p>

                <div className="signin-card card">
                    <form onSubmit={handleSubmit} className="signin-form">
                        <div className="form-group">
                            <label className="form-label">Email address</label>
                            <div className="input-with-icon">
                                <span className="input-icon">✉</span>
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
