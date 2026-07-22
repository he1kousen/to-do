# todo-web

Personal management platform — Tasks, Ideas, Calendar modules under one shared shell.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + custom design tokens |
| Database | Supabase (Postgres + RLS) |
| Auth | Supabase Auth (Google OAuth) |
| Icons | lucide-react |
| Calendar | Google Calendar API (live proxy) |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project ([supabase.com](https://supabase.com))
- A Google Cloud project with OAuth 2.0 credentials (for Calendar)

### Installation

```bash
npm install
cp .env.local.example .env.local
# Fill in your credentials in .env.local
npm run dev
```

### Environment Variables

| Variable | Where to get it | Visibility |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | Client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon public | Client |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → APIs & Services → Credentials | Server only |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → APIs & Services → Credentials | Server only |

### Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run format       # Prettier auto-fix
npm run format:check # Check formatting
```

## Deployment to Vercel

### Step 1: Push to GitHub

Pastikan semua perubahan sudah di-push ke repository GitHub.

### Step 2: Connect ke Vercel

1. Buka [vercel.com](https://vercel.com)
2. Klik **"Add New..." → Project**
3. Import repository GitHub `he1kousen/to-do`
4. Vercel akan otomatis detect Next.js framework

### Step 3: Set Environment Variables

Di halaman project settings Vercel, tambahkan environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
```

**Penting:**
- `NEXT_PUBLIC_*` variables diakses di browser, jadi harus di-set juga di Vercel
- `GOOGLE_*` variables hanya dipakai di server (API routes), tidak exposed ke browser

### Step 4: Deploy

Klik **Deploy** — Vercel akan otomatis build dan deploy.

### Step 5: Post-Deployment Setup

#### Supabase
1. Buka Supabase Dashboard → **Authentication** → **URL Configuration**
2. Tambahkan Vercel URL ke **Redirect URLs**:
   ```
   https://your-app.vercel.app/auth/callback
   ```
3. Pastikan **Site URL** di-set ke `https://your-app.vercel.app`

#### Google Cloud Console
1. Buka **APIs & Services** → **Credentials** → OAuth 2.0 Client
2. Tambahkan ke **Authorized redirect URIs**:
   ```
   https://xxx.supabase.co/auth/v1/callback
   ```
3. Pastikan **Google Calendar API** sudah di-enable

## Project Structure

```
todo-web/
├── src/
│   ├── app/
│   │   ├── (app)/            # Route group with shared layout
│   │   │   ├── layout.tsx    # AppShell wrapper
│   │   │   ├── tasks/        # /tasks
│   │   │   ├── ideas/        # /ideas
│   │   │   ├── calendar/     # /calendar
│   │   │   └── dashboard/    # /dashboard
│   │   ├── api/              # API routes
│   │   │   ├── categories/
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   ├── ideas/
│   │   │   ├── calendar/
│   │   │   └── sync/
│   │   ├── auth/             # Auth callback & signout
│   │   └── login/            # Login page
│   ├── components/
│   │   ├── sidebar/          # ModuleRail, ContextualPanel, UserProfile
│   │   ├── tasks/            # ListView, KanbanView, TaskItem
│   │   ├── ideas/            # IdeasPage
│   │   ├── calendar/         # CalendarPage
│   │   └── ui/               # Button, Modal, ConfirmDialog, Pagination
│   └── lib/
│       ├── hooks/            # useCategories, useProjects, useTasks, etc.
│       ├── validations/      # Zod schemas
│       ├── supabase/         # Supabase client helpers
│       ├── auth.ts           # Auth utilities
│       └── google-tokens.ts  # Google OAuth token management
├── supabase/
│   ├── migrations/           # SQL migrations
│   └── config.toml           # Local Supabase config
└── docs/
    ├── PRD.md                # Product requirements
    ├── PLANS.md              # Implementation plan (Phases 0-3)
    └── PLANS2.md             # Implementation plan (Phases 4-11)
```

## Modules

| Module | Route | Description |
|---|---|---|
| Tasks | `/tasks` | Category → Project → Task hierarchy, List & Kanban views |
| Ideas | `/ideas` | Flat idea list with realized/not realized toggle |
| Calendar | `/calendar` | Google Calendar integration (online-only) |
| Dashboard | `/dashboard` | Summary view (coming soon) |
