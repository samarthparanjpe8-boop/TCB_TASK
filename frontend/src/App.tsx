// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppLayout } from './components/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { CoursesPage } from './pages/CoursesPage';
import { GradesPage } from './pages/GradesPage';
import { AcademicRecordsPage } from './pages/AcademicRecordsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div className="spinner" />
            </div>
        );
    }
    if (!user) return <Navigate to="/sign-in" replace />;
    return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    if (isLoading) return null;
    if (user) return <Navigate to="/app" replace />;
    return <>{children}</>;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/sign-in" element={<PublicRoute><SignInPage /></PublicRoute>} />
            <Route
                path="/app"
                element={<ProtectedRoute><AppLayout /></ProtectedRoute>}
            >
                <Route index element={<DashboardPage />} />
                <Route path="students" element={<StudentsPage />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="grades" element={<GradesPage />} />
                <Route path="academic-records" element={<AcademicRecordsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <ToastProvider>
                        <AppRoutes />
                    </ToastProvider>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}
