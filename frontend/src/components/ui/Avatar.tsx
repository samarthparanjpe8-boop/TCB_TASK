import React from 'react';
import { cn } from '../../lib/cn';

export function Avatar({ name, className }: { name: string; className?: string }) {
    const initial = (name?.[0] || '?').toUpperCase();
    return (
        <div
            className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-xs font-semibold text-white',
                className
            )}
        >
            {initial}
        </div>
    );
}
