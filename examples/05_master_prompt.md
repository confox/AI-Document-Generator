# Master Prompt Document
> Combines everything into one authoritative prompt

## Project Overview
Build TaskFlow — a keyboard-first, dark-mode task management web app for small software teams (2–20 people). The app lets users create projects, add tasks, manage them on a Kanban board (Backlog / In Progress / In Review / Done), and invite teammates via email. The tech stack is React 18 + TypeScript + Vite on the frontend, with Supabase handling auth, database (PostgreSQL), and realtime. The app is deployed on Vercel. Design is inspired by Linear.app — minimal, high information density, dark theme, no unnecessary chrome.

## Strict Instructions
- Use React 18 + TypeScript. No class components — functional components and hooks only
- Use Supabase client for all data access. Never write raw SQL outside of Supabase migrations
- All database access must go through Row Level Security policies — never bypass RLS
- Never hardcode secrets or API keys. Use environment variables only
- Use Zustand for global state (user session, active project). Use React Query for server state
- Use @dnd-kit/core for drag-and-drop. Do not use react-beautiful-dnd (deprecated)
- Do not add any CSS framework (no Tailwind, no Bootstrap). Use CSS Modules for component styles
- Every component must have a named export. No default exports except for page-level components
- All forms must have client-side validation before any API call is made
- Always handle loading states and error states in the UI — never leave the user staring at a blank screen

## Tech Stack
- Frontend: React 18, TypeScript, Vite
- Styling: CSS Modules (no Tailwind, no styled-components)
- State: Zustand (global), React Query (server/async)
- Backend: Supabase (Auth + PostgreSQL + Realtime + Edge Functions)
- Drag and Drop: @dnd-kit/core
- Email: Resend (via Supabase Edge Function)
- Hosting: Vercel (frontend), Supabase Cloud (backend)
- Package manager: pnpm

## Code Style Guidelines
File naming: PascalCase for components (TaskCard.tsx), camelCase for hooks (useProject.ts) and utilities (formatDate.ts). Kebab-case for CSS Module files (task-card.module.css).
Folder structure: feature-based under src/features/ (e.g. src/features/tasks/, src/features/auth/). Shared components in src/components/. Each feature folder contains its own components/, hooks/, and types.ts.
Comments: JSDoc on all exported functions and hooks. Inline comments only for non-obvious logic. No commented-out dead code.

## Output Format
Output one file at a time. Start each file with a comment block showing the full file path relative to the project root (e.g. // src/features/tasks/components/TaskCard.tsx).
After creating a file, list what still needs to be created before asking to continue.
Never output placeholder comments like "// TODO: implement this" — always write working code.
When creating a Supabase migration, output the full SQL and name the file with a timestamp prefix (e.g. 20260515_create_tasks_table.sql).
