-- ============================================================
-- Create task_comments table
-- Simple comments/notes attached to tasks
-- ============================================================

create table task_comments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  task_id    uuid not null references tasks(id) on delete cascade,
  content    text not null check (char_length(content) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_task_comments_user_id on task_comments(user_id);
create index idx_task_comments_task_id on task_comments(task_id);
create index idx_task_comments_created_at on task_comments(created_at);

-- Auto-update updated_at
create trigger set_updated_at_task_comments
  before update on task_comments
  for each row
  execute function update_updated_at_column();

-- RLS
alter table task_comments enable row level security;

create policy "Users can view own task comments"
  on task_comments for select
  using (user_id = auth.uid());

create policy "Users can insert own task comments"
  on task_comments for insert
  with check (user_id = auth.uid());

create policy "Users can update own task comments"
  on task_comments for update
  using (user_id = auth.uid());

create policy "Users can delete own task comments"
  on task_comments for delete
  using (user_id = auth.uid());
