import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
    return (
        <div className="flex min-h-screen min-h-[100dvh] flex-col bg-black lg:flex-row">
            <Sidebar />
            <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
                <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-8 lg:px-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
