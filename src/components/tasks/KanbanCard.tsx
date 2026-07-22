'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/lib/hooks/use-tasks';

interface KanbanCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Pick<Task, 'title' | 'description'>>) => void;
  onDelete: (id: string) => void;
}

export default function KanbanCard({ task, onUpdate, onDelete }: KanbanCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      onUpdate(task.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group cursor-grab rounded-lg border bg-white p-3 shadow-sm transition-all active:cursor-grabbing ${
        isDragging
          ? 'z-50 border-indigo-300 shadow-lg'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Title */}
      {isEditing ? (
        <input
          autoFocus
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename();
            if (e.key === 'Escape') {
              setEditTitle(task.title);
              setIsEditing(false);
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-transparent text-sm text-slate-900 outline-none"
        />
      ) : (
        <p
          onDoubleClick={() => {
            setEditTitle(task.title);
            setIsEditing(true);
          }}
          className="text-sm text-slate-900"
        >
          {task.title}
        </p>
      )}

      {/* Description */}
      {task.description && (
        <p className="mt-1 truncate text-xs text-slate-400">{task.description}</p>
      )}

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between">
        {task.due_date ? (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
            {new Date(task.due_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        ) : (
          <span />
        )}

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditTitle(task.title);
              setIsEditing(true);
            }}
            className="flex h-5 w-5 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="flex h-5 w-5 items-center justify-center rounded text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
