'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';
import type { Task } from '@/lib/hooks/use-tasks';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Pick<Task, 'title' | 'description'>>) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (status: string) => void;
}

export default function KanbanColumn({
  id,
  title,
  color,
  tasks,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex min-w-[280px] flex-1 flex-col">
      {/* Column header */}
      <div className="mb-3 flex items-center gap-2">
        <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
          {tasks.length}
        </span>
      </div>

      {/* Column content */}
      <div
        ref={setNodeRef}
        className={`flex min-h-[200px] flex-1 flex-col gap-2 rounded-xl border-2 border-dashed p-2 transition-colors ${
          isOver
            ? 'border-indigo-300 bg-indigo-50/50'
            : 'border-transparent bg-slate-100/50'
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {/* Add task button */}
        <button
          onClick={() => onAddTask(id)}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-slate-400 transition-colors hover:bg-white hover:text-slate-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add task
        </button>
      </div>
    </div>
  );
}
