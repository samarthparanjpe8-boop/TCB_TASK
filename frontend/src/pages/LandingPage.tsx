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

const previewStudents = [
    { name: 'Alice Johnson', grade: 'A', score: 91 },
    { name: 'Clara Thompson', grade: 'A', score: 92 },
    { name: 'Emily Nguyen', grade: 'A', score: 92 },
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
                    <Link to="/sign-in" className="btn btn-primary">Get Started</Link>
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
                        <Link to="/sign-in" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
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
                            <span className="qo-title">Quick Overview</span>
                            <span className="qo-season text-purple">Fall 2025</span>
                        </div>
                        <div className="qo-stats">
                            <div className="qo-stat">
                                <div className="qo-stat-val text-purple">6</div>
                                <div className="qo-stat-label">Students</div>
                            </div>
                            <div className="qo-stat">
                                <div className="qo-stat-val text-blue">5</div>
                                <div className="qo-stat-label">Courses</div>
                            </div>
                            <div className="qo-stat">
                                <div className="qo-stat-val text-green">86%</div>
                                <div className="qo-stat-label">Avg Grade</div>
                            </div>
                        </div>
                        <div className="qo-students">
                            {previewStudents.map((s) => (
                                <div key={s.name} className="qo-student-row">
                                    <div className="avatar" style={{ background: 'var(--accent-purple)', color: '#fff', width: 28, height: 28, fontSize: '0.75rem' }}>
                                        {s.name[0]}
                                    </div>
                                    <span className="qo-student-name">{s.name}</span>
                                    <div className="qo-student-bar">
                                        <div className="progress-bar" style={{ width: 80 }}>
                                            <div className="progress-bar-fill" style={{ width: `${s.score}%` }} />
                                        </div>
                                    </div>
                                    <span className="badge badge-A">{s.grade}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
