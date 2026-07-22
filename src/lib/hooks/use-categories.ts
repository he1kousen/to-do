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

      console.log('[useCategories] fetch result:', { data, error });
      if (error) {
        console.error('[useCategories] fetch error:', error.message, error.details);
      }

      if (!error && data) {
        setCategories(data);
      }
      setLoading(false);
    };

    load();
  }, [supabase]);

  const createCategory = async (name: string) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('[createCategory] auth user:', user?.id, 'authError:', authError);

    if (!user) {
      console.error('[createCategory] No authenticated user');
      return null;
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({ user_id: user.id, name })
      .select()
      .single();

    console.log('[createCategory] insert result:', { data, error });
    if (error) {
      console.error('[createCategory] insert error:', error.message, error.details, error.hint);
    }

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
