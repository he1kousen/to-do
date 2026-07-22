'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2, Calendar } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { Task } from '@/lib/hooks/use-tasks';

interface KanbanCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Pick<Task, 'title' | 'description'>>) => void;
  onDelete: (id: string) => void;
}

export default function KanbanCard({ task, onUpdate, onDelete }: KanbanCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
      className={`group rounded-lg border bg-white p-3 transition-colors ${
        isDragging
          ? 'z-50 border-signal-teal shadow-float'
          : 'border-cloud hover:border-[#C4C9CE]'
      }`}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...listeners}
          className="mt-0.5 flex h-5 w-5 shrink-0 cursor-grab items-center justify-center text-[#C4C9CE] transition-colors hover:text-[#8B929A] active:cursor-grabbing"
        >
          <GripVertical className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
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
              className="w-full bg-transparent text-body-md text-graphite outline-none"
            />
          ) : (
            <p
              onDoubleClick={() => {
                setEditTitle(task.title);
                setIsEditing(true);
              }}
              className="text-body-md text-graphite"
            >
              {task.title}
            </p>
          )}

          {/* Description */}
          {task.description && (
            <p className="mt-1 truncate text-body-sm text-[#6B7280]">{task.description}</p>
          )}

          {/* Footer */}
          <div className="mt-2 flex items-center justify-between">
            {task.due_date ? (
              <span className="flex items-center gap-1 text-mono-sm text-[#8B929A]">
                <Calendar className="h-3 w-3" strokeWidth={1.5} />
                {new Date(task.due_date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            ) : (
              <span />
            )}

            {/* Actions */}
            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => {
                  setEditTitle(task.title);
                  setIsEditing(true);
                }}
                className="flex h-5 w-5 items-center justify-center rounded-sm text-[#8B929A] transition-colors hover:bg-mist hover:text-graphite"
              >
                <Pencil className="h-3 w-3" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex h-5 w-5 items-center justify-center rounded-sm text-[#8B929A] transition-colors hover:bg-red-50 hover:text-danger"
              >
                <Trash2 className="h-3 w-3" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => onDelete(task.id)}
        title="Hapus task"
        message={`Yakin ingin menghapus "${task.title}"?`}
      />
    </div>
  );
}
