'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useRef } from 'react';

export interface Task {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  description: string;
  status: string;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export function useTasks(projectId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const hasFetched = useRef(false);
  const currentProjectId = useRef(projectId);

  useEffect(() => {
    // Reset when project changes
    if (currentProjectId.current !== projectId) {
      currentProjectId.current = projectId;
      hasFetched.current = false;
    }

    if (!projectId || hasFetched.current) {
      return;
    }
    hasFetched.current = true;

    const load = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .is('deleted_at', null)
        .order('position', { ascending: true });

      if (!error && data) {
        setTasks(data);
      }
      setLoading(false);
    };

    load();
  }, [projectId, supabase]);

  const createTask = async (input: {
    title: string;
    description?: string;
    status?: string;
    due_date?: string | null;
    position?: number;
  }) => {
    if (!projectId) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Calculate position: put at end of the status column
    const maxPosition = tasks
      .filter((t) => t.status === (input.status ?? 'todo'))
      .reduce((max, t) => Math.max(max, t.position), -1);

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        project_id: projectId,
        title: input.title,
        description: input.description ?? '',
        status: input.status ?? 'todo',
        due_date: input.due_date ?? null,
        position: input.position ?? maxPosition + 1,
      })
      .select()
      .single();

    if (!error && data) {
      setTasks((prev) => [...prev, data]);
    }
    return data;
  };

  const updateTask = async (
    id: string,
    updates: Partial<Pick<Task, 'title' | 'description' | 'status' | 'due_date' | 'position'>>
  ) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
    }
    return data;
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
    return !error;
  };

  const reorderTasks = async (updatedTasks: Task[]) => {
    // Optimistic update
    setTasks(updatedTasks);

    // Batch update positions
    const updates = updatedTasks.map((t) =>
      supabase.from('tasks').update({ position: t.position, status: t.status }).eq('id', t.id)
    );

    await Promise.all(updates);
  };

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
  };
}
