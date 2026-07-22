import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  badRequestResponse,
} from '@/lib/auth';
import { createProjectSchema } from '@/lib/validations/project';

// GET /api/projects - List all projects (excluding soft-deleted)
export async function GET() {
  const { user, error } = await getAuthenticatedUser();

  if (error || !user) {
    return unauthorizedResponse();
  }

  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from('projects')
    .select('*')
    .is('deleted_at', null)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/projects - Create a new project
export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();

  if (error || !user) {
    return unauthorizedResponse();
  }

  const body = await request.json();
  const result = createProjectSchema.safeParse(body);

  if (!result.success) {
    return badRequestResponse(result.error.issues[0].message);
  }

  const supabase = await createClient();

  // Hierarchy validation: category must belong to user
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

  // Create the project
  const { data, error: dbError } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      category_id: result.data.category_id,
      name: result.data.name,
      view_type: result.data.view_type,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
