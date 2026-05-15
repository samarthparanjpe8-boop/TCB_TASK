import { useState, useEffect } from 'react';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
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
        api
            .get<Course[]>('/courses')
            .then(({ data }) => {
                setCourses(data);
                if (isTeacher) {
                    api.get<Student[]>('/students').then((res) => setStudents(res.data)).catch(() => {});
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
        } catch {
            showToast('Failed to add course', 'error');
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editCourse) return;
        try {
            if (isDemoMode) {
                localCourses = localCourses.map((c) => (c.id === editCourse.id ? { ...c, ...form } : c));
                setCourses([...localCourses]);
            } else {
                await api.patch(`/courses/${editCourse.id}`, form);
                setCourses((prev) => prev.map((c) => (c.id === editCourse.id ? { ...c, ...form } : c)));
            }
            showToast('Course updated');
            setEditCourse(null);
        } catch {
            showToast('Failed to update course', 'error');
        }
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
        } catch {
            showToast('Failed to delete course', 'error');
        }
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
        } catch {
            showToast('Failed to enroll student', 'error');
        }
    };

    return (
        <div>
            <PageHeader
                title="Courses"
                description="Manage courses and their enrollments."
                action={
                    isTeacher ? (
                        <Button size="sm" onClick={() => { setForm({ title: '', code: '', description: '' }); setAddOpen(true); }}>
                            New course
                        </Button>
                    ) : undefined
                }
            />

            {loading ? (
                <div className="flex justify-center py-20">
                    <Spinner size="lg" />
                </div>
            ) : courses.length === 0 ? (
                <EmptyState
                    title="No courses yet"
                    description="Create your first course to get started."
                    icon={
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" />
                        </svg>
                    }
                />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {courses.map((c) => {
                        const enrollCount = isDemoMode ? mockEnrollments.filter((e) => e.courseId === c.id).length : 0;
                        return (
                            <Card key={c.id} hover className="relative">
                                <div className="mb-4 flex items-start justify-between gap-2">
                                    <Badge variant="accent">{c.code}</Badge>
                                    {isTeacher && (
                                        <div className="flex gap-1">
                                            <button type="button" onClick={() => setEnrollCourse(c)} className="rounded-md px-2 py-1 text-xs text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-white" title="Enroll student">
                                                Enroll
                                            </button>
                                            <button type="button" onClick={() => { setEditCourse(c); setForm({ title: c.title, code: c.code, description: c.description }); }} className="rounded-md px-2 py-1 text-xs text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-white">
                                                Edit
                                            </button>
                                            <button type="button" onClick={() => setDeleteCourse(c)} className="rounded-md px-2 py-1 text-xs text-red-400/80 transition-colors hover:bg-red-500/10 hover:text-red-400">
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-semibold text-white">{c.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-neutral-500">{c.description || 'No description'}</p>
                                <p className="mt-4 text-xs text-neutral-600">
                                    {enrollCount} student{enrollCount !== 1 ? 's' : ''} enrolled
                                </p>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Modal isOpen={isTeacher && addOpen} onClose={() => setAddOpen(false)} title="New course">
                <form onSubmit={handleAdd} className="space-y-4">
                    <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Mathematics 101" />
                    <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required placeholder="MATH-101" />
                    <Textarea label="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Course description" />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
                        <Button type="submit" size="sm">Create course</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isTeacher && !!editCourse} onClose={() => setEditCourse(null)} title="Edit course">
                <form onSubmit={handleEdit} className="space-y-4">
                    <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                    <Textarea label="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setEditCourse(null)}>Cancel</Button>
                        <Button type="submit" size="sm">Save changes</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isTeacher && !!deleteCourse} onClose={() => setDeleteCourse(null)} title="Delete course" width="sm">
                <p className="mb-6 text-sm text-neutral-500">
                    Delete <span className="text-white">{deleteCourse?.title}</span>? All enrollments and grades will be removed.
                </p>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDeleteCourse(null)}>Cancel</Button>
                    <Button size="sm" onClick={handleDelete}>Delete</Button>
                </div>
            </Modal>

            <Modal isOpen={isTeacher && !!enrollCourse} onClose={() => setEnrollCourse(null)} title="Enroll student">
                <form onSubmit={handleEnroll} className="space-y-4">
                    <p className="text-sm text-neutral-500">
                        Enroll a student into <span className="text-white">{enrollCourse?.title}</span>.
                    </p>
                    <Select label="Student" value={enrollStudentId} onChange={(e) => setEnrollStudentId(e.target.value)} required>
                        <option value="">Select student</option>
                        {students.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.displayName} ({s.email})
                            </option>
                        ))}
                    </Select>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setEnrollCourse(null)}>Cancel</Button>
                        <Button type="submit" size="sm">Enroll</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
