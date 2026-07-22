import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  badRequestResponse,
  notFoundResponse,
} from '@/lib/auth';
import { updateProjectSchema } from '@/lib/validations/project';

// PATCH /api/projects/:id - Update a project
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
  const result = updateProjectSchema.safeParse(body);

  if (!result.success) {
    return badRequestResponse(result.error.issues[0].message);
  }

  const supabase = await createClient();

  // Check if project exists and belongs to user
  const { data: existing, error: fetchError } = await supabase
    .from('projects')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single();

  if (fetchError || !existing) {
    return notFoundResponse();
  }

  // If category_id is being updated, validate it belongs to user
  if (result.data.category_id) {
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', result.data.category_id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single();

    if (categoryError || !category) {
      return badRequestResponse('Category not found or does not belong to you');
    }
  }

  // Update the project
  const { data, error: dbError } = await supabase
    .from('projects')
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

// DELETE /api/projects/:id - Soft delete a project
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

  // Check if project exists and belongs to user
  const { data: existing, error: fetchError } = await supabase
    .from('projects')
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
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
