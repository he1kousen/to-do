'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2, Check, Calendar } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import TaskDetail from './TaskDetail';
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

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
      className={`group flex items-center gap-3 rounded-lg border bg-white px-4 py-3 transition-colors ${
        isDragging
          ? 'z-50 border-signal-teal shadow-float'
          : 'border-cloud hover:border-[#C4C9CE]'
      } ${isDone ? 'opacity-60' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex h-5 w-5 shrink-0 cursor-grab items-center justify-center text-[#C4C9CE] transition-colors hover:text-[#8B929A] active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" strokeWidth={1.5} />
      </button>

      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id, isDone ? 'todo' : 'done')}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 transition-colors ${
          isDone
            ? 'border-moss bg-moss text-white'
            : 'border-cloud hover:border-signal-teal'
        }`}
      >
        {isDone && <Check className="h-3 w-3" strokeWidth={3} />}
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
            className="w-full bg-transparent text-body-md text-graphite outline-none"
          />
        ) : (
          <span
            onClick={() => setShowDetail(true)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditTitle(task.title);
              setIsEditing(true);
            }}
            className={`block cursor-pointer truncate text-body-md ${
              isDone ? 'text-[#8B929A] line-through' : 'text-graphite hover:text-signal-teal'
            }`}
          >
            {task.title}
          </span>
        )}
        {task.description && (
          <p className="mt-0.5 truncate text-body-sm text-[#6B7280]">{task.description}</p>
        )}
      </div>

      {/* Due date */}
      {task.due_date && (
        <span className="flex shrink-0 items-center gap-1 rounded-sm bg-mist px-2 py-0.5 text-mono-sm text-[#6B7280]">
          <Calendar className="h-3 w-3" strokeWidth={1.5} />
          {new Date(task.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
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
            className="flex h-6 w-6 items-center justify-center rounded-sm text-[#8B929A] transition-colors hover:bg-mist hover:text-graphite"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex h-6 w-6 items-center justify-center rounded-sm text-[#8B929A] transition-colors hover:bg-red-50 hover:text-danger"
            title="Hapus"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => onDelete(task.id)}
        title="Hapus task"
        message={`Yakin ingin menghapus "${task.title}"?`}
      />

      {showDetail && (
        <TaskDetail
          task={task}
          onClose={() => setShowDetail(false)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}
