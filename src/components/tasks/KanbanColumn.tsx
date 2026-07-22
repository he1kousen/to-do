'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import KanbanCard from './KanbanCard';
import type { Task } from '@/lib/hooks/use-tasks';

interface KanbanColumnProps {
  id: string;
  title: string;
  dotColor: string;
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Pick<Task, 'title' | 'description'>>) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (status: string) => void;
}

export default function KanbanColumn({
  id,
  title,
  dotColor,
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
        <div className={`h-2 w-2 rounded-full ${dotColor}`} />
        <h3 className="text-body-md font-medium text-graphite">{title}</h3>
        <span className="rounded-sm bg-mist px-1.5 py-0.5 text-mono-sm font-medium text-[#6B7280]">
          {tasks.length}
        </span>
      </div>

      {/* Column content */}
      <div
        ref={setNodeRef}
        className={`flex min-h-[200px] flex-1 flex-col gap-2 rounded-lg p-2 transition-colors ${
          isOver
            ? 'border-2 border-dashed border-signal-teal/40 bg-signal-teal/5'
            : 'bg-mist'
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
          className="flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-body-sm text-[#8B929A] transition-colors hover:bg-white hover:text-graphite"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Tambah task
        </button>
      </div>
    </div>
  );
}
