# todo-web

Shared backend API + website for a personal to-do list app.

## Overview

This is the web frontend and API layer for a Personal To-Do List App — a single-user task management app combining a simple checklist style (for daily life) and a Trello/Jira-style kanban board (for work projects), organized in a three-level hierarchy: **Category → Project → Task**.

The API is shared between this website and a Flutter mobile app (`todo-mobile`).

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database | Supabase (Postgres + RLS) |
| Auth | Supabase Auth (Google OAuth) |
| Deployment | Vercel |

## Design Spec

See [docs/spec.md](docs/spec.md) for the full design specification.

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project (for production)

### Installation

```bash
npm install
```

### Environment Variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase anonymous key

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Linting & Formatting

```bash
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
npm run format:check  # Check formatting without writing
```

## Project Structure

```
todo-web/
├── src/
│   ├── app/          # Next.js App Router pages & API routes
│   └── ...
├── docs/
│   └── spec.md       # Design specification
├── eslint.config.mjs
├── .prettierrc
└── package.json
```

## Deployment

This project is designed to be deployed on Vercel:

1. Connect your repository to Vercel
2. Set the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel dashboard
3. Deploy — Vercel will automatically detect Next.js and build correctly
