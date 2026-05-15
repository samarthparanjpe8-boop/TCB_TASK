import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const features = [
    {
        title: 'Student profiles',
        description: 'Centralized records with role-based access for teachers and students.',
    },
    {
        title: 'Grade management',
        description: 'Record, update, and track assignments with automatic letter grades.',
    },
    {
        title: 'Course enrollment',
        description: 'Manage courses, capacity, and enrollments from a single dashboard.',
    },
    {
        title: 'Academic records',
        description: 'Comprehensive performance views across all courses and students.',
    },
    {
        title: 'Secure access',
        description: 'Authentication with teacher and student roles built in.',
    },
    {
        title: 'Real-time overview',
        description: 'Dashboard insights for recent activity and course summaries.',
    },
];

export function LandingPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <section className="relative overflow-hidden pt-24 pb-16 sm:pt-40 sm:pb-28">
                <div className="pointer-events-none absolute inset-0 grid-pattern opacity-30" />
                <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-red-600/5 blur-3xl" />

                <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/50 px-3 py-1 text-xs font-medium text-neutral-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            Classroom management platform
                        </p>
                        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl lg:text-6xl sm:leading-[1.1]">
                            Every student, grade, and course{' '}
                            <span className="text-neutral-500">in one system.</span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-neutral-500 sm:text-lg">
                            StudentIQ replaces disconnected spreadsheets with a structured platform for
                            profiles, grades, courses, and academic records.
                        </p>
                        <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
                            <Link to="/register" className="w-full sm:w-auto">
                                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                                    Start managing
                                </Button>
                            </Link>
                            <Link to="/sign-in" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                    Sign in
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="relative mx-auto mt-20 max-w-4xl">
                        <Card padding="none" className="overflow-hidden border-neutral-800/80 shadow-2xl shadow-black/50">
                            <div className="flex items-center gap-2 border-b border-neutral-800 bg-neutral-950 px-4 py-3">
                                <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                                <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                                <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                                <span className="ml-2 text-xs text-neutral-600">dashboard — StudentIQ</span>
                            </div>
                            <div className="grid gap-px bg-neutral-800/50 p-6 sm:grid-cols-3">
                                {[
                                    { label: 'Students', value: '24' },
                                    { label: 'Courses', value: '5' },
                                    { label: 'Grades', value: '128' },
                                ].map((stat) => (
                                    <div key={stat.label} className="rounded-lg bg-neutral-950 p-4">
                                        <p className="text-xs text-neutral-600">{stat.label}</p>
                                        <p className="mt-1 text-2xl font-semibold tabular-nums">{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-neutral-800 bg-neutral-950/50 p-4">
                                <div className="space-y-2">
                                    {['MATH-101 — Midterm', 'ENG-301 — Essay 1', 'SCI-301 — Lab Report'].map((row) => (
                                        <div
                                            key={row}
                                            className="flex items-center justify-between rounded-lg border border-neutral-800/60 bg-neutral-900/30 px-3 py-2 text-sm"
                                        >
                                            <span className="text-neutral-400">{row}</span>
                                            <span className="font-medium text-white">A</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            <section className="border-t border-neutral-900 py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="mb-14 max-w-xl">
                        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Built for focused classroom operations
                        </h2>
                        <p className="mt-3 text-neutral-500">
                            Everything you need to run a modern academic workflow, without the clutter.
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((f) => (
                            <Card key={f.title} hover className="transition-all duration-300">
                                <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-neutral-500">{f.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="border-t border-neutral-900 py-8">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-neutral-600 sm:flex-row sm:px-6">
                    <span>StudentIQ</span>
                    <div className="flex gap-6">
                        <Link to="/sign-in" className="transition-colors hover:text-white">
                            Sign in
                        </Link>
                        <Link to="/register" className="transition-colors hover:text-white">
                            Register
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
