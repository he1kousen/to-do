'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useRef } from 'react';

export interface Project {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  view_type: 'list' | 'kanban';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const load = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setProjects(data);
      }
      setLoading(false);
    };

    load();
  }, [supabase]);

  const createProject = async (
    categoryId: string,
    name: string,
    viewType: 'list' | 'kanban'
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('projects')
      .insert({ user_id: user.id, category_id: categoryId, name, view_type: viewType })
      .select()
      .single();

    if (!error && data) {
      setProjects((prev) => [...prev, data]);
    }
    return data;
  };

  const updateProject = async (
    id: string,
    updates: Partial<Pick<Project, 'name' | 'view_type' | 'category_id'>>
  ) => {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setProjects((prev) => prev.map((p) => (p.id === id ? data : p)));
    }
    return data;
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
    return !error;
  };

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
  };
}
