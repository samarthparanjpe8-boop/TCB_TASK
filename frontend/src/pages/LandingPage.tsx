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
                    <div className="brand-icon-sm">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="landing-brand-text">ClassroomIQ</span>
                </div>
                <div className="landing-nav-actions">
                    <button
                        className="theme-toggle-btn"
                        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                        aria-label="Toggle theme"
                    >
                        {resolvedTheme === 'dark' ? '☀' : '🌙'}
                    </button>
                    <Link to="/sign-in" className="btn btn-ghost">Sign In</Link>
                    <Link to="/register" className="btn btn-primary">Get Started</Link>
                </div>
            </nav>

            {/* Hero */}
            <div className="landing-hero">
                <div className="hero-text">
                    <h1 className="hero-title">
                        Manage Every<br />
                        Student, <span className="text-purple">Grade &</span><br />
                        <span className="text-purple">Course</span> in One Place
                    </h1>
                    <p className="hero-desc">
                        ClassroomIQ replaces disconnected spreadsheets with a centralized system for organizing student profiles, tracking grades, managing courses, and maintaining structured academic records.
                    </p>
                    <div className="hero-actions">
                        <Link to="/register" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
                            Start Managing →
                        </Link>
                        <Link to="/sign-in" className="btn btn-outline" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
                            Explore Features
                        </Link>
                    </div>
                    <div className="features-grid">
                        {features.map((f, i) => (
                            <div key={i} className="feature-item">
                                <span className="feature-check">✓</span>
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
                                <div className="vr-device">🥽</div>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 12 }}>Future of Learning</p>
                            </div>
                        </div>
                    </div>
                    <div className="quick-overview card">
                        <div className="qo-header">
                            <span className="qo-title">Built for focused classroom operations</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                            Keep student records, attendance, grades, and course data in one secure place with role-based access for teachers and students.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
