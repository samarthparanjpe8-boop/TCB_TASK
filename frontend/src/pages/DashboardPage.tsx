// src/pages/DashboardPage.tsx
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { StatCard } from '../components/StatCard';
import {
    mockStudents, mockCourses, mockGrades, mockEnrollments, getLetterGrade
} from '../lib/mockData';
import { isDemoMode } from '../lib/api';
import { api } from '../lib/api';
import { useEffect, useState } from 'react';
import type { Student, Course, Grade } from '../types';
import { useAuth } from '../contexts/AuthContext';
import './DashboardPage.css';

const GRADE_COLORS: Record<string, string> = {
    A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#f97316', F: '#ef4444',
};

export function DashboardPage() {
    const { user } = useAuth();
    const isTeacher = user?.role === 'teacher';
    const [students, setStudents] = useState<Student[]>(isDemoMode ? mockStudents : []);
    const [courses, setCourses] = useState<Course[]>(isDemoMode ? mockCourses : []);
    const [grades, setGrades] = useState<Grade[]>(isDemoMode ? mockGrades : []);

    useEffect(() => {
        if (isDemoMode) return;
        const load = async () => {
            try {
                const { data: coursesData } = await api.get<Course[]>('/courses');
                setCourses(coursesData);
                if (isTeacher) {
                    const { data: studentsData } = await api.get<Student[]>('/students');
                    setStudents(studentsData);
                } else {
                    const { data: me } = await api.get('/me');
                    setStudents([{
                        id: me.id,
                        authId: me.authId ?? null,
                        email: me.email,
                        displayName: me.displayName,
                    }]);
                }
            } catch {
                // ignore dashboard fetch errors to keep app usable
            }
        };
        load();
    }, [isTeacher]);

    const gradeDistribution = useMemo(() => {
        const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
        grades.forEach((g) => { counts[getLetterGrade(g.score, g.maxScore)]++; });
        return Object.entries(counts)
            .filter(([, v]) => v > 0)
            .map(([name, value]) => ({ name, value }));
    }, [grades]);

    const courseEnrollment = useMemo(() => {
        return courses.map((c) => ({
            name: c.code,
            count: mockEnrollments.filter((e) => e.courseId === c.id).length,
        }));
    }, [courses]);

    const avgGrade = useMemo(() => {
        if (!grades.length) return 0;
        const avg = grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / grades.length;
        return Math.round(avg);
    }, [grades]);

    const topPerformers = useMemo(() => {
        const studentScores: Record<string, { name: string; scores: number[]; id: string }> = {};
        for (const g of grades) {
            if (!studentScores[g.studentId]) {
                const s = students.find((st) => st.id === g.studentId);
                studentScores[g.studentId] = { name: s?.displayName || 'Unknown', scores: [], id: g.studentId };
            }
            studentScores[g.studentId].scores.push((g.score / g.maxScore) * 100);
        }
        return Object.values(studentScores)
            .map((s) => ({ ...s, avg: Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length) }))
            .sort((a, b) => b.avg - a.avg)
            .slice(0, 3);
    }, [grades, students]);

    const needsAttention = useMemo(() => {
        const studentScores: Record<string, { name: string; scores: { score: number; maxScore: number; course: string }[] }> = {};
        for (const g of grades) {
            if (!studentScores[g.studentId]) {
                const s = students.find((st) => st.id === g.studentId);
                studentScores[g.studentId] = { name: s?.displayName || 'Unknown', scores: [] };
            }
            const c = courses.find((co) => co.id === g.courseId);
            studentScores[g.studentId].scores.push({ score: g.score, maxScore: g.maxScore, course: c?.code || '' });
        }
        return Object.values(studentScores)
            .map((s) => {
                const avg = Math.round(s.scores.reduce((a, b) => a + (b.score / b.maxScore) * 100, 0) / s.scores.length);
                const worst = s.scores.reduce((a, b) => (b.score / b.maxScore) < (a.score / a.maxScore) ? b : a);
                return { ...s, avg, worstCourse: worst.course };
            })
            .filter((s) => s.avg < 80)
            .sort((a, b) => a.avg - b.avg)
            .slice(0, 3);
    }, [grades, students, courses]);

    return (
        <div className="dashboard">
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Welcome back! Here's an overview of your classroom.</p>
            </div>

            {/* Stat Cards */}
            <div className="dashboard-stats">
                <StatCard
                    icon="👥"
                    value={students.length}
                    label="Total Students"
                    sub={`${students.length} active`}
                    color="var(--accent-purple)"
                />
                <StatCard
                    icon="📖"
                    value={courses.length}
                    label="Total Courses"
                    sub={`${mockEnrollments.length} enrollments`}
                    color="var(--accent-blue)"
                />
                <StatCard
                    icon="🎓"
                    value={grades.length}
                    label="Grades Recorded"
                    sub="across all courses"
                    color="var(--accent-purple-light)"
                />
                <StatCard
                    icon="📈"
                    value={`${avgGrade}%`}
                    label="Class Average"
                    sub={getLetterGrade(avgGrade, 100)}
                    color="var(--accent-green)"
                />
            </div>

            {/* Charts */}
            <div className="dashboard-charts">
                <div className="card chart-card">
                    <div className="chart-header">
                        <span className="chart-icon">📊</span>
                        <h2 className="chart-title">Grade Distribution</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={gradeDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {gradeDistribution.map((entry) => (
                                    <Cell key={entry.name} fill={GRADE_COLORS[entry.name] || '#8b5cf6'} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="chart-legend">
                        {gradeDistribution.map((d) => (
                            <span key={d.name} className="legend-item">
                                <span className="legend-dot" style={{ background: GRADE_COLORS[d.name] }} />
                                {d.name} · {d.value}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="card chart-card">
                    <div className="chart-header">
                        <span className="chart-icon">📋</span>
                        <h2 className="chart-title">Course Enrollment</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={courseEnrollment} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                            />
                            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom panels */}
            <div className="dashboard-bottom">
                <div className="card">
                    <div className="panel-header">
                        <div className="panel-title">
                            <span>🏆</span>
                            <h3>Top Performers</h3>
                        </div>
                        <Link to="/app/students" className="panel-link">View all →</Link>
                    </div>
                    <div className="performers-list">
                        {topPerformers.map((s, i) => (
                            <div key={s.id} className="performer-row">
                                <div className="performer-rank">{i + 1}</div>
                                <div className="performer-info">
                                    <div className="performer-name">{s.name}</div>
                                    <div className="performer-meta" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {students.find((st) => st.id === s.id) ? `STU-00${i + 1}` : '—'}
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="progress-bar">
                                        <div className="progress-bar-fill" style={{ width: `${s.avg}%` }} />
                                    </div>
                                </div>
                                <span className="badge badge-A">{s.avg}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="panel-header">
                        <div className="panel-title">
                            <span style={{ color: 'var(--accent-red)' }}>⚠</span>
                            <h3>Needs Attention</h3>
                        </div>
                        <Link to="/app/grades" className="panel-link">Manage grades →</Link>
                    </div>
                    <div className="attention-list">
                        {needsAttention.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                🎉 All students performing well!
                            </div>
                        ) : (
                            needsAttention.map((s) => (
                                <div key={s.name} className="attention-row">
                                    <div className="avatar" style={{ background: 'rgba(239,68,68,0.2)', color: 'var(--accent-red)' }}>
                                        {s.name[0]}
                                    </div>
                                    <div className="attention-info">
                                        <div className="attention-name">{s.name}</div>
                                        <div className="attention-meta">
                                            Avg: {s.avg}% · Struggling in: {s.worstCourse}
                                        </div>
                                    </div>
                                    <span className="badge badge-C">{getLetterGrade(s.avg, 100)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
