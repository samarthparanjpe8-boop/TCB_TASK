import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function TableScroll({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn('-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0', className)}>
            <div className="min-w-[640px] sm:min-w-0">{children}</div>
        </div>
    );
}
