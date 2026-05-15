import React from 'react';
import { cn } from '../../lib/cn';

export function Spinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
    const sizeClass = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' }[size];
    return (
        <div
            className={cn(
                'animate-spin rounded-full border-2 border-neutral-700 border-t-red-500',
                sizeClass,
                className
            )}
            role="status"
            aria-label="Loading"
        />
    );
}

export function PageLoader() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-black">
            <Spinner size="lg" />
        </div>
    );
}
