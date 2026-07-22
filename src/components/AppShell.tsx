'use client';

import { useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Menu } from 'lucide-react';
import ModuleRail, { type ModuleId } from '@/components/sidebar/ModuleRail';
import ContextualPanel from '@/components/sidebar/ContextualPanel';
import { useCategories, type Category } from '@/lib/hooks/use-categories';
import { useProjects, type Project } from '@/lib/hooks/use-projects';
import { useIdeas } from '@/lib/hooks/use-ideas';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { projects, createProject, updateProject, deleteProject } = useProjects();
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

  // Selection lives in URL so AppShell sidebar + TasksPage stay in sync
  const activeProjectId = searchParams.get('project');
  const activeCategoryId = searchParams.get('category');

  const currentProject = activeProjectId
    ? projects.find((p) => p.id === activeProjectId) ?? null
    : null;

  const currentCategory = activeCategoryId
    ? categories.find((c) => c.id === activeCategoryId) ?? null
    : null;

  const openTaskCount = 0; // Tasks are now managed per-page
  const unrealizedIdeaCount = ideas.filter((i) => !i.is_realized).length;

  const handleSelectCategory = (category: Category) => {
    router.push(`/tasks?category=${category.id}`);
    setMobileMenuOpen(false);
  };

  const handleSelectProject = (project: Project) => {
    router.push(`/tasks?project=${project.id}`);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-(--color-bg)">
      {/* ── Desktop: Module Rail ── */}
      <div className="hidden md:flex">
        <ModuleRail
          activeModule={activeModule}
          isExpanded={railExpanded}
          onToggleExpand={() => setRailExpanded(!railExpanded)}
          taskCount={openTaskCount}
          ideaCount={unrealizedIdeaCount}
        />
      </div>

      {/* ── Desktop: Contextual Panel (Tasks only) ── */}
      {showContextualPanel && (
        <div className="hidden md:flex">
          <ContextualPanel
            categories={categories}
            projects={projects}
            activeCategoryId={currentCategory?.id ?? null}
            activeProjectId={currentProject?.id ?? null}
            onSelectCategory={handleSelectCategory}
            onSelectProject={handleSelectProject}
            onCreateCategory={createCategory}
            onRenameCategory={updateCategory}
            onDeleteCategory={(id) => {
              deleteCategory(id);
              if (activeCategoryId === id || (currentProject && currentProject.category_id === id)) {
                router.push('/tasks');
              }
            }}
            onCreateProject={createProject}
            onRenameProject={(id, name) => updateProject(id, { name })}
            onDeleteProject={(id) => {
              deleteProject(id);
              if (activeProjectId === id) router.push('/tasks');
            }}
          />
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
          taskCount={openTaskCount}
          ideaCount={unrealizedIdeaCount}
        />
        {showContextualPanel && (
          <ContextualPanel
            categories={categories}
            projects={projects}
            activeCategoryId={currentCategory?.id ?? null}
            activeProjectId={currentProject?.id ?? null}
            onSelectCategory={handleSelectCategory}
            onSelectProject={handleSelectProject}
            onCreateCategory={createCategory}
            onRenameCategory={updateCategory}
            onDeleteCategory={(id) => {
              deleteCategory(id);
              if (activeCategoryId === id || (currentProject && currentProject.category_id === id)) {
                router.push('/tasks');
              }
            }}
            onCreateProject={createProject}
            onRenameProject={(id, name) => updateProject(id, { name })}
            onDeleteProject={(id) => {
              deleteProject(id);
              if (activeProjectId === id) router.push('/tasks');
            }}
          />
        )}
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
