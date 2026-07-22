'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useRef } from 'react';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const load = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setCategories(data);
      }
      setLoading(false);
    };

    load();
  }, [supabase]);

  const createCategory = async (name: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('categories')
      .insert({ user_id: user.id, name })
      .select()
      .single();

    if (!error && data) {
      setCategories((prev) => [...prev, data]);
    }
    return data;
  };

  const updateCategory = async (id: string, name: string) => {
    const { data, error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setCategories((prev) => prev.map((c) => (c.id === id ? data : c)));
    }
    return data;
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
    return !error;
  };

  return {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
