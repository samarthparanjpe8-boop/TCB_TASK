import React from 'react';
import { Card } from './ui/Card';
import { cn } from '../lib/cn';

interface StatCardProps {
    icon: React.ReactNode;
    value: string | number;
    label: string;
    sub?: string;
    accent?: boolean;
}

export function StatCard({ icon, value, label, sub, accent }: StatCardProps) {
    return (
        <Card className="group transition-all duration-300 hover:border-neutral-700">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">{label}</p>
                    <p className={cn('mt-2 text-3xl font-semibold tracking-tight tabular-nums', accent ? 'text-red-400' : 'text-white')}>
                        {value}
                    </p>
                    {sub && <p className="mt-1 text-xs text-neutral-600">{sub}</p>}
                </div>
                <div
                    className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors',
                        accent
                            ? 'border-red-500/20 bg-red-500/10 text-red-400'
                            : 'border-neutral-800 bg-neutral-900 text-neutral-400 group-hover:text-neutral-200'
                    )}
                >
                    {icon}
                </div>
            </div>
        </Card>
    );
}
