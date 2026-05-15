import { cn } from '../../lib/cn';

export function ProgressBar({ value, className }: { value: number; className?: string }) {
    const clamped = Math.min(100, Math.max(0, value));
    return (
        <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-neutral-800', className)}>
            <div
                className="h-full rounded-full bg-white transition-all duration-500 ease-out"
                style={{ width: `${clamped}%` }}
            />
        </div>
    );
}
