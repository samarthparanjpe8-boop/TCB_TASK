// src/pages/AcademicRecordsPage.tsx
import React, { useState } from 'react';
import { mockStudents, mockGrades, mockCourses, getLetterGrade } from '../lib/mockData';

export function AcademicRecordsPage() {
    const [selectedStudent, setSelectedStudent] = useState<string>('all');

    const studentGrades = selectedStudent === 'all'
        ? mockStudents.map((s) => {
            const grades = mockGrades.filter((g) => g.studentId === s.id);
            const avg = grades.length
                ? Math.round(grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / grades.length)
                : null;
            return { student: s, grades, avg };
        })
        : mockStudents
            .filter((s) => s.id === selectedStudent)
            .map((s) => {
                const grades = mockGrades.filter((g) => g.studentId === s.id);
                const avg = grades.length
                    ? Math.round(grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / grades.length)
                    : null;
                return { student: s, grades, avg };
            });

    return (
        <div>
            <div className="page-header">
                <h1>Academic Records</h1>
                <p>Comprehensive view of student performance across all courses.</p>
            </div>

            <div style={{ marginBottom: 20 }}>
                <select
                    className="form-input"
                    style={{ maxWidth: 260 }}
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                >
                    <option value="all">All Students</option>
                    {mockStudents.map((s) => <option key={s.id} value={s.id}>{s.displayName}</option>)}
                </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                                            const courseName = mockCourses.find((c) => c.id === g.courseId)?.code || g.courseId;
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
