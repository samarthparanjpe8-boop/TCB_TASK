// src/pages/CoursesPage.tsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { api, isDemoMode } from '../lib/api';
import { mockCourses, mockEnrollments, mockStudents } from '../lib/mockData';
import type { Course, Student } from '../types';

let localCourses = [...mockCourses];

export function CoursesPage() {
    const { user } = useAuth();
    const isTeacher = user?.role === 'teacher';
    const [courses, setCourses] = useState<Course[]>(isDemoMode ? [...localCourses] : []);
    const [students, setStudents] = useState<Student[]>(isDemoMode ? mockStudents : []);
    const [loading, setLoading] = useState(!isDemoMode);
    const [addOpen, setAddOpen] = useState(false);
    const [editCourse, setEditCourse] = useState<Course | null>(null);
    const [deleteCourse, setDeleteCourse] = useState<Course | null>(null);
    const [enrollCourse, setEnrollCourse] = useState<Course | null>(null);
    const [enrollStudentId, setEnrollStudentId] = useState('');
    const [form, setForm] = useState({ title: '', code: '', description: '' });
    const { showToast } = useToast();

    useEffect(() => {
        if (isDemoMode) return;
        setLoading(true);
        api.get<Course[]>('/courses')
            .then(({ data }) => {
                setCourses(data);
                if (isTeacher) {
                    api.get<Student[]>('/students').then((res) => setStudents(res.data)).catch(console.error);
                }
            })
            .catch(() => showToast('Failed to load courses', 'error'))
            .finally(() => setLoading(false));
    }, [isTeacher, showToast]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isDemoMode) {
                const newC: Course = { id: `crs-${Date.now()}`, ...form, teacherId: 'demo-user-001' };
                localCourses.push(newC);
                setCourses([...localCourses]);
            } else {
                const { data } = await api.post<Course>('/courses', form);
                setCourses((prev) => [...prev, data]);
            }
            showToast(`${form.title} added`);
            setAddOpen(false);
            setForm({ title: '', code: '', description: '' });
        } catch { showToast('Failed to add course', 'error'); }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editCourse) return;
        try {
            if (isDemoMode) {
                localCourses = localCourses.map((c) => c.id === editCourse.id ? { ...c, ...form } : c);
                setCourses([...localCourses]);
            } else {
                await api.patch(`/courses/${editCourse.id}`, form);
                setCourses((prev) => prev.map((c) => c.id === editCourse.id ? { ...c, ...form } : c));
            }
            showToast('Course updated');
            setEditCourse(null);
        } catch { showToast('Failed to update course', 'error'); }
    };

    const handleDelete = async () => {
        if (!deleteCourse) return;
        try {
            if (isDemoMode) {
                localCourses = localCourses.filter((c) => c.id !== deleteCourse.id);
                setCourses([...localCourses]);
            } else {
                await api.delete(`/courses/${deleteCourse.id}`);
                setCourses((prev) => prev.filter((c) => c.id !== deleteCourse.id));
            }
            showToast('Course deleted', 'info');
            setDeleteCourse(null);
        } catch { showToast('Failed to delete course', 'error'); }
    };

    const handleEnroll = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!enrollCourse || !enrollStudentId) return;
        try {
            if (!isDemoMode) {
                await api.post(`/courses/${enrollCourse.id}/enrollments`, { studentId: enrollStudentId });
            }
            showToast('Student enrolled successfully');
            setEnrollCourse(null);
            setEnrollStudentId('');
        } catch { showToast('Failed to enroll student', 'error'); }
    };

    return (
        <div>
            <div className="page-header">
                <h1>Courses</h1>
                <p>Manage courses and their enrollments.</p>
            </div>

            {isTeacher && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => { setForm({ title: '', code: '', description: '' }); setAddOpen(true); }}>
                        + New Course
                    </button>
                </div>
            )}

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
            ) : courses.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📖</div>
                    <h3>No courses yet</h3>
                    <p>Create your first course to get started.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {courses.map((c) => {
                        const enrollCount = isDemoMode
                            ? mockEnrollments.filter((e) => e.courseId === c.id).length
                            : 0;
                        return (
                            <div key={c.id} className="card" style={{ borderLeft: '3px solid var(--accent-purple)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span className="badge" style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--accent-purple-light)' }}>
                                        {c.code}
                                    </span>
                                    {isTeacher && (
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="btn btn-ghost btn-sm" onClick={() => setEnrollCourse(c)} title="Enroll Student">👥</button>
                                            <button className="btn btn-ghost btn-sm" onClick={() => { setEditCourse(c); setForm({ title: c.title, code: c.code, description: c.description }); }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                                            <button className="btn btn-danger btn-sm" onClick={() => setDeleteCourse(c)}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                                        </div>
                                    )}
                                </div>
                                <h3 style={{ fontWeight: 700, marginBottom: 6 }}>{c.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: 12 }}>{c.description || 'No description'}</p>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    👥 {enrollCount} student{enrollCount !== 1 ? 's' : ''} enrolled
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal isOpen={isTeacher && addOpen} onClose={() => setAddOpen(false)} title="New Course">
                <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="form-group">
                        <label className="form-label">Title *</label>
                        <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Mathematics 101" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Code *</label>
                        <input className="form-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required placeholder="e.g. MATH-101" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Course description…" />
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setAddOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-sm">Create Course</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isTeacher && !!editCourse} onClose={() => setEditCourse(null)} title="Edit Course">
                <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="form-group">
                        <label className="form-label">Title *</label>
                        <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditCourse(null)}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isTeacher && !!deleteCourse} onClose={() => setDeleteCourse(null)} title="Delete Course" width={400}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                    Delete <strong>{deleteCourse?.title}</strong>? All enrollments and grades will also be removed.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setDeleteCourse(null)}>Cancel</button>
                    <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete Course</button>
                </div>
            </Modal>

            <Modal isOpen={isTeacher && !!enrollCourse} onClose={() => setEnrollCourse(null)} title="Enroll Student">
                <form onSubmit={handleEnroll} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 10, fontSize: '0.9rem' }}>
                        Enroll a student into <strong>{enrollCourse?.title}</strong>.
                    </p>
                    <div className="form-group">
                        <label className="form-label">Student *</label>
                        <select className="form-input" value={enrollStudentId} onChange={(e) => setEnrollStudentId(e.target.value)} required>
                            <option value="">Select student</option>
                            {students.map((s) => <option key={s.id} value={s.id}>{s.displayName} ({s.email})</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setEnrollCourse(null)}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-sm">Enroll Student</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
