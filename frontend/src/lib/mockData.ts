// src/lib/mockData.ts
import type { Student, Course, Enrollment, Grade } from '../types';

export const mockStudents: Student[] = [
    { id: 'stu-001', authId: null, email: 'alice@school.edu', displayName: 'Alice Johnson', createdAt: '2025-08-01T00:00:00Z', updatedAt: '2025-08-01T00:00:00Z' },
    { id: 'stu-002', authId: null, email: 'bob@school.edu', displayName: 'Bob Smith', createdAt: '2025-08-02T00:00:00Z', updatedAt: '2025-08-02T00:00:00Z' },
    { id: 'stu-003', authId: null, email: 'clara@school.edu', displayName: 'Clara Thompson', createdAt: '2025-08-03T00:00:00Z', updatedAt: '2025-08-03T00:00:00Z' },
    { id: 'stu-004', authId: null, email: 'david@school.edu', displayName: 'David Lee', createdAt: '2025-08-04T00:00:00Z', updatedAt: '2025-08-04T00:00:00Z' },
    { id: 'stu-005', authId: null, email: 'emily@school.edu', displayName: 'Emily Nguyen', createdAt: '2025-08-05T00:00:00Z', updatedAt: '2025-08-05T00:00:00Z' },
    { id: 'stu-006', authId: null, email: 'frank@school.edu', displayName: 'Frank Wilson', createdAt: '2025-08-06T00:00:00Z', updatedAt: '2025-08-06T00:00:00Z' },
];

export const mockCourses: Course[] = [
    { id: 'crs-001', title: 'Mathematics 101', code: 'MATH-101', description: 'Algebra and basic calculus', teacherId: 'teacher-001' },
    { id: 'crs-002', title: 'English 301', code: 'ENG-301', description: 'Advanced English literature', teacherId: 'teacher-001' },
    { id: 'crs-003', title: 'Science 301', code: 'SCI-301', description: 'Biology and chemistry fundamentals', teacherId: 'teacher-001' },
    { id: 'crs-004', title: 'History 101', code: 'HIST-101', description: 'World history survey', teacherId: 'teacher-001' },
    { id: 'crs-005', title: 'Computer Science 101', code: 'CS-101', description: 'Intro to programming', teacherId: 'teacher-001' },
];

export const mockEnrollments: Enrollment[] = [
    { id: 'enr-001', courseId: 'crs-001', studentId: 'stu-001', studentDisplayName: 'Alice Johnson', studentEmail: 'alice@school.edu', status: 'active' },
    { id: 'enr-002', courseId: 'crs-001', studentId: 'stu-002', studentDisplayName: 'Bob Smith', studentEmail: 'bob@school.edu', status: 'active' },
    { id: 'enr-003', courseId: 'crs-002', studentId: 'stu-003', studentDisplayName: 'Clara Thompson', studentEmail: 'clara@school.edu', status: 'active' },
    { id: 'enr-004', courseId: 'crs-002', studentId: 'stu-006', studentDisplayName: 'Frank Wilson', studentEmail: 'frank@school.edu', status: 'active' },
    { id: 'enr-005', courseId: 'crs-003', studentId: 'stu-004', studentDisplayName: 'David Lee', studentEmail: 'david@school.edu', status: 'active' },
    { id: 'enr-006', courseId: 'crs-004', studentId: 'stu-005', studentDisplayName: 'Emily Nguyen', studentEmail: 'emily@school.edu', status: 'active' },
];

export const mockGrades: Grade[] = [
    { id: 'grd-001', courseId: 'crs-001', studentId: 'stu-001', assignmentName: 'Midterm Exam', score: 91, maxScore: 100 },
    { id: 'grd-002', courseId: 'crs-001', studentId: 'stu-002', assignmentName: 'Midterm Exam', score: 84, maxScore: 100 },
    { id: 'grd-003', courseId: 'crs-002', studentId: 'stu-003', assignmentName: 'Essay 1', score: 92, maxScore: 100 },
    { id: 'grd-004', courseId: 'crs-002', studentId: 'stu-006', assignmentName: 'Essay 1', score: 73, maxScore: 100 },
    { id: 'grd-005', courseId: 'crs-003', studentId: 'stu-004', assignmentName: 'Lab Report', score: 88, maxScore: 100 },
    { id: 'grd-006', courseId: 'crs-004', studentId: 'stu-005', assignmentName: 'Research Paper', score: 92, maxScore: 100 },
    { id: 'grd-007', courseId: 'crs-001', studentId: 'stu-001', assignmentName: 'Quiz 1', score: 95, maxScore: 100 },
    { id: 'grd-008', courseId: 'crs-005', studentId: 'stu-003', assignmentName: 'Project 1', score: 92, maxScore: 100 },
    { id: 'grd-009', courseId: 'crs-005', studentId: 'stu-001', assignmentName: 'Project 1', score: 87, maxScore: 100 },
];

export function getLetterGrade(score: number, maxScore: number): string {
    const pct = (score / maxScore) * 100;
    if (pct >= 90) return 'A';
    if (pct >= 80) return 'B';
    if (pct >= 70) return 'C';
    if (pct >= 60) return 'D';
    return 'F';
}
