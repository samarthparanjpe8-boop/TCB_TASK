// src/pages/LandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './LandingPage.css';

const features = [
    'Manage student profiles with guardian details',
    'Record and update grades systematically',
    'Visual academic performance charts',
    'Track course enrollment & capacity',
    'Automatic letter grade calculation',
    'Edit or remove outdated entries instantly',
];

export function LandingPage() {
    const { theme, setTheme, resolvedTheme } = useTheme();

    return (
        <div className="landing">
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="landing-nav-brand">
                    <div className="brand-icon-sm" style={{ width: 32, height: 32, background: '#ffffff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="landing-brand-text" style={{ fontWeight: 700 }}>Udemy Inter. school</span>
                </div>
                <div className="landing-nav-actions">
                    <button
                        className="theme-toggle-btn"
                        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                        aria-label="Toggle theme"
                    >
                        {resolvedTheme === 'dark' ? (
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        ) : (
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        )}
                    </button>
                    <Link to="/sign-in" className="btn btn-ghost" style={{ padding: '8px 16px', fontWeight: 500 }}>Sign In</Link>
                    <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontWeight: 600 }}>Get Started</Link>
                </div>
            </nav>

            {/* Hero */}
            <div className="landing-hero">
                <div className="hero-text">
                    <h1 className="hero-title" style={{ marginTop: '0.2em' }}>
                        Manage Every<br />
                        Student, <span className="text-blue">Grade &</span><br />
                        <span className="text-blue">Course</span> in One Place
                    </h1>
                    <p className="hero-desc">
                        Udemy Inter. school replaces disconnected spreadsheets with a centralized system for organizing student profiles, tracking grades, managing courses, and maintaining structured academic records.
                    </p>
                    <div className="hero-actions">
                        <Link to="/register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '8px' }}>
                            Start Managing →
                        </Link>
                        <Link to="/sign-in" className="btn btn-outline" style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '8px' }}>
                            Explore Features
                        </Link>
                    </div>
                    <div className="features-grid">
                        {features.map((f, i) => (
                            <div key={i} className="feature-item">
                                <span className="feature-check" style={{ display: 'flex', alignItems: 'center' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                                </span>
                                <span>{f}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hero visual */}
                <div className="hero-visual">
                    <div className="hero-img-placeholder">
                        <div className="hero-img-inner">
                            <div className="vr-illustration">
                                <div className="vr-circle vr-c1" />
                                <div className="vr-circle vr-c2" />
                                <div className="vr-device">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2 13v-3a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v3" />
                                        <path d="M2 13s2-2 4-2c2 0 4 2 4 2s2-2 4-2c2 0 4 2 4 2" />
                                        <path d="M8 11v8M16 11v8M12 11v6" />
                                        <circle cx="12" cy="19" r="2" />
                                    </svg>
                                </div>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginTop: 16 }}>Future of Learning</p>
                            </div>
                        </div>
                    </div>
                    <div className="quick-overview card">
                        <div className="qo-header">
                            <span className="qo-title" style={{ fontWeight: 600 }}>Built for focused classroom operations</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginTop: '8px' }}>
                            Keep student records, attendance, grades, and course data in one secure place with role-based access for teachers and students.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
