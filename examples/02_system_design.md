# System Design Document
> Tells the AI how to build it

## Frontend Architecture
Framework: React 18 + TypeScript + Vite
Folder structure:
  src/
    components/      — shared UI components (Button, Modal, Avatar, Badge)
    features/        — feature modules (tasks/, projects/, auth/, team/)
    hooks/           — custom React hooks (useProject, useTasks, useRealtime)
    lib/             — Supabase client, API helpers
    pages/           — route-level components
    store/           — Zustand global state (user, active project)

State management: Zustand for global state (user session, active project). React Query for server state and caching.
Routing: React Router v6 with protected routes.
Realtime: Supabase Realtime subscriptions on the tasks table to push live updates.

## Backend Architecture
Backend: Supabase (fully managed — no custom server needed for MVP)
  - PostgreSQL database with Row Level Security (RLS) policies
  - Supabase Auth for user registration, login, email verification
  - Supabase Realtime for live task updates via websocket channels
  - Supabase Edge Functions (Deno) for any server-side logic: email invites, GitHub webhook handler

Deployment: Frontend on Vercel. Supabase project on Supabase cloud (free tier → Pro as needed).
No custom Express/Node server in the MVP. All DB access goes through Supabase client with RLS enforced.

## API Structure & Flow
- GET /projects — fetch all projects for the current user
- POST /projects — create a new project
- GET /projects/:id — fetch a single project with its members
- DELETE /projects/:id — delete a project (owner only)
- GET /projects/:id/tasks — fetch all tasks for a project
- POST /projects/:id/tasks — create a task
- PATCH /tasks/:id — update task (status, assignee, title, description)
- DELETE /tasks/:id — delete a task
- POST /projects/:id/invites — send an email invite to a teammate
- POST /auth/signup — register
- POST /auth/login — login
- POST /auth/logout — logout

## Database Schema
projects: id (uuid, PK), name (text), owner_id (uuid, FK → users), created_at (timestamptz)

project_members: id (uuid, PK), project_id (uuid, FK), user_id (uuid, FK), role (text: owner|member), joined_at (timestamptz)

tasks: id (uuid, PK), project_id (uuid, FK), title (text, NOT NULL), description (text), status (text: backlog|in_progress|in_review|done), assignee_id (uuid, FK → users, nullable), created_by (uuid, FK), created_at (timestamptz), updated_at (timestamptz), sort_order (integer)

users: managed by Supabase Auth. Extended via profiles table.
profiles: id (uuid, PK = auth.users.id), display_name (text), avatar_url (text), created_at (timestamptz)

invites: id (uuid, PK), project_id (uuid, FK), email (text), token (uuid, unique), accepted (boolean), expires_at (timestamptz)

## Authentication & Security Flow
Auth: Supabase Auth (email + password). JWT issued by Supabase, stored in localStorage, sent as Bearer token on every request.
RLS Policies:
  - projects: users can only SELECT/UPDATE/DELETE projects they own or are a member of
  - tasks: users can only access tasks belonging to projects they are a member of
  - project_members: only project owners can INSERT/DELETE members
Password hashing: handled entirely by Supabase Auth (bcrypt).
Email verification: required before accessing the app. Supabase sends the verification email automatically.
