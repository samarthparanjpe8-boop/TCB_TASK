import React from 'react';
import { cn } from '../../lib/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

export function Textarea({ label, className, id, ...props }: TextareaProps) {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={textareaId} className="block text-xs font-medium tracking-wide text-neutral-400 uppercase">
                    {label}
                </label>
            )}
            <textarea
                id={textareaId}
                className={cn(
                    'w-full resize-none rounded-lg border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-white',
                    'placeholder:text-neutral-600 transition-colors duration-200 hover:border-neutral-700',
                    'focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/15',
                    className
                )}
                {...props}
            />
        </div>
    );
}
