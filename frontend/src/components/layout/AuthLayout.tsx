import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../Logo';

interface AuthLayoutProps {
    title: string;
    subtitle: string;
    children: ReactNode;
    backTo?: string;
    backLabel?: string;
}

export function AuthLayout({ title, subtitle, children, backTo = '/', backLabel = 'Back to home' }: AuthLayoutProps) {
    return (
        <div className="relative min-h-screen bg-black">
            <div className="pointer-events-none absolute inset-0 grid-pattern opacity-40" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-red-950/10 via-transparent to-transparent" />

            <div className="relative mx-auto flex min-h-screen min-h-[100dvh] max-w-md flex-col px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-8">
                <div className="mb-12 flex items-center justify-between">
                    <Link to={backTo} className="text-sm text-neutral-500 transition-colors hover:text-white">
                        {backLabel}
                    </Link>
                    <Logo linked={false} size="sm" className="max-w-[120px]" />
                </div>

                <div className="flex flex-1 flex-col justify-center">
                    <div className="mb-6 flex justify-center sm:hidden">
                        <Logo linked={false} size="lg" className="max-w-[200px]" />
                    </div>
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
                        <p className="mt-2 text-sm text-neutral-500">{subtitle}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
