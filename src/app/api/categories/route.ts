import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  badRequestResponse,
} from '@/lib/auth';
import { createCategorySchema } from '@/lib/validations/category';

// GET /api/categories - List all categories (excluding soft-deleted)
export async function GET() {
  const { user, error } = await getAuthenticatedUser();

  if (error || !user) {
    return unauthorizedResponse();
  }

  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from('categories')
    .select('*')
    .is('deleted_at', null)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/categories - Create a new category
export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();

  if (error || !user) {
    return unauthorizedResponse();
  }

  const body = await request.json();
  const result = createCategorySchema.safeParse(body);

  if (!result.success) {
    return badRequestResponse(result.error.issues[0].message);
  }

  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from('categories')
    .insert({
      user_id: user.id,
      name: result.data.name,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
