import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth';

// GET /api/dashboard — aggregated summary from all modules
export async function GET() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return unauthorizedResponse();

  const supabase = await createClient();

  // 1. Tasks summary per project
  // Only active (non soft-deleted) projects/tasks are counted.
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, view_type')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('name');

  const { data: allTasks } = await supabase
    .from('tasks')
    .select('id, project_id, status, deleted_at')
    .eq('user_id', user.id)
    .is('deleted_at', null);

  const activeProjectIds = new Set((projects ?? []).map((p) => p.id));
  const activeTasks = (allTasks ?? []).filter((t) => activeProjectIds.has(t.project_id));

  const tasksByProject = (projects ?? []).map((project) => {
    const projectTasks = activeTasks.filter((t) => t.project_id === project.id);
    return {
      id: project.id,
      name: project.name,
      view_type: project.view_type,
      todo: projectTasks.filter((t) => t.status === 'todo').length,
      in_progress: projectTasks.filter((t) => t.status === 'in_progress').length,
      done: projectTasks.filter((t) => t.status === 'done').length,
      total: projectTasks.length,
    };
  });

  // 2. Ideas summary (exclude soft-deleted)
  const { data: allIdeas } = await supabase
    .from('ideas')
    .select('id, is_realized')
    .eq('user_id', user.id)
    .is('deleted_at', null);

  const ideasSummary = {
    total: (allIdeas ?? []).length,
    realized: (allIdeas ?? []).filter((i) => i.is_realized).length,
    not_realized: (allIdeas ?? []).filter((i) => !i.is_realized).length,
  };

  // 3. Calendar upcoming events (next 7 days) — placeholder
  // Calendar is fetched client-side since it's a live proxy to Google Calendar
  // We return a flag so the frontend knows to fetch separately
  const hasCalendar = true;

  return NextResponse.json({
    tasks: tasksByProject,
    ideas: ideasSummary,
    hasCalendar,
  });
}
