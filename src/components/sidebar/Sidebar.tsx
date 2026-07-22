'use client';

import { useState } from 'react';
import CategoryItem from './CategoryItem';
import type { Category } from '@/lib/hooks/use-categories';
import type { Project } from '@/lib/hooks/use-projects';

interface SidebarProps {
  categories: Category[];
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (project: Project) => void;
  onCreateCategory: (name: string) => void;
  onRenameCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onCreateProject: (categoryId: string, name: string, viewType: 'list' | 'kanban') => void;
  onRenameProject: (id: string, name: string) => void;
  onDeleteProject: (id: string) => void;
}

export default function Sidebar({
  categories,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateCategory,
  onRenameCategory,
  onDeleteCategory,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: SidebarProps) {
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      onCreateCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowNewCategory(false);
    }
  };

  return (
    <aside className="flex h-full w-72 flex-col bg-slate-900 text-slate-300">
      {/* Header */}
      <div className="flex h-14 items-center gap-3 border-b border-white/10 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h1 className="text-sm font-bold tracking-tight text-white">To-Do List</h1>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Categories
          </span>
          <button
            onClick={() => setShowNewCategory(true)}
            className="flex h-5 w-5 items-center justify-center rounded text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-300"
            title="Add category"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* New category form */}
        {showNewCategory && (
          <div className="mb-2 rounded-lg bg-white/5 p-2">
            <input
              autoFocus
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateCategory();
                if (e.key === 'Escape') {
                  setNewCategoryName('');
                  setShowNewCategory(false);
                }
              }}
              className="mb-2 w-full rounded bg-transparent px-2 py-1 text-sm text-slate-200 outline-none ring-1 ring-white/20 focus:ring-indigo-500"
            />
            <div className="flex gap-1">
              <button
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim()}
                className="flex-1 rounded bg-indigo-500 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setNewCategoryName('');
                  setShowNewCategory(false);
                }}
                className="flex-1 rounded bg-white/5 px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Category list */}
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={onSelectProject}
            onRenameCategory={onRenameCategory}
            onDeleteCategory={onDeleteCategory}
            onCreateProject={onCreateProject}
            onRenameProject={onRenameProject}
            onDeleteProject={onDeleteProject}
          />
        ))}

        {categories.length === 0 && !showNewCategory && (
          <p className="px-2 py-4 text-center text-sm text-slate-500">
            No categories yet. Create one to get started.
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-4 py-3">
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
