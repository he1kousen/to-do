'use client';

import { useState } from 'react';
import { Menu, CheckSquare, LayoutDashboard, Calendar as CalendarIcon } from 'lucide-react';
import ModuleRail, { type ModuleId } from '@/components/sidebar/ModuleRail';
import ContextualPanel from '@/components/sidebar/ContextualPanel';
import EmptyState from '@/components/EmptyState';
import CategoryView from '@/components/CategoryView';
import IdeasPage from '@/components/ideas/IdeasPage';
import ListView from '@/components/tasks/ListView';
import KanbanView from '@/components/tasks/KanbanView';
import { useCategories, type Category } from '@/lib/hooks/use-categories';
import { useProjects, type Project } from '@/lib/hooks/use-projects';
import { useTasks } from '@/lib/hooks/use-tasks';
import { useIdeas } from '@/lib/hooks/use-ideas';

export default function AppShell() {
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { projects, createProject, updateProject, deleteProject } = useProjects();
  const { ideas } = useIdeas();
  const [activeModule, setActiveModule] = useState<ModuleId>('tasks');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [railExpanded, setRailExpanded] = useState(true);

  const {
    tasks,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
  } = useTasks(activeProject?.id ?? null);

  // Derived state
  const currentProject = activeProject
    ? projects.find((p) => p.id === activeProject.id) ?? activeProject
    : null;

  const currentCategory = activeCategory
    ? categories.find((c) => c.id === activeCategory.id) ?? activeCategory
    : null;

  const openTaskCount = tasks.filter((t) => t.status !== 'done').length;
  const unrealizedIdeaCount = ideas.filter((i) => !i.is_realized).length;

  // Handlers
  const handleSelectModule = (id: ModuleId) => {
    setActiveModule(id);
    if (id !== 'tasks') {
      setActiveCategory(null);
      setActiveProject(null);
    }
    setMobileMenuOpen(false);
  };

  const handleSelectCategory = (category: Category) => {
    setActiveCategory(category);
    setActiveProject(null);
  };

  const handleSelectProject = (project: Project) => {
    setActiveProject(project);
    setActiveCategory(null);
  };

  const showContextualPanel = activeModule === 'tasks';

  return (
    <div className="flex h-screen bg-(--color-bg)">
      {/* ── Desktop: Module Rail (always visible) ── */}
      <div className="hidden md:flex">
        <ModuleRail
          activeModule={activeModule}
          onSelectModule={handleSelectModule}
          isExpanded={railExpanded}
          onToggleExpand={() => setRailExpanded(!railExpanded)}
          taskCount={openTaskCount}
          ideaCount={unrealizedIdeaCount}
        />
      </div>

      {/* ── Desktop: Contextual Panel (only for Tasks module) ── */}
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
              if (activeCategory?.id === id) setActiveCategory(null);
              if (activeProject && categories.find((c) => c.id === id)) setActiveProject(null);
            }}
            onCreateProject={createProject}
            onRenameProject={(id, name) => updateProject(id, { name })}
            onDeleteProject={(id) => {
              deleteProject(id);
              if (activeProject?.id === id) setActiveProject(null);
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
          onSelectModule={handleSelectModule}
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
              if (activeCategory?.id === id) setActiveCategory(null);
              if (activeProject && categories.find((c) => c.id === id)) setActiveProject(null);
            }}
            onCreateProject={createProject}
            onRenameProject={(id, name) => updateProject(id, { name })}
            onDeleteProject={(id) => {
              deleteProject(id);
              if (activeProject?.id === id) setActiveProject(null);
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
          <span className="ml-3 text-display-sm text-graphite">
            {activeModule === 'tasks' && currentProject
              ? currentProject.name
              : activeModule === 'tasks' && currentCategory
                ? currentCategory.name
                : activeModule === 'tasks'
                  ? 'Tasks'
                  : activeModule === 'ideas'
                    ? 'Ideas'
                    : activeModule === 'calendar'
                      ? 'Calendar'
                      : 'Dashboard'}
          </span>
        </header>

        {/* Content */}
        {activeModule === 'ideas' ? (
          <IdeasPage />
        ) : activeModule === 'calendar' ? (
          <EmptyState
            icon={CalendarIcon}
            title="Kalender"
            description="Integrasi Google Calendar akan tersedia segera."
          />
        ) : activeModule === 'dashboard' ? (
          <EmptyState
            icon={LayoutDashboard}
            title="Dashboard"
            description="Ringkasan dari semua module akan tersedia segera."
          />
        ) : currentProject ? (
          <>
            {/* Project header (desktop only) */}
            <header className="hidden h-12 items-center justify-between border-b border-cloud bg-white px-6 md:flex">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-display-sm text-graphite">{currentProject.name}</h2>
                  <p className="text-mono-sm text-[#8B929A]">
                    {currentProject.view_type === 'list' ? 'List view' : 'Kanban board'}
                  </p>
                </div>
              </div>
            </header>

            {/* Task content */}
            <div className="flex-1 overflow-auto">
              {currentProject.view_type === 'list' ? (
                <ListView
                  tasks={tasks}
                  onCreateTask={createTask}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  onReorderTasks={reorderTasks}
                />
              ) : (
                <KanbanView
                  tasks={tasks}
                  onCreateTask={createTask}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  onReorderTasks={reorderTasks}
                />
              )}
            </div>
          </>
        ) : currentCategory ? (
          <CategoryView
            category={currentCategory}
            projects={projects}
            tasks={tasks}
            onSelectProject={handleSelectProject}
            onCreateProject={() => {}}
          />
        ) : (
          <EmptyState
            icon={CheckSquare}
            title="Pilih project"
            description="Pilih project dari panel kiri untuk melihat dan mengelola task."
          />
        )}
      </main>
    </div>
  );
}
