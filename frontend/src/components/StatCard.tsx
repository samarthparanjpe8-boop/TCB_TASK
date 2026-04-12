// src/components/StatCard.tsx
import React from 'react';
import './StatCard.css';

interface StatCardProps {
    icon: React.ReactNode;
    value: string | number;
    label: string;
    sub?: string;
    color?: string;
}

export function StatCard({ icon, value, label, sub, color = 'var(--accent-purple)' }: StatCardProps) {
    return (
        <div className="stat-card card fade-in">
            <div className="stat-card-icon-wrap" style={{ background: `${color}22` }}>
                <span style={{ color }}>{icon}</span>
            </div>
            <div>
                <div className="stat-card-value" style={{ color }}>{value}</div>
                <div className="stat-card-label">{label}</div>
                {sub && <div className="stat-card-sub">{sub}</div>}
            </div>
        </div>
    );
}
