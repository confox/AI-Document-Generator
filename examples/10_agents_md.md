# AGENTS.md — AI Rules File
> Gives AI coding tools persistent rules for your project

## Project Summary
TaskFlow is a keyboard-first, dark-mode team task management web app built for small software teams (2–20 people). It allows users to create projects, manage tasks on a Kanban board, and collaborate with teammates in real time.

The frontend is React 18 + TypeScript + Vite, styled with CSS Modules (no CSS framework). All backend functionality — authentication, database, realtime subscriptions, and edge functions — is provided by Supabase. The app is deployed on Vercel. State management uses Zustand for global state and React Query for server/async state. Drag-and-drop is handled by @dnd-kit/core.

## Directory Structure
src/
  components/     — shared, reusable UI components (Button, Modal, Avatar, Badge, Toast)
  features/       — feature modules, each with its own components/, hooks/, types.ts
    auth/         — login, register, email verification flows
    tasks/        — TaskCard, TaskModal, task hooks
    projects/     — ProjectList, CreateProject, ProjectSettings
    team/         — InviteModal, MemberList
  hooks/          — app-wide custom hooks (useCurrentUser, useActiveProject)
  lib/            — Supabase client instance, React Query client setup
  pages/          — route-level components (Board.tsx, Landing.tsx, InvitePage.tsx)
  store/          — Zustand stores (userStore.ts, projectStore.ts)
  utils/          — pure utility functions (formatDate.ts, cn.ts, validateEmail.ts)
supabase/
  migrations/     — SQL migration files (timestamped)
  functions/      — Supabase Edge Functions (send-invite/, delete-account/)

## Coding Conventions
- Use functional React components and hooks only — no class components ever
- All components must use named exports. Only page-level route components may use default exports
- Use CSS Modules for all component styling. File named <ComponentName>.module.css alongside the component
- Never hardcode colour values — define them as CSS custom properties in src/styles/tokens.css
- Use TypeScript strict mode. No use of `any` type — use `unknown` and type narrowing instead
- Use Zustand for client-side global state only (user session, active project ID)
- Use React Query (useQuery / useMutation) for all Supabase data fetching and mutations
- All forms must validate on the client before making any API call
- Always implement loading, error, and empty states — never show a blank UI

## Key Commands
- pnpm dev — start local dev server on localhost:5173
- pnpm build — production build to dist/
- pnpm test — run Vitest unit + component tests
- pnpm test:ui — open Vitest browser UI
- pnpm e2e — run Playwright E2E tests
- pnpm tsc --noEmit — type-check without emitting files
- supabase db push — apply pending migrations to the linked Supabase project
- supabase functions deploy send-invite — deploy an Edge Function

## Do Not
- Do not add Tailwind CSS, Bootstrap, or any other CSS utility framework
- Do not use styled-components, Emotion, or any CSS-in-JS library
- Do not use react-beautiful-dnd — use @dnd-kit/core only
- Do not expose SUPABASE_SERVICE_ROLE_KEY or RESEND_API_KEY to the client — these are Edge Function only secrets
- Do not write raw SQL in application code — use the Supabase JS client only
- Do not bypass Row Level Security — never use the service role key on the client side
- Do not commit .env files — use .env.example with placeholder values
- Do not use default exports for shared components
