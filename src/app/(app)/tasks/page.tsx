'use client';

import { useState } from 'react';
import EmptyState from '@/components/EmptyState';
import CategoryView from '@/components/CategoryView';
import ListView from '@/components/tasks/ListView';
import KanbanView from '@/components/tasks/KanbanView';
import { CheckSquare } from 'lucide-react';
import { useCategories, type Category } from '@/lib/hooks/use-categories';
import { useProjects, type Project } from '@/lib/hooks/use-projects';
import { useTasks } from '@/lib/hooks/use-tasks';

export default function TasksPage() {
  const { categories } = useCategories();
  const { projects } = useProjects();
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const {
    tasks,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
  } = useTasks(activeProject?.id ?? null);

  const currentProject = activeProject
    ? projects.find((p) => p.id === activeProject.id) ?? activeProject
    : null;

  const currentCategory = activeCategory
    ? categories.find((c) => c.id === activeCategory.id) ?? activeCategory
    : null;

  const handleSelectProject = (project: Project) => {
    setActiveProject(project);
    setActiveCategory(null);
  };

  if (currentProject) {
    return (
      <>
        {/* Project header (desktop) */}
        <header className="hidden h-12 items-center justify-between border-b border-cloud bg-white px-6 md:flex">
          <div>
            <h2 className="text-display-sm text-graphite">{currentProject.name}</h2>
            <p className="text-mono-sm text-[#8B929A]">
              {currentProject.view_type === 'list' ? 'List view' : 'Kanban board'}
            </p>
          </div>
        </header>

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
    );
  }

  if (currentCategory) {
    return (
      <CategoryView
        category={currentCategory}
        projects={projects}
        tasks={tasks}
        onSelectProject={handleSelectProject}
        onCreateProject={() => {}}
      />
    );
  }

  return (
    <EmptyState
      icon={CheckSquare}
      title="Pilih project"
      description="Pilih project dari panel kiri untuk melihat dan mengelola task."
    />
  );
}
