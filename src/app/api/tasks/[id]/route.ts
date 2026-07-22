import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  badRequestResponse,
  notFoundResponse,
} from '@/lib/auth';
import { updateTaskSchema } from '@/lib/validations/task';

// PATCH /api/tasks/:id - Update a task
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await getAuthenticatedUser();

  if (error || !user) {
    return unauthorizedResponse();
  }

  const { id } = await params;
  const body = await request.json();
  const result = updateTaskSchema.safeParse(body);

  if (!result.success) {
    return badRequestResponse(result.error.issues[0].message);
  }

  const supabase = await createClient();

  // Check if task exists and belongs to user
  const { data: existing, error: fetchError } = await supabase
    .from('tasks')
    .select('id, project_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single();

  if (fetchError || !existing) {
    return notFoundResponse();
  }

  // If status is being updated, validate against project's view_type
  if (result.data.status) {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('view_type')
      .eq('id', existing.project_id)
      .single();

    if (projectError || !project) {
      return badRequestResponse('Parent project not found');
    }

    const validStatuses =
      project.view_type === 'list' ? ['todo', 'done'] : ['todo', 'in_progress', 'done'];

    if (!validStatuses.includes(result.data.status)) {
      return badRequestResponse(
        `Invalid status "${result.data.status}" for ${project.view_type} project. Allowed: ${validStatuses.join(', ')}`
      );
    }
  }

  // Update the task
  const { data, error: dbError } = await supabase
    .from('tasks')
    .update(result.data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/tasks/:id - Soft delete a task
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await getAuthenticatedUser();

  if (error || !user) {
    return unauthorizedResponse();
  }

  const { id } = await params;
  const supabase = await createClient();

  // Check if task exists and belongs to user
  const { data: existing, error: fetchError } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single();

  if (fetchError || !existing) {
    return notFoundResponse();
  }

  // Soft delete by setting deleted_at
  const { error: dbError } = await supabase
    .from('tasks')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
