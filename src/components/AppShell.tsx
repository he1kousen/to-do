'use client';

import { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import ModuleRail, { type ModuleId } from '@/components/sidebar/ModuleRail';
import ContextualPanel from '@/components/sidebar/ContextualPanel';
import { useIdeas } from '@/lib/hooks/use-ideas';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { ideas } = useIdeas();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [railExpanded, setRailExpanded] = useState(true);

  // Derive active module from pathname
  const activeModule: ModuleId = useMemo(() => {
    if (pathname.startsWith('/tasks')) return 'tasks';
    if (pathname.startsWith('/ideas')) return 'ideas';
    if (pathname.startsWith('/calendar')) return 'calendar';
    if (pathname.startsWith('/dashboard')) return 'dashboard';
    return 'tasks';
  }, [pathname]);

  const showContextualPanel = activeModule === 'tasks';
  const unrealizedIdeaCount = ideas.filter((i) => !i.is_realized).length;

  return (
    <div className="flex h-screen bg-(--color-bg)">
      {/* ── Desktop: Module Rail ── */}
      <div className="hidden md:flex">
        <ModuleRail
          activeModule={activeModule}
          isExpanded={railExpanded}
          onToggleExpand={() => setRailExpanded(!railExpanded)}
          ideaCount={unrealizedIdeaCount}
        />
      </div>

      {/* ── Desktop: Contextual Panel (Tasks only) ── */}
      {showContextualPanel && (
        <div className="hidden md:flex">
          <ContextualPanel />
        </div>
      )}

      {/* ── Mobile: Drawer overlay ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Mobile: Drawer ── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex transition-transform duration-200 md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <ModuleRail
          activeModule={activeModule}
          isExpanded={true}
          onToggleExpand={() => setMobileMenuOpen(false)}
          ideaCount={unrealizedIdeaCount}
        />
        {showContextualPanel && <ContextualPanel />}
      </div>

      {/* ── Main content ── */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-12 items-center border-b border-cloud bg-white px-4 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-sm text-graphite transition-colors hover:bg-mist"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <span className="ml-3 text-display-sm text-graphite capitalize">{activeModule}</span>
        </header>

        {/* Page content */}
        {children}
      </main>
    </div>
  );
}
