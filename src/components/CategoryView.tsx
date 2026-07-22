'use client';

import type { Category } from '@/lib/hooks/use-categories';
import type { Project } from '@/lib/hooks/use-projects';
import type { Task } from '@/lib/hooks/use-tasks';

interface CategoryViewProps {
  category: Category;
  projects: Project[];
  tasks: Task[];
  onSelectProject: (project: Project) => void;
  onCreateProject: () => void;
}

export default function CategoryView({
  category,
  projects,
  tasks,
  onSelectProject,
  onCreateProject,
}: CategoryViewProps) {
  const categoryProjects = projects.filter((p) => p.category_id === category.id);

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.project_id === projectId);
    const done = projectTasks.filter((t) => t.status === 'done').length;
    return { total: projectTasks.length, done };
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📁</span>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{category.name}</h1>
            <p className="text-sm text-slate-500">
              {categoryProjects.length} project{categoryProjects.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Project grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categoryProjects.map((project) => {
          const stats = getProjectStats(project.id);
          const progress = stats.total > 0 ? (stats.done / stats.total) * 100 : 0;

          return (
            <button
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
            >
              {/* Icon + Type */}
              <div className="mb-3 flex items-center justify-between">
                <span className="text-2xl">
                  {project.view_type === 'list' ? '☑' : '▦'}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  {project.view_type === 'list' ? 'List' : 'Kanban'}
                </span>
              </div>

              {/* Name */}
              <h3 className="mb-2 text-sm font-semibold text-slate-900 group-hover:text-indigo-600">
                {project.name}
              </h3>

              {/* Progress */}
              <div className="mt-auto">
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{stats.done}/{stats.total} done</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}

        {/* Add project card */}
        <button
          onClick={onCreateProject}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-4 text-slate-400 transition-all hover:border-indigo-300 hover:text-indigo-500"
        >
          <svg className="mb-2 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm font-medium">Add project</span>
        </button>
      </div>

      {/* Empty state */}
      {categoryProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <span className="mb-3 text-4xl">📂</span>
          <h3 className="mb-1 text-sm font-semibold text-slate-700">No projects yet</h3>
          <p className="text-sm text-slate-500">Create your first project in this category.</p>
        </div>
      )}
    </div>
  );
}
