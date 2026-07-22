-- ============================================================
-- Phase 5.1: Create user_google_tokens table
-- Stores Google OAuth refresh tokens for Calendar API proxy
-- Spec: docs/PRD.md, Section 6 (Calendar)
-- ============================================================

-- ============================================================
-- 1. USER_GOOGLE_TOKENS TABLE
-- ============================================================
create table user_google_tokens (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade unique,
  refresh_token text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Index on user_id for fast lookups
create index idx_user_google_tokens_user_id on user_google_tokens(user_id);

-- ============================================================
-- 2. TRIGGER: auto-update updated_at on row change
-- ============================================================
create trigger set_updated_at_user_google_tokens
  before update on user_google_tokens
  for each row
  execute function update_updated_at_column();

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================
alter table user_google_tokens enable row level security;

-- Users can only see their own tokens
create policy "Users can view own google tokens"
  on user_google_tokens for select
  using (user_id = auth.uid());

-- Users can insert their own tokens
create policy "Users can insert own google tokens"
  on user_google_tokens for insert
  with check (user_id = auth.uid());

-- Users can update their own tokens
create policy "Users can update own google tokens"
  on user_google_tokens for update
  using (user_id = auth.uid());

-- Users can delete their own tokens
create policy "Users can delete own google tokens"
  on user_google_tokens for delete
  using (user_id = auth.uid());
