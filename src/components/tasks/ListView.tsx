'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ListChecks, Plus } from 'lucide-react';
import TaskItem from './TaskItem';
import type { Task } from '@/lib/hooks/use-tasks';

interface ListViewProps {
  tasks: Task[];
  onCreateTask: (input: { title: string }) => void;
  onUpdateTask: (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'status'>>) => void;
  onDeleteTask: (id: string) => void;
  onReorderTasks: (tasks: Task[]) => void;
}

export default function ListView({
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onReorderTasks,
}: ListViewProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    const reordered = arrayMove(tasks, oldIndex, newIndex).map((t, i) => ({
      ...t,
      position: i,
    }));

    onReorderTasks(reordered);
  };

  const handleCreateTask = () => {
    if (newTaskTitle.trim()) {
      onCreateTask({ title: newTaskTitle.trim() });
      setNewTaskTitle('');
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-8">
      {/* Add task input */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tambah task baru..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateTask();
            }}
            className="flex-1 rounded-sm border border-cloud bg-white px-4 py-2.5 text-body-md text-graphite outline-none transition-colors focus:border-signal-teal placeholder:text-[#8B929A]"
          />
          <button
            onClick={handleCreateTask}
            disabled={!newTaskTitle.trim()}
            className="flex items-center gap-2 rounded-sm bg-signal-teal px-4 py-2.5 text-body-md font-medium text-white transition-colors hover:bg-signal-teal-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Tambah
          </button>
        </div>
      </div>

      {/* Task list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={todoTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {todoTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={(id, newStatus) => onUpdateTask(id, { status: newStatus })}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Done section */}
      {doneTasks.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 text-mono-sm font-medium uppercase tracking-wider text-[#8B929A]">
            Selesai ({doneTasks.length})
          </h3>
          <SortableContext items={doneTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {doneTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={(id, newStatus) => onUpdateTask(id, { status: newStatus })}
                  onUpdate={onUpdateTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      )}

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="flex flex-col items-center py-16">
          <ListChecks className="mb-3 h-10 w-10 text-[#C4C9CE]" strokeWidth={1.5} />
          <h3 className="text-display-sm text-graphite">Belum ada task</h3>
          <p className="mt-1 text-body-md text-[#6B7280]">
            Ketik nama task di atas dan tekan &quot;Tambah&quot; untuk mulai.
          </p>
        </div>
      )}
    </div>
  );
}
