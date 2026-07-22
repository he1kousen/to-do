'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import EmptyState from '@/components/EmptyState';
import CategoryView from '@/components/CategoryView';
import IdeasPage from '@/components/ideas/IdeasPage';
import ListView from '@/components/tasks/ListView';
import KanbanView from '@/components/tasks/KanbanView';
import { useCategories, type Category } from '@/lib/hooks/use-categories';
import { useProjects, type Project } from '@/lib/hooks/use-projects';
import { useTasks } from '@/lib/hooks/use-tasks';

type View = 'home' | 'ideas';

export default function AppShell() {
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { projects, createProject, updateProject, deleteProject } = useProjects();
  const [activeView, setActiveView] = useState<View>('home');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
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

  // Get the latest version of activeCategory
  const currentCategory = activeCategory
    ? categories.find((c) => c.id === activeCategory.id) ?? activeCategory
    : null;

  const handleSelectCategory = (category: Category) => {
    setActiveCategory(category);
    setActiveProject(null);
    setActiveView('home');
  };

  const handleSelectProject = (project: Project) => {
    setActiveProject(project);
    setActiveCategory(null);
    setActiveView('home');
  };

  const handleSelectIdeas = () => {
    setActiveView('ideas');
    setActiveCategory(null);
    setActiveProject(null);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        categories={categories}
        projects={projects}
        activeCategoryId={activeView === 'home' ? currentCategory?.id ?? null : null}
        activeProjectId={activeView === 'home' ? currentProject?.id ?? null : null}
        isIdeasActive={activeView === 'ideas'}
        onSelectCategory={handleSelectCategory}
        onSelectProject={handleSelectProject}
        onSelectIdeas={handleSelectIdeas}
        onCreateCategory={createCategory}
        onRenameCategory={updateCategory}
        onDeleteCategory={(id) => {
          deleteCategory(id);
          if (activeCategory?.id === id) {
            setActiveCategory(null);
          }
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
        {activeView === 'ideas' ? (
          <IdeasPage />
        ) : currentProject ? (
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
            icon="📋"
            title="Select a project"
            description="Choose a project from the sidebar to view and manage your tasks."
          />
        )}
      </main>
    </div>
  );
}
