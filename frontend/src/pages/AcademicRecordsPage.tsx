// src/pages/AcademicRecordsPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api, isDemoMode } from '../lib/api';
import { getLetterGrade, mockCourses, mockGrades, mockStudents } from '../lib/mockData';
import type { Course, Grade, Student } from '../types';

export function AcademicRecordsPage() {
    const { user } = useAuth();
    const isTeacher = user?.role === 'teacher';
    const [selectedStudent, setSelectedStudent] = useState<string>('all');
    const [students, setStudents] = useState<Student[]>(isDemoMode ? mockStudents : []);
    const [courses, setCourses] = useState<Course[]>(isDemoMode ? mockCourses : []);
    const [grades, setGrades] = useState<Grade[]>(isDemoMode ? mockGrades : []);
    const [loading, setLoading] = useState(!isDemoMode);

    useEffect(() => {
        if (isDemoMode) return;
        const load = async () => {
            setLoading(true);
            try {
                const { data: me } = await api.get('/me');
                const { data: coursesData } = await api.get<Course[]>('/courses');
                setCourses(coursesData);

                if (isTeacher) {
                    const { data: studentsData } = await api.get<Student[]>('/students');
                    setStudents(studentsData);
                } else {
                    setStudents([
                        {
                            id: me.id,
                            authId: me.authId ?? null,
                            email: me.email,
                            displayName: me.displayName,
                        },
                    ]);
                    setSelectedStudent(me.id);
                }

                const gradeGroups = await Promise.all(
                    coursesData.map(async (course) => {
                        const { data } = await api.get<Grade[]>(`/courses/${course.id}/grades`);
                        return data;
                    })
                );
                setGrades(gradeGroups.flat());
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [isTeacher]);

    const studentGrades = useMemo(() => {
        const visibleStudents = selectedStudent === 'all'
            ? students
            : students.filter((s) => s.id === selectedStudent);

        return visibleStudents.map((student) => {
            const perStudentGrades = grades.filter((g) => g.studentId === student.id);
            const avg = perStudentGrades.length
                ? Math.round(perStudentGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / perStudentGrades.length)
                : null;
            return { student, grades: perStudentGrades, avg };
        });
    }, [grades, selectedStudent, students]);

    return (
        <div>
            <div className="page-header">
                <h1>Academic Records</h1>
                <p>Comprehensive view of student performance across all courses.</p>
            </div>

            <div style={{ marginBottom: 20 }}>
                {isTeacher && (
                    <select
                        className="form-input"
                        style={{ maxWidth: 260 }}
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                    >
                        <option value="all">All Students</option>
                        {students.map((s) => <option key={s.id} value={s.id}>{s.displayName}</option>)}
                    </select>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {loading && <div className="card"><div style={{ display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div></div>}
                {studentGrades.map(({ student, grades, avg }) => (
                    <div key={student.id} className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                            <div className="avatar" style={{ width: 44, height: 44, fontSize: '1rem', background: 'var(--accent-grad)', color: '#fff' }}>
                                {student.displayName[0]}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{student.displayName}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{student.email}</div>
                            </div>
                            {avg !== null && (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: avg >= 90 ? 'var(--accent-green)' : avg >= 80 ? 'var(--accent-blue)' : 'var(--accent-orange)' }}>
                                        {avg}%
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Overall Avg</div>
                                </div>
                            )}
                        </div>

                        {grades.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No grades recorded yet.</p>
                        ) : (
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Course</th>
                                            <th>Assignment</th>
                                            <th>Score</th>
                                            <th>Grade</th>
                                            <th>Performance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {grades.map((g) => {
                                            const courseName = courses.find((c) => c.id === g.courseId)?.code || g.courseId;
                                            const letter = getLetterGrade(g.score, g.maxScore);
                                            const pct = Math.round((g.score / g.maxScore) * 100);
                                            return (
                                                <tr key={g.id}>
                                                    <td>
                                                        <span className="badge" style={{ background: 'rgba(124,58,237,0.12)', color: 'var(--accent-purple-light)' }}>
                                                            {courseName}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{g.assignmentName}</td>
                                                    <td style={{ fontWeight: 600 }}>{g.score}/{g.maxScore}</td>
                                                    <td><span className={`badge badge-${letter}`}>{letter}</span></td>
                                                    <td style={{ minWidth: 120 }}>
                                                        <div className="progress-bar">
                                                            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
