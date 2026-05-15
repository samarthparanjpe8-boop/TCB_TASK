import { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge, GradeBadge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { TableScroll } from '../components/ui/Table';
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
                }
            } catch {
                showToast('Failed to load grades', 'error');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [isTeacher, showToast]);

    const displayedGrades = selectedCourse === 'all' ? grades : grades.filter((g) => g.courseId === selectedCourse);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCourse === 'all') {
            showToast('Select a course first', 'error');
            return;
        }
        const score = Number(form.score);
        const maxScore = Number(form.maxScore);
        try {
            if (isDemoMode) {
                const newG: Grade = {
                    id: `grd-${Date.now()}`,
                    courseId: selectedCourse,
                    studentId: form.studentId,
                    assignmentName: form.assignmentName,
                    score,
                    maxScore,
                };
                localGrades.push(newG);
                setGrades([...localGrades]);
            } else {
                await api.post(`/courses/${selectedCourse}/enrollments`, { studentId: form.studentId });
                const { data } = await api.post<Grade>(`/courses/${selectedCourse}/grades`, {
                    studentId: form.studentId,
                    assignmentName: form.assignmentName,
                    score,
                    maxScore,
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
                localGrades = localGrades.map((g) =>
                    g.id === editGrade.id ? { ...g, assignmentName: form.assignmentName, score, maxScore: Number(form.maxScore) } : g
                );
                setGrades([...localGrades]);
            } else {
                await api.patch(`/courses/${editGrade.courseId}/grades/${editGrade.id}`, {
                    assignmentName: form.assignmentName,
                    score,
                    maxScore: Number(form.maxScore),
                });
                setGrades((prev) =>
                    prev.map((g) => (g.id === editGrade.id ? { ...g, assignmentName: form.assignmentName, score, maxScore: Number(form.maxScore) } : g))
                );
            }
            showToast('Grade updated');
            setEditGrade(null);
        } catch {
            showToast('Failed to update grade', 'error');
        }
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
        } catch {
            showToast('Failed to delete grade', 'error');
        }
    };

    const getStudentName = (id: string) => students.find((s) => s.id === id)?.displayName || id;
    const getCourseName = (id: string) => courses.find((c) => c.id === id)?.code || id;

    return (
        <div>
            <PageHeader
                title="Grades"
                description="Track and manage student grade records."
                action={
                    isTeacher ? (
                        <Button size="sm" onClick={() => { setForm({ studentId: '', assignmentName: '', score: '', maxScore: '100' }); setAddOpen(true); }}>
                            Record grade
                        </Button>
                    ) : undefined
                }
            />

            <Card>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <Select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full sm:max-w-xs">
                        <option value="all">All courses</option>
                        {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.title} ({c.code})
                            </option>
                        ))}
                    </Select>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Spinner size="lg" />
                    </div>
                ) : displayedGrades.length === 0 ? (
                    <EmptyState title="No grades recorded" description="Select a course and record grades." />
                ) : (
                    <TableScroll>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-800 text-left text-xs uppercase tracking-wider text-neutral-500">
                                    <th className="pb-3 font-medium">Student</th>
                                    <th className="pb-3 font-medium">Course</th>
                                    <th className="pb-3 font-medium">Assignment</th>
                                    <th className="pb-3 font-medium">Score</th>
                                    <th className="pb-3 font-medium">Grade</th>
                                    {isTeacher && <th className="pb-3 font-medium text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {displayedGrades.map((g) => {
                                    const letter = getLetterGrade(g.score, g.maxScore);
                                    return (
                                        <tr key={g.id} className="border-b border-neutral-800/50 hover:bg-white/[0.02]">
                                            <td className="py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <Avatar name={getStudentName(g.studentId)} className="h-7 w-7 text-[10px]" />
                                                    <span className="font-medium text-white">{getStudentName(g.studentId)}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5">
                                                <Badge variant="accent">{getCourseName(g.courseId)}</Badge>
                                            </td>
                                            <td className="py-3.5 text-neutral-500">{g.assignmentName}</td>
                                            <td className="py-3.5 font-medium tabular-nums">
                                                {g.score}/{g.maxScore}
                                            </td>
                                            <td className="py-3.5">
                                                <GradeBadge letter={letter} />
                                            </td>
                                            {isTeacher && (
                                                <td className="py-3.5">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditGrade(g);
                                                                setForm({
                                                                    studentId: g.studentId,
                                                                    assignmentName: g.assignmentName,
                                                                    score: String(g.score),
                                                                    maxScore: String(g.maxScore),
                                                                });
                                                            }}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button variant="danger" size="sm" onClick={() => setDeleteGrade(g)}>
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </TableScroll>
                )}
            </Card>

            <Modal isOpen={isTeacher && addOpen} onClose={() => setAddOpen(false)} title="Record grade">
                <form onSubmit={handleAdd} className="space-y-4">
                    {selectedCourse === 'all' && (
                        <Select label="Course" onChange={(e) => setSelectedCourse(e.target.value)} required>
                            <option value="">Select course</option>
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.title}
                                </option>
                            ))}
                        </Select>
                    )}
                    <Select label="Student" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required>
                        <option value="">Select student</option>
                        {students.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.displayName}
                            </option>
                        ))}
                    </Select>
                    <Input label="Assignment" value={form.assignmentName} onChange={(e) => setForm({ ...form, assignmentName: e.target.value })} required placeholder="Midterm exam" />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Score" type="number" min={0} max={form.maxScore} value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} required />
                        <Input label="Max score" type="number" min={1} value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
                        <Button type="submit" size="sm">Record</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isTeacher && !!editGrade} onClose={() => setEditGrade(null)} title="Edit grade">
                <form onSubmit={handleEdit} className="space-y-4">
                    <Input label="Assignment" value={form.assignmentName} onChange={(e) => setForm({ ...form, assignmentName: e.target.value })} required />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Score" type="number" min={0} value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} required />
                        <Input label="Max score" type="number" min={1} value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setEditGrade(null)}>Cancel</Button>
                        <Button type="submit" size="sm">Save</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isTeacher && !!deleteGrade} onClose={() => setDeleteGrade(null)} title="Delete grade" width="sm">
                <p className="mb-6 text-sm text-neutral-500">Delete this grade entry? This cannot be undone.</p>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDeleteGrade(null)}>Cancel</Button>
                    <Button size="sm" onClick={handleDelete}>Delete</Button>
                </div>
            </Modal>
        </div>
    );
}
