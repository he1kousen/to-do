'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import EmptyState from '@/components/EmptyState';
import { useCategories } from '@/lib/hooks/use-categories';
import { useProjects, type Project } from '@/lib/hooks/use-projects';

export default function AppShell() {
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { projects, createProject, updateProject, deleteProject } = useProjects();
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        categories={categories}
        projects={projects}
        activeProjectId={activeProject?.id ?? null}
        onSelectProject={setActiveProject}
        onCreateCategory={createCategory}
        onRenameCategory={updateCategory}
        onDeleteCategory={(id) => {
          deleteCategory(id);
          if (activeProject && categories.find((c) => c.id === id)) {
            setActiveProject(null);
          }
        }}
        onCreateProject={createProject}
        onRenameProject={(id, name) => updateProject(id, { name })}
        onDeleteProject={(id) => {
          deleteProject(id);
          if (activeProject?.id === id) {
            setActiveProject(null);
          }
        }}
      />

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {activeProject ? (
          <>
            {/* Project header */}
            <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {activeProject.view_type === 'list' ? '☑' : '▦'}
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">{activeProject.name}</h2>
                  <p className="text-xs text-slate-500">
                    {activeProject.view_type === 'list' ? 'List view' : 'Kanban board'}
                  </p>
                </div>
              </div>
            </header>

            {/* Task content - placeholder for Phase 3.2/3.3 */}
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                icon={activeProject.view_type === 'list' ? '☑' : '▦'}
                title={`${activeProject.name}`}
                description={`This project uses ${activeProject.view_type} view. Task management will be implemented in the next phase.`}
              />
            </div>
          </>
        ) : (
          <EmptyState
            icon="📋"
            title="Select a project"
            description="Choose a project from the sidebar to view and manage your tasks."
          />
        )}
      </main>
    </div>
  );
}
