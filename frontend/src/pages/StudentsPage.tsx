// src/pages/StudentsPage.tsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import { api, isDemoMode } from '../lib/api';
import { mockStudents } from '../lib/mockData';
import type { Student } from '../types';

let localStudents = [...mockStudents];

export function StudentsPage() {
    const [students, setStudents] = useState<Student[]>(isDemoMode ? [...localStudents] : []);
    const [loading, setLoading] = useState(!isDemoMode);
    const [search, setSearch] = useState('');
    const [addOpen, setAddOpen] = useState(false);
    const [editStudent, setEditStudent] = useState<Student | null>(null);
    const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
    const [form, setForm] = useState({ email: '', displayName: '' });
    const { showToast } = useToast();

    const load = async () => {
        if (isDemoMode) { setStudents([...localStudents]); return; }
        setLoading(true);
        try {
            const { data } = await api.get<Student[]>('/students');
            setStudents(data);
        } catch { showToast('Failed to load students', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const filtered = students.filter((s) =>
        s.displayName.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isDemoMode) {
                const newS: Student = { id: `stu-${Date.now()}`, authId: null, email: form.email, displayName: form.displayName };
                localStudents.push(newS);
                setStudents([...localStudents]);
            } else {
                const { data } = await api.post<Student>('/students', form);
                setStudents((prev) => [...prev, data]);
            }
            showToast(`${form.displayName} added successfully`);
            setAddOpen(false);
            setForm({ email: '', displayName: '' });
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : 'Failed to add student', 'error');
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editStudent) return;
        try {
            if (isDemoMode) {
                localStudents = localStudents.map((s) => s.id === editStudent.id ? { ...s, displayName: form.displayName } : s);
                setStudents([...localStudents]);
            } else {
                await api.patch(`/students/${editStudent.id}`, { displayName: form.displayName });
                setStudents((prev) => prev.map((s) => s.id === editStudent.id ? { ...s, displayName: form.displayName } : s));
            }
            showToast('Student updated');
            setEditStudent(null);
        } catch { showToast('Failed to update student', 'error'); }
    };

    const handleDelete = async () => {
        if (!deleteStudent) return;
        try {
            if (isDemoMode) {
                localStudents = localStudents.filter((s) => s.id !== deleteStudent.id);
                setStudents([...localStudents]);
            } else {
                await api.delete(`/students/${deleteStudent.id}`);
                setStudents((prev) => prev.filter((s) => s.id !== deleteStudent.id));
            }
            showToast('Student removed', 'info');
            setDeleteStudent(null);
        } catch { showToast('Failed to delete student', 'error'); }
    };

    return (
        <div>
            <div className="page-header">
                <h1>Students</h1>
                <p>Manage all enrolled students and their profiles.</p>
            </div>

            <div className="card">
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
                    <input
                        className="form-input"
                        style={{ maxWidth: 300 }}
                        placeholder="🔍  Search students…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => { setForm({ email: '', displayName: '' }); setAddOpen(true); }}>
                        + Add Student
                    </button>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <h3>No students found</h3>
                        <p>Add your first student to get started.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s) => (
                                    <tr key={s.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div className="avatar" style={{ background: 'var(--accent-purple)', color: '#fff' }}>
                                                    {s.displayName[0]}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{s.displayName}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button className="btn btn-ghost btn-sm" onClick={() => { setEditStudent(s); setForm({ email: s.email, displayName: s.displayName }); }}>
                                                    ✏ Edit
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => setDeleteStudent(s)}>
                                                    🗑 Remove
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add New Student">
                <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Display Name *</label>
                        <input className="form-input" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} required placeholder="e.g. Alice Johnson" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="alice@school.edu" />
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setAddOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-sm">Add Student</button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={!!editStudent} onClose={() => setEditStudent(null)} title="Edit Student">
                <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Display Name *</label>
                        <input className="form-input" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} required />
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditStudent(null)}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirm */}
            <Modal isOpen={!!deleteStudent} onClose={() => setDeleteStudent(null)} title="Remove Student" width={400}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                    Are you sure you want to remove <strong>{deleteStudent?.displayName}</strong>? This cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setDeleteStudent(null)}>Cancel</button>
                    <button className="btn btn-danger btn-sm" onClick={handleDelete}>Remove Student</button>
                </div>
            </Modal>
        </div>
    );
}
