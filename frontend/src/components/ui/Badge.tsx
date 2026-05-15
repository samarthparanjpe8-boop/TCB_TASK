import React from 'react';
import { cn } from '../../lib/cn';

type BadgeVariant = 'default' | 'accent' | 'muted' | 'grade';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
    default: 'bg-neutral-800 text-neutral-200 border-neutral-700',
    accent: 'bg-red-500/10 text-red-400 border-red-500/20',
    muted: 'bg-neutral-900 text-neutral-500 border-neutral-800',
    grade: 'bg-white/5 text-neutral-200 border-neutral-700 font-semibold tabular-nums',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
                variants[variant],
                className
            )}
            {...props}
        />
    );
}

export function GradeBadge({ letter }: { letter: string }) {
    const accent =
        letter === 'A'
            ? 'text-white border-neutral-600'
            : letter === 'F'
              ? 'text-red-400 border-red-500/30 bg-red-500/10'
              : 'text-neutral-300 border-neutral-700';

    return (
        <span
            className={cn(
                'inline-flex h-6 min-w-6 items-center justify-center rounded-md border px-1.5 text-xs font-semibold',
                accent
            )}
        >
            {letter}
        </span>
    );
}
