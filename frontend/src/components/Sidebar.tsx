// src/components/Sidebar.tsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import './Sidebar.css';

const teacherNavItems = [
    { to: '/app', label: 'Dashboard', icon: '⊞', end: true },
    { to: '/app/students', label: 'Students', icon: '👤', end: false },
    { to: '/app/courses', label: 'Courses', icon: '📖', end: false },
    { to: '/app/grades', label: 'Grades', icon: '🎓', end: false },
    { to: '/app/academic-records', label: 'Academic Records', icon: '📄', end: false },
];

const studentNavItems = [
    { to: '/app', label: 'Dashboard', icon: '⊞', end: true },
    { to: '/app/courses', label: 'My Courses', icon: '📖', end: false },
    { to: '/app/grades', label: 'My Grades', icon: '🎓', end: false },
    { to: '/app/academic-records', label: 'My Record', icon: '📄', end: false },
];

export function Sidebar() {
    const { user, logout } = useAuth();
    const navItems = user?.role === 'teacher' ? teacherNavItems : studentNavItems;

    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div>
                    <div className="brand-name">ClassroomIQ</div>
                    <div className="brand-sub">Management System</div>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-section-label">MAIN MENU</div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span>{item.label}</span>
                        {item.end && <span className="sidebar-arrow">›</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="theme-switcher">
                    {(['light', 'system', 'dark'] as const).map((t) => (
                        <button
                            key={t}
                            className={`theme-btn ${theme === t ? 'active' : ''}`}
                            onClick={() => setTheme(t)}
                        >
                            {t === 'light' ? '☀' : t === 'system' ? '💻' : '🌙'}
                            <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                        </button>
                    ))}
                </div>
                <button className="sidebar-logout" onClick={handleLogout}>
                    <span>⇥</span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>{user?.email}</span>
                </button>
            </div>
        </aside>
    );
}
