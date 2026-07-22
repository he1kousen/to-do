import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  badRequestResponse,
} from '@/lib/auth';
import { createIdeaSchema } from '@/lib/validations/idea';

// GET /api/ideas - List all ideas (excluding soft-deleted)
// Supports filtering by is_realized via query param: ?is_realized=true/false
export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser();

  if (error || !user) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const isRealizedParam = searchParams.get('is_realized');

  const supabase = await createClient();
  let query = supabase
    .from('ideas')
    .select('*')
    .is('deleted_at', null)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Filter by is_realized if query param provided
  if (isRealizedParam === 'true') {
    query = query.eq('is_realized', true);
  } else if (isRealizedParam === 'false') {
    query = query.eq('is_realized', false);
  }

  const { data, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/ideas - Create a new idea
export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();

  if (error || !user) {
    return unauthorizedResponse();
  }

  const body = await request.json();
  const result = createIdeaSchema.safeParse(body);

  if (!result.success) {
    return badRequestResponse(result.error.issues[0].message);
  }

  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from('ideas')
    .insert({
      user_id: user.id,
      title: result.data.title,
      description: result.data.description,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
