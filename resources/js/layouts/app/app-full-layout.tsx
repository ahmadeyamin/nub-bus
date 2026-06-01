import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import type { AppLayoutProps } from '@/types';

/**
 * Full-width layout with no max-width or padding constraints.
 * Used for map-editor pages that need edge-to-edge content.
 */
export default function AppFullLayout({ children }: AppLayoutProps) {
    return (
        <AppShell variant="header">
            <AppHeader />
            <main className="flex flex-1 flex-col overflow-hidden w-full">
                {children}
            </main>
        </AppShell>
    );
}
