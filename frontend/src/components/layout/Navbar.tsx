import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../Logo';
import { Button } from '../ui/Button';
import { cn } from '../../lib/cn';

export function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-black/80 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
                <Logo />
                <div className="hidden items-center gap-2 sm:flex sm:gap-3">
                    <Link to="/sign-in">
                        <Button variant="ghost" size="sm">
                            Sign in
                        </Button>
                    </Link>
                    <Link to="/register">
                        <Button variant="primary" size="sm">
                            Get started
                        </Button>
                    </Link>
                </div>
                <button
                    type="button"
                    className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-900 hover:text-white sm:hidden"
                    onClick={() => setOpen(!open)}
                    aria-label="Toggle menu"
                    aria-expanded={open}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {open ? (
                            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                        ) : (
                            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
                        )}
                    </svg>
                </button>
            </div>
            <div
                className={cn(
                    'overflow-hidden border-t border-neutral-800/80 bg-black transition-all duration-300 sm:hidden',
                    open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                )}
            >
                <div className="flex flex-col gap-2 px-4 py-3">
                    <Link to="/sign-in" onClick={() => setOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full">
                            Sign in
                        </Button>
                    </Link>
                    <Link to="/register" onClick={() => setOpen(false)}>
                        <Button variant="primary" size="sm" className="w-full">
                            Get started
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
