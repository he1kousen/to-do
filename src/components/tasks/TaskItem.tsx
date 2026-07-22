'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/lib/hooks/use-tasks';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, newStatus: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<Task, 'title' | 'description'>>) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({ task, onToggle, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [showActions, setShowActions] = useState(false);

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

  const isDone = task.status === 'done';

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
      className={`group flex items-center gap-3 rounded-lg border bg-white px-4 py-3 transition-all ${
        isDragging
          ? 'z-50 border-indigo-300 shadow-lg'
          : 'border-slate-200 hover:border-slate-300'
      } ${isDone ? 'opacity-60' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex h-5 w-5 shrink-0 cursor-grab items-center justify-center text-slate-300 transition-colors hover:text-slate-500 active:cursor-grabbing"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id, isDone ? 'todo' : 'done')}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
          isDone
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-slate-300 hover:border-indigo-400'
        }`}
      >
        {isDone && (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Title */}
      <div className="min-w-0 flex-1">
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
            className="w-full bg-transparent text-sm text-slate-900 outline-none"
          />
        ) : (
          <span
            onDoubleClick={() => {
              setEditTitle(task.title);
              setIsEditing(true);
            }}
            className={`block truncate text-sm ${
              isDone ? 'text-slate-400 line-through' : 'text-slate-900'
            }`}
          >
            {task.title}
          </span>
        )}
        {task.description && (
          <p className="mt-0.5 truncate text-xs text-slate-400">{task.description}</p>
        )}
      </div>

      {/* Due date */}
      {task.due_date && (
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
          {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => {
              setEditTitle(task.title);
              setIsEditing(true);
            }}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            title="Edit"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
            title="Delete"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
