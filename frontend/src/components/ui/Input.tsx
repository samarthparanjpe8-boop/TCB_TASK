import React from 'react';
import { cn } from '../../lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={inputId} className="block text-xs font-medium tracking-wide text-neutral-400 uppercase">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={cn(
                    'w-full rounded-lg border bg-neutral-950 px-3.5 py-2.5 text-sm text-white',
                    'placeholder:text-neutral-600 transition-colors duration-200',
                    'border-neutral-800 hover:border-neutral-700',
                    'focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/15',
                    error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20',
                    className
                )}
                {...props}
            />
            {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}
