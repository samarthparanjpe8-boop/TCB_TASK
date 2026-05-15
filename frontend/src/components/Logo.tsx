import { Link } from 'react-router-dom';
import { cn } from '../lib/cn';

const sizeClasses = {
    sm: 'h-9',
    md: 'h-12',
    lg: 'h-16',
} as const;

export function Logo({
    className,
    linked = true,
    size = 'md',
}: {
    className?: string;
    linked?: boolean;
    size?: keyof typeof sizeClasses;
}) {
    const image = (
        <img
            src="/logo.png"
            alt="StudentIQ"
            className={cn('w-auto max-w-[min(100%,260px)] object-contain object-left', sizeClasses[size], className)}
            width={220}
            height={66}
            decoding="async"
        />
    );

    if (!linked) return image;

    return (
        <Link
            to="/"
            className="inline-flex shrink-0 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm"
        >
            {image}
        </Link>
    );
}
