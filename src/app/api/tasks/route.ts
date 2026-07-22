import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  badRequestResponse,
} from '@/lib/auth';
import { createTaskSchema } from '@/lib/validations/task';

// GET /api/tasks - List all tasks (excluding soft-deleted)
export async function GET() {
  const { user, error } = await getAuthenticatedUser();

  if (error || !user) {
    return unauthorizedResponse();
  }

  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from('tasks')
    .select('*')
    .is('deleted_at', null)
    .eq('user_id', user.id)
    .order('position', { ascending: true });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/tasks - Create a new task
export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();

  if (error || !user) {
    return unauthorizedResponse();
  }

  const body = await request.json();
  const result = createTaskSchema.safeParse(body);

  if (!result.success) {
    return badRequestResponse(result.error.issues[0].message);
  }

  const supabase = await createClient();

  // Hierarchy validation: project must belong to user
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, view_type')
    .eq('id', result.data.project_id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single();

  if (projectError || !project) {
    return badRequestResponse('Project not found or does not belong to you');
  }

  // Validate status against project's view_type
  const validStatuses =
    project.view_type === 'list' ? ['todo', 'done'] : ['todo', 'in_progress', 'done'];

  if (!validStatuses.includes(result.data.status)) {
    return badRequestResponse(
      `Invalid status "${result.data.status}" for ${project.view_type} project. Allowed: ${validStatuses.join(', ')}`
    );
  }

  // Create the task
  const { data, error: dbError } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      project_id: result.data.project_id,
      title: result.data.title,
      description: result.data.description,
      status: result.data.status,
      due_date: result.data.due_date,
      position: result.data.position,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
