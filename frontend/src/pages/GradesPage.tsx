// src/pages/GradesPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal } from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { api, isDemoMode } from '../lib/api';
import { mockCourses, mockGrades, mockStudents, getLetterGrade } from '../lib/mockData';
import type { Grade, Course, Student } from '../types';

let localGrades = [...mockGrades];

function getApiErrorMessage(err: unknown, fallback: string): string {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as { error?: string; message?: string } | undefined;
        if (data?.error) return data.error;
        if (typeof data?.message === 'string') return data.message;
    }
    if (err instanceof Error) return err.message;
    return fallback;
}

export function GradesPage() {
    const { user } = useAuth();
    const isTeacher = user?.role === 'teacher';
    const [courses, setCourses] = useState<Course[]>(isDemoMode ? mockCourses : []);
    const [students, setStudents] = useState<Student[]>(isDemoMode ? mockStudents : []);
    const [selectedCourse, setSelectedCourse] = useState<string>('all');
    const [grades, setGrades] = useState<Grade[]>(isDemoMode ? [...localGrades] : []);
    const [addOpen, setAddOpen] = useState(false);
    const [editGrade, setEditGrade] = useState<Grade | null>(null);
    const [deleteGrade, setDeleteGrade] = useState<Grade | null>(null);
    const [form, setForm] = useState({ studentId: '', assignmentName: '', score: '', maxScore: '100' });
    const [loading, setLoading] = useState(!isDemoMode);
    const { showToast } = useToast();

    useEffect(() => {
        if (isDemoMode) return;
        const load = async () => {
            setLoading(true);
            try {
                const { data: courseData } = await api.get<Course[]>('/courses');
                setCourses(courseData);
                const gradeGroups = await Promise.all(
                    courseData.map(async (course) => {
                        const { data: gradeData } = await api.get<Grade[]>(`/courses/${course.id}/grades`);
                        return gradeData;
                    })
                );
                setGrades(gradeGroups.flat());

                if (isTeacher) {
                    const { data: studentData } = await api.get<Student[]>('/students');
                    setStudents(studentData);
                    return;
                }
            } catch {
                showToast('Failed to load grades', 'error');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [isTeacher, showToast]);

    const displayedGrades = selectedCourse === 'all'
        ? grades
        : grades.filter((g) => g.courseId === selectedCourse);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCourse === 'all') { showToast('Select a course first', 'error'); return; }
        const score = Number(form.score);
        const maxScore = Number(form.maxScore);
        try {
            if (isDemoMode) {
                const newG: Grade = {
                    id: `grd-${Date.now()}`, courseId: selectedCourse, studentId: form.studentId,
                    assignmentName: form.assignmentName, score, maxScore,
                };
                localGrades.push(newG);
                setGrades([...localGrades]);
            } else {
                // Backend requires active enrollment before allowing grade creation.
                await api.post(`/courses/${selectedCourse}/enrollments`, {
                    studentId: form.studentId,
                });
                const { data } = await api.post<Grade>(`/courses/${selectedCourse}/grades`, {
                    studentId: form.studentId, assignmentName: form.assignmentName, score, maxScore,
                });
                setGrades((prev) => [data, ...prev]);
            }
            showToast('Grade recorded');
            setAddOpen(false);
            setForm({ studentId: '', assignmentName: '', score: '', maxScore: '100' });
        } catch (err: unknown) {
            showToast(getApiErrorMessage(err, 'Failed to record grade'), 'error');
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editGrade) return;
        const score = Number(form.score);
        try {
            if (isDemoMode) {
                localGrades = localGrades.map((g) => g.id === editGrade.id ? { ...g, assignmentName: form.assignmentName, score, maxScore: Number(form.maxScore) } : g);
                setGrades([...localGrades]);
            } else {
                await api.patch(`/courses/${editGrade.courseId}/grades/${editGrade.id}`, {
                    assignmentName: form.assignmentName, score, maxScore: Number(form.maxScore),
                });
                setGrades((prev) => prev.map((g) => g.id === editGrade.id ? { ...g, ...form, score, maxScore: Number(form.maxScore) } : g));
            }
            showToast('Grade updated');
            setEditGrade(null);
        } catch { showToast('Failed to update grade', 'error'); }
    };

    const handleDelete = async () => {
        if (!deleteGrade) return;
        try {
            if (isDemoMode) {
                localGrades = localGrades.filter((g) => g.id !== deleteGrade.id);
                setGrades([...localGrades]);
            } else {
                await api.delete(`/courses/${deleteGrade.courseId}/grades/${deleteGrade.id}`);
                setGrades((prev) => prev.filter((g) => g.id !== deleteGrade.id));
            }
            showToast('Grade deleted', 'info');
            setDeleteGrade(null);
        } catch { showToast('Failed to delete grade', 'error'); }
    };

    const getStudentName = (id: string) => students.find((s) => s.id === id)?.displayName || id;
    const getCourseName = (id: string) => courses.find((c) => c.id === id)?.code || id;

    return (
        <div>
            <div className="page-header">
                <h1>Grades</h1>
                <p>Track and manage student grade records.</p>
            </div>

            <div className="card">
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                        className="form-input"
                        style={{ maxWidth: 240 }}
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                        <option value="all">All Courses</option>
                        {courses.map((c) => <option key={c.id} value={c.id}>{c.title} ({c.code})</option>)}
                    </select>
                    {isTeacher && (
                        <button
                            className="btn btn-primary btn-sm"
                            style={{ marginLeft: 'auto' }}
                            onClick={() => { setForm({ studentId: '', assignmentName: '', score: '', maxScore: '100' }); setAddOpen(true); }}
                        >
                            + Record Grade
                        </button>
                    )}
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
                ) : displayedGrades.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ opacity: 0.5 }}><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                        </div>
                        <h3>No grades recorded</h3>
                        <p>Select a course and record grades.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Course</th>
                                    <th>Assignment</th>
                                    <th>Score</th>
                                    <th>Grade</th>
                                    {isTeacher && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {displayedGrades.map((g) => {
                                    const letter = getLetterGrade(g.score, g.maxScore);
                                    return (
                                        <tr key={g.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div className="avatar" style={{ background: 'var(--accent-blue)', color: '#fff', width: 28, height: 28, fontSize: '0.75rem' }}>
                                                        {getStudentName(g.studentId)[0]}
                                                    </div>
                                                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{getStudentName(g.studentId)}</span>
                                                </div>
                                            </td>
                                            <td><span className="badge" style={{ background: 'rgba(124,58,237,0.12)', color: 'var(--accent-purple-light)' }}>{getCourseName(g.courseId)}</span></td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{g.assignmentName}</td>
                                            <td style={{ fontWeight: 600 }}>{g.score}/{g.maxScore}</td>
                                            <td><span className={`badge badge-${letter}`}>{letter}</span></td>
                                            {isTeacher && (
                                                <td>
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditGrade(g); setForm({ studentId: g.studentId, assignmentName: g.assignmentName, score: String(g.score), maxScore: String(g.maxScore) }); }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                                                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteGrade(g)}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Grade Modal */}
            <Modal isOpen={isTeacher && addOpen} onClose={() => setAddOpen(false)} title="Record Grade">
                <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {selectedCourse === 'all' && (
                        <div className="form-group">
                            <label className="form-label">Course *</label>
                            <select className="form-input" onChange={(e) => setSelectedCourse(e.target.value)} required>
                                <option value="">Select course</option>
                                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="form-group">
                        <label className="form-label">Student *</label>
                        <select className="form-input" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required>
                            <option value="">Select student</option>
                            {students.map((s) => <option key={s.id} value={s.id}>{s.displayName}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Assignment Name *</label>
                        <input className="form-input" value={form.assignmentName} onChange={(e) => setForm({ ...form, assignmentName: e.target.value })} required placeholder="e.g. Midterm Exam" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                            <label className="form-label">Score *</label>
                            <input className="form-input" type="number" min="0" max={form.maxScore} value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Max Score</label>
                            <input className="form-input" type="number" min="1" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setAddOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-sm">Record Grade</button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isTeacher && !!editGrade} onClose={() => setEditGrade(null)} title="Edit Grade">
                <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="form-group">
                        <label className="form-label">Assignment Name</label>
                        <input className="form-input" value={form.assignmentName} onChange={(e) => setForm({ ...form, assignmentName: e.target.value })} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                            <label className="form-label">Score</label>
                            <input className="form-input" type="number" min="0" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Max Score</label>
                            <input className="form-input" type="number" min="1" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditGrade(null)}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-sm">Save</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isTeacher && !!deleteGrade} onClose={() => setDeleteGrade(null)} title="Delete Grade" width={400}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Delete this grade entry? This cannot be undone.</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setDeleteGrade(null)}>Cancel</button>
                    <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
                </div>
            </Modal>
        </div>
    );
}
