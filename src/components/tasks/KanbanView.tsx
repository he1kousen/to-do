'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import type { Task } from '@/lib/hooks/use-tasks';

interface KanbanViewProps {
  tasks: Task[];
  onCreateTask: (input: { title: string; status: string }) => void;
  onUpdateTask: (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'status' | 'position'>>) => void;
  onDeleteTask: (id: string) => void;
  onReorderTasks: (tasks: Task[]) => void;
}

const COLUMNS = [
  { id: 'todo', title: 'To Do', dotColor: 'bg-[#8B929A]' },
  { id: 'in_progress', title: 'Sedang Dikerjakan', dotColor: 'bg-marigold' },
  { id: 'done', title: 'Selesai', dotColor: 'bg-moss' },
];

export default function KanbanView({
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onReorderTasks,
}: KanbanViewProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getColumnTasks = (status: string) =>
    tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const overColumn = COLUMNS.find((c) => c.id === overId);
    const overTask = tasks.find((t) => t.id === overId);

    let newStatus: string;
    if (overColumn) {
      newStatus = overColumn.id;
    } else if (overTask) {
      newStatus = overTask.status;
    } else {
      return;
    }

    if (activeTask.status !== newStatus) {
      const updatedTasks = tasks.map((t) =>
        t.id === activeId ? { ...t, status: newStatus } : t
      );
      onReorderTasks(updatedTasks);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const columnTasks = getColumnTasks(activeTask.status);
    const overTask = columnTasks.find((t) => t.id === overId);

    if (!overTask) return;

    const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
    const newIndex = columnTasks.findIndex((t) => t.id === overId);

    const reordered = [...columnTasks];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const updatedColumnTasks = reordered.map((t, i) => ({ ...t, position: i }));

    const otherTasks = tasks.filter((t) => t.status !== activeTask.status);
    onReorderTasks([...otherTasks, ...updatedColumnTasks]);
  };

  const handleAddTask = (status: string) => {
    onCreateTask({ title: 'Task baru', status });
  };

  return (
    <div className="flex h-full flex-col px-6 py-8">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              dotColor={column.dotColor}
              tasks={getColumnTasks(column.id)}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              onAddTask={handleAddTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="w-70">
              <KanbanCard
                task={activeTask}
                onUpdate={() => {}}
                onDelete={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
