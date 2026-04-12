// src/pages/CoursesPage.tsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import { api, isDemoMode } from '../lib/api';
import { mockCourses, mockEnrollments } from '../lib/mockData';
import type { Course } from '../types';

let localCourses = [...mockCourses];

export function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>(isDemoMode ? [...localCourses] : []);
    const [loading, setLoading] = useState(!isDemoMode);
    const [addOpen, setAddOpen] = useState(false);
    const [editCourse, setEditCourse] = useState<Course | null>(null);
    const [deleteCourse, setDeleteCourse] = useState<Course | null>(null);
    const [form, setForm] = useState({ title: '', code: '', description: '' });
    const { showToast } = useToast();

    useEffect(() => {
        if (isDemoMode) return;
        setLoading(true);
        api.get<Course[]>('/courses')
            .then(({ data }) => setCourses(data))
            .catch(() => showToast('Failed to load courses', 'error'))
            .finally(() => setLoading(false));
    }, []);

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

    return (
        <div>
            <div className="page-header">
                <h1>Courses</h1>
                <p>Manage courses and their enrollments.</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button className="btn btn-primary btn-sm" onClick={() => { setForm({ title: '', code: '', description: '' }); setAddOpen(true); }}>
                    + New Course
                </button>
            </div>

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
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditCourse(c); setForm({ title: c.title, code: c.code, description: c.description }); }}>✏</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteCourse(c)}>🗑</button>
                                    </div>
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

            <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="New Course">
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

            <Modal isOpen={!!editCourse} onClose={() => setEditCourse(null)} title="Edit Course">
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

            <Modal isOpen={!!deleteCourse} onClose={() => setDeleteCourse(null)} title="Delete Course" width={400}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                    Delete <strong>{deleteCourse?.title}</strong>? All enrollments and grades will also be removed.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setDeleteCourse(null)}>Cancel</button>
                    <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete Course</button>
                </div>
            </Modal>
        </div>
    );
}
