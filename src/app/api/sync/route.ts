import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, unauthorizedResponse, badRequestResponse } from '@/lib/auth';
import { z } from 'zod';

// ============================================================
// Validation schemas for sync payload
// ============================================================

const syncItemSchema = z.object({
  id: z.string().uuid(),
  // All other fields are optional since we handle creates, updates, and deletes
  name: z.string().optional(),
  category_id: z.string().uuid().optional(),
  view_type: z.enum(['list', 'kanban']).optional(),
  project_id: z.string().uuid().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  due_date: z.string().nullable().optional(),
  position: z.number().int().optional(),
  is_realized: z.boolean().optional(),
  updated_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable().optional(),
});

const syncRequestSchema = z.object({
  last_synced_at: z.string().datetime(),
  categories: z.object({
    creates: z.array(syncItemSchema).default([]),
    updates: z.array(syncItemSchema).default([]),
    deletes: z.array(z.object({ id: z.string().uuid() })).default([]),
  }),
  projects: z.object({
    creates: z.array(syncItemSchema).default([]),
    updates: z.array(syncItemSchema).default([]),
    deletes: z.array(z.object({ id: z.string().uuid() })).default([]),
  }),
  tasks: z.object({
    creates: z.array(syncItemSchema).default([]),
    updates: z.array(syncItemSchema).default([]),
    deletes: z.array(z.object({ id: z.string().uuid() })).default([]),
  }),
  ideas: z.object({
    creates: z.array(syncItemSchema).default([]),
    updates: z.array(syncItemSchema).default([]),
    deletes: z.array(z.object({ id: z.string().uuid() })).default([]),
  }),
});

type SyncRequest = z.infer<typeof syncRequestSchema>;

// ============================================================
// Helper: Apply pending creates/updates/deletes with last-write-wins
// ============================================================

async function applyCategoryChanges(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  changes: SyncRequest['categories'],
  serverTime: string
) {
  const results = { created: 0, updated: 0, deleted: 0 };

  // Process creates
  for (const item of changes.creates) {
    const { error } = await supabase.from('categories').upsert(
      {
        id: item.id,
        user_id: userId,
        name: item.name!,
        updated_at: item.updated_at,
        deleted_at: item.deleted_at ?? null,
      },
      { onConflict: 'id' }
    );
    if (!error) results.created++;
  }

  // Process updates (last-write-wins: only update if client is newer)
  for (const item of changes.updates) {
    const { data: existing } = await supabase
      .from('categories')
      .select('updated_at')
      .eq('id', item.id)
      .single();

    // Only update if client's updated_at is newer (or row doesn't exist)
    if (!existing || new Date(item.updated_at) > new Date(existing.updated_at)) {
      const { error } = await supabase
        .from('categories')
        .update({
          name: item.name,
          updated_at: item.updated_at,
          deleted_at: item.deleted_at ?? undefined,
        })
        .eq('id', item.id)
        .eq('user_id', userId);
      if (!error) results.updated++;
    }
  }

  // Process deletes (soft delete)
  for (const item of changes.deletes) {
    const { error } = await supabase
      .from('categories')
      .update({ deleted_at: serverTime })
      .eq('id', item.id)
      .eq('user_id', userId)
      .is('deleted_at', null);
    if (!error) results.deleted++;
  }

  return results;
}

async function applyProjectChanges(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  changes: SyncRequest['projects'],
  serverTime: string
) {
  const results = { created: 0, updated: 0, deleted: 0 };

  // Process creates
  for (const item of changes.creates) {
    const { error } = await supabase.from('projects').upsert(
      {
        id: item.id,
        user_id: userId,
        category_id: item.category_id!,
        name: item.name!,
        view_type: item.view_type!,
        updated_at: item.updated_at,
        deleted_at: item.deleted_at ?? null,
      },
      { onConflict: 'id' }
    );
    if (!error) results.created++;
  }

  // Process updates (last-write-wins)
  for (const item of changes.updates) {
    const { data: existing } = await supabase
      .from('projects')
      .select('updated_at')
      .eq('id', item.id)
      .single();

    if (!existing || new Date(item.updated_at) > new Date(existing.updated_at)) {
      const updateData: Record<string, unknown> = {
        updated_at: item.updated_at,
        deleted_at: item.deleted_at ?? undefined,
      };
      if (item.name !== undefined) updateData.name = item.name;
      if (item.category_id !== undefined) updateData.category_id = item.category_id;
      if (item.view_type !== undefined) updateData.view_type = item.view_type;

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', item.id)
        .eq('user_id', userId);
      if (!error) results.updated++;
    }
  }

  // Process deletes
  for (const item of changes.deletes) {
    const { error } = await supabase
      .from('projects')
      .update({ deleted_at: serverTime })
      .eq('id', item.id)
      .eq('user_id', userId)
      .is('deleted_at', null);
    if (!error) results.deleted++;
  }

  return results;
}

async function applyTaskChanges(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  changes: SyncRequest['tasks'],
  serverTime: string
) {
  const results = { created: 0, updated: 0, deleted: 0 };

  // Process creates
  for (const item of changes.creates) {
    const { error } = await supabase.from('tasks').upsert(
      {
        id: item.id,
        user_id: userId,
        project_id: item.project_id!,
        title: item.title!,
        description: item.description ?? '',
        status: item.status ?? 'todo',
        due_date: item.due_date ?? null,
        position: item.position ?? 0,
        updated_at: item.updated_at,
        deleted_at: item.deleted_at ?? null,
      },
      { onConflict: 'id' }
    );
    if (!error) results.created++;
  }

  // Process updates (last-write-wins)
  for (const item of changes.updates) {
    const { data: existing } = await supabase
      .from('tasks')
      .select('updated_at')
      .eq('id', item.id)
      .single();

    if (!existing || new Date(item.updated_at) > new Date(existing.updated_at)) {
      const updateData: Record<string, unknown> = {
        updated_at: item.updated_at,
        deleted_at: item.deleted_at ?? undefined,
      };
      if (item.title !== undefined) updateData.title = item.title;
      if (item.description !== undefined) updateData.description = item.description;
      if (item.status !== undefined) updateData.status = item.status;
      if (item.due_date !== undefined) updateData.due_date = item.due_date;
      if (item.position !== undefined) updateData.position = item.position;
      if (item.project_id !== undefined) updateData.project_id = item.project_id;

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', item.id)
        .eq('user_id', userId);
      if (!error) results.updated++;
    }
  }

  // Process deletes
  for (const item of changes.deletes) {
    const { error } = await supabase
      .from('tasks')
      .update({ deleted_at: serverTime })
      .eq('id', item.id)
      .eq('user_id', userId)
      .is('deleted_at', null);
    if (!error) results.deleted++;
  }

  return results;
}

async function applyIdeaChanges(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  changes: SyncRequest['ideas'],
  serverTime: string
) {
  const results = { created: 0, updated: 0, deleted: 0 };

  // Process creates
  for (const item of changes.creates) {
    const { error } = await supabase.from('ideas').upsert(
      {
        id: item.id,
        user_id: userId,
        title: item.title!,
        description: item.description ?? '',
        is_realized: item.is_realized ?? false,
        updated_at: item.updated_at,
        deleted_at: item.deleted_at ?? null,
      },
      { onConflict: 'id' }
    );
    if (!error) results.created++;
  }

  // Process updates (last-write-wins)
  for (const item of changes.updates) {
    const { data: existing } = await supabase
      .from('ideas')
      .select('updated_at')
      .eq('id', item.id)
      .single();

    if (!existing || new Date(item.updated_at) > new Date(existing.updated_at)) {
      const updateData: Record<string, unknown> = {
        updated_at: item.updated_at,
        deleted_at: item.deleted_at ?? undefined,
      };
      if (item.title !== undefined) updateData.title = item.title;
      if (item.description !== undefined) updateData.description = item.description;
      if (item.is_realized !== undefined) updateData.is_realized = item.is_realized;

      const { error } = await supabase
        .from('ideas')
        .update(updateData)
        .eq('id', item.id)
        .eq('user_id', userId);
      if (!error) results.updated++;
    }
  }

  // Process deletes
  for (const item of changes.deletes) {
    const { error } = await supabase
      .from('ideas')
      .update({ deleted_at: serverTime })
      .eq('id', item.id)
      .eq('user_id', userId)
      .is('deleted_at', null);
    if (!error) results.deleted++;
  }

  return results;
}

// ============================================================
// POST /api/sync - Push pending changes and pull updates
// ============================================================

export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();

  if (error || !user) {
    return unauthorizedResponse();
  }

  const body = await request.json();
  const result = syncRequestSchema.safeParse(body);

  if (!result.success) {
    return badRequestResponse(result.error.issues[0].message);
  }

  const supabase = await createClient();
  const serverTime = new Date().toISOString();

  // 1. PUSH: Apply pending changes from client
  const pushResults = {
    categories: await applyCategoryChanges(supabase, user.id, result.data.categories, serverTime),
    projects: await applyProjectChanges(supabase, user.id, result.data.projects, serverTime),
    tasks: await applyTaskChanges(supabase, user.id, result.data.tasks, serverTime),
    ideas: await applyIdeaChanges(supabase, user.id, result.data.ideas, serverTime),
  };

  // 2. PULL: Get all rows updated since last_synced_at
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .gt('updated_at', result.data.last_synced_at)
    .order('updated_at', { ascending: true });

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .gt('updated_at', result.data.last_synced_at)
    .order('updated_at', { ascending: true });

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .gt('updated_at', result.data.last_synced_at)
    .order('updated_at', { ascending: true });

  const { data: ideas } = await supabase
    .from('ideas')
    .select('*')
    .eq('user_id', user.id)
    .gt('updated_at', result.data.last_synced_at)
    .order('updated_at', { ascending: true });

  // 3. Return sync results
  return NextResponse.json({
    server_timestamp: serverTime,
    push: pushResults,
    pull: {
      categories: categories ?? [],
      projects: projects ?? [],
      tasks: tasks ?? [],
      ideas: ideas ?? [],
    },
  });
}
