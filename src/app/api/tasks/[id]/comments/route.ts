import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  badRequestResponse,
  notFoundResponse,
} from '@/lib/auth';
import { z } from 'zod';

const createCommentSchema = z.object({
  content: z.string().min(1, 'Komentar tidak boleh kosong').max(1000, 'Komentar terlalu panjang'),
});

// GET /api/tasks/:id/comments — list comments for a task
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return unauthorizedResponse();

  const { id: taskId } = await params;
  const supabase = await createClient();

  // Verify task belongs to user
  const { data: task } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .eq('user_id', user.id)
    .single();

  if (!task) return notFoundResponse();

  const { data, error: dbError } = await supabase
    .from('task_comments')
    .select('*')
    .eq('task_id', taskId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

// POST /api/tasks/:id/comments — add a comment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return unauthorizedResponse();

  const { id: taskId } = await params;
  const body = await request.json();
  const result = createCommentSchema.safeParse(body);

  if (!result.success) {
    return badRequestResponse(result.error.issues[0].message);
  }

  const supabase = await createClient();

  // Verify task belongs to user
  const { data: task } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .eq('user_id', user.id)
    .single();

  if (!task) return notFoundResponse();

  const { data, error: dbError } = await supabase
    .from('task_comments')
    .insert({
      user_id: user.id,
      task_id: taskId,
      content: result.data.content,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/tasks/:id/comments — delete a comment
export async function DELETE(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return unauthorizedResponse();

  const body = await request.json();
  const { commentId } = body;

  if (!commentId) {
    return badRequestResponse('commentId is required');
  }

  const supabase = await createClient();

  const { error: dbError } = await supabase
    .from('task_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
