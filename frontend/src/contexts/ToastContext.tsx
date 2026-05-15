import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { cn } from '../lib/cn';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const toastStyles: Record<ToastType, string> = {
    success: 'border-neutral-700 bg-neutral-900 text-neutral-200',
    error: 'border-red-500/30 bg-neutral-950 text-red-400',
    info: 'border-neutral-800 bg-neutral-900 text-neutral-400',
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 left-4 right-4 z-[100] flex flex-col gap-2 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm pb-[env(safe-area-inset-bottom)]">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={cn(
                            'flex items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-xl',
                            'animate-in slide-in-from-right-4 fade-in duration-300',
                            toastStyles[t.type]
                        )}
                        role="status"
                    >
                        <span
                            className={cn(
                                'h-1.5 w-1.5 shrink-0 rounded-full',
                                t.type === 'error' ? 'bg-red-500' : t.type === 'success' ? 'bg-white' : 'bg-neutral-500'
                            )}
                        />
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside ToastProvider');
    return ctx;
}
