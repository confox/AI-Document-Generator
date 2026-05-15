# Product Requirement Document
> Tells the AI what to build

## Problem Statement
Small and mid-sized development teams struggle to track tasks, bugs, and project milestones without paying for expensive tools like Jira or Linear. Existing free tools are either too simple (Trello) or too complex. Teams end up managing work across a mix of Notion pages, spreadsheets, and Slack messages — leading to missed deadlines and lost context.

TaskFlow is a focused, fast, keyboard-first task manager built for software teams of 2–20 people. It removes the overhead of enterprise project management and gives teams a single place to plan sprints, track bugs, and ship features.

## Target Users
Primary: Software developers and indie hackers on small teams (2–10 people) who want speed over features.
Secondary: Freelancers managing client projects who need a lightweight way to share progress.
Anti-persona: Enterprise teams needing compliance, SSO, or advanced reporting — TaskFlow is not for them.

## Feature List — Basic (MVP)
- User registration and login (email + password)
- Create, edit, and delete projects
- Create tasks with title, description, status, and assignee
- Task statuses: Backlog, In Progress, In Review, Done
- Assign tasks to team members
- Project dashboard showing all tasks grouped by status (Kanban view)
- Invite team members to a project via email
- Real-time updates when a task is moved or edited

## Feature List — Advanced
- Sprint planning: group tasks into time-boxed sprints
- Burndown chart showing sprint progress
- GitHub integration: link commits and PRs to tasks
- Slack notifications on task status changes
- Time tracking per task
- Custom task labels and filters
- Public project board (read-only share link)
- Mobile app (React Native)

## User Flow
1. User lands on taskflow.app — sees headline and "Start for free" CTA
2. User registers with email and password → email verification sent
3. After verification, user is taken to the onboarding screen: "Create your first project"
4. User names the project, optionally invites teammates by email
5. User is taken to the project Kanban board (4 columns: Backlog, In Progress, In Review, Done)
6. User clicks "+ Add Task" → modal opens → fills in title, description, assignee, status
7. User drags tasks between columns or changes status via dropdown
8. Invited teammates receive email → click link → register/login → land on shared project

## Tech Preferences (Optional)
React + TypeScript frontend, Supabase (Postgres + Auth + Realtime), hosted on Vercel
