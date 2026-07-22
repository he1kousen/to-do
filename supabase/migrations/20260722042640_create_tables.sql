-- ============================================================
-- Phase 1.1: Create tables for Personal To-Do List App
-- Spec: docs/spec.md, Section 3 (Data Model)
-- ============================================================

-- Enable the uuid-ossp extension for uuid_generate_v4()
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. CATEGORIES
-- ============================================================
create table categories (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null check (char_length(name) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Index on user_id for fast per-user lookups
create index idx_categories_user_id on categories(user_id);
-- Index on updated_at for sync queries (pull rows where updated_at > last_synced_at)
create index idx_categories_updated_at on categories(updated_at);

-- ============================================================
-- 2. PROJECTS
-- ============================================================
create table projects (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  name        text not null check (char_length(name) > 0),
  view_type   text not null check (view_type in ('list', 'kanban')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- Indexes
create index idx_projects_user_id on projects(user_id);
create index idx_projects_category_id on projects(category_id);
create index idx_projects_updated_at on projects(updated_at);

-- ============================================================
-- 3. TASKS
-- ============================================================
create table tasks (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  project_id  uuid not null references projects(id) on delete cascade,
  title       text not null check (char_length(title) > 0),
  description text not null default '',
  status      text not null default 'todo',
  due_date    date,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- Indexes
create index idx_tasks_user_id on tasks(user_id);
create index idx_tasks_project_id on tasks(project_id);
create index idx_tasks_updated_at on tasks(updated_at);

-- ============================================================
-- 4. TRIGGER: auto-update updated_at on row change
-- ============================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_categories
  before update on categories
  for each row
  execute function update_updated_at_column();

create trigger set_updated_at_projects
  before update on projects
  for each row
  execute function update_updated_at_column();

create trigger set_updated_at_tasks
  before update on tasks
  for each row
  execute function update_updated_at_column();

-- ============================================================
-- 5. CONSTRAINT: validate task status based on parent project's view_type
--    list projects: todo / done
--    kanban projects: todo / in_progress / done
-- ============================================================
create or replace function validate_task_status()
returns trigger as $$
declare
  parent_view_type text;
begin
  -- Get the parent project's view_type
  select view_type into parent_view_type
  from projects
  where id = new.project_id;

  -- Validate status based on view_type
  if parent_view_type = 'list' and new.status not in ('todo', 'done') then
    raise exception 'Invalid status "%" for list project. Allowed: todo, done', new.status;
  end if;

  if parent_view_type = 'kanban' and new.status not in ('todo', 'in_progress', 'done') then
    raise exception 'Invalid status "%" for kanban project. Allowed: todo, in_progress, done', new.status;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger validate_task_status_trigger
  before insert or update on tasks
  for each row
  execute function validate_task_status();
