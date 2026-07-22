'use client';

import { useState } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import CategoryItem from './CategoryItem';
import type { Category } from '@/lib/hooks/use-categories';
import type { Project } from '@/lib/hooks/use-projects';

interface ContextualPanelProps {
  categories: Category[];
  projects: Project[];
  activeCategoryId: string | null;
  activeProjectId: string | null;
  onSelectCategory: (category: Category) => void;
  onSelectProject: (project: Project) => void;
  onCreateCategory: (name: string) => void;
  onRenameCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onCreateProject: (categoryId: string, name: string, viewType: 'list' | 'kanban') => void;
  onRenameProject: (id: string, name: string) => void;
  onDeleteProject: (id: string) => void;
}

export default function ContextualPanel({
  categories,
  projects,
  activeCategoryId,
  activeProjectId,
  onSelectCategory,
  onSelectProject,
  onCreateCategory,
  onRenameCategory,
  onDeleteCategory,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: ContextualPanelProps) {
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
    <aside className="flex h-full w-64 flex-col border-r border-cloud bg-white">
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b border-cloud px-4">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-signal-teal" strokeWidth={1.5} />
          <span className="text-display-sm text-graphite">Tasks</span>
        </div>
        <button
          onClick={() => setShowNewCategory(true)}
          className="flex h-7 w-7 items-center justify-center rounded-sm text-[#8B929A] transition-colors hover:bg-mist hover:text-signal-teal"
          title="Tambah category"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Category list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {/* New category form */}
        {showNewCategory && (
          <div className="mb-2 rounded-sm border border-cloud bg-mist p-2">
            <input
              autoFocus
              placeholder="Nama category"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateCategory();
                if (e.key === 'Escape') {
                  setNewCategoryName('');
                  setShowNewCategory(false);
                }
              }}
              className="mb-2 w-full rounded-sm border border-cloud bg-white px-2 py-1.5 text-body-sm text-graphite outline-none transition-colors focus:border-signal-teal"
            />
            <div className="flex gap-1">
              <button
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim()}
                className="flex-1 rounded-sm bg-signal-teal px-2 py-1 text-body-sm font-medium text-white transition-colors hover:bg-signal-teal-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buat
              </button>
              <button
                onClick={() => {
                  setNewCategoryName('');
                  setShowNewCategory(false);
                }}
                className="flex-1 rounded-sm border border-cloud bg-white px-2 py-1 text-body-sm font-medium text-[#6B7280] transition-colors hover:bg-mist"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Category items */}
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            projects={projects}
            isActive={activeCategoryId === category.id}
            activeProjectId={activeProjectId}
            onSelectCategory={onSelectCategory}
            onSelectProject={onSelectProject}
            onRenameCategory={onRenameCategory}
            onDeleteCategory={onDeleteCategory}
            onCreateProject={onCreateProject}
            onRenameProject={onRenameProject}
            onDeleteProject={onDeleteProject}
          />
        ))}

        {/* Empty state */}
        {categories.length === 0 && !showNewCategory && (
          <div className="flex flex-col items-center px-4 py-8 text-center">
            <FolderOpen className="mb-2 h-8 w-8 text-[#C4C9CE]" strokeWidth={1.5} />
            <p className="text-body-sm font-medium text-graphite">
              Belum ada category
            </p>
            <p className="mt-1 text-body-sm text-[#6B7280]">
              Buat yang pertama untuk mulai mengatur task.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
