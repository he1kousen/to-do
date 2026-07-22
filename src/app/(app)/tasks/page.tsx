'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import EmptyState from '@/components/EmptyState';
import CategoryView from '@/components/CategoryView';
import ListView from '@/components/tasks/ListView';
import KanbanView from '@/components/tasks/KanbanView';
import { CheckSquare } from 'lucide-react';
import { useCategories } from '@/lib/hooks/use-categories';
import { useProjects, type Project } from '@/lib/hooks/use-projects';
import { useTasks } from '@/lib/hooks/use-tasks';

export default function TasksPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { categories } = useCategories();
  const { projects } = useProjects();

  const selectedProjectId = searchParams.get('project');
  const selectedCategoryId = searchParams.get('category');

  const activeProject = useMemo(
    () => (selectedProjectId ? projects.find((p) => p.id === selectedProjectId) ?? null : null),
    [selectedProjectId, projects]
  );

  const activeCategory = useMemo(
    () => (selectedCategoryId ? categories.find((c) => c.id === selectedCategoryId) ?? null : null),
    [selectedCategoryId, categories]
  );

  const {
    tasks,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
  } = useTasks(activeProject?.id ?? null);

  const handleSelectProject = useCallback(
    (project: Project) => {
      router.push(`/tasks?project=${project.id}`);
    },
    [router]
  );

  if (activeProject) {
    return (
      <>
        {/* Project header (desktop) */}
        <header className="hidden h-12 items-center justify-between border-b border-cloud bg-white px-6 md:flex">
          <div>
            <h2 className="text-display-sm text-graphite">{activeProject.name}</h2>
            <p className="text-mono-sm text-[#8B929A]">
              {activeProject.view_type === 'list' ? 'List view' : 'Kanban board'}
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {activeProject.view_type === 'list' ? (
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

  if (activeCategory) {
    return (
      <CategoryView
        category={activeCategory}
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
