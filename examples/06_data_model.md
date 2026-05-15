# Data Model Document
> Tells the AI how data is structured and related

## Core Entities
- User
- Profile
- Project
- ProjectMember
- Task
- Invite

## Relationships
User (auth.users) is managed by Supabase Auth. Each User has exactly one Profile (one-to-one).

A User can own many Projects (one-to-many). A User can also be a member of many Projects they don't own — through the ProjectMember join table (many-to-many between User and Project).

A Project has many Tasks (one-to-many). Each Task belongs to exactly one Project.

A Task has an optional assignee — a nullable foreign key to User (many-to-one: many tasks can be assigned to one user).

An Invite belongs to one Project and targets one email address. It has a unique token used to accept the invite. Once accepted, a ProjectMember row is created and the Invite is marked accepted.

## Schema / Field Definitions
profiles:
  id (uuid, PK, references auth.users.id)
  display_name (text, NOT NULL)
  avatar_url (text, nullable)
  created_at (timestamptz, default now())

projects:
  id (uuid, PK, default gen_random_uuid())
  name (text, NOT NULL)
  owner_id (uuid, NOT NULL, FK → auth.users.id)
  created_at (timestamptz, default now())

project_members:
  id (uuid, PK, default gen_random_uuid())
  project_id (uuid, NOT NULL, FK → projects.id, ON DELETE CASCADE)
  user_id (uuid, NOT NULL, FK → auth.users.id)
  role (text, NOT NULL, CHECK role IN ('owner', 'member'))
  joined_at (timestamptz, default now())
  UNIQUE(project_id, user_id)

tasks:
  id (uuid, PK, default gen_random_uuid())
  project_id (uuid, NOT NULL, FK → projects.id, ON DELETE CASCADE)
  title (text, NOT NULL)
  description (text, nullable)
  status (text, NOT NULL, default 'backlog', CHECK status IN ('backlog','in_progress','in_review','done'))
  assignee_id (uuid, nullable, FK → auth.users.id)
  created_by (uuid, NOT NULL, FK → auth.users.id)
  sort_order (integer, NOT NULL, default 0)
  created_at (timestamptz, default now())
  updated_at (timestamptz, default now())

invites:
  id (uuid, PK, default gen_random_uuid())
  project_id (uuid, NOT NULL, FK → projects.id, ON DELETE CASCADE)
  email (text, NOT NULL)
  token (uuid, NOT NULL, UNIQUE, default gen_random_uuid())
  accepted (boolean, NOT NULL, default false)
  created_by (uuid, NOT NULL, FK → auth.users.id)
  expires_at (timestamptz, NOT NULL)

## Indexes & Constraints
- tasks: index on (project_id, status) — most common query pattern
- tasks: index on (project_id, sort_order) — for ordered Kanban column rendering
- tasks: index on assignee_id — for "tasks assigned to me" view
- project_members: UNIQUE constraint on (project_id, user_id) — prevent duplicate membership
- invites: UNIQUE constraint on token — ensures invite links are unforgeable
- invites: index on email — for looking up pending invites when a new user registers

## Storage Engine
Supabase (managed PostgreSQL 15). Supabase Storage for avatar image uploads (bucket: avatars, public read, authenticated write).
