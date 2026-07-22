'use client';

import { useState } from 'react';
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
    <div className="mb-1">
      {/* Category header */}
      <div className={`group flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors ${isActive ? 'bg-indigo-500/15' : 'hover:bg-white/5'}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 transition-colors hover:text-slate-200"
        >
          <svg
            className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div
          onClick={() => onSelectCategory(category)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2"
        >
          <span className="text-indigo-400">📁</span>
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
              className="flex-1 bg-transparent text-sm font-medium text-slate-200 outline-none"
            />
          ) : (
            <span
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditName(category.name);
                setIsEditing(true);
              }}
              className={`truncate text-sm font-medium ${isActive ? 'text-indigo-300' : 'text-slate-200'}`}
            >
              {category.name}
            </span>
          )}
        </div>

        {/* Category actions */}
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => setShowProjectForm(true)}
            className="flex h-5 w-5 items-center justify-center rounded text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
            title="Add project"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={() => {
              setEditName(category.name);
              setIsEditing(true);
            }}
            className="flex h-5 w-5 items-center justify-center rounded text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
            title="Rename"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={() => setConfirmDeleteCategory(true)}
            className="flex h-5 w-5 items-center justify-center rounded text-slate-400 transition-colors hover:bg-rose-500/20 hover:text-rose-400"
            title="Delete"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Confirm delete category dialog */}
      <ConfirmDialog
        isOpen={confirmDeleteCategory}
        onClose={() => setConfirmDeleteCategory(false)}
        onConfirm={() => onDeleteCategory(category.id)}
        title="Delete category"
        message={`Are you sure you want to delete "${category.name}"? All projects and tasks inside it will also be deleted.`}
      />

      {/* Expanded content */}
      {isExpanded && (
        <div className="ml-4 mt-0.5 border-l border-white/10 pl-2">
          {/* New project form */}
          {showProjectForm && (
            <div className="mb-1 rounded-lg bg-white/5 p-2">
              <input
                autoFocus
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateProject();
                  if (e.key === 'Escape') {
                    setNewProjectName('');
                    setShowProjectForm(false);
                  }
                }}
                className="mb-2 w-full rounded bg-transparent px-2 py-1 text-sm text-slate-200 outline-none ring-1 ring-white/20 focus:ring-indigo-500"
              />
              <div className="flex gap-1">
                <button
                  onClick={() => setNewProjectType('list')}
                  className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                    newProjectType === 'list'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  ☑ List
                </button>
                <button
                  onClick={() => setNewProjectType('kanban')}
                  className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                    newProjectType === 'kanban'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  ▦ Kanban
                </button>
              </div>
              <div className="mt-2 flex gap-1">
                <button
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim()}
                  className="flex-1 rounded bg-indigo-500 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setNewProjectName('');
                    setShowProjectForm(false);
                  }}
                  className="flex-1 rounded bg-white/5 px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Project list */}
          {categoryProjects.map((project) => (
            <div
              key={project.id}
              className={`group relative flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                activeProjectId === project.id
                  ? 'bg-indigo-500/15 text-indigo-300'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {/* Active indicator */}
              {activeProjectId === project.id && (
                <div className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-indigo-500" />
              )}

              <button
                onClick={() => onSelectProject(project)}
                className="flex min-w-0 flex-1 items-center gap-2"
              >
                <span className="text-xs">
                  {project.view_type === 'list' ? '☑' : '▦'}
                </span>
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
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                ) : (
                  <span className="truncate text-sm">{project.name}</span>
                )}
              </button>

              {/* Project actions */}
              <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === project.id ? null : project.id);
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-white/10"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>

              {/* Context menu */}
              {openMenuId === project.id && (
                <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded-lg bg-slate-800 py-1 shadow-xl ring-1 ring-white/10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProjectId(project.id);
                      setEditingProjectName(project.name);
                      setOpenMenuId(null);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-white/5"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Rename
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteProject(project.id);
                      setOpenMenuId(null);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-rose-400 transition-colors hover:bg-white/5"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}

              {/* Confirm delete project dialog */}
              <ConfirmDialog
                isOpen={confirmDeleteProject === project.id}
                onClose={() => setConfirmDeleteProject(null)}
                onConfirm={() => onDeleteProject(project.id)}
                title="Delete project"
                message={`Are you sure you want to delete "${project.name}"? All tasks inside it will also be deleted.`}
              />
            </div>
          ))}

          {categoryProjects.length === 0 && !showProjectForm && (
            <p className="px-2 py-1 text-xs text-slate-500">No projects yet</p>
          )}
        </div>
      )}
    </div>
  );
}
