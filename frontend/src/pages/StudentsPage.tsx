import { useState, useEffect } from 'react';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { TableScroll } from '../components/ui/Table';
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
        if (isDemoMode) {
            setStudents([...localStudents]);
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.get<Student[]>('/students');
            setStudents(data);
        } catch {
            showToast('Failed to load students', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const filtered = students.filter(
        (s) =>
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
                setStudents((prev) => (prev.some((s) => s.id === data.id) ? prev : [...prev, data]));
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
                localStudents = localStudents.map((s) => (s.id === editStudent.id ? { ...s, displayName: form.displayName } : s));
                setStudents([...localStudents]);
            } else {
                await api.patch(`/students/${editStudent.id}`, { displayName: form.displayName });
                setStudents((prev) => prev.map((s) => (s.id === editStudent.id ? { ...s, displayName: form.displayName } : s)));
            }
            showToast('Student updated');
            setEditStudent(null);
        } catch {
            showToast('Failed to update student', 'error');
        }
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
        } catch {
            showToast('Failed to delete student', 'error');
        }
    };

    return (
        <div>
            <PageHeader
                title="Students"
                description="Manage all enrolled students and their profiles."
                action={
                    <Button size="sm" onClick={() => { setForm({ email: '', displayName: '' }); setAddOpen(true); }}>
                        Add student
                    </Button>
                }
            />

            <Card>
                <div className="mb-6">
                    <Input placeholder="Search students…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Spinner size="lg" />
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        title="No students found"
                        description="Add your first student to get started."
                        icon={
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8" strokeLinecap="round" />
                            </svg>
                        }
                    />
                ) : (
                    <TableScroll>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-800 text-left text-xs uppercase tracking-wider text-neutral-500">
                                    <th className="pb-3 font-medium">Name</th>
                                    <th className="pb-3 font-medium">Email</th>
                                    <th className="pb-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s) => (
                                    <tr key={s.id} className="border-b border-neutral-800/50 transition-colors hover:bg-white/[0.02]">
                                        <td className="py-3.5">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={s.displayName} />
                                                <span className="font-medium text-white">{s.displayName}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 text-neutral-500">{s.email}</td>
                                        <td className="py-3.5">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => { setEditStudent(s); setForm({ email: s.email, displayName: s.displayName }); }}>
                                                    Edit
                                                </Button>
                                                <Button variant="danger" size="sm" onClick={() => setDeleteStudent(s)}>
                                                    Remove
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </TableScroll>
                )}
            </Card>

            <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add student">
                <form onSubmit={handleAdd} className="space-y-4">
                    <Input label="Display name" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} required placeholder="Alice Johnson" />
                    <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="alice@school.edu" />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
                        <Button type="submit" size="sm">Add student</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={!!editStudent} onClose={() => setEditStudent(null)} title="Edit student">
                <form onSubmit={handleEdit} className="space-y-4">
                    <Input label="Display name" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} required />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setEditStudent(null)}>Cancel</Button>
                        <Button type="submit" size="sm">Save changes</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={!!deleteStudent} onClose={() => setDeleteStudent(null)} title="Remove student" width="sm">
                <p className="mb-6 text-sm text-neutral-500">
                    Remove <span className="text-white">{deleteStudent?.displayName}</span>? This cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDeleteStudent(null)}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={handleDelete}>Remove</Button>
                </div>
            </Modal>
        </div>
    );
}
