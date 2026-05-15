import React from 'react';
import { cn } from '../../lib/cn';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
            {icon && (
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-500">
                    {icon}
                </div>
            )}
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {description && <p className="mt-1 max-w-sm text-sm text-neutral-500">{description}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
