import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, isDemoMode } from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';
import './SignInPage.css';

function readAccessTokenFromUrl(): string {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
    const hashParams = new URLSearchParams(hash);
    const queryParams = new URLSearchParams(window.location.search);
    return hashParams.get('access_token') ?? queryParams.get('access_token') ?? '';
}

export function ResetPasswordPage() {
    const navigate = useNavigate();
    const token = useMemo(() => readAccessTokenFromUrl(), []);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { resolvedTheme, setTheme } = useTheme();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!token) {
            setError('Reset token is missing. Please open the reset link from your email again.');
            return;
        }
        if (isDemoMode) {
            setError('Demo mode does not support password reset.');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/reset-password', { accessToken: token, password });
            navigate('/sign-in');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to reset password');
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
                <h1 className="signin-title">Set a new password</h1>
                <p className="signin-sub">Use a strong password you have not used before.</p>

                <div className="signin-card card">
                    <form onSubmit={handleSubmit} className="signin-form">
                        <div className="form-group">
                            <label className="form-label">New password</label>
                            <div className="input-with-icon">
                                <span className="input-icon">🔒</span>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    className="form-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm password</label>
                            <div className="input-with-icon">
                                <span className="input-icon">🔒</span>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    className="form-input"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="pass-toggle"
                                    onClick={() => setShowPass((p) => !p)}
                                    tabIndex={-1}
                                >
                                    {showPass ? '🙈' : '👁'}
                                </button>
                            </div>
                        </div>

                        {error && <div className="signin-error">{error}</div>}
                        <button type="submit" className="btn btn-primary signin-btn" disabled={isLoading}>
                            {isLoading ? <span className="pulse">Updating password…</span> : 'Update password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
