import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  badRequestResponse,
  notFoundResponse,
} from '@/lib/auth';
import { updateIdeaSchema } from '@/lib/validations/idea';

// PATCH /api/ideas/:id - Update an idea (including toggling is_realized)
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
  const result = updateIdeaSchema.safeParse(body);

  if (!result.success) {
    return badRequestResponse(result.error.issues[0].message);
  }

  const supabase = await createClient();

  // Check if idea exists and belongs to user
  const { data: existing, error: fetchError } = await supabase
    .from('ideas')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single();

  if (fetchError || !existing) {
    return notFoundResponse();
  }

  // Update the idea
  const { data, error: dbError } = await supabase
    .from('ideas')
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

// DELETE /api/ideas/:id - Soft delete an idea
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

  // Check if idea exists and belongs to user
  const { data: existing, error: fetchError } = await supabase
    .from('ideas')
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
    .from('ideas')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
