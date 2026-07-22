-- ============================================================
-- Phase 1.2: Add Row Level Security policies
-- Spec: docs/spec.md, Section 3 & 6
-- All tables restrict access to rows where user_id = auth.uid()
-- ============================================================

-- ============================================================
-- 1. CATEGORIES
-- ============================================================
alter table categories enable row level security;

-- Users can only see their own categories
create policy "Users can view own categories"
  on categories for select
  using (user_id = auth.uid());

-- Users can create categories for themselves
create policy "Users can insert own categories"
  on categories for insert
  with check (user_id = auth.uid());

-- Users can update their own categories
create policy "Users can update own categories"
  on categories for update
  using (user_id = auth.uid());

-- Users can delete their own categories
create policy "Users can delete own categories"
  on categories for delete
  using (user_id = auth.uid());

-- ============================================================
-- 2. PROJECTS
-- ============================================================
alter table projects enable row level security;

-- Users can only see their own projects
create policy "Users can view own projects"
  on projects for select
  using (user_id = auth.uid());

-- Users can create projects for themselves
create policy "Users can insert own projects"
  on projects for insert
  with check (user_id = auth.uid());

-- Users can update their own projects
create policy "Users can update own projects"
  on projects for update
  using (user_id = auth.uid());

-- Users can delete their own projects
create policy "Users can delete own projects"
  on projects for delete
  using (user_id = auth.uid());

-- ============================================================
-- 3. TASKS
-- ============================================================
alter table tasks enable row level security;

-- Users can only see their own tasks
create policy "Users can view own tasks"
  on tasks for select
  using (user_id = auth.uid());

-- Users can create tasks for themselves
create policy "Users can insert own tasks"
  on tasks for insert
  with check (user_id = auth.uid());

-- Users can update their own tasks
create policy "Users can update own tasks"
  on tasks for update
  using (user_id = auth.uid());

-- Users can delete their own tasks
create policy "Users can delete own tasks"
  on tasks for delete
  using (user_id = auth.uid());
