'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import EmptyState from '@/components/EmptyState';
import CategoryView from '@/components/CategoryView';
import ListView from '@/components/tasks/ListView';
import KanbanView from '@/components/tasks/KanbanView';
import { CheckSquare } from 'lucide-react';
import { useCategories } from '@/lib/hooks/use-categories';
import { useProjects } from '@/lib/hooks/use-projects';
import { useTasks } from '@/lib/hooks/use-tasks';

function TasksPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { categories } = useCategories();
  const { projects } = useProjects();

  const projectId = searchParams.get('project');
  const categoryId = searchParams.get('category');

  const currentProject = projectId
    ? projects.find((p) => p.id === projectId) ?? null
    : null;

  const currentCategory = categoryId
    ? categories.find((c) => c.id === categoryId) ?? null
    : null;

  const {
    tasks,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
  } = useTasks(currentProject?.id ?? null);

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
        onSelectProject={(project) => router.push(`/tasks?project=${project.id}`)}
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

export default function TasksPage() {
  return (
    <Suspense fallback={null}>
      <TasksPageContent />
    </Suspense>
  );
}
