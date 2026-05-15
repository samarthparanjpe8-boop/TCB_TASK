import { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/StatCard';
import { TableScroll } from '../components/ui/Table';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/Card';
import { GradeBadge } from '../components/ui/Badge';
import { mockStudents, mockCourses, mockGrades, mockEnrollments, getLetterGrade } from '../lib/mockData';
import { isDemoMode, api } from '../lib/api';
import type { Student, Course, Grade } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function DashboardPage() {
    const { user } = useAuth();
    const isTeacher = user?.role === 'teacher';
    const [students, setStudents] = useState<Student[]>(isDemoMode ? mockStudents : []);
    const [courses, setCourses] = useState<Course[]>(isDemoMode ? mockCourses : []);
    const [grades, setGrades] = useState<Grade[]>(isDemoMode ? mockGrades : []);

    useEffect(() => {
        if (isDemoMode) {
            if (!isTeacher && user) {
                setStudents([mockStudents[0]]);
                setGrades(mockGrades.filter((g) => g.studentId === mockStudents[0].id));
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
                } else {
                    const { data: me } = await api.get('/me');
                    setStudents([
                        {
                            id: me.id,
                            authId: me.authId ?? null,
                            email: me.email,
                            displayName: me.displayName,
                        },
                    ]);

                    const gradeGroups = await Promise.all(
                        (coursesData || []).map(async (course) => {
                            try {
                                const { data: gradeData } = await api.get<Grade[]>(`/courses/${course.id}/grades`);
                                return Array.isArray(gradeData) ? gradeData.filter((g) => g.studentId === me.id) : [];
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

    const recentGrades = useMemo(
        () =>
            [...grades]
                .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                .slice(0, 5),
        [grades]
    );

    if (!isTeacher) {
        const studentDetails = students[0] || user;
        return (
            <div>
                <PageHeader
                    title="My record"
                    description={`Welcome back, ${studentDetails?.displayName || studentDetails?.email || 'Student'}. Here are your academic records.`}
                />
                <Card padding="none" className="overflow-hidden">
                    <TableScroll>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-800 bg-neutral-950/50 text-left text-xs uppercase tracking-wider text-neutral-500">
                                    <th className="px-5 py-3 font-medium">Course code</th>
                                    <th className="px-5 py-3 font-medium">Course name</th>
                                    <th className="px-5 py-3 font-medium">Score</th>
                                    <th className="px-5 py-3 font-medium">Max</th>
                                    <th className="px-5 py-3 font-medium">Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grades.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-12 text-center text-neutral-500">
                                            No grades available yet.
                                        </td>
                                    </tr>
                                ) : (
                                    grades.map((g) => {
                                        const c = courses.find((co) => co.id === g.courseId);
                                        const letter = getLetterGrade(g.score, g.maxScore);
                                        return (
                                            <tr key={g.id} className="border-b border-neutral-800/50 transition-colors hover:bg-white/[0.02]">
                                                <td className="px-5 py-3.5 font-medium text-white">{c?.code || '—'}</td>
                                                <td className="px-5 py-3.5 text-neutral-400">{c?.title || 'Unknown course'}</td>
                                                <td className="px-5 py-3.5 tabular-nums">{g.score}</td>
                                                <td className="px-5 py-3.5 tabular-nums text-neutral-500">{g.maxScore}</td>
                                                <td className="px-5 py-3.5">
                                                    <GradeBadge letter={letter} />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </TableScroll>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <PageHeader title="Dashboard" description="Welcome back. Here's an overview of your classroom." />

            <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
                        </svg>
                    }
                    value={students.length}
                    label="Total students"
                    sub={`${students.length} active`}
                />
                <StatCard
                    icon={
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" />
                        </svg>
                    }
                    value={courses.length}
                    label="Total courses"
                    sub={`${mockEnrollments.length} enrollments`}
                />
                <StatCard
                    icon={
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    }
                    value={grades.length}
                    label="Grades recorded"
                    sub="Across all courses"
                />
                <StatCard
                    icon={
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    }
                    value={recentGrades.length ? getLetterGrade(recentGrades[0].score, recentGrades[0].maxScore) : '—'}
                    label="Latest grade"
                    sub="From recent activity"
                    accent
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <div className="mb-5 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">Recent grades</h3>
                        <Link to="/app/grades" className="text-xs text-neutral-500 transition-colors hover:text-red-400">
                            View all
                        </Link>
                    </div>
                    <TableScroll>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-neutral-600">
                                    <th className="pb-3 font-medium">Student</th>
                                    <th className="pb-3 font-medium">Course</th>
                                    <th className="pb-3 font-medium">Score</th>
                                    <th className="pb-3 font-medium">Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentGrades.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-neutral-500">
                                            No recent grades.
                                        </td>
                                    </tr>
                                ) : (
                                    recentGrades.map((g) => {
                                        const s = students.find((st) => st.id === g.studentId);
                                        const c = courses.find((co) => co.id === g.courseId);
                                        const letter = getLetterGrade(g.score, g.maxScore);
                                        return (
                                            <tr key={g.id} className="border-t border-neutral-800/50">
                                                <td className="py-3 font-medium text-white">{s?.displayName || 'Unknown'}</td>
                                                <td className="py-3 text-neutral-500">{c?.code || '—'}</td>
                                                <td className="py-3 tabular-nums">
                                                    {g.score}/{g.maxScore}
                                                </td>
                                                <td className="py-3">
                                                    <GradeBadge letter={letter} />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </TableScroll>
                </Card>

                <Card>
                    <div className="mb-5 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">Active courses</h3>
                        <Link to="/app/courses" className="text-xs text-neutral-500 transition-colors hover:text-red-400">
                            Manage
                        </Link>
                    </div>
                    <div className="space-y-2">
                        {courses.length === 0 ? (
                            <p className="py-8 text-center text-sm text-neutral-500">No active courses.</p>
                        ) : (
                            courses.map((c) => (
                                <div
                                    key={c.id}
                                    className="flex items-center justify-between rounded-lg border border-neutral-800/60 bg-neutral-950/50 px-4 py-3 transition-colors hover:border-neutral-700"
                                >
                                    <span className="text-sm font-semibold text-white">{c.code}</span>
                                    <span className="text-sm text-neutral-500">{c.title}</span>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
