# Security & Compliance Checklist
> Ensures the AI builds safe, secure code by design

## Top Threat Risks
- Unauthorised access to another user's projects or tasks (IDOR — insecure direct object reference)
- Privilege escalation: a project member performing owner-only actions (delete project, remove members)
- Invite token forgery or reuse — allowing unauthorised users to join a project
- XSS via user-supplied content rendered in task descriptions (markdown)
- Leaked Supabase service role key in client-side code (exposes entire database)
- Expired or brute-forced invite tokens used to gain project access

## Authentication & Authorisation
Authentication: Supabase Auth (email + password). JWTs issued by Supabase, verified server-side. Email verification required before first login — unverified users see a "Check your email" screen and cannot access the app.

Authorisation: Row Level Security (RLS) is enabled on ALL tables. Policies enforce:
  - projects: SELECT/UPDATE/DELETE only for rows where the user is the owner OR a project_member
  - tasks: SELECT/INSERT/UPDATE/DELETE only for tasks in projects the user is a member of
  - project_members: only the project owner can INSERT or DELETE rows
  - invites: only project members can INSERT; anyone can SELECT by token (for accept flow)

The Supabase service role key is NEVER exposed to the client. It is only used in Edge Functions running server-side.

## Data Privacy Rules
Sensitive data: email addresses, display names, avatar images. No payment data stored (no billing in MVP).
Encryption: all data encrypted at rest by Supabase (AES-256). All data in transit over TLS 1.2+.
Email addresses are stored in auth.users (Supabase-managed). They are NOT duplicated in application tables — only user_id (UUID) is stored.
Logs: do not log task titles, descriptions, or email addresses in Edge Function logs. Log only IDs and event types.
GDPR: users can delete their account from profile settings. On deletion: auth.users row deleted (cascades to profiles, project_members, tasks via ON DELETE SET NULL for assignee_id, CASCADE for owned records).

## Input Validation Rules
- Task title: required, max 255 characters, strip leading/trailing whitespace
- Task description: max 10,000 characters, rendered as markdown — sanitise HTML using DOMPurify before rendering to prevent XSS
- Project name: required, max 100 characters, no HTML allowed
- Email (invite): validate format with regex before API call; normalise to lowercase
- Avatar upload: max 2MB, accept only image/jpeg and image/png MIME types, validate server-side in Edge Function

## Secrets Management
All secrets in environment variables only. Never committed to git. Use .env.example as a template with placeholder values. Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (client-safe), SUPABASE_SERVICE_ROLE_KEY (Edge Functions only, never exposed to client), RESEND_API_KEY (Edge Functions only).

## Compliance Requirements
- OWASP Top 10: address injection (parameterised queries via Supabase client), broken access control (RLS), cryptographic failures (TLS + Supabase-managed encryption), XSS (DOMPurify on markdown output)
- GDPR: right to deletion implemented, no third-party tracking or analytics in MVP
- No HIPAA or PCI-DSS requirements (no health data, no payment processing in MVP)
