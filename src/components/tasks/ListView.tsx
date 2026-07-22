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
    <div className="mx-auto w-full max-w-2xl p-6">
      {/* Add task input */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateTask();
            }}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={handleCreateTask}
            disabled={!newTaskTitle.trim()}
            className="rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add
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
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Completed ({doneTasks.length})
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
        <div className="flex flex-col items-center justify-center py-12">
          <span className="mb-3 text-4xl">📝</span>
          <p className="text-sm text-slate-500">No tasks yet. Add one above to get started.</p>
        </div>
      )}
    </div>
  );
}
