# Feature Breakdown Document
> Breaks big features into step-by-step tasks

## Feature List
- User Authentication (register, login, logout, email verification)
- Project Management (create, rename, delete projects)
- Task CRUD (create, read, update, delete tasks)
- Kanban Board View (drag-and-drop status columns)
- Team Invitations (invite via email, accept invite flow)
- Realtime Updates (live task changes across team members)
- User Profile (display name, avatar)

## Feature Breakdowns
**User Authentication:**
- Build register form (email, password, confirm password) with client-side validation
- Wire up Supabase Auth signUp() — handle email verification state
- Build login form with error handling (wrong password, unverified email)
- Create protected route wrapper that redirects unauthenticated users to /login
- Implement logout (clear Supabase session, redirect to landing)
- Show "Check your email" screen after registration

**Project Management:**
- Build "Create Project" modal with name input and submit
- Implement project list in sidebar — fetch user's projects on load
- Add project settings screen: rename project (PATCH), delete project with confirmation modal
- Show empty state when user has no projects ("Create your first project →")

**Task CRUD:**
- Build "Add Task" button at bottom of each Kanban column
- Create task modal with: title (required), description (markdown textarea), assignee picker (team members), status selector
- Implement task card component: title, assignee avatar, status colour dot
- Wire up edit: clicking a task opens the same modal pre-populated
- Implement delete task with confirmation (swipe action on mobile, right-click menu on desktop)

**Kanban Board:**
- Render 4 columns (Backlog, In Progress, In Review, Done) with tasks filtered by status
- Implement drag-and-drop using @dnd-kit/core — update task status on drop
- Persist new sort_order to Supabase after reorder
- Show task count badge per column header

**Team Invitations:**
- Build "Invite" button in top bar → opens modal with email input
- POST to Supabase Edge Function: generate unique token, send invite email via Resend
- Build /invite/:token page: if logged in → join project; if not → register first → then join
- Show team member list in Team settings with role badges and remove button (owner only)

**Realtime Updates:**
- Subscribe to Supabase Realtime channel on tasks table scoped to active project_id
- On INSERT: add new task card to correct column
- On UPDATE: update task card in place (status change moves it to correct column)
- On DELETE: remove task card with fade-out animation

## Priority Order
P1 (must have for launch):
- User Authentication
- Project Management
- Task CRUD
- Kanban Board View

P2 (ship within 2 weeks of launch):
- Team Invitations
- Realtime Updates

P3 (next milestone):
- User Profile (avatar upload, display name)
- Sprint planning
- GitHub integration

## Dependencies
- Task CRUD requires Project Management to exist (tasks belong to a project)
- Kanban Board View requires Task CRUD to be fully working
- Team Invitations requires User Authentication (need to know who is inviting)
- Realtime Updates requires Task CRUD and Supabase Realtime to be configured
- All P2 and P3 features require P1 features to be complete and stable
