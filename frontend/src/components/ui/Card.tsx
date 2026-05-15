import React from 'react';
import { cn } from '../../lib/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
}

const paddingMap = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

export function Card({ className, padding = 'md', hover, children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                'rounded-xl border border-neutral-800/80 bg-neutral-900/40 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]',
                hover && 'transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-900/60',
                paddingMap[padding],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
