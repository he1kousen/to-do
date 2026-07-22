'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FolderOpen,
  Plus,
  ChevronRight,
  CheckSquare,
  LayoutGrid,
  Pencil,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAppContext } from '@/lib/contexts/AppContext';
import type { Project } from '@/lib/hooks/use-projects';

export default function ContextualPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get('project');
  const selectedCategoryId = searchParams.get('category');

  const { categories, createCategory, updateCategory, deleteCategory, projects, createProject, updateProject, deleteProject } = useAppContext();

  // UI state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Project form state
  const [projectFormCategoryId, setProjectFormCategoryId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectType, setNewProjectType] = useState<'list' | 'kanban'>('list');

  // Project edit state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Delete confirm
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);

  // Group projects by category
  const projectsByCategory = useMemo(() => {
    const map = new Map<string, Project[]>();
    for (const project of projects) {
      const list = map.get(project.category_id) ?? [];
      list.push(project);
      map.set(project.category_id, list);
    }
    return map;
  }, [projects]);

  // Auto-expand selected category (derived during render)
  const effectiveExpanded = useMemo(() => {
    const expanded = new Set(expandedCategories);
    if (selectedCategoryId) expanded.add(selectedCategoryId);
    if (selectedProjectId) {
      const project = projects.find((p) => p.id === selectedProjectId);
      if (project) expanded.add(project.category_id);
    }
    return expanded;
  }, [expandedCategories, selectedCategoryId, selectedProjectId, projects]);

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const navigateToProject = (project: Project) => {
    router.push(`/tasks?project=${project.id}`);
  };

  const navigateToCategory = (categoryId: string) => {
    router.push(`/tasks?category=${categoryId}`);
  };

  // Category CRUD
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    await createCategory(newCategoryName.trim());
    setNewCategoryName('');
    setShowNewCategory(false);
  };

  const handleRenameCategory = async () => {
    if (!editingCategoryId || !editingCategoryName.trim()) return;
    await updateCategory(editingCategoryId, editingCategoryName.trim());
    setEditingCategoryId(null);
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return;
    await deleteCategory(deleteCategoryId);
    if (selectedCategoryId === deleteCategoryId || selectedProjectId) {
      const project = projects.find((p) => p.id === selectedProjectId);
      if (project?.category_id === deleteCategoryId) {
        router.push('/tasks');
      }
    }
    setDeleteCategoryId(null);
  };

  // Project CRUD
  const handleCreateProject = async () => {
    if (!projectFormCategoryId || !newProjectName.trim()) return;
    const result = await createProject(projectFormCategoryId, newProjectName.trim(), newProjectType);
    if (result) {
      router.push(`/tasks?project=${result.id}`);
    }
    setNewProjectName('');
    setProjectFormCategoryId(null);
  };

  const handleRenameProject = async () => {
    if (!editingProjectId || !editingProjectName.trim()) return;
    await updateProject(editingProjectId, { name: editingProjectName.trim() });
    setEditingProjectId(null);
  };

  const handleDeleteProject = async () => {
    if (!deleteProjectId) return;
    await deleteProject(deleteProjectId);
    if (selectedProjectId === deleteProjectId) {
      router.push('/tasks');
    }
    setDeleteProjectId(null);
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

        {/* Categories */}
        {categories.map((category) => {
          const isExpanded = effectiveExpanded.has(category.id);
          const isCategoryActive = selectedCategoryId === category.id;
          const categoryProjects = projectsByCategory.get(category.id) ?? [];

          return (
            <div key={category.id} className="mb-0.5">
              {/* Category header */}
              <div
                className={`group flex items-center gap-1 rounded-sm px-2 py-1.5 transition-colors ${
                  isCategoryActive ? 'bg-signal-teal/10' : 'hover:bg-mist'
                }`}
              >
                <button
                  onClick={() => toggleExpand(category.id)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-[#8B929A] transition-colors hover:text-graphite"
                >
                  <ChevronRight
                    className={`h-3.5 w-3.5 transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}
                    strokeWidth={2}
                  />
                </button>

                <div
                  onClick={() => navigateToCategory(category.id)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2"
                >
                  <FolderOpen
                    className={`h-4 w-4 shrink-0 ${isCategoryActive ? 'text-signal-teal' : 'text-[#8B929A]'}`}
                    strokeWidth={1.5}
                  />
                  {editingCategoryId === category.id ? (
                    <input
                      autoFocus
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      onBlur={handleRenameCategory}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameCategory();
                        if (e.key === 'Escape') setEditingCategoryId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-transparent text-body-sm font-medium text-graphite outline-none"
                    />
                  ) : (
                    <span
                      className={`truncate text-body-sm font-medium ${
                        isCategoryActive ? 'text-signal-teal' : 'text-graphite'
                      }`}
                    >
                      {category.name}
                    </span>
                  )}
                </div>

                {/* Category actions */}
                <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => setProjectFormCategoryId(category.id)}
                    className="flex h-5 w-5 items-center justify-center rounded-sm text-[#8B929A] transition-colors hover:bg-cloud hover:text-graphite"
                    title="Tambah project"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingCategoryId(category.id);
                      setEditingCategoryName(category.name);
                    }}
                    className="flex h-5 w-5 items-center justify-center rounded-sm text-[#8B929A] transition-colors hover:bg-cloud hover:text-graphite"
                    title="Rename"
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => setDeleteCategoryId(category.id)}
                    className="flex h-5 w-5 items-center justify-center rounded-sm text-[#8B929A] transition-colors hover:bg-red-50 hover:text-danger"
                    title="Hapus"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="ml-4 mt-0.5 border-l border-cloud pl-2">
                  {/* New project form */}
                  {projectFormCategoryId === category.id && (
                    <div className="mb-1 rounded-sm border border-cloud bg-mist p-2">
                      <input
                        autoFocus
                        placeholder="Nama project"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateProject();
                          if (e.key === 'Escape') setProjectFormCategoryId(null);
                        }}
                        className="mb-2 w-full rounded-sm border border-cloud bg-white px-2 py-1.5 text-body-sm text-graphite outline-none transition-colors focus:border-signal-teal"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => setNewProjectType('list')}
                          className={`flex flex-1 items-center justify-center gap-1 rounded-sm px-2 py-1 text-body-sm font-medium transition-colors ${
                            newProjectType === 'list'
                              ? 'bg-signal-teal text-white'
                              : 'border border-cloud bg-white text-[#6B7280] hover:bg-mist'
                          }`}
                        >
                          <CheckSquare className="h-3 w-3" strokeWidth={2} />
                          List
                        </button>
                        <button
                          onClick={() => setNewProjectType('kanban')}
                          className={`flex flex-1 items-center justify-center gap-1 rounded-sm px-2 py-1 text-body-sm font-medium transition-colors ${
                            newProjectType === 'kanban'
                              ? 'bg-signal-teal text-white'
                              : 'border border-cloud bg-white text-[#6B7280] hover:bg-mist'
                          }`}
                        >
                          <LayoutGrid className="h-3 w-3" strokeWidth={2} />
                          Kanban
                        </button>
                      </div>
                      <div className="mt-2 flex gap-1">
                        <button
                          onClick={handleCreateProject}
                          disabled={!newProjectName.trim()}
                          className="flex-1 rounded-sm bg-signal-teal px-2 py-1 text-body-sm font-medium text-white transition-colors hover:bg-signal-teal-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Buat
                        </button>
                        <button
                          onClick={() => setProjectFormCategoryId(null)}
                          className="flex-1 rounded-sm border border-cloud bg-white px-2 py-1 text-body-sm font-medium text-[#6B7280] transition-colors hover:bg-mist"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Project list */}
                  {categoryProjects.map((project) => {
                    const isProjectActive = selectedProjectId === project.id;

                    return (
                      <div
                        key={project.id}
                        className={`group relative flex items-center gap-2 rounded-sm px-2 py-1.5 transition-colors ${
                          isProjectActive
                            ? 'bg-signal-teal/10 text-signal-teal'
                            : 'text-[#6B7280] hover:bg-mist hover:text-graphite'
                        }`}
                      >
                        {/* Active indicator */}
                        {isProjectActive && (
                          <div className="absolute -left-2 top-1/2 h-4 w-0.75 -translate-y-1/2 rounded-r-full bg-signal-teal" />
                        )}

                        <div
                          onClick={() => navigateToProject(project)}
                          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2"
                        >
                          {project.view_type === 'list' ? (
                            <CheckSquare className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                          ) : (
                            <LayoutGrid className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                          )}
                          {editingProjectId === project.id ? (
                            <input
                              autoFocus
                              value={editingProjectName}
                              onChange={(e) => setEditingProjectName(e.target.value)}
                              onBlur={handleRenameProject}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameProject();
                                if (e.key === 'Escape') setEditingProjectId(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 bg-transparent text-body-sm outline-none"
                            />
                          ) : (
                            <span className="truncate text-body-sm">{project.name}</span>
                          )}
                        </div>

                        {/* Project actions */}
                        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === project.id ? null : project.id);
                            }}
                            className="flex h-5 w-5 items-center justify-center rounded-sm transition-colors hover:bg-cloud"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={2} />
                          </button>
                        </div>

                        {/* Context menu */}
                        {openMenuId === project.id && (
                          <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-sm border border-cloud bg-white py-1 shadow-modal">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingProjectId(project.id);
                                setEditingProjectName(project.name);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-body-sm text-graphite transition-colors hover:bg-mist"
                            >
                              <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                              Rename
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteProjectId(project.id);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-body-sm text-danger transition-colors hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                              Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {categoryProjects.length === 0 && projectFormCategoryId !== category.id && (
                    <p className="px-2 py-1 text-body-sm text-[#8B929A]">Belum ada project</p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {categories.length === 0 && !showNewCategory && (
          <div className="flex flex-col items-center px-4 py-8 text-center">
            <FolderOpen className="mb-2 h-8 w-8 text-[#C4C9CE]" strokeWidth={1.5} />
            <p className="text-body-sm font-medium text-graphite">Belum ada category</p>
            <p className="mt-1 text-body-sm text-[#6B7280]">Buat yang pertama untuk mulai.</p>
          </div>
        )}
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        isOpen={deleteCategoryId !== null}
        onClose={() => setDeleteCategoryId(null)}
        onConfirm={handleDeleteCategory}
        title="Hapus category"
        message={`Yakin ingin menghapus "${categories.find((c) => c.id === deleteCategoryId)?.name}"? Semua project dan task di dalamnya juga akan dihapus.`}
      />

      <ConfirmDialog
        isOpen={deleteProjectId !== null}
        onClose={() => setDeleteProjectId(null)}
        onConfirm={handleDeleteProject}
        title="Hapus project"
        message={`Yakin ingin menghapus "${projects.find((p) => p.id === deleteProjectId)?.name}"? Semua task di dalamnya juga akan dihapus.`}
      />
    </aside>
  );
}
