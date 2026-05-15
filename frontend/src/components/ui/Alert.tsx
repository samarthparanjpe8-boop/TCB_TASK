import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type AlertVariant = 'info' | 'success' | 'error';

const styles: Record<AlertVariant, string> = {
    info: 'border-neutral-800 bg-neutral-900/50 text-neutral-400',
    success: 'border-neutral-700 bg-neutral-900 text-neutral-300',
    error: 'border-red-500/30 bg-red-500/5 text-red-400',
};

export function Alert({
    variant = 'info',
    title,
    children,
}: {
    variant?: AlertVariant;
    title?: string;
    children: ReactNode;
}) {
    return (
        <div className={cn('rounded-lg border px-4 py-3 text-sm', styles[variant])}>
            {title && <p className="mb-1 font-medium text-white">{title}</p>}
            <div className="leading-relaxed">{children}</div>
        </div>
    );
}
