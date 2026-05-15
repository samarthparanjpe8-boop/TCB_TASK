import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../Logo';
import { cn } from '../../lib/cn';
import { Button } from '../ui/Button';

type NavItem = { to: string; label: string; end?: boolean };

const teacherNav: NavItem[] = [
    { to: '/app', label: 'Dashboard', end: true },
    { to: '/app/students', label: 'Students' },
    { to: '/app/courses', label: 'Courses' },
    { to: '/app/grades', label: 'Grades' },
    { to: '/app/academic-records', label: 'Academic Records' },
];

const studentNav: NavItem[] = [{ to: '/app', label: 'Dashboard', end: true }];

export function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const navItems = user?.role === 'teacher' ? teacherNav : studentNav;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navContent = (
        <>
            <div className="border-b border-neutral-800/80 p-5">
                <Logo linked={false} size="lg" className="max-w-[180px]" />
                <p className="mt-3 text-xs text-neutral-600">Classroom management</p>
            </div>

            <nav className="flex-1 space-y-0.5 p-3">
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-600">Menu</p>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-white/5 text-white'
                                    : 'text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-200'
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <span className="mr-2 h-1.5 w-1.5 rounded-full bg-red-500" />
                                )}
                                {!isActive && <span className="mr-3.5 w-1.5" />}
                                {item.label}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="border-t border-neutral-800/80 p-4">
                <div className="mb-3 truncate px-1 text-xs text-neutral-600">{user?.email}</div>
                <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                    Sign out
                </Button>
            </div>
        </>
    );

    return (
        <>
            <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-neutral-800 bg-black px-4 lg:hidden">
                <Logo linked={false} size="sm" className="max-w-[140px]" />
                <button
                    type="button"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-900 hover:text-white"
                    aria-label="Toggle menu"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {mobileOpen ? (
                            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                        ) : (
                            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
                        )}
                    </svg>
                </button>
            </div>

            {mobileOpen && (
                <button
                    type="button"
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                />
            )}

            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex w-[min(100vw-3rem,16rem)] flex-col border-r border-neutral-800/80 bg-neutral-950 pt-[env(safe-area-inset-top)] transition-transform duration-300 lg:static lg:w-64 lg:translate-x-0 lg:pt-0',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                {navContent}
            </aside>
        </>
    );
}
