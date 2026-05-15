import React from 'react';
import { cn } from '../lib/cn';

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
    return (
        <header className={cn('mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between', className)}>
            <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl lg:text-3xl">{title}</h1>
                {description && <p className="mt-1.5 text-sm text-neutral-500">{description}</p>}
            </div>
            {action && <div className="w-full shrink-0 sm:w-auto [&_button]:w-full sm:[&_button]:w-auto">{action}</div>}
        </header>
    );
}
