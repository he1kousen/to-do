'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useRef } from 'react';

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  description: string;
  is_realized: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const load = async () => {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setIdeas(data);
      }
      setLoading(false);
    };

    load();
  }, [supabase]);

  const createIdea = async (input: { title: string; description?: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('ideas')
      .insert({
        user_id: user.id,
        title: input.title,
        description: input.description ?? '',
      })
      .select()
      .single();

    if (!error && data) {
      setIdeas((prev) => [data, ...prev]);
    }
    return data;
  };

  const updateIdea = async (
    id: string,
    updates: Partial<Pick<Idea, 'title' | 'description' | 'is_realized'>>
  ) => {
    const { data, error } = await supabase
      .from('ideas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setIdeas((prev) => prev.map((i) => (i.id === id ? data : i)));
    }
    return data;
  };

  const deleteIdea = async (id: string) => {
    const { error } = await supabase
      .from('ideas')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setIdeas((prev) => prev.filter((i) => i.id !== id));
    }
    return !error;
  };

  const toggleRealized = async (id: string) => {
    const idea = ideas.find((i) => i.id === id);
    if (!idea) return null;

    return updateIdea(id, { is_realized: !idea.is_realized });
  };

  return {
    ideas,
    loading,
    createIdea,
    updateIdea,
    deleteIdea,
    toggleRealized,
  };
}
