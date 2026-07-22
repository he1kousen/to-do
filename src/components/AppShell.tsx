'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import EmptyState from '@/components/EmptyState';
import ListView from '@/components/tasks/ListView';
import KanbanView from '@/components/tasks/KanbanView';
import { useCategories } from '@/lib/hooks/use-categories';
import { useProjects, type Project } from '@/lib/hooks/use-projects';
import { useTasks } from '@/lib/hooks/use-tasks';

export default function AppShell() {
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { projects, createProject, updateProject, deleteProject } = useProjects();
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const {
    tasks,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
  } = useTasks(activeProject?.id ?? null);

  // Get the latest version of activeProject from the projects list
  const currentProject = activeProject
    ? projects.find((p) => p.id === activeProject.id) ?? activeProject
    : null;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        categories={categories}
        projects={projects}
        activeProjectId={currentProject?.id ?? null}
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
        {currentProject ? (
          <>
            {/* Project header */}
            <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {currentProject.view_type === 'list' ? '☑' : '▦'}
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">{currentProject.name}</h2>
                  <p className="text-xs text-slate-500">
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
