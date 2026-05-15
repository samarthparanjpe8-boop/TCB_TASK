import React from 'react';
import { cn } from '../../lib/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
}

export function Select({ label, className, id, children, ...props }: SelectProps) {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={selectId} className="block text-xs font-medium tracking-wide text-neutral-400 uppercase">
                    {label}
                </label>
            )}
            <select
                id={selectId}
                className={cn(
                    'w-full appearance-none rounded-lg border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-white',
                    'transition-colors duration-200 hover:border-neutral-700',
                    'focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/15',
                    className
                )}
                {...props}
            >
                {children}
            </select>
        </div>
    );
}
