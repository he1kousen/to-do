'use client';

import { useState } from 'react';
import {
  ChevronRight,
  Folder,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  CheckSquare,
  LayoutGrid,
} from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { Category } from '@/lib/hooks/use-categories';
import type { Project } from '@/lib/hooks/use-projects';

interface CategoryItemProps {
  category: Category;
  projects: Project[];
  isActive: boolean;
  activeProjectId: string | null;
  onSelectCategory: (category: Category) => void;
  onSelectProject: (project: Project) => void;
  onRenameCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onCreateProject: (categoryId: string, name: string, viewType: 'list' | 'kanban') => void;
  onRenameProject: (id: string, name: string) => void;
  onDeleteProject: (id: string) => void;
}

export default function CategoryItem({
  category,
  projects,
  isActive,
  activeProjectId,
  onSelectCategory,
  onSelectProject,
  onRenameCategory,
  onDeleteCategory,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: CategoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectType, setNewProjectType] = useState<'list' | 'kanban'>('list');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState(false);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState<string | null>(null);

  const categoryProjects = projects.filter((p) => p.category_id === category.id);

  const handleRename = () => {
    if (editName.trim() && editName !== category.name) {
      onRenameCategory(category.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onCreateProject(category.id, newProjectName.trim(), newProjectType);
      setNewProjectName('');
      setShowProjectForm(false);
    }
  };

  const handleRenameProject = (projectId: string) => {
    if (editingProjectName.trim()) {
      onRenameProject(projectId, editingProjectName.trim());
    }
    setEditingProjectId(null);
  };

  return (
    <div className="mb-0.5">
      {/* Category header */}
      <div
        className={`group flex items-center gap-1 rounded-sm px-2 py-1.5 transition-colors ${
          isActive ? 'bg-signal-teal/10' : 'hover:bg-mist'
        }`}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[#8B929A] transition-colors hover:text-graphite"
        >
          <ChevronRight
            className={`h-3.5 w-3.5 transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}
            strokeWidth={2}
          />
        </button>

        <div
          onClick={() => onSelectCategory(category)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2"
        >
          <Folder
            className={`h-4 w-4 shrink-0 ${isActive ? 'text-signal-teal' : 'text-[#8B929A]'}`}
            strokeWidth={1.5}
          />
          {isEditing ? (
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') {
                  setEditName(category.name);
                  setIsEditing(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-transparent text-body-sm font-medium text-graphite outline-none"
            />
          ) : (
            <span
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditName(category.name);
                setIsEditing(true);
              }}
              className={`truncate text-body-sm font-medium ${
                isActive ? 'text-signal-teal' : 'text-graphite'
              }`}
            >
              {category.name}
            </span>
          )}
        </div>

        {/* Category actions */}
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => setShowProjectForm(true)}
            className="flex h-5 w-5 items-center justify-center rounded text-[#8B929A] transition-colors hover:bg-cloud hover:text-graphite"
            title="Tambah project"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <button
            onClick={() => {
              setEditName(category.name);
              setIsEditing(true);
            }}
            className="flex h-5 w-5 items-center justify-center rounded text-[#8B929A] transition-colors hover:bg-cloud hover:text-graphite"
            title="Rename"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setConfirmDeleteCategory(true)}
            className="flex h-5 w-5 items-center justify-center rounded text-[#8B929A] transition-colors hover:bg-red-50 hover:text-danger"
            title="Hapus"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Confirm delete category dialog */}
      <ConfirmDialog
        isOpen={confirmDeleteCategory}
        onClose={() => setConfirmDeleteCategory(false)}
        onConfirm={() => onDeleteCategory(category.id)}
        title="Hapus category"
        message={`Yakin ingin menghapus "${category.name}"? Semua project dan task di dalamnya juga akan dihapus.`}
      />

      {/* Expanded content */}
      {isExpanded && (
        <div className="ml-4 mt-0.5 border-l border-cloud pl-2">
          {/* New project form */}
          {showProjectForm && (
            <div className="mb-1 rounded-sm border border-cloud bg-mist p-2">
              <input
                autoFocus
                placeholder="Nama project"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateProject();
                  if (e.key === 'Escape') {
                    setNewProjectName('');
                    setShowProjectForm(false);
                  }
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
                  onClick={() => {
                    setNewProjectName('');
                    setShowProjectForm(false);
                  }}
                  className="flex-1 rounded-sm border border-cloud bg-white px-2 py-1 text-body-sm font-medium text-[#6B7280] transition-colors hover:bg-mist"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Project list */}
          {categoryProjects.map((project) => (
            <div
              key={project.id}
              className={`group relative flex items-center gap-2 rounded-sm px-2 py-1.5 transition-colors ${
                activeProjectId === project.id
                  ? 'bg-signal-teal/10 text-signal-teal'
                  : 'text-[#6B7280] hover:bg-mist hover:text-graphite'
              }`}
            >
              {/* Active indicator */}
              {activeProjectId === project.id && (
                <div className="absolute -left-2 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-signal-teal" />
              )}

              <button
                onClick={() => onSelectProject(project)}
                className="flex min-w-0 flex-1 items-center gap-2"
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
                    onBlur={() => handleRenameProject(project.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameProject(project.id);
                      if (e.key === 'Escape') setEditingProjectId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-transparent text-body-sm outline-none"
                  />
                ) : (
                  <span className="truncate text-body-sm">{project.name}</span>
                )}
              </button>

              {/* Project actions */}
              <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === project.id ? null : project.id);
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-cloud"
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
                      setConfirmDeleteProject(project.id);
                      setOpenMenuId(null);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-body-sm text-danger transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Hapus
                  </button>
                </div>
              )}

              {/* Confirm delete project dialog */}
              <ConfirmDialog
                isOpen={confirmDeleteProject === project.id}
                onClose={() => setConfirmDeleteProject(null)}
                onConfirm={() => onDeleteProject(project.id)}
                title="Hapus project"
                message={`Yakin ingin menghapus "${project.name}"? Semua task di dalamnya juga akan dihapus.`}
              />
            </div>
          ))}

          {categoryProjects.length === 0 && !showProjectForm && (
            <p className="px-2 py-1 text-body-sm text-[#8B929A]">Belum ada project</p>
          )}
        </div>
      )}
    </div>
  );
}
