// src/pages/DashboardPage.tsx
import React, { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { StatCard } from '../components/StatCard';
import { mockStudents, mockCourses, mockGrades, mockEnrollments, getLetterGrade } from '../lib/mockData';
import { isDemoMode, api } from '../lib/api';
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
        if (isDemoMode) {
            if (!isTeacher && user) {
                // If demo mode student, just mock a student view by filtering
                setStudents([mockStudents[0]]);
                setGrades(mockGrades.filter(g => g.studentId === mockStudents[0].id));
            }
            return;
        }

        const load = async () => {
            try {
                const { data: coursesData } = await api.get<Course[]>('/courses');
                setCourses(coursesData);
                
                if (isTeacher) {
                    const { data: studentsData } = await api.get<Student[]>('/students');
                    setStudents(studentsData);
                    // Assume teacher gets all grades via some route or just ignores grades on dashboard in real app
                    // (The original code didn't fetch all grades dynamically for teacher on dashboard, just used mock fallback or crashed silently)
                    // In a real app we'd fetch dashboard stats. For now we use the existing logic.
                } else {
                    const { data: me } = await api.get('/me');
                    setStudents([{
                        id: me.id,
                        authId: me.authId ?? null,
                        email: me.email,
                        displayName: me.displayName,
                    }]);
                    
                    const gradeGroups = await Promise.all(
                        (coursesData || []).map(async (course) => {
                            try {
                                const { data: gradeData } = await api.get<Grade[]>(`/courses/${course.id}/grades`);
                                return Array.isArray(gradeData) ? gradeData.filter(g => g.studentId === me.id) : [];
                            } catch { 
                                return []; 
                            }
                        })
                    );
                    setGrades(gradeGroups.flat());
                }
            } catch {
                // ignore dashboard fetch errors
            }
        };
        load();
    }, [isTeacher, user]);

    // Recent grades for teacher dashboard flat list
    const recentGrades = useMemo(() => {
        return [...grades]
            .sort((a, b) => new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime())
            .slice(0, 5);
    }, [grades]);

    // ==== STUDENT RENDER ====
    if (!isTeacher) {
        const studentDetails = students[0] || user;
        const studentGrades = grades; // In real app, only fetched their grades

        return (
            <div className="dashboard">
                <div className="page-header" style={{ alignItems: 'flex-start' }}>
                    <div>
                        <h1>My Record</h1>
                        <p>Welcome back, {studentDetails?.displayName || studentDetails?.email || 'Student'}. Here are your academic records.</p>
                    </div>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-wrapper" style={{ boxShadow: 'none', border: 'none', borderRadius: 0 }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Course Code</th>
                                    <th>Course Name</th>
                                    <th>Score</th>
                                    <th>Max Score</th>
                                    <th>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentGrades.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                                            <div style={{ color: 'var(--text-muted)' }}>No grades available yet.</div>
                                        </td>
                                    </tr>
                                ) : (
                                    studentGrades.map(g => {
                                        const c = courses.find(co => co.id === g.courseId);
                                        const letter = getLetterGrade(g.score, g.maxScore);
                                        return (
                                            <tr key={g.id}>
                                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c?.code || '—'}</td>
                                                <td>{c?.title || 'Unknown Course'}</td>
                                                <td>{g.score}</td>
                                                <td>{g.maxScore}</td>
                                                <td><span className={`badge badge-${letter}`}>{letter}</span></td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // ==== TEACHER RENDER ====
    return (
        <div className="dashboard">
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back! Here's an overview of your classroom.</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="dashboard-stats">
                <StatCard
                    icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
                    value={students.length}
                    label="Total Students"
                    sub={`${students.length} active`}
                    color="var(--accent-blue)"
                />
                <StatCard
                    icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>}
                    value={courses.length}
                    label="Total Courses"
                    sub={`${mockEnrollments.length} enrollments`}
                    color="var(--accent-purple-light)"
                />
                <StatCard
                    icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>}
                    value={grades.length}
                    label="Grades Recorded"
                    sub="across all courses"
                    color="var(--accent-purple-light)"
                />
                <StatCard
                    icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>}
                    value={recentGrades.length ? getLetterGrade(recentGrades[0].score, recentGrades[0].maxScore) : '—'}
                    label="Latest Grade"
                    sub="from recent activity"
                    color="var(--accent-green)"
                />
            </div>

            <div className="dashboard-bottom">
                <div className="card" style={{ border: '1px solid var(--border)', boxShadow: 'none' }}>
                    <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div className="panel-title" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <svg width="20" height="20" fill="none" stroke="var(--accent-blue)" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Recent Grades</h3>
                        </div>
                        <Link to="/app/grades" className="btn btn-ghost btn-sm">View all →</Link>
                    </div>
                    
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-secondary)', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '12px' }}>Student</th>
                                <th style={{ padding: '12px' }}>Course</th>
                                <th style={{ padding: '12px' }}>Score</th>
                                <th style={{ padding: '12px' }}>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentGrades.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No recent grades available.</td>
                                </tr>
                            ) : (
                                recentGrades.map(g => {
                                    const s = students.find(st => st.id === g.studentId);
                                    const c = courses.find(co => co.id === g.courseId);
                                    return (
                                        <tr key={g.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '12px', fontWeight: 500 }}>{s?.displayName || 'Unknown'}</td>
                                            <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{c?.code || '—'}</td>
                                            <td style={{ padding: '12px' }}>{g.score}/{g.maxScore}</td>
                                            <td style={{ padding: '12px' }}><span className={`badge badge-${getLetterGrade(g.score, g.maxScore)}`}>{getLetterGrade(g.score, g.maxScore)}</span></td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="card" style={{ border: '1px solid var(--border)', boxShadow: 'none' }}>
                    <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div className="panel-title" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Active Courses Summary</h3>
                        </div>
                        <Link to="/app/courses" className="btn btn-ghost btn-sm">Manage courses →</Link>
                    </div>
                    <div className="courses-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {courses.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No active courses found.</div>
                        ) : (
                            courses.map(c => (
                                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                                    <div style={{ fontWeight: 600 }}>{c.code}</div>
                                    <div style={{ color: 'var(--text-secondary)' }}>{c.title}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
