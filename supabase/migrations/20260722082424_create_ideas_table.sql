-- ============================================================
-- Phase 4.1: Create ideas table
-- Spec: docs/PRD.md, Section 3 (Data Model)
-- Flat, standalone table — not nested under Category/Project
-- ============================================================

-- ============================================================
-- 1. IDEAS TABLE
-- ============================================================
create table ideas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null check (char_length(title) > 0),
  description text not null default '',
  is_realized boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- Indexes
create index idx_ideas_user_id on ideas(user_id);
create index idx_ideas_updated_at on ideas(updated_at);

-- ============================================================
-- 2. TRIGGER: auto-update updated_at on row change
-- ============================================================
create trigger set_updated_at_ideas
  before update on ideas
  for each row
  execute function update_updated_at_column();

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================
alter table ideas enable row level security;

-- Users can only see their own ideas
create policy "Users can view own ideas"
  on ideas for select
  using (user_id = auth.uid());

-- Users can create ideas for themselves
create policy "Users can insert own ideas"
  on ideas for insert
  with check (user_id = auth.uid());

-- Users can update their own ideas
create policy "Users can update own ideas"
  on ideas for update
  using (user_id = auth.uid());

-- Users can delete their own ideas
create policy "Users can delete own ideas"
  on ideas for delete
  using (user_id = auth.uid());
