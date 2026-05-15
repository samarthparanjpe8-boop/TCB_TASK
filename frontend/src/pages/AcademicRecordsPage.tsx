import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api, isDemoMode } from '../lib/api';
import { getLetterGrade, mockCourses, mockGrades, mockStudents } from '../lib/mockData';
import type { Course, Grade, Student } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge, GradeBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Select } from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import { ProgressBar } from '../components/ui/ProgressBar';
import { TableScroll } from '../components/ui/Table';
import { cn } from '../lib/cn';

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
        const visibleStudents = selectedStudent === 'all' ? students : students.filter((s) => s.id === selectedStudent);

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
            <PageHeader title="Academic records" description="Comprehensive view of student performance across all courses." />

            {isTeacher && (
                <div className="mb-6 max-w-xs">
                    <Select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
                        <option value="all">All students</option>
                        {students.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.displayName}
                            </option>
                        ))}
                    </Select>
                </div>
            )}

            <div className="space-y-4">
                {loading && (
                    <Card>
                        <div className="flex justify-center py-8">
                            <Spinner />
                        </div>
                    </Card>
                )}
                {studentGrades.map(({ student, grades: studentGradeList, avg }) => (
                    <Card key={student.id}>
                        <div className="mb-6 flex items-center gap-4">
                            <Avatar name={student.displayName} className="h-11 w-11 text-sm" />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white">{student.displayName}</p>
                                <p className="truncate text-xs text-neutral-600">{student.email}</p>
                            </div>
                            {avg !== null && (
                                <div className="text-right">
                                    <p className={cn('text-2xl font-semibold tabular-nums', avg >= 90 ? 'text-white' : avg >= 70 ? 'text-neutral-300' : 'text-neutral-500')}>
                                        {avg}%
                                    </p>
                                    <p className="text-[10px] uppercase tracking-wider text-neutral-600">Overall avg</p>
                                </div>
                            )}
                        </div>

                        {studentGradeList.length === 0 ? (
                            <p className="text-sm text-neutral-500">No grades recorded yet.</p>
                        ) : (
                            <TableScroll>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-neutral-800 text-left text-xs uppercase tracking-wider text-neutral-500">
                                            <th className="pb-3 font-medium">Course</th>
                                            <th className="pb-3 font-medium">Assignment</th>
                                            <th className="pb-3 font-medium">Score</th>
                                            <th className="pb-3 font-medium">Grade</th>
                                            <th className="pb-3 font-medium">Performance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentGradeList.map((g) => {
                                            const courseName = courses.find((c) => c.id === g.courseId)?.code || g.courseId;
                                            const letter = getLetterGrade(g.score, g.maxScore);
                                            const pct = Math.round((g.score / g.maxScore) * 100);
                                            return (
                                                <tr key={g.id} className="border-b border-neutral-800/50">
                                                    <td className="py-3">
                                                        <Badge variant="accent">{courseName}</Badge>
                                                    </td>
                                                    <td className="py-3 text-neutral-500">{g.assignmentName}</td>
                                                    <td className="py-3 font-medium tabular-nums">
                                                        {g.score}/{g.maxScore}
                                                    </td>
                                                    <td className="py-3">
                                                        <GradeBadge letter={letter} />
                                                    </td>
                                                    <td className="py-3 min-w-[120px]">
                                                        <ProgressBar value={pct} />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                    </TableScroll>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}
