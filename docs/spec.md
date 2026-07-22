# Personal To-Do List App — Design Spec

Date: 2026-07-21
Status: Approved

## 1. Purpose & Scope

A personal (single-user) task management app combining a simple checklist style
(for daily life) and a Trello/Jira-style kanban board (for work projects),
organized in a three-level hierarchy: **Category → Project → Task**.

Used across two platforms by the same person:
- A website (deployed on Vercel)
- A Flutter mobile app

Both platforms share the same backend and data. The mobile app must work
offline and sync when back online; the website is online-only.

Out of scope for this version: multi-user support, real-time collaborative
editing, custom kanban columns, sub-tasks, labels/tags, reminders/notifications.
(These can be added later without breaking the core design.)

## 2. Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Website    │ ─HTTP─▶ │  Next.js API      │ ─SQL──▶ │  Supabase    │
│  (Vercel)    │ ◀─JSON─ │  (Vercel, same    │ ◀─────  │  (Postgres + │
│              │         │   deployment)     │         │   Auth+RLS)  │
└─────────────┘         └──────────────────┘         └──────┬──────┘
                                  ▲                            │
                                  │ HTTP when online            │
┌─────────────┐                  │                             │
│ Flutter App  │──────────────────┘                             │
│ + local      │                                                │
│ SQLite       │──── JSON backup ───▶ Google Drive API ◀────────┘
└─────────────┘        (manual trigger, separate from sync)
```

**Stack:**
- Backend/API: Next.js (App Router) API routes, deployed to Vercel
- Database: Supabase (Postgres) with Row Level Security (RLS) enabled on all tables
- Auth: Supabase Auth with Google OAuth
- Web frontend: Next.js (React), same Vercel deployment as the API
- Mobile: Flutter, with local SQLite (via the Drift package) for offline support
- Backup (secondary, optional): Google Drive API (`drive.appdata` scope) — manual
  JSON export, not part of the core sync mechanism

**Why an API layer instead of hitting Supabase directly from clients:** centralizes
sync logic, hierarchy validation, and Google Drive backup logic in one place
instead of duplicating it across Flutter and web.

## 3. Data Model

Three-level hierarchy, always Category → Project → Task. `view_type` lives on
Project (not Category), so any project can independently be a simple list or a
kanban board.

```
categories: id, user_id, name, created_at, updated_at, deleted_at
projects:   id, user_id, category_id, name, view_type, created_at, updated_at, deleted_at
tasks:      id, user_id, project_id, title, description, status,
            due_date, position, created_at, updated_at, deleted_at
```

- `view_type` (on projects): `list` | `kanban`
- `status` (on tasks): `todo` / `done` when the parent project is `list`;
  `todo` / `in_progress` / `done` when the parent project is `kanban`
- `position`: used for manual ordering (drag-and-drop in kanban, reorder in list)
- `deleted_at`: soft delete — rows are never hard-deleted, so deletions can
  propagate through sync
- `updated_at`: drives the sync mechanism (see §4) and last-write-wins conflict
  resolution

All tables have RLS policies restricting access to rows where `user_id` matches
the authenticated Supabase Auth user.

## 4. Sync Mechanism (Offline-First on Flutter)

**Local storage:** SQLite via Drift, mirroring the server schema, plus a
`sync_status` column: `synced` | `pending_create` | `pending_update` | `pending_delete`.

**Flow:**
1. **Offline**: all changes write to local SQLite immediately and are marked
   `pending_*`. UI always reads from local SQLite, so the app stays responsive
   offline.
2. **Back online** (detected via `connectivity_plus`): a two-way sync runs
   against a dedicated `/api/sync` endpoint:
   - **Push**: send all `pending_*` rows → server persists them and returns
     fresh `updated_at` values → local rows marked `synced`.
   - **Pull**: request all rows where `updated_at` > the client's
     `last_synced_at` → upsert into local SQLite.
3. **Conflict resolution**: last-write-wins by `updated_at`. Acceptable because
   this is single-user; simultaneous edits on two devices before either syncs
   are rare.
4. **Sync triggers**: automatically on app open and on regaining connectivity,
   plus a manual "Sync Now" button.

**Website:** online-only, no local storage — every action calls the API
directly.

## 5. API & Auth Flow

- Next.js API routes (`/api/categories`, `/api/projects`, `/api/tasks`, etc.)
  verify the Supabase Auth JWT from the `Authorization: Bearer <token>` header
  on every request.
- `/api/sync`: dedicated endpoint for Flutter only, handling push/pull as
  described in §4. Kept separate from the regular CRUD endpoints used by the
  website to avoid mixing sync logic with normal request/response CRUD flow.
- `/api/backup`: generates a JSON snapshot of the user's data and uploads it
  to a hidden app-specific folder in the user's Google Drive
  (`drive.appdata` scope). Manually triggered from the UI ("Backup Now") —
  not automatic, to keep the first version simple.
- **Account continuity**: because data is keyed by Supabase Auth `user_id`
  (tied to the Google account, not the session/device), logging out and back
  in with the same Google account — on the same or a different device —
  restores all data. Logging in with a different Google account starts fresh.
- **Logout on Flutter**: local SQLite must be cleared on logout, so that if
  the device is later used to log into a different Google account, data from
  the previous account doesn't leak into the new session.

## 6. Error Handling

- **Expired auth token**: API returns 401 → client (web or Flutter) attempts
  a token refresh via the Supabase SDK and retries once; on repeated failure,
  redirect to login.
- **Failed sync (Flutter)**: `pending_*` rows are kept locally (never
  discarded) and retried on the next sync attempt. The UI shows a small
  indicator on unsynced tasks.
- **Failed Google Drive backup**: surfaced as an error message, but never
  blocks core app functionality since backup is a secondary feature.
- **Hierarchy validation**: the API checks that a project's `category_id` and
  a task's `project_id` belong to the requesting user before writing.
  Postgres RLS acts as a second layer of defense in case anything bypasses
  API-level validation.

## 7. Testing Strategy

Pragmatic, scoped to a personal project (not team-scale coverage):
- **API routes**: unit tests focused on `/api/sync` (push/pull, last-write-wins
  resolution) and hierarchy validation — the highest-risk logic.
- **Flutter sync logic**: tests for the offline→online scenario (pending rows
  push correctly, server rows pull correctly, conflicts resolve by
  `updated_at`).
- **UI**: manual testing only; automated UI tests are not worth the overhead
  at this scale.

## 8. Stack Summary

| Layer | Technology |
|---|---|
| Web frontend + API | Next.js (Vercel) |
| Mobile | Flutter + Drift (SQLite local) |
| Database | Supabase (Postgres + RLS) |
| Auth | Supabase Auth (Google OAuth) |
| Backup | Google Drive API (manual trigger) |
| Sync | Custom, `updated_at`-based with last-write-wins |

## 9. Future Additions (not in this version)

- Sub-tasks
- Labels/tags
- Due date reminders / notifications
- Custom kanban columns (beyond todo/in_progress/done)
- Automatic (scheduled) Google Drive backups