// src/types/index.ts
export interface User {
    id: string;
    authId: string | null;
    email: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    registrationMarks?: number | null;
    role: 'teacher' | 'student';
    archivedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Student {
    id: string;
    authId: string | null;
    email: string;
    displayName: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Course {
    id: string;
    title: string;
    code: string;
    description: string;
    teacherId: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Enrollment {
    id: string;
    courseId: string;
    studentId: string;
    studentEmail?: string;
    studentDisplayName?: string;
    status: 'active' | 'inactive';
    createdAt?: string;
    updatedAt?: string;
}

export interface Grade {
    id: string;
    courseId: string;
    studentId: string;
    assignmentName: string;
    score: number;
    maxScore: number;
    recordedBy?: string;
    createdAt?: string;
    updatedAt?: string;
}
