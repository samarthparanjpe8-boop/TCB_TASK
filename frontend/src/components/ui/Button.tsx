import React from 'react';
import { cn } from '../../lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    asChild?: boolean;
}

const variants: Record<ButtonVariant, string> = {
    primary:
        'bg-red-600 text-white hover:bg-red-500 active:bg-red-700 shadow-sm shadow-red-900/20 border border-red-500/20',
    secondary:
        'bg-white text-black hover:bg-neutral-200 active:bg-neutral-300 border border-white/10',
    ghost:
        'bg-transparent text-neutral-300 hover:text-white hover:bg-white/5 border border-transparent',
    danger:
        'bg-transparent text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20',
    outline:
        'bg-transparent text-neutral-200 hover:text-white border border-neutral-700 hover:border-neutral-500 hover:bg-white/[0.02]',
};

const sizes: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-sm gap-2',
};

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    children,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                'disabled:pointer-events-none disabled:opacity-40',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
